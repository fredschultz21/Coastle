# Coastle

A daily geography puzzle game where players identify coastal locations from satellite imagery. Guess the location, earn points, and share your score!

## How to Play

1. Study the zoomed-in satellite view of a mystery coastal location
2. Use up to 4 zoom-outs to see more area (but lose points!)
3. Place your guess on the interactive world map
4. Earn points based on accuracy and speed
5. Share your score and challenge friends

**New location every day at midnight! (via cron-job.org)**

Play now: [coastle-game.vercel.app](https://coastle-game.vercel.app)

## Features

- **Daily Challenges**: Fresh coastal location every 24 hours
- **Smart Scoring**: Earn more points for early guesses and accuracy
- **Replay Prevention**: LocalStorage ensures one guess per day
- **Mobile Optimized**: Fully responsive with touch controls
- **Share Results**: Copy your score with emoji boxes to share on social media
- **Clean UI**: Minimalist dark theme with smooth animations

## Scoring System

**Base Points (by turn):**
- Turn 1: 4000 points
- Turn 2: 3000 points
- Turn 3: 2000 points
- Turn 4: 1000 points

**Distance Penalty:**
- -1000 points per 200 miles from target
- Within 200 miles = **CORRECT** (no penalty!)

**Example:**
- Turn 2 guess, 350 miles away:
  - Base: 3000 points
  - Penalty: -2000 points (2 × 200-mile rings)
  - **Final: 1000 points**

## Tech Stack

**Frontend:**
- [Next.js 14](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- LocalStorage - Game state persistence

**Backend:**
- [Node.js](https://nodejs.org/) + Express
- [PostgreSQL DB, Supabase](https://supabase.com/) - Location database
- [Supabase Storage](https://supabase.com/) - Satellite imagery

**Deployment:**
- Frontend: [Vercel](https://vercel.com/)
- Backend: [Render](https://render.com/)

## Project Structure
```
coastle/
├── frontend/
│   ├── app/
│   │   ├── page.jsx         # Main game component
│   │   └── how-to-play/
│   │       └── page.jsx     # Instructions page
│   └── public/
│       └── pixelmap.png     # World map for guessing
├── backend/
│   └── server.js            # Backend API
└── README.md
```

## Key Features

### Coordinate System
- Custom Mercator projection calibration for pixel-perfect accuracy
- Handles mobile/desktop viewport differences
- Supports zoom and pan on world map

### Replay Prevention
- LocalStorage tracks current turn when zooming out
- Prevents refresh exploits
- Shows results on return visits same day

### Share Feature
- Emoji boxes show performance (🟩🟨🟧🟥)
- One-click copy to clipboard
- Formatted for social media sharing

## License

© 2025 Coastle. All rights reserved.

## Acknowledgments

- Satellite imagery: © Mapbox © OpenStreetMap contributors © Maxar
- Inspired by Wordle, Travle, and Satle

---

**Play today's challenge:** [coastle-game.vercel.app](https://coastle-game.vercel.app)
