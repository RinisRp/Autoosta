"use strict";

const DB_NAME = "AutoostasInformacijasSistema";
const DB_VERSION = 2;
const DATA_CODEWORDS_V4_L = 80;
const ECC_CODEWORDS_V4_L = 20;

const seedRoutes = [
  {
    id: "seed-riga-liepaja",
    name: "Rīga - Liepāja ekspresis",
    start: "Rīga SAO",
    end: "Liepāja AO",
    stops: ["Saldus", "Brocēni", "Grobiņa"],
    departure: "08:10",
    arrival: "11:35",
    schedules: [
      { departure: "08:10", arrival: "11:35" },
      { departure: "12:10", arrival: "15:35" },
      { departure: "16:10", arrival: "19:35" }
    ],
    price: 12.5,
    driverUsername: "sistema",
    createdAt: "2026-05-03T08:00:00.000Z",
    updatedAt: "2026-05-03T08:00:00.000Z"
  },
  {
    id: "seed-riga-daugavpils",
    name: "Rīga - Daugavpils rīta reiss",
    start: "Rīga SAO",
    end: "Daugavpils AO",
    stops: ["Ogre", "Jēkabpils", "Līvāni"],
    departure: "09:25",
    arrival: "13:10",
    schedules: [
      { departure: "09:25", arrival: "13:10" },
      { departure: "13:25", arrival: "17:10" },
      { departure: "18:25", arrival: "22:10" }
    ],
    price: 10.8,
    driverUsername: "sistema",
    createdAt: "2026-05-03T08:00:00.000Z",
    updatedAt: "2026-05-03T08:00:00.000Z"
  },
  {
    id: "seed-jelgava-riga",
    name: "Jelgava - Rīga darba dienu reiss",
    start: "Jelgava AO",
    end: "Rīga SAO",
    stops: ["Ozolnieki", "Olaine", "Mārupe"],
    departure: "07:05",
    arrival: "08:15",
    schedules: [
      { departure: "07:05", arrival: "08:15" },
      { departure: "08:05", arrival: "09:15" },
      { departure: "17:05", arrival: "18:15" }
    ],
    price: 4.2,
    driverUsername: "sistema",
    createdAt: "2026-05-03T08:00:00.000Z",
    updatedAt: "2026-05-03T08:00:00.000Z"
  },
  {
    id: "seed-ventspils-riga",
    name: "Ventspils - Rīga vakara reiss",
    start: "Ventspils AO",
    end: "Rīga SAO",
    stops: ["Talsi", "Tukums", "Jūrmala"],
    departure: "17:40",
    arrival: "21:05",
    schedules: [
      { departure: "09:40", arrival: "13:05" },
      { departure: "13:40", arrival: "17:05" },
      { departure: "17:40", arrival: "21:05" }
    ],
    price: 11.7,
    driverUsername: "sistema",
    createdAt: "2026-05-03T08:00:00.000Z",
    updatedAt: "2026-05-03T08:00:00.000Z"
  }
];

const state = {
  db: null,
  currentUser: null,
  routes: [],
  selectedRouteId: null,
  selectedScheduleId: null,
  filters: { from: "", to: "" },
  routeStops: ["", "", ""],
  receiptUrl: null,
  toastTimer: null
};

const dom = {};

document.addEventListener("DOMContentLoaded", init);

async function init() {
  collectDom();
  bindEvents();

  try {
    state.db = await openDatabase();
    await ensureSeedRoutes();
    await restoreSession();
    await reloadRoutes();
    resetRouteForm();
    renderAll();
    showStoredNotice();
  } catch (error) {
    console.error(error);
    notify("Neizdevās pieslēgties SQL datu bāzei. Palaid server.py un atver lapu caur http://127.0.0.1:8000.", "error");
  }
}

function collectDom() {
  Object.assign(dom, {
    guestActions: document.getElementById("guestActions"),
    userBar: document.getElementById("userBar"),
    userFullName: document.getElementById("userFullName"),
    balanceValue: document.getElementById("balanceValue"),
    driverBadge: document.getElementById("driverBadge"),
    stationBadge: document.getElementById("stationBadge"),
    manageStationBtn: document.getElementById("manageStationBtn"),
    openLoginBtn: document.getElementById("openLoginBtn"),
    openRegisterBtn: document.getElementById("openRegisterBtn"),
    logoutBtn: document.getElementById("logoutBtn"),
    profileBtn: document.getElementById("profileBtn"),
    balanceBtn: document.getElementById("balanceBtn"),
    loginDialog: document.getElementById("loginDialog"),
    registerDialog: document.getElementById("registerDialog"),
    balanceDialog: document.getElementById("balanceDialog"),
    profileDialog: document.getElementById("profileDialog"),
    driverApplicationDialog: document.getElementById("driverApplicationDialog"),
    loginForm: document.getElementById("loginForm"),
    registerForm: document.getElementById("registerForm"),
    driverApplicationForm: document.getElementById("driverApplicationForm"),
    searchForm: document.getElementById("searchForm"),
    fromInput: document.getElementById("fromInput"),
    toInput: document.getElementById("toInput"),
    showAllRoutesBtn: document.getElementById("showAllRoutesBtn"),
    routeResults: document.getElementById("routeResults"),
    selectedRouteBox: document.getElementById("selectedRouteBox"),
    ticketResult: document.getElementById("ticketResult"),
    showLoginPassword: document.getElementById("showLoginPassword"),
    loginUsername: document.getElementById("loginUsername"),
    loginPassword: document.getElementById("loginPassword"),
    registerFirstName: document.getElementById("registerFirstName"),
    registerLastName: document.getElementById("registerLastName"),
    registerAge: document.getElementById("registerAge"),
    registerUsername: document.getElementById("registerUsername"),
    registerPassword: document.getElementById("registerPassword"),
    registerPasswordRepeat: document.getElementById("registerPasswordRepeat"),
    balanceDialogAmount: document.getElementById("balanceDialogAmount"),
    topUpAmount: document.getElementById("topUpAmount"),
    topUpBtn: document.getElementById("topUpBtn"),
    expensesList: document.getElementById("expensesList"),
    profileTitle: document.getElementById("profileTitle"),
    profileDetails: document.getElementById("profileDetails"),
    applyDriverBtn: document.getElementById("applyDriverBtn"),
    becomeStationManagerBtn: document.getElementById("becomeStationManagerBtn"),
    licenseNumber: document.getElementById("licenseNumber"),
    experienceYears: document.getElementById("experienceYears"),
    driverMotivation: document.getElementById("driverMotivation"),
    driverPanel: document.getElementById("driverPanel"),
    routeForm: document.getElementById("routeForm"),
    editingRouteId: document.getElementById("editingRouteId"),
    routeNameInput: document.getElementById("routeNameInput"),
    routePriceInput: document.getElementById("routePriceInput"),
    routeStartInput: document.getElementById("routeStartInput"),
    routeEndInput: document.getElementById("routeEndInput"),
    routeDepartureInput: document.getElementById("routeDepartureInput"),
    routeArrivalInput: document.getElementById("routeArrivalInput"),
    stopsList: document.getElementById("stopsList"),
    appendStopBtn: document.getElementById("appendStopBtn"),
    saveRouteBtn: document.getElementById("saveRouteBtn"),
    resetRouteFormBtn: document.getElementById("resetRouteFormBtn"),
    driverRoutesList: document.getElementById("driverRoutesList"),
    toast: document.getElementById("toast")
  });
}

