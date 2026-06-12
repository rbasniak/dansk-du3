(function () {
  "use strict";

  var sections = [
    {
      id: "kapitel-1",
      label: "Kapitel 1",
      title: "Introdansk",
      folder: "kapitel-1",
      html: "puls-3-kapitel-1-tts.html",
      pageRange: "Side 3–23",
      files: paddedRange(1, 19, 3)
    },
    {
      id: "kapitel-2",
      label: "Kapitel 2",
      title: "Hverdag",
      folder: "kapitel-2",
      html: "puls-3-kapitel-2-tts.html",
      pageRange: "Side 22–35",
      files: paddedRange(1, 14, 2)
    },
    {
      id: "kapitel-3",
      label: "Kapitel 3",
      title: "Familie",
      folder: "kapitel-3",
      html: "puls-3-kapitel-3-tts.html",
      pageRange: "Side 36–51",
      files: paddedRange(1, 15, 2)
    },
    {
      id: "kapitel-4",
      label: "Kapitel 4",
      title: "Bolig",
      folder: "kapitel-4",
      html: "puls-3-kapitel-4-tts.html",
      pageRange: "Side 52–66",
      files: paddedRange(1, 15, 2)
    },
    {
      id: "kapitel-5",
      label: "Kapitel 5",
      title: "Mad og måltider",
      folder: "kapitel-5",
      html: "puls-3-kapitel-5-tts.html",
      pageRange: "Side 67–85",
      files: paddedRange(1, 19, 2)
    },
    {
      id: "kapitel-6",
      label: "Kapitel 6",
      title: "Året rundt",
      folder: "kapitel-6",
      html: "puls-3-kapitel-6-tts.html",
      pageRange: "Side 86–98",
      files: paddedRange(1, 13, 2)
    },
    {
      id: "kapitel-7",
      label: "Kapitel 7",
      title: "Fritid og hobbyer",
      folder: "kapitel-7",
      html: "puls-3-kapitel-7-tts.html",
      pageRange: "Side 99–111",
      files: paddedRange(1, 13, 2)
    },
    {
      id: "grammatik",
      label: "Grammatik",
      title: "Grammatik",
      folder: "grammatik",
      html: "puls-3-grammatik-tts.html",
      pageRange: "Side 112–120",
      files: paddedRange(1, 9, 2)
    }
  ];

  var modal;
  var image;
  var title;
  var meta;
  var filmstrip;
  var previousButton;
  var nextButton;
  var zoomOutButton;
  var zoomInButton;
  var resetZoomButton;
  var activeSection;
  var activeIndex = 0;
  var zoom = 1;
  var lastFocusedElement;

  window.PulsScanSections = sections;

  function paddedRange(start, end, width) {
    var files = [];
    for (var i = start; i <= end; i += 1) {
      files.push(String(i).padStart(width, "0") + ".png");
    }
    return files;
  }

  function imagePath(section, index) {
    return "assets/" + section.folder + "/" + section.files[index];
  }

  function sectionById(id) {
    return sections.find(function (section) {
      return section.id === id;
    });
  }

  function createScanNav(section) {
    var nav = document.createElement("nav");
    nav.className = "scan-nav";
    nav.setAttribute("aria-label", "Bognavigation");
    nav.innerHTML = [
      '<div class="scan-nav__inner">',
      '  <strong>' + escapeHtml(section.label + " · " + section.title) + '</strong>',
      '  <div class="scan-nav__links">',
      '    <a class="scan-link" href="index.html">🏠 Oversigt</a>',
      '    <button class="scan-viewer-button" type="button" data-scan-open>📖 Se scans</button>',
      '  </div>',
      '</div>'
    ].join("");
    document.body.insertBefore(nav, document.body.firstChild);
  }

  function createModal() {
    if (modal) {
      return;
    }

    modal = document.createElement("section");
    modal.className = "scan-modal";
    modal.hidden = true;
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "scan-modal-title");
    modal.innerHTML = [
      '<header class="scan-modal__header">',
      '  <div>',
      '    <h2 class="scan-modal__title" id="scan-modal-title"></h2>',
      '    <div class="scan-modal__meta" aria-live="polite"></div>',
      '  </div>',
      '  <div class="scan-modal__controls">',
      '    <button class="scan-modal__button" type="button" data-scan-zoom-out aria-label="Zoom ud">−</button>',
      '    <button class="scan-modal__button" type="button" data-scan-zoom-reset>100%</button>',
      '    <button class="scan-modal__button" type="button" data-scan-zoom-in aria-label="Zoom ind">+</button>',
      '    <button class="scan-modal__close" type="button" data-scan-close aria-label="Luk scans">Luk ✕</button>',
      '  </div>',
      '</header>',
      '<div class="scan-modal__stage" tabindex="0">',
      '  <img class="scan-modal__image" alt="">',
      '</div>',
      '<footer class="scan-modal__footer">',
      '  <button class="scan-modal__button" type="button" data-scan-prev>← Forrige</button>',
      '  <div class="scan-modal__filmstrip" aria-label="Scan-miniaturer"></div>',
      '  <button class="scan-modal__button" type="button" data-scan-next>Næste →</button>',
      '</footer>'
    ].join("");

    document.body.appendChild(modal);
    image = modal.querySelector(".scan-modal__image");
    title = modal.querySelector(".scan-modal__title");
    meta = modal.querySelector(".scan-modal__meta");
    filmstrip = modal.querySelector(".scan-modal__filmstrip");
    previousButton = modal.querySelector("[data-scan-prev]");
    nextButton = modal.querySelector("[data-scan-next]");
    zoomOutButton = modal.querySelector("[data-scan-zoom-out]");
    zoomInButton = modal.querySelector("[data-scan-zoom-in]");
    resetZoomButton = modal.querySelector("[data-scan-zoom-reset]");

    modal.addEventListener("click", handleModalClick);
    document.addEventListener("keydown", handleKeydown);
  }

  function openViewer(section, index) {
    createModal();
    activeSection = section;
    activeIndex = index || 0;
    zoom = 1;
    lastFocusedElement = document.activeElement;
    renderModal();
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    modal.querySelector(".scan-modal__stage").focus();
  }

  function closeViewer() {
    if (!modal || modal.hidden) {
      return;
    }
    modal.hidden = true;
    document.body.style.overflow = "";
    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus();
    }
  }

  function renderModal() {
    var total = activeSection.files.length;
    var file = imagePath(activeSection, activeIndex);
    title.textContent = activeSection.label + " · " + activeSection.title;
    meta.textContent = "Scan " + (activeIndex + 1) + " af " + total + " · " + activeSection.pageRange;
    image.src = file;
    image.alt = activeSection.label + " " + activeSection.title + ", scan " + (activeIndex + 1) + " af " + total;
    image.style.transform = "scale(" + zoom + ")";
    previousButton.disabled = activeIndex === 0;
    nextButton.disabled = activeIndex === total - 1;
    zoomOutButton.disabled = zoom <= 0.5;
    zoomInButton.disabled = zoom >= 2.5;
    resetZoomButton.textContent = Math.round(zoom * 100) + "%";
    renderFilmstrip();
  }

  function renderFilmstrip() {
    filmstrip.innerHTML = "";
    activeSection.files.forEach(function (_file, index) {
      var button = document.createElement("button");
      button.className = "scan-modal__thumb";
      button.type = "button";
      button.dataset.scanIndex = String(index);
      button.setAttribute("aria-label", "Åbn scan " + (index + 1));
      if (index === activeIndex) {
        button.setAttribute("aria-current", "true");
      }
      button.innerHTML = '<img src="' + imagePath(activeSection, index) + '" alt="">';
      filmstrip.appendChild(button);
    });
  }

  function move(delta) {
    var next = activeIndex + delta;
    if (next < 0 || next >= activeSection.files.length) {
      return;
    }
    activeIndex = next;
    zoom = 1;
    renderModal();
  }

  function changeZoom(delta) {
    zoom = Math.max(0.5, Math.min(2.5, Math.round((zoom + delta) * 10) / 10));
    renderModal();
  }

  function handleModalClick(event) {
    var target = event.target.closest("button");
    if (!target) {
      return;
    }
    if (target.matches("[data-scan-close]")) {
      closeViewer();
    } else if (target.matches("[data-scan-prev]")) {
      move(-1);
    } else if (target.matches("[data-scan-next]")) {
      move(1);
    } else if (target.matches("[data-scan-zoom-out]")) {
      changeZoom(-0.1);
    } else if (target.matches("[data-scan-zoom-in]")) {
      changeZoom(0.1);
    } else if (target.matches("[data-scan-zoom-reset]")) {
      zoom = 1;
      renderModal();
    } else if (target.dataset.scanIndex) {
      activeIndex = Number(target.dataset.scanIndex);
      zoom = 1;
      renderModal();
    }
  }

  function handleKeydown(event) {
    if (!modal || modal.hidden) {
      return;
    }
    if (event.key === "Escape") {
      closeViewer();
    } else if (event.key === "ArrowLeft") {
      move(-1);
    } else if (event.key === "ArrowRight") {
      move(1);
    } else if (event.key === "+" || event.key === "=") {
      changeZoom(0.1);
    } else if (event.key === "-") {
      changeZoom(-0.1);
    }
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;"
      }[char];
    });
  }

  function initLanding() {
    var grid = document.querySelector("[data-scan-landing]");
    if (!grid) {
      return;
    }

    grid.innerHTML = sections.map(function (section) {
      return [
        '<article class="scan-card">',
        '  <div class="scan-card__preview">',
        '    <img src="' + imagePath(section, 0) + '" alt="Første scan for ' + escapeHtml(section.label) + '">',
        '    <span class="scan-card__badge">' + section.files.length + ' scans</span>',
        '  </div>',
        '  <div class="scan-card__body">',
        '    <h2>' + escapeHtml(section.label + " · " + section.title) + '</h2>',
        '    <p>' + escapeHtml(section.pageRange) + '</p>',
        '    <div class="scan-card__actions">',
        '      <a class="scan-link" href="' + section.html + '">Åbn kapitel</a>',
        '      <button class="scan-card__button" type="button" data-scan-open="' + section.id + '">Se scans</button>',
        '    </div>',
        '  </div>',
        '</article>'
      ].join("");
    }).join("");
  }

  function initChapter() {
    var sectionId = document.body && document.body.dataset.sectionId;
    var section = sectionById(sectionId);
    if (!section) {
      return;
    }
    createScanNav(section);
  }

  document.addEventListener("click", function (event) {
    var opener = event.target.closest("[data-scan-open]");
    if (!opener) {
      return;
    }
    var requested = opener.getAttribute("data-scan-open");
    var current = sectionById(requested) || sectionById(document.body.dataset.sectionId);
    if (!current) {
      return;
    }
    event.preventDefault();
    openViewer(current, 0);
  });

  document.addEventListener("DOMContentLoaded", function () {
    initLanding();
    initChapter();
  });
})();
