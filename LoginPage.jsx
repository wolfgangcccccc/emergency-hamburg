import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './LoginPage.css'

const ERROR_MSGS = {
  access_denied: 'Zugriff verweigert',
  not_in_guild:  'Du bist kein Mitglied des Servers',
  no_permission: 'Keine Berechtigung für das Dashboard',
  token_failed:  'Discord Verbindung fehlgeschlagen',
  unknown:       'Unbekannter Fehler',
}

export default function LoginPage() {
  const [params]   = useSearchParams()
  const navigate   = useNavigate()
  const { refetch } = useAuth()
  const [phase, setPhase]   = useState('idle') // idle | checking | granted
  const [errMsg, setErrMsg] = useState('')
  const [tick, setTick]     = useState(0)

  // Clock tick
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 1000)
    return () => clearInterval(t)
  }, [])

  // Handle redirect back from Discord
  useEffect(() => {
    const err   = params.get('error')
    const login = params.get('login')
    if (err)          setErrMsg(ERROR_MSGS[err] || ERROR_MSGS.unknown)
    if (login === 'success') {
      setPhase('checking')
      setTimeout(async () => {
        await refetch()
        setPhase('granted')
        setTimeout(() => navigate('/dashboard', { replace: true }), 1800)
      }, 2000)
    }
  }, [])

  const now     = new Date()
  const timeStr = now.toLocaleTimeString('de-DE', { hour:'2-digit', minute:'2-digit', second:'2-digit' })
  const dateStr = now.toLocaleDateString('de-DE',  { weekday:'long', day:'2-digit', month:'2-digit', year:'numeric' })

  return (
    <div className="lp-root">
      {/* Blaulicht layers */}
      <div className="lp-flash-blue" />
      <div className="lp-flash-red"  />

      {/* Grid */}
      <div className="lp-grid" />

      {/* Scanline */}
      <div className="lp-scan" />

      {/* Radar (bottom-right decoration) */}
      <div className="lp-radar" aria-hidden>
        <div className="lr r1"/><div className="lr r2"/><div className="lr r3"/>
        <div className="lsweep"/>
        <div className="ldot d1"/><div className="ldot d2"/><div className="ldot d3"/>
      </div>

      {/* Access overlay */}
      {phase !== 'idle' && (
        <div className={`lp-overlay ${phase}`}>
          <div className="lo-box">
            <div className="lo-icon">
              {phase === 'checking'
                ? <SpinnerIcon />
                : <CheckIcon />}
            </div>
            <div className="lo-title">
              {phase === 'checking' ? 'ÜBERPRÜFE BERECHTIGUNG...' : 'ZUGRIFF GEWÄHRT'}
            </div>
            <div className="lo-sub">
              {phase === 'checking' ? 'Verbinde mit Discord...' : 'Weiterleitung zum Dashboard...'}
            </div>
            {phase === 'granted' && <div className="lo-bar"><div className="lo-fill"/></div>}
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="lp-wrap">

        {/* Top bar */}
        <header className="lp-topbar">
          <div className="lt-left">
            <span className="lt-dot blue"/>
            <span className="lt-dot red"/>
            <span className="lt-label">POLIZEI HAMBURG — GESICHERTE VERBINDUNG</span>
          </div>
          <div className="lt-right">
            <span>{dateStr}</span>
            <span className="lt-sep">|</span>
            <span className="lt-time">{timeStr}</span>
          </div>
        </header>

        {/* Card */}
        <main className="lp-card">

          {/* Shield logo */}
          <div className="lp-shield-wrap">
            <div className="lp-shield">
              <div className="ls-outer">
                <div className="ls-inner">
                  <StarIcon />
                </div>
              </div>
              <div className="ls-glow"/>
            </div>
          </div>

          {/* Title */}
          <div className="lp-title">
            <div className="lp-t1">EMERGENCY HAMBURG</div>
            <div className="lp-t2">POLICE MANAGEMENT SYSTEM</div>
            <div className="lp-t3">PHASE 1 · v2.0 · RESTRICTED ACCESS</div>
          </div>

          {/* Divider */}
          <div className="lp-divider">
            <div className="ld-line"/>
            <LockIcon />
            <div className="ld-line"/>
          </div>

          {/* Error */}
          {errMsg && (
            <div className="lp-error">
              <AlertIcon />
              <span>{errMsg}</span>
            </div>
          )}

          {/* Login button */}
          <button className="lp-btn" onClick={() => { window.location.href = '/api/auth/login' }}>
            <DiscordIcon />
            <span>MIT DISCORD EINLOGGEN</span>
            <div className="lp-btn-shine"/>
          </button>

          {/* Info */}
          <p className="lp-info">
            Zugriff nur für autorisierte Mitglieder des Emergency Hamburg Discord-Servers.
          </p>

          {/* Role pills */}
          <div className="lp-roles">
            {[
              ['admin',     '👑 ADMIN'],
              ['leitung',   '🎖️ LEITUNG'],
              ['polizei',   '🚔 POLIZEI'],
              ['zuschauer', '👁️ ZUSCHAUER'],
            ].map(([cls, label]) => (
              <span key={cls} className={`badge badge-${cls}`}>{label}</span>
            ))}
          </div>
        </main>

        {/* Bottom bar */}
        <footer className="lp-footer">
          <span>POLIZEIBEHÖRDE HAMBURG · INTERN · NICHT FÜR DIE ÖFFENTLICHKEIT</span>
          <span>SYS-ID: EH-2025-001 · TLS 1.3</span>
        </footer>
      </div>
    </div>
  )
}

/* ── SVG Icons ── */
function SpinnerIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="17" stroke="currentColor" strokeWidth="1.5"
        strokeDasharray="4 3" style={{animation:'spin 1.2s linear infinite'}}/>
      <path d="M20 12v8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}
function CheckIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="17" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M13 20l5 5 9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  )
}
function LockIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
      <rect x="3" y="7" width="10" height="8" rx="1" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.4"/>
      <circle cx="8" cy="11" r="1.2" fill="currentColor"/>
    </svg>
  )
}
function AlertIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M8 5v3M8 10v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}
function DiscordIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.001.022.015.04.036.05a19.844 19.844 0 0 0 5.993 3.03.077.077 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
    </svg>
  )
}
