const GATE_KEY="holdings-gate-ok";
const PASS="yh888map";
const KEY="holdings-map-v5";
const defaultHoldings=[
{name:"现金 U",ticker:"USDT",type:"cash",shares:29740,cost:29740,price:1,color:"#26A17B"},
{name:"Circle",ticker:"CRCL",type:"stock",shares:130,cost:9960,price:91,color:"#4C6FFF"},
{name:"Rocket Lab",ticker:"RKLB",type:"stock",shares:33,cost:2340,price:62.5,color:"#E23B2C"},
{name:"场外基金",ticker:"OTC",type:"fund",shares:0,cost:2240,price:0,color:"#2B2F3A"},
{name:"Memory ETF",ticker:"DRAM",type:"stock",shares:12.6,cost:720,price:56,color:"#7B5CFF"}
];
let holdings=load();let chart;const tbody=document.getElementById("rows");
function load(){try{const raw=localStorage.getItem(KEY);if(raw)return JSON.parse(raw);}catch(e){}return defaultHoldings.map(x=>({...x}));}
function save(){localStorage.setItem(KEY,JSON.stringify(holdings));}
function n(v){return Number(v)||0;}
function money(v){return n(v).toLocaleString("en-US",{maximumFractionDigits:2});}
function cps(item){return item.type==="cash"?1:(n(item.shares)?n(item.cost)/n(item.shares):0);}
function mv(item){if(item.type==="cash")return n(item.shares)||n(item.cost);if(n(item.shares)&&n(item.price))return n(item.shares)*n(item.price);return n(item.cost);}
function totals(){const cost=holdings.reduce((a,b)=>a+n(b.cost),0);const value=holdings.reduce((a,b)=>a+mv(b),0);const cash=holdings.filter(x=>x.type==="cash").reduce((a,b)=>a+mv(b),0);return{cost,value,cash,invested:value-cash,pnl:value-cost};}
function esc(s){return String(s??"").replaceAll("&","&").replaceAll('"",""");}
function card(k,v,sub,cls){return `<div class="stat"><div class="k">${k}</div><div class="v ${cls||""}">${v}</div><div class="s ${cls||""}">${sub||""}</div></div>`;}
function renderStats(){const t=totals();const cls=t.pnl>=0?"up":"down";const s=t.pnl>=0?"+":"";document.getElementById("stats").innerHTML=card("总市值",money(t.value)+" U")+card("现金 U",money(t.cash)+" U",(t.value?t.cash/t.value*100:0).toFixed(1)+"%")+card("非现金仓位",money(t.invested)+" U",(t.value?t.invested/t.value*100:0).toFixed(1)+"%")+card("总成本",money(t.cost)+" U")+card("浮动盈亏",s+money(t.pnl)+" U",t.cost?s+(t.pnl/t.cost*100).toFixed(2)+"%":"",cls);}
function renderTable(){const t=totals();tbody.innerHTML="";holdings.forEach((item,i)=>{const p=mv(item)-n(item.cost);const w=t.value?mv(item)/t.value*100:0;const cls=p>0.005?"up":p<-0.005?"down":"";const s=p>0.005?"+":"";const tr=document.createElement("tr");tr.innerHTML=`<td><input data-k="name" data-i="${i}" value="${esc(item.name)}"></td><td><input data-k="ticker" data-i="${i}" value="${esc(item.ticker)}"></td><td><select data-k="type" data-i="${i}"><option value="stock"${item.type==="stock"?" selected":""}>股票/ETF</option><option value="fund"${item.type==="fund"?" selected":""}>场外基金</option><option value="cash"${item.type==="cash"?" selected":""}>现金 U</option></select></td><td><input data-k="shares" data-i="${i}" type="number" min="0" step="0.01" value="${item.shares}"></td><td class="num">${item.type==="fund\