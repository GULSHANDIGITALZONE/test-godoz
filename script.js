/**
 * GoDoz Technology & Digital Solutions - Master Interactive Script
 * Brand: GoDoz | Founder: RS GULSHAN PRAJAPATI
 * Features: Cost Calculator, Live Mini-Tools, Realtime Directory Search,
 *           Theme Switcher, FAQ Accordion, Print Engine Trigger.
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initGoDozLanguage();
  initSearch();
  initEstimator();
  initTools();
  initFaq();
  initMobileMenu();
  initBackToTop();
  initDirectoryPagination();
  initAppSidebar();
  initAuthNavSync();
  initServiceWorker();
  initGlobalPreloader();
  initSeamlessNavigation();
  if (typeof window.autoFillUserInputs === 'function') {
    window.autoFillUserInputs();
  }
});

/* Dismiss Global Branded Page Preloader */
function initGlobalPreloader() {
  const loader = document.getElementById('globalPageLoader');
  if (loader) {
    const hideLoader = () => {
      loader.classList.add('loaded');
      setTimeout(() => { loader.style.display = 'none'; }, 400);
    };
    if (document.readyState === 'complete') {
      hideLoader();
    } else {
      window.addEventListener('load', hideLoader);
      setTimeout(hideLoader, 1500); // 1.5s max fallback guarantee
    }
  }
}

/* Auto-Fill User Name, Email & Phone for Logged-In / Saved Clients */
window.autoFillUserInputs = function(user) {
  const cachedName = user?.displayName || localStorage.getItem('godoz_user_name') || '';
  const cachedEmail = user?.email || localStorage.getItem('godoz_user_email') || '';
  const cachedPhone = user?.phoneNumber || localStorage.getItem('godoz_user_phone') || '';
  const primaryContact = cachedPhone || cachedEmail;

  // 1. Send Direct Project Inquiry Widget inputs
  const widgetName = document.getElementById('godozWidgetName');
  const widgetContact = document.getElementById('godozWidgetContact');
  if (widgetName && !widgetName.value && cachedName) widgetName.value = cachedName;
  if (widgetContact && !widgetContact.value && primaryContact) widgetContact.value = primaryContact;

  // 2. Project Booking Order Modal inputs
  const modalName = document.getElementById('modalOrderClientName');
  const modalEmail = document.getElementById('modalOrderClientEmail');
  const modalPhone = document.getElementById('modalOrderClientPhone');
  if (modalName && !modalName.value && cachedName) modalName.value = cachedName;
  if (modalEmail && !modalEmail.value && cachedEmail) modalEmail.value = cachedEmail;
  if (modalPhone && !modalPhone.value && cachedPhone) modalPhone.value = cachedPhone;

  // 3. Track Live Order Search input
  const trackQuery = document.getElementById('trackInputQuery');
  if (trackQuery && !trackQuery.value && primaryContact) trackQuery.value = primaryContact;

  // 4. Feedback Form inputs
  const fbName = document.getElementById('fbName');
  const fbContact = document.getElementById('fbContact');
  if (fbName && !fbName.value && cachedName) fbName.value = cachedName;
  if (fbContact && !fbContact.value && primaryContact) fbContact.value = primaryContact;
};

/* PWA Service Worker Registration */
function initServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').then((reg) => {
        console.log('[GoDoz PWA] Service Worker registered with scope:', reg.scope);
      }).catch((err) => {
        console.warn('[GoDoz PWA] Service Worker registration failed:', err);
      });
    });
  }
}

/* Floating Toast Notification Helper */
window.showGoDozToast = function(message, type = 'info') {
  let container = document.getElementById('godozToastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'godozToastContainer';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `godoz-toast ${type}`;
  const icon = type === 'success' ? 'fa-check-circle' : (type === 'error' ? 'fa-exclamation-triangle' : 'fa-info-circle');
  toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
};

/* ==========================================================================
   1. Theme Switcher (Dark / Light Mode)
   ========================================================================== */
function initTheme() {
  const savedTheme = localStorage.getItem('godoz_theme') || 
    (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  
  applyTheme(savedTheme, false);

  // Global Click Event Delegation for any Theme Toggle Button
  document.addEventListener('click', (e) => {
    const target = e.target.closest('#themeToggleBtn, .theme-toggle-btn, .header-btn-theme, [data-action="toggle-theme"]');
    if (target) {
      e.preventDefault();
      window.toggleGoDozTheme();
    }
  });

  // Listen to OS Dark Mode Preference changes
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('godoz_theme')) {
        applyTheme(e.matches ? 'dark' : 'light', false);
      }
    });
  }
}

function applyTheme(theme, save = true) {
  document.documentElement.setAttribute('data-theme', theme);
  if (save) {
    localStorage.setItem('godoz_theme', theme);
  }
  updateThemeIcon(theme);
  updateMetaThemeColor(theme);
  window.dispatchEvent(new CustomEvent('godoz-theme-change', { detail: { theme } }));
}

function updateMetaThemeColor(theme) {
  let metaTheme = document.querySelector('meta[name="theme-color"]');
  if (!metaTheme) {
    metaTheme = document.createElement('meta');
    metaTheme.name = 'theme-color';
    document.head.appendChild(metaTheme);
  }
  metaTheme.content = theme === 'dark' ? '#090e1a' : '#1266e8';
}

window.toggleGoDozTheme = function() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(newTheme, true);
};

window.applyTheme = applyTheme;
window.initTheme = initTheme;
window.updateThemeIcon = updateThemeIcon;

function updateThemeIcon(theme) {
  const toggleBtns = document.querySelectorAll('#themeToggleBtn, .theme-toggle-btn, .header-btn-theme, [data-action="toggle-theme"]');
  toggleBtns.forEach(btn => {
    const isDark = theme === 'dark';
    btn.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
    btn.setAttribute('title', isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode');
    btn.setAttribute('aria-label', isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode');
  });
}

/* ==========================================================================
   1.5 Language Switcher (हिन्दी / English Toggle Engine)
   ========================================================================== */
function initGoDozLanguage() {
  let gtContainer = document.getElementById('google_translate_element');
  if (!gtContainer) {
    gtContainer = document.createElement('div');
    gtContainer.id = 'google_translate_element';
    gtContainer.style.display = 'none';
    document.body.appendChild(gtContainer);
  }

  if (!document.getElementById('google-translate-script')) {
    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.head.appendChild(script);
  }

  window.googleTranslateElementInit = function() {
    try {
      new google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: 'hi,en',
        autoDisplay: false
      }, 'google_translate_element');

      const savedLang = localStorage.getItem('godoz_lang') || 'en';
      if (savedLang === 'hi') {
        setTimeout(() => applyLanguage('hi'), 300);
      }
    } catch(e) {}
  };

  document.addEventListener('click', (e) => {
    const target = e.target.closest('#langToggleBtn, .lang-toggle-btn, .header-btn-lang, [data-action="toggle-lang"]');
    if (target) {
      e.preventDefault();
      window.toggleGoDozLanguage();
    }
  });

  updateLangBtnUI(localStorage.getItem('godoz_lang') || 'en');
}

function applyLanguage(lang) {
  localStorage.setItem('godoz_lang', lang);
  updateLangBtnUI(lang);

  const select = document.querySelector('.goog-te-combo');
  if (select) {
    select.value = lang === 'hi' ? 'hi' : 'en';
    select.dispatchEvent(new Event('change'));
  } else {
    document.cookie = `googtrans=/en/${lang}; path=/; domain=${window.location.hostname}`;
    document.cookie = `googtrans=/en/${lang}; path=/;`;
  }
}

window.toggleGoDozLanguage = function() {
  const currentLang = localStorage.getItem('godoz_lang') || 'en';
  const newLang = currentLang === 'hi' ? 'en' : 'hi';
  applyLanguage(newLang);

  const select = document.querySelector('.goog-te-combo');
  if (select) {
    select.value = newLang === 'hi' ? 'hi' : 'en';
    select.dispatchEvent(new Event('change'));
  } else {
    window.location.reload();
  }
};

function updateLangBtnUI(lang) {
  const langBtns = document.querySelectorAll('#langToggleBtn, .lang-toggle-btn, .header-btn-lang, [data-action="toggle-lang"]');
  langBtns.forEach(btn => {
    const isHi = lang === 'hi';
    btn.innerHTML = isHi ? `<i class="fa-solid fa-language"></i> <span class="btn-text">English</span>` : `<i class="fa-solid fa-language"></i> <span class="btn-text">हिन्दी</span>`;
    btn.setAttribute('title', isHi ? 'Switch to English Language' : 'Switch to Hindi (हिन्दी) Language');
    btn.setAttribute('aria-label', isHi ? 'Switch to English Language' : 'Switch to Hindi Language');
  });
}

window.initGoDozLanguage = initGoDozLanguage;
window.applyLanguage = applyLanguage;
window.updateLangBtnUI = updateLangBtnUI;

/* ==========================================================================
   2. Realtime Directory Search, Visual Highlighter & Match Navigator
   ========================================================================== */
