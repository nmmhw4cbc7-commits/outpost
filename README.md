# Outpost

**Find your next Larp spot.**

Outpost is a Progressive Web App for discovering the best places to work from anywhere. Whether it's a cafe with great WiFi, a quiet library, or a cozy coworking space - Outpost helps you find your perfect Larp spot.

## Features

- **Interactive Map** - Discover Larp spots near you with real-time location
- **Larp Score** - Community-driven ratings for WiFi, noise, outlets, and laptop friendliness
- **Check-ins** - Verify your location and earn Larp Points
- **Field Passport** - Track your Larp journey with stamps and badges
- **Reviews** - Share your experience and help other Larper's
- **Saved Spots** - Bookmark your favorite locations
- **PWA** - Install on any device, works offline

## Tech Stack

- **Frontend:** React + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Maps:** Leaflet + OpenStreetMap
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **PWA:** Vite PWA Plugin

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Google Maps](https://console.cloud.google.com/) API key (optional, for enhanced features)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/outpost.git
   cd outpost
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment file:
   ```bash
   cp .env.example .env
   ```

4. Fill in your environment variables:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. Run the Supabase SQL schema:
   - Go to your Supabase dashboard → SQL Editor
   - Copy the contents of `supabase/schema.sql`
   - Run the query

6. Start the development server:
   ```bash
   npm run dev
   ```

### Deployment

The app is configured for GitHub Pages deployment. Simply push to the `main` branch and the GitHub Action will automatically build and deploy.

For other platforms:
```bash
npm run build
```

The `dist` folder contains the production build.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps API key (optional) |

## Project Structure

```
src/
├── components/      # Shared UI components
├── pages/          # Route-level components
├── features/       # Feature-specific modules
│   ├── map/        # Map and filters
│   ├── spots/      # Spot-related components
│   ├── reviews/    # Review components
│   ├── checkins/   # Check-in system
│   ├── passport/   # Gamification
│   └── profile/    # User profile
├── lib/            # Utilities and configs
├── hooks/          # React hooks
├── types/          # TypeScript types
└── services/       # API and data services
```

## License

MIT
