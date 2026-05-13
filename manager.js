"use strict";

const DB_NAME = "AutoostasInformacijasSistema";
const DB_VERSION = 2;

const state = {
  db: null,
  currentUser: null,
  users: [],
  routes: [],
  purchases: [],
  topUps: []
};

const dom = {};

document.addEventListener("DOMContentLoaded", init);

async function init() {
  collectDom();
  bindEvents();

  try {
    state.db = await openDatabase();
    await restoreSession();
    renderHeader();

    if (!state.currentUser || !state.currentUser.isStationManager) {
      showGuard("Šai lapai var piekļūt tikai Autoostas vadītājs.");
      return;
    }

    await loadDashboardData();
    renderDashboard();
  } catch (error) {
    console.error(error);
    showGuard("Neizdevās ielādēt autoostas pārvaldības datus.");
  }
}

function collectDom() {
  Object.assign(dom, {
    managerFullName: document.getElementById("managerFullName"),
    managerGuard: document.getElementById("managerGuard"),
    managerDashboard: document.getElementById("managerDashboard"),
    metricGrid: document.getElementById("metricGrid"),
    reportResult: document.getElementById("reportResult"),
    usersTable: document.getElementById("usersTable"),
    routesTable: document.getElementById("routesTable"),
    topUpsTable: document.getElementById("topUpsTable"),
    ticketsTable: document.getElementById("ticketsTable"),
    toast: document.getElementById("toast")
  });
}

function bindEvents() {
  document.querySelectorAll("[data-report]").forEach((button) => {
    button.addEventListener("click", () => renderReport(button.dataset.report));
  });
}

function openDatabase() {
  return apiRequest("/api/health");
}

async function getRecord(storeName, key) {
  return apiRequest(`/api/store/${storeName}/${encodeURIComponent(key)}`);
}

async function getAllRecords(storeName) {
  return apiRequest(`/api/store/${storeName}`);
}

async function apiRequest(path, options = {}) {
  const response = await fetch(path, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "SQL API pieprasījums neizdevās.");
  }

  return data;
}

async function restoreSession() {
  const username = localStorage.getItem("ais.currentUser");
  if (!username) {
    return;
  }

  state.currentUser = await getRecord("users", username);
}