function bindEvents() {
  dom.openLoginBtn.addEventListener("click", () => openDialog(dom.loginDialog));
  dom.openRegisterBtn.addEventListener("click", () => openDialog(dom.registerDialog));
  dom.logoutBtn.addEventListener("click", logout);
  dom.profileBtn.addEventListener("click", openProfile);
  dom.balanceBtn.addEventListener("click", openBalance);
  dom.showLoginPassword.addEventListener("change", () => {
    dom.loginPassword.type = dom.showLoginPassword.checked ? "text" : "password";
  });

  document.querySelectorAll("[data-close-dialog]").forEach((button) => {
    button.addEventListener("click", () => {
      const dialog = button.closest("dialog");
      if (dialog) {
        dialog.close();
      }
    });
  });

  dom.loginForm.addEventListener("submit", handleLogin);
  dom.registerForm.addEventListener("submit", handleRegister);
  [dom.loginForm, dom.registerForm, dom.driverApplicationForm].forEach((form) => {
    form.addEventListener("input", () => clearFormErrors(form));
  });
  dom.searchForm.addEventListener("submit", handleSearch);
  dom.showAllRoutesBtn.addEventListener("click", showAllRoutes);
  dom.routeResults.addEventListener("click", handleRouteListClick);
  dom.selectedRouteBox.addEventListener("click", handleSelectedRouteClick);
  dom.topUpBtn.addEventListener("click", handleTopUp);
  dom.applyDriverBtn.addEventListener("click", () => {
    dom.profileDialog.close();
    openDialog(dom.driverApplicationDialog);
  });
  dom.becomeStationManagerBtn.addEventListener("click", handleBecomeStationManager);
  dom.driverApplicationForm.addEventListener("submit", handleDriverApplication);
  if (dom.routeForm) {
    dom.routeForm.addEventListener("submit", handleRouteSave);
  }
  if (dom.appendStopBtn) {
    dom.appendStopBtn.addEventListener("click", () => addStop(state.routeStops.length - 1));
  }
  if (dom.stopsList) {
    dom.stopsList.addEventListener("click", handleStopsClick);
    dom.stopsList.addEventListener("input", handleStopsInput);
  }
  if (dom.resetRouteFormBtn) {
    dom.resetRouteFormBtn.addEventListener("click", resetRouteForm);
  }
  dom.driverRoutesList.addEventListener("click", handleDriverRoutesClick);
}

function openDatabase() {
  return apiRequest("/api/health");
}

async function apiRequest(path, options = {}) {
  const response = await fetch(path, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "SQL API pieprasījums neizdevās.");
  }

  return data;
}

async function getRecord(storeName, key) {
  return apiRequest(`/api/store/${storeName}/${encodeURIComponent(key)}`);
}

async function findUserByUsername(username) {
  const normalized = normalizeUsername(username);
  const users = await getAllRecords("users");
  return users.find((user) => normalizeUsername(user.username) === normalized);
}

async function getAllRecords(storeName) {
  return apiRequest(`/api/store/${storeName}`);
}

