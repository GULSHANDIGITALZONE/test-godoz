/* ==========================================================================
   GoDoz Technology - Modals (Track Order, PAD Info, Project Booking) Module
   ========================================================================== */

/* 1. Track Order Modal */
window.openTrackOrderModal = function(prefillId = '') {
  const modal = document.getElementById('trackOrderModal');
  if (!modal) return;

  const input = document.getElementById('trackInputQuery');
  const resultBox = document.getElementById('trackResultContainer');
  const notFoundBox = document.getElementById('trackNotFoundView');

  if (input && prefillId) {
    input.value = prefillId;
    if (typeof window.trackOrderById === 'function') window.trackOrderById(prefillId);
  } else {
    if (resultBox) resultBox.style.display = 'none';
    if (notFoundBox) notFoundBox.style.display = 'none';
  }

  modal.style.display = 'flex';
  setTimeout(() => modal.classList.add('active'), 10);
  document.body.style.overflow = 'hidden';
};

window.closeTrackOrderModal = function() {
  const modal = document.getElementById('trackOrderModal');
  if (!modal) return;
  modal.classList.remove('active');
  setTimeout(() => {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }, 200);
};

/* 2. PAD (Pay After Demo) Info Modal */
window.openPadInfoModal = function(e) {
  if (e) e.stopPropagation();
  const modal = document.getElementById('padInfoModal');
  if (modal) {
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('active'), 10);
  }
};

window.closePadInfoModal = function() {
  const modal = document.getElementById('padInfoModal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.style.display = 'none', 200);
  }
};

/* 3. Project Order Booking Modal */
window.openOrderModal = function(category = '', price = 0, features = '') {
  const modal = document.getElementById('projectOrderModal');
  if (!modal) return;

  const categorySelect = document.getElementById('modalOrderCategory');
  const priceDisplay = document.getElementById('modalOrderPriceDisplay');
  const origDisplay = document.getElementById('modalOrderOriginalDisplay');
  const discBadge = document.getElementById('modalOrderDiscountBadge');
  const featuresInput = document.getElementById('modalOrderFeatures');
  const formView = document.getElementById('projectOrderForm');
  const successView = document.getElementById('orderSuccessView');

  if (formView) formView.style.display = 'block';
  if (successView) successView.style.display = 'none';

  if (categorySelect) {
    if (category) {
      for (let i = 0; i < categorySelect.options.length; i++) {
        const val = categorySelect.options[i].value.toLowerCase();
        const cat = category.toLowerCase();
        if (val.includes(cat) || cat.includes(val)) {
          categorySelect.selectedIndex = i;
          break;
        }
      }
    }
    const opt = categorySelect.options[categorySelect.selectedIndex] || categorySelect.options[0];
    if (opt) {
      const p = price || parseInt(opt.dataset.price || '19999', 10);
      const orig = parseInt(opt.dataset.original || '45000', 10);
      const disc = opt.dataset.discount || '55';

      if (priceDisplay) {
        priceDisplay.textContent = `₹${p.toLocaleString('en-IN')}`;
        priceDisplay.dataset.amount = p;
      }
      if (origDisplay) {
        origDisplay.textContent = `₹${orig.toLocaleString('en-IN')}`;
      }
      if (discBadge) {
        discBadge.textContent = `${disc}% OFF`;
      }
    }
  }

  if (features && featuresInput) {
    featuresInput.value = features;
  }

  if (typeof window.updateDueToday === 'function') {
    window.updateDueToday();
  }

  modal.style.display = 'flex';
  setTimeout(() => modal.classList.add('active'), 10);
  document.body.style.overflow = 'hidden';
};

window.closeOrderModal = function() {
  const modal = document.getElementById('projectOrderModal');
  if (!modal) return;
  modal.classList.remove('active');
  setTimeout(() => {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }, 200);
};
