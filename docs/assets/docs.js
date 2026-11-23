/* =========================================================
   順番待ちアプリ 解説資料 共通スクリプト
   - ヘッダーのページナビ生成
   - テーマ切り替え（ライト / ダーク）
   - サイドナビ（ページ内目次）の自動生成とスクロール追従
   - SVG矢印マーカーの共通定義
   ========================================================= */
(() => {
  const PAGES = [
    { href: 'index.html', label: 'ホーム' },
    { href: 'design.html', label: '設計書' },
    { href: 'spec.html', label: '仕様書' },
    { href: 'architecture.html', label: 'アーキテクチャ' },
    { href: 'structure.html', label: '構成・構造' },
    { href: 'tech-tanstack-db-electric.html', label: 'TanStack DB × Electric' },
    { href: 'tech-materialized-view.html', label: 'マテリアライズドビュー' },
    { href: 'tech-trpc.html', label: 'tRPC' },
  ];

  const root = document.documentElement;
  const current = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

  /* ---------- テーマ ---------- */
  const THEME_KEY = 'queue-docs-theme';
  const readTheme = () => {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch {
      return null;
    }
  };
  const writeTheme = (v) => {
    try {
      localStorage.setItem(THEME_KEY, v);
    } catch {
      /* 保存できなくても表示には影響しない */
    }
  };
  const saved = readTheme();
  if (saved === 'light' || saved === 'dark') root.dataset.theme = saved;

  const isDark = () =>
    root.dataset.theme === 'dark' ||
    (!root.dataset.theme && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const ICON_SUN =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  const ICON_MOON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  const ICON_MENU =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';

  /* ---------- SVGマーカー定義 ---------- */
  const MARKERS = ['', 'ink', 'client', 'server', 'electric', 'pg', 'db', 'domain', 'accent', 'proxy'];
  const defs = MARKERS.map((m) => {
    const id = m ? `ah-${m}` : 'ah';
    return `<marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="${id}" d="M0,0 L10,5 L0,10 z"/></marker>`;
  }).join('');

  document.addEventListener('DOMContentLoaded', () => {
    document.body.insertAdjacentHTML(
      'afterbegin',
      `<svg class="svg-defs" aria-hidden="true" focusable="false"><defs>${defs}</defs></svg>`,
    );

    /* ヘッダーナビ */
    const nav = document.querySelector('[data-site-nav]');
    if (nav) {
      nav.innerHTML = PAGES.map(
        (p) =>
          `<a href="${p.href}"${p.href === current ? ' aria-current="page"' : ''}>${p.label}</a>`,
      ).join('');
    }

    /* テーマボタン */
    const themeBtn = document.querySelector('[data-theme-toggle]');
    const paintThemeBtn = () => {
      if (!themeBtn) return;
      themeBtn.innerHTML = isDark() ? ICON_SUN : ICON_MOON;
      themeBtn.setAttribute('aria-label', isDark() ? 'ライトモードに切り替え' : 'ダークモードに切り替え');
    };
    paintThemeBtn();
    themeBtn?.addEventListener('click', () => {
      const next = isDark() ? 'light' : 'dark';
      root.dataset.theme = next;
      writeTheme(next);
      paintThemeBtn();
    });

    /* サイドナビ（ページ内目次） */
    const side = document.querySelector('[data-sidenav]');
    const main = document.querySelector('.doc');
    const links = [];
    if (side && main) {
      const headings = [...main.querySelectorAll('h2, h3')].filter((h) => !h.closest('.toc, .card, .spec'));
      headings.forEach((h, i) => {
        if (!h.id) h.id = `sec-${i + 1}`;
      });

      const list = document.createElement('ol');
      let currentSub = null;
      for (const h of headings) {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#${h.id}`;
        a.textContent =
          h.dataset.nav ||
          [...h.childNodes]
            .map((n) => n.textContent.replace(/\s+/g, ' ').trim())
            .filter(Boolean)
            .join(' ');
        li.appendChild(a);
        links.push({ a, h });
        if (h.tagName === 'H2') {
          list.appendChild(li);
          currentSub = document.createElement('ol');
          li.appendChild(currentSub);
        } else if (currentSub) {
          currentSub.appendChild(li);
        } else {
          list.appendChild(li);
        }
      }
      list.querySelectorAll('ol:empty').forEach((o) => o.remove());

      const title = document.createElement('p');
      title.className = 'sidenav__title';
      title.textContent = side.dataset.title || 'このページの内容';
      side.append(title, list);

      const pages = document.createElement('div');
      pages.className = 'sidenav__pages';
      pages.innerHTML =
        '<p class="sidenav__title">資料一覧</p><ul>' +
        PAGES.map(
          (p) =>
            `<li><a href="${p.href}"${p.href === current ? ' class="is-active"' : ''}>${p.label}</a></li>`,
        ).join('') +
        '</ul>';
      side.appendChild(pages);

      side.addEventListener('click', (e) => {
        if (e.target.closest('a')) document.body.classList.remove('nav-open');
      });

      /* スクロール追従 */
      const setActive = () => {
        const y = window.scrollY + 120;
        let active = links[0];
        for (const l of links) {
          if (l.h.offsetTop <= y) active = l;
          else break;
        }
        for (const l of links) l.a.classList.toggle('is-active', l === active);
      };
      let ticking = false;
      window.addEventListener(
        'scroll',
        () => {
          if (ticking) return;
          ticking = true;
          requestAnimationFrame(() => {
            setActive();
            ticking = false;
          });
        },
        { passive: true },
      );
      setActive();
    }

    /* モバイル用メニュー */
    const toggle = document.querySelector('[data-nav-toggle]');
    if (toggle) {
      toggle.innerHTML = ICON_MENU;
      toggle.addEventListener('click', () => document.body.classList.toggle('nav-open'));
    }
    document.querySelector('.scrim')?.addEventListener('click', () => document.body.classList.remove('nav-open'));
  });
})();
