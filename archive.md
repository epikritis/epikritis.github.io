---
layout: page
title: Blog Archive
permalink: /archive.html
description: Every post published on this site, grouped by tag.
---

{% for tag in site.tags %}
<h2 class="archive-tag">{{ tag[0] }}</h2>
<ul class="archive-list">
  {% for post in tag[1] %}
  <li><a href="{{ post.url | relative_url }}"><time>{{ post.date | date: "%b %Y" }}</time><span>{{ post.title }}</span></a></li>
  {% endfor %}
</ul>
{% endfor %}

More writing lives on my [Medium blog]({{ site.blog_url }}){:target="_blank" rel="noopener"}.