async function loadDashboardData() {
  const [users, routes, purchases, topUps] = await Promise.all([
    getAllRecords("users"),
    getAllRecords("routes"),
    getAllRecords("purchases"),
    getAllRecords("topUps")
  ]);

  state.users = users.sort((a, b) => fullName(a).localeCompare(fullName(b), "lv"));
  state.routes = routes.sort((a, b) => String(a.name).localeCompare(String(b.name), "lv"));
  state.purchases = purchases.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  state.topUps = topUps.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function renderHeader() {
  dom.managerFullName.textContent = state.currentUser ? fullName(state.currentUser) : "Nav pieslēdzies";
}

function showGuard(message) {
  dom.managerDashboard.classList.add("is-hidden");
  dom.managerGuard.classList.remove("is-hidden");
  dom.managerGuard.innerHTML = `
    <div class="empty-state">
      <strong>${escapeHtml(message)}</strong>
      <div class="route-actions guard-actions">
        <a class="primary-btn" href="index.html#driverPanel">Atgriezties sākumlapā</a>
      </div>
    </div>
  `;
}

function renderDashboard() {
  dom.managerGuard.classList.add("is-hidden");
  dom.managerDashboard.classList.remove("is-hidden");
  renderMetrics();
  renderUsersTable();
  renderRoutesTable();
  renderTopUpsTable();
  renderTicketsTable();
}

function renderMetrics() {
  const totalBalances = state.users.reduce((sum, user) => sum + Number(user.balance || 0), 0);
  const ticketIncome = state.purchases.reduce((sum, purchase) => sum + Number(purchase.price || 0), 0);
  const topUpIncome = state.topUps.reduce((sum, topUp) => sum + Number(topUp.amount || 0), 0);

  dom.metricGrid.innerHTML = [
    metricCard("Lietotāji", state.users.length),
    metricCard("Maršruti", state.routes.length),
    metricCard("Pirktās biļetes", state.purchases.length),
    metricCard("Biļešu ieņēmumi", formatMoney(ticketIncome)),
    metricCard("Bilances iemaksas", formatMoney(topUpIncome)),
    metricCard("Kopējā kontu bilance", formatMoney(totalBalances))
  ].join("");
}

function metricCard(label, value) {
  return `
    <article class="metric-card">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(String(value))}</strong>
    </article>
  `;
}

function renderUsersTable() {
  const rows = state.users.map((user) => `
    <tr>
      <td>${escapeHtml(fullName(user))}</td>
      <td>${escapeHtml(user.username)}</td>
      <td>${escapeHtml(String(user.age || ""))}</td>
      <td>${escapeHtml(getUserRoleLabel(user))}</td>
      <td>${formatMoney(user.balance || 0)}</td>
      <td>${formatDateTime(user.createdAt)}</td>
    </tr>
  `).join("");

  dom.usersTable.innerHTML = tableHtml(
    ["Vārds", "Konts", "Vecums", "Loma", "Bilance", "Izveidots"],
    rows,
    "Nav izveidots neviens konts."
  );
}

function renderRoutesTable() {
  const rows = state.routes.map((route) => {
    const schedules = getRouteSchedules(route);
    const driver = state.users.find((user) => user.username === route.driverUsername);
    return `
      <tr>
        <td>${escapeHtml(route.name)}</td>
        <td>${escapeHtml(route.start)} -> ${escapeHtml(route.end)}</td>
        <td>${formatMoney(route.price || 0)}</td>
        <td>${escapeHtml(driver ? fullName(driver) : route.driverUsername || "Sistēma")}</td>
        <td>${schedules.map((time) => `${escapeHtml(time.departure)}-${escapeHtml(time.arrival)}`).join(", ")}</td>
      </tr>
    `;
  }).join("");

  dom.routesTable.innerHTML = tableHtml(
    ["Reiss", "Maršruts", "Cena", "Šoferis", "Laiki"],
    rows,
    "Nav saglabāts neviens maršruts."
  );
}

function renderTopUpsTable() {
  const rows = state.topUps.map((topUp) => `
    <tr>
      <td>${escapeHtml(topUp.firstName || "")} ${escapeHtml(topUp.lastName || "")}</td>
      <td>${escapeHtml(topUp.username)}</td>
      <td>${formatMoney(topUp.amount || 0)}</td>
      <td>${formatMoney(topUp.balanceAfter || 0)}</td>
      <td>${formatDateTime(topUp.createdAt)}</td>
    </tr>
  `).join("");

  dom.topUpsTable.innerHTML = tableHtml(
    ["Lietotājs", "Konts", "Iemaksa", "Bilance pēc", "Laiks"],
    rows,
    "Bilances iemaksu vēl nav."
  );
}

function renderTicketsTable() {
  const rows = state.purchases.map((purchase) => `
    <tr>
      <td>${escapeHtml(purchase.ticketNumber || purchase.id)}</td>
      <td>${escapeHtml(purchase.firstName || "")} ${escapeHtml(purchase.lastName || "")}</td>
      <td>${escapeHtml(purchase.routeName)}</td>
      <td>${escapeHtml(purchase.departure || "")}${purchase.arrival ? ` - ${escapeHtml(purchase.arrival)}` : ""}</td>
      <td>${formatMoney(purchase.price || 0)}</td>
      <td>${purchase.paid ? "Jā" : "Nē"}</td>
      <td>${formatDateTime(purchase.createdAt)}</td>
    </tr>
  `).join("");

  dom.ticketsTable.innerHTML = tableHtml(
    ["Biļete", "Pircējs", "Reiss", "Laiks", "Cena", "Apmaksāts", "Pirkuma laiks"],
    rows,
    "Pirktu biļešu vēl nav."
  );
}

function tableHtml(headers, rows, emptyMessage) {
  if (!rows) {
    return `<div class="empty-state">${escapeHtml(emptyMessage)}</div>`;
  }

  return `
    <table class="data-table">
      <thead>
        <tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function renderReport(type) {
  const reports = {
    "top-spender": getTopSpenderReport,
    "best-route": getBestRouteReport,
    "popular-route": getPopularRouteReport,
    "largest-topup": getLargestTopUpReport,
    "total-income": getTotalIncomeReport
  };

  dom.reportResult.innerHTML = reports[type]();
}

function getTopSpenderReport() {
  const byUser = sumBy(state.purchases, "username", "price");
  const winner = maxEntry(byUser);
  if (!winner) {
    return reportHtml("Visvairāk iztērēts", "Biļešu pirkumu vēl nav.");
  }

  const user = state.users.find((item) => item.username === winner.key);
  return reportHtml("Visvairāk iztērēts", `${user ? fullName(user) : winner.key} kopā iztērēja ${formatMoney(winner.value)}.`);
}

function getBestRouteReport() {
  const byRoute = sumBy(state.purchases, "routeId", "price");
  const winner = maxEntry(byRoute);
  if (!winner) {
    return reportHtml("Visizdevīgākais brauciens", "Biļešu pirkumu vēl nav.");
  }

  const route = state.routes.find((item) => item.id === winner.key);
  return reportHtml("Visizdevīgākais brauciens", `${route ? route.name : winner.key} nopelnīja ${formatMoney(winner.value)}.`);
}

function getPopularRouteReport() {
  const byRoute = countBy(state.purchases, "routeId");
  const winner = maxEntry(byRoute);
  if (!winner) {
    return reportHtml("Populārākais maršruts", "Biļešu pirkumu vēl nav.");
  }

  const route = state.routes.find((item) => item.id === winner.key);
  return reportHtml("Populārākais maršruts", `${route ? route.name : winner.key} tika nopirkts ${winner.value} reizes.`);
}

function getLargestTopUpReport() {
  const topUp = [...state.topUps].sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0))[0];
  if (!topUp) {
    return reportHtml("Lielākā iemaksa", "Bilances iemaksu vēl nav.");
  }

  return reportHtml("Lielākā iemaksa", `${topUp.firstName} ${topUp.lastName} iemaksāja ${formatMoney(topUp.amount)}.`);
}

function getTotalIncomeReport() {
  const ticketIncome = state.purchases.reduce((sum, purchase) => sum + Number(purchase.price || 0), 0);
  const topUpIncome = state.topUps.reduce((sum, topUp) => sum + Number(topUp.amount || 0), 0);
  return reportHtml(
    "Kopējie ienākumi",
    `Biļetes: ${formatMoney(ticketIncome)}. Bilances iemaksas: ${formatMoney(topUpIncome)}. Kopā sistēmā: ${formatMoney(ticketIncome + topUpIncome)}.`
  );
}

function reportHtml(title, body) {
  return `
    <strong>${escapeHtml(title)}</strong>
    <span>${escapeHtml(body)}</span>
  `;
}

function sumBy(items, keyField, valueField) {
  return items.reduce((map, item) => {
    const key = item[keyField] || "unknown";
    map.set(key, (map.get(key) || 0) + Number(item[valueField] || 0));
    return map;
  }, new Map());
}

function countBy(items, keyField) {
  return items.reduce((map, item) => {
    const key = item[keyField] || "unknown";
    map.set(key, (map.get(key) || 0) + 1);
    return map;
  }, new Map());
}

function maxEntry(map) {
  let best = null;
  map.forEach((value, key) => {
    if (!best || value > best.value) {
      best = { key, value };
    }
  });
  return best;
}

function fullName(user) {
  return `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username;
}

function getUserRoleLabel(user) {
  if (user.isStationManager) {
    return "Autoostas vadītājs";
  }

  if (user.isDriver) {
    return "Autobusa vadītājs";
  }

  return "Pasažieris";
}

function getRouteSchedules(route) {
  const schedules = Array.isArray(route.schedules)
    ? route.schedules
    : [{ departure: route.departure, arrival: route.arrival }];

  const normalized = schedules
    .filter((time) => time && time.departure && time.arrival)
    .map((time) => ({ departure: time.departure, arrival: time.arrival }));

  return normalized.length ? normalized : [{ departure: "", arrival: "" }];
}

function formatMoney(value) {
  return `${toMoneyNumber(value).toFixed(2)} EUR`;
}

function toMoneyNumber(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function formatDateTime(value) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("lv-LV", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
