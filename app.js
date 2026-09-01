const GATE_KEY = "holdings-gate-ok";
const PASS = "yh888map";
function boot() {
  if (!chart) chart = echarts.init(document.getElementById("tree"));
  renderStats();
  renderTable();
  renderChart();
  refreshPrices();
}
function unlock() {
  document.getElementById("gate").classList.add("ok");
  document.getElementById("app").style.display = "block";
  sessionStorage.setItem(GATE_KEY, "1");
  boot();
  if (chart) chart.resize();
}
document.getElementById("gateGo").onclick = () => {
  const v = document.getElementById("gateInput").value.trim();
  if (v === PASS) unlock();
  else document.getElementById("gateErr").textContent = "访问码不对";
};
document.getElementById("gateInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") document.getElementById("gateGo").click();
});
const KEY = "holdings-map-v5";
const defaultHoldings = [
  { name: "现金 U", ticker: "USDT", type: "cash", shares: 29740, cost: 29740, price: 1, color: "#26A17B" },
  { name: "Circle", ticker: "CRCL", type: "stock", shares: 130, cost: 9960, price: 91, color: "#4C6FFF" },
  { name: "Rocket Lab", ticker: "RKLB", type: "stock", shares: 33, cost: 2340, price: 62.5, color: "#E23B2C" },
  { name: "场外基金", ticker: "OTC", type: "fund", shares: 0, cost: 2240, price: 0, color: "#2B2F3A" },
  { name: "Memory ETF", ticker: "DRAM", type: "stock", shares: 12.6, cost: 720, price: 56, color: "#7B5CFF" }
];
let holdings = load();
const tbody = document.getElementById("rows");
let chart;
function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return defaultHoldings.map((x) => ({ ...x }));
}
function save() { localStorage.setItem(KEY, JSON.stringify(holdings)); }
function n(v) { return Number(v) || 0; }
function money(v) { return n(v).toLocaleString("en-US", { maximumFractionDigits: 2 }); }
function costPerShare(item) {
  if (item.type === "cash") return 1;
  if (n(item.shares) > 0) return n(item.cost) / n(item.shares);
  return 0;
}
function marketValue(item) {
  if (item.type === "cash") return n(item.shares) || n(item.cost);
  if (n(item.shares) > 0 && n(item.price) > 0) return n(item.shares) * n(item.price);
  return n(item.cost);
}
function pnl(item) { return marketValue(item) - n(item.cost); }
function totals() {
  const cost = holdings.reduce((a, b) => a + n(b.cost), 0);
  const value = holdings.reduce((a, b) => a + marketValue(b), 0);
  const cash = holdings.filter((x) => x.type === "cash").reduce((a, b) => a + marketValue(b), 0);
  return { cost, value, cash, invested: value - cash, pnl: value - cost };
}
function renderStats() {
  const t = totals();
  const cls = t.pnl >= 0 ? "up" : "down";
  const sign = t.pnl >= 0 ? "+" : "";
  document.getElementById("stats").innerHTML = `<div class="stat"><div class="k">总市值</div><div class="v">${money(t.value)} U</div></div><div class="stat"><div class="k">现金 U</div><div class="v">${money(t.cash)} U</div><div class="s">${(t.value ? t.cash / t.value * 100 : 0).toFixed(1)}%</div></div><div class="stat"><div class="k">非现金仓位</div><div class="v">${money(t.invested)} U</div><div class="s">${(t.value ? t.invested / t.value * 100 : 0).toFixed(1)}%</div></div><div class="stat"><div class="k">总成本</div><div class="v">${money(t.cost)} U</div></div><div class="stat"><div class="k">浮动盈亏</div><div class="v ${cls}">${sign}${money(t.pnl)} U</div><div class="s ${cls}">${t.cost ? sign + (t.pnl / t.cost * 100).toFixed(2) + "%" : ""}</div></div>`;
}
function renderTable() {
  const t = totals();
  tbody.innerHTML = "";
  holdings.forEach((item, i) => {
    const cps = costPerShare(item);
    const mv = marketValue(item);
    const p = pnl(item);
    const w = t.value ? mv / t.value * 100 : 0;
    const cls = p > 0.005 ? "up" : p < -0.005 ? "down" : "";
    const sign = p > 0.005 ? "+" : "";
    const tr = document.createElement("tr");
    tr.innerHTML = `<td><input data-k="name" data-i="${i}" value="${esc(item.name)}" /></td><td><input data-k="ticker" data-i="${i}" value="${esc(item.ticker)}" /></td><td><select data-k="type" data-i="${i}"><option value="stock" ${item.type==="stock"?"selected":""}>股票/ETF</option><option value="fund\