function initSearch() {
  const searchInput = document.getElementById('globalSearchInput');
  const clearBtn = document.getElementById('searchClearBtn');
  const categoryPills = document.querySelectorAll('.category-pill');
  const searchNavBar = document.getElementById('searchNavBar');
  const resultsCounter = document.getElementById('searchResultsCounter');
  const prevBtn = document.getElementById('searchPrevBtn');
  const nextBtn = document.getElementById('searchNextBtn');
  const matchPositionSpan = document.getElementById('searchMatchPosition');
  const resultsDropdown = document.getElementById('searchResultsDropdown');

  const searchableCards = document.querySelectorAll('.directory-card, .service-card, .product-showcase-card, .pricing-card, .faq-item, .founder-dossier-card');

  if (!searchInput) return;

  let matchedCards = [];
  let currentMatchIndex = -1;

  // Clean all previous highlights
  function clearAllHighlights() {
    document.querySelectorAll('mark.search-highlight').forEach(mark => {
      const parent = mark.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(mark.textContent), mark);
        parent.normalize();
      }
    });
    document.querySelectorAll('.matched-item-focused').forEach(el => el.classList.remove('matched-item-focused'));
  }

  // Highlight matches inside an element's text nodes
  function highlightMatches(element, query) {
    if (!query) return false;
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    let hasMatch = false;

    function walk(node) {
      if (node.nodeType === 3) {
        const text = node.nodeValue;
        if (regex.test(text)) {
          hasMatch = true;
          const fragment = document.createDocumentFragment();
          let lastIdx = 0;
          text.replace(regex, (match, p1, offset) => {
            fragment.appendChild(document.createTextNode(text.substring(lastIdx, offset)));
            const mark = document.createElement('mark');
            mark.className = 'search-highlight';
            mark.textContent = match;
            fragment.appendChild(mark);
            lastIdx = offset + match.length;
          });
          fragment.appendChild(document.createTextNode(text.substring(lastIdx)));
          node.parentNode.replaceChild(fragment, node);
        }
      } else if (node.nodeType === 1 && node.childNodes && !['SCRIPT', 'STYLE', 'INPUT', 'TEXTAREA', 'BUTTON'].includes(node.tagName)) {
        Array.from(node.childNodes).forEach(walk);
      }
    }

    walk(element);
    return hasMatch;
  }

  function performSearch(shouldScroll = true) {
    clearAllHighlights();
    const query = searchInput.value.toLowerCase().trim();
    const activeCategory = document.querySelector('.category-pill.active')?.dataset.category || 'all';

    if (clearBtn) {
      clearBtn.style.display = query ? 'block' : 'none';
    }

    matchedCards = [];
    currentMatchIndex = -1;

    if (!query && activeCategory === 'all') {
      searchableCards.forEach(card => card.style.display = '');
      if (searchNavBar) searchNavBar.style.display = 'none';
      if (resultsDropdown) resultsDropdown.style.display = 'none';
      return;
    }

    // Filter and highlight
    searchableCards.forEach(card => {
      const text = card.textContent.toLowerCase();
      const cardCategory = card.dataset.category || '';

      const matchesCategory = activeCategory === 'all' || cardCategory.includes(activeCategory);
      const matchesQuery = !query || text.includes(query);

      if (matchesQuery && matchesCategory) {
        card.style.display = '';
        if (query) {
          highlightMatches(card, query);
        }
        matchedCards.push(card);
      } else {
        card.style.display = query ? 'none' : '';
      }
    });

    // Populate Results Dropdown
    if (resultsDropdown) {
      if (query && matchedCards.length > 0) {
        resultsDropdown.innerHTML = '';
        matchedCards.slice(0, 10).forEach((card, idx) => {
          const title = card.querySelector('.directory-title, .service-title, h3, .pricing-tier-name')?.textContent || 'Matching Resource';
          const icon = card.querySelector('.directory-icon i, .service-icon-wrap i, i')?.className || 'fa-solid fa-link';
          const category = card.dataset.category || 'Resource';

          const item = document.createElement('div');
          item.className = 'search-result-item';
          item.innerHTML = `
            <div class="search-result-title">
              <i class="${icon}" style="color:var(--primary);"></i>
              <span>${title}</span>
            </div>
            <span class="search-result-badge">${category.toUpperCase()}</span>
          `;

          item.addEventListener('click', () => {
            gotoMatch(idx);
            resultsDropdown.style.display = 'none';
          });

          resultsDropdown.appendChild(item);
        });
        resultsDropdown.style.display = 'block';
      } else {
        resultsDropdown.style.display = 'none';
      }
    }

    // Update Nav Bar
    if (searchNavBar && resultsCounter) {
      if (query || activeCategory !== 'all') {
        searchNavBar.style.display = 'flex';
        if (matchedCards.length > 0) {
          resultsCounter.innerHTML = `🎯 Found <strong style="color:var(--primary);">${matchedCards.length}</strong> matching item(s)`;
          currentMatchIndex = 0;
          updateMatchPosition();
          if (shouldScroll) {
            scrollToCurrentMatch();
          }
        } else {
          resultsCounter.innerHTML = `❌ No matching resources found for "<em>${query}</em>"`;
          if (matchPositionSpan) matchPositionSpan.textContent = '';
          if (prevBtn) prevBtn.disabled = true;
          if (nextBtn) nextBtn.disabled = true;
        }
      } else {
        searchNavBar.style.display = 'none';
      }
    }
  }

  function updateMatchPosition() {
    if (!matchedCards.length) return;
    if (matchPositionSpan) {
      matchPositionSpan.textContent = `[${currentMatchIndex + 1} of ${matchedCards.length}]`;
    }
    if (prevBtn) prevBtn.disabled = currentMatchIndex <= 0;
    if (nextBtn) nextBtn.disabled = currentMatchIndex >= matchedCards.length - 1;
  }

  function scrollToCurrentMatch() {
    if (currentMatchIndex < 0 || currentMatchIndex >= matchedCards.length) return;

    // Remove active mark and focused styles
    document.querySelectorAll('.active-match').forEach(m => m.classList.remove('active-match'));
    document.querySelectorAll('.matched-item-focused').forEach(c => c.classList.remove('matched-item-focused'));

    const currentCard = matchedCards[currentMatchIndex];
    if (currentCard) {
      currentCard.classList.add('matched-item-focused');
      const marks = currentCard.querySelectorAll('mark.search-highlight');
      if (marks.length > 0) {
        marks[0].classList.add('active-match');
      }

      // Smooth scroll to card
      currentCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    updateMatchPosition();
  }

  function gotoMatch(index) {
    if (!matchedCards.length) return;
    if (index < 0) index = 0;
    if (index >= matchedCards.length) index = matchedCards.length - 1;
    currentMatchIndex = index;
    scrollToCurrentMatch();
  }

  // Event Listeners
  searchInput.addEventListener('input', () => performSearch(false));

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        if (currentMatchIndex > 0) gotoMatch(currentMatchIndex - 1);
      } else {
        if (currentMatchIndex < matchedCards.length - 1) {
          gotoMatch(currentMatchIndex + 1);
        } else {
          gotoMatch(0);
        }
      }
    }
  });

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentMatchIndex > 0) gotoMatch(currentMatchIndex - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentMatchIndex < matchedCards.length - 1) {
        gotoMatch(currentMatchIndex + 1);
      } else {
        gotoMatch(0);
      }
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      performSearch(false);
      searchInput.focus();
    });
  }

  categoryPills.forEach(pill => {
    pill.addEventListener('click', () => {
      categoryPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      performSearch(false);
    });
  });

  // Close dropdown on click outside
  document.addEventListener('click', (e) => {
    if (resultsDropdown && !searchInput.contains(e.target) && !resultsDropdown.contains(e.target)) {
      resultsDropdown.style.display = 'none';
    }
  });
}

/* ==========================================================================
   3. Interactive Project Cost Estimator / Quote Calculator
   ========================================================================== */
