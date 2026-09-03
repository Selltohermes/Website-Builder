/* ==========================================================================
   Sell To Hermes: site behaviour
   Vanilla JS, no dependencies. Everything degrades gracefully without it.
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ config
     WHERE LEADS GO. Set ONE of these:

     1. Formspree  → FORM_ENDPOINT = 'https://formspree.io/f/xxxxxxxx'
     2. Netlify    → FORM_ENDPOINT = '/'  and add `netlify` + a hidden
                     form-name input to the <form> in index.html
     3. Your own API / Zapier / Make webhook → paste its URL

     Left empty, the form falls back to opening the visitor's mail client
     addressed to Hermes@Selltohermes.com so no lead is silently lost.
  --------------------------------------------------------------------------- */
  var FORM_ENDPOINT = '';
  var FALLBACK_EMAIL = 'Hermes@Selltohermes.com';
  var THANK_YOU_URL = 'thank-you.html';

  var $  = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ------------------------------------------------------------ current year */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ------------------------------------------------------- sticky header cue */
  var header = $('#header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-stuck', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ------------------------------------------------------------- mobile menu */
  var burger = $('#burger');
  var nav = $('#nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('is-open', !open);
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        burger.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        burger.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
        burger.focus();
      }
    });
  }

  /* ------------------------------------------------------------------- FAQ */
  $$('.faq__q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.faq__item');
      var open = btn.getAttribute('aria-expanded') === 'true';
      // Accordion: close siblings so the answer you want is never buried.
      $$('.faq__q').forEach(function (other) {
        if (other !== btn) {
          other.setAttribute('aria-expanded', 'false');
          other.closest('.faq__item').classList.remove('is-open');
        }
      });
      btn.setAttribute('aria-expanded', String(!open));
      item.classList.toggle('is-open', !open);
    });
  });

  /* -------------------------------------------------------- reveal on scroll */
  var revealables = $$('.reveal');
  if (revealables.length) {
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry, i) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          setTimeout(function () { el.classList.add('is-in'); }, i * 70);
          io.unobserve(el);
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
      revealables.forEach(function (el) { io.observe(el); });
    } else {
      revealables.forEach(function (el) { el.classList.add('is-in'); });
    }
  }

  /* ==========================================================================
     Multi-step offer form
     ========================================================================== */
  var form = $('#offerForm');
  if (!form) return;

  var steps = $$('.step', form);
  var alertBox = $('#formAlert');
  var stepLabel = $('#stepLabel');
  var submitBtn = $('#submitBtn');
  var current = 1;
  var TOTAL = steps.length;

  function showStep(n) {
    current = n;
    steps.forEach(function (s) {
      s.classList.toggle('is-active', Number(s.dataset.step) === n);
    });
    $$('.progress__step').forEach(function (bar) {
      bar.classList.toggle('is-done', Number(bar.dataset.progress) <= n);
    });
    if (stepLabel) stepLabel.textContent = 'Step ' + n + ' of ' + TOTAL;
    hideAlert();

    // Move focus to the first control of the new step for keyboard/screen readers.
    var first = $('.step.is-active input, .step.is-active select', form);
    if (first && n > 1) first.focus({ preventScroll: true });
  }

  function showAlert(msg) {
    if (!alertBox) return;
    alertBox.textContent = msg;
    alertBox.classList.add('is-visible');
  }
  function hideAlert() {
    if (alertBox) alertBox.classList.remove('is-visible');
  }

  function markError(field, isError) {
    var wrapper = field.closest('.field');
    if (wrapper) wrapper.classList.toggle('field--error', isError);
  }

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

  function validateStep(n) {
    var stepEl = steps.filter(function (s) { return Number(s.dataset.step) === n; })[0];
    if (!stepEl) return true;
    var ok = true;

    // Text, email, tel and select controls
    $$('input[required], select[required]', stepEl).forEach(function (field) {
      if (field.type === 'radio') return; // handled below
      var value = field.value.trim();
      var valid = value.length > 0;

      if (valid && field.type === 'email') valid = EMAIL_RE.test(value);
      if (valid && field.type === 'tel') valid = (value.replace(/\D/g, '').length >= 10);
      if (valid && field.id === 'address') valid = value.length >= 6;

      markError(field, !valid);
      if (!valid && ok) field.focus({ preventScroll: true });
      if (!valid) ok = false;
    });

    // Radio groups (timeline chips)
    var radios = $$('input[type="radio"][required]', stepEl);
    if (radios.length) {
      var name = radios[0].name;
      var chosen = $$('input[name="' + name + '"]', stepEl).some(function (r) { return r.checked; });
      var group = radios[0].closest('.field');
      if (group) group.classList.toggle('field--error', !chosen);
      if (!chosen) ok = false;
    }

    if (!ok) showAlert('Please complete the highlighted fields so we can price your home accurately.');
    return ok;
  }

  // Clear the error state as soon as the visitor starts fixing it.
  form.addEventListener('input', function (e) {
    var field = e.target.closest('.field');
    if (field) field.classList.remove('field--error');
  });
  form.addEventListener('change', function (e) {
    if (e.target.type === 'radio') {
      var field = e.target.closest('.field');
      if (field) field.classList.remove('field--error');
    }
  });

  // Step navigation
  form.addEventListener('click', function (e) {
    var next = e.target.closest('[data-next]');
    if (next) {
      if (validateStep(current)) showStep(Number(next.dataset.next));
      return;
    }
    var back = e.target.closest('[data-back]');
    if (back) showStep(Number(back.dataset.back));
  });

  // Enter key advances instead of submitting a half-filled form.
  form.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' || e.target.tagName === 'TEXTAREA') return;
    if (current < TOTAL) {
      e.preventDefault();
      if (validateStep(current)) showStep(current + 1);
    }
  });

  /* --------------------------------------------------------------- payload */
  function collect() {
    var data = {};
    new FormData(form).forEach(function (value, key) { data[key] = value; });

    // Attribution: keeps ad spend measurable without any third-party script.
    var params = new URLSearchParams(window.location.search);
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid']
      .forEach(function (k) { if (params.get(k)) data[k] = params.get(k); });

    data.page = window.location.href;
    data.referrer = document.referrer || 'direct';
    data.submittedAt = new Date().toISOString();
    return data;
  }

  function mailtoFallback(data) {
    var lines = [
      'New cash offer request from selltohermes.com', '',
      'Name:            ' + (data.name || ''),
      'Phone:           ' + (data.phone || ''),
      'Email:           ' + (data.email || ''),
      'Property:        ' + (data.address || ''),
      'Property type:   ' + (data.propertyType || ''),
      'Condition:       ' + (data.condition || ''),
      'Timeline:        ' + (data.timeline || ''), '',
      'Source:          ' + (data.utm_source || data.referrer || 'direct'),
      'Submitted:       ' + data.submittedAt
    ];
    window.location.href = 'mailto:' + FALLBACK_EMAIL +
      '?subject=' + encodeURIComponent('Cash offer request: ' + (data.address || 'Palm Beach property')) +
      '&body=' + encodeURIComponent(lines.join('\n'));
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validateStep(current)) return;

    // Honeypot: only bots fill this in.
    if (form.company && form.company.value) {
      window.location.href = THANK_YOU_URL;
      return;
    }

    var data = collect();

    if (!FORM_ENDPOINT) {
      mailtoFallback(data);
      setTimeout(function () { window.location.href = THANK_YOU_URL; }, 800);
      return;
    }

    submitBtn.classList.add('is-loading');
    submitBtn.textContent = 'Sending…';

    fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(function (res) {
        if (!res.ok) throw new Error('Request failed with status ' + res.status);
        window.location.href = THANK_YOU_URL;
      })
      .catch(function () {
        submitBtn.classList.remove('is-loading');
        submitBtn.textContent = 'Get My Cash Offer';
        showAlert('Something went wrong sending your request. Please call (561) 336-5540 and we’ll take your details over the phone.');
      });
  });
})();
