// ---- Simple data layer (localStorage) ----
const LS_KEY = "tremmer-suite-v1";

const demoData = {
  settings: {
    startDate: iso(addDays(new Date(), -30)),
    months: 3,
    green: 90,
    amber: 60
  },
  tasks: [
    // Based on your Excel screenshot
    t("Ali","machine beheersing","2025-11-01","2025-11-14",56),
    t("Ali","machine kennis","2025-10-28","2025-11-09",73),
    t("Ali","communicatie","2025-11-19","2025-12-08",90),
    t("Ali","veilig werken","2025-10-27","2025-11-04",51),
    t("Ali","zelf sturend","2025-11-02","2025-11-15",51),
    t("Ali","planning","2025-10-27","2025-12-14",23),
    t("Ali","kwaliteit","2025-10-22","2025-11-03",25),
    t("Ali","probleemoplossing","2025-10-21","2025-10-28",58),
    t("Ali","samenwerking","2025-10-25","2025-11-03",43),
    t("Ali","documentatie","2025-11-26","2025-12-09",33),

    t("Bianca","machine beheersing","2025-10-17","2025-10-30",62),
    t("Bianca","machine kennis","2025-10-12","2025-10-19",76),
    t("Bianca","communicatie","2025-11-22","2025-12-07",90),
    t("Bianca","veilig werken","2025-10-10","2025-10-25",53),
    t("Bianca","zelf sturend","2025-11-08","2025-11-20",62),
    t("Bianca","planning","2025-11-25","2025-12-01",40),
    t("Bianca","kwaliteit","2025-11-15","2025-11-22",24),
    t("Bianca","probleemoplossing","2025-11-24","2025-12-05",26),
    t("Bianca","samenwerking","2025-10-25","2025-11-02",66),
    t("Bianca","documentatie","2025-11-05","2025-11-13",39),

    t("Chris","machine beheersing","2025-11-25","2025-12-11",62),
    t("Chris","communicatie","2025-10-17","2025-10-25",28),
    t("Chris","veilig werken","2025-11-02","2025-11-10",32),
    t("Chris","zelf sturend","2025-10-29","2025-11-08",94),
    t("Chris","planning","2025-10-18","2025-11-02",48),
    t("Chris","kwaliteit","2025-10-14","2025-10-31",52),
    t("Chris","probleemoplossing","2025-11-04","2025-11-15",43),
    t("Chris","samenwerking","2025-10-16","2025-10-23",96),
    t("Chris","documentatie","2025-11-21","2025-12-08",39),
  ],
  holds: {
    meta: { shipType: "west", holdCount: 9 },
    items: [
      // {id:1,status:"open",notes:""}
    ]
  },
  logs: [],
  handovers: []
};

function t(student, task, start, end, progress){
  return { id: uid(), student, task, start, end, progress };
}

function uid(){ return Math.random().toString(36).slice(2,10); }

function iso(d){ return new Date(d).toISOString().slice(0,10); }
function addDays(d, n){ const x=new Date(d); x.setDate(x.getDate()+n); return x; }

function load(){
  const raw = localStorage.getItem(LS_KEY);
  if(!raw){ localStorage.setItem(LS_KEY, JSON.stringify(demoData)); return structuredClone(demoData); }
  try { return JSON.parse(raw); } catch { localStorage.setItem(LS_KEY, JSON.stringify(demoData)); return structuredClone(demoData); }
}
function save(state){ localStorage.setItem(LS_KEY, JSON.stringify(state)); }

// ---- App state ----
let state = load();

// ---- Helpers: schedule vs progress ----
function expectedProgress(start, end){
  const now = new Date();
  const s = new Date(start);
  const e = new Date(end);
  if(now <= s) return 0;
  if(now >= e) return 100;
  const total = e - s;
  const done = now - s;
  return Math.round((done/total)*100);
}

function statusBadge(progress, start, end){
  const exp = expectedProgress(start,end);
  const delta = progress - exp;
  const {green, amber} = state.settings;
  // Use delta vs expected to mark bad/warn/ok
  let cls = "ok", label = "Op schema";
  if(delta < -20) { cls="bad"; label="Achter"; }
  else if(delta < -5) { cls="warn"; label="Risico"; }
  // Also mark absolute completion thresholds near the end
  if(exp > green && progress < green) { cls="warn"; label="Onder drempel"; }
  return <span class="badge ${cls}" title="Verwacht ${exp}%, feitelijk ${progress}%">${label}</span>;
}

