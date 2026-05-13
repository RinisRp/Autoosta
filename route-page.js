"use strict";

const DB_NAME = "AutoostasInformacijasSistema";
const DB_VERSION = 2;

const state = {
  db: null,
  currentUser: null,
  editingRoute: null,
  routeStops: ["", "", ""],
  scheduleMode: "manual",
  manualTimes: [{ departure: "", arrival: "" }],
  toastTimer: null
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
    await prepareEditor();
  } catch (error) {
    console.error(error);
    showGuard("Neizdevās pieslēgties SQL datu bāzei. Palaid server.py un atver lapu caur http://127.0.0.1:8000.");
  }
}

function collectDom() {
  Object.assign(dom, {
    userFullName: document.getElementById("userFullName"),
    driverBadge: document.getElementById("driverBadge"),
    routePageTitle: document.getElementById("routePageTitle"),
    routePageSubtitle: document.getElementById("routePageSubtitle"),
    routeGuard: document.getElementById("routeGuard"),
    routeEditor: document.getElementById("routeEditor"),
    routeForm: document.getElementById("routeForm"),
    editingRouteId: document.getElementById("editingRouteId"),
    routeNameInput: document.getElementById("routeNameInput"),
    routePriceInput: document.getElementById("routePriceInput"),
    routeStartInput: document.getElementById("routeStartInput"),
    routeEndInput: document.getElementById("routeEndInput"),
    manualModeBtn: document.getElementById("manualModeBtn"),
    repeatModeBtn: document.getElementById("repeatModeBtn"),
    manualSchedulePanel: document.getElementById("manualSchedulePanel"),
    repeatSchedulePanel: document.getElementById("repeatSchedulePanel"),
    manualTimesList: document.getElementById("manualTimesList"),
    addManualTimeBtn: document.getElementById("addManualTimeBtn"),
    recurrenceStartInput: document.getElementById("recurrenceStartInput"),
    recurrenceEndInput: document.getElementById("recurrenceEndInput"),
    recurrenceIntervalInput: document.getElementById("recurrenceIntervalInput"),
    recurrenceDurationInput: document.getElementById("recurrenceDurationInput"),
    recurrencePreview: document.getElementById("recurrencePreview"),
    stopsList: document.getElementById("stopsList"),
    appendStopBtn: document.getElementById("appendStopBtn"),
    saveRouteBtn: document.getElementById("saveRouteBtn"),
    toast: document.getElementById("toast")
  });
}

function bindEvents() {
  dom.routeForm.addEventListener("submit", handleRouteSave);
  dom.appendStopBtn.addEventListener("click", () => addStop(state.routeStops.length - 1));
  dom.stopsList.addEventListener("click", handleStopsClick);
  dom.stopsList.addEventListener("input", handleStopsInput);
  dom.manualModeBtn.addEventListener("click", () => setScheduleMode("manual"));
  dom.repeatModeBtn.addEventListener("click", () => setScheduleMode("repeat"));
  dom.addManualTimeBtn.addEventListener("click", addManualTime);
  dom.manualTimesList.addEventListener("click", handleManualTimesClick);
  dom.manualTimesList.addEventListener("input", handleManualTimesInput);
  [
    dom.recurrenceStartInput,
    dom.recurrenceEndInput,
    dom.recurrenceIntervalInput,
    dom.recurrenceDurationInput
  ].forEach((input) => input.addEventListener("input", renderRecurrencePreview));
}

function openDatabase() {
  return apiRequest("/api/health");
}

async function getRecord(storeName, key) {
  return apiRequest(`/api/store/${storeName}/${encodeURIComponent(key)}`);
}

