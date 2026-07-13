# SkillSwap — Community Time Bank 🕰️🤝

> Trade skills, not money. A full-stack **MERN** platform where members teach what they know to earn **time-credits** (1 hour = 1 credit) and spend those credits to learn something new — guided by **Skilly**, a built-in AI learning assistant.

Built by **Namratha R** as a final-year project.

---

## ✨ Why it's different

Most marketplaces move money. SkillSwap runs on a **time-bank economy**: your time is the currency, so a student, a retiree and a professional all trade as equals. An **AI assistant** plans learning paths, suggests what you could teach, and answers questions about the platform in natural language.

## 🚀 Features

- **Time-credit economy** — earn 1 credit per hour taught, spend credits to learn. Every movement is recorded in an auditable ledger.
- **Skill marketplace** — publish skills with categories, levels, tags and full-text search.
- **Booking workflow** — request → teacher accepts → mark complete → credits settle automatically between learner and teacher.
- **Ratings & reviews** — two-way reviews after each session update a member's reputation.
- **Real-time messaging** — 1:1 chat between members over **Socket.IO**.
- **AI assistant (Skilly)** — a real LLM (Gemini / OpenAI / Claude) with platform context: your balance, your skills, popular skills.
- **Leaderboard, dashboards, profiles** — polished, responsive UI built with **Tailwind CSS**.
- **JWT auth** with hashed passwords (bcrypt).

## 🧱 Tech stack

| Layer     | Tech                                                              |
|-----------|------------------------------------------------------------------|
| Frontend  | React 18, React Router, Vite, Tailwind CSS, Axios, Socket.IO client |
| Backend   | Node.js, Express, Socket.IO, JWT, bcrypt                         |
| Database  | MongoDB + Mongoose (auto in-memory fallback for zero-setup demos) |
| AI        | Pluggable LLM provider — Google Gemini, OpenAI, or Anthropic Claude |

## 📁 Project structure

```
skillswap-timebank/
├── server/                # Express API + Socket.IO
│   └── src/
│       ├── models/        # User, Skill, Session, Transaction, Review, Message, AiChat
│       ├── controllers/   # auth, users, skills, sessions, reviews, messages, ai
│       ├── services/      # aiService (LLM), timebank (credit ledger)
│       ├── routes/        # REST routes
│       └── utils/seed.js  # demo data
└── client/                # React + Vite + Tailwind
    └── src/
        ├── pages/         # Landing, Browse, SkillDetail, Dashboard, Sessions, Messages, Profile, ...
        ├── components/    # Navbar, ChatWidget (Skilly), SkillCard, ui helpers
        └── context/       # AuthContext
```

## 🏁 Getting started

### Prerequisites
- Node.js 18+ (tested on Node 24)
- Optionally MongoDB — **not required**, the server spins up an in-memory MongoDB automatically if `MONGODB_URI` is empty.

### 1. Install everything
```bash
npm run install:all
```

### 2. Configure the server
```bash
cd server
cp .env.example .env      # then edit .env
```
Set at minimum:
- `JWT_SECRET` — any long random string.
- `AI_PROVIDER` + the matching API key to enable the AI assistant:
  - `AI_PROVIDER=gemini` and `GEMINI_API_KEY=...` (free key: https://aistudio.google.com/apikey)
  - or `AI_PROVIDER=openai` and `OPENAI_API_KEY=...`
  - or `AI_PROVIDER=anthropic` and `ANTHROPIC_API_KEY=...`

Leave `MONGODB_URI` blank to use the in-memory demo DB (auto-seeded with sample members and skills), or point it at a local/Atlas MongoDB for persistence.

### 3. Run in development (from the project root)
```bash
npm run dev
```
- Client → http://localhost:5173
- API → http://localhost:5000

### Demo login
When running on the in-memory DB, four demo members are seeded automatically:

| Email             | Password      |
|-------------------|---------------|
| `aisha@demo.com`  | `password123` |
| `diego@demo.com`  | `password123` |
| `mei@demo.com`    | `password123` |
| `sam@demo.com`    | `password123` |

## 🔌 API overview

| Method | Endpoint                     | Description                       |
|--------|------------------------------|-----------------------------------|
| POST   | `/api/auth/register`         | Create account (+ signup credits) |
| POST   | `/api/auth/login`            | Log in, returns JWT               |
| GET    | `/api/skills`                | Search / filter skills            |
| POST   | `/api/skills`                | Publish a skill (auth)            |
| POST   | `/api/sessions`              | Request a session (auth)          |
| POST   | `/api/sessions/:id/complete` | Complete → settle credits (auth)  |
| POST   | `/api/reviews`               | Review a completed session (auth) |
| POST   | `/api/messages`              | Send a direct message (auth)      |
| POST   | `/api/ai/chat`               | Ask Skilly, the AI assistant (auth) |

## 🧠 How the time bank settles credits

1. A learner requests a session (balance is checked but not yet moved).
2. The teacher accepts.
3. Either party marks it complete → `settleSession` debits the learner and credits the teacher, writing two ledger entries.
4. Both can leave a review, updating the other's rating.

## 📦 Production build
```bash
npm run build      # builds the client to client/dist
npm start          # serves the API (point MONGODB_URI at a real database)
```

## 📄 License
© Namratha R
