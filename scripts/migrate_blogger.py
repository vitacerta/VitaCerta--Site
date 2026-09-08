#!/usr/bin/env python3
import html, re, urllib.request, xml.etree.ElementTree as ET
from pathlib import Path

FEED='https://vitacerta.blogspot.com/feeds/posts/default?alt=atom&max-results=500'
OUT=Path('conteudos')
NS={'a':'http://www.w3.org/2005/Atom'}

SECTIONS=['Saúde','Nutrição','Movimento','Mente','Longevidade']

def slugify(s):
    import unicodedata
    s=unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().lower()
    s=re.sub(r'[^a-z0-9]+','-',s).strip('-')
    return s[:90] or 'artigo'

def section(labels,title):
    x=(' '.join(labels+[title])).lower()
    mente=['sono','dormindo','ansiedade','depress','tdah','pânico','panico','estresse','procrastina','meditação','meditacao','saúde mental','saude mental','terapia','cérebro','cerebro','foco','mau humor']
    movimento=['atividade física','atividade fisica','exercício','exercicio','treino','caminh','corrida','movimento','academia','dança','danca','alongamento','passos por dia','bicicleta','tempo sentado']
    longevidade=['longevid','envelhe','autonomia','menopausa','depois dos 40','após os 40','apos os 40']
    nutricao=['nutri','alimenta','dieta','suplement','creatina','vitamina','proteína','proteina','whey','magnésio','magnesio','ômega-3','omega-3','ferro','zinco','marmita','açúcar','acucar','jejum','café da manhã','cafe da manha','frutas vermelhas','chá',' cha ','saciedade','fome']
    if any(k in x for k in mente): return 'Mente'
    if any(k in x for k in movimento): return 'Movimento'
    if any(k in x for k in longevidade): return 'Longevidade'
    if any(k in x for k in nutricao): return 'Nutrição'
    return 'Saúde'

def esc(s): return html.escape(s or '',quote=True)

def sec_id(sec):
    return {'Saúde':'saude','Nutrição':'nutricao','Movimento':'movimento','Mente':'mente','Longevidade':'longevidade'}[sec]

def page(title,body,sec,published,slug):
    desc=re.sub('<[^>]+>',' ',body)
    desc=re.sub(r'\s+',' ',html.unescape(desc)).strip()[:158]
    canonical=f'https://vitacerta.com.br/conteudos/{slug}/'
    return f'''<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{esc(title)} | VitaCerta</title><meta name="description" content="{esc(desc)}"><link rel="canonical" href="{canonical}"><style>body{{margin:0;font-family:Arial,Helvetica,sans-serif;color:#26332e;background:#f7f8f7;line-height:1.7}}header{{background:#173d32;color:white;padding:18px 5%}}header a{{color:white;text-decoration:none;font-weight:700;font-size:22px}}main{{max-width:820px;margin:36px auto;padding:0 20px 60px;background:white}}.meta{{color:#68746f;font-size:14px;padding-top:30px}}h1{{font-size:clamp(30px,5vw,48px);line-height:1.12;color:#173d32}}h2,h3{{color:#245746;line-height:1.25}}img{{max-width:100%;height:auto;border-radius:10px}}a{{color:#176b50}}blockquote{{border-left:4px solid #6b8f7e;margin:28px 0;padding:12px 20px;background:#f2f6f4}}footer{{max-width:820px;margin:0 auto 40px;padding:0 20px;color:#68746f;font-size:13px}}.article{{font-size:18px}}.article iframe{{max-width:100%}}</style></head><body><header><a href="/">VitaCerta</a></header><main><div class="meta">{esc(sec)} · {esc(published[:10])}</div><h1>{esc(title)}</h1><article class="article">{body}</article></main><footer>Conteúdo originalmente publicado no VitaCerta e migrado para o novo site.</footer></body></html>'''

