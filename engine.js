const $ = (selector) => document.querySelector(selector);

async function loadMoment() {
  const params = new URLSearchParams(window.location.search);
  const requested = params.get("moment");

  const registry = await fetch("/moments.json", { cache: "no-store" }).then(r => {
    if (!r.ok) throw new Error("Could not load moment registry.");
    return r.json();
  });

  const id = requested || registry.defaultMoment;
  const path = registry.moments[id];

  if (!path) {
    throw new Error(`Unknown moment: ${id}`);
  }

  const moment = await fetch(path, { cache: "no-store" }).then(r => {
    if (!r.ok) throw new Error("Could not load moment.");
    return r.json();
  });

  renderMoment(moment);
}

function renderMoment(moment) {
  document.title = moment.title || "Juice Moment";

  const gift = $("#gift");
  const image = $("#hero-image");
  const eyebrow = $("#eyebrow");
  const headline = $("#headline");
  const thanksTitle = $("#thanks-title");
  const thanksText = $("#thanks-text");
  const thanks = $("#thanks");

  image.src = moment.image;
  image.alt = moment.alt || "";
  eyebrow.textContent = moment.eyebrow || "";
  headline.textContent = moment.headline || "Tap anywhere.";
  thanksTitle.textContent = moment.revealHeadline || "Enjoy ❤️";
  thanksText.textContent = moment.revealText || "Opening now…";

  if (moment.theme?.background) {
    document.documentElement.style.setProperty("--bg", moment.theme.background);
  }

  gift.addEventListener("click", (event) => {
    event.preventDefault();

    if (navigator.vibrate && Array.isArray(moment.haptic)) {
      navigator.vibrate(moment.haptic);
    }

    thanks.classList.add("show");

    window.setTimeout(() => {
      window.location.href = moment.destination;
    }, Number(moment.delayMs || 800));
  });
}

loadMoment().catch((error) => {
  console.error(error);
  $("#headline").textContent = "This moment could not load.";
  $("#eyebrow").textContent = "";
});