function initEstimator() {
  const typeRadios = document.querySelectorAll('input[name="project_type"]');
  const featureCheckboxes = document.querySelectorAll('input[name="feature_addon"]');
  const timelineRadios = document.querySelectorAll('input[name="timeline"]');
  
  const totalPriceDisplay = document.getElementById('estimatorTotalPrice');
  const projectSummaryDisplay = document.getElementById('estimatorSummaryText');
  const whatsappQuoteBtn = document.getElementById('estimatorWhatsappBtn');

  function calculateQuote() {
    let basePrice = 0;
    let typeName = 'Standard Website';
    let selectedFeatures = [];
    let speedMultiplier = 1;
    let timelineText = 'Normal Delivery (लगभग 15 दिन)';

    // 1. Base Project Type
    const selectedType = document.querySelector('input[name="project_type"]:checked');
    if (selectedType) {
      basePrice = parseInt(selectedType.value, 10);
      typeName = selectedType.dataset.name;
    }

    // 2. Add-on Features
    let featuresCost = 0;
    featureCheckboxes.forEach(cb => {
      if (cb.checked) {
        featuresCost += parseInt(cb.value, 10);
        selectedFeatures.push(cb.dataset.name);
      }
    });

    // 3. Timeline Multiplier
    const selectedTimeline = document.querySelector('input[name="timeline"]:checked');
    if (selectedTimeline) {
      speedMultiplier = parseFloat(selectedTimeline.value);
      timelineText = selectedTimeline.dataset.name;
    }

    // Custom Idea Toggle Logic
    const customIdeaInput = document.getElementById('customIdeaInput');
    const customIdeaTextWrap = document.getElementById('customIdeaTextWrap');
    const orderModalBtn = document.getElementById('btnOpenOrderEstimator');
    const isCustom = selectedType && selectedType.value === '0';

    if (customIdeaTextWrap) {
      customIdeaTextWrap.style.display = isCustom ? 'block' : 'none';
    }
    if (orderModalBtn) {
      orderModalBtn.style.display = 'block';
    }

    const customText = (customIdeaInput?.value || '').trim();
    const calculatedTotal = isCustom ? 0 : Math.round((basePrice + featuresCost) * speedMultiplier);

    if (totalPriceDisplay) {
      if (isCustom) {
        totalPriceDisplay.textContent = "₹0 (PAD)";
      } else {
        animateCounter(totalPriceDisplay, calculatedTotal);
      }
    }

    if (projectSummaryDisplay) {
      const featString = customText || (selectedFeatures.length > 0 ? selectedFeatures.join(', ') : 'Standard Features');
      if (isCustom) {
        projectSummaryDisplay.innerHTML = `
          <strong>Project:</strong> Custom Requirement / Unique Idea<br>
          <strong>Booking Mode:</strong> ₹0 Pay After Demo (PAD)<br>
          <strong>Note:</strong> ${customText || 'Custom unique specifications'}
        `;
      } else {
        projectSummaryDisplay.innerHTML = `
          <strong>Project:</strong> ${typeName}<br>
          <strong>Included:</strong> ${featString}<br>
          <strong>Delivery:</strong> ${timelineText}
        `;
      }
    }

    if (whatsappQuoteBtn) {
      const featString = customText || (selectedFeatures.length > 0 ? selectedFeatures.join(', ') : 'Standard Features');
      let msg = `Hello GoDoz / Gulshan sir! I want to discuss a project with GoDoz Technologies:%0A%0A*Project Type:* ${typeName}`;
      if (isCustom) {
        msg += `%0A*Custom Idea Details:* ${encodeURIComponent(customText || 'Unique Custom Requirement')}`;
      } else {
        msg += `%0A*Features:* ${featString}%0A*Timeline:* ${timelineText}%0A*Estimated Investment:* ₹${calculatedTotal.toLocaleString('en-IN')}`;
      }
      msg += `%0A%0APlease share next steps and project consultation!`;
      whatsappQuoteBtn.href = `https://wa.me/919288521731?text=${msg}`;
    }

    if (orderModalBtn) {
      orderModalBtn.onclick = () => {
        const featString = customText || (selectedFeatures.length > 0 ? selectedFeatures.join(', ') : 'Standard Features');
        if (typeof window.openOrderModal === 'function') {
          window.openOrderModal(typeName, calculatedTotal, featString);
        }
      };
    }

    const pdfQuoteBtn = document.getElementById('estimatorDownloadPdfBtn');
    if (pdfQuoteBtn) {
      pdfQuoteBtn.onclick = () => {
        window.downloadEstimatorQuotation();
      };
    }
  }

  // Printable / Downloadable Official Quotation Engine
  window.downloadEstimatorQuotation = function() {
    const selectedType = document.querySelector('input[name="project_type"]:checked');
    const typeName = selectedType ? selectedType.dataset.name : 'Custom App/Web Solution';
    const basePrice = selectedType ? parseInt(selectedType.value, 10) : 4999;

    let selectedFeatures = [];
    let featuresCost = 0;
    document.querySelectorAll('input[name="feature_addon"]:checked').forEach(cb => {
      featuresCost += parseInt(cb.value, 10);
      selectedFeatures.push(cb.dataset.name);
    });

    const selectedTimeline = document.querySelector('input[name="timeline"]:checked');
    const timelineText = selectedTimeline ? selectedTimeline.dataset.name : 'Normal Delivery (लगभग 15 दिन)';
    const speedMultiplier = selectedTimeline ? parseFloat(selectedTimeline.value) : 1;

    const total = Math.round((basePrice + featuresCost) * speedMultiplier);
    const quoteRef = "GoDoz-QUOTE-" + Math.floor(10000 + Math.random() * 90000);
    const currentDate = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

    const printWin = window.open('', '_blank', 'width=800,height=900');
    if (!printWin) {
      if (typeof window.showGoDozToast === 'function') {
        window.showGoDozToast('Please allow popup permissions to view PDF quotation!', 'error');
      } else {
        alert('Please allow popup permissions to view PDF quotation!');
      }
      return;
    }

    const featItems = selectedFeatures.map(f => `<li>${f}</li>`).join('') || '<li>Standard Mobile & Web Responsive Architecture</li>';

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>GoDoz Official Quotation - ${quoteRef}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; margin: 40px; color: #0f172a; background: #ffffff; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #1266e8; padding-bottom: 18px; }
          .brand { font-size: 26px; font-weight: 900; color: #1266e8; }
          .sub-brand { font-size: 13px; color: #64748b; font-weight: 600; }
          .meta-table { width: 100%; margin: 25px 0; border-collapse: collapse; }
          .meta-table td { padding: 10px 14px; background: #f8fafc; border: 1px solid #e2e8f0; font-size: 14px; }
          .section-title { font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 25px; border-left: 4px solid #1266e8; padding-left: 10px; }
          ul { background: #f1f5f9; padding: 15px 30px; border-radius: 8px; }
          li { margin-bottom: 6px; font-size: 14px; }
          .price-box { background: #0b1b36; color: #ffffff; padding: 22px; border-radius: 12px; margin-top: 25px; display: flex; justify-content: space-between; align-items: center; }
          .price-amount { font-size: 28px; font-weight: 900; color: #38bdf8; }
          .terms { margin-top: 30px; font-size: 12px; color: #64748b; line-height: 1.6; border-top: 1px solid #e2e8f0; padding-top: 15px; }
          .signature { margin-top: 40px; text-align: right; font-size: 14px; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">GoDoz Technology</div>
            <div class="sub-brand">Custom Android Apps & Scalable Web Systems</div>
            <div class="sub-brand">Founder & Lead Software Engineer: RS GULSHAN PRAJAPATI</div>
          </div>
          <div style="text-align:right;">
            <strong style="color:#1266e8; font-size:16px;">OFFICIAL PROJECT QUOTATION</strong><br>
            <span style="font-size:12px; color:#64748b;">Ref: ${quoteRef}</span><br>
            <span style="font-size:12px; color:#64748b;">Date: ${currentDate}</span>
          </div>
        </div>

        <table class="meta-table">
          <tr>
            <td><strong>Project Scope:</strong> ${typeName}</td>
            <td><strong>Delivery Timeline:</strong> ${timelineText}</td>
          </tr>
          <tr>
            <td><strong>Provider:</strong> GoDoz Technology (www.godoz.in)</td>
            <td><strong>Contact:</strong> +91-9288521731 | godoz.info@gmail.com</td>
          </tr>
        </table>

        <div class="section-title">Included Features & Scope</div>
        <ul>${featItems}</ul>

        <div class="price-box">
          <div>
            <div style="font-size:14px; opacity:0.9;">Total Estimated Investment</div>
            <div style="font-size:12px; opacity:0.75;">Milestone Billing Available (0% Advance COD Supported)</div>
          </div>
          <div class="price-amount">₹${total.toLocaleString('en-IN')}</div>
        </div>

        <div class="terms">
          <strong>Terms & Conditions:</strong><br>
          1. This quotation is generated automatically by GoDoz Estimator Engine and is valid for 15 days.<br>
          2. Development includes complete source code access, free APK build, deployment setup & 30-day post-launch support.<br>
          3. Milestone payment terms are supported upon project booking via GoDoz Portal.
        </div>

        <div class="signature">
          <strong>Authorized Signatory</strong><br>
          <em>RS GULSHAN PRAJAPATI</em><br>
          <span style="font-size:12px; color:#64748b;">GoDoz Technology</span>
        </div>

        <div class="no-print" style="margin-top:30px; text-align:center;">
          <button onclick="window.print()" style="padding:12px 26px; background:#1266e8; color:#ffffff; border:none; border-radius:8px; font-weight:bold; cursor:pointer; font-size:15px;">Print / Save as PDF</button>
        </div>
      </body>
      </html>
    `);
    printWin.document.close();
  };

  // Smooth rolling number counter
  function animateCounter(element, targetVal) {
    const currentVal = parseInt(element.dataset.val || '4999', 10);
    element.dataset.val = targetVal;
    const startTime = performance.now();
    const duration = 300; // ms

    function update(time) {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeVal = Math.round(currentVal + (targetVal - currentVal) * progress);
      element.textContent = `₹${easeVal.toLocaleString('en-IN')}`;
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = `₹${targetVal.toLocaleString('en-IN')}`;
      }
    }
    requestAnimationFrame(update);
  }

  // 1-Click Smart Scope Presets Logic
  window.applyEstimatorPreset = function(preset) {
    // Update active pill styling
    document.querySelectorAll('.smart-preset-pill').forEach(p => p.classList.remove('active'));
    event?.target?.classList.add('active');

    // Uncheck all features first
    featureCheckboxes.forEach(cb => cb.checked = false);

    if (preset === 'website') {
      const r = document.querySelector('input[name="project_type"][value="4999"]');
      if (r) r.checked = true;
    } else if (preset === 'android_app') {
      const r = document.querySelector('input[name="project_type"][value="9999"]');
      if (r) r.checked = true;
      const f1 = document.querySelector('input[name="feature_addon"][data-name="Push Notifications"]');
      if (f1) f1.checked = true;
    } else if (preset === 'ecommerce') {
      const r = document.querySelector('input[name="project_type"][value="14999"]');
      if (r) r.checked = true;
      const f1 = document.querySelector('input[name="feature_addon"][data-name="User Login/Auth"]');
      const f2 = document.querySelector('input[name="feature_addon"][data-name="Razorpay Gateway"]');
      const f3 = document.querySelector('input[name="feature_addon"][data-name="Admin CMS Dashboard"]');
      if (f1) f1.checked = true;
      if (f2) f2.checked = true;
      if (f3) f3.checked = true;
    } else if (preset === 'combo_suite') {
      const r = document.querySelector('input[name="project_type"][value="19999"]');
      if (r) r.checked = true;
      const f1 = document.querySelector('input[name="feature_addon"][data-name="User Login/Auth"]');
      const f2 = document.querySelector('input[name="feature_addon"][data-name="Razorpay Gateway"]');
      const f3 = document.querySelector('input[name="feature_addon"][data-name="Admin CMS Dashboard"]');
      const f4 = document.querySelector('input[name="feature_addon"][data-name="Push Notifications"]');
      if (f1) f1.checked = true;
      if (f2) f2.checked = true;
      if (f3) f3.checked = true;
      if (f4) f4.checked = true;
    } else if (preset === 'saas_portal') {
      const r = document.querySelector('input[name="project_type"][value="14999"]');
      if (r) r.checked = true;
      const f1 = document.querySelector('input[name="feature_addon"][data-name="User Login/Auth"]');
      const f2 = document.querySelector('input[name="feature_addon"][data-name="Razorpay Gateway"]');
      const f3 = document.querySelector('input[name="feature_addon"][data-name="Admin CMS Dashboard"]');
      const f4 = document.querySelector('input[name="feature_addon"][data-name="Gemini AI Integration"]');
      if (f1) f1.checked = true;
      if (f2) f2.checked = true;
      if (f3) f3.checked = true;
      if (f4) f4.checked = true;
    }

    calculateQuote();
  };

  typeRadios.forEach(r => r.addEventListener('change', calculateQuote));
  featureCheckboxes.forEach(c => c.addEventListener('change', calculateQuote));
  timelineRadios.forEach(r => r.addEventListener('change', calculateQuote));
  document.getElementById('customIdeaInput')?.addEventListener('input', calculateQuote);

  calculateQuote();
}

/* ==========================================================================
   4. In-Browser Live Micro-Tools Suite
   ========================================================================== */
function initTools() {
  // Tabs Navigation
  const tabBtns = document.querySelectorAll('.tool-tab-btn');
  const panels = document.querySelectorAll('.tool-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tool;
      tabBtns.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const activePanel = document.getElementById(`panel-${target}`);
      if (activePanel) activePanel.classList.add('active');
    });
  });

  // Tool 1: Text Counter & Converter
  const textInput = document.getElementById('textCounterInput');
  const wordCount = document.getElementById('statWords');
  const charCount = document.getElementById('statChars');
  const lineCount = document.getElementById('statLines');
  const readingTime = document.getElementById('statReadingTime');

  if (textInput) {
    textInput.addEventListener('input', () => {
      const val = textInput.value;
      const words = val.trim() ? val.trim().split(/\s+/).length : 0;
      const chars = val.length;
      const lines = val ? val.split(/\r\n|\r|\n/).length : 0;
      const timeSec = Math.ceil(words / 3.5);

      if (wordCount) wordCount.textContent = words;
      if (charCount) charCount.textContent = chars;
      if (lineCount) lineCount.textContent = lines;
      if (readingTime) readingTime.textContent = timeSec > 60 ? `${Math.ceil(timeSec / 60)} min` : `${timeSec} sec`;
    });
  }

  // Tool 2: Password Generator
  const passLength = document.getElementById('passLength');
  const passLengthNum = document.getElementById('passLengthNum');
  const passOutput = document.getElementById('generatedPassword');
  const btnGenPass = document.getElementById('btnGeneratePass');
  const btnCopyPass = document.getElementById('btnCopyPass');

  if (passLength && passLengthNum) {
    passLength.addEventListener('input', () => {
      passLengthNum.textContent = passLength.value;
    });
  }

  function generatePassword() {
    const len = parseInt(passLength?.value || 16, 10);
    const incUpper = document.getElementById('passUpper')?.checked ?? true;
    const incLower = document.getElementById('passLower')?.checked ?? true;
    const incNums = document.getElementById('passNums')?.checked ?? true;
    const incSyms = document.getElementById('passSyms')?.checked ?? true;

    let chars = '';
    if (incUpper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (incLower) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (incNums) chars += '0123456789';
    if (incSyms) chars += '!@#$%^&*()_+~`|}{[]:;?><,./-=';

    if (!chars) chars = 'abcdefghijklmnopqrstuvwxyz0123456789';

    let pass = '';
    for (let i = 0; i < len; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    if (passOutput) passOutput.value = pass;
  }

  if (btnGenPass) btnGenPass.addEventListener('click', generatePassword);
  if (btnCopyPass) {
    btnCopyPass.addEventListener('click', () => {
      if (passOutput && passOutput.value) {
        navigator.clipboard.writeText(passOutput.value).then(() => {
          btnCopyPass.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
          setTimeout(() => { btnCopyPass.innerHTML = '<i class="fa-solid fa-copy"></i> Copy'; }, 2000);
        });
      }
    });
  }

  // Tool 3: QR Code Generator
  const qrInput = document.getElementById('qrTextInput');
  const qrImage = document.getElementById('qrResultImage');
  const qrDownloadBtn = document.getElementById('qrDownloadBtn');
  const btnMakeQR = document.getElementById('btnMakeQR');

  function makeQRCode() {
    const text = qrInput?.value.trim() || 'https://www.godoz.in';
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(text)}`;
    if (qrImage) qrImage.src = qrUrl;
    if (qrDownloadBtn) {
      qrDownloadBtn.href = qrUrl;
      qrDownloadBtn.style.display = 'inline-flex';
    }
  }

  if (btnMakeQR) btnMakeQR.addEventListener('click', makeQRCode);

  // Tool 4: Base64 Encoder / Decoder
  const b64Input = document.getElementById('b64Input');
  const b64Output = document.getElementById('b64Output');
  const btnEncode = document.getElementById('btnB64Encode');
  const btnDecode = document.getElementById('btnB64Decode');
  const btnCopyB64 = document.getElementById('btnCopyB64');

  if (btnEncode) {
    btnEncode.addEventListener('click', () => {
      try {
        if (b64Input && b64Output) {
          b64Output.value = btoa(unescape(encodeURIComponent(b64Input.value)));
        }
      } catch (e) {
        alert('Invalid text for Base64 encoding');
      }
    });
  }

  if (btnDecode) {
    btnDecode.addEventListener('click', () => {
      try {
        if (b64Input && b64Output) {
          b64Output.value = decodeURIComponent(escape(atob(b64Input.value)));
        }
      } catch (e) {
        alert('Invalid Base64 string to decode');
      }
    });
  }

  if (btnCopyB64) {
    btnCopyB64.addEventListener('click', () => {
      if (b64Output && b64Output.value) {
        navigator.clipboard.writeText(b64Output.value).then(() => {
          btnCopyB64.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
          setTimeout(() => { btnCopyB64.innerHTML = '<i class="fa-solid fa-copy"></i> Copy Result'; }, 2000);
        });
      }
    });
  }
}

// Text Helper Functions
window.convertTextCase = function(type) {
  const input = document.getElementById('textCounterInput');
  if (!input) return;
  let val = input.value;
  if (type === 'upper') input.value = val.toUpperCase();
  if (type === 'lower') input.value = val.toLowerCase();
  if (type === 'title') {
    input.value = val.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }
  if (type === 'clean') {
    input.value = val.replace(/\s+/g, ' ').trim();
  }
  input.dispatchEvent(new Event('input'));
};

/* ==========================================================================
   5. FAQ Accordions
   ========================================================================== */
function initFaq() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        faqItems.forEach(f => f.classList.remove('active'));
        if (!isActive) {
          item.classList.add('active');
        }
      });
    }
  });
}

/* ==========================================================================
   6. Mobile Menu Drawer
   ========================================================================== */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobileMenuToggle');
  const drawer = document.getElementById('mobileNavDrawer');

  if (toggleBtn && drawer) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = drawer.classList.toggle('open');
      toggleBtn.innerHTML = isOpen ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
    });

    // Close when clicking any link inside drawer
    drawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        drawer.classList.remove('open');
        toggleBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
      });
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!drawer.contains(e.target) && !toggleBtn.contains(e.target)) {
        drawer.classList.remove('open');
        toggleBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
      }
    });
  }

  // Dropdown links click support
  document.querySelectorAll('.dropdown-link').forEach(link => {
    link.addEventListener('click', () => {
      const menu = link.closest('.nav-dropdown-menu');
      if (menu) {
        menu.style.opacity = '0';
        menu.style.visibility = 'hidden';
        setTimeout(() => {
          menu.style.opacity = '';
          menu.style.visibility = '';
        }, 300);
      }
    });
  });
}

/* ==========================================================================
   7. Back to Top Button
   ========================================================================== */
function initBackToTop() {
  const btn = document.getElementById('backToTopBtn');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ==========================================================================
   8. Directory Show More / Less Pagination
   ========================================================================== */
function initDirectoryPagination() {
  const PAGE_SIZE = 12;
  document.querySelectorAll('.box, .directory-group').forEach(box => {
    const items = Array.from(box.querySelectorAll('.important-link-box, .directory-card'));
    if (items.length <= PAGE_SIZE) return;

    items.forEach((it, idx) => {
      if (idx >= PAGE_SIZE) it.style.display = 'none';
    });

    let shown = PAGE_SIZE;
    const ctrlWrap = document.createElement('div');
    ctrlWrap.style.textAlign = 'center';
    ctrlWrap.style.margin = '20px 0';
    ctrlWrap.className = 'btn-print-hide';

    const btnMore = document.createElement('button');
    btnMore.innerHTML = '<i class="fa-solid fa-chevron-down"></i> Show More Portals';
    btnMore.className = 'btn btn-sm btn-outline';
    btnMore.style.marginRight = '8px';

    const btnLess = document.createElement('button');
    btnLess.innerHTML = '<i class="fa-solid fa-chevron-up"></i> Show Less';
    btnLess.className = 'btn btn-sm btn-outline';
    btnLess.style.display = 'none';

    btnMore.addEventListener('click', () => {
      const next = Math.min(shown + PAGE_SIZE, items.length);
      for (let i = shown; i < next; i++) items[i].style.display = '';
      shown = next;
      if (shown > PAGE_SIZE) btnLess.style.display = 'inline-flex';
      if (shown >= items.length) btnMore.style.display = 'none';
    });

    btnLess.addEventListener('click', () => {
      const hideTo = Math.max(PAGE_SIZE, shown - PAGE_SIZE);
      for (let i = hideTo; i < shown; i++) items[i].style.display = 'none';
      shown = hideTo;
      if (shown <= PAGE_SIZE) btnLess.style.display = 'none';
      if (shown < items.length) btnMore.style.display = 'inline-flex';
    });

    ctrlWrap.appendChild(btnMore);
    ctrlWrap.appendChild(btnLess);
    box.appendChild(ctrlWrap);
  });
}

/* ==========================================================================
   11. Hero Interactive Mockup Switcher
   ========================================================================== */
window.switchHeroMockup = function(mode) {
  const btnApp = document.getElementById('btnMockupApp');
  const btnWeb = document.getElementById('btnMockupWeb');
  const btnFounder = document.getElementById('btnMockupFounder');

  const screenApp = document.getElementById('mockupScreenApp');
  const screenWeb = document.getElementById('mockupScreenWeb');
  const screenFounder = document.getElementById('mockupScreenFounder');

  // Reset tab active classes
  [btnApp, btnWeb, btnFounder].forEach(b => b?.classList.remove('active'));
  // Hide all screens
  [screenApp, screenWeb, screenFounder].forEach(s => {
    if (s) s.style.display = 'none';
  });

  if (mode === 'app') {
    btnApp?.classList.add('active');
    if (screenApp) screenApp.style.display = 'flex';
  } else if (mode === 'web') {
    btnWeb?.classList.add('active');
    if (screenWeb) screenWeb.style.display = 'flex';
  } else if (mode === 'founder') {
    btnFounder?.classList.add('active');
    if (screenFounder) screenFounder.style.display = 'block';
  }
};

/* ==========================================================================
   12. Public Live Project Order Tracker Modal Controller
   ========================================================================== */
window.openTrackOrderModal = function(prefillId = '') {
  const modal = document.getElementById('trackOrderModal');
  if (!modal) return;

  const input = document.getElementById('trackInputQuery');
  const resultBox = document.getElementById('trackResultContainer');
  const notFoundBox = document.getElementById('trackNotFoundView');

  if (input && prefillId) {
    input.value = prefillId;
    window.trackOrderById(prefillId);
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

// Close tracker on backdrop click
document.getElementById('trackOrderModal')?.addEventListener('click', (e) => {
  if (e.target.id === 'trackOrderModal') {
    window.closeTrackOrderModal();
  }
});

// Live tracker lookup logic
window.trackOrderById = function(queryOverride) {
  const input = document.getElementById('trackInputQuery');
  const query = (queryOverride || input?.value || '').trim().toLowerCase();
  const normalizedQuery = query.replace('gdz-', 'godoz-');

  const resultBox = document.getElementById('trackResultContainer');
  const notFoundBox = document.getElementById('trackNotFoundView');

  if (!query) {
    if (typeof window.showGoDozToast === 'function') {
      window.showGoDozToast("Please enter Order ID (e.g. GoDoz-2026-882194) or phone number", "info");
    } else {
      alert("Please enter your Order ID (e.g. GoDoz-2026-882194) or registered WhatsApp phone number.");
    }
    return;
  }

  // Search orders saved in browser storage (both admin and client)
  let orders = [];
  try {
    const rawAdmin = localStorage.getItem('godoz_admin_orders');
    if (rawAdmin) orders = [...orders, ...JSON.parse(rawAdmin)];
    const rawClient = localStorage.getItem('godoz_orders');
    if (rawClient) orders = [...orders, ...JSON.parse(rawClient)];
  } catch (e) {
    orders = [];
  }

  // Find match by ID (supporting both GoDoz- and GDZ- formats), Phone, or Email
  let matchedOrder = orders.find(o => {
    if (!o) return false;
    const id = (o.id || '').toLowerCase();
    const normalizedId = id.replace('gdz-', 'godoz-');
    const phone = (o.clientPhone || '').toLowerCase();
    const email = (o.clientEmail || '').toLowerCase();
    return id.includes(query) || normalizedId.includes(normalizedQuery) || phone.includes(query) || email.includes(query);
  });

  if (matchedOrder) {
    if (notFoundBox) notFoundBox.style.display = 'none';
    if (resultBox) resultBox.style.display = 'block';

    const orderIdEl = document.getElementById('trackResultId');
    const projectEl = document.getElementById('trackResultProjectName');
    const clientEl = document.getElementById('trackResultClient');
    const statusBadge = document.getElementById('trackResultStatusBadge');
    const progressBar = document.getElementById('trackProgressBar');
    const waBtn = document.getElementById('trackWhatsappQueryBtn');

    if (orderIdEl) orderIdEl.textContent = `#${matchedOrder.id}`;
    if (projectEl) projectEl.textContent = matchedOrder.projectName || "Custom Project";
    if (clientEl) clientEl.innerHTML = `Client: <strong>${matchedOrder.clientName || 'Partner'}</strong> &bull; Value: <strong>₹${(matchedOrder.price || 9999).toLocaleString('en-IN')}</strong>`;
    
    // Progress calculation
    const progress = matchedOrder.progress || 35;
    if (progressBar) progressBar.style.width = `${progress}%`;

    // Update stepper circles
    const step1 = document.getElementById('trackStep1');
    const step2 = document.getElementById('trackStep2');
    const step3 = document.getElementById('trackStep3');
    const step4 = document.getElementById('trackStep4');

    [step1, step2, step3, step4].forEach(s => {
      if (s) { s.className = 'track-step-item'; }
    });

    if (progress <= 25) {
      step1?.classList.add('active');
    } else if (progress <= 50) {
      step1?.classList.add('completed');
      step2?.classList.add('active');
    } else if (progress <= 80) {
      step1?.classList.add('completed');
      step2?.classList.add('completed');
      step3?.classList.add('active');
    } else {
      step1?.classList.add('completed');
      step2?.classList.add('completed');
      step3?.classList.add('completed');
      step4?.classList.add('active');
    }

    if (statusBadge) {
      statusBadge.textContent = matchedOrder.stage || 'Active Development';
    }

    if (waBtn) {
      const waMsg = `Hello RS GULSHAN PRAJAPATI Sir! I am inquiring about my live project Order *#${matchedOrder.id}* (${matchedOrder.projectName}). Current Stage: ${matchedOrder.stage || 'In Progress'}. Please share the latest build update!`;
      waBtn.href = `https://wa.me/919288521731?text=${encodeURIComponent(waMsg)}`;
    }
  } else {
    if (resultBox) resultBox.style.display = 'none';
    if (notFoundBox) notFoundBox.style.display = 'block';
  }
};

/* ==========================================================================
   13. Direct Print Company Brochure (A4 PDF) Helper
   ========================================================================== */
window.printCompanyBrochure = function() {
  window.print();
};

/* ==========================================================================
   14. Instant AI & Google Search Launcher
   ========================================================================== */
window.searchExternal = function(engine) {
  const input = document.getElementById('globalSearchInput');
  const query = encodeURIComponent(input && input.value.trim() ? input.value.trim() : 'GoDoz Technology RS GULSHAN PRAJAPATI');
  
  let targetUrl = '';
  switch (engine) {
    case 'google':
      targetUrl = `https://www.google.com/search?q=${query}`;
      break;
    case 'gemini':
      targetUrl = `https://gemini.google.com/app?q=${query}`;
      break;
    case 'chatgpt':
      targetUrl = `https://chatgpt.com/?q=${query}`;
      break;
    case 'perplexity':
      targetUrl = `https://www.perplexity.ai/search?q=${query}`;
      break;
    case 'deepseek':
      targetUrl = `https://chat.deepseek.com/`;
      break;
    default:
      targetUrl = `https://www.google.com/search?q=${query}`;
  }

  if (targetUrl) {
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  }
};

/* ==========================================================================
   15. Unified Left Navigation Menu & Mobile Drawer Controller
   ========================================================================== */
window.openLeftNav = window.openMobileDrawer = function() {
  const sidebar = document.getElementById('appSidebar');
  const drawer = document.getElementById('mobileNavDrawer');
  const backdrop = document.getElementById('mobileNavBackdrop');
  
  if (window.innerWidth <= 1080) {
    if (sidebar) sidebar.classList.add('open');
    if (drawer) drawer.classList.add('open');
    if (backdrop) backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  } else {
    if (sidebar) sidebar.classList.remove('collapsed');
  }
};

window.closeLeftNav = window.closeMobileDrawer = function() {
  const sidebar = document.getElementById('appSidebar');
  const drawer = document.getElementById('mobileNavDrawer');
  const backdrop = document.getElementById('mobileNavBackdrop');
  
  if (sidebar) sidebar.classList.remove('open');
  if (drawer) drawer.classList.remove('open');
  if (backdrop) backdrop.classList.remove('open');
  document.body.style.overflow = '';
};

window.toggleLeftNav = window.toggleMobileDrawer = function() {
  const sidebar = document.getElementById('appSidebar');
  const drawer = document.getElementById('mobileNavDrawer');
  
  if (window.innerWidth <= 1080) {
    const isOpen = (sidebar && sidebar.classList.contains('open')) || (drawer && drawer.classList.contains('open'));
    if (isOpen) {
      window.closeMobileDrawer();
    } else {
      window.openMobileDrawer();
    }
  } else {
    if (sidebar) {
      sidebar.classList.toggle('collapsed');
    }
  }
};

function initMobileMenu() {
  // Coordinated through master controller
}

function initAppSidebar() {
  const toggleBtn = document.getElementById('mobileMenuToggle');
  const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
  const drawerCloseBtn = document.getElementById('drawerCloseBtn');
  const backdrop = document.getElementById('mobileNavBackdrop');

  if (toggleBtn) {
    toggleBtn.onclick = function(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      window.toggleMobileDrawer();
    };
  }

  if (sidebarCloseBtn) {
    sidebarCloseBtn.onclick = function(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      window.closeMobileDrawer();
    };
  }

  if (drawerCloseBtn) {
    drawerCloseBtn.onclick = function(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      window.closeMobileDrawer();
    };
  }

  if (backdrop) {
    backdrop.onclick = function() {
      window.closeMobileDrawer();
    };
  }

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.closeMobileDrawer();
    }
  });

  // Smooth scroll and active state highlight on click for sidebar & drawer items
  const menuLinks = document.querySelectorAll('.app-menu-item[href^="#"], .drawer-nav-item[href^="#"]');
  menuLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#' || targetId.startsWith('#!')) return;
      
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        
        // Update active class
        document.querySelectorAll('.app-menu-item, .drawer-nav-item').forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        // Scroll smoothly to section accounting for navbar height
        const headerOffset = 70;
        const elementPosition = targetEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: 'smooth'
        });

        // Close on mobile
        if (window.innerWidth <= 1080) {
          setTimeout(() => {
            window.closeMobileDrawer();
          }, 150);
        }
      }
    });
  });

  // ScrollSpy: auto highlight matching sidebar item based on scroll position
  let scrollThrottle = false;
  window.addEventListener('scroll', () => {
    if (scrollThrottle) return;
    scrollThrottle = true;
    setTimeout(() => { scrollThrottle = false; }, 60);

    const scrollPos = window.scrollY + 160;
    const sections = document.querySelectorAll('section[id], footer[id], header[id]');
    
    let activeSectionId = '';
    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        activeSectionId = sec.getAttribute('id');
      }
    });

    if (activeSectionId) {
      document.querySelectorAll('.app-menu-item[href^="#"]').forEach(item => {
        if (item.getAttribute('href') === `#${activeSectionId}`) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
    }
  }, { passive: true });
}

