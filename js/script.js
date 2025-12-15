// -----------------------------------------------------------
// ГЛОБАЛЬНІ ЗМІННІ
// -----------------------------------------------------------
const CV_DOWNLOAD_URL = "https://raw.githubusercontent.com/volodsvy-netizen/SV-project/4429fec2a7a8eca0020c3ab6123cb62dc8fd7120/CV.pdf";
const LANGUAGE_KEY = 'cv_lang';

// Припускаємо, що об'єкт translations визначено в іншому файлі або у <script> перед цим файлом
// Якщо ні, переконайтеся, що файл з перекладами завантажується раніше.

// -----------------------------------------------------------
// 1. Dark Mode Toggle (Перемикач теми)
// -----------------------------------------------------------
const themeToggle = document.getElementById('theme-toggle');
const html = document.documentElement;

// Встановлення початкового стану:
// Перевіряємо localStorage або системні налаштування (prefers-color-scheme)
if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    html.classList.add('dark');
} else {
    html.classList.remove('dark');
}

// Обробник кліку по кнопці перемикання
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        html.classList.toggle('dark');
        
        // Збереження вибору користувача
        if (html.classList.contains('dark')) {
            localStorage.setItem('theme', 'dark');
        } else {
            localStorage.setItem('theme', 'light');
        }
    });
}

// -----------------------------------------------------------
// 2. Typing Effect (Ефект друкарської машинки)
// -----------------------------------------------------------
const textElement = document.getElementById('typing-text');

let currentLanguage = localStorage.getItem(LANGUAGE_KEY) || 'ukr';
// Перевірка на існування об'єкта translations перед використанням
let textList = (typeof translations !== 'undefined' && translations[currentLanguage]) 
    ? translations[currentLanguage]['typing-texts'] 
    : ["Developer", "Designer"]; // Fallback, якщо переклади не завантажились

let wordIndex = 0; 
let charIndex = 0; 
let typingTimeout;
let isDeleting = false; 

function resetTyping() {
    clearTimeout(typingTimeout);
    wordIndex = 0;
    charIndex = 0;
    isDeleting = false;
    if (textElement) textElement.textContent = "";
}

function animateTyping() {
    if (!textElement || typeof translations === 'undefined') return;

    textList = translations[currentLanguage]['typing-texts'];
    const currentWord = textList[wordIndex % textList.length];

    if (isDeleting) {
        charIndex--;
    } else {
        charIndex++;
    }

    textElement.textContent = currentWord.substring(0, charIndex);

    let typeSpeed = 100;

    if (!isDeleting && charIndex === currentWord.length) {
        isDeleting = true;
        typeSpeed = 2000; // Пауза після повного слова
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex++;
        typeSpeed = 500; // Пауза перед новим словом
    } else if (isDeleting) {
        typeSpeed = 50; // Швидкість стирання
    }
    
    typingTimeout = setTimeout(animateTyping, typeSpeed);
}

// -----------------------------------------------------------
// 3. Логіка перекладу та перемикання мови
// -----------------------------------------------------------

function updateLanguage(lang) {
    if (typeof translations === 'undefined') return;

    currentLanguage = lang;
    localStorage.setItem(LANGUAGE_KEY, lang);
    const content = translations[lang];

    // Оновлення заголовка (title)
    document.title = content['title'];

    // Оновлення всіх елементів з атрибутом data-translate
    document.querySelectorAll('[data-translate]').forEach(el => {
        const key = el.getAttribute('data-translate');
        if (content[key]) {
            el.innerHTML = content[key];
        }
    });
    
    // Оновлення тексту на кнопці перемикача
    const langText = document.getElementById('current-lang-text');
    if (langText) {
        langText.textContent = lang === 'ukr' ? 'УКР' : 'ENG';
    }

    // Перезапуск анімації тексту
    resetTyping();
    setTimeout(animateTyping, 50); 
}

const langToggle = document.getElementById('lang-toggle');
if (langToggle) {
    langToggle.addEventListener('click', () => {
        const newLang = currentLanguage === 'ukr' ? 'eng' : 'ukr';
        updateLanguage(newLang);
    });
}

// Запуск при завантаженні (якщо є переклади)
if (typeof translations !== 'undefined') {
    updateLanguage(currentLanguage);
}

// -----------------------------------------------------------
// 4. Scroll Animation (Intersection Observer)
// -----------------------------------------------------------
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

function activateSkills(element) {
    if (element.classList.contains('skills-visible')) return;
    
    element.classList.add('skills-visible');
    const bars = element.querySelectorAll('[data-progress]');
    bars.forEach(barContainer => {
        const percentage = barContainer.getAttribute('data-progress');
        const innerBar = barContainer.querySelector('.progress-bar-inner');
        if (innerBar) {
            innerBar.style.setProperty('--progress-width', `${percentage}%`);
        }
    });
}

const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            
            if (entry.target.id === 'skills') {
                activateSkills(entry.target);
            } 
            
            // Зупиняємо спостереження після появи (крім навичок, якщо потрібно)
            if (entry.target.id !== 'skills') {
                obs.unobserve(entry.target); 
            }
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in-up').forEach((el) => {
    observer.observe(el);
});

