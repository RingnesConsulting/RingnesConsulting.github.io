(function () {
  var doc = document.documentElement;
  doc.classList.add('js');

  // Mobilmeny
  var toggle = document.querySelector('.nav-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = document.body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Lukk meny' : 'Åpne meny');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('nav-open')) toggle.click();
    });
  }

  // Skygge på toppmeny ved scroll
  var header = document.querySelector('.site-header');
  var onScroll = function () { if (header) header.classList.toggle('is-scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Myk inntoning av seksjoner
  var items = document.querySelectorAll('.reveal');
  var showAll = function () { items.forEach(function (el) { el.classList.add('is-visible'); }); };
  var ioFired = false;
  // Sikkerhetsnett: hvis observatøren aldri svarer, vis alt innhold
  setTimeout(function () { if (!ioFired) showAll(); }, 2500);
  items.forEach(function (el) {
    if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-visible');
  });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      ioFired = true;
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px 12% 0px', threshold: 0 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // Skjemaer (Web3Forms): send uten å forlate siden. Påmeldingen laster ned møtemalen.
  document.querySelectorAll('form[data-ajax="web3forms"]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      var key = form.querySelector('input[name="access_key"]');
      if (!key || !key.value) {
        e.preventDefault();
        var st = form.querySelector('.form-status');
        st.className = 'form-status is-error';
        st.innerHTML = 'Skjemaet er ikke koblet til ennå. Send en e-post til <a href="mailto:kontakt@ninamerete.no">kontakt@ninamerete.no</a>, så hjelper jeg deg.';
        return;
      }
      if (!window.fetch || !window.FormData) return;
      e.preventDefault();
      var status = form.querySelector('.form-status');
      var button = form.querySelector('button[type="submit"]');
      status.className = 'form-status';
      status.textContent = 'Sender …';
      button.disabled = true;
      fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data && data.success) {
            form.reset();
            status.className = 'form-status is-ok';
            var pdf = form.getAttribute('data-download');
            if (pdf) {
              var name = form.getAttribute('data-filename') || '';
              var a = document.createElement('a');
              a.href = pdf; a.download = name; a.rel = 'noopener';
              document.body.appendChild(a); a.click(); a.remove();
              status.innerHTML = 'Takk! Møtemalen lastes ned nå. Skjer det ikke noe? <a href="' + pdf + '" download="' + name + '">Last ned her</a>.';
            } else {
              status.textContent = 'Takk! Meldingen er sendt, og jeg tar kontakt så raskt jeg kan.';
            }
          } else { throw new Error(); }
        })
        .catch(function () {
          status.className = 'form-status is-error';
          status.innerHTML = 'Meldingen ble ikke sendt. Prøv igjen, eller send en e-post til <a href="mailto:kontakt@ninamerete.no">kontakt@ninamerete.no</a>.';
        })
        .then(function () { button.disabled = false; });
    });
  });

  var y = document.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();
})();
