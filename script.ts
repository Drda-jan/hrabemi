/**
 * HRABEMI SUCHOMEL — frontend JavaScript (TypeScript zdroj)
 * =========================================================
 * Tento soubor se NEPOUZIVA primo v prohlizeci. Slouzi jen jako typovany
 * zdroj, ze ktereho se generuje `script.js` (ten je nahrany v <script> tagu
 * na vsech 4 strankach).
 *
 * BUILD: po jakekoliv uprave tohoto souboru spust v rootu projektu
 *
 *      npx tsc
 *
 * a zkontroluj, ze se prepsal `script.js`.
 *
 * DULEZITE: tento soubor NESMI obsahovat `import`/`export` na nejvyssi
 * urovni. Puvodne tu na radku 1 byvalo `export {};` — to TypeScript
 * prinutilo zpracovat soubor jako ES modul, a protoze cilovy "target"
 * v tsconfig.json je ES2020 (kde se modulovy zapis zachovava 1:1),
 * `tsc` to same `export {};` propsal i do vystupniho `script.js`.
 * Jenze `script.js` se v HTML nahrava jako klasicky <script src="...">,
 * NE jako <script type="module">, a `export` mimo modul je v prohlizeci
 * Uncaught SyntaxError, ktery vypne UPLNE VSECHEN JS na webu (menu,
 * formular, validaci, lightbox, cookie listu...). Pokud bys nekdy
 * potreboval/a kod rozdelit do vice .ts souboru, je potreba zaroven
 * zmenit i zpusob, jakym se vysledny JS vklada do HTML (na type="module"
 * a relativni importy), jinak hrozi presne tato chyba.
 *
 * Soubor je rozdeleny na nezavisle bloky. Kazdy blok si nejdriv najde
 * sve HTML elementy pres getElementById/querySelector a vetvi se pres
 * `if (element) { ... }` — diky tomu je bezpecne mit jeden soubor
 * script.js sdileny pro vsechny 4 stranky: na strance, kde dany element
 * neexistuje (napr. formular poptavky na galerie.html), se prislusny
 * blok jen preskoci a nic nespadne.
 */

// Typ pro globalni promennou `grecaptcha`, kterou do stranky vklada
// externi skript Google reCAPTCHA (<script src="...recaptcha/api.js">).
// TypeScript by o ni jinak nic nevedel.
declare const grecaptcha: {
    execute(siteKey: string, options: { action: string }): Promise<string>;
};

// Verejny reCAPTCHA v3 Site Key (NENI to tajny klic — Site Key je urceny
// k tomu, aby byl viditelny v HTML/JS na strane klienta; tajny "Secret Key"
// se pouziva jen na serveru a v tomto projektu se vubec nepouziva, protoze
// formular se overuje pres Formspree, ne pres vlastni backend).
const RECAPTCHA_SITE_KEY = '6Lfv1CQtAAAAAJyoBDH1yWq9sMden2ahwGDPCYhu';

