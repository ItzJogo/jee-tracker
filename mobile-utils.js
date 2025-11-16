// -------------------------------------------------------------
// MOBILE-UTILS.JS — Mobile Optimization Utilities
// -------------------------------------------------------------
// Fixes for mobile viewport height, keyboard overlay, and touch interactions

// -------------------------------------------------------------
// 1. FIX: 100vh on Mobile (Android/iOS)
// -------------------------------------------------------------
// Mobile browsers have a dynamic viewport height due to address bars.
// This function sets a CSS custom property that updates on resize.

export function initViewportHeightFix() {
  function setVh() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }
  
  // Set on load
  setVh();
  
  // Update on resize (including orientation change)
  window.addEventListener('resize', setVh);
  window.addEventListener('orientationchange', setVh);
  
  // Extra check after a short delay (for address bar animations)
  setTimeout(setVh, 100);
}

// -------------------------------------------------------------
// 2. FIX: Keyboard Overlay (ScrollIntoView on Input Focus)
// -------------------------------------------------------------
// When mobile keyboard appears, ensure focused input is visible

export function initKeyboardOverlayFix() {
  const inputElements = ['input', 'textarea', 'select'];
  
  inputElements.forEach(selector => {
    document.addEventListener('focus', (e) => {
      if (e.target.matches(selector)) {
        // Small delay to ensure keyboard is shown
        setTimeout(() => {
          e.target.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
        }, 300);
      }
    }, true); // Use capture phase
  });
  
  // Also handle when input becomes visible in modals
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
        const target = mutation.target;
        if (target.classList.contains('modal') && target.style.display === 'flex') {
          // Modal opened, focus first input
          const firstInput = target.querySelector('input, textarea');
          if (firstInput) {
            setTimeout(() => {
              firstInput.focus();
              firstInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
          }
        }
      }
    });
  });
  
  // Observe modal elements
  document.querySelectorAll('.modal').forEach(modal => {
    observer.observe(modal, { attributes: true });
  });
}

// -------------------------------------------------------------
// 3. ENHANCEMENT: Touch Target Size Validation
// -------------------------------------------------------------
// Ensure all interactive elements meet minimum touch target size (44x44px)

export function validateTouchTargets() {
  const minSize = 44; // px
  const interactiveSelectors = [
    'button',
    'a[href]',
    'input[type="button"]',
    'input[type="submit"]',
    'input[type="checkbox"]',
    'input[type="radio"]',
    '.btn',
    '.btn-fab'
  ];
  
  interactiveSelectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.width < minSize || rect.height < minSize) {
        // Add a pseudo-element to expand touch area
        el.style.position = 'relative';
        el.style.minWidth = `${minSize}px`;
        el.style.minHeight = `${minSize}px`;
        
        // For very small elements, add padding
        if (rect.width < minSize - 10 || rect.height < minSize - 10) {
          const currentPadding = parseFloat(getComputedStyle(el).padding) || 0;
          const neededPadding = Math.max(0, (minSize - Math.max(rect.width, rect.height)) / 2);
          el.style.padding = `${currentPadding + neededPadding}px`;
        }
      }
    });
  });
}

// -------------------------------------------------------------
// 4. ENHANCEMENT: Debounced Auto-save for Text Inputs
// -------------------------------------------------------------
// Prevent excessive localStorage writes while typing

export function createDebouncedAutosave(callback, delay = 1000) {
  let timeoutId;
  
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      callback.apply(this, args);
    }, delay);
  };
}

// -------------------------------------------------------------
// 5. FIX: Prevent Double-Tap Zoom on iOS
// -------------------------------------------------------------
// Prevent accidental zoom on double-tap for buttons

export function preventDoubleTapZoom() {
  let lastTouchEnd = 0;
  
  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  }, false);
}

// -------------------------------------------------------------
// 6. ENHANCEMENT: Active State for Touch Devices
// -------------------------------------------------------------
// Add active class on touch for better feedback

export function initTouchActiveStates() {
  const interactiveElements = document.querySelectorAll('button, .btn, a[href]');
  
  interactiveElements.forEach(el => {
    el.addEventListener('touchstart', () => {
      el.classList.add('touch-active');
    }, { passive: true });
    
    el.addEventListener('touchend', () => {
      setTimeout(() => {
        el.classList.remove('touch-active');
      }, 150);
    }, { passive: true });
    
    el.addEventListener('touchcancel', () => {
      el.classList.remove('touch-active');
    }, { passive: true });
  });
}

// -------------------------------------------------------------
// 7. UTILITY: Detect if Device is Mobile
// -------------------------------------------------------------

export function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export function isIOS() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}

// -------------------------------------------------------------
// 8. ENHANCEMENT: Safe Area Inset Detection
// -------------------------------------------------------------

export function hasSafeAreaInsets() {
  const testDiv = document.createElement('div');
  testDiv.style.paddingTop = 'env(safe-area-inset-top)';
  document.body.appendChild(testDiv);
  const hasSafeArea = getComputedStyle(testDiv).paddingTop !== '0px';
  document.body.removeChild(testDiv);
  return hasSafeArea;
}

// -------------------------------------------------------------
// MASTER INIT: Call all mobile optimizations
// -------------------------------------------------------------

export function initMobileOptimizations() {
  console.log('🔧 Initializing mobile optimizations...');
  
  // Core fixes
  initViewportHeightFix();
  initKeyboardOverlayFix();
  
  // Only run on mobile devices
  if (isMobileDevice()) {
    preventDoubleTapZoom();
    initTouchActiveStates();
    
    // Validate touch targets after DOM is fully loaded
    setTimeout(validateTouchTargets, 500);
  }
  
  // Log device info
  console.log(`📱 Device: ${isMobileDevice() ? 'Mobile' : 'Desktop'}`);
  console.log(`🍎 iOS: ${isIOS()}`);
  console.log(`🤖 Android: ${isAndroid()}`);
  console.log(`🔒 Safe Area: ${hasSafeAreaInsets()}`);
  
  console.log('✅ Mobile optimizations initialized');
}
