import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import './DashboardPage.css'

/* ── API helper ── */
const api = (path, opts = {}) => fetch(path, { credentials:'include', ...opts }).then(r => r.json())

/* ════════════════════════════════════════
   SIDEBAR
════════════════════════════════════════ */
function Sidebar({ active, go }) {
  const { user, logout, can, isAdmin, isLeitung } = useAuth()

  const nav = [
    { id:'overview',    ico:'⬡', label:'Übersicht',       show: true },
    { id:'einsaetze',  ico:'🚨', label:'Einsätze',         show: can('einsaetze') },
    { id:'einheiten',  ico:'📡', label:'Funk & Einheiten', show: can('funk') },
    { id:'profile',    ico:'👤', label:'Dienstprofile',    show: can('profile') },
    { id:'strafen',    ico:'📋', label:'Strafen',          show: can('strafen') },
    { id:'kennzeichen',ico:'🔍', label:'Kennzeichen',      show: can('kennzeichen') },
  ]
  const adm = [
    { id:'admin',    ico:'⚙️',  label:'Admin Panel',       show: isLeitung() },
    { id:'benutzer', ico:'👥',  label:'Benutzerverwaltung',show: isAdmin() },
  ]

  return (
    <aside className="sb">
      {/* Logo */}
      <div className="sb-logo">
        <div className="sb-star">⭐</div>
        <div>
          <div className="sb-name">Emergency</div>
          <div className="sb-city">Hamburg</div>
        </div>
      </div>

      {/* User */}
      <div className="sb-user">
        <img src={user.avatar} alt="" className="sb-av" />
        <div className="sb-ui">
          <div className="sb-uname">{user.nickname}</div>
          <span className={`badge badge-${user.role}`}>
            {{ admin:'👑 Admin', leitung:'🎖️ Leitung', polizei:'🚔 Polizei', zuschauer:'👁️ Zuschauer' }[user.role]}
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="sb-nav">
        <div className="sb-sec">NAVIGATION</div>
        {nav.filter(i => i.show).map(i => (
          <button key={i.id} className={`sb-item ${active===i.id?'active':''}`} onClick={() => go(i.id)}>
            <span className="sb-ico">{i.ico}</span>
            <span>{i.label}</span>
            {active===i.id && <div className="sb-bar"/>}
          </button>
        ))}
        {adm.some(i=>i.show) && <>
          <div className="sb-sec" style={{marginTop:14}}>VERWALTUNG</div>
          {adm.filter(i=>i.show).map(i => (
            <button key={i.id} className={`sb-item ${active===i.id?'active':''}`} onClick={() => go(i.id)}>
              <span className="sb-ico">{i.ico}</span>
              <span>{i.label}</span>
              {active===i.id && <div className="sb-bar"/>}
            </button>
          ))}
        </>}
      </nav>

      <button className="sb-logout" onClick={logout}>
        <svg viewBox="0 0 16 16" fill="none" width="13" height="13">
          <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M11 11l3-3-3-3M14 8H6"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Ausloggen
      </button>
    </aside>
  )
}

/* ── Topbar ── */
function Topbar({ title, sub }) {
  const [t, setT] = useState(new Date())
  useEffect(() => { const i = setInterval(()=>setT(new Date()),1000); return ()=>clearInterval(i) },[])
  return (
    <div className="tb">
      <div>
        <div className="tb-title">{title}</div>
        {sub && <div className="tb-sub">{sub}</div>}
      </div>
      <div className="tb-right">
        <div className="tb-online"><span className="sdot s-aktiv"/>ONLINE</div>
        <div className="tb-time">{t.toLocaleTimeString('de-DE')}</div>
      </div>
    </div>
  )
}

/* ── Stat Card ── */
function Stat({ ico, label, val, accent, sub }) {
  return (
    <div className="stat" style={{'--ac': accent}}>
      <div className="stat-ico">{ico}</div>
      <div>
        <div className="stat-val">{val}</div>
        <div className="stat-lbl">{label}</div>
        {sub && <div className="stat-sub">{sub}</div>}
      </div>
    </div>
  )
}

/* ── Table wrapper ── */
function DataTable({ cols, rows, emptyMsg = 'Keine Daten' }) {
  if (!rows?.length) return <div className="empty">{emptyMsg}</div>
  return (
    <div className="tbl-wrap">
      <table className="tbl">
        <thead><tr>{cols.map(c => <th key={c}>{c}</th>)}</tr></thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  )
}

function Loading() { return <div className="boot-spinner" style={{margin:'44px auto'}}/> }