/* ==========================================================================
   14. Dynamic Auth Navigation Sync (Login <-> Logout Menu Switcher)
   ========================================================================== */
function getGoDozPathPrefix() {
  try {
    const currentUrl = new URL(window.location.href);
    if (currentUrl.protocol === 'file:') {
      const path = (window.location.pathname || '').replace(/\\/g, '/');
      if (path.includes('/help/account/') || path.includes('/help/faq/') || path.includes('/help/payment/')) {
        return '../../';
      }
      if (path.includes('/apps/') || path.includes('/help/')) {
        return '../';
      }
      return './';
    }
  } catch(e) {}
  return '/';
}

function initAuthNavSync() {
  const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 Days Session Timeout
  const authTimestamp = parseInt(localStorage.getItem('godoz_auth_timestamp') || '0', 10);
  const now = Date.now();

  let isLoggedIn = localStorage.getItem('godoz_auth_logged_in') === 'true';

  // Invalidate stale local sessions after 7 days of inactivity
  if (isLoggedIn && authTimestamp && (now - authTimestamp > SESSION_MAX_AGE_MS)) {
    try {
      localStorage.setItem('godoz_auth_logged_in', 'false');
      localStorage.removeItem('godoz_auth_uid');
      localStorage.removeItem('godoz_auth_email');
      localStorage.removeItem('godoz_auth_name');
      localStorage.removeItem('godoz_user_avatar');
      localStorage.removeItem('godoz_user_role');
      localStorage.removeItem('godoz_admin_role');
      localStorage.removeItem('godoz_auth_timestamp');
    } catch(e) {}
    isLoggedIn = false;
  }

  const name = localStorage.getItem('godoz_auth_name') || '';
  const email = localStorage.getItem('godoz_auth_email') || '';
  const photo = localStorage.getItem('godoz_user_avatar') || '';
  const role = localStorage.getItem('godoz_user_role') || localStorage.getItem('godoz_admin_role') || 'client';

  window.updateNavAuthStatus(isLoggedIn, {
    displayName: name,
    email: email,
    photoURL: photo,
    role: role
  });
}

