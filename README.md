# Arushi Nadar — Portfolio

This is a static portfolio site written in plain HTML, CSS and JavaScript. It has no build step and no dependencies. Open it in VS Code, edit it, and push it to GitHub Pages.

## Structure

```
index.html          Home: opening animation, statement, selected work, about teaser
work.html           Work index (Work 01–04)
work/vyuha.html     Work 01 · Product & game design
work/aura.html      Work 02 · Brand identity & packaging
work/festive.html   Work 03 · Campaign & retail design (Coca-Cola India)
work/liv.html       Work 04 · Branding & app design
about.html          About me
connect.html        Email, LinkedIn, location
assets/css/style.css   All styles (colours and fonts are set at the top in :root)
assets/js/intro.js     Opening sequence (home page only)
assets/js/main.js      Scroll reveals, header, hover previews, page transitions
assets/img/...         Images, one folder per project
```

## Preview locally in VS Code

1. Open the folder in VS Code.
2. Install the **Live Server** extension.
3. Right-click `index.html` and choose **Open with Live Server**.

The intro plays once, then stays off for 12 hours. To watch it again, add `?intro` to the URL (for example `index.html?intro`), or click **Replay intro** in the footer.

## Publish on GitHub Pages

1. Create a new repository on GitHub, for example `https://www.linkedin.com/in/www.linkedin.com/in/www.linkedin.com/in/arushi-nadar-3a438a237438a237438a237/?isSelfProfile=true.github.io` or `portfolio`.
2. In this folder, run:
   ```
   git remote add origin https://github.com/<your-username>/<repo>.git
   git branch -M main
   git push -u origin main
   ```
3. On GitHub, go to **Settings → Pages**. Under Source, choose **Deploy from a branch**, then select **main** and **/ (root)**.
4. The site goes live at `https://<your-username>.github.io/<repo>/`. If you named the repo `<your-username>.github.io`, it goes live at `https://<your-username>.github.io/`.

## Editing tips

- **Accent colours** for each project are set on the `<html>` tag of its page (`style="--accent:#322D72"`).
- **Intro timing** is set in `play()` in `assets/js/intro.js`. Each step is a single delay in milliseconds.
- **Adding an image:** export it as `.webp`, around 2000px on its longest side, and copy one of the existing `<figure class="fig">` blocks. Set `--span` from 1 to 12 to control its width in the row.
- **Accessibility:** the intro never plays for visitors who have reduced motion turned on. It can always be skipped with the button or the Esc key.
