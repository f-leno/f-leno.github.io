# Felipe Leno da Silva - personal website

Live at **https://f-leno.github.io**. This is a plain static site (HTML, CSS, and
JavaScript) published by GitHub Pages. There is nothing to build or install.

## How to update the website

Everything shown on the page is in **[`content.yml`](content.yml)**, in the same order as
the page. To change something:

1. Open `content.yml`: on GitHub, open the file and click the pencil icon (**Edit**), or
   edit it locally in any text editor.
2. Change the text, following the examples already in the file.
3. Update the date in `last_update`, for example `last_update: "January 15th, 2027."`.
4. Commit and push (on GitHub: **Commit changes**). GitHub Pages republishes the site in
   about a minute. If you still see the old version, wait a moment and refresh.

### Editing rules

- **Indentation matters.** Keep it exactly like the surrounding examples, using spaces
  (never tabs).
- **Put text in "double quotes".** If the text itself contains double quotes, wrap it in
  'single quotes' instead (inside single quotes, an apostrophe is written as two: `''`).
- Inside text you can write `**bold**`, `*italic*`, and `[link text](https://example.com)`.
- Lines starting with `#` are notes for you; they never appear on the site.
- To remove an entry, delete its whole block: the line starting with `-` and the indented
  lines below it. If a section is left with no entries, it disappears from the page and the
  menu automatically.

### Common tasks

**Add a publication.** Paste this block under the right group (Patents, Books, Journals,
or Conferences / Workshops). Entries are shown in the order they appear. Your name
(`SILVA, F.L.`) is bolded automatically; use `**...**` to bold someone else.

```yaml
      - title: "Title of the paper"
        link: "https://doi.org/..."
        authors: "SILVA, F.L.; COAUTHOR, A.; et al."
        venue: "*Journal Name*, v. 12, 2027."
```

Use `link: ""` if there is no link yet; the title is then shown without a link. To add a
new group of publications, copy a whole group (from `- group:` to the end of its items) and
rename it.

**Add an award.** The tag is the small label on the left.

```yaml
  - tag: "LLNL"
    text: "**Name of the award** Organization, 2027."
```

**Add a year of academic service.** Under the conference's `years:`, add one line (years are
always shown in ascending order; use `""` if the year has no link):

```yaml
          2026: "https://conference-website-for-2026"
```

New conference in a service group:

```yaml
      - acronym: "ICML"
        name: "International Conference on Machine Learning"
        years:
          2026: "https://icml.cc/Conferences/2026"
```

New workshop under Workshop Organizer:

```yaml
      - name: "Name of the workshop at CONFERENCE"
        link: "https://workshop-website"
```

**Change your job or affiliation.** Edit `position` and `organization` (and the summary
text). Optionally, also update the short description for search engines in the
`<meta name="description">` line near the top of `index.html`.

**Show a CV button (optional).** A "CV" button below the summary is currently not shown. To
add it, copy the PDF into the `downloads` folder and uncomment the `cv:` line in
`content.yml` (remove the `#`), for example `cv: "downloads/cv_leno_2027.pdf"`.

**Change the photo or a profile icon.** Put the image in the `img` folder and change
`photo`, or the `icon` of the profile.

**Add a download.** Copy the file into `downloads` and add an entry (a "here" link to the
file is added automatically):

```yaml
  - text: "Description of the file."
    file: "downloads/name-of-the-file.zip"
```

## Preview before publishing (optional)

From the repository folder, run:

```
npx http-server -p 8080 -c-1
```

Then open http://localhost:8080. Opening `index.html` directly from disk does not work,
because browsers do not let pages read `content.yml` from a file on disk.

## If something looks wrong

If `content.yml` cannot be read (usually a missing quote or wrong indentation), the page
shows a red box with the line number and the problem. Fix that line, save, and refresh.
You can also always restore the previous version from the Git history.

## What each file does

| File | Purpose |
| --- | --- |
| `content.yml` | All information shown on the page. **This is the file you edit.** |
| `index.html` | Page structure: menu, section titles, footer, and analytics tags. |
| `css/site.css` | Design (colors, fonts, layout). |
| `js/site.js` | Builds the page from `content.yml`; menu and scrolling behavior. |
| `js/js-yaml.min.js` | Library that reads `content.yml` (js-yaml 4.1.0, MIT license). |
| `img/`, `downloads/` | Images and downloadable files. |

Section titles and menu labels (for example, "Sample of Publications") are in `index.html`.