async function putRecord(storeName, value) {
  return apiRequest(`/api/store/${storeName}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(value)
  });
}

async function postAction(path, value) {
  return apiRequest(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(value)
  });
}

async function ensureSeedRoutes() {
  const routes = await getAllRecords("routes");
  if (routes.length > 0) {
    return;
  }

  for (const route of seedRoutes) {
    await putRecord("routes", route);
  }
}

async function restoreSession() {
  const username = localStorage.getItem("ais.currentUser");
  if (!username) {
    return;
  }

  const user = await getRecord("users", username);
  if (user) {
    state.currentUser = user;
  } else {
    localStorage.removeItem("ais.currentUser");
  }
}

async function reloadRoutes() {
  state.routes = (await getAllRecords("routes")).sort((a, b) => {
    const byTime = getFirstSchedule(a).departure.localeCompare(getFirstSchedule(b).departure);
    return byTime || String(a.name).localeCompare(String(b.name), "lv");
  });
}

function renderAll() {
  renderAuth();
  renderRouteResults();
  renderSelectedRoute();
  renderDriverPanel();
}

function renderAuth() {
  if (!state.currentUser) {
    dom.guestActions.classList.remove("is-hidden");
    dom.userBar.classList.add("is-hidden");
    dom.driverBadge.classList.add("is-hidden");
    dom.stationBadge.classList.add("is-hidden");
    dom.manageStationBtn.classList.add("is-hidden");
    return;
  }

  dom.guestActions.classList.add("is-hidden");
  dom.userBar.classList.remove("is-hidden");
  dom.userFullName.textContent = `${state.currentUser.firstName} ${state.currentUser.lastName}`;
  dom.balanceValue.textContent = formatMoney(state.currentUser.balance);
  dom.driverBadge.classList.toggle("is-hidden", !state.currentUser.isDriver);
  dom.stationBadge.classList.toggle("is-hidden", !state.currentUser.isStationManager);
  dom.manageStationBtn.classList.toggle("is-hidden", !state.currentUser.isStationManager);
}

function renderRouteResults() {
  const routes = getFilteredRoutes();

  if (!routes.length) {
    dom.routeResults.innerHTML = `<div class="empty-state">Nav atrasts neviens piemērots maršruts. Pamēģini citu sākumu vai galapunktu.</div>`;
    return;
  }

  dom.routeResults.innerHTML = routes.map((route) => routeCardHtml(route, { showSelect: true })).join("");
}

function routeCardHtml(route, options = {}) {
  const selected = route.id === state.selectedRouteId;
  const schedules = getRouteSchedules(route);
  const firstSchedule = schedules[0];
  const scheduleChips = schedules.slice(0, 4).map((time) => `<span>${escapeHtml(time.departure)} - ${escapeHtml(time.arrival)}</span>`).join("");
  const moreSchedules = schedules.length > 4 ? `<span>+${schedules.length - 4} vēl</span>` : "";
  const stops = route.stops && route.stops.length
    ? route.stops.map((stop) => `<span>${escapeHtml(stop)}</span>`).join("")
    : "<span>Bez starppieturām</span>";
  const button = options.showSelect
    ? `<button class="${selected ? "primary-btn" : "ghost-btn"} compact" type="button" data-select-route="${escapeHtml(route.id)}">${selected ? "Izvēlēts" : "Izvēlēties"}</button>`
    : "";
  const editButton = options.showEdit
    ? `<a class="ghost-btn compact" href="route.html?id=${encodeURIComponent(route.id)}">Labot</a>`
    : "";

  return `
    <article class="route-card ${selected ? "selected" : ""}">
      <div class="route-top">
        <div>
          <h3>${escapeHtml(route.name)}</h3>
          <div class="route-meta">
            <span>${escapeHtml(route.start)} → ${escapeHtml(route.end)}</span>
            <span>${escapeHtml(firstSchedule.departure)} - ${escapeHtml(firstSchedule.arrival)}</span>
            <span>${schedules.length} ${schedules.length === 1 ? "laiks" : "laiki"}</span>
          </div>
        </div>
        <div class="route-price">${formatMoney(route.price)}</div>
      </div>
      <div class="route-stops route-times">${scheduleChips}${moreSchedules}</div>
      <div class="route-stops">${stops}</div>
      <div class="route-actions">${button}${editButton}</div>
    </article>
  `;
}

function renderSelectedRoute() {
  if (state.receiptUrl) {
    URL.revokeObjectURL(state.receiptUrl);
    state.receiptUrl = null;
  }

  dom.ticketResult.classList.add("is-hidden");
  dom.ticketResult.innerHTML = "";

  const route = findRoute(state.selectedRouteId);
  if (!route) {
    dom.selectedRouteBox.className = "empty-state";
    dom.selectedRouteBox.innerHTML = "Izvēlies reisu no saraksta, lai redzētu cenu un samaksātu.";
    return;
  }

  const schedules = getRouteSchedules(route);
  if (!state.selectedScheduleId || !schedules.some((time) => time.id === state.selectedScheduleId)) {
    state.selectedScheduleId = schedules[0].id;
  }
  const scheduleButtons = schedules.map((time) => `
    <button class="${time.id === state.selectedScheduleId ? "primary-btn" : "ghost-btn"} compact" type="button" data-select-schedule="${escapeHtml(time.id)}">
      ${escapeHtml(time.departure)} - ${escapeHtml(time.arrival)}
    </button>
  `).join("");
  const selectedSchedule = schedules.find((time) => time.id === state.selectedScheduleId) || schedules[0];

  dom.selectedRouteBox.className = "ticket-card";
  dom.selectedRouteBox.innerHTML = `
    <h3>${escapeHtml(route.name)}</h3>
    <div class="route-meta">
      <span>${escapeHtml(route.start)} → ${escapeHtml(route.end)}</span>
      <span>${escapeHtml(selectedSchedule.departure)} - ${escapeHtml(selectedSchedule.arrival)}</span>
    </div>
    <div class="schedule-picker">
      <strong>Izvēlies reisa laiku</strong>
      <div class="route-actions">${scheduleButtons}</div>
    </div>
    <div class="ticket-total">
      <span>Cena</span>
      <span>${formatMoney(route.price)}</span>
    </div>
    <button class="primary-btn" type="button" data-pay-route="${escapeHtml(route.id)}">
      ${state.currentUser ? "Apmaksāt" : "Pieteikties, lai apmaksātu"}
    </button>
  `;
}

function renderTicketResult(purchase, route) {
  const receiptText = buildReceiptText(purchase, route);
  const receiptBlob = new Blob([receiptText], { type: "text/plain;charset=utf-8" });
  state.receiptUrl = URL.createObjectURL(receiptBlob);

  dom.ticketResult.classList.remove("is-hidden");
  dom.ticketResult.innerHTML = `
    <h3>Biļete apmaksāta</h3>
    <canvas id="ticketQr" width="328" height="328" aria-label="Biļetes QR kods"></canvas>
    <a class="primary-btn" href="${state.receiptUrl}" download="ceks-${escapeHtml(purchase.ticketNumber)}.txt">Lejupielādēt čeku</a>
  `;

  const canvas = document.getElementById("ticketQr");
  const qrPayload = createTicketPayload(purchase);
  drawQrCode(qrPayload, canvas);
}

function renderDriverPanel() {
  const isDriver = Boolean(state.currentUser && state.currentUser.isDriver);
  dom.driverPanel.classList.toggle("is-hidden", !isDriver);
  if (!isDriver) {
    return;
  }

  renderDriverRoutes();
}

function renderStopsEditor() {
  dom.stopsList.innerHTML = state.routeStops.map((stop, index) => {
    const row = `
      <div class="stop-row">
        <label>
          <span>Pieturvieta ${index + 1}</span>
          <input type="text" value="${escapeHtml(stop)}" data-stop-index="${index}" placeholder="Piemēram, Saldus">
        </label>
        <button class="small-icon-btn" type="button" data-remove-stop="${index}" aria-label="Noņemt pieturvietu" title="Noņemt pieturvietu">−</button>
      </div>
    `;
    const between = index < state.routeStops.length - 1
      ? `<div class="between-stop"><button class="small-icon-btn" type="button" data-insert-stop-after="${index}" aria-label="Pievienot pieturvietu starp esošajām" title="Pievienot pieturvietu starp esošajām">+</button></div>`
      : "";
    return row + between;
  }).join("");
}

function renderDriverRoutes() {
  const username = state.currentUser.username;
  const ownRoutes = state.routes.filter((route) => route.driverUsername === username);

  if (!ownRoutes.length) {
    dom.driverRoutesList.innerHTML = `<div class="empty-state">Te vēl nav neviena tava maršruta.</div>`;
    return;
  }

  dom.driverRoutesList.innerHTML = ownRoutes.map((route) => routeCardHtml(route, { showEdit: true })).join("");
}

function getFilteredRoutes() {
  const from = normalizeText(state.filters.from);
  const to = normalizeText(state.filters.to);

  return state.routes.filter((route) => {
    if (!from && !to) {
      return true;
    }

    const points = [route.start, ...(route.stops || []), route.end].map(normalizeText);

    if (from && to) {
      const fromIndex = points.findIndex((point) => point.includes(from));
      if (fromIndex === -1) {
        return false;
      }
      return points.some((point, index) => index > fromIndex && point.includes(to));
    }

    if (from) {
      return points.some((point) => point.includes(from));
    }

    return points.some((point) => point.includes(to));
  });
}

async function handleLogin(event) {
  event.preventDefault();
  clearFormErrors(dom.loginForm);

  const username = dom.loginUsername.value.trim();
  const password = dom.loginPassword.value;
  const invalidFields = [];

  if (!username) {
    invalidFields.push(dom.loginUsername);
  }

  if (!password) {
    invalidFields.push(dom.loginPassword);
  }

  if (invalidFields.length) {
    setFormError(dom.loginForm, "Ievadi konta nosaukumu un paroli.", invalidFields);
    return;
  }

  let user;
  try {
    user = await postAction("/api/login", { username, password });
  } catch (error) {
    setFormError(dom.loginForm, "Nepareizs konta nosaukums vai parole.", [dom.loginUsername, dom.loginPassword]);
    notify("Nepareizs konta nosaukums vai parole.", "error");
    return;
  }

  state.currentUser = user;
  localStorage.setItem("ais.currentUser", user.username);
  dom.loginForm.reset();
  dom.loginDialog.close();
  renderAll();
  notify("Pieteikšanās veiksmīga.");
}

async function handleRegister(event) {
  event.preventDefault();
  clearFormErrors(dom.registerForm);

  const firstName = dom.registerFirstName.value.trim();
  const lastName = dom.registerLastName.value.trim();
  const age = Number(dom.registerAge.value);
  const username = dom.registerUsername.value.trim();
  const password = dom.registerPassword.value;
  const repeat = dom.registerPasswordRepeat.value;

  if (!firstName || !lastName) {
    const fields = [];
    if (!firstName) {
      fields.push(dom.registerFirstName);
    }
    if (!lastName) {
      fields.push(dom.registerLastName);
    }
    setFormError(dom.registerForm, "Vārds un uzvārds ir obligāti jāieraksta.", fields);
    notify("Vārds un uzvārds ir obligāti jāieraksta.", "error");
    return;
  }

  if (!username) {
    setFormError(dom.registerForm, "Ievadi konta nosaukumu.", dom.registerUsername);
    notify("Ievadi konta nosaukumu.", "error");
    return;
  }

  if (!Number.isFinite(age) || age < 1 || age > 120) {
    setFormError(dom.registerForm, "Vecumam jābūt no 1 līdz 120.", dom.registerAge);
    notify("Vecumam jābūt no 1 līdz 120.", "error");
    return;
  }

  const passwordCheck = validatePassword(password);
  if (!passwordCheck.ok) {
    setFormError(dom.registerForm, passwordCheck.message, dom.registerPassword);
    notify(passwordCheck.message, "error");
    return;
  }

  if (password !== repeat) {
    setFormError(dom.registerForm, "Paroles nesakrīt.", [dom.registerPassword, dom.registerPasswordRepeat]);
    notify("Paroles nesakrīt.", "error");
    return;
  }

  const existingUser = await findUserByUsername(username);
  if (existingUser) {
    setFormError(dom.registerForm, "Šāds konta nosaukums jau eksistē. Izvēlies citu.", dom.registerUsername);
    notify("Šāds konta nosaukums jau eksistē.", "error");
    return;
  }

  let user;
  try {
    user = await postAction("/api/register", {
      username,
      firstName,
      lastName,
      age,
      password
    });
  } catch (error) {
    setFormError(dom.registerForm, error.message, [dom.registerUsername, dom.registerPassword]);
    notify(error.message, "error");
    return;
  }

  state.currentUser = user;
  localStorage.setItem("ais.currentUser", user.username);
  dom.registerForm.reset();
  dom.registerDialog.close();
  renderAll();
  notify("Konts izveidots un saglabāts datu bāzē.");
}

function logout() {
  state.currentUser = null;
  localStorage.removeItem("ais.currentUser");
  renderAll();
  notify("Tu izgāji no konta.");
}

function handleSearch(event) {
  event.preventDefault();
  state.filters.from = dom.fromInput.value.trim();
  state.filters.to = dom.toInput.value.trim();
  renderRouteResults();
}

function showAllRoutes() {
  state.filters = { from: "", to: "" };
  dom.fromInput.value = "";
  dom.toInput.value = "";
  renderRouteResults();
}

function handleRouteListClick(event) {
  const button = event.target.closest("[data-select-route]");
  if (!button) {
    return;
  }

  state.selectedRouteId = button.dataset.selectRoute;
  state.selectedScheduleId = getFirstSchedule(findRoute(state.selectedRouteId)).id;
  renderRouteResults();
  renderSelectedRoute();
  document.querySelector(".ticket-panel").scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function handleSelectedRouteClick(event) {
  const scheduleButton = event.target.closest("[data-select-schedule]");
  if (scheduleButton) {
    state.selectedScheduleId = scheduleButton.dataset.selectSchedule;
    renderSelectedRoute();
    return;
  }

  const button = event.target.closest("[data-pay-route]");
  if (!button) {
    return;
  }

  if (!state.currentUser) {
    openDialog(dom.loginDialog);
    notify("Lai apmaksātu biļeti, vispirms piesakies kontā.", "error");
    return;
  }

  payForRoute(button.dataset.payRoute, state.selectedScheduleId);
}

async function payForRoute(routeId, scheduleId) {
  const route = findRoute(routeId);
  if (!route || !state.currentUser) {
    return;
  }

  const schedule = getScheduleById(route, scheduleId);
  const balance = toMoneyNumber(state.currentUser.balance);
  const price = toMoneyNumber(route.price);

  if (balance < price) {
    const message = "Nav pietiekami apmaksas līdzekļi. Papildini konta bilansi.";
    alert(message);
    notify(message, "error");
    return;
  }

  let result;
  try {
    result = await postAction("/api/purchase", {
      username: state.currentUser.username,
      routeId: route.id,
      scheduleId: schedule.id,
      ticketNumber: createTicketNumber()
    });
  } catch (error) {
    alert(error.message);
    notify(error.message, "error");
    return;
  }

  state.currentUser = result.user;
  renderAuth();
  renderTicketResult(result.purchase, route);
  notify("Biļete apmaksāta. QR kods un čeks ir gatavi.");
}

async function openBalance() {
  if (!state.currentUser) {
    return;
  }

  await renderBalanceDialog();
  openDialog(dom.balanceDialog);
}

async function renderBalanceDialog() {
  dom.balanceDialogAmount.textContent = formatMoney(state.currentUser.balance);
  dom.topUpAmount.value = "";

  const purchases = await getPurchasesForCurrentUser();
  if (!purchases.length) {
    dom.expensesList.innerHTML = `<div class="empty-state">Iepriekšējo izmaksu vēl nav.</div>`;
    return;
  }

  dom.expensesList.innerHTML = purchases.map((purchase) => `
    <article class="expense-item">
      <strong>
        <span>${escapeHtml(purchase.routeName)}</span>
        <span>${formatMoney(purchase.price)}</span>
      </strong>
      <span>${escapeHtml(purchase.start)} → ${escapeHtml(purchase.end)}</span>
      <span>Laiks: ${escapeHtml(purchase.departure || "")}${purchase.arrival ? ` - ${escapeHtml(purchase.arrival)}` : ""}</span>
      <span>${formatDateTime(purchase.createdAt)}</span>
    </article>
  `).join("");
}

async function handleTopUp() {
  if (!state.currentUser) {
    return;
  }

  const amount = Number(dom.topUpAmount.value);
  if (!Number.isFinite(amount) || amount <= 0 || amount > 200) {
    const message = "Summa nav atbilstoša. Ievadi vairāk par 0 EUR un ne vairāk par 200 EUR.";
    alert(message);
    notify(message, "error");
    return;
  }

  let result;
  try {
    result = await postAction("/api/top-up", {
      username: state.currentUser.username,
      amount: toMoneyNumber(amount)
    });
  } catch (error) {
    notify(error.message, "error");
    return;
  }

  state.currentUser = result.user;
  renderAuth();
  await renderBalanceDialog();
  notify("Bilance papildināta.");
}

async function openProfile() {
  if (!state.currentUser) {
    return;
  }

  dom.profileTitle.textContent = `${state.currentUser.firstName} ${state.currentUser.lastName}`;
  dom.profileDetails.innerHTML = `
    <strong>Konta nosaukums: ${escapeHtml(state.currentUser.username)}</strong>
    <span>Vecums: ${escapeHtml(String(state.currentUser.age))}</span>
    <span>Statuss: ${getUserRoleLabel(state.currentUser)}</span>
  `;
  dom.applyDriverBtn.classList.toggle("is-hidden", state.currentUser.isDriver);
  dom.becomeStationManagerBtn.classList.toggle(
    "is-hidden",
    !state.currentUser.isDriver || state.currentUser.isStationManager
  );
  openDialog(dom.profileDialog);
}

async function handleBecomeStationManager() {
  if (!state.currentUser || !state.currentUser.isDriver) {
    notify("Par autoostas vadītāju var kļūt tikai autobusa vadītājs.", "error");
    return;
  }

  try {
    state.currentUser = await postAction("/api/become-station-manager", {
      username: state.currentUser.username
    });
  } catch (error) {
    notify(error.message, "error");
    return;
  }

  dom.profileDialog.close();
  renderAll();
  notify("Tu tagad esi Autoostas vadītājs.");
}

async function handleDriverApplication(event) {
  event.preventDefault();
  clearFormErrors(dom.driverApplicationForm);

  if (!state.currentUser) {
    return;
  }

  const application = {
    id: createId("driver"),
    username: state.currentUser.username,
    firstName: state.currentUser.firstName,
    lastName: state.currentUser.lastName,
    licenseNumber: dom.licenseNumber.value.trim(),
    experienceYears: Number(dom.experienceYears.value),
    motivation: dom.driverMotivation.value.trim(),
    createdAt: new Date().toISOString()
  };

  if (!application.licenseNumber || !Number.isFinite(application.experienceYears) || application.experienceYears < 0 || !application.motivation) {
    const fields = [];
    if (!application.licenseNumber) {
      fields.push(dom.licenseNumber);
    }
    if (!Number.isFinite(application.experienceYears) || application.experienceYears < 0) {
      fields.push(dom.experienceYears);
    }
    if (!application.motivation) {
      fields.push(dom.driverMotivation);
    }
    setFormError(dom.driverApplicationForm, "Aizpildi visus šofera pieteikuma jautājumus.", fields);
    notify("Aizpildi visus šofera pieteikuma jautājumus.", "error");
    return;
  }

  if (Number(state.currentUser.age) - application.experienceYears < 18) {
    const message = "Tas nav iespējams, jo vadītāja tiesības var būt tikai no 18 gadu vecuma.";
    setFormError(dom.driverApplicationForm, message, dom.experienceYears);
    notify(message, "error");
    return;
  }

  let result;
  try {
    result = await postAction("/api/apply-driver", application);
  } catch (error) {
    setFormError(dom.driverApplicationForm, error.message, dom.experienceYears);
    notify(error.message, "error");
    return;
  }

  state.currentUser = result.user;
  dom.driverApplicationForm.reset();
  dom.driverApplicationDialog.close();
  resetRouteForm();
  renderAll();
  notify("Pieteikums saglabāts. Tu tagad esi autobusa vadītājs.");
}

function handleStopsClick(event) {
  const removeButton = event.target.closest("[data-remove-stop]");
  if (removeButton) {
    removeStop(Number(removeButton.dataset.removeStop));
    return;
  }

  const insertButton = event.target.closest("[data-insert-stop-after]");
  if (insertButton) {
    addStop(Number(insertButton.dataset.insertStopAfter));
  }
}

function handleStopsInput(event) {
  const input = event.target.closest("[data-stop-index]");
  if (!input) {
    return;
  }

  state.routeStops[Number(input.dataset.stopIndex)] = input.value;
}

function addStop(afterIndex) {
  const index = Number.isFinite(afterIndex) ? afterIndex + 1 : state.routeStops.length;
  state.routeStops.splice(index, 0, "");
  renderStopsEditor();
}

function removeStop(index) {
  state.routeStops.splice(index, 1);
  renderStopsEditor();
}

async function handleRouteSave(event) {
  event.preventDefault();

  if (!state.currentUser || !state.currentUser.isDriver) {
    notify("Maršrutus var saglabāt tikai šoferis.", "error");
    return;
  }

  const price = Number(dom.routePriceInput.value);
  if (!Number.isFinite(price) || price <= 0) {
    notify("Cenai jābūt lielākai par 0 EUR.", "error");
    return;
  }

  const editingRouteId = dom.editingRouteId.value;
  const existingRoute = editingRouteId ? findRoute(editingRouteId) : null;

  if (existingRoute && existingRoute.driverUsername !== state.currentUser.username) {
    notify("Tu vari labot tikai savus maršrutus.", "error");
    return;
  }

  const now = new Date().toISOString();
  const route = {
    id: editingRouteId || createId("route"),
    name: dom.routeNameInput.value.trim(),
    start: dom.routeStartInput.value.trim(),
    end: dom.routeEndInput.value.trim(),
    stops: state.routeStops.map((stop) => stop.trim()).filter(Boolean),
    departure: dom.routeDepartureInput.value,
    arrival: dom.routeArrivalInput.value,
    price: toMoneyNumber(price),
    driverUsername: state.currentUser.username,
    createdAt: existingRoute ? existingRoute.createdAt : now,
    updatedAt: now
  };

  if (!route.name || !route.start || !route.end || !route.departure || !route.arrival) {
    notify("Aizpildi maršruta nosaukumu, sākumu, galapunktu un laikus.", "error");
    return;
  }

  await putRecord("routes", route);
  await reloadRoutes();
  state.selectedRouteId = route.id;
  resetRouteForm();
  renderAll();
  notify("Maršruts saglabāts datu bāzē.");
}

function handleDriverRoutesClick(event) {
  const button = event.target.closest("[data-edit-driver-route]");
  if (!button) {
    return;
  }

  const route = findRoute(button.dataset.editDriverRoute);
  if (!route) {
    return;
  }

  dom.editingRouteId.value = route.id;
  dom.routeNameInput.value = route.name;
  dom.routePriceInput.value = route.price;
  dom.routeStartInput.value = route.start;
  dom.routeEndInput.value = route.end;
  dom.routeDepartureInput.value = route.departure;
  dom.routeArrivalInput.value = route.arrival;
  state.routeStops = route.stops && route.stops.length ? [...route.stops] : ["", "", ""];
  dom.saveRouteBtn.textContent = "Saglabāt izmaiņas";
  renderStopsEditor();
  dom.routeForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

function resetRouteForm() {
  if (!dom.routeForm) {
    return;
  }

  dom.routeForm.reset();
  dom.editingRouteId.value = "";
  dom.saveRouteBtn.textContent = "Saglabāt maršrutu";
  state.routeStops = ["", "", ""];
  renderStopsEditor();
}

async function getPurchasesForCurrentUser() {
  if (!state.currentUser) {
    return [];
  }

  return (await getAllRecords("purchases"))
    .filter((purchase) => purchase.username === state.currentUser.username)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function findRoute(id) {
  return state.routes.find((route) => route.id === id);
}

function getRouteSchedules(route) {
  if (!route) {
    return [{ id: "time-0", departure: "", arrival: "" }];
  }

  const schedules = Array.isArray(route.schedules)
    ? route.schedules
    : [{ departure: route.departure, arrival: route.arrival }];

  const normalized = schedules
    .filter((time) => time && time.departure && time.arrival)
    .map((time, index) => ({
      id: time.id || `time-${index}-${time.departure}-${time.arrival}`,
      departure: time.departure,
      arrival: time.arrival
    }));

  return normalized.length ? normalized : [{ id: "time-0", departure: "", arrival: "" }];
}

function getFirstSchedule(route) {
  return getRouteSchedules(route)[0];
}

function getScheduleById(route, scheduleId) {
  const schedules = getRouteSchedules(route);
  return schedules.find((time) => time.id === scheduleId) || schedules[0];
}

function buildReceiptText(purchase, route) {
  return [
    "AUTOOSTAS INFORMĀCIJAS SISTĒMA",
    "ČEKS",
    "",
    `Biļetes numurs: ${purchase.ticketNumber}`,
    `Vārds: ${purchase.firstName}`,
    `Uzvārds: ${purchase.lastName}`,
    `Reiss: ${purchase.routeName}`,
    `Maršruts: ${purchase.start} -> ${purchase.end}`,
    `Reisa laiks: ${purchase.departure || getFirstSchedule(route).departure} - ${purchase.arrival || getFirstSchedule(route).arrival}`,
    `Pieturvietas: ${(route.stops && route.stops.length) ? route.stops.join(", ") : "Nav"}`,
    `Cena: ${formatMoney(purchase.price)}`,
    `Pirkuma laiks: ${formatDateTime(purchase.createdAt)}`,
    `Apmaksāts: ${purchase.paid ? "Jā" : "Nē"}`,
    "",
    "Paldies par pirkumu!"
  ].join("\n");
}

function createTicketPayload(purchase) {
  const base = `AIS|${purchase.ticketNumber}|${purchase.username}|${purchase.routeName}|${purchase.price}|${purchase.createdAt}`;
  if (byteLength(base) <= 70) {
    return base;
  }

  const compact = `AIS|${purchase.ticketNumber}|${purchase.username}|${purchase.paid ? "PAID" : "NO"}`;
  if (byteLength(compact) <= 70) {
    return compact;
  }

  return `AIS|${purchase.ticketNumber}`;
}

function openDialog(dialog) {
  clearFormErrors(dialog);
  if (!dialog.open) {
    dialog.showModal();
  }
}

function setFormError(form, message, fields = []) {
  const errorBox = form.querySelector(".form-error");
  if (errorBox) {
    errorBox.textContent = message;
    errorBox.classList.add("show");
  }

  const fieldList = Array.isArray(fields) ? fields : [fields];
  fieldList.filter(Boolean).forEach((field) => {
    field.classList.add("field-invalid");
    field.setAttribute("aria-invalid", "true");
  });
}

function clearFormErrors(container) {
  if (!container) {
    return;
  }

  container.querySelectorAll(".form-error").forEach((errorBox) => {
    errorBox.textContent = "";
    errorBox.classList.remove("show");
  });
  container.querySelectorAll(".field-invalid").forEach((field) => {
    field.classList.remove("field-invalid");
    field.removeAttribute("aria-invalid");
  });
}

function notify(message, type = "success") {
  clearTimeout(state.toastTimer);
  dom.toast.textContent = message;
  dom.toast.classList.toggle("error", type === "error");
  dom.toast.classList.add("show");
  state.toastTimer = window.setTimeout(() => {
    dom.toast.classList.remove("show");
  }, 3200);
}

function showStoredNotice() {
  const notice = sessionStorage.getItem("ais.routeNotice");
  if (!notice) {
    return;
  }

  sessionStorage.removeItem("ais.routeNotice");
  notify(notice);
}

function createId(prefix) {
  const randomPart = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${randomPart}`;
}

function createTicketNumber() {
  return `AIS-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function toMoneyNumber(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function formatMoney(value) {
  return `${toMoneyNumber(value).toFixed(2)} EUR`;
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat("lv-LV", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
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

function validatePassword(password) {
  if (password.length < 8) {
    return { ok: false, message: "Parolei jābūt vismaz 8 simbolus garai." };
  }

  if (!/[A-Z]/.test(password)) {
    return { ok: false, message: "Parolē jābūt vismaz vienam lielajam burtam." };
  }

  if (!/[0-9]/.test(password)) {
    return { ok: false, message: "Parolē jābūt vismaz vienam ciparam." };
  }

  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?`~]/.test(password)) {
    return { ok: false, message: "Parolē jābūt vismaz vienam speciālajam simbolam." };
  }

  return { ok: true, message: "" };
}

