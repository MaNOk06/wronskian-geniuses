# Wronskian Genuises website

A site about a weight bouncing on a spring. Plain HTML, CSS and JavaScript, with no build step and no framework. Every interactive graph is worked out live in your browser.

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

**2. In the `<head>` of every HTML page**, swap the Google Fonts link so the new fonts actually load. The current line is:
```html
<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
```

## Other easy edits
- **Team names, roles and emails:** in `team.html` (the addresses are placeholders).
- **Insight Maker:** publish your model, then in `resources.html` replace the placeholder block with the commented iframe line just above it.
- **Colours:** all colours live at the top of `css/style.css` under `:root`.
- **The menu:** defined once in the `NAV` list inside `js/components.js`.
