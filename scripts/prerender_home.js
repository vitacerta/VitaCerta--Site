const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const file = path.resolve('index.html');
  let source = fs.readFileSync(file, 'utf8');

  source = source.replace('<html lang="en">', '<html lang="pt-BR">');
  source = source.replace('<title>React Artifact</title>', '<title>VitaCerta | Saúde, Nutrição, Movimento, Mente e Longevidade</title>');
  if (!/name=["']description["']/i.test(source)) {
    source = source.replace('</head>', '<meta name="description" content="Informação clara e confiável sobre saúde, nutrição, movimento, mente e longevidade para escolhas melhores no dia a dia."><link rel="canonical" href="https://vitacerta.com.br/">\n</head>');
  }
  fs.writeFileSync(file, source, 'utf8');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  await page.goto('file://' + file, { waitUntil: 'load' });
  await page.waitForSelector('#root > *', { timeout: 15000 });

  // O migrador injeta os artigos reais depois que o React monta a home.
  // Esperamos explicitamente essa substituição antes de salvar o HTML final,
  // evitando gravar novamente os cards genéricos do template.
  try {
    await page.waitForSelector('#conteudos[data-vc-live="1"]', { timeout: 10000 });
  } catch (e) {
    throw new Error('Artigos reais não foram aplicados à home antes da prerenderização.');
  }
  await page.waitForTimeout(300);

  const badTitles = [
    'Saúde e prevenção: o que você precisa saber',
    'O papel da alimentação na saúde de longo prazo'
  ];
  const bodyText = await page.locator('body').innerText();
  if (badTitles.some(t => bodyText.includes(t))) {
    throw new Error('A home ainda contém cards genéricos do template.');
  }

  const realLinks = await page.locator('#conteudos a[href^="/conteudos/"]').count();
  if (realLinks < 1) {
    throw new Error('A home não contém links para artigos reais.');
  }

  const rendered = await page.content();
  await browser.close();

  if (!rendered.includes('id="root"') || rendered.includes('<div id="root"></div>')) {
    throw new Error('Prerenderização falhou: #root continuou vazio.');
  }
  fs.writeFileSync(file, rendered, 'utf8');
  console.log(`Home prerenderizada com ${realLinks} links de conteúdo real e sem cards genéricos.`);
})();
