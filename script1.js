    const CONFIG = {
    taxRate: 0.15,
    tiers: {
      basic: { perUnit: 10 },
      pro: { perUnit: 18 },
      enterprise: { perUnit: 30 }
    },
    discounts: [
      { minQty: 100, pct: 0.10 },
      { minQty: 50, pct: 0.05 }
    ],
    addons: {
      priority: { type: "flat", amount: 100, label: "Priority Support" },
      storage: { type: "per_unit", amount: 2, label: "Extra Storage" },
      rush: { type: "percent", amount: 0.05, label: "Rush Handling" }
    }
  };

  const qtyEl = document.getElementById("qty");
  const tierEl = document.getElementById("tier");
  const addonEls = document.querySelectorAll("input[type=checkbox][value]");
  const taxEl = document.getElementById("tax");
  const totalEl = document.getElementById("total");
  const breakdownEl = document.getElementById("breakdown");

  function getDiscountPct(qty) {
    let pct = 0;
    CONFIG.discounts.forEach(d => { if (qty >= d.minQty) pct = Math.max(pct, d.pct); });
    return pct;
  }

  function calc() {
    const qty = Math.max(1, parseInt(qtyEl.value || "1"));
    const tier = tierEl.value;
    const perUnit = CONFIG.tiers[tier].perUnit;

    let base = perUnit * qty;
    let discount = base * getDiscountPct(qty);
    let addons = 0;
    let addonLines = [];

    addonEls.forEach(el => {
      if (el.checked) {
        const a = CONFIG.addons[el.value];
        if (a.type === "flat") { addons += a.amount; addonLines.push([a.label, a.amount]); }
        if (a.type === "per_unit") { const val = a.amount * qty; addons += val; addonLines.push([`${a.label} × ${qty}`, val]); }
        if (a.type === "percent") { const val = (base - discount) * a.amount; addons += val; addonLines.push([`${a.label} (${a.amount*100}%)`, val]); }
      }
    });

    let subtotal = base - discount + addons;
    let tax = taxEl.checked ? subtotal * CONFIG.taxRate : 0;
    let total = subtotal + tax;

  animateTotal(total);
  breakdownEl.innerHTML = "";

    const lines = [
      ["Base", base],
      discount ? ["Discount", -discount] : null,
      ...addonLines,
      tax ? ["Tax", tax] : ["Tax", 0]
    ].filter(Boolean);

    lines.forEach(([label, value], i) => {
      const li = document.createElement("li");
      li.innerHTML = `<span>${label}</span><span>$${value.toFixed(2)}</span>`;
      breakdownEl.appendChild(li);
      // staggered reveal
      setTimeout(() => li.classList.add('show'), 60 * i);
    });
  }

  // Smooth count-up animation for total
  let totalAnimId = null;
  function animateTotal(target) {
    const amountEl = document.querySelector('.total .amount');
    if (!amountEl) return;
    const start = parseFloat((amountEl.textContent || "$0").replace(/[^0-9.-]+/g, '')) || 0;
    const duration = 650;
    const startTime = performance.now();
    if (totalAnimId) cancelAnimationFrame(totalAnimId);

    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

    function frame(now) {
      const t = Math.min(1, (now - startTime) / duration);
      const v = start + (target - start) * easeOutCubic(t);
      amountEl.textContent = `$${v.toFixed(2)}`;
      if (t < 1) {
        totalAnimId = requestAnimationFrame(frame);
      } else {
        amountEl.textContent = `$${target.toFixed(2)}`;
        const totalWrap = document.querySelector('.total');
        if (totalWrap) {
          totalWrap.classList.remove('pulse');
          // trigger pulse
          void totalWrap.offsetWidth;
          totalWrap.classList.add('pulse');
        }
      }
    }

    requestAnimationFrame(frame);
  }

  [qtyEl, tierEl, taxEl, ...addonEls].forEach(el => {
    el.addEventListener("input", calc);
    el.addEventListener("change", calc);
  });

  calc(); // Initial run
