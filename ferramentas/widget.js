// VitaCerta - Aba Lateral Ferramentas - FINAL
(function(){
  const tools = [
    { name: "Calculadora de IMC", desc: "Descubra seu índice", href: "./calculadora-imc.html", badge: "Grátis" },
    { name: "Proteína Real", desc: "Quanto tem de verdade", href: "./proteina-real.html", badge: "Novo" }
  ];
  const css = `#vc-tools-tab{position:fixed;right:0;top:50%;transform:translateY(-50%) rotate(-90deg);transform-origin:bottom right;z-index:99999;background:#0F1E33;color:#fff;padding:10px 18px;border-radius:8px 8px 0 0;font-family:sans-serif;font-weight:700;font-size:12px;letter-spacing:1.5px;cursor:pointer}#vc-drawer{position:fixed;right:-380px;top:0;width:360px;max-width:85vw;height:100vh;z-index:100000;background:#F9F8F6;border-left:1px solid #E5E7EB;transition:right .35s;overflow-y:auto}#vc-drawer.open{right:0}#vc-drawer-overlay{position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:99999;display:none}#vc-drawer-overlay.open{display:block}#vc-drawer-head{padding:28px 24px 20px;border-bottom:1px solid #E5E7EB;background:#fff;position:sticky;top:0}#vc-drawer-head h3{margin:0;font-size:28px;color:#0F1E33}#vc-drawer-head p{margin:8px 0 0;color:#6B7280;font-size:13px}#vc-drawer-close{position:absolute;right:20px;top:22px;background:#111827;color:#fff;border:none;width:32px;height:32px;border-radius:50%;cursor:pointer}#vc-tools-list{padding:16px}.vc-tool-card{display:block;text-decoration:none;background:#fff;border:1px solid #E5E7EB;border-radius:12px;padding:16px;margin-bottom:12px}.vc-tool-card b{display:block;color:#0F1E33;font-size:15px;margin-bottom:4px}.vc-tool-card span{display:block;color:#6B7280;font-size:12.5px}.vc-badge{display:inline-block;background:#0F1E33;color:#fff;font-size:10px;padding:3px 8px;border-radius:99px;margin-left:8px}`;
  const s=document.createElement('style');s.textContent=css;document.head.appendChild(s);
  const tab=document.createElement('div');tab.id='vc-tools-tab';tab.textContent='FERRAMENTAS';
  const overlay=document.createElement('div');overlay.id='vc-drawer-overlay';
  const drawer=document.createElement('div');drawer.id='vc-drawer';
  drawer.innerHTML=`<div id="vc-drawer-head"><button id="vc-drawer-close">✕</button><h3>Ferramentas</h3><p>Escolha o seu certo.</p></div><div id="vc-tools-list">${tools.map(t=>`<a class="vc-tool-card" href="${t.href}"><b>${t.name} <span class="vc-badge">${t.badge}</span></b><span>${t.desc}</span></a>`).join('')}</div>`;
  document.body.appendChild(tab);document.body.appendChild(overlay);document.body.appendChild(drawer);
  const open=()=>{drawer.classList.add('open');overlay.classList.add('open')};const close=()=>{drawer.classList.remove('open');overlay.classList.remove('open')};
  tab.onclick=open;overlay.onclick=close;drawer.querySelector('#vc-drawer-close').onclick=close;
})();
