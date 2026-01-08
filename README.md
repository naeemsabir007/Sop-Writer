<p align="center">
  <img src="public/logo-icon.svg" alt="SOPWriter.pk Logo" width="80" height="80" />
</p>

<h1 align="center">SOPWriter.pk</h1>

<p align="center">
  <strong>AI-Powered Statement of Purpose Generator for International Students</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#api-documentation">API</a> •
  <a href="#deployment">Deployment</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Supabase-Backend-3FCF8E?logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white" alt="Vite" />
</p>

---

## Overview

**SOPWriter.pk** is a full-stack SaaS application that leverages AI to generate visa-ready Statements of Purpose tailored for students applying to universities abroad. Built with modern web technologies, it features a multi-step form wizard, AI-powered document generation, real-time payment processing, and a comprehensive admin dashboard.

```
📊 98% Visa Success Rate  •  🎓 2,000+ Students Served  •  🌍 6+ Countries Supported
```

---

## Features

### 🤖 AI-Powered SOP Generation
- **Country-Specific Templates** — Dynamic prompts calibrated for USA, UK, Canada, Australia, Germany & more
- **IELTS Score Integration** — Adjusts writing complexity (B2/C1 English) based on student's proficiency
- **Visa-Focused Content** — Automatically includes "Intent to Return" statements for visa compliance
- **Smart Gap Year Handling** — Professionally addresses employment gaps in the narrative

### 📝 Multi-Step Form Wizard
- **Progressive Disclosure** — 5-step guided flow with animated transitions (Framer Motion)
- **Real-Time Validation** — Schema-based validation using Zod with instant feedback
- **Auto-Save** — Draft progress persisted to Supabase in real-time
- **Responsive Design** — Optimized for mobile, tablet, and desktop viewports

### 💳 Payment Integration
- **Multiple Plans** — Standard & Expert packages with tiered pricing
- **Payment Confirmation** — Real-time status updates and receipt generation
- **Admin Payment Dashboard** — Track transactions, approve payments, manage user credits

### 📄 Document Management
- **PDF Export** — Generate professional PDF documents with jsPDF
- **Copy to Clipboard** — One-click copy for easy sharing
- **Version History** — Track edits and regenerate documents as needed
- **Document Library** — View all generated SOPs in user dashboard

### 🔐 Authentication & Security
- **Supabase Auth** — Email/password authentication with session management
- **Protected Routes** — Role-based access control for user and admin routes
- **Row-Level Security** — Database policies ensuring users only access their data
- **Sensitive Data Handling** — Separate secure table for PII (addresses, phone numbers)

### 💬 AI Chat Support
- **Real-Time Assistant** — Floating chat widget for instant help
- **Context-Aware** — Understands user's application status and documents

---

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | Component-based UI with Suspense & lazy loading |
| **TypeScript** | Type-safe development with strict mode |
| **Vite** | Lightning-fast HMR and optimized production builds |
| **Tailwind CSS** | Utility-first styling with custom design system |
| **Framer Motion** | Fluid animations and page transitions |
| **shadcn/ui** | Accessible, customizable component library (Radix UI) |
| **React Router v6** | Client-side routing with nested layouts |
| **React Query** | Server state management with caching |
| **React Hook Form** | Performant forms with Zod validation |

### Backend
| Technology | Purpose |
|------------|---------|
| **Supabase** | PostgreSQL database, Auth, Storage, Edge Functions |
| **Deno Edge Functions** | Serverless AI generation with low latency |
| **Gemini 1.5 Flash** | LLM for intelligent document generation (Google AI) |

### DevOps
| Technology | Purpose |
|------------|---------|
| **Vercel** | Zero-config deployments with edge caching |
| **ESLint** | Code quality enforcement |
| **PostCSS** | CSS processing with Autoprefixer |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENT (React SPA)                        │
├─────────────────────────────────────────────────────────────────────┤
│  Pages/         Components/         Hooks/          Integrations/   │
│  ├── Index      ├── Navbar          ├── use-toast   └── supabase/   │
│  ├── Dashboard  ├── HeroSection     └── use-mobile      ├── client  │
│  ├── CreateSOP  ├── PaymentModal                        └── types   │
│  ├── SOPResult  ├── AIChatWidget                                    │
│  └── Admin*     └── ui/ (shadcn)                                    │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ REST / Realtime
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         SUPABASE BACKEND                            │
├─────────────────────────────────────────────────────────────────────┤
│  Auth          Database (PostgreSQL)       Edge Functions           │
│  ├── JWT       ├── users                   ├── generate-sop         │
│  └── Sessions  ├── sops                    └── ai-support-chat      │
│                ├── sop_sensitive_details                            │
│                ├── payments                                         │
│                └── profiles                                         │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         AI GATEWAY                                  │
│                    (Gemini 2.5 Flash LLM)                          │
└─────────────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

1. **Edge Functions for AI** — Serverless Deno functions minimize cold starts and enable streaming responses
2. **Separate Sensitive Table** — PII stored in `sop_sensitive_details` with stricter RLS policies
3. **Schema Validation** — Zod schemas shared between client and server for consistent validation
4. **Lazy Loading** — Strategic code splitting reduces initial bundle size
5. **Design System** — Custom Tailwind config with CSS variables for theming

---

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Supabase account (free tier works)
- Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/sopwriter.git
cd sopwriter

# Install dependencies
npm install
# or
bun install

# Set up environment variables
cp .env.example .env
```

### Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

For Supabase Edge Functions (add these as secrets in Supabase Dashboard):
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key
```

### Development

```bash
# Start development server
npm run dev

# Run linter
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

### Database Setup

Run the migrations in `supabase/migrations/` to set up your database schema:

```bash
supabase db push
```

---

## API Documentation

### Edge Function: `generate-sop`

Generates an AI-powered Statement of Purpose based on user input.

**Endpoint:** `POST /functions/v1/generate-sop`

**Headers:**
```
Authorization: Bearer <user_jwt>
Content-Type: application/json
```

**Request Body:**
```json
{
  "sopId": "uuid-of-sop-record"
}
```

**Response:**
```json
{
  "success": true,
  "content": "Generated SOP content..."
}
```

**Error Codes:**
| Code | Description |
|------|-------------|
| 400 | Invalid sopId format |
| 401 | Unauthorized (invalid/missing JWT) |
| 404 | SOP not found or access denied |
| 429 | Rate limit exceeded |
| 402 | AI credits exhausted |

---

## Project Structure

```
sopwriter/
├── public/                 # Static assets
├── src/
│   ├── components/
│   │   ├── ui/            # shadcn/ui components (49 components)
│   │   └── ...            # Feature components
│   ├── pages/             # Route pages (14 pages)
│   ├── hooks/             # Custom React hooks
│   ├── integrations/      # External service clients
│   ├── layouts/           # Page layouts
│   └── lib/               # Utility functions
├── supabase/
│   ├── functions/         # Edge Functions (Deno)
│   └── migrations/        # Database schema
├── tailwind.config.ts     # Design system configuration
└── vite.config.ts         # Build configuration
```

---

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to `main`

### Supabase Edge Functions

```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy generate-sop
```

---

## Performance Optimizations

- **Code Splitting** — React.lazy() for route-level splitting
- **Image Optimization** — WebP format with lazy loading
- **Bundle Analysis** — Vite's built-in analyzer for monitoring
- **Caching Strategy** — React Query's stale-while-revalidate
- **Font Loading** — Preconnect + display:swap for web fonts

---

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting a PR.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is proprietary software. All rights reserved.

---

<p align="center">
  <strong>Built with ❤️ in Pakistan</strong>
</p>
