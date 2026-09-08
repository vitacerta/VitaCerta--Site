#!/usr/bin/env python3
from pathlib import Path

p = Path('index.html')
if not p.exists():
    raise SystemExit('index.html não encontrado')

src = p.read_text(encoding='utf-8')
marker = '<!-- VC_FOOTER_LINKS -->'
if marker in src:
    src = src.split(marker)[0] + '</body></html>'

patch = r'''<!-- VC_FOOTER_LINKS -->
<script>
(function(){
  var routes = {
    'Sobre':'/sobre/',
    'Sobre o VitaCerta':'/sobre/',
    'Contato':'/contato/',
    'Política de Privacidade':'/politica-de-privacidade/',
    'Termo de Uso':'/termos-de-uso/',
    'Termos de Uso':'/termos-de-uso/'
  };
  function linkFooter(){
    var footer=document.querySelector('footer');
    if(!footer){setTimeout(linkFooter,100);return;}
    footer.querySelectorAll('button,a').forEach(function(el){
      var text=(el.textContent||'').trim();
      var href=routes[text];
      if(!href)return;
      if(el.tagName==='A'){
        el.href=href;
        return;
      }
      var a=document.createElement('a');
      a.href=href;
      a.className=el.className;
      a.textContent=text;
      el.replaceWith(a);
    });
    var holder=footer.querySelector('.vc-legal-links');
    if(!holder){
      holder=document.createElement('div');
      holder.className='vc-legal-links';
      holder.style.cssText='margin-top:18px;display:flex;flex-wrap:wrap;justify-content:center;gap:18px;font-family:Inter,sans-serif;font-size:12px;color:#57534E';
      holder.innerHTML='<a href="/termos-de-uso/">Termos de Uso</a><a href="/politica-de-privacidade/">Política de Privacidade</a><a href="/sobre/">Sobre o VitaCerta</a><a href="/contato/">Contato</a>';
      var inner=footer.querySelector('.flex.flex-col.items-center') || footer.firstElementChild || footer;
      inner.appendChild(holder);
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',linkFooter);else linkFooter();
})();
</script>'''

src = src.replace('</body>', patch + '</body>', 1) if '</body>' in src else src + patch
p.write_text(src, encoding='utf-8')
print('Links institucionais conectados ao rodapé.')