function normalizeUsername(username) {
  return String(username || "").trim().toLocaleLowerCase("lv-LV");
}

function normalizeText(value) {
  return String(value || "")
    .toLocaleLowerCase("lv-LV")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function hashPassword(password) {
  if (crypto.subtle) {
    const data = new TextEncoder().encode(password);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  let hash = 5381;
  for (let i = 0; i < password.length; i += 1) {
    hash = ((hash << 5) + hash) ^ password.charCodeAt(i);
  }
  return `fallback-${hash >>> 0}`;
}

function byteLength(value) {
  return new TextEncoder().encode(value).length;
}

function drawQrCode(text, canvas) {
  try {
    const modules = createQrMatrix(text);
    const quietZone = 4;
    const cellSize = 8;
    const size = modules.length + quietZone * 2;

    canvas.width = size * cellSize;
    canvas.height = size * cellSize;

    const context = canvas.getContext("2d");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#111111";

    modules.forEach((row, y) => {
      row.forEach((dark, x) => {
        if (dark) {
          context.fillRect((x + quietZone) * cellSize, (y + quietZone) * cellSize, cellSize, cellSize);
        }
      });
    });
  } catch (error) {
    console.error(error);
    drawFallbackCode(text, canvas);
  }
}

function drawFallbackCode(text, canvas) {
  const context = canvas.getContext("2d");
  canvas.width = 320;
  canvas.height = 320;
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#111111";
  for (let y = 0; y < 29; y += 1) {
    for (let x = 0; x < 29; x += 1) {
      const marker = x < 7 && y < 7 || x > 21 && y < 7 || x < 7 && y > 21;
      const value = marker || ((x * 31 + y * 17 + text.charCodeAt((x + y) % text.length)) % 5 < 2);
      if (value) {
        context.fillRect(24 + x * 9, 24 + y * 9, 9, 9);
      }
    }
  }
}

function createQrMatrix(text) {
  const version = 4;
  const size = version * 4 + 17;
  const modules = Array.from({ length: size }, () => Array(size).fill(false));
  const reserved = Array.from({ length: size }, () => Array(size).fill(false));

  const setFunction = (x, y, dark) => {
    if (x < 0 || y < 0 || x >= size || y >= size) {
      return;
    }
    modules[y][x] = Boolean(dark);
    reserved[y][x] = true;
  };

  drawFinderPattern(setFunction, 0, 0);
  drawFinderPattern(setFunction, size - 7, 0);
  drawFinderPattern(setFunction, 0, size - 7);
  drawAlignmentPattern(setFunction, 26, 26);

  for (let i = 8; i < size - 8; i += 1) {
    const dark = i % 2 === 0;
    setFunction(6, i, dark);
    setFunction(i, 6, dark);
  }

  drawFormatBits(setFunction, size, 0);

  const dataCodewords = makeDataCodewords(text);
  const ecc = reedSolomonRemainder(dataCodewords, reedSolomonDivisor(ECC_CODEWORDS_V4_L));
  const allCodewords = [...dataCodewords, ...ecc];
  const bits = [];
  allCodewords.forEach((byte) => appendBits(bits, byte, 8));

  let bitIndex = 0;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) {
      right -= 1;
    }

    for (let vert = 0; vert < size; vert += 1) {
      const upward = ((right + 1) & 2) === 0;
      const y = upward ? size - 1 - vert : vert;

      for (let j = 0; j < 2; j += 1) {
        const x = right - j;
        if (reserved[y][x]) {
          continue;
        }

        let dark = bitIndex < bits.length ? bits[bitIndex] === 1 : false;
        bitIndex += 1;
        if ((x + y) % 2 === 0) {
          dark = !dark;
        }
        modules[y][x] = dark;
      }
    }
  }

  return modules;
}

