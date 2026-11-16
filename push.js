const J=process.env.JANELA||'teste';
const DRY=process.env.DRY==='1';
const PUB=(process.env.VAPID_PUBLIC||'').trim();
const PRIV=(process.env.VAPID_PRIVATE||'').replace(/[\s"'=]/g,'');
const SUBJECT='https://marcuslioba.github.io/visao/';
const localStorage={getItem:()=>null,setItem:()=>{}};
const RD=Date;
const REAL_NOW=RD.now();
if(J!=='teste'){
  const n=new RD();
  const eod=new RD(n.getFullYear(),n.getMonth(),n.getDate(),23,59,0).getTime();
  globalThis.Date=class extends RD{constructor(...a){if(a.length)super(...a);else super(eod)}static now(){return eod}};
}
/* ---------- utilidades ---------- */
const LS={get:(k,d)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const brl=v=>v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const $=id=>document.getElementById(id);
let hidden=LS.get('vb_hide',false);
let NAME=LS.get('vb_name','Marcus');
let GOAL=LS.get('vb_goal',1000000);
const MIN=900000, MAX=1200000;

function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function hashStr(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
const ymd=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');

/* ---------- catálogo de movimentações ---------- */
const OUT_SMALL=[
 ['Supermercado Pão de Açúcar','🛒',120,980],['Posto Ipiranga','⛽',90,380],['iFood','🍔',35,180],
 ['Farmácia Pague Menos','💊',25,260],['Uber','🚗',14,75],['Padaria Santo Trigo','🥖',12,90],
 ['Netflix','🎬',55.9,55.9],['Spotify','🎧',21.9,21.9],['Restaurante Coco Bambu','🍽️',180,620],
 ['Amazon','📦',60,900],['Mercado Livre','📦',45,1200],['Academia','💪',149,149],
 ['Cinema','🍿',60,140],['Livraria Leitura','📚',40,260],['Pet Shop','🐾',70,340],['Starbucks','☕',18,45]
];
const OUT_BIG=[
 ['Pix enviado • Construtora Horizonte','🏗️',8000,38000],['Boleto • Concessionária Toyota','🚙',12000,45000],
 ['Pix enviado • Imobiliária Beira-Mar','🏠',6000,22000],['TED • Agência de Viagens','✈️',5000,28000],
 ['Boleto • Escola','🎓',2500,6000],['Pix enviado • Oferta Igreja','⛪',1000,5000],
 ['Boleto • IPTU','🧾',2000,7000],['Compra • Loja Apple','📱',4500,15000],['Pix enviado • Michelle','💛',1000,8000]
];
const IN_SMALL=[
 ['Pix recebido • Cliente Resolve','💼',800,4500],['Pix recebido • Trevo Açaí','🍇',1200,6000],
 ['Cashback','🎁',20,180],['Pix recebido • LanLan','🥟',900,4800],['Estorno','↩️',40,300]
];
const IN_BIG=[
 ['TED recebida • Resolve Gestão de Tráfego','🚀',15000,60000],['Dividendos • ITSA4','📈',3000,14000],
 ['Pix recebido • Contrato de gestão','💼',6000,25000],['Resgate CDB','🏦',10000,50000],
 ['Aluguel recebido','🏢',4500,9000],['Bonificação anual','🏆',20000,70000]
];

/* ---------- motor determinístico: mesma história todo dia, novas transações a cada dia ---------- */
function buildHistory(){
  const now=new Date();
  const start=new Date(now);start.setHours(0,0,0,0);start.setDate(start.getDate()-120);
  let bal=1048372.55;
  const txs=[];
  for(let d=new Date(start);d<=now;d.setDate(d.getDate()+1)){
    const key=ymd(d), r=mulberry32(hashStr('visao'+key));
    const isToday=key===ymd(now);
    const nowMin=now.getHours()*60+now.getMinutes();
    // rendimento automático
    const rend=+(bal*(0.00030+r()*0.00012)).toFixed(2);
    const day=[{t:30,name:'Rendimento • Conta Remunerada',ic:'💹',v:rend}];
    const n=3+Math.floor(r()*5);
    for(let i=0;i<n;i++){
      const t=7*60+Math.floor(r()*15*60);
      const big=r()<0.16;
      // tendência para o centro da faixa
      let pIn=0.5+(1050000-bal)/500000; pIn=Math.max(.12,Math.min(.88,pIn));
      if(!big) pIn*=0.55;
      let isIn=r()<pIn;
      const list=isIn?(big?IN_BIG:IN_SMALL):(big?OUT_BIG:OUT_SMALL);
      const it=list[Math.floor(r()*list.length)];
      let v=+(it[2]+r()*(it[3]-it[2])).toFixed(2);
      day.push({t,name:it[0],ic:it[1],v:isIn?v:-v});
    }
    day.sort((a,b)=>a.t-b.t);
    for(const x of day){
      if(isToday && x.t>nowMin) continue;
      let v=x.v;
      if(bal+v<MIN+5000||bal+v>MAX-5000){ // mantém dentro da faixa
        v=-v;
        const pool=v>0?(Math.abs(v)>5000?IN_BIG:IN_SMALL):(Math.abs(v)>5000?OUT_BIG:OUT_SMALL);
        const it=pool[Math.floor(Math.abs(v))%pool.length]; x.name=it[0]; x.ic=it[1];
      }
      bal=+(bal+v).toFixed(2);
      const dt=new Date(d);dt.setHours(Math.floor(x.t/60),x.t%60,0,0);
      txs.push({d:dt.getTime(),name:x.name,ic:x.ic,v,bal});
    }
  }
  // operações feitas pelo usuário no app
  const mine=LS.get('vb_mine',[]);
  for(const m of mine){bal=+(bal+m.v).toFixed(2);txs.push({...m,bal})}
  txs.sort((a,b)=>b.d-a.d);
  return {bal,txs};
}


const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const WIN={janela1:[7,11],janela2:[11,15],janela3:[15,19],janela4:[19,24]};
function msg(x){
  const out=x.v<0, val=brl(Math.abs(x.v));
  const parts=x.name.split(/\s*[\u2022\u00b7]\s*/); const who=parts.length>1?parts.slice(1).join(' ').trim():x.name;
  const kindName=parts[0];
  let title,body;
  if(!out){
    if(/^Pix/i.test(kindName)){title='Pix recebido';body='Voc\u00ea recebeu '+val+' de '+who+'.'}
    else if(/^Rendimento/i.test(x.name)){title='Rendimento creditado';body='Seu saldo rendeu '+val+' hoje.'}
    else{title='Dinheiro na conta';body=x.name+': voc\u00ea recebeu '+val+'.'}
  }else if(/^Pix/i.test(kindName)){title='Pix enviado';body='Voc\u00ea enviou '+val+' para '+who+'.'}
  else if(/^(TED|Boleto|Pagamento)/i.test(kindName)){title='Pagamento realizado';body=val+' pago em '+who+'.'}
  else{title='Compra aprovada';body='Compra de '+val+' aprovada em '+x.name+'.'}
  return {title,body,tag:String(x.d)};
}
async function send(webpush,sub,x){
  const m=msg(x);
  if(DRY){console.log(new RD(x.d).toLocaleTimeString('pt-BR'),JSON.stringify(m));return}
  try{
    await webpush.sendNotification(sub,JSON.stringify(m),{TTL:3600,urgency:'high'});
    console.log('enviado',new RD(x.d).toLocaleTimeString('pt-BR'),x.name);
  }catch(e){
    console.error('falha no envio',e.statusCode||'',e.body||e.message);
    if(e.statusCode===404||e.statusCode===410)console.error('A assinatura expirou. Ative os avisos no app de novo e atualize o segredo SUBSCRIPTION.');
    throw e;
  }
}
(async()=>{
  let webpush=null,sub=null;
  if(!DRY){
    webpush=require('web-push');
    const raw=process.env.VAPID_PRIVATE||'';
    const estranhos=[...new Set(PRIV.replace(/[A-Za-z0-9_-]/g,''))].map(c=>c.charCodeAt(0));
    console.log('diagnostico VAPID_PRIVATE: tamanho bruto',raw.length,'| tamanho limpo',PRIV.length,'(esperado 43) | codigos de caracteres invalidos:',JSON.stringify(estranhos));
    try{const sj=JSON.parse((process.env.SUBSCRIPTION||'').trim());console.log('diagnostico SUBSCRIPTION: host',new URL(sj.endpoint).host,'| chaves',Object.keys(sj.keys||{}).join(','))}catch(e){console.log('diagnostico SUBSCRIPTION: JSON invalido -',e.message)}
    if(!process.env.SUBSCRIPTION)throw new Error('Segredo SUBSCRIPTION vazio. Ative os avisos no app e cadastre o código.');
    if(!PRIV)throw new Error('Segredo VAPID_PRIVATE vazio.');
    sub=JSON.parse(process.env.SUBSCRIPTION.trim());
    webpush.setVapidDetails(SUBJECT,PUB,PRIV);
  }
  const {txs}=buildHistory();
  const ok=txs.filter(x=>x.name.indexOf('Rendimento')<0).sort((a,b)=>a.d-b.d);
  if(J==='teste'){await send(webpush,sub,ok[ok.length-1]);return}
  let list;
  if(J==='resto')list=ok.filter(x=>x.d>REAL_NOW);
  else if(WIN[J]){const t0=new RD(REAL_NOW);t0.setHours(0,0,0,0);list=ok.filter(x=>{if(x.d<t0.getTime())return false;const h=new RD(x.d).getHours();return h>=WIN[J][0]&&h<WIN[J][1]})}
  else throw new Error('janela desconhecida: '+J);
  console.log('janela',J,'->',list.length,'avisos');
  for(const x of list){
    const wait=x.d-RD.now();
    if(wait>0){if(DRY)console.log('(esperaria',Math.round(wait/60000),'min)');else await sleep(wait)}
    else if(-wait>3600000){console.log('pulando aviso antigo',x.name);continue}
    await send(webpush,sub,x);
  }
})().catch(e=>{console.error(e.message||e);process.exit(1)});