/* ════════════════════════════════════════
   VIEW: Übersicht
════════════════════════════════════════ */
function OverviewView() {
  const { user } = useAuth()
  return (
    <div className="view">
      <div className="stat-grid">
        <Stat ico="🚨" label="Aktive Einsätze"  val="2"  accent="var(--red)"   sub="Live" />
        <Stat ico="📡" label="Beamte im Dienst"  val="4"  accent="var(--blue)"  sub="von 12" />
        <Stat ico="📋" label="Einsätze heute"    val="12" accent="var(--amber)" sub="∅ 8/Tag" />
        <Stat ico="🔍" label="Strafen (7 Tage)"  val="34" accent="var(--green)" sub="↑5%" />
      </div>

      <div className="ov-grid">
        <div className="panel">
          <div className="panel-hd"><span>🚨 AKTUELLE EINSÄTZE</span><span className="live-badge">LIVE</span></div>
          {[
            { id:'E-001', typ:'10-23', ort:'Reeperbahn 1',   prio:'hoch' },
            { id:'E-002', typ:'10-11', ort:'Hafencity',       prio:'mittel' },
          ].map(e => (
            <div key={e.id} className="ov-row">
              <span className="sdot s-aktiv"/>
              <span className="mono accent">{e.typ}</span>
              <span className="dim">{e.ort}</span>
              <span className={`badge prio-${e.prio}`}>{e.prio}</span>
            </div>
          ))}
        </div>

        <div className="panel">
          <div className="panel-hd">📡 FUNK STATUS</div>
          {[
            { f:'PHW-1',  s:'verfügbar',  p:'Officer_Hansen' },
            { f:'PHW-2',  s:'im-einsatz', p:'Officer_Müller' },
            { f:'PHW-K1', s:'bereit',     p:'KOK_Weber' },
          ].map(e => (
            <div key={e.f} className="ov-row">
              <span className={`sdot s-${e.s}`}/>
              <span className="mono accent">{e.f}</span>
              <span className="dim">{e.p}</span>
              <span className="mono dim small">{e.s}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="welcome">
        <span style={{fontSize:28}}>🚔</span>
        <div>
          <div className="welcome-name">Willkommen zurück, {user.nickname}</div>
          <div className="welcome-sub mono">
            DIENSTANTRITT · {new Date(user.loginAt).toLocaleTimeString('de-DE')} UHR · ALLE SYSTEME OPERATIONAL
          </div>
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════
   VIEW: Einsätze
════════════════════════════════════════ */
function EinsaetzeView() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const { canWrite } = useAuth()

  useEffect(() => {
    api('/api/einsaetze').then(setData).finally(() => setLoading(false))
  }, [])

  const statusDot = { aktiv:'s-aktiv', wartend:'s-wartend', abgeschlossen:'s-abgeschlossen' }

  return (
    <div className="view">
      <div className="vh">
        <div>
          <h2 className="vt">Einsätze</h2>
          <p className="vs mono">{data.length} EINTRÄGE · ECHTZEIT</p>
        </div>
        {canWrite() && <button className="btn-p">+ Neuer Einsatz</button>}
      </div>
      {loading ? <Loading/> : (
        <DataTable
          cols={['ID','Typ','Adresse','Status','Priorität','Einheiten','Zeit']}
          rows={data.map(e => (
            <tr key={e.id} className={e.status==='aktiv'?'row-hi':''}>
              <td className="mono accent">{e.id}</td>
              <td className="mono">{e.typ}</td>
              <td>{e.adresse}</td>
              <td><span className="sinline"><span className={`sdot ${statusDot[e.status]}`}/>{e.status}</span></td>
              <td><span className={`badge prio-${e.prioritaet==='hoch'?'red':e.prioritaet==='mittel'?'amber':'green'}`}>{e.prioritaet}</span></td>
              <td className="mono dim">{(e.einheiten||[]).join(', ')||'—'}</td>
              <td className="mono dim">{new Date(e.erstellt_am).toLocaleTimeString('de-DE')}</td>
            </tr>
          ))}
        />
      )}
    </div>
  )
}

/* ════════════════════════════════════════
   VIEW: Einheiten
════════════════════════════════════════ */
function EinheitenView() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { api('/api/einheiten').then(setData).finally(()=>setLoading(false)) }, [])

  return (
    <div className="view">
      <div className="vh">
        <div>
          <h2 className="vt">Funk & Einheiten</h2>
          <p className="vs mono">{data.filter(e=>e.status!=='außer-dienst').length} EINHEITEN IM DIENST</p>
        </div>
      </div>
      {loading ? <Loading/> : (
        <div className="ecard-grid">
          {data.map(e => (
            <div key={e.funkrufname} className={`ecard ${e.status==='im-einsatz'?'ecard-red':''}`}>
              <div className="ecard-top">
                <span className="ecard-funk mono">{e.funkrufname}</span>
                <span className={`sdot s-${e.status}`}/>
              </div>
              <div className="ecard-player">{e.spieler}</div>
              <div className="ecard-info">
                <span className="mono dim small">DN: {e.dienstnummer}</span>
                <span className="mono dim small">{e.fahrzeug}</span>
              </div>
              <div className={`ecard-status s-bar-${e.status}`}>{e.status}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ════════════════════════════════════════
   VIEW: Profile
════════════════════════════════════════ */
function ProfileView() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')

  useEffect(() => { api('/api/profile').then(setData).finally(()=>setLoading(false)) }, [])

  const filtered = data.filter(p =>
    p.name.toLowerCase().includes(q.toLowerCase()) || p.dienstnummer.includes(q)
  )

  return (
    <div className="view">
      <div className="vh">
        <div>
          <h2 className="vt">Dienstprofile</h2>
          <p className="vs mono">{data.length} BEAMTE REGISTRIERT</p>
        </div>
        <input className="search" placeholder="Name oder DN..." value={q} onChange={e=>setQ(e.target.value)}/>
      </div>
      {loading ? <Loading/> : (
        <DataTable
          cols={['DN','Name','Rang','Status','Einsätze','Beitritt']}
          rows={filtered.map(p => (
            <tr key={p.dienstnummer}>
              <td className="mono accent">{p.dienstnummer}</td>
              <td>{p.name}</td>
              <td className="dim">{p.rang}</td>
              <td><span className="sinline"><span className={`sdot s-${p.status}`}/>{p.status}</span></td>
              <td className="mono">{p.einsaetze}</td>
              <td className="mono dim">{new Date(p.beitrittsdatum).toLocaleDateString('de-DE')}</td>
            </tr>
          ))}
        />
      )}
    </div>
  )
}

/* ════════════════════════════════════════
   VIEW: Strafen
════════════════════════════════════════ */
function StrafenView() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { api('/api/strafen').then(setData).finally(()=>setLoading(false)) }, [])

  return (
    <div className="view">
      <div className="vh">
        <div>
          <h2 className="vt">Strafen-Datenbank</h2>
          <p className="vs mono">{data.length} EINTRÄGE</p>
        </div>
        <button className="btn-p">+ Neue Strafe</button>
      </div>
      {loading ? <Loading/> : (
        <DataTable
          cols={['ID','Person','Vergehen','Betrag','Bearbeiter DN','Datum']}
          rows={data.map(s => (
            <tr key={s.id}>
              <td className="mono accent">{s.id}</td>
              <td>{s.name}</td>
              <td>{s.vergehen}</td>
              <td className="mono" style={{color:'var(--amber)'}}>{s.betrag}€</td>
              <td className="mono">{s.bearbeiter_dn}</td>
              <td className="mono dim">{new Date(s.datum).toLocaleDateString('de-DE')}</td>
            </tr>
          ))}
        />
      )}
    </div>
  )
}

/* ════════════════════════════════════════
   VIEW: Kennzeichen
════════════════════════════════════════ */
function KennzeichenView() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')

  useEffect(() => { api('/api/kennzeichen').then(setData).finally(()=>setLoading(false)) }, [])

  const filtered = data.filter(k =>
    k.kennzeichen.toLowerCase().includes(q.toLowerCase()) ||
    k.besitzer.toLowerCase().includes(q.toLowerCase())
  )

  return (
    <div className="view">
      <div className="vh">
        <div>
          <h2 className="vt">Kennzeichen-System</h2>
          <p className="vs mono">{data.length} FAHRZEUGE</p>
        </div>
        <input className="search" placeholder="Kennzeichen / Besitzer..." value={q} onChange={e=>setQ(e.target.value)}/>
      </div>
      {loading ? <Loading/> : (
        <DataTable
          cols={['Kennzeichen','Besitzer','Fahrzeug','Farbe','Status']}
          rows={filtered.map(k => (
            <tr key={k.kennzeichen} className={k.status==='fahndung'?'row-danger':''}>
              <td className="mono accent">{k.kennzeichen}</td>
              <td>{k.besitzer}</td>
              <td>{k.fahrzeug}</td>
              <td>{k.farbe}</td>
              <td><span className="sinline"><span className={`sdot s-${k.status}`}/>{k.status}</span></td>
            </tr>
          ))}
        />
      )}
    </div>
  )
}

/* ════════════════════════════════════════
   VIEW: Admin
════════════════════════════════════════ */
function AdminView() {
  const [stats, setStats] = useState(null)
  useEffect(() => { api('/api/admin?action=stats').then(setStats).catch(()=>{}) }, [])

  return (
    <div className="view">
      <div className="vh">
        <div>
          <h2 className="vt">Admin Panel</h2>
          <p className="vs mono">SYSTEMÜBERSICHT · EINGESCHRÄNKTER ZUGRIFF</p>
        </div>
      </div>

      <div className="admin-notice">
        ⚠️ &nbsp; Administrationsbereich — alle Aktionen werden protokolliert
      </div>

      {stats && (
        <div className="stat-grid" style={{marginBottom:24}}>
          <Stat ico="📡" label="Beamte online"     val={stats.beamteImDienst}   accent="var(--blue)" />
          <Stat ico="🚨" label="Aktive Einsätze"   val={stats.aktiveEinsaetze}  accent="var(--red)" />
          <Stat ico="📊" label="Einsätze gesamt"   val={stats.einsaetzeGesamt}  accent="var(--amber)" />
          <Stat ico="👥" label="Mitglieder ges."   val={stats.mitgliederGesamt} accent="var(--green)" />
        </div>
      )}

      <div className="mod-list">
        {[
          { ico:'📝', name:'Audit Log',       desc:'Alle Systemaktionen einsehen',    tag:'Phase 1', on:true  },
          { ico:'🎭', name:'Rollen-Editor',   desc:'Discord-Rollen zuweisen',         tag:'Phase 1', on:true  },
          { ico:'📹', name:'Bodycam-System',  desc:'Kamera-Daten verwalten',          tag:'Phase 2', on:false },
          { ico:'🤖', name:'KI-Analyse',      desc:'Automatische Einsatz-Auswertung', tag:'Phase 2', on:false },
        ].map(m => (
          <div key={m.name} className={`mod-row ${!m.on?'mod-off':''}`}>
            <span style={{fontSize:20}}>{m.ico}</span>
            <div className="mod-info">
              <div className="mod-name">{m.name}</div>
              <div className="mod-desc">{m.desc}</div>
            </div>
            <span className={`badge ${m.on?'badge-polizei':'badge-muted'}`}>{m.tag}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ════════════════════════════════════════
   VIEW: Benutzer
════════════════════════════════════════ */
function BenutzerView() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { api('/api/admin?action=benutzer').then(setData).finally(()=>setLoading(false)) }, [])

  return (
    <div className="view">
      <div className="vh">
        <div>
          <h2 className="vt">Benutzerverwaltung</h2>
          <p className="vs mono">{data.length} REGISTRIERTE NUTZER</p>
        </div>
      </div>
      {loading ? <Loading/> : (
        <DataTable
          cols={['Discord ID','Username','Rolle','Letzter Login','Status','Aktion']}
          rows={data.map(u => (
            <tr key={u.id}>
              <td className="mono dim">{u.discord_id}</td>
              <td>{u.username}</td>
              <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
              <td className="mono dim">{new Date(u.login_at).toLocaleString('de-DE')}</td>
              <td><span className="sinline"><span className="sdot s-aktiv"/>{u.status}</span></td>
              <td><button className="btn-del">Entfernen</button></td>
            </tr>
          ))}
        />
      )}
    </div>
  )
}

/* ════════════════════════════════════════
   MAIN DASHBOARD
════════════════════════════════════════ */
const VIEWS = {
  overview:    ['Übersicht',          'DASHBOARD · SYSTEMSTATUS NOMINAL'],
  einsaetze:  ['Einsätze',           'LIVE-EINSATZLISTE · ECHTZEIT'],
  einheiten:  ['Funk & Einheiten',   'FUNKSTATUS · ALLE EINHEITEN'],
  profile:    ['Dienstprofile',      'BEAMTENPROFILE · REGISTRIERT'],
  strafen:    ['Strafen-Datenbank',  'OFFIZIELLE STRAFENDATENBANK'],
  kennzeichen:['Kennzeichen-System', 'KFZ-DATENBANK'],
  admin:      ['Admin Panel',        'ADMINISTRATION · EINGESCHRÄNKT'],
  benutzer:   ['Benutzerverwaltung', 'NUTZERÜBERSICHT · NUR ADMIN'],
}
const COMPS = {
  overview: OverviewView,  einsaetze: EinsaetzeView,
  einheiten: EinheitenView, profile: ProfileView,
  strafen: StrafenView, kennzeichen: KennzeichenView,
  admin: AdminView, benutzer: BenutzerView,
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [active, setActive] = useState('overview')
  const [title, sub] = VIEWS[active] || ['Dashboard','']
  const View = COMPS[active] || OverviewView

  return (
    <div className="db-root">
      <Sidebar active={active} go={setActive} />
      <main className="db-main">
        <Topbar title={title} sub={sub} />
        <div className="db-body"><View /></div>
      </main>
    </div>
  )
}
