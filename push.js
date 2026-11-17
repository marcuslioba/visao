const J=process.env.JANELA||'teste';
const DRY=process.env.DRY==='1';
const PUB=(process.env.VAPID_PUBLIC||'').trim();
const PRIV=(process.env.VAPID_PRIVATE||'').replace(/[\s"'=]/g,'');
const SUBJECT='https://marcuslioba.github.io/visao/';
const RD=Date;
const REAL_NOW=RD.now();
const E=require('./engine.js');
const brl=E.brl, msg=E.msg;
function buildHistory(){const n=new RD(REAL_NOW);return E.buildBase(J==='teste'?n:new RD(n.getFullYear(),n.getMonth(),n.getDate(),23,59,0),[])}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const WIN={janela1:[7,11],janela2:[11,15],janela3:[15,19],janela4:[19,24]};
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
  const ok=txs.filter(x=>x.kind!=='rend').sort((a,b)=>a.d-b.d);
  if(J==='teste'){await send(webpush,sub,ok[ok.length-1]);return}
  let list;
  if(J==='agora')list=ok.filter(x=>x.d<=REAL_NOW&&x.d>REAL_NOW-25*60000);
  else if(J==='resto')list=ok.filter(x=>x.d>REAL_NOW);
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