def build_catalog(posts):
    cards=''.join(
        f'<article data-section="{sec_id(sec)}"><small>{esc(sec)} · {esc(pub[:10])}</small><h2><a href="/conteudos/{slug}/">{esc(title)}</a></h2></article>'
        for pub,title,slug,sec in posts
    )
    nav=''.join(f'<a href="#{sec_id(sec)}" data-filter="{sec_id(sec)}">{esc(sec)}</a>' for sec in SECTIONS)
    return f'''<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Conteúdos | VitaCerta</title><meta name="description" content="Conteúdos de saúde, nutrição, movimento, mente e longevidade do VitaCerta."><style>body{{font-family:Arial,Helvetica,sans-serif;margin:0;color:#26332e;background:#f7f8f7}}header{{background:#173d32;color:#fff;padding:24px 5%}}header a{{color:#fff;text-decoration:none}}main{{max-width:1000px;margin:40px auto;padding:0 20px}}h1{{font-size:42px;color:#173d32}}nav{{display:flex;gap:8px;flex-wrap:wrap;margin:22px 0}}nav a{{padding:8px 12px;border:1px solid #dbe4df;border-radius:999px;color:#245746;text-decoration:none;background:#fff}}nav a.active{{background:#173d32;color:#fff;border-color:#173d32}}article{{background:#fff;border:1px solid #e2e8e4;border-radius:12px;padding:20px;margin:14px 0}}article h2{{margin:8px 0;font-size:22px}}article a{{color:#245746;text-decoration:none}}small{{color:#68746f}}.hidden{{display:none}}</style></head><body><header><a href="/"><strong>VitaCerta</strong></a></header><main><h1>Conteúdos</h1><p>{len(posts)} artigos publicados no VitaCerta.</p><nav id="filters"><a href="#todos" data-filter="todos">Todos</a>{nav}</nav><div id="articles">{cards}</div></main><script>(function(){{function apply(){{var f=(location.hash||'#todos').slice(1);if(!['todos','saude','nutricao','movimento','mente','longevidade'].includes(f))f='todos';document.querySelectorAll('#articles article').forEach(function(a){{a.classList.toggle('hidden',f!=='todos'&&a.dataset.section!==f)}});document.querySelectorAll('#filters a').forEach(function(a){{a.classList.toggle('active',a.dataset.filter===f)}})}}window.addEventListener('hashchange',apply);apply()}})();</script></body></html>'''

