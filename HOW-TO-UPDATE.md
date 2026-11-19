# How to update the website

Notes for myself on maintaining the portfolio website. Live at [chipkoele.github.io/portfolio](https://chipkoele.github.io/portfolio/).

## Add a project card

All project cards come from one file: `data/projects.json`. Home shows the first 2 cards, Projects shows all of them.

1. On GitHub, open `data/projects.json` and click the pencil icon (Edit).
2. Copy one whole block, from `{` to `}`, and paste it at the top of the list (newest first).
3. Change the text in each field:

| Field | What it does |
|---|---|
| `title` | Card heading |
| `status` | Label at the top right: `Live`, `Built`, `In progress` or `Planned` |
| `problem` | One line: the problem the build solves |
| `built` | One or two lines: what I built |
| `stack` | Tools, shown as tags: `["n8n", "HubSpot"]` |
| `image` | Card image path, e.g. `assets/cards/my-project.jpg` |
| `imageAlt` | Short description of the image (for screen readers) |
| `demoLabel` / `demoUrl` | Text and link of the main button |
| `codeUrl` | Link for the "View code" button |

4. Upload the card image to `assets/cards/`: 800×500 px (16:10), a screenshot of the page area only, no window frame.
5. Commit. The site updates within a couple of minutes (hard refresh: Cmd+Shift+R).

**Watch out for commas:** every block except the last needs a comma after its closing `}`. If the cards ever disappear, check this first.

## Change the look

Colours and font live in one place: the design tokens at the top of `assets/css/site.css` (brand from my CV: Archivo, `#ae1800` red, warm neutrals).

## Routine for every change

New branch → pull request → check **Files changed** → merge → delete the branch → hard refresh.
