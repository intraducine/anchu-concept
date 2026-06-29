const productData = {
  large: {
    title: "Large Chicken Pickle",
    price: "$25.00",
    kicker: "Signature drop",
    image: "assets/chicken-pickle-large.png",
    description: "400g of our signature Chicken Pickle in a glass jar. Built for meals that need a proper spark."
  },
  small: {
    title: "Small Chicken Pickle",
    price: "$14.00",
    kicker: "Starter drop",
    image: "assets/chicken-pickle-small.png",
    description: "A smaller jar of our signature Chicken Pickle for first tastes, weeknight rice, and careful sharing."
  }
};

const stageData = {
  prep: {
    title: "Prep masala",
    copy: "Aromatics, chile, and spice ratios are tuned before the oil takes over. This is where the flavor signature gets set."
  },
  rest: {
    title: "Oil rest",
    copy: "The batch sits until the heat rounds out and the masala starts behaving like one confident voice."
  },
  pack: {
    title: "Jar & label",
    copy: "Glass jars are filled, checked, and queued for pickup. The system only lights up when the batch is ready."
  },
  pickup: {
    title: "Pickup",
    copy: "The last step stays human: Cincinnati pickup, a quick hello, and the next meal already forming in your head."
  }
};

const commands = [
  { label: "Explore menu", hint: "Jump to jars", action: () => jumpTo("#menu") },
  { label: "Tune flavor", hint: "Open flavor signal", action: () => jumpTo("#signal") },
  { label: "Reserve next batch", hint: "Open pickup flow", action: () => jumpTo("#reserve") },
  { label: "Add large jar", hint: "Join waitlist", action: () => addToCart("large") },
  { label: "Add small jar", hint: "Join waitlist", action: () => addToCart("small") },
  { label: "Open cart", hint: "View queue", action: () => openLayer(cartDrawer) }
];

const body = document.body;
const cart = [];
let selectedDetailProduct = "large";

const cartDrawer = document.querySelector("[data-cart-drawer]");
const detailModal = document.querySelector("[data-detail-modal]");
const commandModal = document.querySelector("[data-command-modal]");
const mobileMenu = document.querySelector("[data-mobile-menu]");
const commandInput = document.querySelector("[data-command-input]");
const commandResults = document.querySelector("[data-command-results]");

function icon(name) {
  return `<svg class="icon" aria-hidden="true"><use href="#${name}"></use></svg>`;
}

function openLayer(layer) {
  layer.classList.add("is-open");
  layer.setAttribute("aria-hidden", "false");
  body.classList.add("is-locked");
}

function closeLayer(layer) {
  layer.classList.remove("is-open");
  layer.setAttribute("aria-hidden", "true");
  const anyOpen = [cartDrawer, detailModal, commandModal, mobileMenu].some((item) => item.classList.contains("is-open"));
  body.classList.toggle("is-locked", anyOpen);
}

function closeAll() {
  [cartDrawer, detailModal, commandModal, mobileMenu].forEach(closeLayer);
}

function jumpTo(selector) {
  closeAll();
  document.querySelector(selector)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function updateScrollMeter() {
  const max = document.documentElement.scrollHeight - innerHeight;
  const value = max > 0 ? scrollY / max : 0;
  document.documentElement.style.setProperty("--scroll", value.toFixed(4));
}

function renderCart() {
  const container = document.querySelector("[data-cart-items]");
  const count = document.querySelector("[data-cart-count]");
  count.textContent = String(cart.length);

  if (cart.length === 0) {
    container.innerHTML = `<p class="drawer-note">Your waitlist queue is empty. Add a jar to model the next-batch flow.</p>`;
    return;
  }

  container.innerHTML = cart
    .map((key, index) => {
      const item = productData[key];
      return `
        <article class="cart-item">
          <img src="${item.image}" alt="" />
          <div>
            <strong>${item.title}</strong>
            <span>${item.price} · next-batch waitlist</span>
          </div>
          <button class="icon-button" type="button" data-remove="${index}" aria-label="Remove ${item.title}">
            ${icon("x")}
          </button>
        </article>
      `;
    })
    .join("");
}

function addToCart(key) {
  cart.push(key);
  renderCart();
  if (detailModal.classList.contains("is-open")) {
    closeLayer(detailModal);
  }
  openLayer(cartDrawer);
}

function openDetails(key) {
  const item = productData[key];
  selectedDetailProduct = key;
  document.querySelector("[data-detail-image]").src = item.image;
  document.querySelector("[data-detail-image]").alt = item.title;
  document.querySelector("[data-detail-kicker]").textContent = item.kicker;
  document.querySelector("[data-detail-title]").textContent = item.title;
  document.querySelector("[data-detail-copy]").textContent = item.description;
  document.querySelector("[data-detail-price]").textContent = item.price;
  openLayer(detailModal);
}

function filterProducts(kind) {
  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.filter === kind);
  });
  document.querySelectorAll("[data-product-card]").forEach((card) => {
    const visible = kind === "all" || card.dataset.kind.includes(kind);
    card.classList.toggle("is-hidden", !visible);
  });
}

