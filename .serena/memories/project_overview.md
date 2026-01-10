# AiPply Project Overview

## Tech Stack
- **Framework**: Next.js 15.1.9
- **Language**: TypeScript
- **UI Library**: React 19
- **Styling**: Tailwind CSS
- **Component Library**: Radix UI, HeadlessUI, Heroicons, Tabler Icons, Lucide React
- **State Management**: Redux Toolkit

## Key Commands
- Dev: `npm run dev` or `next dev`
- Build: `npm run build` or `next build`
- Lint: `npm run lint` or `next lint`
- E2E Tests: `npm run test:e2e`
- Deploy: `npm run deploy` (builds and deploys via Firebase)

## About Us Page Location
- File: `app/about-us/page.tsx`
- Current Team Section: Contains 2 co-founders (Tanmay & Disha) in 2-column grid

## Design System for Team Cards
- Background: `bg-[#111111]` (dark)
- Padding: `p-8`
- Border Radius: `rounded-[30px]`
- Border: `border border-[#333741]`
- Profile Image Size: `96x96` with `rounded-full object-cover`
- Name Font: `font-manrope text-[24px] font-bold text-white`
- Role Font: `font-manrope text-[18px] font-semibold text-[#52A9FF]`
- Description Font: `font-manrope text-[16px] text-[#CECFD2] leading-[150%]`
- Description Style: Italic with em tags

## Image Assets
- All team images stored in: `public/static/images/`
- Kushagra's image: `Kushagra-Golash potrait.png` (already exists)
