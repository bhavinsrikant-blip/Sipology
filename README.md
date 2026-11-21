# Sipology — interactive cafe concept website

A responsive cafe website built with Vite, React, and the original **Grainient** component source supplied in the project brief.

## Icon design
- Updated the decorative arrows, sparkle marks and location pin to a consistent minimal outline style (style A).
- Icons are inline SVGs, so there is no extra icon-library dependency.

## Grainient interaction
- Uses the actual React Bits Grainient WebGL component from the supplied `Pasted text(2).txt` source.
- `interactive` and `stir` make the gradient respond to pointer movement.
- Pointer Events support mouse, pen, and touch input; tapping/touching also triggers the component's click swirl.
- Animated grain and slow-moving gradient remain active behind the page while scrolling.

## Validation notes
- The HTML structure, IDs and ARIA references were statically checked.
- The menu/navigation JavaScript passes Node syntax checking.
- A production Vite build still needs to be run after dependencies install (`npm install` then `npm run build`).

## Run locally
1. Install Node.js (LTS recommended).
2. Open this project folder in Terminal.
3. Run `npm install`.
4. Run `npm run dev` and open the local URL printed by Vite.

## Deploy to Vercel
1. Upload the contents of this folder to a GitHub repository.
2. Import the repository in Vercel.
3. Vercel should detect Vite. Build command: `npm run build`; output directory: `dist`.

## Customise
- Grainient palette and interaction strength: `src/main.jsx`.
- Cafe content: `index.html`.
- Layout and responsive styles: `styles.css`.
- Menu filtering and mobile navigation: `script.js`.

The cafe details, phone number, prices, and Paris location are fictional sample content. Images are remote Unsplash placeholders.
