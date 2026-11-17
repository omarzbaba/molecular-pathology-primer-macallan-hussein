/* Content renderers: session plan, objectives map, alteration drawings,
   videos, reference tables, glossary, atlas and the BCR::ABL1 figure. */
(function (MP) {
  'use strict';
  const { el, svg, $, $$ } = MP;

  const LEVELS = { core: ['lvl', 'Core'], next: ['lvl lvl--next', 'Next level'], preview: ['lvl lvl--preview', 'Preview'] };
  MP.levelTag = function (level) {
    const def = LEVELS[level] || LEVELS.core;
    return el('span', { class: def[0], text: def[1] });
  };

  /* ---------- session plan ---------- */
  function renderAgenda() {
    const host = $('#agenda');
    if (!host) return;
    const rows = MP.data.stops.map((stop) => el('a', { href: '#' + stop.id },
      el('span', { class: 'n', text: stop.n }),
      el('span', { class: 't' }, stop.title, el('small', { text: stop.sub })),
      el('span', { class: 'm', text: stop.min + ' min' })));
    const foot = el('div', { class: 'agenda-foot' },
      el('span', { text: 'Planned. Skip the “if time allows” activities to finish in about an hour.' }),
      el('b', { text: MP.data.totalMinutes + ' min' }));
    host.replaceChildren(...rows, foot);
  }

  /* ---------- objectives map ---------- */
  const RING_C = 100.5; // circumference for r = 16
  function renderObjectives() {
    const host = $('#objGrid');
    if (!host) return;
    host.replaceChildren(...MP.data.objectives.map((obj) => {
      const ring = el('span', { class: 'obj-ring' });
      ring.append(
        svg('svg', { viewBox: '0 0 38 38', width: 38, height: 38, 'aria-hidden': 'true' },
          svg('circle', { class: 'ring-bg', cx: 19, cy: 19, r: 16 }),
          svg('circle', { class: 'ring-fg', cx: 19, cy: 19, r: 16 })),
        el('b', { text: String(obj.n) }));
      return el('a', { class: 'obj', href: '#' + obj.stop, data: { obj: obj.n } },
        ring, el('h4', { text: obj.title }), el('p', { text: obj.text }),
        el('span', { class: 'obj-meta', text: obj.abp }));
    }));
  }
  /** Fills each objective ring with the share of its questions answered correctly. */
  MP.updateObjectives = function () {
    const answers = MP.store.answers();
    MP.data.objectives.forEach((obj) => {
      const card = $('.obj[data-obj="' + obj.n + '"]');
      if (!card) return;
      const mine = MP.data.questions.filter((q) => q.obj === obj.n);
      const correct = mine.filter((q) => answers[q.id] === q.answer).length;
      const frac = mine.length ? correct / mine.length : 0;
      $('.ring-fg', card).style.strokeDashoffset = (RING_C * (1 - frac)).toFixed(1);
      $('.obj-meta', card).textContent = obj.abp + ' · ' + correct + ' of ' + mine.length + ' correct';
      card.classList.toggle('is-done', mine.length > 0 && correct === mine.length);
    });
  };

  /* ---------- six kinds of alteration ---------- */
  const letters = (seq, y, hit) => seq.split('').map((b, i) => {
    const x = 14 + i * 19;
    const box = hit && hit.includes(i) ? '<rect x="' + (x - 8) + '" y="' + (y - 13) + '" width="16" height="18" rx="4" class="a-hit"/>' : '';
    return box + (b === '-' ? '<line x1="' + (x - 5) + '" y1="' + (y - 4) + '" x2="' + (x + 5) + '" y2="' + (y - 4) + '" class="a-gap"/>' : '<text x="' + x + '" y="' + y + '" class="a-t">' + b + '</text>');
  }).join('');
  const boxes = (n, x0, y, cls) => Array.from({ length: n }, (_, i) => '<rect x="' + (x0 + (i % 6) * 14) + '" y="' + (y + Math.floor(i / 6) * 14) + '" width="10" height="10" rx="2.5" class="' + cls + '"/>').join('');
  const ART = {
    snv: () => letters('ACAGTGAAAT', 24) + letters('ACAGAGAAAT', 52, [4]),
    indel: () => letters('ATCTTTGGTG', 24) + letters('ATC---GGTG', 52, [3, 4, 5]),
    cnv: () => '<text x="6" y="14" class="a-l">normal</text>' + boxes(2, 6, 24, 'a-mute') +
      '<text x="96" y="14" class="a-l">amplified</text>' + boxes(12, 96, 24, 'a-acc'),
    fusion: () => '<rect x="6" y="10" width="84" height="12" rx="4" class="a-ink"/><rect x="110" y="10" width="84" height="12" rx="4" class="a-acc"/>' +
      '<text x="48" y="36" class="a-l" text-anchor="middle">gene A</text><text x="152" y="36" class="a-l" text-anchor="middle">gene B</text>' +
      '<rect x="40" y="46" width="60" height="12" rx="4" class="a-ink"/><rect x="100" y="46" width="60" height="12" rx="4" class="a-acc"/>',
    repeat: () => '<text x="6" y="14" class="a-l">normal</text>' + boxes(5, 6, 20, 'a-mute') +
      '<text x="6" y="46" class="a-l">expanded</text>' + Array.from({ length: 13 }, (_, i) => '<rect x="' + (6 + i * 14) + '" y="52" width="10" height="10" rx="2.5" class="a-acc"/>').join(''),
    methyl: () => '<line x1="6" y1="46" x2="194" y2="46" class="a-line"/><rect x="92" y="38" width="96" height="16" rx="4" class="a-mute"/>' +
      '<text x="140" y="50" class="a-l" text-anchor="middle">gene · off</text>' +
      [18, 34, 50, 66].map((x) => '<line x1="' + x + '" y1="46" x2="' + x + '" y2="22" class="a-line"/><circle cx="' + x + '" cy="18" r="5.5" class="a-ink"/>').join('') +
      '<text x="42" y="62" class="a-l" text-anchor="middle">methylated promoter</text>'
  };
  function renderSix() {
    const host = $('#sixGrid');
    if (!host) return;
    host.replaceChildren(...MP.data.six.map((item) => {
      const art = el('div', { html: '<svg viewBox="0 0 200 66" role="img" aria-label="Diagram: ' + item.title + '">' + ART[item.art]() + '</svg>' });
      return el('div', { class: 'alt' }, art.firstChild,
        el('h4', { text: item.title }), el('p', { text: item.text }),
        el('p', { class: 'alt-test', text: 'Seen by: ' + item.test }));
    }));
  }

  /* ---------- lite video embeds ---------- */
  function videoCard(video) {
    const frame = el('button', { class: 'video-frame', type: 'button', 'aria-label': 'Play video: ' + video.title },
      // No `src` yet: the thumbnail address waits in data-src until the drawer is opened (see renderVideos),
      // so the page contacts no video host until the reader asks to see the videos.
      el('img', { alt: '', referrerpolicy: 'no-referrer', data: { src: 'https://i.ytimg.com/vi/' + video.id + '/hqdefault.jpg' } }),
      el('span', { class: 'video-play' }, el('i')));
    frame.addEventListener('click', () => {
      const player = el('iframe', {
        src: 'https://www.youtube-nocookie.com/embed/' + video.id + '?autoplay=1&rel=0',
        title: video.title, allowfullscreen: true, referrerpolicy: 'strict-origin-when-cross-origin',
        allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
      });
      frame.replaceWith(el('div', { class: 'video-frame' }, player));
      player.focus(); // the play button is gone; keep keyboard focus on the player that replaced it
    });
    return el('div', { class: 'video' }, frame,
      el('div', { class: 'video-meta' }, el('strong', { text: video.title }), el('span', { text: video.by + ' — ' + video.note })));
  }
  function renderVideos() {
    $$('[data-videos]').forEach((host) => {
      const cards = host.dataset.videos.split(',').map((key) => MP.data.videos[key.trim()]).filter(Boolean).map(videoCard);
      host.replaceChildren(...cards);
      const showThumbnails = () => $$('img[data-src]', host).forEach((img) => {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
      });
      // Browsers fetch lazy images even inside a closed <details>, so wait for the drawer itself.
      const drawer = host.closest('details');
      if (!drawer || drawer.open) showThumbnails();
      else drawer.addEventListener('toggle', () => { if (drawer.open) showThumbnails(); });
    });
  }

  /* ---------- reference accordions ---------- */
  function referenceTable(ref) {
    const head = el('tr', null, ref.cols.map((col) => el('th', { text: col })));
    const rows = ref.rows.map((row) => el('tr', null, row.c.map((cell, i) => {
      const td = el('td', { html: cell });
      if (i === 0 && row.lvl && row.lvl !== 'core') td.append(' ', MP.levelTag(row.lvl));
      return td;
    })));
    return el('div', { class: 'table-wrap' }, el('table', { class: 'tbl' }, el('thead', null, head), el('tbody', null, rows)));
  }
  /** Take-away lists: one per stop, plus the wrap-up's two lists (author-written markup). */
  function renderTakeaways() {
    const asItems = (points) => points.map((point) => el('li', { html: point }));
    $$('[data-know]').forEach((host) => {
      const points = MP.data.carry[host.dataset.know] || [];
      host.replaceChildren(el('h4', { text: 'Carry this away' }), el('ul', null, asItems(points)));
    });
    const keep = $('[data-takehome]');
    if (keep) keep.replaceChildren(...asItems(MP.data.keep));
    const ask = $('[data-ask]');
    if (ask) ask.replaceChildren(...asItems(MP.data.ask));
  }

  /** Fills each [data-table] mount in a "Go deeper" drawer from MP.data.tables. */
  function renderTables() {
    $$('[data-table]').forEach((host) => {
      const table = MP.data.tables[host.dataset.table];
      if (table) host.replaceChildren(referenceTable(table));
    });
  }
  function renderReference() {
    const host = $('#refAcc');
    if (!host) return;
    host.replaceChildren(...MP.data.reference.map((ref) => {
      const body = ref.notes
        ? el('div', { class: 'grid-2' }, ref.notes.map((note) => el('div', { class: 'card' }, el('h4', { text: note.h }), el('p', { html: note.p }))))
        : referenceTable(ref);
      return el('details', { class: 'acc', id: 'ref-' + ref.id },
        el('summary', null, el('span', null, ref.title, el('small', { text: '  ' + ref.sub, style: 'font-weight:400;color:var(--faint);margin-left:10px' }))),
        el('div', { class: 'acc-body', style: 'max-width:none' }, body));
    }));
  }

  /* ---------- glossary ---------- */
  function renderGlossary(query) {
    const host = $('#glossList');
    if (!host) return;
    const needle = (query || '').trim().toLowerCase();
    const items = MP.data.glossary
      .filter((g) => !needle || (g.term + ' ' + (g.abbr || '') + ' ' + g.def).toLowerCase().includes(needle))
      .slice().sort((a, b) => a.term.localeCompare(b.term));
    if (!items.length) {
      host.replaceChildren(el('p', { class: 'empty', text: 'No term matches “' + query + '”.' }));
      return;
    }
    host.replaceChildren(...items.map((g) => el('div', { class: 'gl' + (g.core ? ' is-core' : '') },
      el('div', { class: 'gl-term' }, g.term, g.abbr ? el('span', { class: 'gl-abbr', text: g.abbr }) : null),
      el('div', { class: 'gl-def', text: g.def }))));
  }

  /* ---------- biomarker atlas ---------- */
  let atlasSite = 'All';
  function renderAtlas() {
    const host = $('#atlasGrid');
    if (!host) return;
    const needle = ($('#atlasSearch').value || '').trim().toLowerCase();
    const items = MP.data.atlas.filter((row) =>
      (atlasSite === 'All' || row.site === atlasSite) &&
      (!needle || (row.site + ' ' + row.marker + ' ' + row.why + ' ' + row.test).toLowerCase().includes(needle)));
    if (!items.length) {
      host.replaceChildren(el('p', { class: 'empty', text: 'Nothing matches. Try a gene symbol or a tumor site.' }));
      return;
    }
    host.replaceChildren(...items.map((row) => el('div', { class: 'bm' },
      el('div', { class: 'bm-top' }, el('span', { class: 'bm-site', text: row.site }), MP.levelTag(row.level)),
      el('h4', { text: row.marker }), el('p', { text: row.why }),
      el('span', { class: 'bm-test', text: row.test }))));
  }
  let atlasChips = [];
  function setAtlasSite(site) {
    atlasSite = site;
    atlasChips.forEach((chip) => chip.setAttribute('aria-pressed', String(chip.dataset.site === site)));
    renderAtlas();
  }
  /** Clears the site filter. Search uses this so a chosen marker is never hidden by an old filter. */
  MP.showAllAtlasSites = () => setAtlasSite('All');

  function renderAtlasFilters() {
    const host = $('#atlasFilters');
    if (!host) return;
    const sites = ['All'].concat(Array.from(new Set(MP.data.atlas.map((row) => row.site))));
    atlasChips = sites.map((site) => {
      const chip = el('button', { class: 'chip', type: 'button', data: { site }, 'aria-pressed': String(site === atlasSite), text: site });
      chip.addEventListener('click', () => setAtlasSite(site));
      return chip;
    });
    host.replaceChildren(...atlasChips);
  }

  /* ---------- BCR::ABL1 monitoring figure (one series, log scale) ---------- */
  function renderBcrFigure() {
    const host = $('#bcrFig');
    if (!host) return;
    const W = 420, H = 250, L = 52, R = 14, T = 16, B = 34;
    const points = [[0, 100], [3, 8], [6, 0.9], [9, 0.3], [12, 0.08], [18, 0.02], [24, 0.008]];
    const x = (month) => L + (month / 24) * (W - L - R);
    const y = (pct) => T + ((2 - Math.log10(pct)) / 5) * (H - T - B); // 100% at top, 0.001% at bottom
    const chart = svg('svg', { class: 'chart', viewBox: '0 0 ' + W + ' ' + H, role: 'img',
      'aria-label': 'BCR::ABL1 transcript level falling from 100 percent at diagnosis to below 0.01 percent at 24 months on treatment, crossing the major molecular response line of 0.1 percent at about 12 months' });
    [100, 10, 1, 0.1, 0.01, 0.001].forEach((pct) => {
      chart.append(svg('line', { class: 'grid', x1: L, x2: W - R, y1: y(pct), y2: y(pct) }),
        svg('text', { x: L - 8, y: y(pct) + 4, 'text-anchor': 'end', text: pct + '%' }));
    });
    [0, 6, 12, 18, 24].forEach((month) => chart.append(svg('text', { x: x(month), y: H - 12, 'text-anchor': 'middle', text: month + ' mo' })));
    chart.append(svg('line', { class: 'ref', x1: L, x2: W - R, y1: y(0.1), y2: y(0.1) }),
      svg('text', { class: 'lbl', x: W - R, y: y(0.1) - 6, 'text-anchor': 'end', text: 'major molecular response ≤ 0.1%' }),
      svg('polyline', { class: 'series', points: points.map((p) => x(p[0]) + ',' + y(p[1])).join(' ') }));
    points.forEach((p) => chart.append(svg('circle', { class: 'dot', cx: x(p[0]), cy: y(p[1]), r: 4.5 },
      svg('title', { text: p[0] + ' months: ' + p[1] + '% on the International Scale' }))));
    const table = el('details', { class: 'tbl-view' }, el('summary', { text: 'View as a table' }),
      el('table', null, el('tr', null, el('th', { text: 'Month' }), el('th', { text: 'BCR::ABL1 (International Scale)' })),
        points.map((p) => el('tr', null, el('td', { text: String(p[0]) }), el('td', { text: p[1] + '%' })))));
    host.replaceChildren(chart, el('figcaption', { text: 'An illustrative response to a tyrosine-kinase inhibitor. Each gridline is a ten-fold fall.' }), table);
  }

  MP.renderContent = function () {
    renderAgenda();
    renderObjectives();
    renderSix();
    renderVideos();
    renderTakeaways();
    renderTables();
    renderReference();
    renderGlossary('');
    renderAtlasFilters();
    renderAtlas();
    renderBcrFigure();
    const gloss = $('#glossSearch');
    if (gloss) gloss.addEventListener('input', (e) => renderGlossary(e.target.value));
    const atlas = $('#atlasSearch');
    if (atlas) atlas.addEventListener('input', renderAtlas);
  };
})(window.MP);
