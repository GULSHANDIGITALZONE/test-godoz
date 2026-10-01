/* ==========================================================================
   GoDoz Technology - Interactive FAQ Accordion & Search Filter Module
   ========================================================================== */

window.currentFaqCategory = 'all';

window.setFaqCategory = function(category, chipEl) {
  window.currentFaqCategory = category;
  document.querySelectorAll('#faqPageFilterChips .status-chip').forEach(c => c.classList.remove('active'));
  if (chipEl) chipEl.classList.add('active');
  window.filterFaqAccordion();
};

window.filterFaqAccordion = function() {
  const query = (document.getElementById('faqPageSearch')?.value || '').toLowerCase().trim();
  const cards = document.querySelectorAll('#faqAccordionContainer details');

  cards.forEach(card => {
    const text = card.textContent.toLowerCase();
    const category = card.getAttribute('data-category') || 'all';

    const matchesCat = (window.currentFaqCategory === 'all' || category === window.currentFaqCategory);
    const matchesQuery = !query || text.includes(query);

    if (matchesCat && matchesQuery) {
      card.style.display = 'block';
      if (query) card.open = true;
    } else {
      card.style.display = 'none';
    }
  });
};