function drawFinderPattern(setFunction, left, top) {
  for (let y = top - 1; y <= top + 7; y += 1) {
    for (let x = left - 1; x <= left + 7; x += 1) {
      const inside = x >= left && x < left + 7 && y >= top && y < top + 7;
      if (!inside) {
        setFunction(x, y, false);
      }
    }
  }

  for (let y = 0; y < 7; y += 1) {
    for (let x = 0; x < 7; x += 1) {
      const dark = x === 0 || x === 6 || y === 0 || y === 6 || (x >= 2 && x <= 4 && y >= 2 && y <= 4);
      setFunction(left + x, top + y, dark);
    }
  }
}

function drawAlignmentPattern(setFunction, centerX, centerY) {
  for (let y = -2; y <= 2; y += 1) {
    for (let x = -2; x <= 2; x += 1) {
      const distance = Math.max(Math.abs(x), Math.abs(y));
      setFunction(centerX + x, centerY + y, distance === 2 || distance === 0);
    }
  }
}

function drawFormatBits(setFunction, size, mask) {
  const errorCorrectionLow = 1;
  const data = (errorCorrectionLow << 3) | mask;
  let rem = data;

  for (let i = 0; i < 10; i += 1) {
    rem = (rem << 1) ^ (((rem >>> 9) & 1) * 0x537);
  }

  const bits = ((data << 10) | rem) ^ 0x5412;
  const getBit = (index) => ((bits >>> index) & 1) !== 0;

  for (let i = 0; i <= 5; i += 1) {
    setFunction(8, i, getBit(i));
  }
  setFunction(8, 7, getBit(6));
  setFunction(8, 8, getBit(7));
  setFunction(7, 8, getBit(8));
  for (let i = 9; i < 15; i += 1) {
    setFunction(14 - i, 8, getBit(i));
  }

  for (let i = 0; i < 8; i += 1) {
    setFunction(size - 1 - i, 8, getBit(i));
  }
  for (let i = 8; i < 15; i += 1) {
    setFunction(8, size - 15 + i, getBit(i));
  }
  setFunction(8, size - 8, true);
}

