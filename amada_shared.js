/* ============================================================
   AMADA — Shared JavaScript
   Asene Manso Akroso District Assembly
   ============================================================ */

/* ── Navigation ── */
var PAGES = {
    'home':         'index.html',
    'leadership':   'leadership.html',
    'departments':  'departments.html',
    'publications': 'publications.html',
    'services':     'services.html',
    'about':        'about.html',
    'contact':      'contact.html'
};

function goTo(page) {
    if (PAGES[page]) window.location.href = PAGES[page];
}

/* ── Mark active nav link based on filename ── */
function markActiveNav() {
    var path = window.location.pathname;
    var file = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
    document.querySelectorAll('.nav-menu a').forEach(function(a) {
        a.classList.remove('active');
        var href = a.getAttribute('href');
        if (href && (href === file || (file === 'index.html' && href === 'index.html') || href === './' + file)) {
            a.classList.add('active');
        }
    });
}

/* ── Mobile nav toggle ── */
function initMobileNav() {
    var toggle = document.getElementById('menuToggle');
    var menu   = document.getElementById('navMenu');
    if (!toggle || !menu) return;
    toggle.addEventListener('click', function () {
        menu.classList.toggle('open');
        toggle.innerHTML = menu.classList.contains('open')
            ? '<i class="fas fa-times"></i>'
            : '<i class="fas fa-bars"></i>';
    });
}

/* ── Live Clock ── */
function startClock() {
    var DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    function tick() {
        var now = new Date();
        var hrs = now.getHours(), mins = String(now.getMinutes()).padStart(2,'0');
        var secs = String(now.getSeconds()).padStart(2,'0');
        var ampm = hrs >= 12 ? 'PM' : 'AM';
        hrs = hrs % 12 || 12;
        var str = DAYS[now.getDay()] + ', ' + now.getDate() + ' ' + MONTHS[now.getMonth()] + ' ' + now.getFullYear()
                  + ' &mdash; ' + hrs + ':' + mins + ':' + secs + ' ' + ampm;
        ['liveClock','footerClock'].forEach(function(id) {
            var el = document.getElementById(id);
            if (el) el.innerHTML = '<i class="fas fa-clock"></i> ' + str;
        });
        var cy = document.getElementById('currentYear');
        if (cy) cy.textContent = now.getFullYear();
    }
    tick();
    setInterval(tick, 1000);
}

/* ── Toast ── */
function showToast(html, duration) {
    var t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = html;
    document.body.appendChild(t);
    setTimeout(function() { if (t.parentNode) t.parentNode.removeChild(t); }, duration || 6000);
}

/* ── Modal helpers ── */
function openModal(id) {
    var el = document.getElementById(id);
    if (el) { el.classList.add('open'); document.body.style.overflow = 'hidden'; }
}
function closeModal(id) {
    var el = document.getElementById(id);
    if (el) { el.classList.remove('open'); document.body.style.overflow = ''; }
}
function initModalOverlayClose() {
    document.querySelectorAll('.modal-overlay, .dept-modal-overlay, .zoom-overlay').forEach(function(ov) {
        ov.addEventListener('click', function(e) {
            if (e.target === ov) { ov.classList.remove('open'); document.body.style.overflow = ''; }
        });
    });
}
function initEscClose() {
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.open, .dept-modal-overlay.open, .zoom-overlay.open').forEach(function(el) {
                el.classList.remove('open');
            });
            var lb = document.getElementById('imgLightbox');
            if (lb) lbClose();
            document.body.style.overflow = '';
        }
    });
}

/* ── Dept modal ── */
function openDeptModal(id) { openModal(id); }
function closeDeptModal(id) { closeModal(id); }

/* ── Organogram zoom ── */
function openZoom() { openModal('zoomModal'); }
function closeZoom() { closeModal('zoomModal'); }

/* ── Lightbox ── */
var _lb = { imgs: [], idx: 0, title: '' };

