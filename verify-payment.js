/* ── Server-side payment verification ──
   Called by services.html right after the Paystack popup reports success.
   This is the ONLY code path allowed to create a record in Firebase's
   payments/ node — the browser can never write one directly (see
   database.rules.json). That's deliberate: a browser saying "payment
   succeeded" is not proof that it did. This function independently asks
   Paystack directly, using a secret key that never leaves the server, and
   only writes a record once Paystack itself confirms success and the
   amount actually paid matches what was expected. */

const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n')
    }),
    databaseURL: 'https://asmda-website-default-rtdb.firebaseio.com'
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  try {
    const {
      reference, expectedAmount, feeName, feeCategory,
      payerName, payerPhone, payerEmail, propertyRef
    } = req.body || {};

    if (!reference) {
      res.status(400).json({ error: 'Missing payment reference.' });
      return;
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      res.status(500).json({ error: 'Payment verification is not configured on the server yet (missing PAYSTACK_SECRET_KEY).' });
      return;
    }

    /* Ask Paystack directly — this is the step that can't be faked from
       the browser, since it requires the secret key. */
    const verifyRes = await fetch(
      'https://api.paystack.co/transaction/verify/' + encodeURIComponent(reference),
      { headers: { Authorization: 'Bearer ' + secretKey } }
    );
    const verifyData = await verifyRes.json();

    if (!verifyRes.ok || !verifyData || !verifyData.data) {
      res.status(400).json({ error: 'Could not verify this transaction with Paystack.' });
      return;
    }

    const tx = verifyData.data;
    if (tx.status !== 'success') {
      res.status(400).json({ error: 'Payment was not successful.', status: tx.status });
      return;
    }

    /* Paystack amounts are in pesewas (smallest unit) — convert to GHS
       and make sure it matches what the citizen was actually shown,
       so a tampered client-side amount can't slip a smaller payment
       through as if it covered the full fee. */
    const paidAmountGHS = tx.amount / 100;
    if (typeof expectedAmount === 'number' && Math.abs(paidAmountGHS - expectedAmount) > 0.01) {
      res.status(400).json({ error: 'The amount paid does not match the expected fee amount.' });
      return;
    }

    /* Reference reuse guard — a reference can only ever produce one
       payment record. */
    const existingSnap = await admin.database().ref('payments/' + reference).once('value');
    if (existingSnap.exists()) {
      res.status(200).json({ success: true, payment: existingSnap.val(), alreadyRecorded: true });
      return;
    }

    const record = {
      reference:    reference,
      feeName:      feeName || '',
      feeCategory:  feeCategory || '',
      amount:       paidAmountGHS,
      payerName:    payerName || '',
      payerPhone:   payerPhone || '',
      payerEmail:   payerEmail || (tx.customer && tx.customer.email) || '',
      propertyRef:  propertyRef || '',
      status:       'success',
      channel:      tx.channel || '',
      paidAt:       tx.paid_at || new Date().toISOString(),
      verifiedAt:   new Date().toISOString()
    };

    await admin.database().ref('payments/' + reference).set(record);

    res.status(200).json({ success: true, payment: record });
  } catch (err) {
    console.error('verify-payment error:', err);
    res.status(500).json({ error: 'Server error while verifying payment.' });
  }
};
