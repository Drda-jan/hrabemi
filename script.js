document.addEventListener('DOMContentLoaded', () => {
    /* ---- MOBILE NAV ---- */
    const burger = document.getElementById('burger');
    const nav = document.getElementById('nav');
    if (burger && nav) {
        burger.addEventListener('click', () => {
            nav.classList.toggle('is-open');
            burger.classList.toggle('is-open');
            burger.setAttribute('aria-expanded', String(nav.classList.contains('is-open')));
        });
        document.addEventListener('click', (e) => {
            const target = e.target;
            if (!burger.contains(target) && !nav.contains(target)) {
                nav.classList.remove('is-open');
                burger.classList.remove('is-open');
            }
        });
        nav.querySelectorAll('.nav__link').forEach((link) => {
            link.addEventListener('click', () => {
                nav.classList.remove('is-open');
                burger.classList.remove('is-open');
            });
        });
    }
    /* ---- STICKY HEADER ---- */
    const header = document.getElementById('header');
    if (header) {
        window.addEventListener('scroll', () => {
            header.classList.toggle('header--scrolled', window.scrollY > 10);
        });
    }
    /* ---- BACK TO TOP ---- */
    const backToTopBtn = document.getElementById('backToTop');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            backToTopBtn.classList.toggle('visible', window.scrollY > 400);
        });
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    /* ---- COOKIE BANNER ---- */
    function createCookieBanner() {
        if (localStorage.getItem('cookieConsent'))
            return;
        const banner = document.createElement('div');
        banner.className = 'cookie-banner';
        banner.innerHTML = `
            <div class="container cookie-banner__inner">
                <p>Tato stránka nepoužívá analytické cookies ani sledovací skripty.</p>
                <div class="cookie-banner__btns">
                    <button class="btn btn--primary" id="acceptCookiesBtn">Rozumím</button>
                </div>
            </div>
        `;
        document.body.appendChild(banner);
        setTimeout(() => banner.classList.add('visible'), 200);
        const btn = banner.querySelector('#acceptCookiesBtn');
        btn?.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'accepted');
            banner.classList.remove('visible');
            setTimeout(() => banner.remove(), 300);
        });
    }
    createCookieBanner();
    /* ---- FORM ---- */
    const form = document.getElementById('poptavkaForm');
    const successBox = document.getElementById('formSuccess');
    const submitBtn = document.getElementById('submitBtn');
    let lastSubmit = 0;
    if (form && successBox && submitBtn) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const now = Date.now();
            if (now - lastSubmit < 5000) {
                showFormError('Příliš rychlé odesílání formuláře.');
                return;
            }
            lastSubmit = now;
            if (!validateForm(form))
                return;
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Odesílám...';
            try {
                const data = new FormData(form);
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: data,
                    headers: { Accept: 'application/json' },
                });
                if (response.ok) {
                    form.style.display = 'none';
                    successBox.style.display = 'block';
                    successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                else {
                    const json = await response.json().catch(() => ({}));
                    const msg = json?.errors?.map((e) => e.message).join(', ') ||
                        'Neznámá chyba';
                    showFormError('Formulář se nepodařilo odeslat: ' + msg);
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'Odeslat poptávku';
                }
            }
            catch {
                showFormError('Chyba připojení k serveru.');
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Odeslat poptávku';
            }
        });
    }
    /* ---- LIVE VALIDACE ---- */
    document
        .querySelectorAll('.form-group input, .form-group textarea, .form-group select')
        .forEach((el) => {
        el.addEventListener('input', () => clearFieldError(el));
        el.addEventListener('blur', () => {
            if (el.required)
                validateField(el);
        });
    });
    /* ---- PHONE FORMAT ---- */
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', () => {
            let digits = phoneInput.value.replace(/\D/g, '');
            if (digits.startsWith('420'))
                digits = digits.slice(3);
            if (digits.length > 9)
                digits = digits.slice(0, 9);
            if (digits.length >= 6) {
                phoneInput.value = `+420 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
            }
            else if (digits.length >= 3) {
                phoneInput.value = `+420 ${digits.slice(0, 3)} ${digits.slice(3)}`;
            }
            else if (digits.length > 0) {
                phoneInput.value = `+420 ${digits}`;
            }
        });
    }
    /* ---- SMOOTH SCROLL ---- */
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
        a.addEventListener('click', (e) => {
            const href = a.getAttribute('href');
            const target = href ? document.querySelector(href) : null;
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
});
function validateForm(form) {
    let ok = true;
    form.querySelectorAll('[required]').forEach((el) => {
        if (!validateField(el))
            ok = false;
    });
    return ok;
}
function validateField(el) {
    const val = el.value.trim();
    if (!val) {
        showFieldError(el, 'Toto pole je povinné');
        return false;
    }
    if (el instanceof HTMLInputElement && el.type === 'email') {
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRe.test(val)) {
            showFieldError(el, 'Neplatný email');
            return false;
        }
    }
    clearFieldError(el);
    return true;
}
function showFieldError(el, msg) {
    el.classList.add('is-invalid');
    let err = el.parentElement?.querySelector('.error-msg');
    if (!err) {
        err = document.createElement('span');
        err.className = 'error-msg';
        el.parentElement?.appendChild(err);
    }
    err.textContent = msg;
}
function clearFieldError(el) {
    el.classList.remove('is-invalid');
    el.parentElement?.querySelector('.error-msg')?.remove();
}
function showFormError(msg) {
    let box = document.getElementById('formGlobalError');
    if (!box) {
        box = document.createElement('div');
        box.id = 'formGlobalError';
        box.style.cssText =
            'background:#fee2e2;border:1px solid #fca5a5;padding:1rem;margin-bottom:1rem;color:#b91c1c;';
        document.getElementById('poptavkaForm')?.prepend(box);
    }
    box.textContent = msg;
}
export {};
