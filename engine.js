/* Vision Bank - motor compartilhado (app + avisos). Mesma historia, mesmas notificacoes. */
(function(root){
const MIN=900000, MAX=1200000, CLOSE_DAY=5, DUE_DAY=12, CARD_END='4417';
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function hashStr(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
const ymd=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const brl=v=>v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});

/* ---------- catalogo ---------- */
const R=(n,i,a,b,c,o)=>Object.assign({n,i,a,b,c},o||{});
const PIX_OUT=['Rafaela Monteiro','Lucas Andrade','Camila Souza','Pedro Henrique L.','Juliana Prado','Thiago Albuquerque','Mariana Freitas','Eduardo Nogueira'];
const PIX_IN=['Cliente Resolve','Trevo Açaí','LanLan','Cliente Resolve Tráfego','Michelle'];
const OUT_S=[
 R('Supermercado Pão de Açúcar','🛒',120,980,'Mercado',{k:.55,w:[9,21]}),
 R('Atacadão','🛒',200,1400,'Mercado',{k:.3,w:[9,20],dy:2}),
 R('Posto Ipiranga','⛽',90,380,'Transporte',{k:.5,w:[7,20]}),
 R('iFood','🍔',35,180,'Alimentação',{k:.8,w:[11,14]}),
 R('iFood','🍔',35,180,'Alimentação',{k:.8,w:[18,22]}),
 R('Farmácia Pague Menos','💊',25,260,'Saúde',{k:.4,w:[8,20]}),
 R('Uber','🚗',14,75,'Transporte',{k:.7,w:[7,22]}),
 R('Padaria Santo Trigo','🥖',12,90,'Alimentação',{k:.15,w:[7,10]}),
 R('Restaurante Coco Bambu','🍽️',180,620,'Alimentação',{k:.7,w:[12,15],dy:2}),
 R('Restaurante Coco Bambu','🍽️',180,620,'Alimentação',{k:.7,w:[19,22],dy:2}),
 R('Amazon','📦',60,900,'Compras',{k:.9,w:[8,22]}),
 R('Mercado Livre','📦',45,1200,'Compras',{k:.9,w:[8,22]}),
 R('Cinema Kinoplex','🍿',60,140,'Lazer',{k:.6,w:[14,22],dy:2}),
 R('Livraria Leitura','📚',40,260,'Educação',{k:.6,w:[10,19],dy:1}),
 R('Pet Shop','🐾',70,340,'Casa',{k:.5,w:[9,18]}),
 R('Starbucks','☕',18,45,'Alimentação',{k:.5,w:[7,18]}),
 R('Pix enviado • ','💸',40,900,'Transferências',{m:'pix',w:[8,22],pix:1})
];
const OUT_B=[
 R('Pix enviado • Construtora Horizonte','🏗️',8000,38000,'Imóvel',{m:'pix',w:[9,17],dy:1}),
 R('Boleto • Concessionária Toyota','🚙',12000,45000,'Veículo',{m:'boleto',w:[9,17],dy:1}),
 R('Pix enviado • Imobiliária Beira-Mar','🏠',6000,22000,'Imóvel',{m:'pix',w:[9,17],dy:1}),
 R('TED • Agência de Viagens','✈️',5000,28000,'Viagem',{m:'ted',w:[9,17],dy:1}),
 R('Boleto • Escola','🎓',2500,6000,'Educação',{m:'boleto',w:[9,17],dy:1}),
 R('Pix enviado • Oferta Igreja','⛪',1000,5000,'Doações',{m:'pix',w:[9,21]}),
 R('Boleto • IPTU','🧾',2000,7000,'Impostos',{m:'boleto',w:[9,17],dy:1}),
 R('Compra • Loja Apple','📱',4500,15000,'Compras',{k:.7,w:[10,20]}),
 R('Pix enviado • Michelle','💛',1000,8000,'Família',{m:'pix',w:[9,21]})
];
const IN_S=[
 R('Pix recebido • ','💼',800,4500,'Renda',{m:'pix',w:[8,19],pixin:1}),
 R('Cashback','🎁',20,180,'Renda',{w:[9,20]}),
 R('Estorno','↩️',40,300,'Renda',{w:[9,20]})
];
const IN_B=[
 R('TED recebida • Resolve Gestão de Tráfego','🚀',15000,60000,'Renda',{m:'ted',w:[9,17],dy:1}),
 R('Pix recebido • Contrato de gestão','💼',6000,25000,'Renda',{m:'pix',w:[9,17],dy:1}),
 R('Resgate CDB','🏦',10000,50000,'Investimentos',{w:[9,17],dy:1}),
 R('Bonificação anual','🏆',20000,70000,'Renda',{w:[9,17],dy:1})
];
const PLANS=[
 {n:'Loja Apple',i:'📱',per:649.9,cnt:10,y:2026,m:7,day:4,c:'Compras'},
 {n:'Móveis Tok&Stok',i:'🛋️',per:1150,cnt:6,y:2026,m:9,day:18,c:'Casa'},
 {n:'Passagens LATAM',i:'✈️',per:380,cnt:12,y:2026,m:3,day:22,c:'Viagem'}
];

function nextBiz(d){const x=new Date(d);while(x.getDay()===0||x.getDay()===6)x.setDate(x.getDate()+1);return x}
function pick(r,a,b){return +(a+r()*(b-a)).toFixed(2)}

/* eventos fixos do mes (dia, hora, valores por mes) */
function monthEvents(y,m,byDay){
  const r=mulberry32(hashStr('rec'+y+'-'+m));
  const add=(day,t,o,biz)=>{
    let d=new Date(y,m-1,day);if(biz)d=nextBiz(d);
    if(d.getMonth()!==m-1&&!biz)return;
    (byDay[ymd(d)]=byDay[ymd(d)]||[]).push(Object.assign({t,fx:1},o));
  };
  add(1,9*60+10,{name:'Aluguel recebido',ic:'🏢',v:6800,c:'Renda'},1);
  add(2,7*60+40,{name:'Academia Smart Fit',ic:'💪',v:-149.9,c:'Saúde',m:'db'});
  add(3,6*60+0,{name:'Netflix',ic:'🎬',v:-55.9,c:'Assinaturas',card:1});
  add(5,8*60+5,{name:'Pró-labore • Padaria Santo Trigo',ic:'🥖',v:pick(r,9800,12400),c:'Renda'},1);
  add(CLOSE_DAY,10*60,{kind:'close',name:'Fatura Cartão Vision',ic:'💳',v:0,c:'Cartão'});
  add(6,9*60+30,{name:'Boleto • Condomínio',ic:'🏢',v:-pick(r,1280,1420),c:'Casa',m:'boleto'},1);
  add(7,6*60+10,{name:'Spotify',ic:'🎧',v:-21.9,c:'Assinaturas',card:1});
  add(8,10*60+15,{name:'Pix recebido • Contrato de gestão',ic:'💼',v:pick(r,12000,28000),c:'Renda',m:'pix'},1);
  add(9,6*60+20,{name:'iCloud+',ic:'☁️',v:-14.9,c:'Assinaturas',card:1});
  add(10,9*60+45,{name:'Boleto • Energia Enel',ic:'💡',v:-pick(r,420,780),c:'Casa',m:'boleto'},1);
  add(11,9*60,{kind:'due',name:'Fatura Cartão Vision',ic:'💳',v:0,c:'Cartão'});
  add(DUE_DAY,8*60,{kind:'pay',name:'Pagamento • Fatura Cartão Vision',ic:'💳',v:0,c:'Cartão'});
  add(14,10*60+5,{name:'Boleto • Internet Vivo Fibra',ic:'📡',v:-199.9,c:'Casa',m:'boleto'},1);
  add(15,11*60+20,{name:'Lucro • Padaria Santo Trigo',ic:'🥖',v:pick(r,22000,38000),c:'Renda'},1);
  add(20,10*60+30,{name:'Dividendos • ITSA4',ic:'📈',v:pick(r,4000,9500),c:'Investimentos'},1);
  for(const p of PLANS){
    const k=(y*12+m)-(p.y*12+p.m);
    if(k>=0&&k<p.cnt)add(p.day,14*60+(hashStr(p.n)%240),{name:p.n,ic:p.i,v:-p.per,c:p.c,card:1,par:(k+1)+'/'+p.cnt});
  }
}

function buildBase(now,mine,skip){
  const start=new Date(now);start.setHours(0,0,0,0);start.setDate(start.getDate()-120);
  const byDay={};
  for(let y=start.getFullYear(),m=start.getMonth()+1;y*12+m<=now.getFullYear()*12+now.getMonth()+1;){
    monthEvents(y,m,byDay);m++;if(m>12){m=1;y++}
  }
  let bal=1048372.55, cyc=0, closed=18240.55;
  const txs=[], todayKey=ymd(now), nowMin=now.getHours()*60+now.getMinutes();
  for(let d=new Date(start);d<=now;d.setDate(d.getDate()+1)){
    const key=ymd(d), r=mulberry32(hashStr('visao2'+key));
    const wk=d.getDay(), weekend=wk===0||wk===6;
    const day=[{t:30,name:'Rendimento • Conta Remunerada',ic:'💹',v:+(bal*(0.00030+r()*0.00012)).toFixed(2),c:'Rendimentos',kind:'rend',fx:1}];
    const n=weekend?2+Math.floor(r()*4):3+Math.floor(r()*5);
    for(let i=0;i<n;i++){
      const big=r()<(weekend?0.07:0.16);
      let pIn=0.5+(1050000-bal)/300000; pIn=Math.max(.1,Math.min(.9,pIn));
      if(!big)pIn*=0.55;
      const isIn=r()<pIn;
      const list=isIn?(big?IN_B:IN_S):(big?OUT_B:OUT_S);
      let it=null;
      for(let tries=0;tries<8;tries++){
        const c=list[Math.floor(r()*list.length)];
        if(c.dy===1&&weekend)continue;
        if(c.dy===2&&!weekend&&r()<.8)continue;
        it=c;break;
      }
      if(!it)it=list[0];
      const w=it.w||[8,21];
      const t=Math.max(7*60,w[0]*60+Math.floor(r()*Math.max(1,(w[1]-w[0])*60)));
      let name=it.n;
      if(it.pix)name+=PIX_OUT[Math.floor(r()*PIX_OUT.length)];
      if(it.pixin)name+=PIX_IN[Math.floor(r()*PIX_IN.length)];
      const v=pick(r,it.a,it.b);
      const card=!isIn&&it.k&&r()<it.k;
      day.push({t,name,ic:it.i,v:isIn?v:-v,c:it.c,m:it.m||(isIn?'in':(card?'cr':'db')),card:card?1:0,w:1});
    }
    for(const e of (byDay[key]||[]))day.push(Object.assign({},e));
    day.sort((a,b)=>a.t-b.t);
    for(const x of day){
      if(key===todayKey&&x.t>nowMin)continue;
      const dt=new Date(d);dt.setHours(Math.floor(x.t/60),x.t%60,0,0);
      const ts=dt.getTime();
      const push=o=>txs.push(Object.assign({d:ts,name:x.name,ic:x.ic,c:x.c,m:x.m},o));
      if(x.kind==='close'){closed=+cyc.toFixed(2);cyc=0;push({v:0,bal,kind:'info',ev:'close',fat:closed,title:'Fatura fechada',body:'Sua fatura fechou em '+brl(closed)+' e vence dia '+DUE_DAY+'. Pague pelo app quando quiser.'});if(skip&&skip[key.slice(0,7)])closed=0;continue}
      if(x.kind==='due'){if(closed<=0)continue;push({v:0,bal,kind:'info',ev:'due',fat:closed,title:'Fatura vence amanhã',body:'Sua fatura de '+brl(closed)+' vence amanhã. O valor será debitado da conta.'});continue}
      if(x.kind==='pay'){
        if(closed<=0)continue;
        if(skip&&skip[key.slice(0,7)]){closed=0;continue}
        if(bal-closed<MIN+3000){const need=+(MIN+60000-(bal-closed)).toFixed(2);bal=+(bal+need).toFixed(2);txs.push({d:ts-60000,name:'Resgate CDB',ic:'🏦',c:'Investimentos',m:'in',v:need,bal});}
        bal=+(bal-closed).toFixed(2);push({v:-closed,bal,kind:'pay',m:'fatura'});closed=0;continue;
      }
      if(x.card){cyc=+(cyc+Math.abs(x.v)).toFixed(2);push({v:x.v,bal,card:1,fat:cyc,par:x.par,m:'cr'});continue}
      let v=x.v;
      if(x.fx){
        if(bal+v>MAX-3000){const ap=+(bal+v-(MAX-90000)).toFixed(2);bal=+(bal-ap).toFixed(2);txs.push({d:ts-60000,name:'Aplicação • CDB Vision',ic:'🏦',c:'Investimentos',m:'out',v:-ap,bal});}
        else if(bal+v<MIN+3000){const need=+(MIN+60000-(bal+v)).toFixed(2);bal=+(bal+need).toFixed(2);txs.push({d:ts-60000,name:'Resgate CDB',ic:'🏦',c:'Investimentos',m:'in',v:need,bal});}
      }else if(bal+v<MIN+5000||bal+v>MAX-5000){
        v=-v;
        const big=Math.abs(v)>5000;
        const pool=v>0?(big?IN_B:IN_S):(big?OUT_B:OUT_S);
        const it=pool[Math.floor(Math.abs(v))%pool.length];
        x.name=it.n.replace(/ • $/,'')+(it.pix?'Rafaela Monteiro':it.pixin?'Cliente Resolve':'');x.ic=it.i;x.c=it.c;x.m=it.m||(v>0?'in':'db');
        if(bal+v<MIN||bal+v>MAX)continue;
      }
      bal=+(bal+v).toFixed(2);
      txs.push({d:ts,name:x.name,ic:x.ic,c:x.c,m:x.m,v,bal,kind:x.kind==='rend'?'rend':undefined,par:x.par});
    }
  }
  txs.sort((a,b)=>a.d-b.d);
  /* operacoes feitas pelo usuario no app (so no app) */
  let tail=bal;
  for(const m of (mine||[])){tail=+(tail+m.v).toFixed(2);txs.push(Object.assign({c:'Transferências'},m,{bal:tail}))}
  txs.sort((a,b)=>b.d-a.d);
  return {bal:tail,txs,cyc,closed};
}

/* ---------- texto da notificacao: identico no app e no push ---------- */
function msg(x){
  const tag=x.d+'-'+(hashStr(x.name+x.v)%997);
  if(x.kind==='info')return {title:x.title,body:x.body,tag};
  const out=x.v<0, val=brl(Math.abs(x.v));
  const parts=x.name.split(/\s*[•·]\s*/);const who=parts.length>1?parts.slice(1).join(' ').trim():x.name;
  const kn=parts[0];
  let title,body;
  const saldo='\nSaldo '+brl(x.bal);
  if(x.kind==='pay'){return {title:'Fatura paga',body:'Debitamos '+val+' da sua conta para pagar a fatura do cartão Vision.'+saldo,tag}}
  if(x.card){
    title='Compra aprovada no crédito';
    body='Compra de '+val+(x.par?' (parcela '+x.par+')':'')+' aprovada em '+x.name+' no cartão final '+CARD_END+'.\nFatura atual '+brl(x.fat);
    return {title,body,tag};
  }
  if(!out){
    if(/^Pix/i.test(kn)){title='Pix recebido';body='Você recebeu '+val+' de '+who+'.'}
    else if(/^Lucro/i.test(kn)){title='Lucro recebido';body='Distribuição de lucros: você recebeu '+val+' da '+who+'.'}
    else if(/^Pró-labore/i.test(kn)){title='Pró-labore recebido';body='Seu pró-labore de '+val+' da '+who+' caiu na conta.'}
    else if(x.kind==='rend'||/^Rendimento/i.test(x.name)){title='Rendimento creditado';body='Seu saldo rendeu '+val+' hoje.'}
    else if(/^(Resgate)/i.test(kn)){title='Resgate concluído';body='Você resgatou '+val+' do CDB. O valor já está na conta.'}
    else if(/^Aluguel/i.test(kn)){title='Aluguel recebido';body='Você recebeu '+val+' de aluguel.'}
    else{title='Dinheiro na conta';body=x.name+': você recebeu '+val+'.'}
  }else if(/^Pix/i.test(kn)){title='Pix enviado';body='Você enviou '+val+' para '+who+'.'}
  else if(/^Aplicação/i.test(kn)){title='Aplicação realizada';body='Você aplicou '+val+' em '+who+'.'}
  else if(/^(TED|Boleto|Pagamento)/i.test(kn)){title='Pagamento realizado';body=val+' pago em '+who+'.'}
  else{title='Compra aprovada no débito';body='Compra de '+val+' aprovada em '+x.name+'.'}
  return {title,body:body+saldo,tag};
}

const API={MIN,MAX,CLOSE_DAY,DUE_DAY,CARD_END,mulberry32,hashStr,ymd,brl,buildBase,msg};
if(typeof module!=='undefined'&&module.exports)module.exports=API;else root.VB=API;
})(typeof globalThis!=='undefined'?globalThis:this);
