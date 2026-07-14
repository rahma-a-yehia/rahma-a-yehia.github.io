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

// Interactive stellar face — a lightweight 3D point sculpture rendered without external libraries.
const faceCanvas = $("#stellar-face");
if (faceCanvas) {
  const ctx = faceCanvas.getContext("2d");
  const points = [], mesh = [], triangles = [];
  let width = 0, height = 0, dpr = 1, targetYaw = -.12, targetPitch = .02, yaw = -.12, pitch = .02;
  const add = (x, y, z, size = 1, glow = 0) => points.push({ x, y, z, size, glow, phase: Math.random() * Math.PI * 2 });

  const headPoint = (u, v) => {
    const sy = Math.cos(v), ring = Math.sin(v), jaw = .76 + .24 * Math.max(0, (sy + .12) / 1.12);
    let x = Math.cos(u) * ring * 1.03 * jaw;
    let y = sy * 1.42;
    let z = Math.sin(u) * ring * (.9 + .1 * Math.max(0, sy));
    if (z > 0) z += .11 * Math.exp(-x*x*5) * Math.exp(-(y+.02)*(y+.02)*2.5);
    return {x,y,z};
  };
  // A real triangulated shell gives the head weight, reflections and mechanical volume.
  const rows=34, cols=48;
  for(let r=0;r<=rows;r++) for(let c=0;c<cols;c++) mesh.push(headPoint(c/cols*Math.PI*2,(r+.18)/(rows+.36)*Math.PI));
  for(let r=0;r<rows;r++) for(let c=0;c<cols;c++) {
    const n=c===cols-1?0:c+1, a=r*cols+c, b=r*cols+n, d=(r+1)*cols+c, e=(r+1)*cols+n;
    triangles.push([a,d,b],[b,d,e]);
  }
  // Sparse luminous sensor nodes sit on top of the metal, rather than replacing it.
  for (let i = 0; i < 290; i++) {
    const v = Math.acos(1 - 2 * Math.random());
    const u = Math.random() * Math.PI * 2;
    const sy = Math.cos(v), ring = Math.sin(v);
    const jaw = .76 + .24 * Math.max(0, (sy + .12) / 1.12);
    let x = Math.cos(u) * ring * 1.03 * jaw;
    let y = sy * 1.42;
    let z = Math.sin(u) * ring * (.9 + .1 * Math.max(0, sy));
    if (z > 0) z += .11 * Math.exp(-x*x*5) * Math.exp(-(y+.02)*(y+.02)*2.5);
    add(x, y, z+.018, .42 + Math.random() * .62, Math.random() > .975 ? 1 : 0);
  }

  // Elegant neck emerging from the jaw.
  for (let i = 0; i < 260; i++) {
    const a = Math.random() * Math.PI * 2, t = Math.random();
    const r = .48 + t * .1;
    add(Math.cos(a) * r, -1.25 - t * .92, Math.sin(a) * r * .76, .7 + Math.random(), Math.random() > .96 ? 1 : 0);
  }

  const curve = (count, fn, size = .72) => {
    for (let i = 0; i < count; i++) { const p = fn(i / (count - 1)); add(p[0], p[1], p[2], size, 0); }
  };
  // Brows and almond-shaped eyes sit just above the shell so the expression survives rotation.
  [-1, 1].forEach(side => {
    curve(48, t => { const x = side * (.18 + t * .52); return [x, .38 + .12 * Math.sin(t*Math.PI), .9 + .08*Math.sin(t*Math.PI)]; });
    curve(66, t => { const a=t*Math.PI*2; return [side*.43 + Math.cos(a)*.25, .17 + Math.sin(a)*.105, 1.025 + .035*Math.cos(a)]; }, .8);
    add(side*.43, .17, 1.075, 3.8, 1);
  });
  // Nose bridge, nostrils, lips and jaw seam.
  curve(55, t => [.035*Math.sin(t*Math.PI*2), .32-t*.72, 1.04 + t*.18], .62);
  curve(28, t => [(t-.5)*.38, -.43 + .045*Math.cos((t-.5)*Math.PI*2), 1.105-Math.abs(t-.5)*.12], .58);
  curve(74, t => { const a=t*Math.PI*2; return [Math.cos(a)*.34, -.69 + Math.sin(a)*.075, 1.02 + .025*Math.cos(a)]; }, .68);
  curve(90, t => { const a=Math.PI*.14+t*Math.PI*.72; return [Math.cos(a)*.84, -.41-Math.sin(a)*.92, .56+.17*Math.sin(a)]; }, .54);

  const resizeFace = () => {
    const rect = faceCanvas.getBoundingClientRect(); dpr = Math.min(devicePixelRatio || 1, 2); width = rect.width; height = rect.height;
    faceCanvas.width = Math.round(width*dpr); faceCanvas.height = Math.round(height*dpr); ctx.setTransform(dpr,0,0,dpr,0,0);
  };
  const aim = (clientX, clientY) => {
    const r=faceCanvas.getBoundingClientRect(); targetYaw=((clientX-r.left)/r.width-.5)*1.15; targetPitch=((clientY-r.top)/r.height-.5)*-.42;
  };
  faceCanvas.addEventListener("pointermove", e => aim(e.clientX,e.clientY));
  faceCanvas.addEventListener("pointerleave", () => { targetYaw=-.12; targetPitch=.02; });
  window.addEventListener("resize", resizeFace, { passive:true }); resizeFace();

  const renderFace = time => {
    yaw += (targetYaw-yaw)*.055; pitch += (targetPitch-pitch)*.055;
    ctx.clearRect(0,0,width,height); const cy=Math.cos(yaw), sy=Math.sin(yaw), cp=Math.cos(pitch), sp=Math.sin(pitch);
    const scale=Math.min(width*.235,height*.205), projected=[], projectedMesh=[];
    const project = p => { const x=p.x*cy+p.z*sy, z=-p.x*sy+p.z*cy, y=p.y*cp-z*sp, rz=p.y*sp+z*cp, perspective=3.7/(3.7-rz*.18); return {x:width*.51+x*scale*perspective,y:height*.47-y*scale*perspective,z:rz}; };
    mesh.forEach(p=>projectedMesh.push(project(p)));
    const painted=triangles.map(t=>{const a=projectedMesh[t[0]],b=projectedMesh[t[1]],c=projectedMesh[t[2]];return {a,b,c,z:(a.z+b.z+c.z)/3};}).sort((a,b)=>a.z-b.z);
    painted.forEach((f,i)=>{
      const ax=f.b.x-f.a.x, ay=f.b.y-f.a.y, bx=f.c.x-f.a.x, by=f.c.y-f.a.y, facing=Math.max(0,Math.min(1,Math.abs(ax*by-ay*bx)/90));
      const light=Math.max(0,Math.min(1,.38+f.z*.25+(f.a.x/width-.5)*-.18));
      ctx.beginPath();ctx.moveTo(f.a.x,f.a.y);ctx.lineTo(f.b.x,f.b.y);ctx.lineTo(f.c.x,f.c.y);ctx.closePath();
      ctx.fillStyle=`rgba(${Math.round(29+light*52)},${Math.round(25+light*35)},${Math.round(34+light*51)},${.93})`;ctx.fill();
      if(i%3===0){ctx.strokeStyle=`rgba(242,166,196,${.025+facing*.055})`;ctx.lineWidth=.35;ctx.stroke();}
    });
    points.forEach(p => {
      const x=p.x*cy+p.z*sy, z=-p.x*sy+p.z*cy, y=p.y*cp-z*sp, rz=p.y*sp+z*cp;
      const perspective=3.7/(3.7-rz*.18);
      projected.push({ x:width*.51+x*scale*perspective, y:height*.47-y*scale*perspective, z:rz, r:p.size*perspective, glow:p.glow, phase:p.phase });
    });
    projected.sort((a,b)=>a.z-b.z);
    projected.forEach(p => {
      const depth=Math.max(.13,Math.min(1,(p.z+1.25)/2.5)); const twinkle=.78+.22*Math.sin(time*.0016+p.phase);
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r*(p.glow?1.25:1),0,Math.PI*2);
      ctx.fillStyle=p.glow?`rgba(255,218,235,${.72+.25*depth*twinkle})`:`rgba(250,185,213,${.1+.46*depth})`;
      if(p.glow){ctx.shadowColor="#ffafd2";ctx.shadowBlur=8;} else ctx.shadowBlur=0; ctx.fill();
    });
    ctx.shadowBlur=0; requestAnimationFrame(renderFace);
  };
  requestAnimationFrame(renderFace);
}
