/* Menu dropdown + contact form */
(() => {
  // --- Menu ---
  const menu = document.querySelector(".menu");
  const trigger = document.querySelector(".menu-trigger");
  if (menu && trigger) {
    const close = () => menu.classList.remove("open");
    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      menu.classList.toggle("open");
    });
    document.addEventListener("click", (e) => {
      if (!menu.contains(e.target)) close();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });
  }

  // --- Contact form ---
  const form = document.getElementById("contact-form");
  const statusEl = document.getElementById("form-status");
  if (form && statusEl) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector("[type=submit]");
      const original = submitBtn ? submitBtn.textContent : "";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending…";
      }
      statusEl.textContent = "";
      statusEl.style.color = "";
      try {
        const data = new FormData(form);
        const res = await fetch(form.action, {
          method: "POST",
          body: data,
          headers: { Accept: "application/json" },
        });
        if (res.ok) {
          statusEl.textContent = "Message sent — I'll reply soon.";
          statusEl.style.color = "var(--accent-green)";
          form.reset();
        } else {
          throw new Error("Failed");
        }
      } catch (err) {
        statusEl.textContent = "Something went wrong. Email me directly?";
        statusEl.style.color = "#c84a3b";
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = original;
        }
      }
    });
  }
})();