// ---- UI: tabs ----
document.querySelectorAll(".tab-btn").forEach(b=>{
  b.addEventListener("click",()=>{
    document.querySelectorAll(".tab-btn").forEach(x=>x.classList.remove("active"));
    document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));
    b.classList.add("active");
    document.getElementById(b.dataset.tab).classList.add("active");
    if(b.dataset.tab==="dashboard") renderDashboard();
    if(b.dataset.tab==="tremmers") renderTasks();
    if(b.dataset.tab==="ruimen") { renderShip(); renderHoldLog(); }
    if(b.dataset.tab==="instellingen") { renderSettings(); renderAudit(); }
    if(b.dataset.tab==="overdracht") { renderHandoverLog(); }
  });
});

// ---- DASHBOARD ----
function renderDashboard(){
  const tasks = state.tasks;
  if(tasks.length===0){
    document.getElementById("kpiAvg").textContent = "0%";
    document.getElementById("kpiOnTrack").textContent = "0";
    document.getElementById("kpiBehind").textContent = "0";
    document.getElementById("kpiOpen").textContent = "0";
    document.getElementById("hotspots").innerHTML = "<div class='log-item'>Geen data.</div>";
    return;
  }

  // KPIs
  const avg = Math.round(tasks.reduce((s,t)=>s+t.progress,0)/tasks.length);
  const onTrack = tasks.filter(t=>t.progress - expectedProgress(t.start,t.end) >= -5).length;
  const behind = tasks.filter(t=>t.progress - expectedProgress(t.start,t.end) < -5).length;
  const open = tasks.filter(t=>t.progress < 100).length;

  document.getElementById("kpiAvg").textContent = ${avg}%;
  document.getElementById("kpiOnTrack").textContent = onTrack;
  document.getElementById("kpiBehind").textContent = behind;
  document.getElementById("kpiOpen").textContent = open;

  // Hotspots (lowest delta to expected)
  const ranked = tasks
    .map(t => ({...t, delta: t.progress - expectedProgress(t.start,t.end)}))
    .sort((a,b)=>a.delta-b.delta)
    .slice(0,5);

  const hs = ranked.map(t=>{
    const exp = expectedProgress(t.start,t.end);
    const delta = t.delta;
    return `<div class="log-item">
      <strong>${t.student}</strong> – ${t.task}
      <div><small>Prog: ${t.progress}% • Verwacht: ${exp}% • Δ ${delta}%</small></div>
    </div>`;
  }).join("");

  document.getElementById("hotspots").innerHTML = hs || "<div class='log-item'>Geen hotspots.</div>";
}

// ---- TREMMERS (tasks) ----
const tbody = document.querySelector("#tasksTable tbody");
const searchInput = document.getElementById("searchInput");
const taskDialog = document.getElementById("taskDialog");

document.getElementById("btnNewTask").addEventListener("click", ()=>{
  openTaskDialog();
});

searchInput.addEventListener("input", renderTasks);

function renderTasks(){
  const q = searchInput.value.trim().toLowerCase();
  const rows = state.tasks
    .filter(t => [t.student,t.task,t.start,t.end].join(" ").toLowerCase().includes(q))
    .sort((a,b)=> a.student.localeCompare(b.student) || a.task.localeCompare(b.task))
    .map(t => {
      const badge = statusBadge(t.progress,t.start,t.end);
      return `<tr>
        <td>${escapeHtml(t.student)}</td>
        <td>${escapeHtml(t.task)}</td>
        <td>${t.start}</td>
        <td>${t.end}</td>
        <td>${t.progress}</td>
        <td>${badge}</td>
        <td>
          <button class="btn-outline" data-edit="${t.id}">Bewerk</button>
          <button class="btn-outline" data-del="${t.id}">Verwijder</button>
        </td>
      </tr>`;
    }).join("");
  tbody.innerHTML = rows || <tr><td colspan="7">Geen taken.</td></tr>;

  // bind actions
  tbody.querySelectorAll("button[data-edit]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const id = btn.getAttribute("data-edit");
      const task = state.tasks.find(x=>x.id===id);
      openTaskDialog(task);
    });
  });
  tbody.querySelectorAll("button[data-del]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const id = btn.getAttribute("data-del");
      state.tasks = state.tasks.filter(x=>x.id!==id);
      logAudit(Taak verwijderd (${id}).);
      save(state); renderTasks(); renderDashboard();
    });
  });
}

