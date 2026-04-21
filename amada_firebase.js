/* ═══════════════════════════════════════════════════════════
   AMADA Firebase Config — shared by all pages
   Project: asmda-website
═══════════════════════════════════════════════════════════ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import { getDatabase, ref, set, get, onValue } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyCNt_ha80WaLVujbc2ryDSFMAOBdzLVXtA",
    authDomain: "asmda-website.firebaseapp.com",
    databaseURL: "https://asmda-website-default-rtdb.firebaseio.com",
    projectId: "asmda-website",
    storageBucket: "asmda-website.firebasestorage.app",
    messagingSenderId: "699818483381",
    appId: "1:699818483381:web:09c926a48830d46ae228fc",
    measurementId: "G-8KZ10RWYBZ"
};

const app      = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database, ref, set, get, onValue };
