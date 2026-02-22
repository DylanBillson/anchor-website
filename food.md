---
title: "Food"
description: "Lunch, dinner, kids and Sunday Roast menus at The Anchor Inn, plus allergen information and table booking."
hero_image: /assets/img/hero/anchor-hero-food-temp.png
hero_alt: "A plated meal at The Anchor Inn"
intro: "Lunch and evening menus through the week, with Sunday Roasts on Sundays. All menus below are fully text-based for accessibility."
---

## Jump to a menu

<nav class="anchor-links" aria-label="Food page sections">
  <a href="#book">Book a table</a>
  <a href="#lunch">Lunch</a>
  <a href="#dinner">Dinner</a>
  <a href="#kids">Kids</a>
  <a href="#sunday">Sunday Roast</a>
  <a href="#allergens">Allergen information</a>
</nav>

---

## Book a table {#book}

{% include table-booking.html %}

---

{% include opening-times.html context="food" %}

---

{::nomarkdown}
{% include food-special.html %}
{:/nomarkdown}

## Lunch {#lunch}

{% include menu-section.html section="lunch" %}

---

## Dinner {#dinner}

{% include menu-section.html section="dinner" %}

---

## Kids {#kids}

{% include menu-section.html section="kids" %}

---

## Sunday Roast {#sunday}

{% include menu-section.html section="sunday" %}

---

## Allergen information {#allergens}

{% include allergen-info.html %}