def inject_home(posts):
    path=Path('index.html')
    if not path.exists(): return
    src=path.read_text(encoding='utf-8')
    marker='<!-- VC_ARTIGOS_HOME -->'
    if marker in src:
        src=src.split(marker)[0] + '</body></html>'
    latest=posts[:9]
    cards=''.join(
        f'<a class="vc-article-card" href="/conteudos/{slug}/"><span>{esc(sec)}</span><strong>{esc(title)}</strong><small>{esc(pub[:10])}</small></a>'
        for pub,title,slug,sec in latest
    )
    chips=''.join(f'<a href="/conteudos/#{sec_id(sec)}">{esc(sec)}</a>' for sec in SECTIONS)
    block=f'''{marker}<style>.vc-content-home{{font-family:Arial,Helvetica,sans-serif;background:#f7f8f7;color:#26332e;padding:56px 20px 64px;border-top:1px solid #e2e8e4}}.vc-content-wrap{{max-width:1180px;margin:0 auto}}.vc-content-kicker{{font-size:13px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#6b8f7e}}.vc-content-home h2{{font-size:clamp(30px,4vw,46px);line-height:1.12;margin:8px 0 10px;color:#173d32}}.vc-content-home p{{max-width:680px;color:#5f6f68;margin:0 0 22px;font-size:17px}}.vc-chips{{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 28px}}.vc-chips a{{text-decoration:none;color:#245746;background:#fff;border:1px solid #dbe4df;padding:8px 13px;border-radius:999px;font-size:14px}}.vc-grid{{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}}.vc-article-card{{display:flex;flex-direction:column;gap:9px;text-decoration:none;background:#fff;border:1px solid #e2e8e4;border-radius:16px;padding:20px;min-height:150px;transition:transform .18s ease,box-shadow .18s ease}}.vc-article-card:hover{{transform:translateY(-2px);box-shadow:0 10px 26px rgba(23,61,50,.08)}}.vc-article-card span{{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#6b8f7e}}.vc-article-card strong{{font-size:20px;line-height:1.25;color:#173d32}}.vc-article-card small{{margin-top:auto;color:#7a867f}}.vc-all{{display:inline-block;margin-top:24px;font-weight:700;color:#176b50;text-decoration:none}}@media(max-width:800px){{.vc-grid{{grid-template-columns:1fr}}.vc-content-home{{padding:42px 18px 50px}}}}</style><section class="vc-content-home" id="conteudos"><div class="vc-content-wrap"><div class="vc-content-kicker">Conteúdo VitaCerta</div><h2>Informação para escolhas mais conscientes.</h2><p>Explore os artigos mais recentes e navegue por Saúde, Nutrição, Movimento, Mente e Longevidade.</p><div class="vc-chips">{chips}</div><div class="vc-grid">{cards}</div><a class="vc-all" href="/conteudos/">Ver todos os conteúdos →</a></div></section><script>(function(){{function addNav(){{var nav=document.querySelector('header nav, nav');if(!nav||nav.querySelector('[data-vc-conteudos]'))return;var a=document.createElement('a');a.href='/conteudos/';a.textContent='Conteúdos';a.setAttribute('data-vc-conteudos','1');a.style.whiteSpace='nowrap';nav.appendChild(a)}}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',addNav);else addNav()}})();</script>'''
    if '</body>' in src:
        src=src.replace('</body>',block+'</body>',1)
    else:
        src+=block
    path.write_text(src,encoding='utf-8')

def main():
    req=urllib.request.Request(FEED,headers={'User-Agent':'VitaCerta-Migrator/1.2'})
    raw=urllib.request.urlopen(req,timeout=30).read()
    root=ET.fromstring(raw)
    OUT.mkdir(exist_ok=True)
    seen=set(); posts=[]
    for e in root.findall('a:entry',NS):
        title=(e.findtext('a:title',default='',namespaces=NS) or '').strip()
        body=(e.findtext('a:content',default='',namespaces=NS) or '').strip()
        if not title or not body: continue
        cats=[c.attrib.get('term','') for c in e.findall('a:category',NS)]
        kind=[c for c in cats if c.startswith('http://schemas.google.com/blogger/2008/kind#')]
        if kind and not any(c.endswith('#post') for c in kind): continue
        key=re.sub(r'\s+',' ',title).casefold()
        if key in seen: continue
        seen.add(key)
        labels=[c for c in cats if not c.startswith('http://schemas.google.com/')]
        pub=e.findtext('a:published',default='',namespaces=NS) or ''
        slug=slugify(title); sec=section(labels,title)
        d=OUT/slug; d.mkdir(parents=True,exist_ok=True)
        (d/'index.html').write_text(page(title,body,sec,pub,slug),encoding='utf-8')
        posts.append((pub,title,slug,sec))
    posts.sort(reverse=True)
    (OUT/'index.html').write_text(build_catalog(posts),encoding='utf-8')
    inject_home(posts)
    urls=''.join(f'<url><loc>https://vitacerta.com.br/conteudos/{slug}/</loc></url>' for _,_,slug,_ in posts)
    Path('sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://vitacerta.com.br/</loc></url><url><loc>https://vitacerta.com.br/conteudos/</loc></url>'+urls+'</urlset>',encoding='utf-8')
    print(f'Publicados {len(posts)} artigos e integrada a home.')

if __name__=='__main__': main()
