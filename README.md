# Bike Manager - Premium Motorcycle Buyback Landing Page

A high-performance landing page for a premium motorcycle buyback service, built with **Next.js 16 (Turbopack)**, **Tailwind CSS**, and **Framer Motion**.

> **Live Demo**: [Check the live deployment](https://github.com/swlee724/bike-landing) (Add your link here)

## 🛠 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) (Dark Mode, Responsive)
- **Animation**: [Framer Motion](https://www.framer.com/motion/) (Entrance effects, Staggered lists)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Deployment**: [Cloudflare Pages](https://pages.cloudflare.com/) (Static Export)
- **Optimization**: `next/image`, `next/font`, Dynamic Imports

## ✨ Key Features

### 1. High-Conversion UX
- **Performance**: 95+ Lighthouse Score via Generic Static Export.
- **Mobile First**: Fixed Bottom Bar for mobile calls/chats (Sticky UI).
- **Interactive Elements**:
  - Live "Purchase Ticker" using CSS infinite scroll (no JS overhead).
  - "1-Minute Quote" CTA linked directly to KakaoTalk API.
  - Accordion FAQ and Scroll-triggered entrance animations.

### 2. Trust Building
- **Real-time Data**: Displays 89+ reviews and 5.0 rating based on actual business data.
- **Transparent Pricing**: Detailed service costs (Scanner, Inspection) listed upfront.
- **Social Proof**: Ticker showcasing real-time "Sold" status to create FOMO.

### 3. SEO & Analytics
- **Metadata**: Fully configured Open Graph (OG) tags for social sharing.
- **Tracking**: Google Analytics 4 (GA4) integrated via `@next/third-parties`.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/bike-manager.git

# Install dependencies
npm install

# Run development server
npm run dev
```

### Deployment (Cloudflare Pages)

This project is configured for **Static Export** (`output: 'export'`) to minimize server costs and maximize speed.

1. Build the project:
   ```bash
   npm run build
   ```
2. Deploy the `out/` directory to Cloudflare Pages.

## 📂 Project Structure

```
├── app/                  # Next.js App Router
│   ├── layout.tsx        # Root layout with Fonts & GTM
│   ├── page.tsx          # Main Landing Page Composition
│   └── globals.css       # Tailwind & Custom Animations
├── components/           # Reusable UI Components
│   ├── Hero.tsx          # Hero Section with CTA
│   ├── TrustSection.tsx  # Feature Highlights
│   ├── PurchaseTicker.tsx# Infinite Scroll Ticker
│   └── ...
└── public/               # Static Assets
```

## 📝 License

This project is personal portfolio work.
