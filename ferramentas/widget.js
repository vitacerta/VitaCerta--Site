// VitaCerta - Aba Lateral Ferramentas v1
(function(){
  const tools = [
    { name: "Calculadora de IMC", desc: "Descubra seu índice", href: "./calculadora-imc.html", badge: "Grátis" },
    { name: "Proteína Real", desc: "Quanto tem de verdade", href: "./proteina-real.html", badge: "Novo" },
    { name: "Água Diária", desc: "Meta de hidratação", href: "./calculadora-agua.html", badge: "Em breve" },
    { name: "TMB e Calorias", desc: "Gasto basal", href: "./calculadora-tmb.html", badge: "Em breve" }
  ];

  const css = `
  #vc-tools-tab{position:fixed;right:0;top:50%;transform:translateY(-50%) rotate(-90deg);transform-origin:bottom right;z-index:99999;background:#0F1E33;color:#fff;padding:10px 18px 10px 18px;border-radius:8px 8px 0 0;font-family:Inter,sans-serif;font-weight:700;font-size:12px;letter-spacing:1.5px;cursor:pointer;box-shadow:0 4px 20px rgba(15,30,51,.25);transition:all .2s}
  #vc-tools-tab:hover{background:#111827;letter-spacing:1.8px}
  #vc-drawer{position:fixed;right:-380px;top:0;width:360px;max-width:85vw;height:100vh;z-index:100000;background:#F9F8F6;border-left:1px solid #E5E7EB;box-shadow:-10px 0 40px rgba(0,0,0,.12);transition:right .35s cubic-bezier(.4,0,.2,1);overflow-y:auto;font-family:Inter,sans-serif}
  #vc-drawer.open{right:0}
  #vc-drawer-overlay{position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:99999;display:none}
  #vc-drawer-overlay.open{display:block}
  #vc-drawer-head{padding:28px 24px 20px;border-bottom:1px solid #E5E7EB;background:#fff;position:sticky;top:0}
  #vc-drawer-head h3{margin:0;font-family:Instrument Serif,Georgia,serif;font-size:28px;color:#0F1E33;font-weight:400}
  #vc-drawer-head p{margin:8px 0 0;color:#6B7280;font-size:13px}
  #vc-drawer-close{position:absolute;right:20px;top:22px;background:#111827;color:#fff;border:none;width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:16px}
  #vc-tools-list{padding:16px}
  .vc-tool-card{display:block;text-decoration:none;background:#fff;border:1px solid #E5E7EB;border-radius:12px;padding:16px;margin-bottom:12px;transition:all .2s}
  .vc-tool-card:hover{border-color:#0F1E33;transform:translateY(-1px);box-shadow:0 4px 12px rgba(0,0,0,.06)}
  .vc-tool-card b{display:block;color:#0F1E33;font-size:15px;margin-bottom:4px}
  .vc-tool-card span{display:block;color:#6B7280;font-size:12.5px;line-height:1.4}
  .vc-badge{display:inline-block;background:#0F1E33;color:#fff;font-size:10px;padding:3px 8px;border-radius:99px;margin-left:8px;vertical-align:middle;letter-spacing:.5px}
  .vc-badge.new{background:#8FA394}
  `;
  const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

  const tab = document.createElement('div'); tab.id = 'vc-tools-tab'; tab.textContent = 'FERRAMENTAS';
  const overlay = document.createElement('div'); overlay.id = 'vc-drawer-overlay';
  const drawer = document.createElement('div'); drawer.id = 'vc-drawer';
  drawer.innerHTML = `
    <div id="vc-drawer-head">
      <button id="vc-drawer-close">✕</button>
      <h3>Ferramentas</h3>
      <p>Tiramos o errado. Escolha o seu certo.</p>
    </div>
    <div id="vc-tools-list">
      ${tools.map(t => `<a class="vc-tool-card" href="${t.href}"><b>${t.name} <span class="vc-badge ${t.badge==='Novo'?'new':''}">${t.badge}</span></b><span>${t.desc}</span></a>`).join('')}
      <div style="padding:20px 4px 10px;color:#9CA3AF;font-size:11px;text-align:center;letter-spacing:1px">VITACERTA • SAÚDE & BEM-ESTAR</div>
    </div>
  `;
  document.body.appendChild(tab); document.body.appendChild(overlay); document.body.appendChild(drawer);
  const open = ()=>{drawer.classList.add('open'); overlay.classList.add('open')};
  const close = ()=>{drawer.classList.remove('open'); overlay.classList.remove('open')};
  tab.onclick = open; overlay.onclick = close; drawer.querySelector('#vc-drawer-close').onclick = close;
})();
