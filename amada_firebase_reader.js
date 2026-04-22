/* ═══════════════════════════════════════════════════════════
   AMADA Firebase Reader  —  used by ALL public pages
   Reads from:  asmda-website  (Realtime Database)
   Path layout: sections/{home|about|contact|leadership}
                projects  (array)
                news  (array inside sections/home)
═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var FIREBASE_CDN = 'https://www.gstatic.com/firebasejs/10.12.1/';
  var DB_URL       = 'https://asmda-website-default-rtdb.firebaseio.com';
  var CONFIG = {
    apiKey:            'AIzaSyCNt_ha80WaLVujbc2ryDSFMAOBdzLVXtA',
    authDomain:        'asmda-website.firebaseapp.com',
    databaseURL:       DB_URL,
    projectId:         'asmda-website',
    storageBucket:     'asmda-website.firebasestorage.app',
    messagingSenderId: '699818483381',
    appId:             '1:699818483381:web:09c926a48830d46ae228fc'
  };

  /* ── helpers ── */
  function setText(id, val) {
    var el = document.getElementById(id);
    if (el && val !== undefined && val !== null && val !== '') el.textContent = val;
  }
  function setHTML(id, val) {
    var el = document.getElementById(id);
    if (el && val !== undefined && val !== null && val !== '') el.innerHTML = val;
  }
  function setAttr(id, attr, val) {
    var el = document.getElementById(id);
    if (el && val) el.setAttribute(attr, val);
  }

  /* ── load Firebase SDK then run callback ── */
  function loadSDK(cb) {
    // If already loaded by another script on the page, reuse
    if (window._fbDb) { cb(window._fbDb, window._fbRef, window._fbGet); return; }

    var s1 = document.createElement('script'); s1.type = 'module';
    s1.textContent = [
      'import { initializeApp }  from "' + FIREBASE_CDN + 'firebase-app.js";',
      'import { getDatabase, ref, get } from "' + FIREBASE_CDN + 'firebase-database.js";',
      'var app = initializeApp(' + JSON.stringify(CONFIG) + ', "amada-reader");',
      'window._fbDb  = getDatabase(app);',
      'window._fbRef = ref;',
      'window._fbGet = get;',
      'window._fbReaderReady = true;',
      'document.dispatchEvent(new CustomEvent("amada:fb:ready"));'
    ].join('\n');
    document.head.appendChild(s1);

    document.addEventListener('amada:fb:ready', function onReady() {
      document.removeEventListener('amada:fb:ready', onReady);
      cb(window._fbDb, window._fbRef, window._fbGet);
    });
  }

  /* ══════════════════════════════════════════════════════
     PAGE-SPECIFIC LOADERS
     Each page calls   window.amadaLoadPage('<page>')
     after DOM is ready.
  ══════════════════════════════════════════════════════ */

  /* ── HOME ── */
  function loadHome(db, ref, get) {
    get(ref(db, 'sections/home')).then(function (snap) {
      if (!snap.exists()) return;
      var d = snap.val();

      // Hero
      setText('fb-hero-heading',  d.hero_heading);
      setText('fb-hero-subtitle', d.hero_subtitle);
      if (d.hero_btn1) { var b1 = document.getElementById('fb-hero-btn1'); if (b1) b1.textContent = d.hero_btn1; }
      if (d.hero_btn2) { var b2 = document.getElementById('fb-hero-btn2'); if (b2) b2.textContent = d.hero_btn2; }

      // Stats bar
      setText('fb-stat-pop',   d.stat_pop);
      setText('fb-stat-area',  d.stat_area);
      setText('fb-stat-comm',  d.stat_comm);
      setText('fb-stat-year',  d.stat_year);

      // News cards  (d.home_news is an array)
      var news = d.home_news;
      if (Array.isArray(news) && news.length) {
        renderHomeNews(news);
      }

      // Announcements (d.home_anncs)
      var anncs = d.home_anncs;
      if (Array.isArray(anncs) && anncs.length) {
        renderHomeAnnouncements(anncs);
      }
    }).catch(function (e) {
      console.warn('AMADA reader: home load failed', e.message);
    });
  }

  function renderHomeNews(news) {
    var wrap = document.getElementById('fb-news-cards');
    if (!wrap) return;
    // Rebuild the global NEWS object so modal still works
    var NEWS_NEW = {};
    var html = '';
    news.forEach(function (n, i) {
      var id = i + 1;
      NEWS_NEW[id] = n;
      var imgs = (n.media && n.media.length) ? n.media.map(function(m){return m.src;}) : (n.images || []);
      var thumb = (imgs.length > 0) ? imgs[0] : 'img1.jpg';
      var isDataUrl = thumb.startsWith('data:');
      html += '<div class="news-card" onclick="openNewsModal(' + id + ')" style="cursor:pointer;">'
            + '<div class="news-card-img" style="background-image:url(\'' + thumb + '\');background-size:cover;background-position:center;height:180px;"></div>'
            + '<div class="news-card-body">'
            + '<span class="news-cat">' + (n.category || '') + '</span>'
            + '<h3 class="news-title">' + (n.title || '') + '</h3>'
            + '<p class="news-date"><i class="far fa-calendar"></i> ' + (n.dateDisplay || n.date || '') + '</p>'
            + '</div></div>';
    });
    wrap.innerHTML = html;
    // Patch global NEWS
    if (typeof NEWS !== 'undefined') { Object.assign(NEWS, NEWS_NEW); }
    else { window.NEWS = NEWS_NEW; }
    // Re-patch openNewsModal to handle media
    window._openNewsModal_orig = window.openNewsModal;
    window.openNewsModal = function(id) {
      var n = NEWS[id]; if (!n) return;
      var imgs = (n.media && n.media.length) ? n.media.map(function(m){return m.src;}) : (n.images || []);
      document.getElementById('newsModalTitle').textContent = n.title;
      var gallery = typeof buildGallery === 'function' ? buildGallery(imgs, 'news'+id) : '';
      document.getElementById('newsModalBody').innerHTML =
          '<span style="background:rgba(31,107,58,0.1);color:var(--primary);font-size:0.72rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:4px 12px;border-radius:4px;">' + (n.category||'') + '</span>'
        + '<h2 style="font-family:\'Lora\',Georgia,serif;font-size:1.3rem;color:var(--primary-dark);margin:12px 0;line-height:1.3;">' + (n.title||'') + '</h2>'
        + '<p style="font-size:0.82rem;color:#7a8e7a;margin-bottom:18px;"><i class="far fa-calendar" style="color:var(--primary);margin-right:6px;"></i>' + (n.dateDisplay||n.date||'') + '</p>'
        + gallery
        + '<div style="line-height:1.8;color:#3d4e3d;font-size:0.91rem;">' + (n.content||'') + '</div>';
      openModal('newsModal');
    };
  }

  function renderHomeAnnouncements(anncs) {
    var wrap = document.getElementById('fb-anncs-list');
    if (!wrap) return;
    var html = '';
    anncs.forEach(function (a) {
      html += '<div class="announcement-item">'
            + '<div class="annc-date">' + (a.dateDisplay || a.date || '') + '</div>'
            + '<div class="annc-title">' + (a.title || '') + '</div>'
            + (a.desc ? '<div class="annc-desc">' + a.desc + '</div>' : '')
            + '</div>';
    });
    wrap.innerHTML = html;
  }

  /* ── ABOUT ── */
  function loadAbout(db, ref, get) {
    get(ref(db, 'sections/about')).then(function (snap) {
      if (!snap.exists()) return;
      var d = snap.val();

      setText('fb-about-establishment', d.about_establishment);
      setText('fb-about-mission',       d.about_mission);
      setText('fb-about-vision',        d.about_vision);
      setText('fb-about-goal',          d.about_goal);
      setText('fb-about-values',        d.about_values);
      setText('fb-about-geo',           d.about_geo);
      setText('fb-about-size',          d.about_size);
      setText('fb-about-pop',           d.about_pop);
      setText('fb-about-map-caption',   d.about_map_caption);

      // Map image (if admin uploaded a replacement)
      if (d.about_map_image) {
        var mapImg = document.getElementById('mapImg');
        if (mapImg) {
          mapImg.src = d.about_map_image;
          var fallback = document.getElementById('mapFallback');
          if (fallback) fallback.style.display = 'none';
        }
      }

      // Stats
      setText('fb-about-stat-pop',  d.about_stat_pop);
      setText('fb-about-stat-area', d.about_stat_area);
      setText('fb-about-stat-comm', d.about_stat_comm);
      setText('fb-about-stat-year', d.about_stat_year);
    }).catch(function (e) {
      console.warn('AMADA reader: about load failed', e.message);
    });
  }

  /* ── LEADERSHIP ── */
  function loadLeadership(db, ref, get) {
    get(ref(db, 'sections/leadership')).then(function (snap) {
      if (!snap.exists()) return;
      var d = snap.val();

      // Text fields
      ['dce','dcd','pm'].forEach(function(role) {
        setText('fb-'+role+'-name',   d[role+'_name']);
        setText('fb-'+role+'-role',   d[role+'_role']);
        setText('fb-'+role+'-bio',    d[role+'_bio']);
        setText('fb-'+role+'-phone',  d[role+'_phone']);
        setText('fb-'+role+'-email',  d[role+'_email']);
        setText('fb-'+role+'-office', d[role+'_office']);
        if (d[role+'_email']) setAttr('fb-'+role+'-email-link', 'href', 'mailto:'+d[role+'_email']);
        if (d[role+'_phone']) setAttr('fb-'+role+'-phone-link', 'href', 'tel:'+d[role+'_phone']);

        // Photos — admin saves as  photo_dce / photo_dcd / photo_pm
        var photoSrc = d['photo_' + role] || d[role + '_photo_url'];
        if (photoSrc) {
          var img = document.getElementById('fb-' + role + '-photo');
          var placeholder = document.getElementById(role + '-photo-placeholder');
          if (img) {
            img.src = photoSrc;
            img.style.display = 'block';
          }
          if (placeholder) placeholder.style.display = 'none';
        }
      });
    }).catch(function (e) {
      console.warn('AMADA reader: leadership load failed', e.message);
    });
  }

  /* ── CONTACT ── */
  function loadContact(db, ref, get) {
    get(ref(db, 'sections/contact')).then(function (snap) {
      if (!snap.exists()) return;
      var d = snap.val();

      setText('fb-contact-address', d.contact_address);
      setText('fb-contact-gps',     d.contact_gps);
      setText('fb-contact-phone',   d.contact_phone);
      setText('fb-contact-email',   d.contact_email);
      setText('fb-hours-weekday',   d.hours_weekday);
      setText('fb-hours-sat',       d.hours_sat);
      setText('fb-hours-sun',       d.hours_sun);
      setText('fb-hours-ph',        d.hours_ph);

      if (d.contact_phone) {
        setAttr('fb-contact-phone-link', 'href', 'tel:'+d.contact_phone);
        setText('fb-contact-phone-link', d.contact_phone);
      }
      if (d.contact_email) {
        setAttr('fb-contact-email-link', 'href', 'mailto:'+d.contact_email);
        setText('fb-contact-email-link', d.contact_email);
      }
      if (d.contact_wa) {
        setAttr('fb-contact-wa-link', 'href', d.contact_wa);
      }
      if (d.social_fb) setAttr('fb-social-fb', 'href', d.social_fb);
      if (d.social_tw) setAttr('fb-social-tw', 'href', d.social_tw);
      if (d.social_ig) setAttr('fb-social-ig', 'href', d.social_ig);
      if (d.contact_map_url) {
        setAttr('fb-map-iframe', 'src', d.contact_map_url);
      }
    }).catch(function (e) {
      console.warn('AMADA reader: contact load failed', e.message);
    });
  }

  /* ── PUBLIC API ── */
  window.amadaLoadPage = function (page) {
    loadSDK(function (db, ref, get) {
      if (page === 'home')       loadHome(db, ref, get);
      else if (page === 'about') loadAbout(db, ref, get);
      else if (page === 'leadership') loadLeadership(db, ref, get);
      else if (page === 'contact')    loadContact(db, ref, get);
      else if (page === 'projects')   loadProjects(db, ref, get);
      else if (page === 'departments') loadDepartments(db, ref, get);
    });
  };

})();