window.updateNavAuthStatus = function(isLoggedIn, userData = {}) {
  const prefix = getGoDozPathPrefix();
  const userRole = userData.role || localStorage.getItem('godoz_user_role') || localStorage.getItem('godoz_admin_role') || 'client';
  const isManager = userRole === 'manager';
  const isAdmin = userRole === 'admin' || isManager;
  const userName = userData.displayName || (userData.email ? userData.email.split('@')[0] : 'User');

  // 1. Update Mobile Navigation Drawer Links
  const drawerLinks = document.querySelectorAll('#drawerAuthNavItem, #mobileAuthLink, .drawer-auth-item, .drawer-auth-link, .mobile-nav-drawer a[href*="login"], #mobileNavDrawer a[href*="login"]');
  drawerLinks.forEach(link => {
    if (isLoggedIn) {
      link.dataset.authState = 'logged-in';
      link.href = 'javascript:void(0);';
      link.onclick = function(e) {
        e.preventDefault();
        if (typeof window.closeMobileDrawer === 'function') window.closeMobileDrawer();
        if (typeof window.closeLeftNav === 'function') window.closeLeftNav();
        window.logoutGoDozUser();
      };
      link.innerHTML = `
        <span style="display:flex; align-items:center; gap:10px;">
          <i class="fa-solid fa-right-from-bracket" style="color:#ef4444; width:20px; font-size:1.05rem;"></i>
          <span style="color:#ef4444; font-weight:700;">Logout (${isManager ? 'Manager' : (isAdmin ? 'Admin' : 'Client')})</span>
        </span>
        <span style="font-size:0.72rem; color:#ef4444; font-weight:700; background:rgba(239,68,68,0.12); padding:2px 8px; border-radius:6px;">Sign Out</span>
      `;
      link.setAttribute('title', 'Sign out of your GoDoz account');
    } else {
      link.dataset.authState = 'logged-out';
      link.href = prefix + 'login.html';
      link.onclick = function() {
        if (typeof window.closeMobileDrawer === 'function') window.closeMobileDrawer();
        if (typeof window.closeLeftNav === 'function') window.closeLeftNav();
      };
      link.innerHTML = `
        <span style="display:flex; align-items:center; gap:10px;">
          <i class="fa-solid fa-right-to-bracket" style="color:#0ea5e9; width:20px; font-size:1.05rem;"></i>
          <span>Login / Register</span>
        </span>
        <i class="fa-solid fa-chevron-right" style="font-size:0.75rem; color:var(--text-muted);"></i>
      `;
      link.setAttribute('title', 'Login or Create an Account');
    }
  });

  // 2. Update Desktop Sidebar Menu Link (e.g., in index.html)
  const sidebarAuthLinks = document.querySelectorAll('#sidebarAuthLink, .app-sidebar a[href*="login"], .sidebar a[href*="login"]');
  sidebarAuthLinks.forEach(link => {
    if (isLoggedIn) {
      link.dataset.authState = 'logged-in';
      link.href = 'javascript:void(0);';
      link.onclick = function(e) {
        e.preventDefault();
        window.logoutGoDozUser();
      };
      link.innerHTML = `
        <div class="app-menu-left">
          <i class="fa-solid fa-right-from-bracket app-menu-icon" style="color:#ef4444;"></i>
          <span class="app-menu-text" style="color:#ef4444; font-weight:700;">Logout</span>
        </div>
      `;
      link.setAttribute('title', `Logged in as ${userName} (${userRole}) - Click to Logout`);
    } else {
      link.dataset.authState = 'logged-out';
      link.href = prefix + 'login.html';
      link.onclick = null;
      link.innerHTML = `
        <div class="app-menu-left">
          <i class="fa-solid fa-user-circle app-menu-icon" style="color:var(--primary);"></i>
          <span class="app-menu-text">Client Portal / Login</span>
        </div>
      `;
      link.setAttribute('title', 'Client Portal & Login');
    }
  });

  // 3. Update Header Auth / Profile Button (Navbar Action Buttons)
  const headerAuthButtons = document.querySelectorAll('#headerAuthBtn, .header-btn-auth, .header-auth-btn');
  headerAuthButtons.forEach(btn => {
    if (isLoggedIn) {
      btn.dataset.authState = 'logged-in';
      btn.onclick = null;

      const avatarPhoto = userData.photoURL || localStorage.getItem('godoz_user_avatar');
      
      if (isManager) {
        btn.href = prefix + 'admin.html';
        btn.innerHTML = `<i class="fa-solid fa-crown" style="color:#7c3aed; font-size:1rem;"></i> <span class="btn-text" style="font-weight:800; color:#7c3aed;">Manager Hub</span>`;
        btn.setAttribute('title', `Master Manager (${userName}) - Click to open Management Hub`);
        btn.style.borderColor = '#7c3aed';
        btn.style.background = 'rgba(124, 58, 237, 0.12)';
      } else if (isAdmin) {
        btn.href = prefix + 'admin.html';
        btn.innerHTML = `<i class="fa-solid fa-shield-halved" style="color:#d97706; font-size:1rem;"></i> <span class="btn-text" style="font-weight:800; color:#d97706;">Admin Hub</span>`;
        btn.setAttribute('title', `Support Admin (${userName}) - Click to open Admin Panel`);
        btn.style.borderColor = '#d97706';
        btn.style.background = 'rgba(217, 119, 6, 0.12)';
      } else {
        btn.href = prefix + 'profile.html';
        if (avatarPhoto && avatarPhoto.startsWith('http')) {
          btn.innerHTML = `<img src="${avatarPhoto}" alt="Profile" style="width:20px; height:20px; border-radius:50%; object-fit:cover; margin-right:4px; vertical-align:middle;"> <span class="btn-text" style="font-weight:800;">Profile</span>`;
        } else {
          btn.innerHTML = `<i class="fa-solid fa-user-circle" style="color:var(--primary); font-size:1.05rem;"></i> <span class="btn-text" style="font-weight:800;">Profile</span>`;
        }
        btn.setAttribute('title', `Logged in as ${userName} - Click to open Client Dashboard`);
        btn.style.borderColor = 'var(--primary)';
        btn.style.background = 'rgba(18, 102, 232, 0.08)';
      }
    } else {
      btn.dataset.authState = 'logged-out';
      btn.href = prefix + 'login.html';
      btn.onclick = null;
      btn.innerHTML = `<i class="fa-solid fa-user"></i> <span class="btn-text">Login</span>`;
      btn.setAttribute('title', 'Client Portal & Login');
      btn.style.borderColor = '';
      btn.style.background = '';
    }
  });

  // 4. Update specific text/icon nodes if present
  const mobileAuthText = document.getElementById('mobileAuthText');
  if (mobileAuthText) {
    mobileAuthText.textContent = isLoggedIn ? `Logout (${userRole})` : 'Client Portal / Login';
  }
  const headerAuthText = document.getElementById('headerAuthText');
  if (headerAuthText) {
    headerAuthText.textContent = isLoggedIn ? (isManager ? 'Manager' : (isAdmin ? 'Admin' : 'Profile')) : 'Login';
  }
  const headerAuthIcon = document.getElementById('headerAuthIcon');
  if (headerAuthIcon) {
    const avatarPhoto = userData.photoURL || localStorage.getItem('godoz_user_avatar');
    if (isLoggedIn) {
      if (isManager) {
        headerAuthIcon.innerHTML = `<i class="fa-solid fa-crown" style="color:#7c3aed;"></i>`;
      } else if (isAdmin) {
        headerAuthIcon.innerHTML = `<i class="fa-solid fa-shield-halved" style="color:#d97706;"></i>`;
      } else if (avatarPhoto && avatarPhoto.startsWith('http')) {
        headerAuthIcon.innerHTML = `<img src="${avatarPhoto}" alt="Avatar" style="width:18px; height:18px; border-radius:50%; object-fit:cover;">`;
      } else {
        headerAuthIcon.innerHTML = `<i class="fa-solid fa-user-circle" style="color:var(--primary);"></i>`;
      }
    } else {
      headerAuthIcon.innerHTML = `<i class="fa-solid fa-user"></i>`;
    }
  }

  // 5. Hide / Unhide Admin Hub options across all menus & sidebars based on Admin role
  const shouldShowAdmin = isLoggedIn && isAdmin;
  const adminElements = document.querySelectorAll('a[href*="admin.html"], a[href*="/admin"], #btnSidebarAdminHub, #adminBannerLink, #adminQuickNav, .admin-only-item');
  adminElements.forEach(el => {
    const parentLi = el.closest('li');
    if (parentLi && parentLi.querySelector('a[href*="admin"]')) {
      parentLi.style.display = shouldShowAdmin ? '' : 'none';
    }
    el.style.display = shouldShowAdmin ? '' : 'none';
  });
};

