const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const file = path.resolve('index.html');
  let source = fs.readFileSync(file, 'utf8');

  // Corrige metadados básicos antes da renderização.
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
  await page.waitForTimeout(1200);

  // Mantém o HTML já renderizado no arquivo entregue ao crawler, sem remover
  // o JavaScript original: o comportamento visual/interativo continua igual.
  const rendered = await page.content();
  await browser.close();

  if (!rendered.includes('id="root"') || rendered.includes('<div id="root"></div>')) {
    throw new Error('Prerenderização falhou: #root continuou vazio.');
  }
  fs.writeFileSync(file, rendered, 'utf8');
  console.log('Home prerenderizada: conteúdo React agora existe no HTML inicial.');
})();
