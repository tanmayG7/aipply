# Team Card Implementation - Kushagra Golash Profile

## Files Created/Modified

### 1. Created: `components/card/teamCard/TeamCard.tsx`
- Reusable team card component
- Props interface: name, role, description, imageSrc, imageAlt
- Styling matches existing design system exactly
- Auto-expands with content height

### 2. Modified: `app/about-us/page.tsx`
- Added import: `import TeamCard from "@/components/card/teamCard/TeamCard"`
- Replaced inline HTML cards with TeamCard components
- Implemented responsive triangular layout:
  - Desktop (custom-lg+): 2 cards on top, 1 centered below
  - Mobile/Tablet: Single column layout
- All 3 team members now displayed

## Design Specifications Matched
- Background: `#111111` (dark)
- Border: `border-[#333741]`
- Padding: `p-8`
- Border Radius: `rounded-[30px]`
- Image: 96x96 circular with object-cover
- Name: Manrope 24px bold white (centered)
- Role: Manrope 18px semibold #52A9FF (centered)
- Description: Manrope 16px #CECFD2 italic (auto-expand)

## Team Data
1. **Tanmay Garg** - Co-Founder & CEO
2. **Disha Garg** - Co-Founder & CTO
3. **Kushagra Golash** - Founding Tech Engineer (NEW)

## Responsive Behavior
- Mobile: Single column, each card max-width 448px
- Desktop (custom-lg+): Triangular 2-1 layout with center alignment
- Maintains triangle vertex positioning when screen allows
- Gracefully falls back to single column on narrower screens

## Image Assets
- Image path: `/public/static/images/Kushagra-Golash potrait.png`
- All image paths verified and confirmed existing

## No Breaking Changes
- Existing functionality preserved
- All other sections of about-us page untouched
- Component-based approach allows for future scalability
- Follows existing project conventions