function renderLightbox() {
    var existing = document.getElementById('imgLightbox');
    if (existing) existing.remove();
    var total = _lb.imgs.length, src = _lb.imgs[_lb.idx];
    var dots = total > 1 ? _lb.imgs.map(function(_,i) {
        return '<span onclick="lbGo(' + i + ')" style="width:10px;height:10px;border-radius:50%;cursor:pointer;display:inline-block;background:' + (i===_lb.idx?'#C9A227':'rgba(255,255,255,0.4)') + ';transition:background 0.2s;"></span>';
    }).join('') : '';
    var lb = document.createElement('div');
    lb.id = 'imgLightbox';
    lb.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.95);z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px;animation:fadeIn 0.2s ease;';
    lb.innerHTML =
        '<button onclick="lbClose()" style="position:absolute;top:16px;right:20px;background:rgba(255,255,255,0.15);border:none;color:#fff;font-size:1.8rem;width:46px;height:46px;border-radius:50%;cursor:pointer;">&times;</button>'
      + (total>1 ? '<div style="position:absolute;top:20px;left:24px;color:rgba(255,255,255,0.6);font-size:0.85rem;">'+(_lb.idx+1)+' / '+total+'</div>' : '')
      + '<div style="position:relative;width:96vw;max-width:1000px;display:flex;align-items:center;justify-content:center;">'
      + (total>1 ? '<button onclick="lbMove(-1)" style="position:absolute;left:-8px;z-index:3;background:rgba(255,255,255,0.15);border:none;color:#fff;font-size:2rem;width:50px;height:50px;border-radius:50%;cursor:pointer;">&#8249;</button>' : '')
      + '<img id="lbImg" src="'+src+'" alt="'+_lb.title+'" style="max-width:88vw;max-height:80vh;object-fit:contain;border-radius:8px;box-shadow:0 16px 60px rgba(0,0,0,0.8);transition:opacity 0.2s;">'
      + (total>1 ? '<button onclick="lbMove(1)" style="position:absolute;right:-8px;z-index:3;background:rgba(255,255,255,0.15);border:none;color:#fff;font-size:2rem;width:50px;height:50px;border-radius:50%;cursor:pointer;">&#8250;</button>' : '')
      + '</div>'
      + '<div style="margin-top:16px;text-align:center;"><p style="color:rgba(255,255,255,0.9);font-size:0.95rem;font-weight:600;margin-bottom:10px;">'+_lb.title+'</p>'
      + (total>1 ? '<div style="display:flex;gap:8px;justify-content:center;">'+dots+'</div>' : '')
      + '<p style="color:rgba(255,255,255,0.3);font-size:0.72rem;margin-top:8px;">← → to navigate &nbsp;|&nbsp; ESC or × to close</p></div>';
    lb.addEventListener('click', function(e) { if (e.target === lb) lbClose(); });
    document.body.appendChild(lb);
    document.body.style.overflow = 'hidden';
    document.onkeydown = function(e) {
        if (!document.getElementById('imgLightbox')) return;
        if (e.key === 'ArrowRight') lbMove(1);
        else if (e.key === 'ArrowLeft') lbMove(-1);
        else if (e.key === 'Escape') lbClose();
    };
}
function lbOpen(imgs, idx, title) { _lb.imgs = imgs; _lb.idx = idx||0; _lb.title = title||''; renderLightbox(); }
function lbMove(dir) {
    _lb.idx = (_lb.idx + dir + _lb.imgs.length) % _lb.imgs.length;
    var img = document.getElementById('lbImg');
    if (img) { img.style.opacity='0'; setTimeout(function(){ img.src=_lb.imgs[_lb.idx]; img.style.opacity='1'; },150); }
    renderLightbox();
}
function lbGo(i) { _lb.idx=i; renderLightbox(); }
function lbClose() { var lb=document.getElementById('imgLightbox'); if(lb) lb.remove(); document.body.style.overflow=''; document.onkeydown=null; }

