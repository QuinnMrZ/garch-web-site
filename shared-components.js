/* shared-components.js
   Common front-end behavior for the GARCH site (loaded after site-data.js):
   - Full-site search (albums + images + articles + page navigation) -> overlay with results.
     Image results open in the lightbox (album-aware), page/article results navigate.
   - Image lightbox: click-to-zoom popup, prev/next browsing within the clicked album, keyboard.
   - Contact modal: email + phone + company address, with a message form (mailto).
   - Album masonry galleries: projects page (one waterfall per images/ subdirectory) and
     the AIGC gallery on the generative-design page. Auto-initializes containers with the
     ids #projectsGallery and #aigcGallery. No external dependencies. */
(function () {
    'use strict';

    var DATA = window.SITE_DATA || {};
    var EMAIL = 'qingzhang55155@gmail.com';
    var PHONE = '+86 18801860726';
    var ADDR = '中国上海市崇明区三星镇北星公路1999号';
    var ADDRENG = 'No. 1999, Beixing Rd, Sanxing Town, Chongming District, Shanghai, China';

    /* ---------------- helpers ---------------- */
    function esc(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
    function norm(s) { return String(s || '').toLowerCase(); }

    /* Path helper. site-data src values are stored URL-encoded; to be safe against any
       encoding depth, decode until stable, then re-encode each path segment exactly once. */
    function fixPath(prefix, src) {
        var s = String(src || '');
        for (var i = 0; i < 4; i++) {
            try {
                var d = decodeURIComponent(s);
                if (d === s) break;
                s = d;
            } catch (e) { break; }
        }
        return prefix + s.split('/').map(function (p) { return encodeURIComponent(p); }).join('/');
    }
    function albumSrc(it) { return fixPath('images/', it.src); }

    /* ---------------- search index ---------------- */
    var ALBUMS = DATA.albums || {};
    var AIGC = DATA.aigc || [];
    var PEOPLE = DATA.people || [];
    var SEARCH_INDEX = [];

    (function buildIndex() {
        Object.keys(ALBUMS).forEach(function (k) {
            var a = ALBUMS[k];
            (a.items || []).forEach(function (it) {
                var base = String(it.file || '').replace(/^图片\s*/, '').replace(/\.[^.]+$/, '');
                SEARCH_INDEX.push({
                    type: 'image', kind: 'album', album: k,
                    label: a.label, file: it.file, src: albumSrc(it),
                    text: [it.file, base, a.label, a.en, k]
                });
            });
        });
        AIGC.forEach(function (v, i) {
            SEARCH_INDEX.push({
                type: 'image', kind: 'aigc', album: 'AIGC',
                label: 'AIGC 生成式设计', file: fixPath('', v), src: fixPath('AIGC/', v),
                text: ['AIGC', '生成式设计', 'generative', fixPath('', v)]
            });
        });
        PEOPLE.forEach(function (v) {
            SEARCH_INDEX.push({
                type: 'image', kind: 'people', album: 'PEOPLE',
                label: '团队 Team', file: fixPath('', v), src: fixPath('people/', v),
                text: ['团队', '人物', 'team', 'people', fixPath('', v)]
            });
        });
        [
            { t: 'GARCH Grown Architects 首页 主页 Home', p: 'index.html', label: 'Home 首页' },
            { t: 'Projects 项目 作品 精选 Works 酒店 星级 商业 住宅 城市 投标 相册', p: 'projects.html', label: 'Projects 项目作品' },
            { t: 'Generative Design 生成设计 人工智能 AIGC 生成式 创意 设计 研究', p: 'generative-design.html', label: 'Generative Design 生成式设计' },
            { t: 'Office 办公室 关于我们 团队 Team 联系 Contact Us About Us 上海 崇明 地址 联系方式', p: 'office.html', label: 'Office 团队与联系' }
        ].forEach(function (x) { SEARCH_INDEX.push({ type: 'page', text: x.t, p: x.p, label: x.label }); });
        [
            { t: '威廉姆 W 柯廷 Koetting 比尔 Bill 上海迪士尼乐园 Disneyland 总建筑师 首席建筑师 人物志 美国西南大学 AIA 洛杉矶 颁奖', p: 'office.html#koetting', label: '人物志 · 威廉姆.W.柯廷' },
            { t: '张卿 Quinn Zhang 创始人 董事长 总规划师 同济大学 爱荷华州立大学 AIA 注册建筑师 绿地 砂之船 奥特莱斯 设计总监', p: 'office.html#team-members', label: '核心团队 · 张卿' },
            { t: '凯文 Kevin Wong 董事 商业地产 事业部 策划总监 仲量联行 JLL 睿意德 衡信柏迪 北京大学', p: 'office.html#team-members', label: '核心团队 · 凯文' },
            { t: '张毅 Yi Zhang 招商部 总经理 大雁塔 大唐通易坊 西安交大 MBA 商业地产', p: 'office.html#team-members', label: '核心团队 · 张毅' },
            { t: '廖华 Liao Hua 活动策划 OTA 运营 总监 民宿 淘宝 天猫 美团 携程 抖音 主播', p: 'office.html#team-members', label: '核心团队 · 廖华' },
            { t: '设计理念 Philosophy 自然 智能 进化 人工智能 生成式 城市 建筑 人与自然', p: 'office.html#philosophy', label: '设计理念 · Our Philosophy' }
        ].forEach(function (x) { SEARCH_INDEX.push({ type: 'article', text: x.t, p: x.p, label: x.label }); });
    })();

    function searchResults(q) {
        var t = norm(q);
        var res = [];
        SEARCH_INDEX.forEach(function (it) {
            var hay = norm(Array.isArray(it.text) ? it.text.join(' ') : it.text);
            var hits = hay.split(' ').filter(function (w) { return w.indexOf(t) > -1 || t.indexOf(w) > -1; });
            if (hits.length) res.push({ it: it, score: hits.length });
        });
        res.sort(function (a, b) {
            return b.score - a.score ||
                (a.it.type === 'image' ? 1 : 0) - (b.it.type === 'image' ? 1 : 0);
        });
        return res;
    }

    /* ---------------- search overlay ---------------- */
    var searchOverlay, searchInput, searchList;
    function ensureSearchOverlay() {
        if (searchOverlay) return searchOverlay;
        var o = document.createElement('div');
        o.className = 'so-overlay';
        o.id = 'searchOverlay';
        o.innerHTML =
            '<div class="so-bg"></div>' +
            '<div class="so-panel">' +
              '<div class="so-row"><div class="so-icon">SEARCH</div>' +
                '<input type="text" id="searchInput" class="so-input" placeholder="搜索文章 / 相册 / 页面  Search articles, albums & pages…" autocomplete="off">' +
                '<button type="button" class="so-close so-btn" aria-label="Close">×</button></div>' +
              '<div class="so-list" id="searchList"></div>' +
              '<div class="so-empty" id="searchEmpty" style="display:none">没有匹配的结果 · No results. Try “酒店”, “投标”, “迪士尼” or “About”.</div>' +
            '</div>';
        document.body.appendChild(o);
        searchOverlay = o;
        searchInput = o.querySelector('#searchInput');
        searchList = o.querySelector('#searchList');
        searchInput.addEventListener('input', doSearch);
        searchInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                var el = searchList.querySelector('[data-so-target]');
                if (el) el.click();
            }
            if (e.key === 'Escape') closeSearch();
        });
        o.querySelector('.so-bg').addEventListener('click', closeSearch);
        o.querySelector('.so-close').addEventListener('click', closeSearch);
        return o;
    }
    function openSearch() {
        var o = ensureSearchOverlay();
        o.classList.add('open');
        searchInput.value = '';
        searchInput.focus();
        showSearch([]);
    }
    function closeSearch() {
        if (searchOverlay) searchOverlay.classList.remove('open');
    }
    function typeLabel(type) {
        return type === 'page' ? '页面 Page' : (type === 'article' ? '文章 Article' : '图片 Image');
    }
    function showSearch(res) {
        var list = searchList;
        var empty = document.getElementById('searchEmpty');
        list.innerHTML = '';
        if (!res.length) {
            empty.style.display = '';
            list.style.display = 'none';
            return;
        }
        empty.style.display = 'none';
        list.style.display = 'block';
        res.forEach(function (r) {
            var it = r.it;
            var item = document.createElement('a');
            item.className = 'so-item';
            item.dataset.soTarget = it.p || '';
            var sub = '';
            if (it.type === 'image') sub = '<small class="so-sub">' + esc(it.label || '') + '</small>';
            item.innerHTML =
                '<span class="so-type">' + typeLabel(it.type) + '</span>' +
                '<div class="so-main"><strong>' + esc(it.type === 'image' ? (it.file || '') : (it.label || '')) + '</strong>' + sub + '</div>';
            item.addEventListener('click', function (e) {
                e.preventDefault();
                closeSearch();
                if (it.type === 'image') openLightbox(it.src, it.file, it.album);
                else window.location.href = it.p;
            });
            list.appendChild(item);
        });
    }
    function doSearch() {
        var q = searchInput.value;
        if (!q || !q.trim()) { showSearch([]); return; }
        showSearch(searchResults(q));
    }

    /* ---------------- lightbox ---------------- */
    var lb, lbItems = [], lbMeta = [], lbLabel = '', lbIndex = 0, lbZ = 1;
    function ensureLightbox() {
        if (lb) return lb;
        var o = document.createElement('div');
        o.className = 'lb-overlay';
        o.id = 'lightbox';
        o.innerHTML =
            '<div class="lb-bg" data-lb-close></div>' +
            '<button type="button" class="lb-btn lb-close" data-lb-close aria-label="Close">&times;</button>' +
            '<button type="button" class="lb-btn lb-prev" data-lb-prev aria-label="Previous">&larr;</button>' +
            '<button type="button" class="lb-btn lb-next" data-lb-next aria-label="Next">&rarr;</button>' +
            '<div class="lb-figure" id="lbFigure">' +
              '<img id="lbImg" src="" alt="Project detail">' +
              '<div class="lb-cap" id="lbCap"></div>' +
            '</div>';
        document.body.appendChild(o);
        lb = {
            overlay: o,
            img: o.querySelector('#lbImg'),
            fig: o.querySelector('#lbFigure'),
            cap: o.querySelector('#lbCap')
        };
        o.querySelector('.lb-bg').addEventListener('click', closeLightbox);
        o.querySelector('.lb-close').addEventListener('click', closeLightbox);
        o.querySelector('.lb-prev').addEventListener('click', function () { stepLightbox(-1); });
        o.querySelector('.lb-next').addEventListener('click', function () { stepLightbox(1); });
        document.addEventListener('keydown', function (e) {
            if (!lb.overlay.classList.contains('open')) return;
            if (e.key === 'Escape') closeLightbox();
            else if (e.key === 'ArrowLeft') { e.preventDefault(); stepLightbox(-1); }
            else if (e.key === 'ArrowRight') { e.preventDefault(); stepLightbox(1); }
        });
        // wheel zoom
        o.addEventListener('wheel', function (e) {
            e.preventDefault();
            lbZ += (e.deltaY < 0 ? 0.1 : -0.1);
            lbZ = Math.max(1, Math.min(2.5, lbZ));
            lb.fig.style.transform = 'scale(' + lbZ + ')';
        }, { passive: false });
        lb.img.addEventListener('dblclick', function () {
            lbZ = lbZ === 1 ? 1.6 : 1;
            lb.fig.style.transform = lbZ === 1 ? '' : 'scale(' + lbZ + ')';
        });
        return lb;
    }

    function albumKeyForSrc(src) {
        var key = null;
        Object.keys(ALBUMS).forEach(function (k) {
            if (key) return;
            (ALBUMS[k].items || []).forEach(function (it) {
                if (!key && albumSrc(it) === src) key = k;
            });
        });
        return key;
    }
    function buildLightboxList(src, albumKey) {
        var items = [], meta = [], label = '';
        var key = albumKey;
        if ((!key || !ALBUMS[key]) && key !== 'AIGC' && key !== 'PEOPLE') key = albumKeyForSrc(src);
        if (key === 'AIGC') {
            label = 'AIGC 生成式设计';
            AIGC.forEach(function (v) {
                items.push(fixPath('AIGC/', v));
                meta.push(fixPath('', v));
            });
        } else if (key === 'PEOPLE') {
            label = '团队 Team';
            PEOPLE.forEach(function (v) {
                items.push(fixPath('people/', v));
                meta.push(fixPath('', v));
            });
        } else if (key && ALBUMS[key]) {
            label = ALBUMS[key].label;
            (ALBUMS[key].items || []).forEach(function (it) {
                items.push(albumSrc(it));
                meta.push(it.file || '');
            });
        }
        if (!items.length) {
            items = [src];
            meta = [''];
            label = '';
        }
        var idx = items.indexOf(src);
        if (idx < 0) idx = 0;
        return { items: items, meta: meta, label: label, index: idx };
    }
    function openLightbox(src, cap, albumKey) {
        var L = ensureLightbox();
        var list = buildLightboxList(src, albumKey);
        lbItems = list.items;
        lbMeta = list.meta;
        lbLabel = list.label;
        lbIndex = list.index;
        lbZ = 1;
        renderLightbox();
        L.overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
    function renderLightbox() {
        var L = ensureLightbox();
        if (!lbItems.length) return;
        var src = lbItems[lbIndex];
        L.img.onload = null;
        L.img.src = src;
        L.fig.style.transform = '';
        var cap = (lbIndex + 1) + ' / ' + lbItems.length;
        if (lbLabel) cap += '  ·  ' + lbLabel;
        if (lbMeta[lbIndex]) cap += '  ·  ' + lbMeta[lbIndex];
        L.cap.textContent = cap;
    }
    function stepLightbox(d) {
        if (!lbItems.length) return;
        lbIndex = (lbIndex + d + lbItems.length) % lbItems.length;
        lbZ = 1;
        renderLightbox();
    }
    function closeLightbox() {
        if (lb && lb.overlay) lb.overlay.classList.remove('open');
        document.body.style.overflow = '';
    }

    /* ---------------- contact modal ---------------- */
    var cm;
    function ensureContactModal() {
        if (cm) return cm;
        var o = document.createElement('div');
        o.className = 'cm-overlay';
        o.id = 'contactModal';
        o.innerHTML =
            '<div class="cm-bg" data-cm-close></div>' +
            '<div class="cm-panel">' +
              '<button type="button" class="cm-close" aria-label="Close">&times;</button>' +
              '<h2>Contact Us · 联系我们</h2>' +
              '<p class="cm-email"><strong>邮箱 Email</strong> ' + esc(EMAIL) +
                ' <button type="button" class="cm-copy-btn">复制 Copy</button></p>' +
              '<p class="cm-row"><strong>电话 Phone</strong> ' + esc(PHONE) + '</p>' +
              '<p class="cm-row"><strong>地址 Address</strong> ' + esc(ADDR) + '<br>' + esc(ADDRENG) + '</p>' +
              '<p class="cm-row"><a class="cm-mailto" href="mailto:' + EMAIL + '">✉ 发送邮件 Open mail client (' + esc(EMAIL) + ')</a></p>' +
              '<div class="cm-form">' +
                '<input id="cmName" type="text" placeholder="您的称呼 Your name (optional)" autocomplete="name">' +
                '<input id="cmEmail" type="email" placeholder="邮箱 Email (required)" autocomplete="email">' +
                '<textarea id="cmMsg" rows="4" placeholder="留言 Message"></textarea>' +
                '<button id="cmSend" type="button">发送留言 Send Message</button>' +
              '</div>' +
              '<p class="cm-status" id="cmStatus"></p>' +
            '</div>';
        document.body.appendChild(o);
        o.querySelector('.cm-bg').addEventListener('click', closeContact);
        o.querySelector('.cm-close').addEventListener('click', closeContact);
        o.querySelector('.cm-copy-btn').addEventListener('click', function () { copyText(EMAIL); });
        o.querySelector('#cmSend').addEventListener('click', sendContact);
        cm = o;
        return cm;
    }
    function openContact() {
        ensureContactModal().classList.add('open');
        document.body.style.overflow = 'hidden';
    }
    function closeContact() {
        var o = document.getElementById('contactModal');
        if (o) {
            o.classList.remove('open');
            var st = o.querySelector('#cmStatus');
            if (st) st.textContent = '';
            document.body.style.overflow = '';
        }
    }
    function copyText(t) {
        var status = document.getElementById('cmStatus');
        function done() { status.textContent = '已复制 Copied: ' + t; setTimeout(function () { status.textContent = ''; }, 1800); }
        function fallback() {
            var ta = document.createElement('textarea');
            ta.value = t;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            try { document.execCommand('copy'); } catch (e2) {}
            ta.remove();
            status.textContent = 'Copy: ' + t;
        }
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(t).then(done, function () {
                    status.textContent = 'Copy: ' + t;
                });
            } else {
                fallback();
            }
        } catch (e) { fallback(); }
    }
    function sendContact() {
        var name = (document.getElementById('cmName').value || '').trim();
        var email = (document.getElementById('cmEmail').value || '').trim();
        var msg = (document.getElementById('cmMsg').value || '').trim();
        var status = document.getElementById('cmStatus');
        if (!email) { status.textContent = '请填写邮箱 Please enter an email.'; return; }
        var body = (name ? 'Name: ' + name + '\n' : '') + (email ? 'Email: ' + email + '\n' : '') + '\n' + msg;
        var subject = 'Message from ' + (name || email.split('@')[0]);
        var url = 'mailto:' + EMAIL +
            '?subject=' + encodeURIComponent(subject) +
            '&body=' + encodeURIComponent(body);
        window.location.href = url;
        status.textContent = '已打开邮件客户端 Opening mail client…';
        setTimeout(function () { status.textContent = ''; }, 1800);
    }

    /* ---------------- masonry galleries ---------------- */
    var galleryCSSInjected = false;
    function injectGalleryCSS() {
        if (galleryCSSInjected) return;
        galleryCSSInjected = true;
        var st = document.createElement('style');
        st.textContent =
          '.masonry-grid{column-count:4;column-gap:14px;}\n' +
          '.masonry-grid .masonry-item{break-inside:avoid;margin-bottom:14px;position:relative;overflow:hidden;border-radius:8px;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.14);}\n' +
          '.masonry-grid .masonry-item img{width:100%;display:block;object-fit:cover;transition:transform .5s cubic-bezier(.2,.7,.2,1);}\n' +
          '.masonry-grid .masonry-item:hover img{transform:scale(1.07);}\n' +
          '.masonry-item .masonry-cap{position:absolute;bottom:0;left:0;right:0;padding:0 14px 12px;pointer-events:none;font-size:12px;line-height:1.4;opacity:0;transition:opacity .3s;background:linear-gradient(transparent,rgba(0,0,0,.6));color:#fff;}\n' +
          '.masonry-grid .masonry-item:hover .masonry-cap,.masonry-item:focus-within .masonry-cap{opacity:1;}\n' +
          '.masonry-item .masonry-cap strong{display:block;font-size:13px;letter-spacing:.3px;}\n' +
          '.masonry-item .masonry-cap span{font-size:11px;opacity:.8;}\n' +
          '@media (max-width:1000px){.masonry-grid{column-count:3}}\n' +
          '@media (max-width:700px){.masonry-grid{column-count:2}}\n' +
          '@media (max-width:460px){.masonry-grid{column-count:1}}';
        document.head.appendChild(st);
    }
    function masonryHTML(photos) {
        return photos.map(function (p) {
            var cap = p.file || '';
            return '<div class="masonry-item" data-src="' + esc(p.src) + '" data-cap="' + esc(cap) + '" data-album="' + esc(p.album || '') + '">' +
                   '<img loading="lazy" src="' + esc(p.src) + '" alt="' + esc((p.label || '') + (cap ? ' ' + cap : '')) + '">' +
                   '<span class="masonry-cap"><strong>' + esc(p.label || '') + '</strong>' + (cap ? '<span>' + esc(cap) + '</span>' : '') + '</span>' +
                   '</div>';
        }).join('');
    }
    function bindMasonry(el) {
        el.querySelectorAll('.masonry-item').forEach(function (card) {
            card.setAttribute('tabindex', '0');
            function on(e) {
                e.stopPropagation();
                openLightbox(card.getAttribute('data-src'), card.getAttribute('data-cap'), card.getAttribute('data-album'));
            }
            card.addEventListener('click', on);
            card.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); on(e); }
            });
        });
    }
    /* projects page: one waterfall album per images/ subdirectory */
    function initProjectsSections(containerId) {
        var box = document.getElementById(containerId);
        if (!box) return;
        injectGalleryCSS();
        box.innerHTML = '';
        Object.keys(ALBUMS).forEach(function (k) {
            var a = ALBUMS[k];
            var sec = document.createElement('section');
            sec.className = 'album-section';
            sec.innerHTML =
                '<div class="album-head"><h2>' + esc(a.label) + '</h2>' +
                '<span class="album-en">' + esc(a.en) + '</span>' +
                '<span class="album-count">' + (a.items || []).length + ' photos</span></div>' +
                '<div class="masonry-grid" data-album="' + esc(k) + '"></div>';
            box.appendChild(sec);
            var grid = sec.querySelector('.masonry-grid');
            grid.innerHTML = masonryHTML((a.items || []).map(function (it) {
                return { src: albumSrc(it), file: it.file, label: a.label, album: k };
            }));
            bindMasonry(grid);
        });
    }
    /* generative-design page: AIGC gallery */
    function initAigcGallery(el) {
        injectGalleryCSS();
        el.innerHTML = masonryHTML(AIGC.map(function (v, i) {
            return { src: fixPath('AIGC/', v), file: fixPath('', v), label: 'AIGC 生成式设计', album: 'AIGC' };
        }));
        bindMasonry(el);
    }

    /* ---------------- wire up ---------------- */
    if (document.getElementById('searchBtn')) {
        document.getElementById('searchBtn').addEventListener('click', openSearch);
    }
    if (document.getElementById('contactBtn')) {
        document.getElementById('contactBtn').addEventListener('click', openContact);
    }
    if (document.getElementById('projectsGallery')) {
        initProjectsSections('projectsGallery');
    }
    var aigcEl = document.getElementById('aigcGallery');
    if (aigcEl) initAigcGallery(aigcEl);

    /* auto-open an album lightbox when arriving via ?album=... */
    (function () {
        var m = window.location.search.match(/album=([^&]+)/);
        if (m) {
            var key = decodeURIComponent(m[1]);
            var a = ALBUMS[key];
            if (a && a.items && a.items.length) {
                setTimeout(function () { openLightbox(albumSrc(a.items[0]), a.items[0].file, key); }, 150);
            }
        }
    })();
})();
