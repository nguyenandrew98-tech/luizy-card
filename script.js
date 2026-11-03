"use strict";

// ♥ CUSTOMIZE YOUR CARD HERE. You can change every message between the quotes.
const CARD = {
  recipient: "Luizy",
  from: "Andrew",
  letter: [
    "Love how your brain thinks, it is so creative! Talking to you is something I look forward to everyday.",
    "It's the little things too: our conversations, your laughs(especially when you're embarrassed), and my smile when I think of you.",
    "I don't know what difficulties will appear before us but I'm confident we can face it together. So there's something I've been wanting to ask you..."
  ],
  photoCaptions: ["One sweet memory", "The little moments", "More adventures ahead"],
  question: "Luizy, will you let me tease you for the rest of your life?",
  yesTitle: "You just made me so happy!",
  yesMessage: "I can't stop smiling. Here's to more laughs, little adventures, and beautiful moments together. ♡",
  noTitle: "Thank you for being honest ♡",
  noMessage: "That's completely okay. No pressure at all — I'm glad I got to tell you how I feel."
};

// Small helper for finding elements by ID.
const byId = (id) => document.getElementById(id);
const welcome = byId("welcomeScene");
const letter = byId("letterScene");
const question = byId("questionCard");
const response = byId("responseCard");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Put personalized text into the webpage safely.
document.querySelectorAll("[data-recipient]").forEach(el => el.textContent = CARD.recipient);
document.querySelectorAll("[data-sender]").forEach(el => el.textContent = CARD.from);
CARD.letter.forEach((line, index) => { byId(`letterLine${index + 1}`).textContent = line; });
CARD.photoCaptions.forEach((caption, index) => { byId(`photoCaption${index + 1}`).textContent = caption; });
byId("questionTitle").textContent = CARD.question;
document.title = `A Little Something for ${CARD.recipient} ♡`;

// Only show real photos if those image files exist.
document.querySelectorAll(".photo-frame img").forEach(img => {
  img.addEventListener("load", () => img.parentElement.classList.add("has-photo"));
  img.addEventListener("error", () => img.parentElement.classList.remove("has-photo"));
  if (img.complete && img.naturalWidth > 0) img.parentElement.classList.add("has-photo");
});

// Add decorative hearts that drift across the background.
if (!reducedMotion) {
  const container = byId("floatingHearts");
  for (let i = 0; i < 18; i++) {
    const heart = document.createElement("span");
    heart.className = "float-heart";
    heart.textContent = i % 3 === 0 ? "✿" : "♥";
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.setProperty("--size", `${12 + Math.random() * 15}px`);
    heart.style.setProperty("--duration", `${13 + Math.random() * 16}s`);
    heart.style.setProperty("--delay", `${-Math.random() * 28}s`);
    container.appendChild(heart);
  }
}

// Open the envelope and reveal the letter.
byId("openButton").addEventListener("click", () => {
  if (welcome.classList.contains("is-opening")) return;
  welcome.classList.add("is-opening");
  window.setTimeout(() => {
    welcome.hidden = true;
    letter.hidden = false;
    letter.classList.add("is-visible");
    byId("letterTitle").setAttribute("tabindex", "-1");
    byId("letterTitle").focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  }, reducedMotion ? 50 : 850);
});

function showResponse(isYes) {
  question.hidden = true;
  response.hidden = false;
  byId("responseIcon").textContent = isYes ? "💖" : "💌";
  byId("responseTitle").textContent = isYes ? CARD.yesTitle : CARD.noTitle;
  byId("responseText").textContent = isYes ? CARD.yesMessage : CARD.noMessage;
  byId("responseTitle").focus({ preventScroll: true });
  response.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "center" });
  if (isYes && !reducedMotion) burstHearts();
}

// A playful No button: dodges nearby mouse cursors and jumps when tapped.
// After five moves it vanishes; keyboard users can still choose No.
const noButton = byId("noButton");
const yesButton = byId("yesButton");
const answerArea = document.querySelector(".answer-buttons");
let dodges = 0;
let lastDodge = 0;
let offsetX = 0;
let offsetY = 0;
let vanishTimer = null;
let lastTouchAt = -Infinity;

function resetDodging() {
  if (vanishTimer !== null) window.clearTimeout(vanishTimer);
  vanishTimer = null;
  dodges = 0;
  lastDodge = 0;
  offsetX = 0;
  offsetY = 0;
  lastTouchAt = -Infinity;
  noButton.hidden = false;
  noButton.classList.remove("is-vanishing");
  noButton.style.transform = "";
  answerArea.classList.remove("no-gone");
}

function dodgeNoButton(event, isTouch = false) {
  if (dodges >= 5 || (!isTouch && (event.pointerType !== "mouse" || reducedMotion))) return;
  if (!isTouch && performance.now() - lastDodge < 320) return;

  const buttonRect = noButton.getBoundingClientRect();
  const closeToButton = event.clientX > buttonRect.left - 75 &&
    event.clientX < buttonRect.right + 75 &&
    event.clientY > buttonRect.top - 75 &&
    event.clientY < buttonRect.bottom + 75;
  if (!isTouch && !closeToButton) return;

  const areaRect = answerArea.getBoundingClientRect();
  const yesRect = yesButton.getBoundingClientRect();
  const startX = buttonRect.left - areaRect.left - offsetX;
  const startY = buttonRect.top - areaRect.top - offsetY;
  const maxX = Math.max(0, answerArea.clientWidth - buttonRect.width);
  const maxY = Math.max(0, answerArea.clientHeight - buttonRect.height);

  let best = { x: startX, y: startY, score: -Infinity };
  for (let i = 0; i < 35; i++) {
