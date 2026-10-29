# Nirob — Portfolio (flat files)

Every code file is in this folder with a plain name. No src or css folders.

styles.css  main.tsx  App.tsx  data.ts  lib.ts  cn.ts  index.html
Hero.tsx  About.tsx  Skills3D.tsx  BNCC.tsx  Beyond.tsx  FreeFire.tsx
Work.tsx  Contact.tsx  ui.tsx  chrome.tsx  PixelPortrait.tsx  Scene3D.tsx
CommandPalette.tsx   public/

Contact: alnasifmdnirob@gmail.com · Instagram @nir0b__ · GitHub Nirob-420

## Run

    npm install
    npm run dev        (usually http://localhost:5173)
    npm run build
    npm run preview

Your content lives in data.ts. Photos live in public/ — keep the same file names.
Cadet photo: upload bncc.jpg to https://nirob120.netlify.app and it appears automatically.

## Publish

Upload the dist folder to Netlify, or:

    npx netlify deploy --prod --dir=dist
