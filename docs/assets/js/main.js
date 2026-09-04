  const cursor = document.getElementById('cursor');
  document.addEventListener('mousemove', e => {
    cursor.style.transform = `translate(${e.clientX - 9}px, ${e.clientY - 9}px)`;
  });
  document.querySelectorAll('a, button, input, select, textarea').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
  });

  const nav = document.getElementById('nav');
  let scrollTicking = false;
  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      requestAnimationFrame(() => {
        nav.classList.toggle('scrolled', window.scrollY > 60);
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  });

  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
  });
  function closeNav() {
    hamburger.classList.remove('active');
    navLinks.classList.remove('open');
  }
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));

  const observer = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 80);
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  /* ─── FIREBASE ─── */
  import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js';
  import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js';
  import { initializeAppCheck, ReCaptchaV3Provider } from 'https://www.gstatic.com/firebasejs/12.12.1/firebase-app-check.js';

  const firebaseConfig = {
    apiKey: "AIzaSyBjWngd-IsV2j0zTMUtbl51p3QrCq3t17s",
    authDomain: "stone-studios-ae674.firebaseapp.com",
    projectId: "stone-studios-ae674",
    storageBucket: "stone-studios-ae674.firebasestorage.app",
    messagingSenderId: "344944705980",
    appId: "1:344944705980:web:d4bd35a87191d1ee1cabb9",
    measurementId: "G-SJ2K05N1H9"
  };
  const fbApp = initializeApp(firebaseConfig);
  const db = getFirestore(fbApp);
  initializeAppCheck(fbApp, {
    provider: new ReCaptchaV3Provider('6LcS_yEtAAAAAAYuXubpbOnl2loyTLFmBEkS2xVE'),
    isTokenAutoRefreshEnabled: true
  });
  const newsCol = collection(db, 'news');

  /* ─── HERO SLIDER ─── */
  const heroSlidesCol = collection(db, 'heroSlides');
  let heroSlides = [];
  let heroCurrentIdx = 0;
  let heroAutoPlay;

  async function loadHeroSlides() {
    const TEST_SLIDES = [{ url: '/3ss-logo.jpg' }, { url: '/kafu-ibunroku-logo.jpg' }, { url: '/booth-ad.jpg' }];
    try {
      const snap = await getDocs(query(heroSlidesCol, orderBy('order')));
      heroSlides = [...TEST_SLIDES, ...snap.docs.map(d => ({ id: d.id, ...d.data() }))];
    } catch(e) {
      heroSlides = TEST_SLIDES;
    }
    renderHeroSlider();
  }

  function renderHeroSlider() {
    const track = document.getElementById('heroSliderTrack');
    const dotsWrap = document.getElementById('heroSliderDots');
    const prevBtn = document.getElementById('heroSliderPrev');
    const nextBtn = document.getElementById('heroSliderNext');
    const empty = document.getElementById('heroSliderEmpty');
    track.querySelectorAll('.hero-slide').forEach(el => el.remove());
    dotsWrap.innerHTML = '';
    if (!heroSlides.length) {
      empty.style.display = 'flex';
      prevBtn.style.display = 'none';
      nextBtn.style.display = 'none';
      return;
    }
    empty.style.display = 'none';
    prevBtn.style.display = '';
    nextBtn.style.display = '';
    heroSlides.forEach((slide, i) => {
      const el = document.createElement('div');
      el.className = 'hero-slide' + (i === 0 ? ' active' : '');
      el.innerHTML = `<img src="${escUrl(slide.url)}" alt="" ${i === 0 ? 'fetchpriority="high" loading="eager"' : 'loading="lazy"'}>`;
      track.appendChild(el);
      const dot = document.createElement('button');
      dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', () => { clearInterval(heroAutoPlay); goToHeroSlide(i); startHeroAutoPlay(); });
      dot.addEventListener('mouseenter', () => cursor.classList.add('hover'));
      dot.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
      dotsWrap.appendChild(dot);
    });
    heroCurrentIdx = 0;
    startHeroAutoPlay();
  }

  function goToHeroSlide(idx) {
    const slides = document.querySelectorAll('#heroSliderTrack .hero-slide');
    const dots = document.querySelectorAll('#heroSliderDots .slider-dot');
    if (!slides.length) return;
    slides[heroCurrentIdx]?.classList.remove('active');
    dots[heroCurrentIdx]?.classList.remove('active');
    heroCurrentIdx = ((idx % heroSlides.length) + heroSlides.length) % heroSlides.length;
    slides[heroCurrentIdx]?.classList.add('active');
    dots[heroCurrentIdx]?.classList.add('active');
  }

  function startHeroAutoPlay() {
    clearInterval(heroAutoPlay);
    if (heroSlides.length > 1) heroAutoPlay = setInterval(() => goToHeroSlide(heroCurrentIdx + 1), 5000);
  }

  document.getElementById('heroSliderPrev').addEventListener('click', () => { clearInterval(heroAutoPlay); goToHeroSlide(heroCurrentIdx - 1); startHeroAutoPlay(); });
  document.getElementById('heroSliderNext').addEventListener('click', () => { clearInterval(heroAutoPlay); goToHeroSlide(heroCurrentIdx + 1); startHeroAutoPlay(); });

  loadHeroSlides();

  /* ─── ADMIN HERO IMAGES ─── */
  async function renderHeroImgList() {
    const list = document.getElementById('heroImgList');
    if (!list) return;
    list.innerHTML = '';
    try {
      const snap = await getDocs(query(heroSlidesCol, orderBy('order')));
      if (snap.empty) { list.innerHTML = '<p style="color:var(--muted);font-size:.82rem">追加された画像はありません</p>'; return; }
      snap.forEach(d => {
        const data = d.data();
        const item = document.createElement('div');
        item.className = 'img-preview-item';
        item.innerHTML = `
          <img src="${escUrl(data.url)}" alt="" onerror="this.style.opacity='.3'">
          <div class="img-preview-info">順: ${data.order ?? 0}</div>
          <button class="img-preview-del" data-id="${d.id}">✕ 削除</button>`;
        item.querySelector('.img-preview-del').addEventListener('click', async (e) => {
          if (!confirm('削除しますか？')) return;
          await deleteDoc(doc(db, 'heroSlides', e.target.dataset.id));
          await loadHeroSlides();
          renderHeroImgList();
        });
        list.appendChild(item);
      });
    } catch(e) { console.warn(e); }
  }

  document.getElementById('heroImgAddBtn').addEventListener('click', async () => {
    const url = document.getElementById('heroImgUrl').value.trim();
    if (!url) { alert('URLを入力してください'); return; }
    const order = parseInt(document.getElementById('heroImgOrder').value) || 0;
    const btn = document.getElementById('heroImgAddBtn');
    btn.textContent = '追加中…'; btn.disabled = true;
    try {
      await addDoc(heroSlidesCol, { url, order, date: new Date().toISOString() });
      document.getElementById('heroImgUrl').value = '';
      await loadHeroSlides();
      renderHeroImgList();
    } catch(e) { alert('追加に失敗しました: ' + e.message); }
    btn.textContent = '追加する'; btn.disabled = false;
  });


  /* ─── NEWS ─── */
  const CAT_LABELS = { production:'制作', daily:'日常', achievement:'実績', film:'映画', other:'その他' };
  let newsFilter = 'all';
  let allPosts = [];

  function fmtDate(iso) {
    const d = new Date(iso);
    return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
  }
  function fmtDateTime(iso) {
    const d = new Date(iso);
    return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  }
  function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
  function escUrl(s) {
    s = s || '';
    if (/^(https?:\/\/|\/)/i.test(s)) return esc(s);
    if (s && !s.includes(':')) return esc('/' + s);
    return '';
  }

  async function loadPosts() {
    const q = query(newsCol, orderBy('date', 'desc'));
    const snap = await getDocs(q);
    allPosts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderNews();
    if (aLoggedIn) renderAPostList();
  }

  const NEWS_LIMIT = 3;
  let newsExpanded = false;

  function renderNews() {
    const grid = document.getElementById('newsGrid');
    const empty = document.getElementById('newsEmpty');

    grid.style.display = '';
    grid.querySelectorAll('.split-row, .news-load-more').forEach(el => el.remove());
    const posts = allPosts.filter(p => newsFilter === 'all' || p.cat === newsFilter);
    empty.style.display = posts.length ? 'none' : 'block';
    posts.forEach((p, i) => {
      const card = buildNewsCard(p);
      if (i >= NEWS_LIMIT && !newsExpanded) card.style.display = 'none';
      grid.appendChild(card);
    });
    const hiddenCount = posts.length - NEWS_LIMIT;
    if (hiddenCount > 0) {
      const btn = document.createElement('button');
      btn.className = 'news-more news-load-more';
      btn.style.cssText = 'display:block;margin:1.5rem auto 0;padding:.6em 2em;border:1px solid var(--border);border-radius:999px;font-family:\'Space Mono\',monospace;font-size:.62rem;letter-spacing:.15em;text-transform:uppercase;color:var(--green);background:transparent;cursor:none;transition:all .2s';
      btn.textContent = newsExpanded ? '閉じる' : `もっと見る（残り ${hiddenCount} 件）`;
      btn.addEventListener('mouseenter', () => cursor.classList.add('hover'));
      btn.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
      btn.addEventListener('click', () => {
        newsExpanded = !newsExpanded;
        renderNews();
      });
      grid.appendChild(btn);
    }
  }

  function buildNewsCard(p) {
    const isLong = p.body.length > 200;
    const card = document.createElement('article');
    card.className = 'split-row';
    card.innerHTML = `
      <div class="news-meta">
        <span class="news-cat cat-${p.cat}">${CAT_LABELS[p.cat]}</span>
        <span class="news-date">${fmtDate(p.date)}</span>
      </div>
      <h3 class="news-title">${esc(p.title)}</h3>
      <p class="news-body${isLong?' collapsed':''}" id="nb-${p.id}">${esc(p.body)}</p>
      ${isLong?`<button class="news-more" data-id="${p.id}">続きを読む →</button>`:''}
    `;
    card.querySelectorAll('.news-more').forEach(btn => {
      btn.addEventListener('mouseenter', () => cursor.classList.add('hover'));
      btn.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
      btn.addEventListener('click', () => {
        const el = document.getElementById('nb-' + btn.dataset.id);
        const collapsed = el.classList.toggle('collapsed');
        btn.textContent = collapsed ? '続きを読む →' : '閉じる ↑';
      });
    });
    return card;
  }

  document.querySelectorAll('#news .split-nav-item').forEach(btn => {
    btn.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    btn.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    btn.addEventListener('click', () => {
      newsFilter = btn.dataset.cat;
      newsExpanded = false;
      document.querySelectorAll('#news .split-nav-item').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderNews();
    });
  });

  loadPosts();

  /* ─── ADMIN ─── */
  const ADMIN_PASS_HASH = '771b9a0da413c450031e88e1304f4948df178bb46e1feca9e15a8c5b3c5ec05d';
  let aLoginAttempts = 0;
  let aLoginLocked   = false;

  async function hashPass(str) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
  }
  const CONTENT_KEY = '3ss_content';
  const contentDoc = doc(db, 'config', 'content');
  const CONTENT_DEFAULTS = {
    metaRep: '田中 琉暉',
    joinLead: 'クリエイティブに、一緒に。',
    join: 'Blenderの経験がある方、脚本制作の経験がある方、そして一緒に何かを作りたいという気持ちがある方を歓迎します。まずは気軽にご連絡ください。',
    svcScriptDesc: 'オリジナル映画脚本の執筆・開発を行い、実際の映画として世に送り出すことを目指して活動しています。短編・中編を中心に、ハリウッド式・日本式それぞれの脚本術を取り入れながら物語を組み立てるのが特徴です。脚本が完成したら、共に映画化へ動いてくれる制作スタジオ・プロデューサー・関係者の方を探しています。',
    svcRecruitTitle: 'オリジナル脚本の映画化に向けて、制作仲間を募集しています',
    svcRecruitBody: '脚本完成後、実際の映画として制作するにあたり、共に動いてくださる制作スタジオ・プロデューサー・関係者の方を探しています。撮影・キャスティング・資金面など、映画化に向けて必要となる工程全般でご協力いただける方を歓迎します。まずは脚本を読んでいただくところからでも構いません。',
    svc3dDesc: 'VRC用のモデリングはもちろん、家・ワールド用の小物、VRCに関係のないものまで、Blenderで作れるものなら何でも対応可能です。料金は内容によって変わるため要相談。参考画像や簡単な雰囲気の説明だけでもお気軽にご相談ください。ご希望のイメージ・用途に沿って制作します。',
    svcBoothDesc: 'BOOTHをはじめとした各種プラットフォームで、購入してすぐに使える3Dモデルを販売しています。VRChat向けのアクセサリー・装飾品を中心に、既存アバターにそのまま組み込める即戦力アイテムを継続的に制作。改変のしやすさや軽量性にもこだわり、購入後すぐにワールドで使える完成度を意識しています。',
  };
  let aLoggedIn = false;

  function getContent() { return { ...CONTENT_DEFAULTS, ...JSON.parse(localStorage.getItem(CONTENT_KEY) || '{}') }; }
  async function saveContent(c) {
    await setDoc(contentDoc, c);
    localStorage.setItem(CONTENT_KEY, JSON.stringify(c));
  }
  async function loadContent() {
    try {
      const snap = await getDoc(contentDoc);
      if (snap.exists()) {
        const data = snap.data();
        localStorage.setItem(CONTENT_KEY, JSON.stringify(data));
      }
    } catch(e) { console.warn('content load failed, using cache', e); }
    applyContent();
  }
  async function fetchAndFillContentFields() {
    try {
      const snap = await getDoc(contentDoc);
      if (snap.exists()) {
        const data = snap.data();
        localStorage.setItem(CONTENT_KEY, JSON.stringify(data));
      }
    } catch(e) { console.warn('content fetch failed', e); }
    loadContentFields();
    applyContent();
  }

  function openAdminOverlay() {
    document.getElementById('adminOverlay').classList.add('open');
    if (aLoggedIn) { showAPanel(); } else { showALogin(); }
  }
  function closeAdminOverlay() {
    document.getElementById('adminOverlay').classList.remove('open');
    if (!aLoggedIn) history.replaceState(null, '', '/');
  }
  function showALogin() {
    document.getElementById('aLogin').style.display = 'block';
    document.getElementById('aPanel').style.display = 'none';
  }
  async function showAPanel() {
    document.getElementById('aLogin').style.display = 'none';
    document.getElementById('aPanel').style.display = 'block';
    renderAPostList();
    await fetchAndFillContentFields();
  }
  async function doALogin() {
    if (aLoginLocked) return;
    const errEl = document.getElementById('aErr');
    const inputHash = await hashPass(document.getElementById('aPass').value);
    if (inputHash === ADMIN_PASS_HASH) {
      aLoggedIn = true;
      aLoginAttempts = 0;
      errEl.style.display = 'none';
      document.getElementById('aPass').value = '';
      showAPanel();
    } else {
      aLoginAttempts++;
      if (aLoginAttempts >= 3) {
        aLoginLocked = true;
        errEl.textContent = '試行回数超過。30秒後に再試行してください。';
        errEl.style.display = 'block';
        setTimeout(() => {
          aLoginLocked = false;
          aLoginAttempts = 0;
          errEl.textContent = 'パスワードが違います';
        }, 30000);
      } else {
        errEl.textContent = `パスワードが違います（残り ${3 - aLoginAttempts} 回）`;
        errEl.style.display = 'block';
      }
    }
  }

  document.getElementById('aLoginBtn').addEventListener('click', doALogin);
  document.getElementById('aPass').addEventListener('keydown', e => { if (e.key === 'Enter') doALogin(); });
  document.getElementById('aCloseBtn').addEventListener('click', closeAdminOverlay);
  document.getElementById('aCancelBtn').addEventListener('click', closeAdminOverlay);
  document.getElementById('aPanelClose').addEventListener('click', closeAdminOverlay);

  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('atab-' + tab.dataset.atab).classList.add('active');
      if (tab.dataset.atab === 'scripts') renderSList();
      else if (tab.dataset.atab === 'hero-images') renderHeroImgList();
    });
  });

  // NEWS CRUD
  document.getElementById('aSavePost').addEventListener('click', async () => {
    const title = document.getElementById('aPostTitle').value.trim();
    const cat   = document.getElementById('aPostCat').value;
    const body  = document.getElementById('aPostBody').value.trim();
    const editId = document.getElementById('aEditId').value;
    if (!title || !body) { alert('タイトルと本文を入力してください'); return;  }
    const btn = document.getElementById('aSavePost');
    btn.disabled = true;
    try {
      if (editId) {
        await updateDoc(doc(db, 'news', editId), { title, cat, body });
      } else {
        await addDoc(newsCol, { title, cat, body, date: new Date().toISOString() });
      }
      await loadPosts();
      resetAPostForm();
    } catch(e) {
      console.error('news save error', e);
      alert('保存に失敗しました。Firestore のルールを確認してください。\n\nエラー: ' + (e.message || e.code || e));
    } finally {
      btn.disabled = false;
    }
  });
  document.getElementById('aResetPost').addEventListener('click', resetAPostForm);

  function resetAPostForm() {
    document.getElementById('aEditId').value = '';
    document.getElementById('aPostTitle').value = '';
    document.getElementById('aPostCat').value = 'production';
    document.getElementById('aPostBody').value = '';
    document.getElementById('aFormTitle').textContent = '新しい記事を書く';
  }
  function renderAPostList() {
    const list = document.getElementById('aPostList');
    const posts = [...allPosts].sort((a,b) => new Date(b.date)-new Date(a.date));
    if (!posts.length) { list.innerHTML = '<p style="color:var(--muted);font-size:.85rem;padding:.8rem 0">まだ投稿がありません</p>'; return; }
    list.innerHTML = posts.map(p => `
      <div class="a-post-item">
        <div class="a-post-info">
          <div class="a-post-title">${esc(p.title)}</div>
          <div class="a-post-meta">${CAT_LABELS[p.cat]} · ${fmtDateTime(p.date)}</div>
        </div>
        <div class="a-post-actions">
          <button class="a-btn-edit" data-id="${p.id}">編集</button>
          <button class="a-btn-del"  data-id="${p.id}">削除</button>
        </div>
      </div>`).join('');
    list.querySelectorAll('.a-btn-edit').forEach(btn => btn.addEventListener('click', () => {
      const p = allPosts.find(p => p.id === btn.dataset.id); if (!p) return;
      document.getElementById('aEditId').value = p.id;
      document.getElementById('aPostTitle').value = p.title;
      document.getElementById('aPostCat').value = p.cat;
      document.getElementById('aPostBody').value = p.body;
      document.getElementById('aFormTitle').textContent = '記事を編集';
      document.getElementById('adminOverlay').scrollTop = 0;
    }));
    list.querySelectorAll('.a-btn-del').forEach(btn => btn.addEventListener('click', async () => {
      if (!confirm('削除しますか？')) return;
      await deleteDoc(doc(db, 'news', btn.dataset.id));
      await loadPosts();
    }));
  }

  // CONTENT EDIT
  function loadContentFields() {
    const c = getContent();
    document.getElementById('ca-meta-rep').value = c.metaRep;
    document.getElementById('ca-join-lead').value = c.joinLead;
    document.getElementById('ca-join').value = c.join;
    document.getElementById('ca-svc-script').value = c.svcScriptDesc;
    document.getElementById('ca-svc-recruit-title').value = c.svcRecruitTitle;
    document.getElementById('ca-svc-recruit-body').value = c.svcRecruitBody;
    document.getElementById('ca-svc-3d').value = c.svc3dDesc;
    document.getElementById('ca-svc-booth').value = c.svcBoothDesc;
  }
  document.querySelectorAll('[data-asave]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const key = btn.dataset.asave;
      const c = getContent();
      if (key === 'meta') { c.metaRep = document.getElementById('ca-meta-rep').value; }
      else if (key === 'join') { c.joinLead = document.getElementById('ca-join-lead').value; c.join = document.getElementById('ca-join').value; }
      else if (key === 'services') { c.svcScriptDesc = document.getElementById('ca-svc-script').value; c.svcRecruitTitle = document.getElementById('ca-svc-recruit-title').value; c.svcRecruitBody = document.getElementById('ca-svc-recruit-body').value; c.svc3dDesc = document.getElementById('ca-svc-3d').value; c.svcBoothDesc = document.getElementById('ca-svc-booth').value; }
      btn.disabled = true;
      try {
        await saveContent(c);
        applyContent();
        loadContentFields();
        const ok = document.getElementById('sok-' + key);
        ok.classList.add('show'); setTimeout(() => ok.classList.remove('show'), 2000);
      } catch(e) {
        alert('保存に失敗しました。ネットワークを確認してください。');
        console.error('saveContent error', e);
      } finally {
        btn.disabled = false;
      }
    });
  });

  // URL trigger: /?admin or /index.html?admin
  if (window.location.hash === '#admin') { openAdminOverlay(); }

  /* ─── SITE CONTENT FROM ADMIN ─── */
  function applyContent() {
    const c = getContent();
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('meta-rep', c.metaRep);
    set('join-lead-text', c.joinLead);
    set('join-body-text', c.join);
    const setHTML = (id, val) => { const el = document.getElementById(id); if (el) el.innerHTML = val; };
    setHTML('svc-script-desc', c.svcScriptDesc);
    setHTML('svc-3d-desc', c.svc3dDesc);
    setHTML('svc-booth-desc', c.svcBoothDesc);
    set('svc-recruit-title-projects', c.svcRecruitTitle);
    set('svc-recruit-body-projects', c.svcRecruitBody);
  }
  loadContent();


  /* ─── SCRIPT WORKS ─── */
  const scriptsCol = collection(db, 'scripts');
  let allScripts = [];

  async function loadScripts() {
    try {
      const snap = await getDocs(query(scriptsCol, orderBy('order')));
      allScripts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch(e) {
      console.warn('scripts load failed', e);
    }
    renderScriptsGrid();
    if (aLoggedIn && document.getElementById('atab-scripts')?.classList.contains('active')) renderSList();
  }

  function renderScriptsGrid() {
    const grid = document.getElementById('worksGrid');
    if (!allScripts.length) {
      grid.innerHTML = '<p style="color:var(--muted);font-size:.9rem;padding:2rem 0">作品はまだありません。</p>';
      return;
    }
    const cards = allScripts.map(s => {
      const body = `
        <h3 class="split-title">${esc(s.title)}</h3>
        ${s.synopsis ? `<p class="work-synopsis">${esc(s.synopsis)}</p>` : ''}`;
      if (s.image && escUrl(s.image)) {
        const img = `<img class="work-media-img" src="${escUrl(s.image)}" alt="${esc(s.title)}" loading="lazy">`;
        const hasPdf = s.pdfUrl && escUrl(s.pdfUrl);
        const imgBlock = hasPdf
          ? `<div class="work-media-col">
               <a href="${escUrl(s.pdfUrl)}" target="_blank" rel="noopener" class="work-media-img-link">${img}</a>
               <p class="work-media-note">※ 画像をクリックすると脚本（冒頭10ページ）が見られます。全文にご興味のある方はお問い合わせください。</p>
             </div>`
          : `<div class="work-media-col">${img}</div>`;
        return `
      <div class="split-row work-media-row reveal">
        ${imgBlock}
        <div class="work-media-body">${body}</div>
      </div>`;
      }
      return `<div class="split-row reveal">${body}</div>`;
    });
    grid.innerHTML = cards.join('');
    document.querySelectorAll('#worksGrid .reveal').forEach(el => observer.observe(el));
  }

  function resetSForm() {
    document.getElementById('sEditId').value = '';
    document.getElementById('sTitle').value = '';
    document.getElementById('sType').value = '長編映画 脚本';
    document.getElementById('sStatus').value = '';
    document.getElementById('sSynopsis').value = '';
    document.getElementById('sImage').value = '';
    document.getElementById('sOrder').value = '0';
    document.getElementById('sPdfUrl').value = '';
    document.getElementById('sFormTitle').textContent = '新しい脚本を追加';
  }

  function renderSList() {
    const list = document.getElementById('sList');
    if (!allScripts.length) { list.innerHTML = '<p style="color:var(--muted);font-size:.85rem;padding:.8rem 0">脚本がありません</p>'; return; }
    list.innerHTML = [...allScripts].sort((a,b) => (a.order||0)-(b.order||0)).map(s => `
      <div class="a-post-item">
        <div class="a-post-info">
          <div class="a-post-title">${esc(s.title)}</div>
          <div class="a-post-meta">${esc(s.type)} · ${esc(s.status)}${s.pdfUrl ? ' · 📄 PDFあり' : ''}</div>
        </div>
        <div class="a-post-actions">
          <button class="a-btn-edit" data-sid="${s.id}">編集</button>
          <button class="a-btn-del"  data-sid="${s.id}">削除</button>
        </div>
      </div>`).join('');
    list.querySelectorAll('.a-btn-edit').forEach(btn => btn.addEventListener('click', () => {
      const s = allScripts.find(x => x.id === btn.dataset.sid); if (!s) return;
      document.getElementById('sEditId').value = s.id;
      document.getElementById('sTitle').value = s.title;
      document.getElementById('sType').value = s.type;
      document.getElementById('sStatus').value = s.status;
      document.getElementById('sSynopsis').value = s.synopsis || '';
      document.getElementById('sImage').value = s.image || '';
      document.getElementById('sOrder').value = s.order || 0;
      document.getElementById('sPdfUrl').value = s.pdfUrl || '';
      document.getElementById('sFormTitle').textContent = '脚本を編集';
      document.getElementById('adminOverlay').scrollTop = 0;
    }));
    list.querySelectorAll('.a-btn-del').forEach(btn => btn.addEventListener('click', async () => {
      if (!confirm('削除しますか？')) return;
      try { await deleteDoc(doc(db, 'scripts', btn.dataset.sid)); } catch(e) { console.warn(e); }
      await loadScripts();
    }));
  }

  document.getElementById('sSaveBtn').addEventListener('click', async () => {
    const title    = document.getElementById('sTitle').value.trim();
    const type     = document.getElementById('sType').value;
    const status   = document.getElementById('sStatus').value.trim();
    const synopsis = document.getElementById('sSynopsis').value.trim();
    const image    = document.getElementById('sImage').value.trim();
    const order    = parseInt(document.getElementById('sOrder').value) || 0;
    const editId = document.getElementById('sEditId').value;
    const pdfUrl = document.getElementById('sPdfUrl').value.trim();
    if (!title) { alert('タイトルを入力してください'); return; }
    const btn = document.getElementById('sSaveBtn');
    btn.disabled = true;
    try {
      const data = { title, type, status, synopsis, image, order, pdfUrl };
      if (editId) {
        await updateDoc(doc(db, 'scripts', editId), data);
      } else {
        await addDoc(scriptsCol, { ...data, date: new Date().toISOString() });
      }
      await loadScripts();
      resetSForm();
    } catch(e) {
      alert('保存に失敗しました。ネットワークを確認してください。');
      console.error('script save error', e);
    } finally { btn.disabled = false; }
  });
  document.getElementById('sResetBtn').addEventListener('click', resetSForm);

  loadScripts();

  document.getElementById('contactForm').addEventListener('submit', e => {
    e.preventDefault();
    const form = e.target;
    const name    = form.querySelector('#name').value;
    const email   = form.querySelector('#email').value;
    const serviceEl = form.querySelector('#service');
    const service = serviceEl.selectedOptions[0]?.text || serviceEl.value;
    const message = form.querySelector('#message').value;
    const subject = encodeURIComponent(`【3SS お問い合わせ】${service} — ${name}`);
    const body    = encodeURIComponent(`お名前：${name}\nメール：${email}\nご用件：${service}\n\n${message}`);
    window.location.href = `mailto:ryukitanaka3@gmail.com?subject=${subject}&body=${body}`;
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'メールアプリを開いています…';
    btn.classList.add('btn-sent');
    btn.disabled = true;
    document.getElementById('contactSent').classList.add('show');
  });