window.logoutGoDozUser = async function() {
  const confirmed = confirm("क्या आप GoDoz अकाउंट से लॉगआउट करना चाहते हैं?\n(Are you sure you want to log out?)");
  if (!confirmed) return;

  try {
    if (window.GoDozFirebase && typeof window.GoDozFirebase.logoutUser === 'function') {
      await window.GoDozFirebase.logoutUser();
    } else if (typeof window.logoutUser === 'function') {
      await window.logoutUser();
    }
  } catch (err) {
    console.warn("GoDoz Auth signout notice:", err);
  }

  // Clear local auth cache
  try {
    localStorage.setItem('godoz_auth_logged_in', 'false');
    localStorage.removeItem('godoz_auth_uid');
    localStorage.removeItem('godoz_auth_email');
    localStorage.removeItem('godoz_auth_name');
    localStorage.removeItem('godoz_user_avatar');
    localStorage.removeItem('godoz_orders_cache');
    localStorage.removeItem('godoz_user_role');
  } catch(e) {}

  // Instantly update UI
  window.updateNavAuthStatus(false);

  // Check if current page is protected (profile.html / admin.html)
    // Check if current page is protected (profile.html / admin.html)
  const currentPath = window.location.pathname.toLowerCase();
  const prefix = getGoDozPathPrefix();
  if (currentPath.includes('profile') || currentPath.includes('admin')) {
    window.location.href = prefix + 'login.html';
  } else {
    alert("आप सफलतापूर्वक लॉगआउट हो चुके हैं। (You have been signed out.)");
    // If on login page, refresh or show login view
    if (currentPath.includes('login')) {
      window.location.reload();
    }
  }
};