document.addEventListener('DOMContentLoaded', (): void => {

    /* ====================================================
       MOBILNI NAVIGACE (hamburger menu)
       ==================================================== */
    const burger = document.getElementById('burger') as HTMLButtonElement | null;
    const nav = document.getElementById('nav') as HTMLElement | null;

    if (burger && nav) {
        // Klik na hamburger ikonu otevre/zavre menu
        burger.addEventListener('click', (): void => {
            nav.classList.toggle('is-open');
            burger.classList.toggle('is-open');
            burger.setAttribute('aria-expanded', String(nav.classList.contains('is-open')));
        });

        // Klik kamkoliv mimo menu ho zavre
        document.addEventListener('click', (e: MouseEvent): void => {
            const target = e.target as Node;
            if (!burger.contains(target) && !nav.contains(target)) {
                nav.classList.remove('is-open');
                burger.classList.remove('is-open');
            }
        });

        // Klik na konkretni odkaz v menu ho po prechodu na stranku zavre
        nav.querySelectorAll<HTMLAnchorElement>('.nav__link').forEach((link): void => {
            link.addEventListener('click', (): void => {
                nav.classList.remove('is-open');
                burger.classList.remove('is-open');
            });
        });
    }

    /* ====================================================
       PRILEPENA HLAVICKA PRI SCROLLOVANI
       (po odscrollovani prida .header--scrolled pro stinovani/mensi vysku)
       ==================================================== */
    const header = document.getElementById('header') as HTMLElement | null;
    if (header) {
        window.addEventListener('scroll', (): void => {
            header.classList.toggle('header--scrolled', window.scrollY > 10);
        });
    }

    /* ====================================================
       TLACITKO „ZPET NAHORU“
       ==================================================== */
    const backToTopBtn = document.getElementById('backToTop') as HTMLButtonElement | null;
    if (backToTopBtn) {
        window.addEventListener('scroll', (): void => {
            backToTopBtn.classList.toggle('visible', window.scrollY > 400);
        });

        backToTopBtn.addEventListener('click', (): void => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* ====================================================
       COOKIE LISTA
       Web nepouziva analyticke ani sledovaci cookies, takze lista jen
       informuje a po kliknuti si zapamatuje souhlas do localStorage,
       aby se priste neukazovala znovu.
       ==================================================== */
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

    /* ====================================================
       FILTR FOTOGALERIE (galerie.html)
       Tlacitka s data-filter prepinaji, ktere .gallery-item se zobrazi
       podle jejich data-category. Na strankach bez galerie (index,
       recenze, poptavka) jsou obe NodeListy prazdne, takze se blok
       jen preskoci.
       ==================================================== */
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

    /* ====================================================
       LIGHTBOX (zvetsene zobrazeni fotky z galerie.html)
       ==================================================== */
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
        // Klik na dlazdici v galerii otevre lightbox na dane fotce
        document.getElementById('galleryGrid')?.addEventListener('click', (e: MouseEvent): void => {
            const item = (e.target as HTMLElement).closest<HTMLElement>('.gallery-item:not(.gallery-placeholder)');
            if (!item) return;
            const visibleItems = [...document.querySelectorAll<HTMLElement>('.gallery-item:not(.gallery-placeholder)')]
                .filter(i => i.style.display !== 'none');
            const index = visibleItems.indexOf(item);
            if (index >= 0) openLightbox(visibleItems, index);
        });

        lbClose?.addEventListener('click', closeLightbox);
        lbPrev?.addEventListener('click', (): void => {
            lbIndex = (lbIndex - 1 + lbItems.length) % lbItems.length;
            showLbSlide();
        });
        lbNext?.addEventListener('click', (): void => {
            lbIndex = (lbIndex + 1) % lbItems.length;
            showLbSlide();
        });

        // Klik na temne pozadi (mimo fotku) lightbox zavre
        lightbox.addEventListener('click', (e: MouseEvent): void => {
            if (e.target === lightbox) closeLightbox();
        });

        // Klavesove ovladani: Esc zavre, sipky prepinaji fotky
        document.addEventListener('keydown', (e: KeyboardEvent): void => {
            if (!lightbox.classList.contains('is-open')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') {
                lbIndex = (lbIndex - 1 + lbItems.length) % lbItems.length;
                showLbSlide();
            }
            if (e.key === 'ArrowRight') {
                lbIndex = (lbIndex + 1) % lbItems.length;
                showLbSlide();
            }
        });
    }

    /* ====================================================
       POPTAVKOVY FORMULAR (poptavka.html)
       Odesila se pres fetch() na Formspree (zadny vlastni backend).
       Pred odeslanim se vygeneruje reCAPTCHA v3 token a vlozi se do
       skryteho pole #recaptchaToken — token se jen prilozi k datum,
       server na to nema vlastni overeni (na statickem hostingu to
       overuje az Formspree na sve strane).
       ==================================================== */
    const form = document.getElementById('poptavkaForm') as HTMLFormElement | null;
    const successBox = document.getElementById('formSuccess') as HTMLElement | null;
    const submitBtn = document.getElementById('submitBtn') as HTMLButtonElement | null;
    let lastSubmit = 0;

    if (form && successBox && submitBtn) {
        form.addEventListener('submit', async (e: SubmitEvent): Promise<void> => {
            e.preventDefault();

            // Jednoducha ochrana proti dvojitemu/rychlemu opakovanemu odeslani
            const now = Date.now();
            if (now - lastSubmit < 5000) {
                showFormError('Příliš rychlé odesílání formuláře.');
                return;
            }
            lastSubmit = now;

            if (!validateForm(form)) return;

            // reCAPTCHA v3 — token se ziska az pri odeslani (ne pri nacteni stranky)
            if (typeof grecaptcha !== 'undefined') {
                submitBtn.disabled = true;
                submitBtn.innerHTML = 'Ověřuji...';
                try {
                    const token = await grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'poptavka' });
                    const tokenInput = document.getElementById('recaptchaToken') as HTMLInputElement | null;
                    if (tokenInput) tokenInput.value = token;
                } catch (err) {
                    console.error('reCAPTCHA error (poptavka):', err);
                    showFormError('Nepodařilo se ověřit reCAPTCHA. Zkuste to znovu.');
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Odeslat poptávku';
                    return;
                }
            }

            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Odesílám...';

            try {
                const data = new FormData(form);
                data.delete('_recaptcha');

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
                        json?.errors?.map((e: { message: string }) => e.message).join(', ') ||
                        'Neznámá chyba';

                    showFormError('Formulář se nepodařilo odeslat: ' + msg);

                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Odeslat poptávku';
                }
            } catch {
                showFormError('Chyba připojení k serveru.');
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Odeslat poptávku';
            }
        });
    }

    /* ====================================================
       OKAMZITA VALIDACE POLI (pri psani/opusteni pole)
       ==================================================== */
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

    /* ====================================================
       AUTOMATICKE FORMATOVANI TELEFONU
       Pri psani do pole "Telefon" doplni format +420 XXX XXX XXX
       ==================================================== */
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

    /* ====================================================
       PLYNULY SCROLL NA KOTVY (a[href^="#"])
       Momentalne na webu nejsou zadne interni odkazy na kotvy (#sekce),
       ale kod zustava — pokud se v budoucnu na nejakou stranku doplni
       odkaz typu <a href="#sluzby">, automaticky se k nemu bude
       plynule scrollovat bez dalsi upravy JS.
       ==================================================== */
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

/* ============================================================
   VALIDACE FORMULARE
   Tyto funkce jsou mimo DOMContentLoaded blok zamerne, aby na ne
   bylo videt z vice mist vyse (poptavkovy formular). Pracuji ciste
   s predanym elementem, takze nezavisi na konkretni strance.
   ============================================================ */

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