/* Vision Bank - recursos de realismo: entrada com PIN/Face ID, comprovante, resumo, Pix completo, cartao, avisos, ajuda */
const M=v=>hidden?'R$ ••••':brl(v);
const isAcct=x=>!x.card&&x.kind!=='info';
const norm=s=>String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
const TXMAP={};
const txKey=x=>x.d+'_'+(hashStr(x.name+x.v)%997);
const CARD_NUM='5412 7518 9034 4417';
const CONTACTS=['Rafaela Monteiro','Lucas Andrade','Camila Souza','Pedro Henrique L.','Juliana Prado','Thiago Albuquerque','Mariana Freitas','Michelle'];
const BANKS=['Nubank','Banco Inter','Itaú Unibanco','Bradesco','Santander','Caixa Econômica','Banco do Brasil','C6 Bank'];
const IC_CARD='<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/></svg>';
function party(x){
  const p=String(x.name).split(/\s*[•·]\s*/);const nm=p.length>1?p.slice(1).join(' ').trim():x.name;
  const h=hashStr(nm);
  return {nm,bank:x.bank||BANKS[h%BANKS.length],doc:x.doc||('•••.'+String(100+h%900)+'.'+String(100+(h>>>5)%900)+'-••')};
}
function nowD(){return new Date()}
/* ---------- linha de transacao ---------- */
function txHTML(x){
  const k=txKey(x);TXMAP[k]=x;
  const dt=new Date(x.d);
  const p=String(x.name).split(/\s*•\s*/);
  const t=p[0];
  let sub=p.slice(1).join(' • ');
  if(x.card)sub='Crédito'+(x.par?' • parcela '+x.par:'');
  else if(x.kind==='pay')sub='Débito em conta';
  else if(!sub)sub=x.v>0?'Entrada na conta':(x.m==='db'||!x.m?'Compra no débito':'Saída da conta');
  const ic=x.card?IC_CARD:(/^(Estorno|Cashback|Rendimento)/i.test(t)||x.kind==='rend'?IC_REF:(x.v>0?IC_IN:IC_OUT));
  const dd=dt.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'});
  const title=x.kind==='pay'?'Pagamento da fatura':(x.card?x.name:t);
  return `<div class="tx" onclick="openReceipt('${k}')"><div class="ti">${ic}</div><div class="tm"><b>${title}</b><small>${sub}</small></div><div class="tr2"><div class="tv ${x.v>0?'in':''}">${hidden?'•••':(x.v>0?'':'-')+brl(Math.abs(x.v))}</div><small>${dd}</small></div></div>`;
}
/* ---------- comprovante ---------- */
function openReceipt(k){
  const x=TXMAP[k];if(!x)return;
  const m=notifMsg(x),pt=party(x),dt=new Date(x.d);
  const isPix=/^Pix/i.test(x.name),out=x.v<0;
  const id='E60746948'+dt.getFullYear()+String(dt.getMonth()+1).padStart(2,'0')+String(dt.getDate()).padStart(2,'0')+String(dt.getHours()).padStart(2,'0')+String(dt.getMinutes()).padStart(2,'0')+(hashStr(k).toString(36)+hashStr(k+'z').toString(36)+hashStr(k+'y').toString(36)).slice(0,11);
  const rows=[['Tipo',m.title],['Data e hora',dt.toLocaleString('pt-BR')]];
  if(x.card){rows.push(['Estabelecimento',x.name],['Cartão','Vision crédito final 4417']);if(x.par)rows.push(['Parcela',x.par]);rows.push(['Fatura atual após a compra',brl(x.fat||0)])}
  else{
    if(isPix||/^(TED|Boleto)/i.test(x.name)){rows.push([out?'Para':'De',pt.nm],['Instituição',pt.bank],['CPF/CNPJ',pt.doc])}
    else rows.push([out?'Pago a':'Origem',pt.nm]);
    rows.push(['Saldo após',brl(x.bal)]);
  }
  rows.push(['Categoria',x.c||'Outros'],['ID da transação',id]);
  openM(`<div class="rc"><div class="rcs ${out?'':'in'}">${x.card?IC_CARD:(out?IC_OUT:IC_IN)}</div><small>${m.title}</small><b>${out?'-':''}${brl(Math.abs(x.v))}</b></div><div class="rcl">${rows.map(r=>`<div><span>${r[0]}</span><b>${r[1]}</b></div>`).join('')}</div><button class="btn" onclick="shareRc('${k}')">Compartilhar comprovante</button><button class="btn g" onclick="closeM()">Fechar</button>`);
}
function shareRc(k){
  const x=TXMAP[k];if(!x)return;const m=notifMsg(x);const t='Vision Bank • '+m.title+'\n'+brl(Math.abs(x.v))+'\n'+new Date(x.d).toLocaleString('pt-BR')+'\n'+x.name;
  if(navigator.share)navigator.share({text:t}).catch(()=>{});else{try{navigator.clipboard.writeText(t)}catch(e){}toast('Comprovante copiado')}
}
/* ---------- render ---------- */
function render(){
  H=buildHistory();
  $('eyeI').innerHTML=hidden?EYE_OFF:EYE_ON;
  $('bal').textContent=hidden?'R$ ••••••':brl(H.bal);
  $('extBal').textContent=hidden?'R$ ••••••':brl(H.bal);
  const t0=new Date();t0.setHours(0,0,0,0);
  const dv=H.txs.filter(x=>isAcct(x)&&x.d>=t0.getTime()).reduce((s,x)=>s+x.v,0);
  $('dayvar').className='dv'+(dv<0?' neg':'');
  $('dayvar').textContent=hidden?'':(dv>=0?'▲ ':'▼ ')+brl(Math.abs(dv))+' hoje';
  $('pname').textContent=NAME;$('av').textContent=NAME[0].toUpperCase();$('ccName').textContent=NAME.toUpperCase();$('ccName2').textContent=NAME.toUpperCase();
  $('lastTx').innerHTML=H.txs.filter(x=>x.kind!=='info').slice(0,6).map(txHTML).join('');
  const pct=Math.min(100,H.bal/GOAL*100);
  $('bnT').textContent='Minha meta';
  $('bnP').textContent=hidden?'R$ ••••••':brl(GOAL);
  $('pctT').textContent=hidden?'••':pct.toFixed(0)+'%';$('mbar').style.width=pct+'%';
  renderFeed();renderCard();renderExt();renderInvest();if(tab==='res')renderResumo();updBell();
}
/* ---------- extrato com busca e filtros ---------- */
let tab='ext';
function renderExt(){
  const now=Date.now();let list=H.txs.filter(isAcct);
  if(filt==='cartao')list=H.txs.filter(x=>x.card);
  if(filt==='in')list=list.filter(x=>x.v>0);
  if(filt==='out')list=list.filter(x=>x.v<0);
  if(filt==='pix')list=list.filter(x=>/^Pix/i.test(x.name));
  if(['7','30','90'].includes(filt))list=list.filter(x=>x.d>=now-(+filt)*864e5);
  const q=norm(($('q')||{value:''}).value.trim());
  if(q){const qd=q.replace(/[^\d,]/g,'').replace(',','.');list=list.filter(x=>norm(x.name+' '+(x.c||'')).includes(q)||(qd&&Math.abs(x.v).toFixed(2).includes(qd)))}
  list=list.slice(0,300);
  let html='',last='';
  for(const x of list){
    const k=new Date(x.d).toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long'});
    if(k!==last){if(last)html+='</div>';html+=`<div class="day"><span>${k}</span><span>${hidden||x.card?'':'Saldo '+brl(x.bal)}</span></div><div class="box">`;last=k}
    html+=txHTML(x);
  }
  if(last)html+='</div>';
  $('extList').innerHTML=html||'<p class="mut" style="padding:24px 0;text-align:center">Nenhuma movimentação encontrada</p>';
}
function setTab(t){
  tab=t;
  document.querySelectorAll('#extTabs button').forEach(b=>b.classList.toggle('on',b.dataset.t===t));
  $('extPane').style.display=t==='ext'?'':'none';$('resPane').style.display=t==='res'?'':'none';
  if(t==='res')renderResumo();
}
$('extTabs').addEventListener('click',e=>{if(e.target.dataset.t)setTab(e.target.dataset.t)});
/* ---------- resumo do mes ---------- */
let resM=0,balRange=60;
const CATCOL={};const PAL=['#2fd39a','#5aa9ff','#f5b942','#b78cff','#ff7a90','#4dd0e1','#7a7a7a'];
function monthSpend(y,m,upto){
  const by={};let out=0,inn=0;
  for(const x of H.txs){
    const d=new Date(x.d);if(d.getFullYear()!==y||d.getMonth()!==m)continue;if(upto&&d.getDate()>upto)continue;
    if(x.kind==='info'||x.kind==='pay')continue;
    if(x.c==='Investimentos'||x.c==='Cartão')continue;
    if(x.v<0){out-=x.v;by[x.c||'Outros']=(by[x.c||'Outros']||0)-x.v}else if(x.v>0)inn+=x.v;
  }
  return {by,out,inn};
}
function renderResumo(){
  const n=new Date();const ref=new Date(n.getFullYear(),n.getMonth()-resM,1);
  const cur=monthSpend(ref.getFullYear(),ref.getMonth(),0);
  const prevRef=new Date(ref.getFullYear(),ref.getMonth()-1,1);
  const upto=resM===0?n.getDate():0;
  const prev=monthSpend(prevRef.getFullYear(),prevRef.getMonth(),upto);
  const cats=Object.entries(cur.by).sort((a,b)=>b[1]-a[1]);
  const top=cats.slice(0,6),rest=cats.slice(6).reduce((s,c)=>s+c[1],0);if(rest>0)top.push(['Outros',rest]);
  const tot=cur.out||1;
  let a=-Math.PI/2,arcs='';const R=62,C=2*Math.PI*R;let off=0;
  top.forEach((c,i)=>{const f=c[1]/tot;arcs+=`<circle cx="80" cy="80" r="${R}" fill="none" stroke="${PAL[i%7]}" stroke-width="22" stroke-dasharray="${Math.max(0,f*C-2)} ${C}" stroke-dashoffset="${-off}" transform="rotate(-90 80 80)"/>`;off+=f*C});
  const mn=ref.toLocaleDateString('pt-BR',{month:'long'});
  const pm=prevRef.toLocaleDateString('pt-BR',{month:'long'});
  const dlt=prev.out?((cur.out-prev.out)/prev.out*100):0;
  const mx=Math.max(cur.out,prev.out,1);
  /* evolucao do saldo */
  const days={};for(const x of [...H.txs].reverse()){if(!isAcct(x))continue;days[ymd(new Date(x.d))]=x.bal}
  const keys=Object.keys(days).sort().slice(-balRange);const vals=keys.map(k=>days[k]);
  const lo=Math.min(...vals),hi=Math.max(...vals),W=340,Hh=120;
  const pts=vals.map((v,i)=>[i/(vals.length-1||1)*W,Hh-(v-lo)/((hi-lo)||1)*(Hh-14)-7]);
  const path=pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ');
  $('resPane').innerHTML=`
  <div class="chips" style="padding-top:6px"><button class="${resM===0?'on':''}" onclick="resM=0;renderResumo()">Este mês</button><button class="${resM===1?'on':''}" onclick="resM=1;renderResumo()">Mês passado</button></div>
  <div class="sec" style="padding-top:14px"><div class="two"><div class="box mini2"><small>Entradas</small><b class="inn">${M(cur.inn)}</b></div><div class="box mini2"><small>Saídas</small><b>${M(cur.out)}</b></div></div></div>
  <div class="sec"><h3>Para onde foi seu dinheiro <span class="mut" style="font-size:13px;font-weight:400;text-transform:capitalize">${mn}</span></h3>
   <div class="box dn"><svg viewBox="0 0 160 160" width="150" height="150">${arcs}<text x="80" y="76" text-anchor="middle" fill="#9a9a9a" font-size="11">Gastos</text><text x="80" y="95" text-anchor="middle" fill="#f2f2f2" font-size="15" font-weight="700">${hidden?'•••':brl(cur.out).replace(',00','')}</text></svg>
   <div class="lg">${top.map((c,i)=>`<div><i style="background:${PAL[i%7]}"></i><span>${c[0]}</span><b>${hidden?'':Math.round(c[1]/tot*100)+'%'}</b></div>`).join('')||'<span class="mut">Sem gastos no período</span>'}</div></div></div>
  <div class="sec"><h3>Comparação</h3><div class="box" style="padding:16px">
   <div class="cmp"><span>${mn}${resM===0?' (até hoje)':''}</span><div><i style="width:${cur.out/mx*100}%"></i></div><b>${M(cur.out)}</b></div>
   <div class="cmp"><span style="text-transform:capitalize">${pm}${resM===0?' (mesmo período)':''}</span><div><i class="g" style="width:${prev.out/mx*100}%"></i></div><b>${M(prev.out)}</b></div>
   <p class="mut" style="margin-top:10px;font-size:13px">${hidden||!prev.out?'':(dlt<=0?'Você gastou '+Math.abs(dlt).toFixed(0)+'% a menos que no mês anterior.':'Você gastou '+dlt.toFixed(0)+'% a mais que no mês anterior.')}</p></div></div>
  <div class="sec"><h3>Evolução do saldo</h3><div class="box" style="padding:16px">
   <div class="chips" style="padding:0 0 10px">${[30,60,120].map(d=>`<button class="${balRange===d?'on':''}" onclick="balRange=${d};renderResumo()">${d} dias</button>`).join('')}</div>
   <svg class="ev" viewBox="0 0 ${W} ${Hh}" preserveAspectRatio="none"><defs><linearGradient id="gA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2fd39a" stop-opacity=".28"/><stop offset="1" stop-color="#2fd39a" stop-opacity="0"/></linearGradient></defs><path d="${path} L${W} ${Hh} L0 ${Hh} Z" fill="url(#gA)"/><path d="${path}" fill="none" stroke="#2fd39a" stroke-width="2" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>
   <div class="row" style="margin-top:8px"><span class="mut">Mínimo ${M(lo)}</span><span class="mut">Máximo ${M(hi)}</span></div></div></div>`;
}
/* ---------- cartao ---------- */
function renderCard(){
  const used=H.cyc+H.closed,shown=H.closed>0?H.closed:H.cyc;
  $('cFat').textContent=hidden?'R$ •••':brl(shown);
  $('cFatL').textContent=H.closed>0?'Fatura fechada • vence dia '+VB.DUE_DAY:'Fatura atual • fecha dia '+VB.CLOSE_DAY;
  $('cLim').textContent=hidden?'•••':brl(LIMIT-used);
  $('cBar').style.width=Math.min(100,used/LIMIT*100)+'%';
  $('payBtn').textContent=H.closed>0?'Pagar fatura':'Pagar fatura antecipada';
  const blk=LS.get('vb_blk',false);$('ccCr').classList.toggle('blocked',blk);$('blk').textContent=blk?'Bloqueado':'Ativo';
  $('ccTx').innerHTML=H.txs.filter(x=>x.card).slice(0,8).map(txHTML).join('');
}
function toggleBlock(){const b=!LS.get('vb_blk',false);LS.set('vb_blk',b);renderCard();toast(b?'Cartão de crédito bloqueado':'Cartão desbloqueado')}
function cardData(){
  askPin({desc:'Ver dados do cartão',amount:0,silent:1,apply:()=>{},after:()=>{
    const cvv=String(100+hashStr('cvv'+NAME)%900);let s=30;
    openM(`<h3>Dados do cartão</h3><p class="mut">Os dados somem em <b id="cdT">30</b>s</p><div class="cc" style="min-width:0;height:auto;margin:0 0 14px;padding:18px;display:block"><div class="row"><b style="letter-spacing:2px">VISION</b><span class="mut">crédito</span></div><div style="letter-spacing:3px;font-size:19px;margin:22px 0 14px">${CARD_NUM}</div><div class="row" style="font-size:13px"><span>${NAME.toUpperCase()}</span><span>12/31 • CVV <b>${cvv}</b></span></div></div><button class="btn" onclick="navigator.clipboard&&navigator.clipboard.writeText('${CARD_NUM.replace(/ /g,'')}');toast('Número copiado')">Copiar número</button><button class="btn g" onclick="closeM()">Fechar</button>`);
    clearInterval(window._cd);window._cd=setInterval(()=>{s--;const e=$('cdT');if(!e||!$('ov').classList.contains('on')){clearInterval(window._cd);return}e.textContent=s;if(s<=0){clearInterval(window._cd);closeM()}},1000);
  }});
}
function faturaItems(which){
  const closes=H.txs.filter(x=>x.ev==='close');
  const c0=closes[0],c1=closes[1];
  if(which==='cur')return {items:H.txs.filter(x=>x.card&&(!c0||x.d>c0.d)),total:H.cyc,title:'Fatura atual',st:'Aberta • fecha dia '+VB.CLOSE_DAY};
  const items=H.txs.filter(x=>x.card&&c0&&x.d<=c0.d&&(!c1||x.d>c1.d));
  return {items,total:c0?c0.fat:0,title:'Fatura anterior',st:H.closed>0?'Fechada • vence dia '+VB.DUE_DAY:'Paga'};
}
function openFatura(w){
  w=w||(H.closed>0?'prev':'cur');
  const f=faturaItems(w);let html='',last='';
  for(const x of f.items){const k=new Date(x.d).toLocaleDateString('pt-BR',{day:'2-digit',month:'long'});if(k!==last){if(last)html+='</div>';html+=`<div class="day"><span>${k}</span></div><div class="box">`;last=k}html+=txHTML(x)}
  if(last)html+='</div>';
  $('fs').innerHTML=`<div class="fsh"><button class="circle" onclick="closeFs()"><svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg></button><h2>Fatura</h2><span style="width:36px"></span></div><div class="fsb"><div class="tabs2"><button class="${w==='cur'?'on':''}" onclick="openFatura('cur')">Atual</button><button class="${w==='prev'?'on':''}" onclick="openFatura('prev')">Anterior</button></div><div class="big2" style="padding:18px 0 4px"><small>${f.title}</small><b>${M(f.total)}</b><div class="mut" style="margin-top:6px">${f.st}</div></div><div class="sec" style="padding:0">${html||'<p class="mut" style="padding:24px 0;text-align:center">Sem compras neste período</p>'}</div></div>`;
  $('fs').classList.add('on');
}
function payFatura(){
  if(H.closed>0){
    const f=H.closed,ym=ymd(new Date()).slice(0,7);
    askPin({desc:'Fatura do cartão Vision',amount:f,okTitle:'Fatura paga',apply:()=>{const s=LS.get('vb_fpaid',{});s[ym]=true;LS.set('vb_fpaid',s);const m=LS.get('vb_mine',[]);m.push({d:Date.now(),name:'Pagamento • Fatura Cartão Vision',ic:'💳',v:-f,c:'Cartão',kind:'pay',m:'fatura'});LS.set('vb_mine',m)}});
  }else toast('Sua fatura ainda está aberta. Ela fecha dia '+VB.CLOSE_DAY+'.');
}
function buildHistory(){return VB.buildBase(new Date(),LS.get('vb_mine',[]),LS.get('vb_fpaid',{}))}
/* ---------- investimentos ao vivo ---------- */
const INV=[['CDB Vision 110% CDI','Liquidez diária',412000,.00002],['Tesouro IPCA+ 2035','Vencimento 2035',286500,.0007],['LCI Imobiliária','Isento de IR',198000,.00003],['Fundo Multimercado','Rentab. 12m: 14,2%',134800,.0012],['Ações • Carteira','ITSA4, WEGE3, BBAS3',97300,.0032]];
let invPrev=[];
function renderInvest(){
  const r=mulberry32(hashStr('inv'+ymd(new Date())));const t=Date.now();
  const extra=LS.get('vb_inv',0);let tot=0,rend=0;const cur=[];
  const html=INV.map((b,i)=>{
    const dayDrift=(r()*0.012-0.002);
    const live=b[3]*(Math.sin(t/7000+i*1.7)+.5*Math.sin(t/2900+i*3.1));
    const base=b[2]+(i===0?extra:0);const v=base*(1+dayDrift+live);const rd=v-base;tot+=v;rend+=rd;cur.push(v);
    const up=invPrev[i]!==undefined&&v>invPrev[i]?' up':(invPrev[i]!==undefined&&v<invPrev[i]?' dn2':'');
    return `<div class="inv"><div><b>${b[0]}</b><small>${b[1]}</small></div><div style="text-align:right"><b class="lv${up}">${hidden?'•••':brl(v)}</b><div class="pos${rd<0?' neg':''}">${hidden?'':(rd>=0?'+':'')+brl(rd)}</div></div></div>`}).join('');
  invPrev=cur;
  $('invList').innerHTML=html;
  $('invTot').textContent=hidden?'R$ ••••••':brl(tot);
  $('invRend').innerHTML=hidden?'':'<i class="live"></i>▲ '+brl(rend)+' no mês • ao vivo';
}
setInterval(()=>{if($('s-invest').classList.contains('on')&&!document.hidden)renderInvest()},2500);
/* ---------- PIN ---------- */
const getPin=()=>LS.get('vb_pin','1234');
function pinPrompt(title,sub,cb,opts){
  opts=opts||{};let pin='';
  const draw=()=>{const d=$('pinDots');if(d)d.innerHTML=[0,1,2,3].map(i=>`<span class="${i<pin.length?'f':''}"></span>`).join('')};
  openM(`<h3>${title}</h3><p class="mut">${sub}</p><div class="pin" id="pinDots"></div><div class="kp">${[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map(k=>`<button data-k="${k}">${k}</button>`).join('')}</div>`);
  draw();
  $('sheet').querySelectorAll('.kp button').forEach(b=>b.onclick=()=>{const k=b.dataset.k;if(k==='⌫')pin=pin.slice(0,-1);else if(k!==''&&pin.length<4)pin+=k;draw();if(pin.length===4){const p=pin;setTimeout(()=>cb(p,()=>{pin='';draw();const d=$('pinDots');d.classList.remove('shake');void d.offsetWidth;d.classList.add('shake')}),180)}});
}
function askPin(r){
  pinPrompt('Confirme seu PIN',r.silent?r.desc:(r.desc+' • <b>'+brl(r.amount)+'</b>'),(p,bad)=>{
    if(p!==getPin()){toast('PIN incorreto');bad();return}
    if(r.after){r.after();return}
    done(r);
  });
}
function done(r){
  if(r.apply)r.apply();
  else{const m=LS.get('vb_mine',[]);m.push({d:Date.now(),name:r.name,ic:r.ic,v:r.v,c:r.c||'Transferências',m:r.m||'pix',bank:r.bank,doc:r.doc});LS.set('vb_mine',m)}
  render();
  openM(`<div class="ok"><div class="ck"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div><h3>${r.okTitle||'Operação realizada'}</h3><p class="mut" style="margin:6px 0 18px">${r.desc}<br><b style="font-size:24px;color:var(--txt)">${brl(r.amount)}</b><br>${new Date().toLocaleString('pt-BR')}</p><button class="btn" onclick="closeM()">Concluir</button></div>`);
}
/* ---------- Pix completo ---------- */
let P={};
function closeFs(){$('fs').classList.remove('on')}
function fsHead(title,back){return `<div class="fsh"><button class="circle" onclick="${back||'closeFs()'}"><svg viewBox="0 0 24 24"><path d="${back?'M15 6l-6 6 6 6':'M6 6l12 12M18 6L6 18'}"/></svg></button><h2>${title}</h2><span style="width:36px"></span></div>`}
function openPix(){P={cents:0,key:'',nm:'',bank:'',doc:'',desc:''};pixAmount()}
function pixAmount(){
  const v=P.cents/100;
  $('fs').innerHTML=fsHead('Pix')+`<div class="fsb pxa"><p class="mut" style="text-align:center">Qual é o valor do Pix?</p><div class="amt ${v?'':'z'}">${brl(v)}</div><p class="mut" style="text-align:center">Saldo disponível ${M(H.bal)}</p><div class="kp pxk">${[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map(k=>`<button data-k="${k}">${k}</button>`).join('')}</div><button class="btn" id="pxN">Continuar</button></div>`;
  $('fs').classList.add('on');
  $('fs').querySelectorAll('.pxk button').forEach(b=>b.onclick=()=>{const k=b.dataset.k;if(k==='⌫')P.cents=Math.floor(P.cents/10);else if(k!==''&&P.cents<1e9)P.cents=P.cents*10+(+k);pixAmount()});
  $('pxN').onclick=()=>{if(!P.cents){toast('Informe o valor');return}if(P.cents/100>H.bal){toast('Saldo insuficiente');return}pixWho()};
}
function resolveKey(k){
  const c=CONTACTS.find(n=>n===k);const h=hashStr(k);
  const nm=c||CONTACTS.filter(n=>n!=='Michelle')[h%7];
  return {nm,bank:BANKS[h%BANKS.length],doc:'•••.'+String(100+h%900)+'.'+String(100+(h>>>5)%900)+'-••'};
}
function pixWho(){
  $('fs').innerHTML=fsHead('Para quem?','pixAmount()')+`<div class="fsb"><div class="amt s">${brl(P.cents/100)}</div><input class="inp" id="pk" placeholder="CPF, celular, e-mail ou chave aleatória" value="${P.key}"><button class="btn" id="pkB">Continuar</button><div class="sec" style="padding:18px 0 0"><h3>Contatos recentes</h3>${CONTACTS.map(n=>`<button class="lb" data-n="${n}"><span class="ti">${n[0]}</span><span>${n}</span><em>›</em></button>`).join('')}</div></div>`;
  const go=k=>{k=k.trim();if(!k){toast('Informe a chave Pix');return}P.key=k;Object.assign(P,resolveKey(k));pixConfirm()};
  $('pkB').onclick=()=>go($('pk').value);
  $('fs').querySelectorAll('.lb[data-n]').forEach(b=>b.onclick=()=>go(b.dataset.n));
}
function pixConfirm(){
  $('fs').innerHTML=fsHead('Confirmar Pix','pixWho()')+`<div class="fsb"><div class="amt s">${brl(P.cents/100)}</div><div class="box cf"><div><span>Para</span><b>${P.nm}</b></div><div><span>CPF/CNPJ</span><b>${P.doc}</b></div><div><span>Instituição</span><b>${P.bank}</b></div><div><span>Chave</span><b>${P.key}</b></div><div><span>Quando</span><b>Agora</b></div><div><span>Saldo após</span><b>${M(H.bal-P.cents/100)}</b></div></div><input class="inp" id="pd" placeholder="Mensagem (opcional)" maxlength="60"><button class="btn" id="pxP">Pagar ${brl(P.cents/100)}</button></div>`;
  $('pxP').onclick=()=>{P.desc=$('pd').value;askPin({desc:'Pix para '+P.nm,amount:P.cents/100,after:pixDone})};
}
function pixDone(){
  const v=P.cents/100;const t=Date.now();
  const m=LS.get('vb_mine',[]);m.push({d:t,name:'Pix enviado • '+P.nm,ic:'↗️',v:-v,c:'Transferências',m:'pix',bank:P.bank,doc:P.doc});LS.set('vb_mine',m);
  render();closeM();
  const key=txKey(H.txs.find(x=>x.d===t)||{d:t,name:'Pix enviado • '+P.nm,v:-v});
  $('fs').innerHTML=`<div class="fsb okp"><div class="ck big"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div><h2>Pix enviado!</h2><div class="amt s">${brl(v)}</div><p class="mut">para <b style="color:var(--txt)">${P.nm}</b><br>${P.bank}<br>${new Date().toLocaleString('pt-BR')}</p><button class="btn" onclick="closeFs();openReceipt('${key}')">Ver comprovante</button><button class="btn g" onclick="closeFs()">Concluir</button></div>`;
}
/* ---------- avisos (sino) ---------- */
const seenAt=()=>LS.get('vb_seen',new Date(new Date().setHours(0,0,0,0)).getTime());
function notifList(){const n=Date.now();return H.txs.filter(x=>x.d<=n&&x.kind!=='rend').slice(0,60)}
function updBell(){
  const s=seenAt();const c=notifList().filter(x=>x.d>s).length;
  const e=$('bellN');e.textContent=c>99?'99+':c;e.style.display=c?'grid':'none';
}
function ago(t){const m=Math.round((Date.now()-t)/60000);if(m<1)return 'agora';if(m<60)return m+' min';const h=Math.floor(m/60);if(h<24)return h+' h';return Math.floor(h/24)+' d'}
function openBell(){
  const s=seenAt();const L=notifList();
  $('fs').innerHTML=fsHead('Avisos')+`<div class="fsb">${L.map(x=>{const m=notifMsg(x);const k=txKey(x);TXMAP[k]=x;return `<div class="nt ${x.d>s?'nw':''}" ${x.kind==='info'?'':`onclick="openReceipt('${k}')"`}><div class="ti">${x.card?IC_CARD:(x.kind==='info'?IC_REF:(x.v>0?IC_IN:IC_OUT))}</div><div><b>${m.title}</b><p>${m.body.replace(/\n/g,'<br>')}</p></div><small>${ago(x.d)}</small></div>`}).join('')}</div>`;
  $('fs').classList.add('on');LS.set('vb_seen',Date.now());updBell();
}
/* ---------- ajuda (chat simples) ---------- */
function openHelp(){
  $('fs').innerHTML=fsHead('Ajuda')+`<div class="fsb chat"><div id="msgs"></div><div class="chips" id="qk" style="padding:10px 0">${['Meu saldo','Minha fatura','Limite do cartão','Bloquear cartão','Meu Pix'].map(q=>`<button>${q}</button>`).join('')}</div><div class="cin"><input class="inp" id="ci" placeholder="Escreva sua dúvida"><button class="btn" id="cs">Enviar</button></div></div>`;
  $('fs').classList.add('on');
  say('bot','Olá, '+NAME+'! Sou a assistente do Vision Bank. Como posso ajudar?');
  const send=t=>{t=t.trim();if(!t)return;say('me',t);$('ci').value='';const typ=say('bot','•••',1);setTimeout(()=>{typ.remove();say('bot',answer(t))},650)};
  $('cs').onclick=()=>send($('ci').value);$('ci').onkeydown=e=>{if(e.key==='Enter')send($('ci').value)};
  $('qk').onclick=e=>{if(e.target.tagName==='BUTTON')send(e.target.textContent)};
}
function say(w,t,ret){const d=document.createElement('div');d.className='bb '+w;d.textContent=t;$('msgs').appendChild(d);d.scrollIntoView({block:'end'});return d}
function answer(q){
  q=norm(q);
  if(/saldo/.test(q))return 'Seu saldo disponível agora é '+brl(H.bal)+'.';
  if(/fatura/.test(q))return H.closed>0?'Sua fatura fechou em '+brl(H.closed)+' e vence dia '+VB.DUE_DAY+'. Você pode pagá-la na aba Cartão.':'Sua fatura atual está em '+brl(H.cyc)+' e fecha dia '+VB.CLOSE_DAY+'.';
  if(/limite/.test(q))return 'Seu limite total é '+brl(LIMIT)+' e você tem '+brl(LIMIT-H.cyc-H.closed)+' disponível.';
  if(/bloque/.test(q))return 'Você pode bloquear e desbloquear o cartão de crédito na aba Cartão, no atalho Bloquear.';
  if(/pix/.test(q))return 'Para fazer um Pix, toque em "Faça um Pix" na tela inicial. Seu limite diário é R$ 200.000,00 (noturno R$ 50.000,00).';
  if(/atendente|humano|falar/.test(q))return 'Nossos atendentes respondem de segunda a sexta, das 8h às 20h. Deixe sua mensagem que retornamos em até 1 dia útil.';
  if(/senha|pin/.test(q))return 'Você pode alterar seu PIN em Perfil > Segurança.';
  return 'Entendi. Posso ajudar com saldo, fatura, limite, Pix e bloqueio de cartão. Escolha uma das opções acima ou reformule sua pergunta.';
}
/* ---------- seguranca ---------- */
function openSeg(){
  const face=LS.get('vb_face',true),lock=LS.get('vb_lock',true);
  openM(`<h3>Segurança</h3><p class="mut">Como você entra no app</p><button class="lb" id="sgL"><span class="ti">🔐</span><span>Pedir acesso ao abrir</span><div class="sw ${lock?'on':''}"><i></i></div></button><button class="lb" id="sgF"><span class="ti">🙂</span><span>Entrar com Face ID</span><div class="sw ${face?'on':''}"><i></i></div></button><button class="lb" id="sgP"><span class="ti">🔢</span><span>Alterar PIN</span><em>›</em></button><button class="btn g" onclick="closeM()">Fechar</button>`);
  $('sgL').onclick=()=>{LS.set('vb_lock',!lock);openSeg()};
  $('sgF').onclick=()=>{LS.set('vb_face',!face);openSeg()};
  $('sgP').onclick=()=>pinPrompt('PIN atual','Digite seu PIN atual',(p,bad)=>{if(p!==getPin()){toast('PIN incorreto');bad();return}
    pinPrompt('Novo PIN','Escolha 4 dígitos',n=>{pinPrompt('Repita o novo PIN','Confirme os 4 dígitos',(c,bad2)=>{if(c!==n){toast('Os PINs não conferem');bad2();return}LS.set('vb_pin',n);closeM();toast('PIN alterado')})})});
}
/* ---------- abertura: splash, Face ID / PIN ---------- */
let lkPin='',lkBusy=false,hiddenAt=0;
function lkDraw(){$('lkDots').innerHTML=[0,1,2,3].map(i=>`<span class="${i<lkPin.length?'f':''}"></span>`).join('')}
function unlock(){const l=$('lock');l.classList.add('ok');setTimeout(()=>{l.classList.remove('on','ok','scan');document.body.classList.remove('locked')},380)}
function lockFace(){
  const l=$('lock');lkBusy=true;l.classList.remove('pin');l.classList.add('scan');$('lkMsg').textContent='Olhe para o iPhone';
  setTimeout(()=>{l.classList.add('done');$('lkMsg').textContent='Face ID reconhecido';setTimeout(()=>{l.classList.remove('done');lkBusy=false;unlock()},520)},1250);
}
function lockPin(){lkPin='';lkDraw();const l=$('lock');l.classList.remove('scan');l.classList.add('pin');$('lkMsg').textContent='Digite seu PIN'}
function lockForgot(){LS.set('vb_pin','1234');lkPin='';lkDraw();toast('PIN redefinido para 1234')}
function showLock(){
  if(!LS.get('vb_lock',true))return;
  document.body.classList.add('locked');const l=$('lock');l.classList.add('on');l.classList.remove('done','ok');
  $('lkMsg').textContent='Olá, '+NAME;
  if(LS.get('vb_face',true))setTimeout(lockFace,350);else lockPin();
}
(function(){
  const kp=$('lkKp');kp.innerHTML=[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map(k=>`<button data-k="${k}">${k}</button>`).join('');
  $('lkFace').insertAdjacentHTML('afterend','<button id="lkUsePin" class="lkb" onclick="lockPin()">Usar PIN</button>');
  kp.onclick=e=>{const b=e.target.closest('button');if(!b)return;const k=b.dataset.k;if(k==='⌫')lkPin=lkPin.slice(0,-1);else if(k!==''&&lkPin.length<4)lkPin+=k;lkDraw();
    if(lkPin.length===4){if(lkPin===getPin())setTimeout(unlock,120);else{$('lkDots').classList.remove('shake');void $('lkDots').offsetWidth;$('lkDots').classList.add('shake');setTimeout(()=>{lkPin='';lkDraw()},350)}}};
})();
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){hiddenAt=Date.now()}
  else if(hiddenAt&&Date.now()-hiddenAt>60000){render();showLock()}
});
/* ---------- puxar para atualizar ---------- */
(function(){
  let y0=null,dy=0;const p=$('ptr');
  const busy=()=>document.body.classList.contains('locked')||$('ov').classList.contains('on')||$('fs').classList.contains('on');
  addEventListener('touchstart',e=>{y0=(window.scrollY<=0&&!busy())?e.touches[0].clientY:null;dy=0},{passive:true});
  addEventListener('touchmove',e=>{if(y0===null)return;dy=e.touches[0].clientY-y0;if(dy>0&&window.scrollY<=0){const d=Math.min(dy*.5,70);p.style.opacity=Math.min(1,d/50);p.style.transform='translate(-50%,'+d+'px) rotate('+d*5+'deg)'}},{passive:true});
  addEventListener('touchend',()=>{
    if(y0===null)return;
    if(dy>110){p.classList.add('spin');p.style.transform='translate(-50%,56px)';p.style.opacity=1;setTimeout(()=>{render();p.classList.remove('spin');p.style.opacity=0;p.style.transform='translate(-50%,0)';toast('Atualizado agora')},800)}
    else{p.style.opacity=0;p.style.transform='translate(-50%,0)'}
    y0=null;
  });
})();
/* ---------- partida ---------- */
render();setInterval(render,60000);
setTimeout(()=>{$('splash').classList.add('out');setTimeout(()=>$('splash').remove(),500);showLock()},1150);