function updateFlavorSignal() {
  const values = {};
  document.querySelectorAll("[data-flavor]").forEach((input) => {
    values[input.dataset.flavor] = Number(input.value);
    document.querySelector(`[data-bar="${input.dataset.flavor}"]`)?.style.setProperty("--value", `${input.value}%`);
  });

  const heat = values.heat;
  const garlic = values.garlic;
  const tang = values.tang;
  const crunch = values.crunch;
  const title = document.querySelector("[data-flavor-title]");
  const copy = document.querySelector("[data-flavor-copy]");
  document.querySelector("[data-heat-readout]").textContent = `${heat}%`;

  if (heat > 72 && garlic > 70) {
    title.textContent = "Hot, garlicky, rice-ready.";
    copy.textContent = "Best route: large jar, weekday rice bowls, and a warning to anyone who thinks a tiny spoon is enough.";
  } else if (tang > heat && crunch > 55) {
    title.textContent = "Bright, snackable, high-lift.";
    copy.textContent = "Best route: small jar, idli, dosa, and anything that wants a sharper edge.";
  } else if (heat < 35) {
    title.textContent = "Mellow mode, still unmistakably Anchu.";
    copy.textContent = "Best route: start small, pair with yogurt rice, then climb the heat curve later.";
  } else {
    title.textContent = "Balanced, flexible, table-safe.";
    copy.textContent = "Best route: either jar size, shared meals, and a second spoon nearby.";
  }
}

function setStage(stage) {
  const data = stageData[stage];
  document.querySelectorAll("[data-stage]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.stage === stage);
  });
  document.querySelector("[data-stage-title]").textContent = data.title;
  document.querySelector("[data-stage-copy]").textContent = data.copy;
}

function setupPlateNotes() {
  const readout = document.querySelector("[data-note-readout]");
  const buttons = document.querySelectorAll("[data-note]");
  if (!readout || buttons.length === 0) return;

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      buttons.forEach((item) => item.classList.toggle("is-active", item === button));
      readout.textContent = button.dataset.note;
    });
  });
}

function setupTiltCards() {
  const prefersReducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) return;

  document.querySelectorAll("[data-tilt-card]").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const bounds = card.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
      const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
      card.style.setProperty("--tilt-x", x.toFixed(3));
      card.style.setProperty("--tilt-y", y.toFixed(3));
    });

    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--tilt-x", "0");
      card.style.setProperty("--tilt-y", "0");
    });
  });
}

function renderCommands(query = "") {
  const normalized = query.trim().toLowerCase();
  const filtered = commands.filter((command) => command.label.toLowerCase().includes(normalized) || command.hint.toLowerCase().includes(normalized));
  commandResults.innerHTML = filtered
    .map(
      (command, index) => `
        <button class="command-result ${index === 0 ? "is-focused" : ""}" type="button" data-command-index="${commands.indexOf(command)}">
          <span>${command.label}</span>
          <small>${command.hint}</small>
        </button>
      `
    )
    .join("");
}

function openCommandPalette() {
  renderCommands("");
  openLayer(commandModal);
  requestAnimationFrame(() => commandInput.focus());
}

function updateClock() {
  const now = new Date();
  document.querySelector("[data-live-clock]").textContent = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function setupCanvas() {
  const canvas = document.querySelector("[data-spice-canvas]");
  const prefersReducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!canvas || prefersReducedMotion) return;

  const context = canvas.getContext("2d");
  const particles = Array.from({ length: 64 }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: 1 + Math.random() * 2.8,
    speed: 0.0015 + Math.random() * 0.003,
    hue: Math.random() > 0.55 ? "#f2b431" : "#b72e26"
  }));

  function resize() {
    canvas.width = innerWidth * devicePixelRatio;
    canvas.height = Math.max(innerHeight, 760) * devicePixelRatio;
    canvas.style.height = `${Math.max(innerHeight, 760)}px`;
    context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  }

  function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    const width = innerWidth;
    const height = Math.max(innerHeight, 760);
    particles.forEach((particle) => {
      particle.y += particle.speed;
      if (particle.y > 1.05) particle.y = -0.05;
      context.beginPath();
      context.fillStyle = particle.hue;
      context.globalAlpha = 0.18;
      context.arc(particle.x * width, particle.y * height, particle.r, 0, Math.PI * 2);
      context.fill();
    });
    context.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  addEventListener("resize", resize);
  resize();
  draw();
}

