# Hostel Student Finder

A Next.js web application for finding verified hostels near schools in Ghana.

## Features

- Browse hostels by school
- View detailed hostel information
- Save favorite hostels
- Subscription-based access
- Responsive design for mobile and desktop

## Tech Stack

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Supabase** - Backend and authentication
- **CSS Modules** - Styling
- **React Icons** - Icon library

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
app/
  ├── dashboard/        # Dashboard page with tabs
  ├── hostels/          # Hostels listing page
  ├── hostel/[id]/      # Hostel detail page
  ├── profile/          # User profile page
  ├── favorites/        # Saved hostels page
  ├── subscribe/        # Subscription page
  ├── select-school/    # School selection page
  ├── layout.tsx        # Root layout
  ├── page.tsx          # Landing page
  └── globals.css       # Global styles

lib/
  ├── supabase/         # Supabase client setup
  └── auth.ts           # Auth helpers
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Database Setup

Set up the following tables in Supabase:

- `hostels` - Hostel listings
- `schools` - School information
- `subscriptions` - User subscriptions
- `favorites` - User saved hostels
- `reviews` - Hostel reviews

## License

Private
