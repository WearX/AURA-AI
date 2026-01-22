# TanulásAI 🎓

**Személyre szabott AI-alapú tanulássegítő középiskolásoknak**

OTIO 2025 - Országos Tudományos és Innovációs Olimpia projekt

## Funkciók

- 📚 **Vizsgák kezelése** - Add hozzá a közelgő dolgozataidat és vizsgáidat
- 📋 **Automatikus tanulási terv** - AI generált ütemterv a vizsgákhoz
- ✅ **Haladáskövetés** - Jelöld készre a teljesített feladatokat
- 🤖 **AI Mentor chat** - Lokális AI (Ollama) - bármilyen témáról beszélgethetsz!
- 📱 **PWA** - Telepíthető mobilra

## Telepítés

### 1. Klónozd a repository-t

```bash
git clone <repository-url>
cd AURA-AI
```

### 2. Környezeti változók beállítása

Hozz létre egy `.env.local` fájlt a projekt gyökérkönyvtárában:

```bash
# Supabase konfiguráció (kötelező a bejelentkezéshez)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Groq API konfiguráció (AI chathez)
GROQ_API_KEY=your-groq-api-key
```

**Supabase projekt létrehozása:**
1. Menj a [https://app.supabase.com](https://app.supabase.com) oldalra
2. Hozz létre egy új projektet
3. Másold ki a projekted URL-jét és anon kulcsát a Settings > API menüből
4. Az authentikáció már be van állítva - csak add hozzá az env változókat!

**Groq API kulcs megszerzése:**
1. Menj a [https://console.groq.com](https://console.groq.com) oldalra
2. Regisztrálj/jelentkezz be
3. Hozz létre egy API kulcsot
4. Másold be a `.env.local` fájlba

### 3. Alkalmazás indítása

```bash
# Függőségek telepítése
npm install

# Next.js dev szerver indítása
npm run dev
```

Nyisd meg: `http://localhost:3000`

## Első használat

1. **Regisztráció**: A `/signup` oldalon hozz létre egy új fiókot
2. **Bejelentkezés**: Jelentkezz be az email címeddel és jelszavaddal
3. **Kezdd el a tanulást**: Készíts jegyzeteket, flashcardokat, és használd az AI chatet!

## Technológiák

- **Next.js 16** - React keretrendszer
- **React 19** - UI könyvtár
- **TypeScript** - Típusbiztos kód
- **Tailwind CSS v4** - Stílusok
- **Zustand** - State management
- **Supabase** - Authentikáció és adatbázis
- **Groq API** - AI chat (llama-3.3-70b modell)
- **PWA** - Progressive Web App

## Mobil telepítés (PWA)

1. Nyisd meg a weboldalt a telefonodon (Chrome/Safari)
2. Kattints a "Hozzáadás a kezdőképernyőhöz" opcióra
3. Az app mostantól úgy működik, mint egy natív alkalmazás!

## AI Chat

Az AI Chat a Groq API-t használja (llama-3.3-70b modell).
Bármilyen témáról kérdezhetsz:
- Tanulási technikák
- Történelem, fizika, kémia, bármi
- Általános kérdések
- Flashcard generálás beszélgetésből

## Authentikáció

Az alkalmazás Supabase-t használ a felhasználói authentikációhoz:
- **Email/jelszó regisztráció**: Biztonságos fiók létrehozás
- **Védett route-ok**: Csak bejelentkezett felhasználók férnek hozzá
- **Session management**: Automatikus munkamenet kezelés
- **Kijelentkezés**: Biztonságos kijelentkezés gomb a főoldalon

## Készítette

Fodor - OTIO 2025
