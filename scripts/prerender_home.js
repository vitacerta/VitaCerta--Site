const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

function decode(s) {
  return (s || '').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>');
}

function loadRealArticles() {
  const catalog = fs.readFileSync(path.resolve('conteudos/index.html'), 'utf8');
  const re = /<article data-section="([^"]+)"><small>([^<]+)<\/small><h2><a href="([^"]+)">([^<]+)<\/a><\/h2><\/article>/g;
  const items = [];
  let m;
  while ((m = re.exec(catalog)) && items.length < 4) {
    const href = m[3];
    const parts = decode(m[2]).split('·').map(x => x.trim());
    const articleFile = path.resolve('.' + href, 'index.html');
    let description = 'Leia o artigo completo no VitaCerta.';
    if (fs.existsSync(articleFile)) {
      const html = fs.readFileSync(articleFile, 'utf8');
      const dm = html.match(/<meta name="description" content="([^"]*)">/i);
      if (dm) description = decode(dm[1]);
    }
    items.push({ title: decode(m[4]), href, category: parts[0] || 'VitaCerta', date: parts[1] || '', description });
  }
  if (items.length < 4) throw new Error('Não foi possível carregar quatro artigos reais para a home.');
  return items;
}

(async () => {
  const file = path.resolve('index.html');
  const articles = loadRealArticles();
  let source = fs.readFileSync(file, 'utf8');

  // Remove a antiga injeção que substituía o desenho inteiro da seção.
  // A partir daqui preservamos o layout React original e trocamos apenas os dados dos cards.
  const marker = '<!-- VC_ARTIGOS_HOME -->';
  if (source.includes(marker)) source = source.split(marker)[0] + '</body></html>';

  source = source.replace('<html lang="en">', '<html lang="pt-BR">');
  source = source.replace('<title>React Artifact</title>', '<title>VitaCerta | Saúde, Nutrição, Movimento, Mente e Longevidade</title>');
  if (!/name=["']description["']/i.test(source)) {
    source = source.replace('</head>', '<meta name="description" content="Informação clara e confiável sobre saúde, nutrição, movimento, mente e longevidade para escolhas melhores no dia a dia."><link rel="canonical" href="https://vitacerta.com.br/">\n</head>');
  }
  fs.writeFileSync(file, source, 'utf8');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  await page.goto('file://' + file, { waitUntil: 'load' });
  await page.waitForSelector('#conteudos', { timeout: 15000 });
  await page.waitForTimeout(300);

  const changed = await page.evaluate((items) => {
    const root = document.getElementById('conteudos');
    if (!root) return 0;
    const headings = [...root.querySelectorAll('h2,h3')].filter(el => {
      const t = (el.textContent || '').trim();
      return t && t !== 'Leituras essenciais' && !/Artigos mais recentes/i.test(t);
    }).slice(0, 4);

    function smallest(container, rx) {
      return [...container.querySelectorAll('*')].filter(el => rx.test((el.textContent || '').trim()) && ![...el.children].some(c => rx.test((c.textContent || '').trim())))[0];
    }

    headings.forEach((heading, i) => {
      const item = items[i];
      let card = heading.closest('article');
      if (!card) {
        let p = heading.parentElement;
        while (p && p !== root) {
          const txt = p.textContent || '';
          if (/Nível\s+[A-Z]|Revisado por:|\b0[1-4]\b/.test(txt)) { card = p; break; }
          p = p.parentElement;
        }
      }
      card = card || heading.parentElement;

      heading.textContent = item.title;
      const a = document.createElement('a');
      a.href = item.href;
      a.textContent = item.title;
      a.style.color = 'inherit';
      a.style.textDecoration = 'inherit';
      heading.textContent = '';
      heading.appendChild(a);

      const paragraphs = [...card.querySelectorAll('p')].filter(p => (p.textContent || '').trim().length > 45);
      if (paragraphs[0]) paragraphs[0].textContent = item.description;

      const evidence = smallest(card, /Nível\s+[A-Z]/i); if (evidence) evidence.style.display = 'none';
      const reviewer = smallest(card, /Revisado por:/i); if (reviewer) reviewer.style.display = 'none';
      const author = smallest(card, /Dra?\.|Dr\.|Clínica médica|Nutricionista|Fisioterapeuta/i); if (author) author.style.display = 'none';

      const date = smallest(card, /\d{1,2}\s+(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)\s+\d{4}/i);
      if (date && item.date) {
        const d = item.date.split('-');
        const months = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
        if (d.length === 3) date.textContent = `${Number(d[2])} ${months[Number(d[1])-1]} ${d[0]} • leitura`;
      }

      const badge = [...card.querySelectorAll('span,div')].filter(el => {
        const t=(el.textContent||'').trim();
        return t.length > 2 && t.length < 35 && t === t.toUpperCase() && !/^0[1-4]$/.test(t);
      })[0];
      if (badge) badge.textContent = item.category.toUpperCase();

      [...card.querySelectorAll('a')].forEach(link => { if (!link.href || link.getAttribute('href') === '#') link.href = item.href; });
    });
    root.setAttribute('data-vc-real','1');
    return headings.length;
  }, articles);

  if (changed !== 4) throw new Error(`Esperados 4 cards; foram atualizados ${changed}.`);

  let rendered = await page.content();
  await browser.close();

  // Impede o bundle React de reidratar a página no celular e recolocar os dados fictícios.
  rendered = rendered.replace(/<script\b[^>]*type=["']module["'][^>]*>[\s\S]*?<\/script>/gi, '');

  const badTitles = ['Saúde e prevenção: o que você precisa saber','O papel da alimentação na saúde de longo prazo'];
  if (badTitles.some(t => rendered.includes(t))) throw new Error('Ainda restaram títulos genéricos na home final.');
  if (!rendered.includes('data-vc-real="1"')) throw new Error('Marcador de artigos reais ausente na home final.');
  if (!rendered.includes('/conteudos/')) throw new Error('Links de artigos reais ausentes na home final.');

  fs.writeFileSync(file, rendered, 'utf8');
  console.log('Home preservada visualmente com 4 artigos reais; autores, revisores e níveis fictícios removidos.');
})();
