-- ═══════════════════════════════════════════════════════════
-- Emergency Hamburg — Supabase Datenbank Schema
-- Dieses SQL in Supabase unter SQL Editor einfügen & ausführen
-- ═══════════════════════════════════════════════════════════

-- Einsätze
CREATE TABLE IF NOT EXISTS einsaetze (
  id           TEXT PRIMARY KEY DEFAULT 'E-' || floor(random()*90000+10000)::text,
  typ          TEXT NOT NULL,
  adresse      TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'aktiv' CHECK (status IN ('aktiv','wartend','abgeschlossen')),
  prioritaet   TEXT NOT NULL DEFAULT 'mittel' CHECK (prioritaet IN ('hoch','mittel','niedrig')),
  einheiten    TEXT[] DEFAULT '{}',
  erstellt_von TEXT,
  erstellt_am  TIMESTAMPTZ DEFAULT now()
);

-- Einheiten / Funk
CREATE TABLE IF NOT EXISTS einheiten (
  id           SERIAL PRIMARY KEY,
  funkrufname  TEXT NOT NULL UNIQUE,
  status       TEXT NOT NULL DEFAULT 'außer-dienst' CHECK (status IN ('verfügbar','im-einsatz','bereit','außer-dienst')),
  dienstnummer TEXT NOT NULL,
  spieler      TEXT NOT NULL,
  fahrzeug     TEXT,
  aktualisiert TIMESTAMPTZ DEFAULT now()
);

-- Dienstprofile
CREATE TABLE IF NOT EXISTS profile (
  id            SERIAL PRIMARY KEY,
  dienstnummer  TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  rang          TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'außer-dienst' CHECK (status IN ('im-dienst','außer-dienst')),
  einsaetze     INT DEFAULT 0,
  beitrittsdatum DATE DEFAULT CURRENT_DATE
);

-- Strafen
CREATE TABLE IF NOT EXISTS strafen (
  id            TEXT PRIMARY KEY DEFAULT 'S-' || floor(random()*90000+10000)::text,
  name          TEXT NOT NULL,
  vergehen      TEXT NOT NULL,
  betrag        INT NOT NULL,
  bearbeiter_dn TEXT NOT NULL,
  datum         TIMESTAMPTZ DEFAULT now()
);

-- Kennzeichen
CREATE TABLE IF NOT EXISTS kennzeichen (
  id          SERIAL PRIMARY KEY,
  kennzeichen TEXT NOT NULL UNIQUE,
  besitzer    TEXT NOT NULL,
  fahrzeug    TEXT NOT NULL,
  farbe       TEXT,
  status      TEXT NOT NULL DEFAULT 'unauffällig' CHECK (status IN ('unauffällig','fahndung','gestohlen')),
  erstellt_am TIMESTAMPTZ DEFAULT now()
);

-- Login-Logs
CREATE TABLE IF NOT EXISTS logins (
  id          SERIAL PRIMARY KEY,
  discord_id  TEXT NOT NULL,
  username    TEXT NOT NULL,
  role        TEXT NOT NULL,
  login_at    TIMESTAMPTZ DEFAULT now(),
  status      TEXT DEFAULT 'aktiv'
);

-- ── Demo-Daten (optional) ─────────────────────────────────────
INSERT INTO einheiten (funkrufname, status, dienstnummer, spieler, fahrzeug) VALUES
  ('PHW-1',  'verfügbar',    '10234', 'Officer_Hansen',  'FuStW'),
  ('PHW-2',  'im-einsatz',   '10235', 'Officer_Müller',  'FuStW'),
  ('PHW-K1', 'bereit',       '10200', 'KOK_Weber',       'FuKw')
ON CONFLICT DO NOTHING;

INSERT INTO profile (dienstnummer, name, rang, status, einsaetze, beitrittsdatum) VALUES
  ('10234', 'Max Hansen',  'Polizeihauptmeister', 'im-dienst',    127, '2024-01-15'),
  ('10235', 'Jana Müller', 'Polizeimeisterin',    'im-dienst',    89,  '2024-03-20'),
  ('10200', 'Klaus Weber', 'Kriminaloberkommissar','im-dienst',   401, '2023-06-01')
ON CONFLICT DO NOTHING;