function makeDataCodewords(text) {
  const bytes = [...new TextEncoder().encode(text)];
  const bits = [];
  appendBits(bits, 0x4, 4);
  appendBits(bits, bytes.length, 8);
  bytes.forEach((byte) => appendBits(bits, byte, 8));

  const capacityBits = DATA_CODEWORDS_V4_L * 8;
  if (bits.length > capacityBits) {
    throw new Error("QR payload is too long.");
  }

  const terminator = Math.min(4, capacityBits - bits.length);
  appendBits(bits, 0, terminator);
  while (bits.length % 8 !== 0) {
    bits.push(0);
  }

  const codewords = [];
  for (let i = 0; i < bits.length; i += 8) {
    let value = 0;
    for (let j = 0; j < 8; j += 1) {
      value = (value << 1) | bits[i + j];
    }
    codewords.push(value);
  }

  for (let pad = 0xec; codewords.length < DATA_CODEWORDS_V4_L; pad ^= 0xec ^ 0x11) {
    codewords.push(pad);
  }

  return codewords;
}

function appendBits(target, value, length) {
  for (let i = length - 1; i >= 0; i -= 1) {
    target.push((value >>> i) & 1);
  }
}

function reedSolomonDivisor(degree) {
  const result = Array(degree).fill(0);
  result[degree - 1] = 1;
  let root = 1;

  for (let i = 0; i < degree; i += 1) {
    for (let j = 0; j < result.length; j += 1) {
      result[j] = gfMultiply(result[j], root);
      if (j + 1 < result.length) {
        result[j] ^= result[j + 1];
      }
    }
    root = gfMultiply(root, 0x02);
  }

  return result;
}

function reedSolomonRemainder(data, divisor) {
  const result = Array(divisor.length).fill(0);

  data.forEach((byte) => {
    const factor = byte ^ result.shift();
    result.push(0);
    divisor.forEach((coefficient, index) => {
      result[index] ^= gfMultiply(coefficient, factor);
    });
  });

  return result;
}

const gfTables = createGaloisTables();

function createGaloisTables() {
  const exp = Array(512).fill(0);
  const log = Array(256).fill(0);
  let value = 1;

  for (let i = 0; i < 255; i += 1) {
    exp[i] = value;
    log[value] = i;
    value <<= 1;
    if (value & 0x100) {
      value ^= 0x11d;
    }
  }

  for (let i = 255; i < 512; i += 1) {
    exp[i] = exp[i - 255];
  }

  return { exp, log };
}

function gfMultiply(a, b) {
  if (a === 0 || b === 0) {
    return 0;
  }

  return gfTables.exp[gfTables.log[a] + gfTables.log[b]];
}
