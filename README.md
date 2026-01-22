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

### 1. Ollama telepítése (lokális AI)

```bash
# macOS / Linux
curl -fsSL https://ollama.com/install.sh | sh

# Windows: töltsd le az ollama.com-ról

# Modell letöltése (válassz egyet):
ollama pull llama3.2        # 2GB - gyors, jó magyar
ollama pull mistral         # 4GB - erősebb
ollama pull gemma2          # 5GB - Google model
```

### 2. Alkalmazás indítása

```bash
# Függőségek telepítése
npm install

# Ollama indítása (külön terminálban)
ollama serve

# Next.js dev szerver indítása
npm run dev
```

Nyisd meg: `http://localhost:3000`

## Technológiák

- **Next.js 16** - React keretrendszer
- **TypeScript** - Típusbiztos kód
- **Tailwind CSS** - Stílusok
- **Zustand** - State management
- **Ollama** - Lokális AI (LLM)
- **PWA** - Progressive Web App

## Mobil telepítés (PWA)

1. Nyisd meg a weboldalt a telefonodon (Chrome/Safari)
2. Kattints a "Hozzáadás a kezdőképernyőhöz" opcióra
3. Az app mostantól úgy működik, mint egy natív alkalmazás!

## AI Chat

Az AI Chat Ollama-t használ, ami lokálisan fut a gépeden.
Bármilyen témáról kérdezhetsz:
- Tanulási technikák
- Történelem, fizika, kémia, bármi
- Általános kérdések

## Készítette

Fodor - OTIO 2025
