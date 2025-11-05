import { useState, useEffect } from 'react';
import './TremmerSuite.css';

const TremmerSuite = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [state, setState] = useState({
    settings: {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      months: 3,
      green: 90,
      amber: 60
    },
    tasks: [],
    holds: {
      meta: { shipType: "west", holdCount: 9 },
      items: []
    },
    logs: [],
    handovers: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHold, setSelectedHold] = useState(null);
  const [formData, setFormData] = useState({
    student: '',
    task: '',
    start: new Date().toISOString().split('T')[0],
    end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    progress: 0,
    id: ''
  });
  const [holdForm, setHoldForm] = useState({
    id: '',
    status: 'open',
    notes: ''
  });
  const [handoverForm, setHandoverForm] = useState({
    prev: '',
    next: '',
    fileName: ''
  });
  const [settings, setSettings] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    months: 3,
    green: 90,
    amber: 60
  });

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedState = localStorage.getItem('tremmer-suite-v1');
    if (savedState) {
      setState(JSON.parse(savedState));
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('tremmer-suite-v1', JSON.stringify(state));
  }, [state]);

  // Helper functions
  const expectedProgress = (start, end) => {
    const now = new Date();
    const s = new Date(start);
    const e = new Date(end);
    if (now <= s) return 0;
    if (now >= e) return 100;
    const total = e - s;
    const done = now - s;
    return Math.round((done/total)*100);
  };

  const statusBadge = (progress, start, end) => {
    const exp = expectedProgress(start, end);
    const delta = progress - exp;
    const { green, amber } = state.settings;
    
    let cls = "ok", label = "Op schema";
    if (delta < -20) { cls = "bad"; label = "Achter"; }
    else if (delta < -5) { cls = "warn"; label = "Risico"; }
    
    if (exp > green && progress < green) { cls = "warn"; label = "Onder drempel"; }
    
    return <span className={`badge ${cls}`} title={`Verwacht ${exp}%, feitelijk ${progress}%`}>{label}</span>;
  };

  // Tab rendering
  const renderDashboard = () => {
    const tasks = state.tasks;
    if (tasks.length === 0) {
      return <div className="log-item">Geen data.</div>;
    }

    const avg = Math.round(tasks.reduce((s, t) => s + t.progress, 0) / tasks.length);
    const onTrack = tasks.filter(t => t.progress - expectedProgress(t.start, t.end) >= -5).length;
    const behind = tasks.filter(t => t.progress - expectedProgress(t.start, t.end) < -5).length;
    const open = tasks.filter(t => t.progress < 100).length;

    const ranked = [...tasks]
      .map(t => ({...t, delta: t.progress - expectedProgress(t.start, t.end)}))
      .sort((a, b) => a.delta - b.delta)
      .slice(0, 5);

    return (
      <>
        <div className="kpis">
          <div className="kpi">
            <div className="kpi-title">Gem. voortgang</div>
            <div className="kpi-value">{avg}%</div>
          </div>
          <div className="kpi">
            <div className="kpi-title">Op schema</div>
            <div className="kpi-value">{onTrack}</div>
          </div>
          <div className="kpi">
            <div className="kpi-title">Achterstand</div>
            <div className="kpi-value">{behind}</div>
          </div>
          <div className="kpi">
            <div className="kpi-title">Taken open</div>
            <div className="kpi-value">{open}</div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2>Hotspots (laagste 5 taken)</h2>
            <small>Op basis van drempels en planning</small>
          </div>
          <div id="hotspots">
            {ranked.map((t, i) => {
              const exp = expectedProgress(t.start, t.end);
              const delta = t.delta;
              return (
                <div key={i} className="log-item">
                  <strong>{t.student}</strong> – {t.task}
                  <div><small>Prog: {t.progress}% • Verwacht: {exp}% • Δ {delta}%</small></div>
                </div>
              );
            })}
          </div>
        </div>
      </>
    );
  };

  // Render Ruimen tab
  const renderRuimen = () => {
    const { shipType, holdCount } = state.holds.meta;
    const holds = state.holds.items;

    return (
      <>
        <div className="form-grid">
          <label>
            Boot-type
            <select 
              id="shipType" 
              value={shipType}
              onChange={(e) => updateShipMeta('shipType', e.target.value)}
            >
              <option value="west">West-Boot</option>
              <option value="oost">Oost-Boot</option>
              <option value="kolen">Kolen-Boot</option>
              <option value="erts">Erts-Boot</option>
            </select>
          </label>
          <label>
            Aantal ruimen
            <select 
              id="holdCount" 
              value={holdCount}
              onChange={(e) => updateShipMeta('holdCount', parseInt(e.target.value))}
            >
              <option value="7">7</option>
              <option value="9">9</option>
            </select>
          </label>
          <button onClick={clearHolds} className="btn-outline">
            Leeg status
          </button>
        </div>

        <div className="ship-wrap">
          <svg id="shipSvg" viewBox="0 0 900 220" className="ship-svg" aria-label="Ruimen">
            <rect x="10" y="120" width="880" height="60" rx="8" className="hull" />
            {Array.from({ length: holdCount }).map((_, i) => {
              const holdId = i + 1;
              const hold = holds.find(h => h.id === holdId) || { status: 'open', notes: '' };
              const x = 20 + i * (860 / holdCount);
              const width = (860 / holdCount) - 8;
              
              return (
                <g key={i}>
                  <rect 
                    x={x} 
                    y="40" 
                    width={width} 
                    height="78" 
                    rx="6" 
                    className={`hold ${hold.status}`}
                    onClick={() => selectHold(holdId)}
                  />
                  <text 
                    x={x + width / 2} 
                    y="85" 
                    textAnchor="middle" 
                    fill="#a8b3cf" 
                    fontSize="12"
                  >
                    {holdId}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2>Ruim details</h2>
            <small>Klik op een ruim om status/nota's te bewerken</small>
          </div>
          <form onSubmit={handleHoldSubmit} className="form-grid">
            <label>
              Ruim #
              <input 
                type="text" 
                value={holdForm.id || ''} 
                readOnly 
              />
            </label>
            <label>
              Status
              <select 
                value={holdForm.status} 
                onChange={(e) => setHoldForm({...holdForm, status: e.target.value})}
                required
              >
                <option value="open">Open</option>
                <option value="bezig">Bezig</option>
                <option value="klaar">Klaar</option>
                <option value="geblokkeerd">Geblokkeerd</option>
              </select>
            </label>
            <label className="grid-span-2">
              Notities
              <textarea 
                value={holdForm.notes} 
                onChange={(e) => setHoldForm({...holdForm, notes: e.target.value})}
                rows="3" 
                placeholder="Bijv. kraan-wissel, water, obstructie…"
              />
            </label>
            <button type="submit">Opslaan</button>
          </form>
          <div className="log">
            {holds
              .filter(h => h.status !== 'open' || h.notes)
              .sort((a, b) => a.id - b.id)
              .map((h, i) => (
                <div key={i} className="log-item">
                  <strong>Ruim {h.id}</strong> – {h.status}
                  {h.notes && <div><small>{h.notes}</small></div>}
                </div>
              ))}
            {!holds.some(h => h.status !== 'open' || h.notes) && (
              <div className="log-item">Nog geen wijzigingen.</div>
            )}
          </div>
        </div>
      </>
    );
  };

  // Render Overdracht tab
  const renderOverdracht = () => {
    return (
      <>
        <form onSubmit={handleHandoverSubmit} className="form-grid">
          <label className="grid-span-2">
            Samenvatting vorige wacht
            <textarea 
              value={handoverForm.prev}
              onChange={(e) => setHandoverForm({...handoverForm, prev: e.target.value})}
              rows="3" 
              placeholder="Status dieplepel, shovel, storingen…"
            />
          </label>
          <label className="grid-span-2">
            Plan komende wacht
            <textarea 
              value={handoverForm.next}
              onChange={(e) => setHandoverForm({...handoverForm, next: e.target.value})}
              rows="3" 
              placeholder="Volgorde ruimen, kraanverzoek, risico's…"
            />
          </label>
          <label>
            Foto/Bestand (optioneel)
            <input 
              type="file" 
              onChange={(e) => setHandoverForm({...handoverForm, file: e.target.files[0]})}
            />
          </label>
          <button type="submit">Opslaan als log</button>
        </form>
        
        <div className="panel">
          <div className="panel-header">
            <h2>Overdrachtslog</h2>
          </div>
          <div className="log">
            {state.handovers.length > 0 ? (
              state.handovers.map((h, i) => (
                <div key={i} className="log-item">
                  <strong>{new Date(h.ts).toLocaleString()}</strong>
                  <div><small>Vorige: {h.prev || '-'}</small></div>
                  <div><small>Komende: {h.next || '-'}</small></div>
                  {h.fileName && (
                    <div><small>Bijlage: {h.fileName}</small></div>
                  )}
                </div>
              ))
            ) : (
              <div className="log-item">Nog geen overdrachten.</div>
            )}
          </div>
        </div>
      </>
    );
  };

  // Render Instellingen tab
  const renderInstellingen = () => {
    return (
      <>
        <form onSubmit={handleSettingsSubmit} className="form-grid">
          <label>
            Periode start (datum)
            <input 
              type="date" 
              value={settings.startDate}
              onChange={(e) => setSettings({...settings, startDate: e.target.value})}
              required
            />
          </label>
          <label>
            Aantal maanden
            <input 
              type="number" 
              min="1" 
              max="24" 
              value={settings.months}
              onChange={(e) => setSettings({...settings, months: parseInt(e.target.value)})}
              required
            />
          </label>
          <label>
            Drempel – Klaar (&gt;=)
            <input 
              type="number" 
              min="0" 
              max="100" 
              value={settings.green}
              onChange={(e) => setSettings({...settings, green: parseInt(e.target.value)})}
              required
            />
          </label>
          <label>
            Drempel – Op schema (&gt;=)
            <input 
              type="number" 
              min="0" 
              max="100" 
              value={settings.amber}
              onChange={(e) => setSettings({...settings, amber: parseInt(e.target.value)})}
              required
            />
          </label>
          <button type="submit">Opslaan</button>
        </form>
        
        <div className="panel">
          <div className="panel-header">
            <h2>Audit-Log</h2>
          </div>
          <div className="log">
            {state.logs.length > 0 ? (
              state.logs.map((log, i) => (
                <div key={i} className="log-item">
                  <strong>{new Date(log.ts).toLocaleString()}</strong>
                  <div><small>{log.msg}</small></div>
                </div>
              ))
            ) : (
              <div className="log-item">Nog geen wijzigingen.</div>
            )}
          </div>
        </div>
      </>
    );
  };

  // Handler functions
  const handleEditTask = (task) => {
    setFormData({
      id: task.id,
      student: task.student,
      task: task.task,
      start: task.start,
      end: task.end,
      progress: task.progress
    });
    setActiveTab('nieuwetaak');
  };

  const handleDeleteTask = (id) => {
    if (window.confirm('Weet je zeker dat je deze taak wilt verwijderen?')) {
      setState(prev => ({
        ...prev,
        tasks: prev.tasks.filter(t => t.id !== id)
      }));
      logAudit(`Taak verwijderd (${id}).`);
    }
  };

  const handleTaskSubmit = (e) => {
    e.preventDefault();
    const { id, ...taskData } = formData;
    
    setState(prev => {
      const existingIndex = prev.tasks.findIndex(t => t.id === id);
      const newTasks = [...prev.tasks];
      
      if (existingIndex >= 0) {
        // Update existing task
        newTasks[existingIndex] = { id, ...taskData };
        logAudit(`Taak bijgewerkt (${taskData.student} – ${taskData.task}).`);
      } else {
        // Add new task
        const newId = Date.now().toString();
        newTasks.push({ id: newId, ...taskData });
        logAudit(`Nieuwe taak toegevoegd (${taskData.student} – ${taskData.task}).`);
      }
      
      return { ...prev, tasks: newTasks };
    });
    
    // Reset form and go back to tasks list
    setFormData({
      student: '',
      task: '',
      start: new Date().toISOString().split('T')[0],
      end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      progress: 0,
      id: ''
    });
    setActiveTab('tremmers');
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(state, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `tremmer-suite-export-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedState = JSON.parse(e.target.result);
        setState(importedState);
        logAudit('Data geïmporteerd uit bestand.');
        alert('Import geslaagd!');
      } catch (error) {
        console.error('Fout bij importeren:', error);
        alert('Ongeldig bestandsformaat. Gebruik een geldig JSON-exportbestand.');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (window.confirm('Weet je zeker dat je alle data wilt resetten naar de demo-data? Dit kan niet ongedaan gemaakt worden.')) {
      setState({
        ...demoData,
        logs: [...state.logs, { ts: new Date().toISOString(), msg: 'Systeem gereset naar demo-data.' }]
      });
      alert('Systeem is gereset naar de demo-data.');
    }
  };

  const selectHold = (holdId) => {
    const hold = state.holds.items.find(h => h.id === holdId) || { id: holdId, status: 'open', notes: '' };
    setHoldForm({
      id: holdId,
      status: hold.status,
      notes: hold.notes
    });
  };

  const handleHoldSubmit = (e) => {
    e.preventDefault();
    if (!holdForm.id) return;
    
    setState(prev => {
      const existingIndex = prev.holds.items.findIndex(h => h.id === holdForm.id);
      const newItems = [...prev.holds.items];
      
      if (existingIndex >= 0) {
        newItems[existingIndex] = { ...holdForm };
      } else {
        newItems.push({ ...holdForm });
      }
      
      return {
        ...prev,
        holds: {
          ...prev.holds,
          items: newItems
        }
      };
    });
    
    logAudit(`Ruim ${holdForm.id} bijgewerkt: ${holdForm.status}`);
    setHoldForm({ id: '', status: 'open', notes: '' });
  };

  const updateShipMeta = (key, value) => {
    setState(prev => ({
      ...prev,
      holds: {
        ...prev.holds,
        meta: {
          ...prev.holds.meta,
          [key]: value
        }
      }
    }));
  };

  const clearHolds = () => {
    if (window.confirm('Weet je zeker dat je de status van alle ruimen wilt wissen?')) {
      setState(prev => ({
        ...prev,
        holds: {
          ...prev.holds,
          items: []
        }
      }));
      logAudit('Alle ruim-statussen gewist.');
    }
  };

  const handleHandoverSubmit = (e) => {
    e.preventDefault();
    const fileName = handoverForm.file ? handoverForm.file.name : '';
    
    setState(prev => ({
      ...prev,
      handovers: [
        {
          id: Date.now().toString(),
          ts: new Date().toISOString(),
          prev: handoverForm.prev,
          next: handoverForm.next,
          fileName
        },
        ...prev.handovers
      ]
    }));
    
    logAudit('Nieuwe overdracht opgeslagen.');
    setHandoverForm({ prev: '', next: '', file: null });
    e.target.reset();
  };

  const handleSettingsSubmit = (e) => {
    e.preventDefault();
    setState(prev => ({
      ...prev,
      settings: {
        ...settings
      }
    }));
    logAudit('Instellingen bijgewerkt.');
    alert('Instellingen opgeslagen.');
  };

  const logAudit = (msg) => {
    setState(prev => ({
      ...prev,
      logs: [
        { ts: new Date().toISOString(), msg },
        ...prev.logs.slice(0, 99) // Keep only the last 100 entries
      ]
    }));
  };

  // Demo data
  const demoData = {
    settings: {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      months: 3,
      green: 90,
      amber: 60
    },
    tasks: [
      { id: '1', student: 'Jan', task: 'Machine beheersing', start: '2023-10-01', end: '2023-10-15', progress: 75 },
      { id: '2', student: 'Piet', task: 'Veiligheid', start: '2023-10-05', end: '2023-10-20', progress: 45 },
      { id: '3', student: 'Klaas', task: 'Onderhoud', start: '2023-10-10', end: '2023-10-25', progress: 20 }
    ],
    holds: {
      meta: { shipType: "west", holdCount: 9 },
      items: []
    },
    logs: [],
    handovers: []
  };

  return (
    <div className="tremmer-suite">
      <header className="app-header">
        <h1>🚢 Tremmer Suite</h1>
        <nav className="tabs">
          <button 
            className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`tab-btn ${activeTab === 'tremmers' ? 'active' : ''}`}
            onClick={() => setActiveTab('tremmers')}
          >
            Tremmers
          </button>
          <button 
            className={`tab-btn ${activeTab === 'ruimen' ? 'active' : ''}`}
            onClick={() => setActiveTab('ruimen')}
          >
            Ruimen
          </button>
          <button 
            className={`tab-btn ${activeTab === 'overdracht' ? 'active' : ''}`}
            onClick={() => setActiveTab('overdracht')}
          >
            Overdracht
          </button>
          <button 
            className={`tab-btn ${activeTab === 'instellingen' ? 'active' : ''}`}
            onClick={() => setActiveTab('instellingen')}
          >
            Instellingen
          </button>
        </nav>
      </header>

      <main>
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <section id="dashboard" className="tab active">
            {renderDashboard()}
          </section>
        )}
        
        {/* Tremmers Tab - Task Management */}
        {activeTab === 'tremmers' && (
          <section id="tremmers" className="tab">
            <div className="toolbar">
              <input 
                type="search" 
                id="searchInput" 
                placeholder="Zoek op naam/taak…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button 
                id="btnNewTask" 
                onClick={() => {
                  setFormData({
                    student: '',
                    task: '',
                    start: new Date().toISOString().split('T')[0],
                    end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    progress: 0,
                    id: ''
                  });
                  setActiveTab('nieuwetaak');
                }}
              >
                + Nieuwe taak
              </button>
              <div className="spacer"></div>
              <input 
                type="file" 
                id="importFile" 
                accept="application/json"
                onChange={handleImport}
                style={{ display: 'none' }}
              />
              <button 
                type="button" 
                onClick={() => document.getElementById('importFile').click()}
                className="btn-outline"
              >
                Importeer
              </button>
              <button 
                id="btnExport" 
                onClick={handleExport}
                className="btn-outline"
              >
                Exporteer JSON
              </button>
              <button 
                id="btnReset" 
                onClick={handleReset}
                className="btn-outline"
              >
                Demo reset
              </button>
            </div>

            <div className="table-wrap">
              <table className="data-table" id="tasksTable">
                <thead>
                  <tr>
                    <th>Leerling</th>
                    <th>Taak</th>
                    <th>Start</th>
                    <th>Einde</th>
                    <th>Voortgang (%)</th>
                    <th>Status</th>
                    <th>Acties</th>
                  </tr>
                </thead>
                <tbody>
                  {state.tasks.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center">
                        Geen taken gevonden. Klik op "Nieuwe taak" om er een toe te voegen.
                      </td>
                    </tr>
                  ) : (
                    state.tasks
                      .filter(task => 
                        `${task.student} ${task.task}`.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .sort((a, b) => a.student.localeCompare(b.student) || a.task.localeCompare(b.task))
                      .map((task, index) => (
                        <tr key={index}>
                          <td>{task.student}</td>
                          <td>{task.task}</td>
                          <td>{task.start}</td>
                          <td>{task.end}</td>
                          <td>{task.progress}%</td>
                          <td>{statusBadge(task.progress, task.start, task.end)}</td>
                          <td>
                            <button 
                              className="btn-outline" 
                              onClick={() => handleEditTask(task)}
                            >
                              Bewerk
                            </button>
                            <button 
                              className="btn-outline" 
                              onClick={() => handleDeleteTask(task.id)}
                            >
                              Verwijder
                            </button>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Nieuwe Taak / Bewerk Taak Formulier */}
        {activeTab === 'nieuwetaak' && (
          <section id="nieuwetaak" className="tab">
            <div className="panel">
              <div className="panel-header">
                <h2>{formData.id ? 'Taak bewerken' : 'Nieuwe taak'}</h2>
              </div>
              <form onSubmit={handleTaskSubmit} className="form-grid">
                <label>
                  Leerling
                  <input 
                    type="text" 
                    value={formData.student}
                    onChange={(e) => setFormData({...formData, student: e.target.value})}
                    required 
                    placeholder="Naam (bijv. Ali)"
                  />
                </label>
                <label>
                  Taak
                  <input 
                    type="text" 
                    value={formData.task}
                    onChange={(e) => setFormData({...formData, task: e.target.value})}
                    required 
                    placeholder="Bijv. machine beheersing"
                  />
                </label>
                <label>
                  Start
                  <input 
                    type="date" 
                    value={formData.start}
                    onChange={(e) => setFormData({...formData, start: e.target.value})}
                    required 
                  />
                </label>
                <label>
                  Einde
                  <input 
                    type="date" 
                    value={formData.end}
                    onChange={(e) => setFormData({...formData, end: e.target.value})}
                    required 
                  />
                </label>
                <label>
                  Voortgang (%)
                  <input 
                    type="number" 
                    min="0" 
                    max="100" 
                    value={formData.progress}
                    onChange={(e) => setFormData({...formData, progress: parseInt(e.target.value)})}
                    required 
                  />
                </label>
                <div className="dialog-actions grid-span-2">
                  <button 
                    type="button" 
                    className="btn-outline" 
                    onClick={() => setActiveTab('tremmers')}
                  >
                    Annuleren
                  </button>
                  <button type="submit">
                    {formData.id ? 'Opslaan' : 'Toevoegen'}
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}

        {/* Ruimen Tab */}
        {activeTab === 'ruimen' && (
          <section id="ruimen" className="tab">
            {renderRuimen()}
          </section>
        )}

        {/* Overdracht Tab */}
        {activeTab === 'overdracht' && (
          <section id="overdracht" className="tab">
            {renderOverdracht()}
          </section>
        )}

        {/* Instellingen Tab */}
        {activeTab === 'instellingen' && (
          <section id="instellingen" className="tab">
            {renderInstellingen()}
          </section>
        )}
      </main>
    </div>
  );
};

export default TremmerSuite;
