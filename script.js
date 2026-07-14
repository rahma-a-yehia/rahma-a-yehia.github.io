const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

const intro = $("#intro");
const hideIntro = () => {
  intro?.classList.add("is-hidden");
  sessionStorage.setItem("elStudioIntroSeen", "true");
};

if (sessionStorage.getItem("elStudioIntroSeen")) {
  intro?.classList.add("is-hidden");
} else {
  window.setTimeout(hideIntro, 2600);
}
$("#intro-skip")?.addEventListener("click", hideIntro);

const header = $("#site-header");
const menu = $("#site-nav");
const menuToggle = $("#menu-toggle");

const updateHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 24);
updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

const closeMenu = () => {
  menu?.classList.remove("is-open");
  menuToggle?.classList.remove("is-open");
  menuToggle?.setAttribute("aria-expanded", "false");
  menuToggle?.setAttribute("aria-label", "Open navigation");
};

menuToggle?.addEventListener("click", () => {
  const open = !menu?.classList.contains("is-open");
  menu?.classList.toggle("is-open", open);
  menuToggle.classList.toggle("is-open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
});
$$('#site-nav a').forEach((link) => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    }),
    { threshold: 0.12 }
  );
  $$(".reveal").forEach((element) => observer.observe(element));
} else {
  $$(".reveal").forEach((element) => element.classList.add("is-visible"));
}

$$('.faq-item button').forEach((button) => {
  button.addEventListener("click", () => {
    const item = button.closest(".faq-item");
    const willOpen = !item.classList.contains("is-open");
    $$(".faq-item.is-open").forEach((openItem) => {
      openItem.classList.remove("is-open");
      $("button", openItem).setAttribute("aria-expanded", "false");
    });
    item.classList.toggle("is-open", willOpen);
    button.setAttribute("aria-expanded", String(willOpen));
  });
});

const form = $("#project-form");
const steps = $$(".form-step", form);
const progressItems = $$('[data-progress]', form);
let currentStep = 1;

const showStep = (step) => {
  currentStep = step;
  steps.forEach((element) => element.classList.toggle("is-active", Number(element.dataset.step) === step));
  progressItems.forEach((element) => {
    const number = Number(element.dataset.progress);
    element.classList.toggle("is-active", number === step);
    element.classList.toggle("is-complete", number < step);
  });
  form?.scrollIntoView({ behavior: "smooth", block: "center" });
};

const value = (name) => form?.elements[name]?.value?.trim?.() ?? form?.elements[name]?.value ?? "";
const selectedService = () => form?.querySelector('input[name="service"]:checked')?.value || "";

const validateStep = (step) => {
  if (step === 1) {
    const error = $("#service-error");
    if (!selectedService()) {
      error.textContent = "Choose the service that fits your idea best.";
      return false;
    }
    error.textContent = "";
  }
  if (step === 2) {
    const error = $("#details-error");
    if (!value("details") || !value("deadline")) {
      error.textContent = "Please add the project details and your desired deadline.";
      return false;
    }
    error.textContent = "";
  }
  if (step === 3) {
    const error = $("#contact-error");
    const emailField = form.elements.email;
    if (!value("name") || !value("email") || !emailField.checkValidity()) {
      error.textContent = "Please add your name and a valid email address.";
      return false;
    }
    error.textContent = "";
  }
  return true;
};

$$('.next-step', form).forEach((button) => button.addEventListener("click", () => {
  if (validateStep(currentStep)) showStep(Math.min(currentStep + 1, 3));
}));
$$('.back-step', form).forEach((button) => button.addEventListener("click", () => showStep(Math.max(currentStep - 1, 1))));

const requestText = () => [
  "Hello El Studio,",
  "",
  "I would like to start a new project.",
  "",
  `Service: ${selectedService()}`,
  `Project details: ${value("details")}`,
  `Desired deadline: ${value("deadline")}`,
  `Budget range: ${value("budget") || "Not specified"}`,
  "",
  `Name: ${value("name")}`,
  `Email: ${value("email")}`,
  `WhatsApp: ${value("phone") || "Not provided"}`,
  "",
  "Thank you."
].join("\n");

const updateWhatsApp = () => {
  const link = $("#whatsapp-submit");
  if (link) link.href = `https://wa.me/201149037653?text=${encodeURIComponent(requestText())}`;
};
form?.addEventListener("input", updateWhatsApp);

const showToast = (message) => {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.setTimeout(() => toast.classList.remove("is-visible"), 4200);
};

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!validateStep(3)) return;
  const subject = `New El Studio project — ${selectedService()}`;
  const mailto = `mailto:el.studio.for.design@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(requestText())}`;
  showToast("Your email app is opening. Review the request, then press Send.");
  window.location.href = mailto;
});

$$('.service-request').forEach((button) => {
  button.addEventListener("click", () => {
    const radio = form?.querySelector(`input[name="service"][value="${CSS.escape(button.dataset.service)}"]`);
    if (radio) radio.checked = true;
    showStep(1);
    window.setTimeout(() => form?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  });
});

const deadline = form?.elements.deadline;
if (deadline) deadline.min = new Date().toISOString().split("T")[0];
$("#year").textContent = new Date().getFullYear();
updateWhatsApp();
