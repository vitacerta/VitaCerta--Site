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
    # O título define o assunto principal. Labels antigos do Blogger servem apenas como apoio.
    t=title.lower()
    x=(' '.join(labels+[title])).lower()

    # Regras editoriais explícitas para temas que estavam sendo desviados por labels antigos.
    if 'creatina' in t: return 'Nutrição'
    if 'pernas' in t and ('pesad' in t or 'circula' in t): return 'Saúde'

    mente=['sono','dormindo','ansiedade','depress','tdah','pânico','panico','estresse','procrastina','meditação','meditacao','saúde mental','saude mental','terapia','cérebro','cerebro','foco','mau humor']
    movimento=['atividade física','atividade fisica','exercício','exercicio','treino','caminh','corrida','movimento','academia','dança','danca','alongamento','passos por dia','bicicleta','tempo sentado']
    longevidade=['longevid','envelhe','autonomia','menopausa','depois dos 40','após os 40','apos os 40']
    nutricao=['nutri','alimenta','dieta','suplement','creatina','vitamina','proteína','proteina','whey','magnésio','magnesio','ômega-3','omega-3','ferro','zinco','marmita','açúcar','acucar','jejum','café da manhã','cafe da manha','frutas vermelhas','chá',' cha ','saciedade','fome']

    # Primeiro classifica pelo título, evitando que uma categoria histórica irrelevante domine o artigo.
    for sec,terms in [('Mente',mente),('Nutrição',nutricao),('Movimento',movimento),('Longevidade',longevidade)]:
        if any(k in t for k in terms): return sec
    # Labels entram apenas como fallback quando o título não resolve.
    for sec,terms in [('Mente',mente),('Nutrição',nutricao),('Movimento',movimento),('Longevidade',longevidade)]:
        if any(k in x for k in terms): return sec
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
    cards=''.join(f'<article data-section="{sec_id(sec)}"><small>{esc(sec)} · {esc(pub[:10])}</small><h2><a href="/conteudos/{slug}/">{esc(title)}</a></h2></article>' for pub,title,slug,sec in posts)
    nav=''.join(f'<a href="#{sec_id(sec)}" data-filter="{sec_id(sec)}">{esc(sec)}</a>' for sec in SECTIONS)
    return f'''<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Conteúdos | VitaCerta</title><meta name="description" content="Conteúdos de saúde, nutrição, movimento, mente e longevidade do VitaCerta."><style>body{{font-family:Arial,Helvetica,sans-serif;margin:0;color:#26332e;background:#f7f8f7}}header{{background:#173d32;color:#fff;padding:24px 5%}}header a{{color:#fff;text-decoration:none}}main{{max-width:1000px;margin:40px auto;padding:0 20px}}h1{{font-size:42px;color:#173d32}}nav{{display:flex;gap:8px;flex-wrap:wrap;margin:22px 0}}nav a{{padding:8px 12px;border:1px solid #dbe4df;border-radius:999px;color:#245746;text-decoration:none;background:#fff}}nav a.active{{background:#173d32;color:#fff;border-color:#173d32}}article{{background:#fff;border:1px solid #e2e8e4;border-radius:12px;padding:20px;margin:14px 0}}article h2{{margin:8px 0;font-size:22px}}article a{{color:#245746;text-decoration:none}}small{{color:#68746f}}.hidden{{display:none}}</style></head><body><header><a href="/"><strong>VitaCerta</strong></a></header><main><h1>Conteúdos</h1><p>{len(posts)} artigos publicados no VitaCerta.</p><nav id="filters"><a href="#todos" data-filter="todos">Todos</a>{nav}</nav><div id="articles">{cards}</div></main><script>(function(){{function apply(){{var f=(location.hash||'#todos').slice(1);if(!['todos','saude','nutricao','movimento','mente','longevidade'].includes(f))f='todos';document.querySelectorAll('#articles article').forEach(function(a){{a.classList.toggle('hidden',f!=='todos'&&a.dataset.section!==f)}});document.querySelectorAll('#filters a').forEach(function(a){{a.classList.toggle('active',a.dataset.filter===f)}})}}window.addEventListener('hashchange',apply);apply()}})();</script></body></html>'''

