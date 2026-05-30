# 🚔 Emergency Hamburg — Setup Anleitung (Android)
# Komplett kostenlos · Nur Browser nötig

---

## Was du brauchst
- Android-Handy mit Chrome/Firefox
- GitHub Account (kostenlos)
- Discord Developer Account (kostenlos)
- Vercel Account (kostenlos)
- Supabase Account (kostenlos)

---

## SCHRITT 1 — GitHub Account + Projekt hochladen

1. Gehe zu **github.com** und erstelle einen kostenlosen Account
2. Klicke oben rechts auf **"+"** → **"New repository"**
3. Name: `emergency-hamburg`
4. Auf **"Create repository"** klicken
5. Gehe dann zu **github.dev/DEIN-NAME/emergency-hamburg**
   (Tipp: github.dev öffnet einen Editor direkt im Browser)
6. Lade alle Projektdateien aus der ZIP hoch:
   - Klicke auf das Explorer-Symbol links
   - Ziehe die entpackten Dateien rein ODER
   - Klicke auf "Upload Files" und wähle alle Dateien aus

---

## SCHRITT 2 — Discord Application erstellen

1. Gehe zu **discord.com/developers/applications**
2. Klicke **"New Application"** → Name: `Emergency Hamburg Bot`
3. Links auf **"OAuth2"** klicken
4. Unter **"Redirects"** auf **"Add Redirect"**:
   ```
   https://DEIN-PROJEKTNAME.vercel.app/api/auth/callback
   ```
   (Den genauen Link bekommst du erst nach Schritt 4 — erstmal leer lassen)
5. **Client ID** und **Client Secret** kopieren und irgendwo speichern
6. Links auf **"Bot"** klicken → **"Add Bot"** → bestätigen
7. Unter "Token" auf **"Reset Token"** → Token kopieren + speichern
8. Scrolle runter → aktiviere **"Server Members Intent"**
9. Bot einladen: Gehe zu **OAuth2 → URL Generator**
   - Scopes: `bot`
   - Bot Permissions: `Read Messages`, `Send Messages`, `Read Message History`
   - Generierten Link öffnen → Bot auf deinen Server einladen

---

## SCHRITT 3 — Discord Rollen-IDs herausfinden

1. Discord App öffnen → dein Server
2. **Einstellungen** (Zahnrad) → **Rollen**
3. Klicke auf jede Rolle → in der URL steht die ID
   ODER: Rechtsklick auf Rolle → "ID kopieren" (Entwicklermodus nötig)

**Entwicklermodus aktivieren:**
Discord → Einstellungen → Erweitert → Entwicklermodus AN

Notiere dir die IDs für:
- Admin-Rolle
- Leitungs-Rolle
- Polizei-Rolle
- Zuschauer-Rolle
- Server-ID (Rechtsklick auf deinen Server → ID kopieren)
- Log-Kanal-ID (Rechtsklick auf den Kanal → ID kopieren)

---

## SCHRITT 4 — Supabase Datenbank einrichten

1. Gehe zu **supabase.com** → kostenlosen Account erstellen
2. **"New Project"** → Name: `emergency-hamburg`
3. Passwort merken, Region: **Frankfurt (eu-central-1)**
4. Warte bis Projekt erstellt ist (~1 Minute)
5. Links auf **"SQL Editor"** klicken
6. Die Datei `supabase-schema.sql` öffnen (aus dem Projekt)
7. Den gesamten Inhalt in den SQL Editor kopieren
8. Auf **"Run"** klicken → alle Tabellen werden erstellt
9. Gehe zu **Settings → API**:
   - **Project URL** kopieren → das ist dein `SUPABASE_URL`
   - **service_role** Key kopieren → das ist dein `SUPABASE_SERVICE_KEY`

---

## SCHRITT 5 — Vercel deployen

1. Gehe zu **vercel.com** → kostenlosen Account mit GitHub erstellen
2. **"Add New Project"** → dein `emergency-hamburg` Repository auswählen
3. **"Import"** klicken
4. Vor dem Deploy auf **"Environment Variables"** klicken und diese eintragen:

```
DISCORD_CLIENT_ID        = (aus Schritt 2)
DISCORD_CLIENT_SECRET    = (aus Schritt 2)
DISCORD_BOT_TOKEN        = (aus Schritt 2)
DISCORD_GUILD_ID         = (Server-ID aus Schritt 3)
DISCORD_LOG_CHANNEL_ID   = (Kanal-ID aus Schritt 3)
DISCORD_REDIRECT_URI     = https://DEIN-NAME.vercel.app/api/auth/callback
ROLE_ADMIN               = (Rollen-ID aus Schritt 3)
ROLE_LEITUNG             = (Rollen-ID aus Schritt 3)
ROLE_POLIZEI             = (Rollen-ID aus Schritt 3)
ROLE_ZUSCHAUER           = (Rollen-ID aus Schritt 3)
SUPABASE_URL             = (aus Schritt 4)
SUPABASE_SERVICE_KEY     = (aus Schritt 4)
JWT_SECRET               = (erfinde einen langen zufälligen Text, z.B. "meinGeheimnis2025XYZabc123!")
```

5. Auf **"Deploy"** klicken
6. Warte ~2 Minuten → dein Dashboard ist online!
7. Die URL die Vercel dir gibt (z.B. `emergency-hamburg.vercel.app`) ist dein Dashboard

---

## SCHRITT 6 — Discord Redirect URI nachtragen

1. Zurück zu **discord.com/developers/applications**
2. Deine App → OAuth2
3. Redirect URI eintragen:
   ```
   https://emergency-hamburg-XXXX.vercel.app/api/auth/callback
   ```
   (genaue URL von Vercel kopieren)
4. Speichern

---

## FERTIG! 🎉

Dein Dashboard läuft jetzt unter deiner Vercel-URL.
Öffne es im Browser → "Mit Discord einloggen" → fertig!

---

## Häufige Probleme

**"not_in_guild" Fehler:**
→ Du bist nicht auf dem Discord-Server oder der Bot ist nicht eingeladen

**"no_permission" Fehler:**
→ Du hast keine der konfigurierten Rollen auf dem Server

**Weißer Bildschirm:**
→ In Vercel unter "Deployments" nachschauen ob es Fehler gibt

**Rollen werden nicht erkannt:**
→ Rollen-IDs nochmal prüfen (müssen reine Zahlen sein)

---

## Kosten Zusammenfassung

| Dienst   | Kosten    | Limit                    |
|----------|-----------|--------------------------|
| GitHub   | 0€        | Unbegrenzt               |
| Vercel   | 0€        | 100GB Bandwidth/Monat    |
| Supabase | 0€        | 500MB DB, 50.000 Anfragen/Monat |
| Discord  | 0€        | Unbegrenzt               |
| **TOTAL**| **0€**    |                          |
