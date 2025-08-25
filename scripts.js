
    // Pricing configuration
    const pricing = {
      basic: 5,
      pro: 10,
      enterprise: 20
    };

    const addons = {
      priority: { type: 'flat', value: 100, name: 'Priority Support' },
      storage: { type: 'perUnit', value: 2, name: 'Extra Storage' },
      rush: { type: 'percentage', value: 5, name: 'Rush Handling' }
    };

    // Get DOM elements
    const qtyInput = document.getElementById('qty');
    const tierSelect = document.getElementById('tier');
    const taxToggle = document.getElementById('tax');
    const addonCheckboxes = document.querySelectorAll('.addons input[type="checkbox"]');
    const amountDisplay = document.querySelector('.amount');
    const breakdownList = document.getElementById('breakdown');

    // Calculate and update pricing
    function updatePricing() {
      const qty = parseInt(qtyInput.value) || 0;
      const tier = tierSelect.value;
      const includeTax = taxToggle.checked;
      
      // Base price calculation
      const basePrice = qty * pricing[tier];
      let total = basePrice;
      const breakdown = [];

      // Add base price to breakdown
      const tierName = tier.charAt(0).toUpperCase() + tier.slice(1);
      breakdown.push({ 
        label: `${tierName} Plan (${qty} units)`, 
        value: basePrice,
        isBase: true
      });

      // Calculate addons
      let addonTotal = 0;
      addonCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
          const addonKey = checkbox.value;
          const addon = addons[addonKey];
          let addonCost = 0;

          switch (addon.type) {
            case 'flat':
              addonCost = addon.value;
              break;
            case 'perUnit':
              addonCost = addon.value * qty;
              break;
            case 'percentage':
              addonCost = (basePrice * addon.value) / 100;
              break;
          }

          addonTotal += addonCost;
          breakdown.push({
            label: addon.name,
            value: addonCost
          });
        }
      });

      total += addonTotal;
      const subtotal = total;

      // Add subtotal
      breakdown.push({
        label: 'Subtotal',
        value: subtotal,
        isSubtotal: true
      });

      // Calculate tax
      let taxAmount = 0;
      if (includeTax) {
        taxAmount = total * 0.15;
        total += taxAmount;
        breakdown.push({
          label: 'Tax (15%)',
          value: taxAmount
        });
      }

      // Add final total
      breakdown.push({
        label: 'Total',
        value: total,
        isTotal: true
      });

      // Update display
      amountDisplay.textContent = `$${total.toFixed(2)}`;
      
      // Update breakdown
      breakdownList.innerHTML = '';
      breakdown.forEach(item => {
        const li = document.createElement('li');
        const label = item.isTotal ? `<strong>${item.label}</strong>` : item.label;
        const value = item.isTotal ? `<strong>$${item.value.toFixed(2)}</strong>` : `$${item.value.toFixed(2)}`;
        li.innerHTML = `<span>${label}</span><span>${value}</span>`;
        breakdownList.appendChild(li);
      });

      // Trigger animations
      amountDisplay.style.animation = 'none';
      amountDisplay.offsetHeight; // Trigger reflow
      amountDisplay.style.animation = 'priceUpdate 0.3s ease';
    }

    // Event listeners
    qtyInput.addEventListener('input', updatePricing);
    tierSelect.addEventListener('change', updatePricing);
    taxToggle.addEventListener('change', updatePricing);
    addonCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', updatePricing);
    });

    // Initialize
    updatePricing();

    // Add smooth interactions
    document.querySelectorAll('input, select').forEach(element => {
      element.addEventListener('focus', function() {
        this.parentElement.style.transform = 'translateY(-2px)';
      });
      
      element.addEventListener('blur', function() {
        this.parentElement.style.transform = 'translateY(0)';
      });
    });
  