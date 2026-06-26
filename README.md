# Wronskian Warriors website

A friendly, multi-page site about a weight bouncing on a spring. Plain HTML, CSS and JavaScript, with no build step and no framework. Every interactive graph is worked out live in your browser.

## Pages
- `index.html` : home, with the introduction, the model and analysis summaries, and contact
- `model.html` : how the equation is built, and the four kinds of motion
- `analysis.html` : the four cases drawn out, plus the live simulator and the motion map
- `team.html` : the team and contact
- `creative.html` : the colour it yourself picture
- `resources.html` : the paper, our report, the code, and an Insight Maker slot

## Run it on your computer
Just open `index.html` in a browser. For the smoothest result (so the shared menu and footer load properly), serve the folder:
```
python3 -m http.server 8000      then visit http://localhost:8000
```

## Put it online with Vercel
1. Put this whole folder in a Git repository (GitHub or GitLab), or use the Vercel command line tool.
2. Dashboard route: go to vercel.com, choose Add New, then Project, and import the repository. Set Framework Preset to "Other". Leave the build command empty. Set the output directory to the project root. Deploy.
3. Command line route: install with `npm i -g vercel`, then run `vercel` from inside this folder and accept the defaults.

There is no build and there are no settings to configure. Vercel just serves the files.

## Changing the font (this is set up to be easy)

The site currently uses a rounded "bubble" style: **Fredoka** for headings and **Nunito** for body text.

To try a different font you change it in two places:

**1. In `css/style.css`**, near the top, edit these two lines:
```css
--display: "Fredoka", "Trebuchet MS", system-ui, sans-serif;   /* headings */
--body:    "Nunito", system-ui, -apple-system, "Segoe UI", sans-serif; /* body text */
```

**2. In the `<head>` of every HTML page**, swap the Google Fonts link so the new fonts actually load. The current line is:
```html
<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### Ready made font sets to paste in

Bubble (current):
- CSS: `--display: "Fredoka", sans-serif;`  and  `--body: "Nunito", sans-serif;`
- Link family part: `family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700;800`

Rounder and more playful:
- CSS: `--display: "Baloo 2", sans-serif;`  and  `--body: "Nunito", sans-serif;`
- Link family part: `family=Baloo+2:wght@400;500;600;700&family=Nunito:wght@400;600;700`

Soft and modern:
- CSS: `--display: "Quicksand", sans-serif;`  and  `--body: "Inter", sans-serif;`
- Link family part: `family=Quicksand:wght@400;500;600;700&family=Inter:wght@400;500;600`

Friendly and clean:
- CSS: `--display: "Poppins", sans-serif;`  and  `--body: "Karla", sans-serif;`
- Link family part: `family=Poppins:wght@400;500;600;700&family=Karla:wght@400;500;700`

Calm and academic (the earlier look):
- CSS: `--display: "Fraunces", serif;`  and  `--body: "Atkinson Hyperlegible", sans-serif;`
- Link family part: `family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Atkinson+Hyperlegible:wght@400;700`

In each case, keep the `&family=IBM+Plex+Mono:wght@400;500&display=swap` bit at the end of the link so the small code labels still look right.

## Other easy edits
- **Team names, roles and emails:** in `team.html` (the addresses are placeholders).
- **Insight Maker:** publish your model, then in `resources.html` replace the placeholder block with the commented iframe line just above it.
- **Colours:** all colours live at the top of `css/style.css` under `:root`.
- **The menu:** defined once in the `NAV` list inside `js/components.js`.
