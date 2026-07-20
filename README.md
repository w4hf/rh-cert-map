# Red Hat Certification Map

A client-side web app that helps Red Hat certified professionals visualize their certification progress across five product lines: OpenShift, Enterprise Linux, Ansible, Cloud-Native Applications, and AI.

## Live Website

Access the webapp at [https://w4hf.github.io/rh-cert-map/](https://w4hf.github.io/rh-cert-map/) or clone it and open `index.html` locally on your machine.

### Important !
if your browser still loads the old page, or if the page is not rendered correctly, force refresh your webpage by pressing :
- Firefox: Ctrl + Shift + R (PC) or Command + Shift + R (Mac)
- Chrome: Shift + F5 (PC) or Command + Shift + R (Mac)
- Edge: Ctrl + Shift + R (PC) or Command + Shift + R (Mac)
- Safari: Command + Option + R (Mac)

## Features

- **Interactive certification map** with five horizontal arrow tracks showing levels from Technologist/Developer up to Architect
- **Automatic verification** -- enter your Red Hat Certification ID to auto-detect your passed exams and certifications from [rhtapps.redhat.com/verify](https://rhtapps.redhat.com/verify)
- **URL-based verification** -- pass `?certId=###-###-###` as a URL parameter to auto-verify on page load
- **Auto-formatted input** -- dashes are inserted automatically as you type or paste digits into the Certification ID field
- **Legacy Credentials section** -- credentials from the old certification system that don't match the current map are shown with expiry status badges
- **Other Exams section** -- exams from your transcript that don't map to the known certification tracks are displayed in a separate table with date badges
- **Manual exam selection** -- check exams individually with a searchable, grouped checklist in the sidebar
- **Partial progress indicators** -- levels that are partially completed show as orange "(in progress)" on the map
- **Hover/tap tooltips** showing the requirements to reach each level and which exams you've passed
- **Light and dark mode** with automatic detection and manual toggle, using Red Hat brand colors
- **Collapsible sidebar** with exam list, search, view modes (by product, by level, flat), and sort toggle
- **Mobile responsive** -- sidebar collapses to an overlay with backdrop on mobile, tables scroll horizontally
- **Persistent state** saved in your browser's localStorage (exams, theme, sidebar)
- **Auto-update** -- the app automatically reloads when a new version is deployed
- **Accessibility** -- ARIA attributes on interactive controls (aria-expanded, aria-pressed, aria-label)

## Tech Stack

- **UI framework**: [PatternFly v6](https://www.patternfly.org/) (CDN) -- semantic tokens for colors, spacing, typography, and dark/light theme support
- **Icons**: Font Awesome 6 (CDN)
- **Fonts**: Red Hat Text and Red Hat Mono (Google Fonts)
- **Runtime**: Vanilla JavaScript -- no build step, no bundler, no frameworks

### Layout

The page follows a PatternFly v6 page component structure:

- **Masthead** (`pf-v6-c-masthead`) -- Red Hat logo, app title, GitHub link, theme toggle
- **Sidebar** (`pf-v6-c-page__sidebar`) -- Certification ID input with auto-format, exam checklist with expandable groups, view modes, sort
- **Main content** (`pf-v6-c-page__main`) -- Certification map SVG, Legacy Credentials table, Other Exams table

All colors are overridden with the Red Hat brand palette (#ee0000 accent, #f2f2f2/#ffffff light backgrounds, #000000/#292929 dark backgrounds) via CSS custom property overrides on PatternFly tokens.

## Usage

Open `index.html` in any browser. No build step or server required.

### Auto-detect certifications

1. Enter your Certification ID (format: `###-###-###`) in the sidebar input field -- dashes are inserted automatically
2. Click **Verify**
3. The app reads your **Current Credentials** to populate the certification map, and reads your **Exam Transcript** to populate the "Other Exams" table
4. Unmatched legacy credentials are shown with expiry countdown badges
5. Your name and matched exams will appear, and the map updates automatically

### URL parameter

You can link directly to a pre-verified view:

```
https://rh-cert-map.wasmer.app/?certId=140-255-795
```

### Manual selection

Check or uncheck exams in the sidebar. The certification map in the main content area updates in real time. Use the search box to filter exams by code or name. Switch between product view, level view, or flat list using the toolbar buttons.

## Deploying a New Version

On each deploy, bump the number in `version.txt` to trigger automatic browser refresh for returning users. No other changes needed -- the app compares the fetched version against `sessionStorage` and reloads if they differ.

## File Structure

```
index.html        # Single-page app (PF6 page layout)
style.css         # PF6-based styles with brand color overrides
app.js            # Application logic (exam data, map rendering, verification)
redhat-favicon.png # Red Hat logo (masthead and favicon)
version.txt       # Version number for auto-update detection
```