function openTaskDialog(task){
  document.getElementById("taskDialogTitle").textContent = task ? "Taak bewerken" : "Nieuwe taak";
  document.getElementById("fStudent").value = task?.student || "";
  document.getElementById("fTask").value = task?.task || "";
  document.getElementById("fStart").value = task?.start || iso(new Date());
  document.getElementById("fEnd").value = task?.end || iso(addDays(new Date(),7));
  document.getElementById("fProgress").value = task?.progress ?? 0;
  document.getElementById("fId").value = task?.id || "";
  taskDialog.showModal();
}

document.getElementById("taskForm").addEventListener("submit", (e)=>{
  e.preventDefault();
  const id = document.getElementById("fId").value.trim();
  const payload = {
    id: id || uid(),
    student: document.getElementById("fStudent").value.trim(),
    task: document.getElementById("fTask").value.trim(),
    start: document.getElementById("fStart").value,
    end: document.getElementById("fEnd").value,
    progress: Number(document.getElementById("fProgress").value)
  };
  if(id){
    const idx = state.tasks.findIndex(x=>x.id===id);
    state.tasks[idx] = payload;
    logAudit(Taak bijgewerkt (${payload.student} – ${payload.task}).);
  }else{
    state.tasks.push(payload);
    logAudit(Taak toegevoegd (${payload.student} – ${payload.task}).);
  }
  save(state);
  taskDialog.close();
  renderTasks(); renderDashboard();
});