def inject_home(posts):
    path=Path('index.html')
    if not path.exists(): return
    src=path.read_text(encoding='utf-8')
    marker='<!-- VC_ARTIGOS_HOME -->'
    if marker in src:
        src=src.split(marker)[0] + '</body></html>'

    latest=posts[:8]
    rows=''.join(
        f'''<article class="vc-row"><div class="vc-num">{i:02d}</div><div><div class="vc-meta"><span class="vc-tag">{esc(sec)}</span><span>{esc(pub[:10])}</span></div><h3><a href="/conteudos/{slug}/">{esc(title)}</a></h3><a class="vc-read" href="/conteudos/{slug}/">Ler artigo →</a></div></article>'''
        for i,(pub,title,slug,sec) in enumerate(latest,1)
    )
    chips=''.join(f'<a href="/conteudos/#{sec_id(sec)}">{esc(sec)}</a>' for sec in SECTIONS)
    home=f'''<div class="vc-home-head"><div><span class="vc-kicker">Conteúdo VitaCerta</span><h2>Artigos mais recentes</h2></div><a class="vc-all-top" href="/conteudos/">Ver todos os artigos →</a></div><div class="vc-chips">{chips}</div><div class="vc-list">{rows}</div>'''

    patch=f'''{marker}<style>
#conteudos{{display:block!important;max-width:1240px!important;margin-left:auto!important;margin-right:auto!important;padding:40px 20px 56px!important}}
.vc-home-head{{display:flex;align-items:end;justify-content:space-between;gap:20px;padding-bottom:16px;border-bottom:1px solid #E7E5E4}}
.vc-kicker{{font-family:Inter,sans-serif;font-size:11px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#78716C}}
.vc-home-head h2{{font-family:'Cormorant Garamond',serif;font-size:30px;line-height:1.05;margin:5px 0 0;color:#0F172A}}
.vc-all-top,.vc-read{{font-family:Inter,sans-serif;color:#0F172A;text-decoration:underline;text-decoration-color:#8A9A8E;text-underline-offset:4px}}
.vc-all-top{{font-size:13px;white-space:nowrap}}
.vc-chips{{display:flex;flex-wrap:wrap;gap:8px;margin:20px 0 8px}}
.vc-chips a{{font-family:Inter,sans-serif;font-size:12px;text-decoration:none;color:#44403C;background:#fff;border:1px solid #E7E5E4;border-radius:999px;padding:7px 11px}}
.vc-list{{border-top:1px solid #E7E5E4}}
.vc-row{{display:grid;grid-template-columns:48px 1fr;gap:20px;padding:24px 0;border-bottom:1px solid #E7E5E4}}
.vc-num{{font-family:'Cormorant Garamond',serif;font-weight:700;font-size:28px;color:#D6D3D1}}
.vc-meta{{display:flex;flex-wrap:wrap;align-items:center;gap:9px;font-family:Inter,sans-serif;font-size:11px;color:#78716C;margin-bottom:8px}}
.vc-tag{{background:#0F172A;color:#fff;border-radius:999px;padding:4px 8px;font-weight:600;letter-spacing:.08em;text-transform:uppercase}}
.vc-row h3{{font-family:'Cormorant Garamond',serif;font-size:24px;line-height:1.15;margin:0 0 10px;color:#0F172A}}
.vc-row h3 a{{color:inherit;text-decoration:none}}
.vc-row h3 a:hover{{text-decoration:underline;text-decoration-color:#8A9A8E;text-underline-offset:5px}}
.vc-read{{font-size:12px}}
@media(max-width:700px){{.vc-home-head{{align-items:start;flex-direction:column}}.vc-row{{grid-template-columns:38px 1fr;gap:10px}}.vc-row h3{{font-size:21px}}}}
</style><script>(function(){{
var html={home!r};
var tries=0;
function patchHome(){{
  var main=document.getElementById('conteudos');
  if(!main){{if(tries++<80)setTimeout(patchHome,50);return;}}
  main.innerHTML=html;
  main.setAttribute('data-vc-live','1');
  var map={{'Saúde':'saude','Nutrição':'nutricao','Movimento':'movimento','Mente':'mente','Longevidade':'longevidade'}};
  document.querySelectorAll('a[href="#conteudos"]').forEach(function(a){{
    var t=(a.textContent||'').trim();
    a.href=map[t]?'/conteudos/#'+map[t]:'/conteudos/';
  }});
}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',patchHome);else patchHome();
}})();</script>'''
    if '</body>' in src:
        src=src.replace('</body>',patch+'</body>',1)
    else:
        src+=patch
    path.write_text(src,encoding='utf-8')

def main():
    req=urllib.request.Request(FEED,headers={'User-Agent':'VitaCerta-Migrator/1.4'})
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
    print(f'Publicados {len(posts)} artigos e integrada a home sem alterar o layout-base.')

if __name__=='__main__': main()