// -----------------------------------------------------------
// 5. Image Modal / Lightbox (Галерея)
// -----------------------------------------------------------
const imageModal = document.getElementById('image-modal');
const modalImage = document.getElementById('modal-image');
const projectImages = document.querySelectorAll('.project-image');

function openModal(src) {
    if (!imageModal || !modalImage) return;
    modalImage.src = src;
    imageModal.classList.remove('opacity-0', 'pointer-events-none');
    imageModal.classList.add('opacity-100', 'pointer-events-auto');
    document.body.style.overflow = 'hidden';
    modalImage.classList.remove('scale-90');
    modalImage.classList.add('scale-100');
}

function closeModal(event) {
    if (!imageModal || !modalImage) return;
    // Якщо клік по самій картинці - не закриваємо
    if (event && event.target === modalImage) return;

    imageModal.classList.remove('opacity-100', 'pointer-events-auto');
    imageModal.classList.add('opacity-0', 'pointer-events-none');
    document.body.style.overflow = 'auto';
    modalImage.classList.remove('scale-100');
    modalImage.classList.add('scale-90');
}

// Додаємо обробники для кліку по картинках проєктів
projectImages.forEach(image => {
    image.addEventListener('click', (e) => {
        openModal(e.target.src);
    });
});

// Додаємо закриття при кліку на фон (якщо такий елемент є в HTML розмітці модалки)
if (imageModal) {
    imageModal.addEventListener('click', closeModal);
}

// -----------------------------------------------------------
// 6. Download Modal (Підтвердження завантаження CV)
// -----------------------------------------------------------
const downloadModal = document.getElementById('download-modal');
const confirmDownloadBtn = document.getElementById('confirm-download-btn');
const navDownloadBtn = document.getElementById('nav-download-btn');
const contactDownloadBtn = document.getElementById('contact-download-btn');

function openDownloadModal() {
    if (!downloadModal) return;
    downloadModal.classList.remove('opacity-0', 'pointer-events-none');
    downloadModal.classList.add('opacity-100', 'pointer-events-auto');
    
    // Блокуємо скрол тільки якщо галерея не відкрита
    if (imageModal && !imageModal.classList.contains('opacity-100')) {
        document.body.style.overflow = 'hidden';
    }
}

function closeDownloadModal() {
    if (!downloadModal) return;
    downloadModal.classList.remove('opacity-100', 'pointer-events-auto');
    downloadModal.classList.add('opacity-0', 'pointer-events-none');
    
    if (imageModal && !imageModal.classList.contains('opacity-100')) {
        document.body.style.overflow = 'auto';
    }
}

if (confirmDownloadBtn) {
    confirmDownloadBtn.href = CV_DOWNLOAD_URL;
    confirmDownloadBtn.addEventListener('click', () => {
        setTimeout(closeDownloadModal, 100);
    });
}

// Кнопки виклику модалки завантаження
navDownloadBtn?.addEventListener('click', openDownloadModal);
contactDownloadBtn?.addEventListener('click', openDownloadModal);

// Кнопки закриття модалки (хрестик або Cancel), якщо вони є
const closeDownloadBtns = document.querySelectorAll('.close-download-modal'); 
closeDownloadBtns.forEach(btn => btn.addEventListener('click', closeDownloadModal));


// -----------------------------------------------------------
// 7. Загальні обробники подій
// -----------------------------------------------------------

// Закриття по клавіші Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (imageModal && imageModal.classList.contains('opacity-100')) {
            closeModal();
        } else if (downloadModal && downloadModal.classList.contains('opacity-100')) {
            closeDownloadModal();
        }
    }
});

// -----------------------------------------------------------
// 8. QA Bug Easter Egg (Логіка втечі та піймання жука)
// -----------------------------------------------------------
/* --- Logic for QA Bug Easter Egg --- */
document.addEventListener('DOMContentLoaded', function() {
    
    const bug = document.getElementById('qa-bug');

    // Перевіряємо, чи жук взагалі знайдений
    if (bug) {
        
        // Функція для випадкового переміщення
        function moveBugRandomly() {
            const windowHeight = window.innerHeight;
            const windowWidth = window.innerWidth;
            
            // Генеруємо координати (віднімаємо 100px, щоб точно не виліз за екран)
            const randomTop = Math.floor(Math.random() * (windowHeight - 100));
            const randomLeft = Math.floor(Math.random() * (windowWidth - 100));

            // Для діагностики можна глянути в консоль (F12), куди він стрибає
            // console.log(`Bug moving to: Top ${randomTop}, Left ${randomLeft}`);

            bug.style.position = 'fixed'; // Гарантуємо, що позиція фіксована
            bug.style.top = `${randomTop}px`;
            bug.style.left = `${randomLeft}px`;
        }

        // Запускаємо рух кожні 3 секунди (зробив швидше, щоб ти точно помітив)
        const bugInterval = setInterval(moveBugRandomly, 3000);

        // Клік
        bug.addEventListener('click', () => {
            clearInterval(bugInterval); // Зупиняємо рух
            alert("🐛 БАГ ЗЛОВЛЕНО!\n\nВітаю! Ти знайшов пасхалку.\nЯк QA Engineer, я фікшу баги миттєво! 😉");
            bug.style.display = 'none'; // Ховаємо жука
        });
        
    } else {
        console.error("Елемент 'qa-bug' не знайдено! Перевір HTML.");
    }
});
