# epikritis.github.io

Personal site for Fredrick Njoroge — cybersecurity services. Built with [Jekyll](https://jekyllrb.com/) and hosted on GitHub Pages (it builds automatically when you push to `main`).

## Structure

| Path | What it is |
| --- | --- |
| `_config.yml` | Site title, description and links (LinkedIn, GitHub, blog) |
| `_layouts/home.html` | The homepage: hero, about, expertise, project, writing, contact |
| `_layouts/post.html`, `page.html` | Templates for blog posts and plain pages |
| `_includes/` | Shared pieces: `head`, `header`, `footer`, `icons`, share links |
| `_posts/` | Blog posts written in Markdown |
| `assets/css/main.css` | All styling (colours are CSS variables at the top) |
| `assets/js/main.js` | Animations: background network, typing, scroll reveal, card tilt |

## Writing a new post

Create `_posts/YYYY-MM-DD-my-post-title.md`:

```markdown
---
title: "My Post Title"
tags: [Threat Detection]
---

Your content in Markdown...
```

Commit and push — it will appear on the homepage ("also on this site") and in `/archive.html`.

## Preview locally

```bash
bundle install
bundle exec jekyll serve
# open http://localhost:4000
```

## Learning Jekyll

- Step-by-step tutorial: https://jekyllrb.com/docs/step-by-step/01-setup/
- GitHub Pages + Jekyll: https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll
- Liquid templating cheatsheet: https://shopify.github.io/liquid/
