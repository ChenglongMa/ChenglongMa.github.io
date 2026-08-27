---
title: Slides
summary: An introduction to using Hugo Blox Builder's Slides feature.
authors: [admin]
tags: [PhD, Research]
categories: []
date: '2024-05-24T00:00:00Z'
slides:
  # Choose a theme from https://github.com/hakimel/reveal.js#theming
  theme: black
  # Choose a code highlighting style (if highlighting enabled in `params.toml`)
  #   Light style: github. Dark style: dracula (default).
  highlight_style: dracula
---

# What is a Ph.D.?

Reproduced by [Chenglong Ma](https://chenglongma.com/) | &copy;[Matt Might](http://matt.might.net/)

<div style="height: 200px;display: flex;align-items: flex-end;justify-content: flex-end;">

<div style="font-size:0.3em;font-style: italic;">
<a href="https://matt.might.net/">Matt Might</a>, a professor in
<a href="https://www.cs.utah.edu/">Computer Science</a>
at the <a href="https://www.utah.edu/">University of Utah</a>, created 
<a href="https://matt.might.net/articles/phd-school-in-pictures/">The
Illustrated Guide to a Ph.D.</a> to explain what a Ph.D. is to new and
aspiring graduate students.<br/>
[Matt has licensed the guide for sharing with 
<a href="http://matt.might.net/articles/phd-school-in-pictures/#license">
special terms under the Creative Commons license</a>.]
</div>

</div>

---

Imagine a circle that contains all of human knowledge:

<div class="circle outer-circle"></div>
<div class="circle inner-circle"></div>

---

Imagine a circle that contains all of human knowledge:

<svg viewBox="0 0 400 400" width="1639" height="1608" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" overflow="hidden"><g transform="translate(-1381 -756)"><path d="M2207.3 1530.26C2190.84 1505.32 2324.38 1388.09 2505.58 1268.42 2686.78 1148.75 2847.02 1071.95 2863.49 1096.88 2879.96 1121.82 2746.42 1239.05 2565.22 1358.72 2384.02 1478.39 2223.77 1555.19 2207.3 1530.26Z" fill="#D62828" fill-rule="evenodd"/><path d="M2284.63 1479.22C2269.41 1456.18 2334.15 1386.61 2429.21 1323.82 2524.28 1261.03 2613.68 1228.81 2628.9 1251.85 2644.11 1274.89 2579.38 1344.47 2484.32 1407.25 2389.25 1470.04 2299.85 1502.26 2284.63 1479.22Z" stroke="#FFFFFF" stroke-width="6.875" stroke-miterlimit="8" fill="#F77F00" fill-rule="evenodd"/><path d="M2200.5 1267.5C2260.98 1267.5 2317.16 1285.92 2363.76 1317.45L2403.31 1350.14 2404.44 1348.44C2412.62 1340.26 2423.9 1335.2 2436.37 1335.2 2461.31 1335.2 2481.52 1355.45 2481.52 1380.42 2481.52 1392.91 2476.47 1404.22 2468.3 1412.4L2455.83 1420.82 2469.55 1446.15C2484.33 1481.14 2492.5 1519.61 2492.5 1560 2492.5 1721.54 2361.77 1852.5 2200.5 1852.5 2039.23 1852.5 1908.5 1721.54 1908.5 1560 1908.5 1398.46 2039.23 1267.5 2200.5 1267.5Z" stroke="#FFFFFF" stroke-width="9.16667" stroke-miterlimit="8" fill="#E9C46A" fill-rule="evenodd"/><path d="M1384.5 1560C1384.5 1117.9 1749.84 759.5 2200.5 759.5 2651.16 759.5 3016.5 1117.9 3016.5 1560 3016.5 2002.1 2651.16 2360.5 2200.5 2360.5 1749.84 2360.5 1384.5 2002.1 1384.5 1560Z" stroke="#642E24" stroke-width="6.875" stroke-miterlimit="8" fill="none" fill-rule="evenodd"/><path d="M1976.5 1560C1976.5 1436.56 2076.79 1336.5 2200.5 1336.5 2324.21 1336.5 2424.5 1436.56 2424.5 1560 2424.5 1683.44 2324.21 1783.5 2200.5 1783.5 2076.79 1783.5 1976.5 1683.44 1976.5 1560Z" stroke="#FFFFFF" stroke-width="9.16667" stroke-miterlimit="8" fill="#2A9D8F" fill-rule="evenodd"/><path d="M2083.5 1560C2083.5 1495.66 2135.88 1443.5 2200.5 1443.5 2265.12 1443.5 2317.5 1495.66 2317.5 1560 2317.5 1624.34 2265.12 1676.5 2200.5 1676.5 2135.88 1676.5 2083.5 1624.34 2083.5 1560Z" stroke="#FFFFFF" stroke-width="9.16667" stroke-miterlimit="8" fill="#264653" fill-rule="evenodd"/><rect x="2791.5" y="1019.5" width="130" height="130" stroke="#000000" stroke-width="6.875" stroke-miterlimit="8" stroke-dasharray="27.5 20.625" fill="none"/></g></svg>


---

## Features

- Efficiently write slides in Markdown
- 3-in-1: Create, Present, and Publish your slides
- Supports speaker notes
- Mobile friendly slides

---

## Controls

- Next: `Right Arrow` or `Space`
- Previous: `Left Arrow`
- Start: `Home`
- Finish: `End`
- Overview: `Esc`
- Speaker notes: `S`
- Fullscreen: `F`
- Zoom: `Alt + Click`
- [PDF Export](https://revealjs.com/pdf-export/)

---

## Code Highlighting

Inline code: `variable`

Code block:

```python
porridge = "blueberry"
if porridge == "blueberry":
    print("Eating...")
```

---

## Math

In-line math: $x + y = z$

Block math:

$$
f\left( x \right) = \;\frac{{2\left( {x + 4} \right)\left( {x - 4} \right)}}{{\left( {x + 4} \right)\left( {x + 1} \right)}}
$$

---

## Fragments

Make content appear incrementally

```
{{%/* fragment */%}} One {{%/* /fragment */%}}
{{%/* fragment */%}} **Two** {{%/* /fragment */%}}
{{%/* fragment */%}} Three {{%/* /fragment */%}}
```

Press `Space` to play!

{{% fragment %}} One {{% /fragment %}}
{{% fragment %}} **Two** {{% /fragment %}}
{{% fragment %}} Three {{% /fragment %}}

---

A fragment can accept two optional parameters:

- `class`: use a custom style (requires definition in custom CSS)
- `weight`: sets the order in which a fragment appears

---

## Speaker Notes

Add speaker notes to your presentation

```markdown
{{%/* speaker_note */%}}

- Only the speaker can read these notes
- Press `S` key to view
  {{%/* /speaker_note */%}}
```

Press the `S` key to view the speaker notes!

{{< speaker_note >}}

- Only the speaker can read these notes
- Press `S` key to view
  {{< /speaker_note >}}

---

## Themes

- black: Black background, white text, blue links (default)
- white: White background, black text, blue links
- league: Gray background, white text, blue links
- beige: Beige background, dark text, brown links
- sky: Blue background, thin dark text, blue links

---

- night: Black background, thick white text, orange links
- serif: Cappuccino background, gray text, brown links
- simple: White background, black text, blue links
- solarized: Cream-colored background, dark green text, blue links

---

{{< slide background-image="/media/boards.jpg" >}}

## Custom Slide

Customize the slide style and background

```markdown
{{</* slide background-image="/media/boards.jpg" */>}}
{{</* slide background-color="#0000FF" */>}}
{{</* slide class="my-style" */>}}
```

---

## Custom CSS Example

Let's make headers navy colored.

Create `assets/css/reveal_custom.css` with:

```css
.reveal section h1,
.reveal section h2,
.reveal section h3 {
  color: navy;
}
```

---

# Questions?

[Ask](https://discord.gg/z8wNYzb)

[Documentation](https://docs.hugoblox.com/content/slides/)