/* ── News gallery builder ── */
function buildGallery(imgs, uid) {
    if (!imgs || !imgs.length) return '<div style="width:100%;height:160px;background:linear-gradient(135deg,#1F6B3A,#0f2e1a);border-radius:12px;margin-bottom:20px;display:flex;align-items:center;justify-content:center;"><i class="fas fa-newspaper" style="font-size:3rem;color:rgba(255,255,255,0.2);"></i></div>';
    var items = imgs.slice(0,6);
    window['_g_'+uid] = items;
    function thumb(src, idx, style) {
        return '<div style="'+style+'overflow:hidden;cursor:zoom-in;" onclick="lbOpen(window[\'_g_'+uid+'\'],'+idx+',\'\')"><img src="'+src+'" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.style.background=\'#1F6B3A\'"></div>';
    }
    if (items.length===1) return '<div style="width:100%;height:260px;border-radius:12px;margin-bottom:20px;">'+thumb(items[0],0,'width:100%;height:100%;border-radius:12px;')+'</div>';
    if (items.length===2) return '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;height:240px;border-radius:12px;overflow:hidden;margin-bottom:20px;">'+thumb(items[0],0,'height:100%;')+thumb(items[1],1,'height:100%;')+'</div>';
    var right = items.slice(1,3).map(function(src,i){
        var overlay = (items.length>3&&i===1) ? '<div style="position:absolute;inset:0;background:rgba(0,0,0,0.55);display:flex;align-items:center;justify-content:center;color:#fff;font-size:1.2rem;font-weight:800;">+'+(items.length-3)+'</div>' : '';
        return '<div style="flex:1;min-height:0;overflow:hidden;cursor:zoom-in;position:relative;" onclick="lbOpen(window[\'_g_'+uid+'\'],'+(i+1)+',\'\')"><img src="'+src+'" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.style.background=\'#1F6B3A\'">'+overlay+'</div>';
    }).join('');
    return '<div style="display:grid;grid-template-columns:1.6fr 1fr;gap:6px;height:260px;border-radius:12px;overflow:hidden;margin-bottom:20px;">'+thumb(items[0],0,'height:100%;')+'<div style="display:flex;flex-direction:column;gap:6px;">'+right+'</div></div>';
}

/* ── Publications filter ── */
function filterPublications(cat, btn) {
    document.querySelectorAll('.publications-grid .publication-card, .publications-grid .development-project-card').forEach(function(card) {
        card.style.display = (cat==='all' || card.dataset.category===cat) ? '' : 'none';
    });
    if (btn) {
        document.querySelectorAll('.publications-filter .filter-btn').forEach(function(b){ b.classList.remove('active'); });
        btn.classList.add('active');
    }
}

/* ── Forms filter ── */
function filterForms(cat, btn) {
    document.querySelectorAll('#formsGrid .form-card').forEach(function(card) {
        card.style.display = (cat==='all' || card.dataset.formCat===cat) ? '' : 'none';
    });
    if (btn) {
        document.querySelectorAll('.publications-filter .filter-btn').forEach(function(b){ b.classList.remove('active'); });
        btn.classList.add('active');
    }
}

/* ── Contact form ── */
function handleContactForm(e) {
    e.preventDefault();
    var name = document.getElementById('contactName').value;
    if (!name) return;
    showToast('<i class="fas fa-check-circle"></i> <strong>Message Sent!</strong><br><span style="opacity:0.85;font-size:0.85rem;">Thank you, '+name+'. We will respond shortly.</span>');
    e.target.reset();
}

/* ── Newsletter ── */
function handleNewsletter(e) {
    e.preventDefault();
    var inp = e.target.querySelector('input[type="email"]');
    if (inp && inp.value) {
        showToast('<i class="fas fa-check-circle"></i> <strong>Subscribed!</strong><br><span style="font-size:0.85rem;">You\'ll receive official updates from AMADA.</span>');
        inp.value = '';
    }
}

