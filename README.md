# MediHealth — Digital Healthcare Platform

A professional, responsive web application for **MediHealth**, a company specialising in basic healthcare services. Built with vanilla HTML, CSS, and JavaScript, with **Supabase** integration for database storage and user authentication.

---

## Project Overview

MediHealth provides basic healthcare services including health check-ups, online appointment scheduling, and health advice through their website. This digital solution was developed to meet the following objectives:

- **Simplify appointment scheduling** — Users can book, reschedule, and cancel with ease
- **Provide interactive health tips** — Personalised content based on user preferences
- **Enhance user experience** — Intuitive navigation and a polished, accessible interface

---

## Key Features

### 1. Online Appointment Booking
Users can **schedule, reschedule, and cancel** appointments through an easy-to-use interface.

- Select from available healthcare services (check-ups, blood tests, vaccinations, consultations)
- Choose preferred date and time slots
- Receive instant booking confirmation
- Look up existing appointments by email
- Reschedule or cancel with a single click
- Booking data is stored in Supabase with Row Level Security (RLS)
- Works in demo mode without Supabase connected

### 2. Interactive Health Tips
Users receive **personalised health tips** based on their profile and preferences.

- Filter tips by category: Nutrition, Fitness, Sleep, Mental Health, Hydration, Prevention
- Interactive chip-based filtering system with smooth transitions
- 10 evidence-based health tips included
- Personalisation prompt encouraging users to create an account for tailored recommendations
- Extensible tip system — easily add more via the `healthTips` array in `app.js`

### 3. Enhanced Navigation
A **simple and intuitive navigation** system to access different services on the platform.

- Fixed header with blur backdrop and scroll-responsive styling
- Active link highlighting based on current scroll position
- Smooth scroll to all sections via anchor links
- Fully responsive mobile navigation with animated hamburger menu and full-screen overlay
- Clear visual hierarchy guiding users to key actions (booking)

---

## Tech Stack

| Layer          | Technology                                    |
|----------------|-----------------------------------------------|
| **Structure**  | HTML5 (semantic markup)                       |
| **Styling**    | CSS3 (custom properties, grid, flexbox, animations) |
| **Logic**      | Vanilla JavaScript (ES6+, module pattern)     |
| **Database**   | Supabase (PostgreSQL with RLS)                |
| **Auth**       | Supabase Auth (email/password)                |
| **Fonts**      | Google Fonts — Outfit + Figtree               |

---

## File Structure

```
medihealth/
├── index.html      → Page structure and content (semantic HTML5)
├── styles.css      → All styling, animations, and responsive design
├── app.js          → Application logic, Supabase integration, interactivity
└── README.md       → Project documentation (this file)
```

### How the files work together

1. **`index.html`** — Contains all the page sections (hero, services, booking, health tips, account, setup, footer) and links to both `styles.css` and `app.js`. It also loads the Supabase JS SDK via CDN and Google Fonts.

2. **`styles.css`** — Defines the complete visual design using CSS custom properties (design tokens) for consistent theming. Includes responsive breakpoints at 1080px and 768px, scroll-reveal animations, and all component styling.

3. **`app.js`** — Encapsulates all application logic in the `MediHealth` module (IIFE pattern). Handles Supabase connection, form submissions, authentication, health tip rendering/filtering, navigation behaviour, and scroll animations. Exposes a clean public API for button `onclick` handlers.

---

## Supabase Setup

### 1. Create a Supabase Project
Go to [supabase.com](https://supabase.com) and create a free project.

### 2. Run the SQL Schema
Open the **SQL Editor** in your Supabase dashboard and run the following:

```sql
CREATE TABLE appointments (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name       TEXT NOT NULL,
  last_name        TEXT NOT NULL,
  email            TEXT NOT NULL,
  phone            TEXT,
  service          TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TEXT NOT NULL,
  notes            TEXT,
  status           TEXT DEFAULT 'confirmed',
  user_id          UUID REFERENCES auth.users(id),
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users
CREATE POLICY "insert_own" ON appointments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "select_own" ON appointments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "update_own" ON appointments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete_own" ON appointments FOR DELETE USING (auth.uid() = user_id);

-- Policies for anonymous/guest bookings
CREATE POLICY "anon_insert" ON appointments FOR INSERT WITH CHECK (user_id IS NULL);
CREATE POLICY "anon_select" ON appointments FOR SELECT USING (user_id IS NULL);
```

### 3. Connect in the App
Enter your **Supabase Project URL** and **Anon Key** in the Setup section of the website. These can be found in your Supabase dashboard under **Settings → API**.

### 4. Enable Email Auth
In your Supabase dashboard, go to **Authentication → Providers** and ensure Email auth is enabled. For development, you may want to disable email confirmation under **Authentication → Settings**.

---

## Running Locally

Since this is a static site with no build step, you can serve it with any local server:

```bash
# Option 1: Python
python3 -m http.server 8000

# Option 2: Node.js (npx)
npx serve .

# Option 3: VS Code Live Server extension
# Right-click index.html → Open with Live Server
```

Then open `http://localhost:8000` in your browser.

> **Note:** Opening `index.html` directly as a file (`file://`) will work for the UI, but Supabase API calls require a proper HTTP server due to CORS.

---

## Design Decisions

- **Aesthetic:** "Clinical Warmth" — a refined, trustworthy healthcare look using warm cream backgrounds with teal accents. The design communicates professionalism and approachability.
- **Typography:** Outfit for headings (geometric, modern) paired with Figtree for body text (humanist, readable).
- **Colour palette:** Teal primary (#2A9D8F), amber secondary (#E9A319), rose for alerts (#D56B6B), on a warm cream base (#FAFAF5).
- **No frameworks:** Built with vanilla HTML/CSS/JS to keep the project lightweight, fast, and dependency-free (aside from the Supabase SDK).
- **Module pattern:** JavaScript uses an IIFE to avoid polluting the global scope, with a clean public API.
- **Progressive enhancement:** The site works fully in demo mode without Supabase; database features activate when credentials are provided.

---

## Accessibility

- Semantic HTML5 elements (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`)
- Aria labels on interactive elements
- Sufficient colour contrast ratios
- Keyboard-navigable forms and links
- Responsive design from 320px to 1920px+
- Reduced motion support via CSS transitions (not `prefers-reduced-motion` yet — a potential enhancement)

---

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Future Enhancements

- Email/SMS appointment reminders
- User profile page with health preferences for deeper personalisation
- Appointment history and downloadable records
- Real-time availability checking against provider calendars
- `prefers-reduced-motion` media query support
- Dark mode toggle

---

## Licence

This project was developed as a set task deliverable for MediHealth. All rights reserved.
