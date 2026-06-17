export {};
// Typy pro reCAPTCHA
declare const grecaptcha: {
    execute(siteKey: string, options: { action: string }): Promise<string>;
};

// Nastav svůj Site Key z console.cloud.google.com
const RECAPTCHA_SITE_KEY = '6Lfv1CQtAAAAAJyoBDH1yWq9sMden2ahwGDPCYhu';
document.addEventListener('DOMContentLoaded', (): void => {

    /* ---- MOBILE NAV ---- */
    const burger = document.getElementById('burger') as HTMLButtonElement | null;
    const nav = document.getElementById('nav') as HTMLElement | null;

    if (burger && nav) {
        burger.addEventListener('click', (): void => {
            nav.classList.toggle('is-open');
            burger.classList.toggle('is-open');
            burger.setAttribute('aria-expanded', String(nav.classList.contains('is-open')));
        });

        document.addEventListener('click', (e: MouseEvent): void => {
            const target = e.target as Node;
            if (!burger.contains(target) && !nav.contains(target)) {
                nav.classList.remove('is-open');
                burger.classList.remove('is-open');
            }
        });

        nav.querySelectorAll<HTMLAnchorElement>('.nav__link').forEach((link): void => {
            link.addEventListener('click', (): void => {
                nav.classList.remove('is-open');
                burger.classList.remove('is-open');
            });
        });
    }

    /* ---- STICKY HEADER ---- */
    const header = document.getElementById('header') as HTMLElement | null;
    if (header) {
        window.addEventListener('scroll', (): void => {
            header.classList.toggle('header--scrolled', window.scrollY > 10);
        });
    }

    /* ---- BACK TO TOP ---- */
    const backToTopBtn = document.getElementById('backToTop') as HTMLButtonElement | null;
    if (backToTopBtn) {
        window.addEventListener('scroll', (): void => {
            backToTopBtn.classList.toggle('visible', window.scrollY > 400);
        });

        backToTopBtn.addEventListener('click', (): void => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* ---- COOKIE BANNER ---- */
    function createCookieBanner(): void {
        if (localStorage.getItem('cookieConsent')) return;

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

    /* ---- GALLERY FILTER ---- */
const filterBtns = document.querySelectorAll<HTMLButtonElement>('.filter-btn');
const galleryItems = document.querySelectorAll<HTMLElement>('.gallery-item');
const galleryEmpty = document.getElementById('galleryEmpty');

if (filterBtns.length && galleryItems.length) {
    filterBtns.forEach((btn): void => {
        btn.addEventListener('click', (): void => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');
            let visibleCount = 0;

            galleryItems.forEach((item): void => {
                const cat = item.getAttribute('data-category');
                const show = filter === 'all' || cat === filter;
                item.style.display = show ? '' : 'none';
                if (show) visibleCount++;
            });

            if (galleryEmpty) {
                galleryEmpty.style.display = visibleCount === 0 ? 'block' : 'none';
            }
        });
    });
}

/* ---- LIGHTBOX ---- */
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lbImg') as HTMLImageElement | null;
const lbCaption = document.getElementById('lbCaption');
const lbCounter = document.getElementById('lbCounter');
const lbClose = document.getElementById('lbClose');
const lbPrev = document.getElementById('lbPrev');
const lbNext = document.getElementById('lbNext');
let lbItems: HTMLElement[] = [];
let lbIndex = 0;

function openLightbox(items: HTMLElement[], index: number): void {
    lbItems = items;
    lbIndex = index;
    showLbSlide();
    lightbox?.classList.add('is-open');
    document.body.style.overflow = 'hidden';
}
function closeLightbox(): void {
    lightbox?.classList.remove('is-open');
    document.body.style.overflow = '';
}
function showLbSlide(): void {
    const item = lbItems[lbIndex];
    const img = item.querySelector('img') as HTMLImageElement | null;
    if (!img || !lbImg) return;
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    if (lbCaption) lbCaption.textContent = item.getAttribute('data-title') || '';
    if (lbCounter) lbCounter.textContent = `${lbIndex + 1} / ${lbItems.length}`;
}

if (lightbox) {
    document.getElementById('galleryGrid')?.addEventListener('click', (e: MouseEvent): void => {
        const item = (e.target as HTMLElement).closest<HTMLElement>('.gallery-item:not(.gallery-placeholder)');
        if (!item) return;
        const visibleItems = [...document.querySelectorAll<HTMLElement>('.gallery-item:not(.gallery-placeholder)')].filter(i => i.style.display !== 'none');
        const index = visibleItems.indexOf(item);
        if (index >= 0) openLightbox(visibleItems, index);
    });
    lbClose?.addEventListener('click', closeLightbox);
    lbPrev?.addEventListener('click', (): void => { lbIndex = (lbIndex - 1 + lbItems.length) % lbItems.length; showLbSlide(); });
    lbNext?.addEventListener('click', (): void => { lbIndex = (lbIndex + 1) % lbItems.length; showLbSlide(); });
    lightbox.addEventListener('click', (e: MouseEvent): void => { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', (e: KeyboardEvent): void => {
        if (!lightbox.classList.contains('is-open')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') { lbIndex = (lbIndex - 1 + lbItems.length) % lbItems.length; showLbSlide(); }
        if (e.key === 'ArrowRight') { lbIndex = (lbIndex + 1) % lbItems.length; showLbSlide(); }
    });
}

/* ---- HVĚZDIČKOVÉ HODNOCENÍ ---- */
const starRating = document.getElementById('starRating');
const ratingInput = document.getElementById('r-rating') as HTMLInputElement | null;

if (starRating && ratingInput) {
    const stars = starRating.querySelectorAll<HTMLButtonElement>('.star-btn');
    let selectedRating = 0;

    function updateStars(hoverVal: number): void {
        stars.forEach((s, i): void => { s.classList.toggle('active', i < hoverVal); });
    }

    stars.forEach((s): void => {
        s.addEventListener('mouseenter', (): void => updateStars(Number(s.dataset.value)));
        s.addEventListener('mouseleave', (): void => updateStars(selectedRating));
        s.addEventListener('click', (): void => {
            selectedRating = Number(s.dataset.value);
            ratingInput.value = String(selectedRating);
            updateStars(selectedRating);
        });
    });
}

/* ---- RECENZE FORMULÁŘ ---- */
const recenzeForm = document.getElementById('recenzeForm') as HTMLFormElement | null;
const recenzeSuccess = document.getElementById('recenzeSuccess') as HTMLElement | null;
const recenzeSubmitBtn = document.getElementById('recenzeSubmitBtn') as HTMLButtonElement | null;
let lastRecenzeSubmit = 0;

if (recenzeForm && recenzeSuccess && recenzeSubmitBtn) {
    recenzeForm.addEventListener('submit', async (e: SubmitEvent): Promise<void> => {
        e.preventDefault();

        const now = Date.now();
        if (now - lastRecenzeSubmit < 10000) {
            showRecenzeError('Příliš rychlé odesílání – počkejte chvíli.');
            return;
        }
        lastRecenzeSubmit = now;
        if (!validateForm(recenzeForm)) return;

        if (typeof grecaptcha !== 'undefined') {
            recenzeSubmitBtn.disabled = true;
            recenzeSubmitBtn.innerHTML = 'Ověřuji...';
            try {
                const token = await grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'recenze' });
                const tokenInput = document.getElementById('recaptchaTokenRecenze') as HTMLInputElement | null;
                if (tokenInput) tokenInput.value = token;
            } catch {
                showRecenzeError('Nepodařilo se ověřit reCAPTCHA. Zkuste to znovu.');
                recenzeSubmitBtn.disabled = false;
                recenzeSubmitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Odeslat recenzi';
                return;
            }
        }

        recenzeSubmitBtn.disabled = true;
        recenzeSubmitBtn.innerHTML = 'Odesílám...';

        try {
            const data = new FormData(recenzeForm);
            const response = await fetch(recenzeForm.action, {
                method: 'POST', body: data,
                headers: { Accept: 'application/json' },
            });
            if (response.ok) {
                recenzeForm.style.display = 'none';
                recenzeSuccess.style.display = 'block';
                recenzeSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                const json = await response.json().catch(() => ({}));
                const msg = json?.errors?.map((e: { message: string }) => e.message).join(', ') || 'Neznámá chyba';
                showRecenzeError('Nepodařilo se odeslat: ' + msg);
                recenzeSubmitBtn.disabled = false;
                recenzeSubmitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Odeslat recenzi';
            }
        } catch {
            showRecenzeError('Chyba připojení k serveru.');
            recenzeSubmitBtn.disabled = false;
            recenzeSubmitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Odeslat recenzi';
        }
    });
}

function showRecenzeError(msg: string): void {
    let box = document.getElementById('recenzeGlobalError');
    if (!box) {
        box = document.createElement('div');
        box.id = 'recenzeGlobalError';
        box.style.cssText = 'background:#fee2e2;border:1px solid #fca5a5;padding:1rem;margin-bottom:1rem;color:#b91c1c;';
        recenzeForm?.prepend(box);
    }
    box.textContent = msg;
}

    /* ---- FORM ---- */
    const form = document.getElementById('poptavkaForm') as HTMLFormElement | null;
    const successBox = document.getElementById('formSuccess') as HTMLElement | null;
    const submitBtn = document.getElementById('submitBtn') as HTMLButtonElement | null;

    let lastSubmit = 0;

    if (form && successBox && submitBtn) {
        form.addEventListener('submit', async (e: SubmitEvent): Promise<void> => {
            e.preventDefault();

            const now = Date.now();
            if (now - lastSubmit < 5000) {
                showFormError('Příliš rychlé odesílání formuláře.');
                return;
            }
            lastSubmit = now;

            if (!validateForm(form)) return;

            // reCAPTCHA v3
            if (typeof grecaptcha !== 'undefined') {
                submitBtn.disabled = true;
                submitBtn.innerHTML = 'Ověřuji...';
                try {
                    const token = await grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'poptavka' });
                    const tokenInput = document.getElementById('recaptchaToken') as HTMLInputElement | null;
                    if (tokenInput) tokenInput.value = token;
                }
               catch (err) {
                    console.error('reCAPTCHA error (poptavka):', err);
                     showFormError('Nepodařilo se ověřit reCAPTCHA. Zkuste to znovu.');
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'Odeslat poptávku';
                    return;
                    }
                }

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
                } else {
                    const json = await response.json().catch(() => ({}));
                    const msg =
                        json?.errors?.map((e: any) => e.message).join(', ') ||
                        'Neznámá chyba';

                    showFormError('Formulář se nepodařilo odeslat: ' + msg);

                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'Odeslat poptávku';
                }
            } catch {
                showFormError('Chyba připojení k serveru.');
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Odeslat poptávku';
            }
        });
    }

    /* ---- LIVE VALIDACE ---- */
    document
        .querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
            '.form-group input, .form-group textarea, .form-group select'
        )
        .forEach((el): void => {
            el.addEventListener('input', (): void => clearFieldError(el));
            el.addEventListener('blur', (): void => {
                if (el.required) validateField(el);
            });
        });

    /* ---- PHONE FORMAT ---- */
    const phoneInput = document.getElementById('phone') as HTMLInputElement | null;

    if (phoneInput) {
        phoneInput.addEventListener('input', (): void => {
            let digits = phoneInput.value.replace(/\D/g, '');
            if (digits.startsWith('420')) digits = digits.slice(3);
            if (digits.length > 9) digits = digits.slice(0, 9);

            if (digits.length >= 6) {
                phoneInput.value = `+420 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
            } else if (digits.length >= 3) {
                phoneInput.value = `+420 ${digits.slice(0, 3)} ${digits.slice(3)}`;
            } else if (digits.length > 0) {
                phoneInput.value = `+420 ${digits}`;
            }
        });
    }

    /* ---- SMOOTH SCROLL ---- */
    document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a): void => {
        a.addEventListener('click', (e: MouseEvent): void => {
            const href = a.getAttribute('href');
            const target = href ? document.querySelector<HTMLElement>(href) : null;

            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
});

/* ---- VALIDACE ---- */

type FormField = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

function validateForm(form: HTMLFormElement): boolean {
    let ok = true;

    form.querySelectorAll<FormField>('[required]').forEach((el): void => {
        if (!validateField(el)) ok = false;
    });

    return ok;
}

function validateField(el: FormField): boolean {
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

function showFieldError(el: FormField, msg: string): void {
    el.classList.add('is-invalid');

    let err = el.parentElement?.querySelector('.error-msg') as HTMLSpanElement | null;

    if (!err) {
        err = document.createElement('span');
        err.className = 'error-msg';
        el.parentElement?.appendChild(err);
    }

    err.textContent = msg;
}

function clearFieldError(el: FormField): void {
    el.classList.remove('is-invalid');
    el.parentElement?.querySelector('.error-msg')?.remove();
}

function showFormError(msg: string): void {
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