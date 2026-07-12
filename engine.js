const $ = (selector) => document.querySelector(selector);

const appBase = new URL("./", document.baseURI);
const resolveAppUrl = (path) => new URL(String(path).replace(/^\/+/, ""), appBase).href;

async function loadJson(path, errorMessage) {
  const response = await fetch(resolveAppUrl(path), { cache: "no-store" });
  if (!response.ok) throw new Error(errorMessage);
  return response.json();
}

async function loadMoment() {
  const params = new URLSearchParams(window.location.search);
  const requested = params.get("moment");

  const registry = await loadJson("moments.json", "Could not load moment registry.");
  const id = requested || registry.defaultMoment;
  const path = registry.moments[id];

  if (!path) throw new Error(`Unknown moment: ${id}`);

  const moment = await loadJson(path, "Could not load moment.");
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

  image.src = resolveAppUrl(moment.image);
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