/* ==========================================================================
   16. GoDoz Seamless Turbo SPA Navigation Engine (Zero-Flicker Content Swapping)
   ========================================================================== */
const pjaxCache = new Map();

function getGoDozRootUrl() {
  const currentUrl = new URL(window.location.href);

  // File protocol support
  if (currentUrl.protocol === 'file:') {
    const fullPath = window.location.pathname.replace(/\\/g, '/');
    const webIndex = fullPath.toLowerCase().indexOf('/web/');
    if (webIndex !== -1) {
      return 'file://' + fullPath.substring(0, webIndex + 5);
    }
    const parts = fullPath.split('/');
    parts.pop();
    while (parts.length > 0 && ['help', 'apps', 'account', 'faq', 'payment', 'profile', 'admin', 'login', 'about'].includes(parts[parts.length - 1])) {
      parts.pop();
    }
    return 'file://' + parts.join('/') + '/';
  }

  // Web server (godoz.in, localhost, etc.): Site root is ALWAYS origin + '/'
  return currentUrl.origin + '/';
}

function resolveGoDozUrl(rawHref) {
  if (!rawHref) return '';
  const rootUrl = getGoDozRootUrl();

  let clean = rawHref.trim();

  // Hash-only links
  if (clean.startsWith('#')) {
    return clean;
  }

  // Separate hash
  let hash = '';
  const hashIdx = clean.indexOf('#');
  if (hashIdx !== -1) {
    hash = clean.substring(hashIdx);
    clean = clean.substring(0, hashIdx);
  }

  // Ignore external / special protocols
  if (/^(mailto:|tel:|https?:\/\/wa\.me|javascript:)/i.test(clean)) {
    return rawHref;
  }

  // If already absolute URL
  if (/^[a-zA-Z]+:\/\//.test(clean)) {
    try {
      const parsed = new URL(clean);
      if (parsed.origin !== window.location.origin) {
        return clean + hash;
      }
      clean = parsed.pathname;
    } catch(e) {
      return clean + hash;
    }
  }

  // Remove leading relative prefixes ../, ./, /
  clean = clean.replace(/^(\.\.\/)+/, '').replace(/^(\.\/)+/, '').replace(/^\//, '');

  // Strip accidental/duplicate leading page or folder prefixes
  clean = clean.replace(/^(profile\/)+/i, '')
               .replace(/^(admin\/)+/i, '')
               .replace(/^(login\/)+/i, '')
               .replace(/^(about\/)+/i, '')
               .replace(/^(help\/)+/i, 'help/')
               .replace(/^(apps\/)+/i, 'apps/');

  // Canonical mappings
  if (clean === '' || clean === 'index.html' || (clean.endsWith('/index.html') && !clean.includes('/'))) {
    return new URL('index.html' + hash, rootUrl).href;
  }
  if (clean.includes('help/account')) {
    return new URL('help/account.html' + hash, rootUrl).href;
  }
  if (clean.includes('help/faq')) {
    return new URL('help/faq.html' + hash, rootUrl).href;
  }
  if (clean.includes('help/payment')) {
    return new URL('help/payment.html' + hash, rootUrl).href;
  }
  if (clean === 'help' || clean === 'help/' || clean === 'help/index.html') {
    return new URL('help/index.html' + hash, rootUrl).href;
  }
  if (clean === 'apps' || clean === 'apps/' || clean === 'apps/index.html') {
    return new URL('apps/index.html' + hash, rootUrl).href;
  }

  // Top level known pages
  const rootPages = [
    'About.html', 'feedback.html', 'login.html', 'profile.html', 
    'admin.html', 'terms.html', 'privacy-policy.html', 'GoDoz_About.html', 
    'RS_GULSHAN_PRAJAPATI_About.html', 'payment-success.html', '404.html'
  ];

  for (const p of rootPages) {
    if (clean.toLowerCase().endsWith(p.toLowerCase())) {
      return new URL(p + hash, rootUrl).href;
    }
  }

  return new URL(clean + hash, rootUrl).href;
}

function initHelpSearchFilter() {
  const helpSearchInput = document.getElementById('helpSearchInput');
  const helpCards = document.querySelectorAll('.help-card');
  if (!helpSearchInput) return;

  helpSearchInput.oninput = function(e) {
    const q = e.target.value.toLowerCase().trim();

    helpCards.forEach(card => {
      const text = card.textContent.toLowerCase();
      card.style.display = (!q || text.includes(q)) ? 'flex' : 'none';
    });

    document.querySelectorAll('#faqAccordionContainer .faq-category-card').forEach(cat => {
      let matchCount = 0;
      cat.querySelectorAll('details').forEach(d => {
        const text = d.textContent.toLowerCase();
        if (!q || text.includes(q)) {
          d.style.display = 'block';
          if (q) d.open = true;
          matchCount++;
        } else {
          d.style.display = 'none';
        }
      });
      cat.style.display = (!q || matchCount > 0) ? 'block' : 'none';
    });
  };
}

function initSeamlessNavigation() {
  // 1. Ensure Top Progress Bar Element Exists
  let progressBar = document.getElementById('pjaxProgressBar');
  if (!progressBar) {
    progressBar = document.createElement('div');
    progressBar.id = 'pjaxProgressBar';
    document.body.appendChild(progressBar);
  }

  // 2. Global Delegated Click Interceptor for Instant Seamless Navigation
  document.addEventListener('click', (e) => {
    // Find closest anchor tag
    const link = e.target.closest('a');
    if (!link) return;

    // Ignore links that should open externally or perform specific actions
    const rawHref = link.getAttribute('href');
    if (!rawHref || rawHref === '#' || rawHref.startsWith('javascript:') || link.target === '_blank' || link.hasAttribute('download') || link.rel === 'external' || rawHref.startsWith('mailto:') || rawHref.startsWith('tel:') || rawHref.startsWith('https://wa.me')) {
      return;
    }

    const resolvedUrlString = resolveGoDozUrl(rawHref);
    if (!resolvedUrlString) return;

    let targetUrl;
    try {
      targetUrl = new URL(resolvedUrlString, window.location.href);
    } catch (err) {
      return;
    }

    const currentUrl = new URL(window.location.href);

    // Only intercept same-origin links
    if (targetUrl.origin !== currentUrl.origin) {
      return;
    }

    // Special bypass for standalone interactive modules (Profile, Admin, Login, Payment-Success)
    // These modules require dedicated Firebase Auth & Firestore lifecycle initialization
    const targetPath = targetUrl.pathname.toLowerCase();
    const currentPath = currentUrl.pathname.toLowerCase();
    const standaloneModules = ['admin', 'profile', 'login', 'payment-success', '/apps/localwork', '/apps/smart-tools-app', '/apps/mynotepad', '/apps/smart-pdf-viewer', '/apps/fruits-crush', '/apps/photo-to-pdf-lite', '/apps/bhulekh'];

    const isTargetStandalone = standaloneModules.some(m => targetPath.includes(m));
    const isCurrentStandalone = standaloneModules.some(m => currentPath.includes(m));

    if (isTargetStandalone || isCurrentStandalone) {
      const isProfileOrAdmin = targetPath.includes('profile') || targetPath.includes('admin');
      const isLoggedIn = localStorage.getItem('godoz_auth_logged_in') === 'true';

      if (isProfileOrAdmin && !isLoggedIn) {
        e.preventDefault();
        if (typeof window.closeMobileDrawer === 'function') window.closeMobileDrawer();
        if (typeof window.closeLeftNav === 'function') window.closeLeftNav();
        alert("कृपया अपने प्रोडक्ट्स व क्लाइंट डैशबोर्ड देखने के लिए पहले लॉगिन करें।\n(Please login first to access your products & dashboard.)");
        window.location.href = resolveGoDozUrl('login.html');
        return;
      }

      // Check same page hash navigation if already on profile or admin
      const cleanTargetPath = targetPath.replace(/\/index\.html$/, '').replace(/\/$/, '');
      const cleanCurrentPath = currentPath.replace(/\/index\.html$/, '').replace(/\/$/, '');
      if (cleanTargetPath === cleanCurrentPath && targetUrl.hash) {
        e.preventDefault();
        if (typeof window.closeMobileDrawer === 'function') window.closeMobileDrawer();
        if (typeof window.closeLeftNav === 'function') window.closeLeftNav();

        if (cleanCurrentPath.includes('profile')) {
          const tabName = targetUrl.hash.replace('#', '');
          const tabBtn = document.querySelector(`.profile-tab-btn[data-tab="${tabName}"]`);
          if (tabBtn) tabBtn.click();
        }
        const targetElement = document.querySelector(targetUrl.hash);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
          history.pushState(null, '', targetUrl.hash);
        }
        return;
      }

      // Allow browser native direct navigation for standalone modules
      return;
    }

    // Case A: Anchor hash link or same page navigation
    const cleanTargetPath = targetUrl.pathname.replace(/\/index\.html$/, '').replace(/\/$/, '');
    const cleanCurrentPath = currentUrl.pathname.replace(/\/index\.html$/, '').replace(/\/$/, '');
    const isSamePagePath = (cleanTargetPath === cleanCurrentPath);

    if (isSamePagePath) {
      e.preventDefault();
      if (typeof window.closeMobileDrawer === 'function') {
        window.closeMobileDrawer();
      }
      if (typeof window.closeLeftNav === 'function') {
        window.closeLeftNav();
      }
      if (targetUrl.hash) {
        // If on profile page, switch tab directly
        if (cleanCurrentPath.includes('profile')) {
          const tabName = targetUrl.hash.replace('#', '');
          const tabBtn = document.querySelector(`.profile-tab-btn[data-tab="${tabName}"]`);
          if (tabBtn) tabBtn.click();
        }
        const targetElement = document.querySelector(targetUrl.hash);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
          history.pushState(null, '', targetUrl.hash);
          updateNavActiveStates(targetUrl.hash);
        }
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    // Case B: Cross-page Seamless PJAX content loading
    e.preventDefault();
    if (typeof window.closeMobileDrawer === 'function') {
      window.closeMobileDrawer();
    }
    if (typeof window.closeLeftNav === 'function') {
      window.closeLeftNav();
    }

    window.loadPageSeamless(targetUrl.href, true);

  });

  // 3. Hover & Touchstart Instant Prefetching (0ms Instant Loading)
  document.addEventListener('mouseover', handleLinkPrefetch, { passive: true });
  document.addEventListener('touchstart', handleLinkPrefetch, { passive: true });

  function handleLinkPrefetch(e) {
    const link = e.target.closest('a');
    if (!link) return;
    const rawHref = link.getAttribute('href');
    if (!rawHref || rawHref.startsWith('#') || rawHref.startsWith('javascript:') || link.target === '_blank' || rawHref.startsWith('mailto:') || rawHref.startsWith('tel:') || rawHref.startsWith('https://wa.me')) return;

    try {
      const resolved = resolveGoDozUrl(rawHref);
      const url = new URL(resolved, window.location.href);
      if (url.origin === window.location.origin && !url.pathname.includes('admin') && !pjaxCache.has(url.href)) {
        fetch(url.href, { cache: 'force-cache' })
          .then(res => res.text())
          .then(html => pjaxCache.set(url.href, html))
          .catch(() => {});
      }
    } catch(err) {}
  }

  // 4. Browser History (Back / Forward) Listener
  window.addEventListener('popstate', () => {
    window.loadPageSeamless(window.location.href, false);
  });
}

function updateNavActiveStates(currentHref) {
  try {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();

    // Desktop nav menu
    document.querySelectorAll('.desktop-nav-link').forEach(link => {
      const linkHref = (link.getAttribute('href') || '').toLowerCase();
      if (hash && linkHref.includes(hash)) {
        link.classList.add('active');
      } else if (!hash && (linkHref.includes(path) || (path.endsWith('/') && linkHref.includes('index.html')))) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Drawer nav items
    document.querySelectorAll('.drawer-nav-item, .app-menu-item').forEach(link => {
      const linkHref = (link.getAttribute('href') || '').toLowerCase();
      if (hash && linkHref.includes(hash)) {
        link.classList.add('active');
      } else if (!hash && (linkHref.includes(path) || (path.endsWith('/') && linkHref.includes('index.html')))) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Mobile bottom nav items
    document.querySelectorAll('.mobile-bottom-item').forEach(link => {
      const linkHref = (link.getAttribute('href') || '').toLowerCase();
      if (hash && linkHref.includes(hash)) {
        link.classList.add('active');
      } else if (!hash && (linkHref.includes(path) || (path.endsWith('/') && linkHref.includes('index.html')))) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  } catch (e) {}
}

window.loadPageSeamless = async function(url, pushState = true) {
  const resolvedUrl = resolveGoDozUrl(url);
  const progressBar = document.getElementById('pjaxProgressBar');
  if (progressBar) {
    progressBar.classList.add('active');
    progressBar.style.width = '30%';
  }

  const currentMain = document.querySelector('.app-main-content') || document.querySelector('main');
  if (currentMain) {
    currentMain.classList.add('content-transitioning');
  }

  try {
    let htmlText = pjaxCache.get(resolvedUrl);
    if (!htmlText) {
      if (progressBar) progressBar.style.width = '65%';
      const res = await fetch(resolvedUrl, { headers: { 'X-Requested-With': 'GoDoz-PJAX' } });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      htmlText = await res.text();
      pjaxCache.set(resolvedUrl, htmlText);
    }

    if (progressBar) progressBar.style.width = '90%';

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');

    // Check if doc is a redirect meta page (like help.html)
    const metaRefresh = doc.querySelector('meta[http-equiv="refresh"]');
    if (metaRefresh) {
      const content = metaRefresh.getAttribute('content') || '';
      const match = content.match(/url=(.+)/i);
      if (match && match[1]) {
        const redirectTarget = resolveGoDozUrl(match[1].trim());
        if (redirectTarget && redirectTarget !== resolvedUrl) {
          return window.loadPageSeamless(redirectTarget, pushState);
        }
      }
    }

    // 1. Update Page Title
    if (doc.title) {
      document.title = doc.title;
    }

    // 2. Locate Target Main Content
    let newMain = doc.querySelector('.app-main-content') || doc.querySelector('main');
    if (!newMain) {
      const container = doc.querySelector('.container') || doc.body;
      if (container) newMain = container;
    }

    if (newMain && currentMain) {
      currentMain.innerHTML = newMain.innerHTML;
      if (newMain.className && newMain.tagName.toLowerCase() === 'main') {
        currentMain.className = newMain.className;
      }
    } else {
      window.location.href = resolvedUrl;
      return;
    }

    // 3. Execute any new inline scripts inside swapped main container
    const scripts = currentMain.querySelectorAll('script');
    scripts.forEach(oldScript => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
      newScript.textContent = oldScript.textContent;
      oldScript.parentNode.replaceChild(newScript, oldScript);
    });

    // 4. Update URL in Browser Address Bar
    if (pushState) {
      history.pushState({ path: resolvedUrl }, '', resolvedUrl);
    }

    // 5. Scroll to top or anchor hash
    const targetHash = new URL(resolvedUrl, window.location.href).hash;
    if (targetHash) {
      const hashEl = document.querySelector(targetHash);
      if (hashEl) {
        hashEl.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // 6. Re-hydrate interactive components
    if (typeof initHelpSearchFilter === 'function') initHelpSearchFilter();
    if (typeof initSearch === 'function') initSearch();
    if (typeof initEstimator === 'function') initEstimator();
    if (typeof initTools === 'function') initTools();
    if (typeof initFaq === 'function') initFaq();
    if (typeof initBackToTop === 'function') initBackToTop();
    if (typeof initAuthNavSync === 'function') initAuthNavSync();
    if (typeof window.autoFillUserInputs === 'function') window.autoFillUserInputs();
    updateNavActiveStates(resolvedUrl);

  } catch (err) {
    console.warn("Seamless navigation fallback:", err);
    window.location.href = resolvedUrl;
  } finally {
    if (currentMain) {
      currentMain.classList.remove('content-transitioning');
    }
    if (progressBar) {
      progressBar.style.width = '100%';
      setTimeout(() => {
        progressBar.classList.remove('active');
        progressBar.style.width = '0%';
      }, 300);
    }
  }
};