async function putRecord(storeName, value) {
  return apiRequest(`/api/store/${storeName}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(value)
  });
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

function renderHeader() {
  if (!state.currentUser) {
    dom.userFullName.textContent = "Nav pieslēdzies";
    dom.driverBadge.classList.add("is-hidden");
    return;
  }

  dom.userFullName.textContent = `${state.currentUser.firstName} ${state.currentUser.lastName}`;
  dom.driverBadge.classList.toggle("is-hidden", !state.currentUser.isDriver);
}

async function prepareEditor() {
  if (!state.currentUser) {
    showGuard("Lai veidotu maršrutu, vispirms piesakies savā kontā.");
    return;
  }

  if (!state.currentUser.isDriver) {
    showGuard("Maršrutus var veidot tikai lietotājs, kas ir pieteicies par autobusa vadītāju.");
    return;
  }

  const routeId = new URLSearchParams(window.location.search).get("id");
  if (routeId) {
    const route = await getRecord("routes", routeId);
    if (!route) {
      showGuard("Šis maršruts datu bāzē nav atrasts.");
      return;
    }

    if (route.driverUsername !== state.currentUser.username) {
      showGuard("Tu vari labot tikai savus maršrutus.");
      return;
    }

    fillRouteForm(route);
  } else {
    renderStopsEditor();
    renderScheduleEditor();
  }
}

function showGuard(message) {
  dom.routeEditor.classList.add("is-hidden");
  dom.routeGuard.classList.remove("is-hidden");
  dom.routeGuard.innerHTML = `
    <div class="empty-state">
      <strong>${escapeHtml(message)}</strong>
      <div class="route-actions guard-actions">
        <a class="primary-btn" href="index.html#driverPanel">Atgriezties sākumlapā</a>
      </div>
    </div>
  `;
}

function fillRouteForm(route) {
  state.editingRoute = route;
  state.routeStops = route.stops && route.stops.length ? [...route.stops] : ["", "", ""];
  state.manualTimes = getRouteSchedules(route);
  state.scheduleMode = route.scheduleMode === "repeat" && route.recurrence ? "repeat" : "manual";

  dom.routePageTitle.textContent = "Labot maršrutu";
  dom.routePageSubtitle.textContent = "Izmaini maršruta datus un saglabā tos datu bāzē.";
  dom.editingRouteId.value = route.id;
  dom.routeNameInput.value = route.name;
  dom.routePriceInput.value = route.price;
  dom.routeStartInput.value = route.start;
  dom.routeEndInput.value = route.end;
  dom.saveRouteBtn.textContent = "Saglabāt izmaiņas";

  if (route.recurrence) {
    dom.recurrenceStartInput.value = route.recurrence.startTime || "";
    dom.recurrenceEndInput.value = route.recurrence.endTime || "";
    dom.recurrenceIntervalInput.value = String(route.recurrence.intervalMinutes || 60);
    dom.recurrenceDurationInput.value = String(route.recurrence.durationMinutes || 60);
  }

  renderStopsEditor();
  renderScheduleEditor();
}

function renderScheduleEditor() {
  renderManualTimes();
  renderScheduleMode();
  renderRecurrencePreview();
}

function renderScheduleMode() {
  const isRepeat = state.scheduleMode === "repeat";
  dom.manualModeBtn.classList.toggle("active", !isRepeat);
  dom.repeatModeBtn.classList.toggle("active", isRepeat);
  dom.manualSchedulePanel.classList.toggle("is-hidden", isRepeat);
  dom.repeatSchedulePanel.classList.toggle("is-hidden", !isRepeat);
}

function setScheduleMode(mode) {
  state.scheduleMode = mode;
  renderScheduleMode();
  renderRecurrencePreview();
}

function renderManualTimes() {
  if (!state.manualTimes.length) {
    state.manualTimes = [{ departure: "", arrival: "" }];
  }

  dom.manualTimesList.innerHTML = state.manualTimes.map((time, index) => `
    <div class="time-row">
      <label>
        <span>Izbraukšana ${index + 1}</span>
        <input type="time" value="${escapeHtml(time.departure)}" data-manual-time="${index}" data-time-field="departure">
      </label>
      <label>
        <span>Ierašanās ${index + 1}</span>
        <input type="time" value="${escapeHtml(time.arrival)}" data-manual-time="${index}" data-time-field="arrival">
      </label>
      <button class="small-icon-btn" type="button" data-remove-time="${index}" aria-label="Noņemt laiku" title="Noņemt laiku">−</button>
    </div>
  `).join("");
}

function addManualTime() {
  state.manualTimes.push({ departure: "", arrival: "" });
  renderManualTimes();
}

function handleManualTimesClick(event) {
  const button = event.target.closest("[data-remove-time]");
  if (!button) {
    return;
  }

  state.manualTimes.splice(Number(button.dataset.removeTime), 1);
  renderManualTimes();
}

function handleManualTimesInput(event) {
  const input = event.target.closest("[data-manual-time]");
  if (!input) {
    return;
  }

  const index = Number(input.dataset.manualTime);
  const field = input.dataset.timeField;
  state.manualTimes[index][field] = input.value;
}

function renderRecurrencePreview() {
  const result = generateRecurringSchedules();
  if (!result.ok) {
    dom.recurrencePreview.innerHTML = `<span>${escapeHtml(result.message)}</span>`;
    return;
  }

  dom.recurrencePreview.innerHTML = `
    <strong>Izveidosies ${result.schedules.length} reisi:</strong>
    <div class="time-chip-list">
      ${result.schedules.map((time) => `<span>${escapeHtml(time.departure)} - ${escapeHtml(time.arrival)}</span>`).join("")}
    </div>
  `;
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

  const scheduleResult = state.scheduleMode === "repeat"
    ? generateRecurringSchedules()
    : getManualSchedules();

  if (!scheduleResult.ok) {
    notify(scheduleResult.message, "error");
    return;
  }

  const existingRoute = state.editingRoute;
  const schedules = scheduleResult.schedules;
  const firstSchedule = schedules[0];
  const now = new Date().toISOString();
  const route = {
    id: dom.editingRouteId.value || createId("route"),
    name: dom.routeNameInput.value.trim(),
    start: dom.routeStartInput.value.trim(),
    end: dom.routeEndInput.value.trim(),
    stops: state.routeStops.map((stop) => stop.trim()).filter(Boolean),
    schedules,
    departure: firstSchedule.departure,
    arrival: firstSchedule.arrival,
    scheduleMode: state.scheduleMode,
    recurrence: state.scheduleMode === "repeat" ? getRecurrenceSettings() : null,
    price: toMoneyNumber(price),
    driverUsername: state.currentUser.username,
    createdAt: existingRoute ? existingRoute.createdAt : now,
    updatedAt: now
  };

  if (!route.name || !route.start || !route.end) {
    notify("Aizpildi maršruta nosaukumu, sākumu un galapunktu.", "error");
    return;
  }

  await putRecord("routes", route);
  sessionStorage.setItem("ais.routeNotice", "Maršruts saglabāts datu bāzē.");
  window.location.href = "index.html#driverPanel";
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

function getManualSchedules() {
  const schedules = state.manualTimes
    .map((time) => ({ departure: time.departure, arrival: time.arrival }))
    .filter((time) => time.departure || time.arrival);

  if (!schedules.length) {
    return { ok: false, message: "Pievieno vismaz vienu reisa laiku." };
  }

  if (schedules.some((time) => !time.departure || !time.arrival)) {
    return { ok: false, message: "Katram manuālajam laikam aizpildi gan izbraukšanu, gan ierašanos." };
  }

  return {
    ok: true,
    schedules: sortSchedules(schedules)
  };
}

function getRecurrenceSettings() {
  return {
    startTime: dom.recurrenceStartInput.value,
    endTime: dom.recurrenceEndInput.value,
    intervalMinutes: Number(dom.recurrenceIntervalInput.value),
    durationMinutes: Number(dom.recurrenceDurationInput.value)
  };
}

function generateRecurringSchedules() {
  const settings = getRecurrenceSettings();
  if (!settings.startTime || !settings.endTime) {
    return { ok: false, message: "Ievadi atkārtošanās sākuma un beigu laiku." };
  }

  if (!Number.isFinite(settings.intervalMinutes) || settings.intervalMinutes <= 0) {
    return { ok: false, message: "Izvēlies derīgu atkārtošanās intervālu." };
  }

  if (!Number.isFinite(settings.durationMinutes) || settings.durationMinutes <= 0) {
    return { ok: false, message: "Brauciena ilgumam jābūt lielākam par 0 minūtēm." };
  }

  const start = timeToMinutes(settings.startTime);
  const end = timeToMinutes(settings.endTime);
  if (start > end) {
    return { ok: false, message: "Beigu laikam jābūt vēlākam par sākuma laiku." };
  }

  const schedules = [];
  for (let current = start; current <= end; current += settings.intervalMinutes) {
    schedules.push({
      departure: minutesToTime(current),
      arrival: minutesToTime(current + settings.durationMinutes)
    });
  }

  if (!schedules.length) {
    return { ok: false, message: "Ar šiem ierobežojumiem neizveidojas neviens reiss." };
  }

  return { ok: true, schedules };
}

function sortSchedules(schedules) {
  return [...schedules].sort((a, b) => a.departure.localeCompare(b.departure));
}

function timeToMinutes(value) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(value) {
  const minutesInDay = 24 * 60;
  const normalized = ((value % minutesInDay) + minutesInDay) % minutesInDay;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
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

function createId(prefix) {
  const randomPart = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${randomPart}`;
}

function toMoneyNumber(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
