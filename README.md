# ⚡ FormFlow

FormFlow is a premium, high-performance SaaS platform built to design interactive forms, capture user responses, and analyze them in real-time using advanced AI analysis. Featuring a dark-mode slate-violet aesthetic inspired by the **Expenso UI**, FormFlow simplifies forms creation and response gathering.

---

## 🎥 Video Demonstration
*(Insert your video walkthrough link or embed here)*
> [!NOTE]
> A walkthrough video of FormFlow's core features, form builder, and responsiveness will be uploaded here.

---

## 🌟 Key Features

- **Compact Drag-and-Drop Builder**: Powered by `@dnd-kit/core` and `Zustand`, featuring a clean, inline, space-efficient, two-column layout.
- **Inline Editing**: Double-click or click directly on form titles and descriptions inside the canvas to edit them dynamically.
- **Expenso UI Dark Violet Palette**: Sleek glassmorphism details, ambient background glows, and a curated dark violet, purple, and sky-blue color scheme.
- **Multi-Step & Single-Page Rendering**: Render fields in standard scrollable layouts or as interactive one-field-per-page slide transitions powered by `framer-motion`.
- **Live Notifications Center**: A real-time submissions notification dropdown built directly into the navbar with custom client polling.
- **Collapsible Responsive Sidebar**: Adapts from wide (`w-64`) to compact icon-only (`w-20`) states on desktop and collapses into a slide-out drawer on mobile screens.
- **Dedicated Response Detail Pages**: Click responses to open in a new tab (`target="_blank"`), showcasing the submitted values alongside structured, markdown-rendered AI-powered summaries and bullet points.
- **Upstash Redis Caching**: Bypasses PostgreSQL database roundtrips on public-facing embed pages for lightning-fast loads.
- **Upstash QStash Queue Pipeline**: Decouples heavy AI generation workloads via asynchronous webhook execution.
- **Privacy-First Metrics**: Removed Browser/OS metadata columns and client IP exposures to safeguard respondent data.
- **Instant SMTP Email Alerts**: Automatically emails the form creator with form submission details in real-time.

---

## 🛠️ Tech Stack

- **Core**: [Next.js 16 (App Router)](https://nextjs.org/) & [React 19](https://react.dev/)
- **Database**: [PostgreSQL (via Neon Serverless)](https://neon.tech/) & [Prisma ORM](https://www.prisma.io/)
- **Authentication**: [Better Auth](https://www.better-auth.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & Vanilla CSS
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Background Jobs**: [Upstash QStash](https://upstash.com/docs/qstash/overall/compare)
- **Caching**: [Upstash Redis](https://upstash.com/docs/redis/overall/getstarted)
- **AI Completion**: [OpenRouter API](https://openrouter.ai/)
- **SMTP Delivery**: [Nodemailer](https://nodemailer.com/)

---

## 🗄️ Database Schema

The PostgreSQL database is organized with the following Prisma models:

- **`User`**: System account profile (linked to Better Auth).
- **`Session`**: Active user sessions.
- **`Account`**: Provider links (OAuth credentials).
- **`Verification`**: Sign-up and password reset tokens.
- **`Form`**: Stores form structure, configurations (e.g. multi-step toggles), and list of fields (saved as a structured `Json` array).
- **`Response`**: Form submissions containing answered inputs, hashed IP metadata, and Markdown-rendered `aiInsight` summaries.

---

## 🚀 Setup & Installation Instructions

Follow these steps to run FormFlow locally:

### 1. Clone the repository
```bash
git clone <repository-url>
cd formflow
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory and specify the following parameters:

```env
# ── Database (Neon) ──
DATABASE_URL="postgresql://<user>:<password>@<neon-pooler-url>/neondb?sslmode=require"
DIRECT_URL="postgresql://<user>:<password>@<neon-direct-url>/neondb?sslmode=require"

# ── Auth (Better Auth) ──
# Run `openssl rand -hex 16` to generate a secret key
BETTER_AUTH_SECRET="your-better-auth-secret-key"
BETTER_AUTH_URL="http://localhost:3000"

# ── Google OAuth (Optional) ──
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# ── AI (OpenRouter) ──
OPENROUTER_API_KEY="your-openrouter-api-key"

# ── Cache (Upstash Redis) ──
UPSTASH_REDIS_REST_URL="your-upstash-redis-rest-url"
UPSTASH_REDIS_REST_TOKEN="your-upstash-redis-rest-token"

# ── Job Queue (Upstash QStash) ──
QSTASH_URL="your-qstash-url"
QSTASH_TOKEN="your-qstash-token"
QSTASH_CURRENT_SIGNING_KEY="your-qstash-signing-key"
QSTASH_NEXT_SIGNING_KEY="your-qstash-next-signing-key"

# ── App configuration ──
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# ── Email (SMTP) ──
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-google-app-password"
SMTP_FROM="FormFlow Alerts <your-email@gmail.com>"
```

### 4. Push Database Schema & Generate Prisma Client
```bash
npx prisma db push
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚡ Production Build Verification
To build and check the production bundle:
```bash
npm run build
npm run start
```