// Export / Import / Reset
document.getElementById("btnExport").addEventListener("click", ()=>{
  const blob = new Blob([JSON.stringify(state,null,2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "tremmer-suite-export.json";
  a.click(); URL.revokeObjectURL(url);
});
document.getElementById("importFile").addEventListener("change", (e)=>{
  const file = e.target.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const json = JSON.parse(reader.result);
      state = json; save(state);
      renderDashboard(); renderTasks(); renderShip(); renderAudit(); renderHandoverLog();
      alert("Import gelukt.");
    } catch(err){ alert("Ongeldige JSON."); }
  };
  reader.readAsText(file);
});
document.getElementById("btnReset").addEventListener("click", ()=>{
  if(confirm("Demo resetten naar standaarddata?")){ state = structuredClone(demoData); save(state); renderDashboard(); renderTasks(); }
});

// ---- RUIMEN ----
const shipTypeEl = document.getElementById("shipType");
const holdCountEl = document.getElementById("holdCount");
const shipSvg = document.getElementById("shipSvg");
const holdForm = document.getElementById("holdForm");
const holdIdEl = document.getElementById("holdId");
const holdStatusEl = document.getElementById("holdStatus");
const holdNotesEl = document.getElementById("holdNotes");

shipTypeEl.value = state.holds.meta.shipType;
holdCountEl.value = String(state.holds.meta.holdCount);

shipTypeEl.addEventListener("change", ()=>{
  state.holds.meta.shipType = shipTypeEl.value; save(state); renderShip();
});
holdCountEl.addEventListener("change", ()=>{
  state.holds.meta.holdCount = Number(holdCountEl.value); save(state); renderShip();
});
document.getElementById("btnClearHolds").addEventListener("click", ()=>{
  if(confirm("Alle ruim-status wissen?")){
    state.holds.items = []; save(state); renderShip(); renderHoldLog();
  }
});

function getHold(id){
  let h = state.holds.items.find(x=>x.id===id);
  if(!h){ h = {id, status:"open", notes:""}; state.holds.items.push(h); }
  return h;
}

function renderShip(){
  // remove old holds
  shipSvg.querySelectorAll("rect.hold").forEach(n=>n.remove());
  const n = state.holds.meta.holdCount;
  const gap = 8;
  const holdW = (860 - (n-1)*gap)/n;
  for(let i=0; i<n; i++){
    const x = 20 + i*(holdW+gap);
    const rect = document.createElementNS("http://www.w3.org/2000/svg","rect");
    rect.setAttribute("x", String(x));
    rect.setAttribute("y", "40");
    rect.setAttribute("width", String(holdW));
    rect.setAttribute("height", "78");
    rect.setAttribute("rx","6");
    rect.classList.add("hold");
    const id = i+1;
    const h = getHold(id);
    rect.classList.add(h.status);
    rect.dataset.hold = String(id);
    rect.addEventListener("click", ()=>selectHold(id));
    shipSvg.appendChild(rect);

    // label
    const label = document.createElementNS("http://www.w3.org/2000/svg","text");
    label.setAttribute("x", String(x + holdW/2));
    label.setAttribute("y", "85");
    label.setAttribute("text-anchor","middle");
    label.setAttribute("fill", "#a8b3cf");
    label.setAttribute("font-size","12");
    label.textContent = String(id);
    shipSvg.appendChild(label);
  }
}

function selectHold(id){
  const h = getHold(id);
  holdIdEl.value = id;
  holdStatusEl.value = h.status;
  holdNotesEl.value = h.notes || "";
  holdForm.scrollIntoView({behavior:"smooth", block:"center"});
}

holdForm.addEventListener("submit", (e)=>{
  e.preventDefault();
  const id = Number(holdIdEl.value);
  if(!id) return;
  const h = getHold(id);
  h.status = holdStatusEl.value;
  h.notes = holdNotesEl.value.trim();
  save(state);
  renderShip();
  renderHoldLog();
  logAudit(Ruim #${id} → ${h.status}.);
});

function renderHoldLog(){
  const container = document.getElementById("holdLog");
  const items = state.holds.items
    .filter(h=>h.notes || h.status!=="open")
    .sort((a,b)=>a.id-b.id)
    .map(h=><div class="log-item"><strong>Ruim ${h.id}</strong> – ${h.status}<div><small>${escapeHtml(h.notes||"")}</small></div></div>)
    .join("");
  container.innerHTML = items || "<div class='log-item'>Nog geen wijzigingen.</div>";
}

// ---- OVERDRACHT ----
const handoverForm = document.getElementById("handoverForm");
handoverForm.addEventListener("submit", (e)=>{
  e.preventDefault();
  const prev = document.getElementById("handoverPrev").value.trim();
  const next = document.getElementById("handoverNext").value.trim();
  const fileEl = document.getElementById("handoverFile");
  const fileName = fileEl.files?.[0]?.name || "";
  state.handovers.unshift({
    id: uid(),
    ts: new Date().toISOString(),
    prev, next, fileName
  });
  save(state);
  document.getElementById("handoverPrev").value="";
  document.getElementById("handoverNext").value="";
  fileEl.value="";
  renderHandoverLog();
  logAudit("Overdracht opgeslagen.");
});

function renderHandoverLog(){
  const log = document.getElementById("handoverLog");
  log.innerHTML = state.handovers.map(h=>`
    <div class="log-item">
      <strong>${fmtTs(h.ts)}</strong>
      <div><small>Vorige: ${escapeHtml(h.prev||"-")}</small></div>
      <div><small>Komende: ${escapeHtml(h.next||"-")}</small></div>
      ${h.fileName ? <div><small>Bijlage: ${escapeHtml(h.fileName)}</small></div>:""}
    </div>
  `).join("") || "<div class='log-item'>Nog geen overdrachten.</div>";
}

// ---- INSTELLINGEN + AUDIT ----
function renderSettings(){
  document.getElementById("cfgStartDate").value = state.settings.startDate || "";
  document.getElementById("cfgMonths").value = state.settings.months;
  document.getElementById("cfgGreen").value = state.settings.green;
  document.getElementById("cfgAmber").value = state.settings.amber;
}
document.getElementById("settingsForm").addEventListener("submit",(e)=>{
  e.preventDefault();
  state.settings.startDate = document.getElementById("cfgStartDate").value || state.settings.startDate;
  state.settings.months = Number(document.getElementById("cfgMonths").value);
  state.settings.green = Number(document.getElementById("cfgGreen").value);
  state.settings.amber = Number(document.getElementById("cfgAmber").value);
  save(state);
  logAudit("Instellingen bijgewerkt.");
  renderDashboard();
  alert("Instellingen opgeslagen.");
});

function renderAudit(){
  const target = document.getElementById("auditLog");
  target.innerHTML = state.logs.map(l=>`
    <div class="log-item"><strong>${fmtTs(l.ts)}</strong><div><small>${escapeHtml(l.msg)}</small></div></div>
  `).join("") || "<div class='log-item'>Nog geen wijzigingen.</div>";
}
function logAudit(msg){
  state.logs.unshift({ts:new Date().toISOString(), msg});
  save(state);
  renderAudit();
}

// ---- Utils ----
function escapeHtml(s){ return s.replace(/[&<>"']/g, m=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m])); }
function fmtTs(ts){ const d = new Date(ts); return d.toLocaleString(); }

// ---- Init ----
renderDashboard();
renderTasks();
renderShip();
renderHandoverLog();
renderSettings();
renderAudit();