/* ── Online application ── */
var SERVICE_REQS = {
    'Marriage Registration': ['Full name of Husband and Wife','Contact numbers for both parties','Ghana Card of both parties','Type of marriage (Customary / Ordinance / Islamic)','Date and place of marriage','Name of officiating authority','Statutory Declaration or Affidavit'],
    'Birth Registration': ['Names of parents','Date and place of birth','Ghana Card of parent/guardian','Hospital discharge summary (if applicable)'],
    'Death Registration': ['Full name of deceased','Date and place of death','Ghana Card of informant','Medical cause of death certificate'],
    'Business Operating Permit': ['Business name and location','Type of business activity','Owner Ghana Card','Tax Identification Number (TIN)'],
    'Building Permit': ['Architectural drawings / site plan','Land ownership documents','Structural engineer report','Payment of relevant fees'],
    'Development Permit': ['Site plan and location map','Nature of development','Land ownership documents'],
    'Signage Permit': ['Signage dimensions and location','Business registration documents','Landlord consent (where applicable)'],
    'Temporary Structure Permit': ['Purpose of temporary structure','Duration of use','Site location'],
    'General Enquiry': ['Your full name and contact','Description of your enquiry']
};

function showServiceRequirements() {
    var service = document.getElementById('serviceType').value;
    var box = document.getElementById('serviceRequirements');
    if (!box) return;
    if (!service) { box.style.display='none'; box.innerHTML=''; return; }
    var reqs = SERVICE_REQS[service] || [];
    box.style.display = 'block';
    box.innerHTML = '<div class="req-box"><h4><i class="fas fa-clipboard-list" style="margin-right:8px;color:var(--primary);"></i>Requirements for '+service+'</h4><ul class="req-list">'
        + reqs.map(function(r){ return '<li><i class="fas fa-check-circle"></i>'+r+'</li>'; }).join('')
        + '</ul></div>'
        + '<div class="form-group" style="margin-top:16px;"><label>Your Full Name *</label><input type="text" class="form-control" name="applicant_name" required placeholder="Enter your full name"></div>'
        + '<div class="form-group"><label>Phone Number *</label><input type="tel" class="form-control" name="applicant_phone" required placeholder="+233 XXX XXX XXX"></div>'
        + '<div class="form-group"><label>Email Address</label><input type="email" class="form-control" name="applicant_email" placeholder="your@email.com"></div>'
        + '<div class="form-group"><label>Additional Details</label><textarea class="form-control" name="applicant_details" rows="3" placeholder="Any additional information..."></textarea></div>'
        + '<div class="form-group" style="display:flex;align-items:center;gap:10px;"><input type="checkbox" id="termsCheck" required><label for="termsCheck" style="margin:0;font-weight:400;cursor:pointer;">I declare that the information provided is true and accurate.</label></div>';
}

function submitOnlineApplication(e) {
    e.preventDefault();
    var service = document.getElementById('serviceType').value;
    if (!service) { alert('Please select a service first.'); return; }
    var tracking = 'AMADA-' + new Date().getFullYear() + '-' + Math.random().toString(36).substr(2,6).toUpperCase();
    showToast('<i class="fas fa-check-circle"></i> <strong>Application Submitted!</strong><br><span style="font-size:0.85rem;">Service: <strong>'+service+'</strong><br>Tracking No: <strong>'+tracking+'</strong><br>Keep this for reference.</span>', 10000);
    closeModal('appModal');
    e.target.reset();
    var box = document.getElementById('serviceRequirements');
    if (box) { box.style.display='none'; box.innerHTML=''; }
}

/* ── Project detail slider ── */
var _slides = {};
function initProjectSlider(pid, imgs) {
    _slides[pid] = { imgs: imgs, idx: 0 };
}
function slideMove(pid, dir) {
    if (!_slides[pid]) return;
    var s = _slides[pid];
    s.idx = (s.idx + dir + s.imgs.length) % s.imgs.length;
    var track = document.getElementById('track-'+pid);
    if (track) track.style.transform = 'translateX(-'+(s.idx*100)+'%)';
    document.querySelectorAll('.dot-'+pid).forEach(function(d,i){ d.classList.toggle('active', i===s.idx); });
}
function slideTo(pid, idx) {
    if (!_slides[pid]) return;
    _slides[pid].idx = idx;
    slideMove(pid, 0);
}

/* ── Init all ── */
document.addEventListener('DOMContentLoaded', function() {
    markActiveNav();
    initMobileNav();
    startClock();
    initModalOverlayClose();
    initEscClose();
});
