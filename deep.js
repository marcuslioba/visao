/* Vision Bank - profundidade: cartao, emprestimo, seguros, global, investimentos, Pix, documentos, tema */
const ESC=s=>String(s).replace(/'/g,"\\'");
function fsPage(title,body,back){$('fs').innerHTML=fsHead(title,back)+'<div class="fsb">'+body+'</div>';$('fs').classList.add('on');$('fs').querySelector('.fsb').scrollTop=0}
const row=(ic,t,sub,on)=>`<button class="lb" onclick="${on}"><span class="ti">${ic}</span><span>${t}${sub?`<small class="mut" style="display:block;font-size:12.5px;margin-top:2px">${sub}</small>`:''}</span><em>›</em></button>`;
const kv=(a,b)=>`<div><span>${a}</span><b>${b}</b></div>`;
const pmt=(v,i,n)=>v*i/(1-Math.pow(1+i,-n));
const pct=v=>v.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})+'%';
const addMine=o=>{const m=LS.get('vb_mine',[]);m.push(Object.assign({d:Date.now()},o));LS.set('vb_mine',m)};
const CARD_BASE=renderCard;
renderCard=function(){CARD_BASE();const e=$('cLimT');if(e)e.textContent=brl(LIMIT);const p=document.querySelector('#s-card .pillb');if(p)p.textContent='Acessar opções'};
/* ---------- cartao ---------- */
function openVirtual(){
  askPin({desc:'Ver cartão virtual',amount:0,silent:1,apply:()=>{},after:()=>{closeM();showVirtual()}});
}
function showVirtual(){
  const seed=LS.get('vb_vseed',0);const h=hashStr('virt'+seed+NAME);
  const num='5412 7544 9021 '+String(1000+h%9000),cvv=String(100+(h>>>4)%900);
  fsPage('Cartão virtual',`<div class="cc" style="min-width:0;height:auto;margin:14px 0;padding:20px;display:block"><div class="row"><b style="letter-spacing:2px">VISION</b><span class="mut">virtual</span></div><div style="letter-spacing:3px;font-size:20px;margin:26px 0 16px">${num}</div><div class="row" style="font-size:13px"><span>${NAME.toUpperCase()}</span><span>12/29 • CVV <b>${cvv}</b></span></div></div><p class="mut" style="font-size:13px;margin-bottom:6px">Use em compras online. Ele tem o mesmo limite do cartão físico e pode ser trocado quando quiser.</p><button class="btn" onclick="try{navigator.clipboard.writeText('${num.replace(/ /g,'')}')}catch(e){};toast('Número copiado')">Copiar número</button><button class="btn g" onclick="LS.set('vb_vseed',${seed}+1);showVirtual();toast('Novo cartão virtual gerado')">Gerar novo cartão virtual</button>`);
}
function openLimit(){
  const used=H.cyc+H.closed,min=Math.max(5000,Math.ceil(used/1000)*1000);
  fsPage('Limite do cartão',`<div class="amt s" id="lmV">${brl(LIMIT)}</div><p class="mut" style="text-align:center">Limite total do cartão de crédito</p><input type="range" id="lmR" min="${min}" max="300000" step="1000" value="${Math.max(min,LIMIT)}" style="width:100%;margin:22px 0;accent-color:#2fd39a"><div class="box cf"><div><span>Em uso</span><b>${brl(used)}</b></div><div><span>Disponível</span><b id="lmA">${brl(LIMIT-used)}</b></div><div><span>Limite máximo pré-aprovado</span><b>R$ 300.000,00</b></div></div><button class="btn" id="lmS">Salvar novo limite</button>`);
  $('lmR').oninput=()=>{const v=+$('lmR').value;$('lmV').textContent=brl(v);$('lmA').textContent=brl(v-used)};
  $('lmS').onclick=()=>{const v=+$('lmR').value;askPin({desc:'Novo limite do cartão',amount:v,okTitle:'Limite atualizado',apply:()=>{LIMIT=v;LS.set('vb_limit',v)}})};
}
function openParcelar(){
  if(!(H.closed>0)){fsPage('Parcelar fatura',`<div style="text-align:center;padding:50px 10px"><div style="font-size:44px">🗓️</div><h3 style="margin:14px 0 8px">Sua fatura ainda está aberta</h3><p class="mut">Você pode parcelar depois que ela fechar, no dia ${VB.CLOSE_DAY}, até o vencimento no dia ${VB.DUE_DAY}.</p></div>`);return}
  const f=H.closed,ent=+(f*0.2).toFixed(2),rest=f-ent,i=0.0449;
  fsPage('Parcelar fatura',`<div class="big2" style="padding:14px 0"><small>Fatura fechada</small><b>${brl(f)}</b></div><p class="mut" style="margin-bottom:8px">Entrada de 20% (${brl(ent)}) agora e o restante parcelado, com juros de ${pct(i*100)} ao mês.</p>${[2,3,4,6,8,10,12].map(n=>{const p=pmt(rest,i,n);return `<button class="lb" onclick="doParcelar(${n},${p.toFixed(2)},${ent})"><span class="ti">${n}x</span><span>${n}x de ${brl(p)}<small class="mut" style="display:block;font-size:12.5px">Total ${brl(p*n+ent)}</small></span><em>›</em></button>`}).join('')}`);
}
function doParcelar(n,p,ent){
  const ym=ymd(new Date()).slice(0,7);
  askPin({desc:'Entrada do parcelamento ('+n+'x de '+brl(p)+')',amount:ent,okTitle:'Fatura parcelada',apply:()=>{closeFs();const s=LS.get('vb_fpaid',{});s[ym]=true;LS.set('vb_fpaid',s);addMine({name:'Pagamento • Entrada Parcelamento Fatura',ic:'💳',v:-ent,c:'Cartão',kind:'pay',m:'fatura'})}});
}
function openPoints(){
  const pts=LS.get('vb_pts',184320);
  fsPage('Pontos Loop',`<div class="big2" style="padding:14px 0"><small>Pontos disponíveis</small><b>${pts.toLocaleString('pt-BR')}</b><div class="mut" style="margin-top:6px">Você soma 2 pontos por dólar gasto</div></div>${row('✈️','Converter em milhas','LATAM Pass • 1 ponto = 1 milha',"redeem(50000,'50.000 milhas LATAM Pass')")}${row('💳','Desconto na fatura','100.000 pontos = R$ 700,00',"redeem(100000,'R$ 700,00 de desconto na fatura')")}${row('🎁','Cashback na conta','50.000 pontos = R$ 300,00',"redeem(50000,'R$ 300,00 em cashback')")}<p class="mut" style="font-size:12.5px;margin-top:14px">Os pontos não expiram enquanto o cartão estiver ativo.</p>`);
}
function redeem(n,what){
  const pts=LS.get('vb_pts',184320);if(pts<n){toast('Pontos insuficientes');return}
  askPin({desc:'Resgatar '+what,amount:0,silent:1,apply:()=>{LS.set('vb_pts',pts-n);if(/cashback/.test(what))addMine({name:'Cashback • Pontos Loop',ic:'🎁',v:300,c:'Renda',m:'in'})},after:null,okTitle:'Resgate realizado'});
}
/* ---------- emprestimo ---------- */
let LN={n:36};
function openLoan(){
  fsPage('Empréstimo',`<div class="promo" style="margin:10px 0 16px;cursor:default"><div><small>Pré-aprovado para você</small><b>Até R$ 450.000,00</b><span>Taxa a partir de 1,49% ao mês</span></div></div>${moneyInput('lnV')}<p class="mut" style="margin:6px 0 4px">Em quantas parcelas?</p><div class="chips" id="lnN" style="padding:0 0 14px">${[12,24,36,48,60].map(n=>`<button data-n="${n}" class="${n===LN.n?'on':''}">${n}x</button>`).join('')}</div><div class="box cf" id="lnR"></div><button class="btn" id="lnB">Contratar</button>`);
  const calc=()=>{const v=val('lnV'),i=0.0149,n=LN.n;const p=v?pmt(v,i,n):0;$('lnR').innerHTML=kv('Valor das parcelas',v?n+'x de '+brl(p):'—')+kv('Total a pagar',v?brl(p*n):'—')+kv('Taxa de juros','1,49% a.m. • 19,41% a.a.')+kv('CET','1,63% a.m.')+kv('Primeiro vencimento','em 30 dias')};
  $('lnV').addEventListener('input',calc);calc();
  $('lnN').onclick=e=>{if(e.target.dataset.n){LN.n=+e.target.dataset.n;document.querySelectorAll('#lnN button').forEach(b=>b.classList.toggle('on',b===e.target));calc()}};
  $('lnB').onclick=()=>{const v=val('lnV');if(!v){toast('Informe o valor');return}if(v>450000){toast('Acima do limite pré-aprovado');return}
    askPin({desc:'Contratação de empréstimo',amount:v,okTitle:'Proposta enviada',apply:()=>{closeFs();toast('Análise em até 1 dia útil')}})};
}
/* ---------- seguros ---------- */
const SEG=[['🛡️','Seguro de vida','Cobertura R$ 1.500.000',189.9,'mensal',[['Morte','R$ 1.500.000,00'],['Invalidez permanente','R$ 1.500.000,00'],['Doenças graves','R$ 300.000,00'],['Vigência','até 12/2027']]],['🚙','Seguro auto • Toyota','Cobertura compreensiva',3280,'anual',[['Casco','100% da tabela FIPE'],['Terceiros','R$ 500.000,00'],['Assistência 24h','Guincho ilimitado até 400 km'],['Vigência','até 03/2027']]],['🏠','Seguro residencial','Cobertura R$ 900.000',79.9,'mensal',[['Incêndio e explosão','R$ 900.000,00'],['Roubo e furto','R$ 60.000,00'],['Danos elétricos','R$ 30.000,00'],['Vigência','até 08/2027']]],['🔐','Seguro Pix','Proteção contra golpes',9.9,'mensal',[['Cobertura','até R$ 20.000,00 por evento'],['Vigência','renovação automática']]]];
function openSeguros(){
  const m=SEG.reduce((s,x)=>s+(x[4]==='anual'?x[3]/12:x[3]),0);
  fsPage('Seguros',`<div class="big2" style="padding:12px 0"><small>Investimento mensal em seguros</small><b>${brl(m)}</b></div>${SEG.map((x,i)=>row(x[0],x[1],x[2]+' • '+brl(x[3])+(x[4]==='anual'?'/ano':'/mês'),'segDet('+i+')')).join('')}`);
}
function segDet(i){
  const x=SEG[i];
  fsPage(x[1],`<div class="rc"><div class="rcs in" style="font-size:26px">${x[0]}</div><small>Apólice ativa</small><b>${brl(x[3])}</b><small>${x[4]==='anual'?'por ano':'por mês'}</small></div><div class="rcl">${x[5].map(r=>kv(r[0],r[1])).join('')}${kv('Número da apólice','VS-'+(100000+hashStr(x[1])%900000))}</div><button class="btn" onclick="openHelp()">Acionar seguro</button><button class="btn g" onclick="openSeguros()">Voltar</button>`,'openSeguros()');
}
/* ---------- conta global (US$) ---------- */
let FX=LS.get('vb_fx',{usd:5.42,eur:5.95,btc:520000,usdp:0.2,eurp:-0.1,btcp:1.1,t:0});
async function loadFx(){
  try{
    const r=await fetch('https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,BTC-BRL',{cache:'no-store'});const j=await r.json();
    FX={usd:+j.USDBRL.bid,eur:+j.EURBRL.bid,btc:+j.BTCBRL.bid,usdp:+j.USDBRL.pctChange,eurp:+j.EURBRL.pctChange,btcp:+j.BTCBRL.pctChange,t:Date.now()};LS.set('vb_fx',FX);renderMkt();
  }catch(e){renderMkt()}
}
function renderMkt(){
  const e=$('mkt');if(!e)return;
  const c=(n,v,p,d)=>`<div class="mk"><small>${n}</small><b>${v.toLocaleString('pt-BR',{minimumFractionDigits:d,maximumFractionDigits:d})}</b><em class="${p<0?'neg':''}">${p>=0?'▲':'▼'} ${Math.abs(p).toFixed(2).replace('.',',')}%</em></div>`;
  e.innerHTML=c('Dólar',FX.usd,FX.usdp,2)+c('Euro',FX.eur,FX.eurp,2)+c('Bitcoin',FX.btc,FX.btcp,0);
}
function openGlobal(){
  const usd=LS.get('vb_usd',18420);const buy=FX.usd*1.012;
  fsPage('Conta Global',`<div class="big2" style="padding:12px 0"><small>Saldo em dólares</small><b>${hidden?'US$ ••••':'US$ '+usd.toLocaleString('en-US',{minimumFractionDigits:2})}</b><div class="mut" style="margin-top:6px">≈ ${M(usd*FX.usd)} • cotação ${brl(FX.usd)}</div></div><div class="box cf"><div><span>Cotação de compra (com spread)</span><b>${brl(buy)}</b></div><div><span>IOF</span><b>1,10%</b></div></div><h3 style="margin:14px 0 6px">Comprar dólar</h3>${moneyInput('gbV')}<p class="mut" id="gbR" style="margin:0 0 8px">Você recebe US$ 0,00</p><button class="btn" id="gbB">Comprar dólar</button><button class="btn g" onclick="openGlobalCard()">Cartão internacional</button>`);
  $('gbV').addEventListener('input',()=>{const v=val('gbV');$('gbR').textContent='Você recebe US$ '+(v/(buy*1.011)).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})});
  $('gbB').onclick=()=>{const v=val('gbV');if(!v){toast('Informe o valor');return}if(v>H.bal){toast('Saldo insuficiente');return}
    const got=+(v/(buy*1.011)).toFixed(2);
    askPin({desc:'Compra de US$ '+got.toLocaleString('en-US'),amount:v,okTitle:'Dólar comprado',apply:()=>{LS.set('vb_usd',usd+got);addMine({name:'Câmbio • Compra de US$ '+got.toLocaleString('en-US'),ic:'💵',v:-v,c:'Câmbio',m:'out'});closeFs()}})};
}
function openGlobalCard(){fsPage('Cartão internacional',`<div class="cc" style="min-width:0;height:auto;margin:14px 0;padding:20px;display:block"><div class="row"><b style="letter-spacing:2px">VISION GLOBAL</b><span>débito US$</span></div><div style="letter-spacing:3px;font-size:19px;margin:26px 0 14px">•••• •••• •••• 7730</div><div class="row" style="font-size:13px"><span>${NAME.toUpperCase()}</span><span>12/30</span></div></div><p class="mut" style="font-size:13px">Compras no exterior são debitadas do seu saldo em dólar, sem IOF.</p><button class="btn g" onclick="openGlobal()">Voltar</button>`,'openGlobal()')}
/* ---------- investimentos: detalhe ---------- */
const INV_INFO=[['Renda fixa','Liquidez diária','110% do CDI','Tabela regressiva'],['Renda fixa','Em 2035','IPCA + 6,2% a.a.','Tabela regressiva'],['Renda fixa','Em 2028','96% do CDI','Isento'],['Fundos','D+3','CDI + 1,8%','Come-cotas'],['Renda variável','D+2','Carteira diversificada','15% sobre o lucro']];
function openAsset(i){
  const b=INV[i],info=INV_INFO[i],r=mulberry32(hashStr('ch'+i)),invx=LS.get('vb_invx',[0,0,0,0,0]);
  const cur=b[2]+(i===0?LS.get('vb_inv',0):0)+(invx[i]||0);
  const n=90;let v=cur*0.93,pts=[];for(let k=0;k<n;k++){v*=1+(r()-.42)*b[3]*4+0.0009;pts.push(v)}
  const sc=cur/pts[n-1];const ser=pts.map(x=>x*sc);const lo=Math.min(...ser),hi=Math.max(...ser),W=340,Hh=120;
  const pa=ser.map((x,k)=>(k?'L':'M')+(k/(n-1)*W).toFixed(1)+' '+(Hh-(x-lo)/((hi-lo)||1)*(Hh-14)-7).toFixed(1)).join(' ');
  const m1=(ser[n-1]/ser[n-31]-1)*100,m12=11+r()*5;
  fsPage(b[0],`<div class="big2" style="padding:12px 0"><small>${info[0]}</small><b>${M(cur)}</b><div class="dv" style="margin-top:4px">▲ ${pct(m1)} em 30 dias</div></div><div class="box" style="padding:14px"><svg class="ev" viewBox="0 0 ${W} ${Hh}" style="display:block;width:100%;height:130px"><defs><linearGradient id="gB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2fd39a" stop-opacity=".28"/><stop offset="1" stop-color="#2fd39a" stop-opacity="0"/></linearGradient></defs><path d="${pa} L${W} ${Hh} L0 ${Hh} Z" fill="url(#gB)"/><path d="${pa}" fill="none" stroke="#2fd39a" stroke-width="2" vector-effect="non-scaling-stroke"/></svg><div class="row" style="margin-top:6px"><span class="mut">90 dias</span><span class="mut">Rentab. 12m ${pct(m12)}</span></div></div><div class="box cf" style="margin-top:14px">${kv('Taxa',info[2])}${kv('Liquidez',info[1])}${kv('Imposto de renda',info[3])}${kv('Posição',M(cur))}</div><button class="btn" onclick="assetMove(${i},1)">Aplicar</button><button class="btn g" onclick="assetMove(${i},0)">Resgatar</button>`);
}
function assetMove(i,ap){
  const b=INV[i];
  openM(`<h3>${ap?'Aplicar em':'Resgatar de'} ${b[0]}</h3><p class="mut">Informe o valor</p>${moneyInput('amV')}<button class="btn" id="amB">${ap?'Aplicar':'Resgatar'}</button><button class="btn g" onclick="closeM()">Cancelar</button>`);
  $('amB').onclick=()=>{
    const v=val('amV');if(!v){toast('Informe o valor');return}
    const invx=LS.get('vb_invx',[0,0,0,0,0]);const pos=b[2]+(i===0?LS.get('vb_inv',0):0)+(invx[i]||0);
    if(ap&&v>H.bal){toast('Saldo insuficiente');return}if(!ap&&v>pos){toast('Acima do valor investido');return}
    askPin({desc:(ap?'Aplicação em ':'Resgate de ')+b[0],amount:v,okTitle:ap?'Aplicação realizada':'Resgate realizado',apply:()=>{
      invx[i]=(invx[i]||0)+(ap?v:-v);LS.set('vb_invx',invx);
      addMine({name:(ap?'Aplicação • ':'Resgate • ')+b[0],ic:'📈',v:ap?-v:v,c:'Investimentos',m:ap?'out':'in'});closeFs()}});
  };
}
/* ---------- Pix: chaves, limites, agendado, favoritos, QR ---------- */
const DEF_KEYS=[{t:'Celular',v:'(85) 9••••-3968',ic:'📱'},{t:'Aleatória',v:'7f3a9c2e-41b8-4d6a-b1e0-5c8d92aa31f7',ic:'🔑'}];
const getKeys=()=>LS.get('vb_keys',DEF_KEYS);
const getLim=()=>LS.get('vb_plim',{d:200000,n:50000});
function pixLimit(){const h=new Date().getHours(),l=getLim();return(h>=20||h<6)?l.n:l.d}
function renderPixExtras(){
  const k=$('pxKeys');if(k)k.innerHTML=getKeys().map(x=>`<button class="lb" onclick="openKeys()"><span class="ti">${x.ic}</span><span>${x.t}</span><em>${x.v.length>22?x.v.slice(0,8)+'••••':x.v}</em></button>`).join('');
  const l=$('pxLim');if(l){const g=getLim();l.innerHTML=`<div class="row"><span class="mut">Diurno</span><b>${brl(g.d)}</b></div><div class="row" style="margin-top:12px"><span class="mut">Noturno</span><b>${brl(g.n)}</b></div>`}
}
function openKeys(){
  const K=getKeys();
  fsPage('Minhas chaves Pix',`${K.map((x,i)=>`<div class="box" style="padding:14px;margin-bottom:10px"><div class="row"><span><b>${x.ic} ${x.t}</b><small class="mut" style="display:block;margin-top:4px;word-break:break-all">${x.v}</small></span></div><div style="display:flex;gap:8px;margin-top:10px"><button class="btn g" style="margin:0" onclick="try{navigator.clipboard.writeText('${ESC(x.v)}')}catch(e){};toast('Chave copiada')">Copiar</button><button class="btn g" style="margin:0;color:var(--red)" onclick="delKey(${i})">Excluir</button></div></div>`).join('')||'<p class="mut" style="text-align:center;padding:30px 0">Nenhuma chave cadastrada</p>'}<h3 style="margin:18px 0 6px">Cadastrar nova chave</h3>${row('🪪','CPF','Usar meu CPF como chave',"addKey('CPF')")}${row('✉️','E-mail','Usar meu e-mail',"addKey('E-mail')")}${row('🔑','Chave aleatória','Gerada pelo banco',"addKey('Aleatória')")}`);
}
function addKey(t){
  const h=hashStr(t+Date.now()).toString(16).padStart(8,'0');
  const v=t==='CPF'?'•••.482.193-••':t==='E-mail'?NAME.toLowerCase()+'@visionbank.com.br':[h,h.slice(0,4),h.slice(4,8),h.slice(0,4),h+h.slice(0,4)].join('-');
  const K=getKeys();if(K.some(x=>x.t===t&&t!=='Aleatória')){toast('Você já tem uma chave '+t);return}
  askPin({desc:'Cadastrar chave '+t,amount:0,silent:1,apply:()=>{},after:()=>{closeM();K.push({t,v,ic:t==='CPF'?'🪪':t==='E-mail'?'✉️':'🔑'});LS.set('vb_keys',K);renderPixExtras();openKeys();toast('Chave cadastrada')}});
}
function delKey(i){const K=getKeys();K.splice(i,1);LS.set('vb_keys',K);renderPixExtras();openKeys();toast('Chave excluída')}
function openLimits(){
  const g=getLim();
  openM(`<h3>Limites do Pix</h3><p class="mut">Diurno (6h às 20h)</p>${moneyInput('lmd')}<p class="mut">Noturno (20h às 6h)</p>${moneyInput('lmn')}<button class="btn" id="lmB">Salvar limites</button><button class="btn g" onclick="closeM()">Cancelar</button>`);
  $('lmd').value=brl(g.d);$('lmd').dataset.v=g.d;$('lmn').value=brl(g.n);$('lmn').dataset.v=g.n;
  $('lmB').onclick=()=>{const d=val('lmd'),n=val('lmn');if(!d||!n){toast('Informe os dois limites');return}askPin({desc:'Alterar limites do Pix',amount:0,silent:1,apply:()=>{},after:()=>{LS.set('vb_plim',{d,n});renderPixExtras();closeM();toast('Limites atualizados')}})};
}
/* favoritos + agendamento */
const getFav=()=>LS.get('vb_fav',['Michelle']);
const _pa=pixAmount;
pixAmount=function(){_pa();const n=$('pxN'),o=n.onclick;n.onclick=()=>{if(P.cents/100>pixLimit()){toast('Acima do seu limite Pix ('+brl(pixLimit())+')');return}o()}};
pixWho=function(){
  const fav=getFav();const list=[...CONTACTS].sort((a,b)=>fav.includes(b)-fav.includes(a));
  $('fs').innerHTML=fsHead('Para quem?','pixAmount()')+`<div class="fsb"><div class="amt s">${brl(P.cents/100)}</div><input class="inp" id="pk" placeholder="CPF, celular, e-mail ou chave aleatória" value="${P.key}"><button class="btn" id="pkB">Continuar</button><div class="sec" style="padding:18px 0 0"><h3>Favoritos e recentes</h3>${list.map(n=>`<div class="lb" data-n="${n}" style="cursor:pointer"><span class="ti">${n[0]}</span><span>${n}</span><em class="star" data-s="${n}" style="color:${fav.includes(n)?'#f5b942':'var(--mut)'};font-size:20px;padding:4px 8px">${fav.includes(n)?'★':'☆'}</em></div>`).join('')}</div></div>`;
  const go=k=>{k=k.trim();if(!k){toast('Informe a chave Pix');return}P.key=k;Object.assign(P,resolveKey(k));pixConfirm()};
  $('pkB').onclick=()=>go($('pk').value);
  $('fs').querySelectorAll('.lb[data-n]').forEach(b=>b.onclick=e=>{if(e.target.dataset.s){const f=getFav(),n=e.target.dataset.s,ix=f.indexOf(n);if(ix<0)f.push(n);else f.splice(ix,1);LS.set('vb_fav',f);pixWho();return}go(b.dataset.n)});
};
pixConfirm=function(){
  $('fs').innerHTML=fsHead('Confirmar Pix','pixWho()')+`<div class="fsb"><div class="amt s">${brl(P.cents/100)}</div><div class="box cf"><div><span>Para</span><b>${P.nm}</b></div><div><span>CPF/CNPJ</span><b>${P.doc}</b></div><div><span>Instituição</span><b>${P.bank}</b></div><div><span>Chave</span><b>${P.key}</b></div><div><span>Quando</span><b id="pw" style="color:var(--acc);cursor:pointer">${P.when?new Date(P.when+'T12:00').toLocaleDateString('pt-BR'):'Agora'} ›</b></div><div><span>Saldo após</span><b>${P.when?M(H.bal):M(H.bal-P.cents/100)}</b></div></div><input class="inp" id="pd" placeholder="Mensagem (opcional)" maxlength="60"><button class="btn" id="pxP">${P.when?'Agendar':'Pagar'} ${brl(P.cents/100)}</button></div>`;
  $('pw').onclick=()=>{const t=new Date();t.setDate(t.getDate()+1);const mn=ymd(t);openM(`<h3>Quando pagar?</h3><p class="mut">Escolha agora ou agende para uma data futura</p><input class="inp" type="date" id="pwd" min="${mn}" value="${P.when||mn}"><button class="btn" id="pwA">Agendar nesta data</button><button class="btn g" id="pwN">Pagar agora</button>`);
    $('pwA').onclick=()=>{P.when=$('pwd').value;closeM();pixConfirm()};$('pwN').onclick=()=>{P.when='';closeM();pixConfirm()}};
  $('pxP').onclick=()=>{P.desc=$('pd').value;askPin({desc:(P.when?'Agendar Pix para ':'Pix para ')+P.nm,amount:P.cents/100,after:pixDone})};
};
const _pd=pixDone;
pixDone=function(){
  if(!P.when)return _pd();
  const S=LS.get('vb_sched',[]);S.push({id:Date.now(),nm:P.nm,bank:P.bank,doc:P.doc,key:P.key,v:P.cents/100,date:P.when});LS.set('vb_sched',S);closeM();
  $('fs').innerHTML=`<div class="fsb okp"><div class="ck big"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div><h2>Pix agendado!</h2><div class="amt s">${brl(P.cents/100)}</div><p class="mut">para <b style="color:var(--txt)">${P.nm}</b><br>em ${new Date(P.when+'T12:00').toLocaleDateString('pt-BR')}</p><button class="btn" onclick="openSched()">Ver agendamentos</button><button class="btn g" onclick="closeFs()">Concluir</button></div>`;
};
function openSched(){
  const S=LS.get('vb_sched',[]).sort((a,b)=>a.date<b.date?-1:1);
  fsPage('Pix agendados',S.map(x=>`<div class="box" style="padding:14px;margin-bottom:10px"><div class="row"><b>${x.nm}</b><b>${brl(x.v)}</b></div><div class="row" style="margin-top:4px"><span class="mut">${new Date(x.date+'T12:00').toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long'})}</span><button style="background:none;border:0;color:var(--red);font-size:14px" onclick="cancelSched(${x.id})">Cancelar</button></div></div>`).join('')||'<div style="text-align:center;padding:60px 10px"><div style="font-size:44px">🗓️</div><h3 style="margin:14px 0 6px">Nenhum Pix agendado</h3><p class="mut">Ao fazer um Pix, toque em "Quando" e escolha uma data futura.</p></div>');
}
function cancelSched(id){LS.set('vb_sched',LS.get('vb_sched',[]).filter(x=>x.id!==id));openSched();toast('Agendamento cancelado')}
function runSched(){
  const S=LS.get('vb_sched',[]);if(!S.length)return false;const today=ymd(new Date());const keep=[];let ran=false;
  for(const x of S){if(x.date<=today){const d=new Date(x.date+'T08:00:00').getTime();addMine({d:Math.min(d,Date.now()),name:'Pix enviado • '+x.nm,ic:'↗️',v:-x.v,c:'Transferências',m:'pix',bank:x.bank,doc:x.doc});ran=true}else keep.push(x)}
  LS.set('vb_sched',keep);return ran;
}
/* cobranca com QR real (BR Code) */
const tlv=(id,v)=>id+String(v.length).padStart(2,'0')+v;
function crc16(s){let c=0xFFFF;for(let i=0;i<s.length;i++){c^=s.charCodeAt(i)<<8;for(let k=0;k<8;k++)c=(c&0x8000)?((c<<1)^0x1021)&0xFFFF:(c<<1)&0xFFFF}return c.toString(16).toUpperCase().padStart(4,'0')}
function brCode(v){
  const key=(getKeys().find(k=>k.t==='Aleatória')||DEF_KEYS[1]).v;
  let p=tlv('00','01')+tlv('26',tlv('00','br.gov.bcb.pix')+tlv('01',key))+tlv('52','0000')+tlv('53','986')+(v?tlv('54',v.toFixed(2)):'')+tlv('58','BR')+tlv('59',NAME.toUpperCase().slice(0,25))+tlv('60','FORTALEZA')+tlv('62',tlv('05','***'))+'6304';
  return p+crc16(p);
}
function openCobrar(){openM(`<h3>Cobrar via Pix</h3><p class="mut">Gere um QR Code para receber</p>${moneyInput('cv')}<button class="btn" onclick="genQR()">Gerar cobrança</button><div id="qr"></div>`)}
function genQR(){
  const v=val('cv'),code=brCode(v);
  let svg='';try{const q=qrcode(0,'M');q.addData(code);q.make();svg=q.createSvgTag({cellSize:4,margin:0,scalable:true})}catch(e){svg='<p class="mut">Não foi possível gerar o QR</p>'}
  $('qr').innerHTML=`<div class="qrb">${svg}</div><p class="mut" style="text-align:center">Cobrança de ${v?brl(v):'valor livre'}</p><button class="btn g" onclick="try{navigator.clipboard.writeText('${code}')}catch(e){};toast('Pix Copia e Cola copiado')">Copiar código Pix</button>`;
}
/* ---------- documentos ---------- */
function openDocs(){fsPage('Documentos',row('📄','Extrato em PDF','Escolha o período e salve',"openStmt(30)")+row('📊','Informe de rendimentos','Para o Imposto de Renda',"openInforme(2026)")+row('🧾','Meus comprovantes','Salvos por você',"openSaved()"))}
function openStmt(d){
  const now=Date.now();const list=H.txs.filter(x=>isAcct(x)&&x.d>=now-d*864e5);
  const inn=list.filter(x=>x.v>0).reduce((s,x)=>s+x.v,0),out=list.filter(x=>x.v<0).reduce((s,x)=>s+x.v,0);
  fsPage('Extrato em PDF',`<div class="chips" style="padding:6px 0 12px">${[30,60,90].map(n=>`<button class="${n===d?'on':''}" onclick="openStmt(${n})">${n} dias</button>`).join('')}</div><div class="stmt"><div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:18px">Vision Bank</b><span style="font-size:12px">Extrato de conta corrente</span></div><p style="font-size:12px;margin:10px 0">${NAME} • Ag 0001 • CC 482193-7<br>Período: ${new Date(now-d*864e5).toLocaleDateString('pt-BR')} a ${new Date(now).toLocaleDateString('pt-BR')}</p><p style="font-size:12px;margin-bottom:8px">Entradas ${brl(inn)} • Saídas ${brl(-out)} • Saldo ${brl(H.bal)}</p><table>${list.map(x=>`<tr><td>${new Date(x.d).toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'})}</td><td>${x.name}</td><td style="text-align:right">${x.v<0?'-':''}${brl(Math.abs(x.v))}</td></tr>`).join('')}</table></div><button class="btn" onclick="window.print()">Salvar PDF / Imprimir</button>`);
}
function openInforme(y){
  const S=H.txs.filter(x=>new Date(x.d).getFullYear()===y);const sum=f=>S.filter(f).reduce((s,x)=>s+Math.abs(x.v),0);
  const r=mulberry32(hashStr('inf'+y));const cur=y===new Date().getFullYear();
  const rend=cur?sum(x=>x.kind==='rend'):28000+r()*9000,div=cur?sum(x=>/^Dividendos/.test(x.name)):17000+r()*8000,luc=cur?sum(x=>/^Lucro/.test(x.name)):260000+r()*60000,pro=cur?sum(x=>/^Pró-labore/.test(x.name)):118000+r()*10000;
  fsPage('Informe de rendimentos',`<div class="chips" style="padding:6px 0 12px">${[2026,2025].map(n=>`<button class="${n===y?'on':''}" onclick="openInforme(${n})">${n}</button>`).join('')}</div><div class="box cf"><div><span>Titular</span><b>${LS.get('vb_full','Marcus Lioba')}</b></div><div><span>Ano-calendário</span><b>${y}${cur?' (parcial)':''}</b></div></div><h3 style="margin:16px 0 6px">Rendimentos tributáveis</h3><div class="box cf">${kv('Pró-labore • Padaria Santo Trigo',brl(pro))}${kv('Rendimentos de aplicações',brl(rend))}</div><h3 style="margin:16px 0 6px">Isentos e não tributáveis</h3><div class="box cf">${kv('Lucros e dividendos • Santo Trigo',brl(luc))}${kv('Dividendos • ITSA4',brl(div))}</div><h3 style="margin:16px 0 6px">Bens e direitos em 31/12</h3><div class="box cf">${kv('Saldo em conta corrente',M(H.bal))}${kv('Investimentos',M(INV.reduce((s,b)=>s+b[2],0)))}</div><button class="btn" onclick="window.print()">Salvar PDF / Imprimir</button>`);
}
function saveRc(k){const x=TXMAP[k];if(!x)return;const S=LS.get('vb_saved',[]);if(S.some(s=>txKey(s)===k)){toast('Já está salvo');return}S.unshift(Object.assign({},x));LS.set('vb_saved',S.slice(0,60));toast('Comprovante salvo em Documentos')}
function openSaved(){const S=LS.get('vb_saved',[]);fsPage('Meus comprovantes',S.length?`<div class="box" style="background:none;padding:0">${S.map(txHTML).join('')}</div>`:'<div style="text-align:center;padding:60px 10px"><div style="font-size:44px">🧾</div><h3 style="margin:14px 0 6px">Nenhum comprovante salvo</h3><p class="mut">Abra uma transação e toque em "Salvar nos meus comprovantes".</p></div>','openDocs()')}
/* ---------- tema claro, mensagens, offline ---------- */
function applyTheme(){const l=LS.get('vb_light',false);document.body.classList.toggle('light',l);const s=$('swLight');if(s)s.classList.toggle('on',l)}
function toggleLight(){LS.set('vb_light',!LS.get('vb_light',false));applyTheme()}
const MSGS=[['💳','Seu cartão virtual está disponível','Compre online com mais segurança','openVirtual()'],['🔐','Ajuste seus limites Pix','Defina limite diurno e noturno','openLimits()'],['🌎','Conta Global em dólar','Compre dólar direto pelo app','openGlobal()'],['🤝','Crédito pré-aprovado','Até R$ 450.000 com taxa especial','openLoan()']];
function renderHomeMsg(){
  const dis=LS.get('vb_msgdis',[]);const i=MSGS.findIndex((m,ix)=>!dis.includes(ix));const e=$('homeMsg');if(!e)return;
  if(i<0){e.innerHTML='';return}
  const m=MSGS[i];e.innerHTML=`<div class="hm" onclick="${m[3]}"><span class="ti">${m[0]}</span><div><b>${m[1]}</b><small>${m[2]}</small></div><button onclick="event.stopPropagation();dismissMsg(${i})">✕</button></div>`;
}
function dismissMsg(i){const d=LS.get('vb_msgdis',[]);d.push(i);LS.set('vb_msgdis',d);renderHomeMsg()}
function netBanner(){let b=$('net');if(!b){b=document.createElement('div');b.id='net';b.textContent='Sem conexão • mostrando dados salvos';document.body.appendChild(b)}b.classList.toggle('on',!navigator.onLine)}
addEventListener('online',()=>{netBanner();loadFx()});addEventListener('offline',netBanner);
const _render=render;
render=function(){const ran=runSched();_render();renderPixExtras();renderHomeMsg();renderMkt();if(ran)_render()};
applyTheme();netBanner();render();loadFx();
