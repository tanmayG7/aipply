# AiPply - Product Specification

**Version:** 1.0
**Last Updated:** October 2025

## Product Overview

AiPply is an AI-powered job search automation platform targeting Indian job seekers. It aggregates jobs from 8+ career portals, matches them to user preferences, and automates the application process.

### Target Audience
- Active job seekers maximizing application volume
- Professionals in career transitions
- Recent graduates entering the job market

---

## Core Features

### Authentication & Onboarding
- Email/password and Google OAuth login
- Multi-step profile setup wizard (personal info, professional details, education, work experience, skills, preferences)
- CV/resume upload with parsing
- Job preference configuration (titles, locations, salary, work type, keywords)

### Dashboard & Analytics
- Overview statistics: jobs curated, jobs applied, average experience/salary of matches
- Auto-apply stats: total, today, this month (premium only)
- Data visualizations: location distribution bar chart, salary range pie chart
- Profile completion progress tracker

### Job Board
- AI-matched job listings from 8+ platforms (Naukri, Foundit, Hirist, Shine, TimesJobs, Internshala, CutShort, IIMJobs)
- Filters: experience level, salary range, work type, posted date
- Job detail view with one-click apply

### Auto-Apply (Premium)
- Automated daily job applications via backend service
- Platform credential storage (AES-256 encrypted)
- Daily application limits and scheduling
- Real-time application tracking
- Applied jobs visible in dashboard

### Job Tracker
- Track manually and automatically applied jobs
- Status management: Applied, Pending, Interview, Rejected, Offer
- Filter, search, sort capabilities

### Subscription System
- Free tier: manual job search, limited views, basic tracking
- Premium tiers: monthly (INR 666), quarterly (INR 1,497), yearly (INR 4,188)
- Razorpay payment integration
- Self-service cancellation with retention offers
- 7-day grace period after expiration

### CV Services
- Professional CV review/rewrite service
- Razorpay payment (INR 987)
- Order tracking in dashboard

---

## Technical Architecture

### Frontend
- Next.js 15 (React 19), TypeScript
- Tailwind CSS, Radix UI, Framer Motion
- Redux Toolkit for user state
- Recharts for data visualization

### Backend
- Next.js API routes (frontend server-side)
- Node.js automation service (separate repo)
- Firebase Auth, Firestore, Storage
- MongoDB for job listings
- Redis + Bull for job queue processing

### Integrations
- Razorpay (payments)
- Google Vertex AI (form filling)
- Resend (email notifications)
- Firebase (auth, database, hosting)

---

## Data Collections

| Collection | Purpose |
|------------|---------|
| `users/{userId}` | User profiles, preferences |
| `subscriptions/{userId}` | Subscription status, plan details |
| `appliedJobs/{jobId}` | Applied job records |
| `dashboardData/{userId}` | Cached dashboard statistics |
| `cv_orders/{orderId}` | CV service orders |
| `cancellations/{id}` | Cancellation audit log |
| `webhook_logs/{id}` | Razorpay webhook event log |

---

## Design System

- Dark theme: backgrounds #000000, #020218, #0f0f23
- Accent colors: purple (#AE94FF), blue (#2E2ADC), green (#20CEB6)
- Fonts: Manrope (primary), Inter (secondary)
- Mobile-first responsive design
