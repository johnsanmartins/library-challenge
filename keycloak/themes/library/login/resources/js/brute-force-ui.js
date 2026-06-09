(function () {
  var STORAGE_KEY = 'kc_bf_data';
  var MAX_ATTEMPTS = 3;
  var LOCKOUT_MS = 60000;

  function getData() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || { count: 0, lockedAt: null }; }
    catch (e) { return { count: 0, lockedAt: null }; }
  }
  function saveData(d) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); } catch (e) {} }
  function clearData() { try { localStorage.removeItem(STORAGE_KEY); } catch (e) {} }

  function getErrorElement() {
    return document.getElementById('input-error') ||
           document.querySelector('.pf-c-form__helper-text.pf-m-error') ||
           document.querySelector('.alert-error') ||
           document.querySelector('.pf-c-alert.pf-m-danger');
  }

  function showLockoutMessage(secondsLeft) {
    // Remove any previous banner
    var prev = document.getElementById('kc-bf-banner');
    if (prev) prev.remove();

    // Create prominent banner
    var banner = document.createElement('div');
    banner.id = 'kc-bf-banner';
    banner.style.cssText = [
      'background:#fff3cd',
      'border:2px solid #ffc107',
      'border-radius:6px',
      'padding:14px 18px',
      'margin:12px 0 8px 0',
      'color:#664d03',
      'font-size:14px',
      'line-height:1.6',
      'font-weight:500'
    ].join(';');
    banner.innerHTML =
      '&#9888; Su cuenta ha sido bloqueada temporalmente por demasiados intentos fallidos. ' +
      'Por favor espere <strong id="kc-bf-countdown">' + secondsLeft + '</strong> segundo(s) antes de intentarlo nuevamente.';

    // Insert before the form (or at top of body as fallback)
    var form = document.getElementById('kc-form-login') || document.querySelector('form');
    if (form && form.parentNode) {
      form.parentNode.insertBefore(banner, form);
    } else {
      var container = document.getElementById('kc-form') || document.querySelector('.login-pf-page') || document.body;
      container.insertBefore(banner, container.firstChild);
    }

    // Hide original error span so messages don't duplicate
    var errorEl = getErrorElement();
    if (errorEl) errorEl.style.display = 'none';

    // Disable submit button during lockout
    var submitBtn = document.getElementById('kc-login') || document.querySelector('[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.5';
      submitBtn.style.cursor = 'not-allowed';
    }

    // Live countdown
    var interval = setInterval(function () {
      secondsLeft--;
      var el = document.getElementById('kc-bf-countdown');
      if (el) el.textContent = secondsLeft;
      if (secondsLeft <= 0) {
        clearInterval(interval);
        clearData();
        var b = document.getElementById('kc-bf-banner');
        if (b) b.remove();
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.style.opacity = '';
          submitBtn.style.cursor = '';
        }
        if (errorEl) errorEl.style.display = '';
      }
    }, 1000);
  }

  window.addEventListener('DOMContentLoaded', function () {
    var data = getData();
    var now = Date.now();

    // Active lockout: show banner with remaining time
    if (data.lockedAt) {
      var elapsed = now - data.lockedAt;
      var remaining = Math.ceil((LOCKOUT_MS - elapsed) / 1000);
      if (remaining > 0) {
        showLockoutMessage(remaining);
        return;
      } else {
        clearData();
        data = { count: 0, lockedAt: null };
      }
    }

    // Check for error on page (= failed attempt)
    var errorEl = getErrorElement();
    var hasError = errorEl && (errorEl.textContent || '').trim().length > 0;

    if (hasError) {
      data.count = (data.count || 0) + 1;
      if (data.count >= MAX_ATTEMPTS) {
        data.lockedAt = now;
        saveData(data);
        showLockoutMessage(Math.ceil(LOCKOUT_MS / 1000));
      } else {
        saveData(data);
      }
    } else {
      clearData();
    }
  });
})();
