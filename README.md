# For Marian · June 16

A romantic birthday site built with pure HTML, CSS, and vanilla JavaScript — no frameworks, no build step. Designed to be deployed directly on GitHub Pages.

## Project Structure

```
birthday-site/
├── index.html          Main page
├── style.css           All styles (design tokens, components)
├── script.js           Starfield, memories constellation, lightbox, meadow
├── assets/
│   ├── photos/         Extracted memory images (8 JPEGs)
│   │   ├── photo_1_Jul_2024.jpg
│   │   ├── photo_2_Aug_2024.jpg
│   │   ├── photo_3_Sep_2024.jpg
│   │   ├── photo_4_Oct_2024.jpg
│   │   ├── photo_5_Nov_2024.jpg
│   │   ├── photo_6_Jan_2025.jpg
│   │   ├── photo_7_Mar_2025.jpg
│   │   └── photo_8_May_2025.jpg
│   ├── icons/          (reserved for future icons)
│   └── music/          (reserved for future audio)
├── README.md           This file
└── .gitignore
```

## Features

- **Night-sky gradient** — deep violet to warm sunset
- **Animated Gemini constellation** — draws itself on load
- **Twinkling starfield** — generative, no images needed
- **Song card** — "A Song For Zula" by Phosphorescent with YouTube link
- **Handwritten letter** — romantic prose with scroll-reveal
- **Memories constellation** — vertical scroll-through timeline
  - Scale + opacity animation — active image enlarges at screen centre
  - SVG cubic Bézier path connecting all dots
  - Illuminated path + moving glow tip via `getTotalLength` / `getPointAtLength`
  - Lightbox on tap (ESC / swipe-down / outside-click closes)
- **Interactive flower meadow** — blooms on scroll, petals burst on tap, wind effect from cursor
- **Responsive** — works from 320 px to wide desktop
- **Reduced-motion safe** — respects `prefers-reduced-motion`

## Deploying to GitHub Pages

### Option A — GitHub UI (easiest)

1. Create a new GitHub repository (e.g. `birthday-marian`).
2. Upload all files by dragging the **birthday-site** folder contents into the repository's root.
3. Go to **Settings → Pages → Source** and select **Deploy from branch → main → / (root)**.
4. After a minute, your site is live at `https://<your-username>.github.io/birthday-marian/`.

### Option B — Git CLI

```bash
# Clone or init your repo
git init
git remote add origin https://github.com/<you>/birthday-marian.git

# Add everything and push
git add .
git commit -m "🎂 For Marian — June 16"
git branch -M main
git push -u origin main

# Enable Pages in GitHub Settings → Pages → Deploy from branch → main → / (root)
```

### Notes

- **No build step** required — pure static files.
- **No npm / Node** — just open `index.html` in a browser locally to preview.
- All asset paths are **relative** — they work from any sub-directory or domain.

---

*Made with love ♡*
