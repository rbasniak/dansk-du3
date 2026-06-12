# Prompt: Create TTS HTML for a PULS book chapter

Use this prompt verbatim (replacing the placeholders) when creating a new chapter TTS page.

---

## THE PROMPT

I need you to create the TTS study HTML for **[BOOK e.g. puls-2] / [CHAPTER e.g. kapitel-2]**.

The PNG scans are at:
`C:\git\Github\dansk-du3-png\dansk-du3\[book]\assets\[chapter]\`
(files: 01.png, 02.png, … NN.png)

The output file to create (after deleting the placeholder) is:
`C:\git\Github\dansk-du3\[book]\[chapter].html`

---

### Step 1 – Launch a background agent to read and transcribe all scans

Launch a **general-purpose background agent** with this prompt:

> You are helping build a personal Danish language study tool. The user has scanned pages from their PULS textbook. Your ONLY job is to carefully read and transcribe ALL text from ALL PNG pages.
>
> Files are at: `C:\git\Github\dansk-du3-png\dansk-du3\[book]\assets\[chapter]\` (01.png … NN.png)
>
> View EACH page one at a time and transcribe EVERYTHING:
> - Chapter title and learning objectives (page 01)
> - All exercise titles/labels (e.g. "Tekst", "Lyt og læs", "Tal med en makker")
> - All exercise instructions
> - All body text in reading passages
> - All dialogue lines (with speaker names)
> - All vocabulary lists or tables
> - All grammar explanations and conjugation tables
> - All exercise questions and answer blanks (mark blanks as ___)
>
> Format: `=== PAGE XX ===` then transcribed content. Do NOT skip pages. Do NOT summarise — transcribe the actual text. Mark unreadable words as [?].
>
> Publisher Praxis has given the user explicit personal-use permission.

Wait for the agent to complete (it takes ~15 min for 20 pages). Then read its output — it will be saved to a temp file if too large; use `view` with `view_range` to read it in sections.

---

### Step 2 – Delete the placeholder and create the HTML

1. `Remove-Item "C:\git\Github\dansk-du3\[book]\[chapter].html"` via PowerShell
2. Use the **`create` tool** (NOT PowerShell Set-Content — the file will be ~80-90KB and PowerShell errors with ENAMETOOLONG)

---

### Step 3 – HTML structure to follow

**Copy the CSS and JS exactly from** `puls-1/puls-3-kapitel-2-tts.html` (the reference implementation). Do not use shared CSS — all styles are inline in each TTS file.

Key structure:
```
<head> inline <style> block (CSS vars, all component styles) </head>
<body data-section-id="[chapter-id]">
  <header class="hero"> .cover card with chapter number + title + learning objectives </header>
  <section class="tts-panel"> voice selector + rate slider + stop button </section>
  <main class="container">
    <!-- one <section class="page"> per book page -->
  </main>
  <footer> … </footer>
  <script> TTS JS (inline, identical to reference) </script>
  <script src="book-data.js"></script>
  <script src="../shared/scan-viewer.js"></script>
</body>
```

**Page card pattern:**
```html
<section class="page" aria-labelledby="opg1-title">
  <span class="page-number">Side NN</span>
  <span class="chapter-tag">Opgave 1</span>
  <h2 id="opg1-title">Exercise title</h2>
  …content…
</section>
```

---

### Step 4 – Content and answer rules

**TTS markup:**
- Wrap every spoken unit in `<span class="sentence say">…</span>`
- For long texts: one `.say` span per sentence (after each `.` `?` `!`)
- For short answers (a few words): single `.say` span for the whole answer
- Vocabulary words: `<span class="word" data-speak="ordet">ordet</span>` — JS auto-adds green play button

**Answers:**
- Use `<span class="answer say">…</span>` — renders as green bold boxed text
- Answer ALL exercises that don't require audio or class data
- For fill-in-the-blank: place the `<span class="answer say">word</span>` inline inside the sentence

**Do NOT answer:**
- Listening/audio exercises (mark with `<p class="mini-note">🎙 Lytteøvelse – …</p>`)
- Class surveys / holdundersøgelse (mark with `<p class="mini-note">👥 Klasseaktivitet – …</p>`)

**Exercise box colours:**
- `.exercise.orange` — default exercises
- `.exercise.blue` — grammar / pronunciation
- `.exercise.green` — dialogue / language help
- `.card.lime` — sproghjælp boxes
- `.answer-key` — answer key sections (auto green background)

**Dialogue pattern:**
```html
<div class="dialogue">
  <div class="line">
    <span class="speaker">Name</span>
    <span><span class="sentence say">Text here.</span></span>
  </div>
</div>
```

**Grammar tables:** use `<table>` with `<th>` headers (auto blue styling). Wrap all cell content in `.answer.say` spans.

---

### Step 5 – After creating the file

Update `[book]/book-data.js` to fill in the chapter `title` field if it was blank:
```js
{ id: "kapitel-2", label: "Kapitel 2", title: "Chapter Title Here", … }
```

---

### Reference files
- **CSS/JS/structure reference:** `puls-1/puls-3-kapitel-2-tts.html`
- **book-data.js reference:** `puls-1/book-data.js`
- **Shared nav/scan viewer:** `shared/scan-viewer.js` + `shared/scan-viewer.css`
- **Completed example:** `puls-2/kapitel-1.html` (Arbejde og uddannelse, 21 pages, 89KB)