document.querySelectorAll("[data-menu-open]").forEach((button) => button.addEventListener("click", () => openLayer(mobileMenu)));
document.querySelectorAll("[data-menu-close], .mobile-menu a").forEach((control) => control.addEventListener("click", () => closeLayer(mobileMenu)));
document.querySelectorAll("[data-cart-open]").forEach((button) => button.addEventListener("click", () => openLayer(cartDrawer)));
document.querySelectorAll("[data-cart-close]").forEach((button) => button.addEventListener("click", () => closeLayer(cartDrawer)));
document.querySelectorAll("[data-detail-close]").forEach((button) => button.addEventListener("click", () => closeLayer(detailModal)));
document.querySelectorAll("[data-command-open]").forEach((button) => button.addEventListener("click", openCommandPalette));
document.querySelectorAll("[data-command-close]").forEach((button) => button.addEventListener("click", () => closeLayer(commandModal)));

document.querySelectorAll("[data-add]").forEach((button) => {
  button.addEventListener("click", () => addToCart(button.dataset.add));
});

document.querySelectorAll("[data-detail]").forEach((button) => {
  button.addEventListener("click", () => openDetails(button.dataset.detail));
});

document.querySelector("[data-detail-add]").addEventListener("click", () => addToCart(selectedDetailProduct));

document.querySelector("[data-cart-items]").addEventListener("click", (event) => {
  const removeButton = event.target.closest("[data-remove]");
  if (!removeButton) return;
  cart.splice(Number(removeButton.dataset.remove), 1);
  renderCart();
});

document.querySelector("[data-cart-checkout]").addEventListener("click", () => {
  const note = document.querySelector("[data-cart-note]");
  note.textContent = cart.length
    ? "Request captured locally. Prototype status: batch update queued."
    : "Add a jar first, then request a batch update.";
});

document.querySelectorAll("[data-filter]").forEach((button) => {
  button.addEventListener("click", () => filterProducts(button.dataset.filter));
});

document.querySelectorAll("[data-flavor]").forEach((input) => {
  input.addEventListener("input", updateFlavorSignal);
});

document.querySelectorAll("[data-stage]").forEach((button) => {
  button.addEventListener("click", () => setStage(button.dataset.stage));
});

document.querySelectorAll("[data-slot]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-slot]").forEach((slot) => slot.classList.toggle("is-selected", slot === button));
    document.querySelector("[data-slot-input]").value = button.dataset.slot;
  });
});

document.querySelector("[data-reserve-form]").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const name = form.elements.name.value.trim();
  const slot = form.elements.slot.value;
  document.querySelector("[data-form-status]").textContent = `${name || "Guest"}, your ${slot} batch signal is saved in this prototype.`;
});

commandInput.addEventListener("input", () => renderCommands(commandInput.value));
commandResults.addEventListener("click", (event) => {
  const result = event.target.closest("[data-command-index]");
  if (!result) return;
  commands[Number(result.dataset.commandIndex)].action();
});

document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    openCommandPalette();
  }
  if (event.key === "Escape") closeAll();
  if (event.key === "Enter" && commandModal.classList.contains("is-open") && document.activeElement === commandInput) {
    const first = commandResults.querySelector("[data-command-index]");
    if (first) commands[Number(first.dataset.commandIndex)].action();
  }
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", () => closeLayer(mobileMenu));
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("is-visible");
    });
  },
  { threshold: 0.14 }
);
document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

addEventListener("scroll", updateScrollMeter, { passive: true });
addEventListener("resize", updateScrollMeter);

renderCart();
updateFlavorSignal();
updateClock();
setupPlateNotes();
setupTiltCards();
setupCanvas();
updateScrollMeter();
setInterval(updateClock, 15000);

// Duplicate ticker content so the marquee can loop without a visible reset.
const ticker = document.querySelector(".ticker-track");
ticker.innerHTML += ticker.innerHTML;
