# Your personal website

A free, customizable website for essays and quotes. No paid services, external fonts, or dependencies. Your content is kept separately from the design.

## Put it on GitHub

1. Create a **public** repository named `jj-woolf.github.io`, replacing jj-woolf with your GitHub username.
2. Upload this folder's contents, including `.github/workflows/publish.yml`. The website files belong at the repository root, not inside another folder. If using GitHub's file uploader, create the workflow file separately if the hidden `.github` folder is omitted.
3. In the repository, open **Settings → Pages** and choose **GitHub Actions** as the source.
4. Open **Actions → Publish website → Run workflow**. After it succeeds, visit `https://jj-woolf.github.io`.

Every later change saved to the `main` branch will rebuild and publish automatically. The files in a public repository are visible to everyone; keep private drafts elsewhere.

## Personalize the site

Edit `config.json` to change the site title, description, and your display name. Edit `content/about.txt` to introduce yourself. Change colors and layout in `assets/style.css`.

## Publish an essay

In `content/essays`, create a file such as `a-new-idea.md`:

```markdown
---
title: A new idea
date: 2026-10-08
summary: A short description of what this essay explores.
---

Your first paragraph goes here.

## A section heading

Another paragraph with **bold**, *italics*, and a [link](https://example.com).

> A passage you want to highlight.

- One thought
- Another thought
```

The title and date are required. Use dates in YYYY-MM-DD format. Separate paragraphs and headings with blank lines. This starter supports paragraphs, headings, bold, italics, web links, simple bullet lists, and block quotes; other Markdown features can be added later.

## Publish quotes

Edit `content/quotes.json`. Start with this structure, replacing the text with a quote you want to publish:

```json
[
  {
    "text": "The quotation goes here.",
    "author": "Author’s name",
    "source": "Book, essay, or speech",
    "tags": ["Reading", "Ideas"]
  }
]
```

Add more quote objects separated by commas. Text and author are required; source and tags are optional. Quotes are displayed in the order you write them unless the reader chooses to sort by author.

## Preview on your computer

With Python 3 installed:

```
python3 build.py
python3 -m http.server 8000 --directory dist
```

Open `http://localhost:8000`. Rebuild after editing content. GitHub runs the build for you when you publish, so Python is not required on your computer to edit through GitHub.

## How we can work together

Give me an essay, a batch of quotes, or describe a feature you want. We can add topic pages, reading lists, images, a different layout, or other sections while keeping existing content. After this folder is connected to your GitHub repository, future changes can be committed and published from that checkout when GitHub access is available.

## Publish a poem

Create a file in `content/poetry`, such as `poem-title.md`:

```text
---
title: Poem title
author: Author name
---

First line of the poem
Second line of the poem

A new stanza begins here
```

Title and author are separate required fields. The poem text preserves line breaks, blank lines, and indentation. Poetry is listed by title, with the author below. Readers can search titles and authors or sort by either.
