 // -----------------------------------------------------------
        // ГЛОБАЛЬНІ ЗМІННІ
        // -----------------------------------------------------------
        const CV_DOWNLOAD_URL = "https://raw.githubusercontent.com/volodsvy-netizen/SV-project/4429fec2a7a8eca0020c3ab6123cb62dc8fd7120/CV.pdf";
        const LANGUAGE_KEY = 'cv_lang';

        // -----------------------------------------------------------
        // 1. Dark Mode Toggle
        // -----------------------------------------------------------
        const themeToggle = document.getElementById('theme-toggle');
        const html = document.documentElement;
        
        // Встановлення початкового стану: Перевірка localStorage для збереження теми
        if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            html.classList.add('dark');
        } else {
            html.classList.remove('dark');
        }

        themeToggle.addEventListener('click', () => {
            html.classList.toggle('dark');
            // Збереження теми в localStorage
            if (html.classList.contains('dark')) {
                localStorage.setItem('theme', 'dark');
            } else {
                localStorage.setItem('theme', 'light');
            }
        });

        // -----------------------------------------------------------
        // 2. Typing Effect (ВИПРАВЛЕНО)
        // -----------------------------------------------------------
        const textElement = document.getElementById('typing-text');
        
        let currentLanguage = localStorage.getItem(LANGUAGE_KEY) || 'ukr';
        let textList = translations[currentLanguage]['typing-texts'];
        
        let wordIndex = 0; // Індекс слова в масиві (раніше 'count')
        let charIndex = 0; // Індекс символу в поточному слові (раніше 'index')
        let typingTimeout;
        let isDeleting = false; // Змінна стану
        
        // Функція для очищення всіх поточних таймерів анімації
        function resetTyping() {
            clearTimeout(typingTimeout);
            wordIndex = 0;
            charIndex = 0;
            isDeleting = false;
            textElement.textContent = "";
        }

        function animateTyping() {
            textList = translations[currentLanguage]['typing-texts'];
            const currentWord = textList[wordIndex % textList.length];

            if (isDeleting) {
                // РЕЖИМ СТИРАННЯ
                charIndex--;
            } else {
                // РЕЖИМ ДРУКУВАННЯ
                charIndex++;
            }

            // Оновлення тексту в DOM
            textElement.textContent = currentWord.substring(0, charIndex);

            let typeSpeed = 100;

            if (!isDeleting && charIndex === currentWord.length) {
                // Слово повністю набрано -> Перехід до стирання
                isDeleting = true;
                typeSpeed = 2000; // Пауза перед початком стирання (2 сек)
            } else if (isDeleting && charIndex === 0) {
                // Слово повністю стерто -> Перехід до друкування наступного слова
                isDeleting = false;
                wordIndex++;
                typeSpeed = 500; // Пауза перед початком друкування наступного слова
            } else if (isDeleting) {
                // Стирання символів
                typeSpeed = 50;
            }
            
            typingTimeout = setTimeout(animateTyping, typeSpeed);
        }
        
        // -----------------------------------------------------------
        // 3. ЛОГІКА ПЕРЕКЛАДУ ТА ПЕРЕМИКАННЯ
        // -----------------------------------------------------------
        
        function updateLanguage(lang) {
            currentLanguage = lang;
            localStorage.setItem(LANGUAGE_KEY, lang);
            const content = translations[lang];

            // Оновлення заголовка сторінки
            document.title = content['title'];

            // Оновлення тексту елементів з data-translate
            document.querySelectorAll('[data-translate]').forEach(el => {
                const key = el.getAttribute('data-translate');
                if (content[key]) {
                    // Перевірка на HTML контент (наприклад, strong для англ. мови)
                    el.innerHTML = content[key];
                }
            });
            
            // Оновлення тексту кнопки перемикача мови
            document.getElementById('current-lang-text').textContent = lang === 'ukr' ? 'УКР' : 'ENG';

            // Очищення та перезапуск ефекту друкарської машинки
            resetTyping();
            // Запускаємо анімацію з невеликою затримкою для плавного старту
            setTimeout(animateTyping, 50); 
        }

        const langToggle = document.getElementById('lang-toggle');
        langToggle.addEventListener('click', () => {
            const newLang = currentLanguage === 'ukr' ? 'eng' : 'ukr';
            updateLanguage(newLang);
        });
        
        // Ініціалізація: Завантаження початкової мови та запуск друку
        updateLanguage(currentLanguage); 
        
        // -----------------------------------------------------------
        // 4. Scroll Animation (Intersection Observer)
        // -----------------------------------------------------------
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };
        
        // Функція для активації заповнення прогрес-барів
        function activateSkills(element) {
            // Перевіряємо, чи навички вже активовано, щоб уникнути повторного запуску
            if (element.classList.contains('skills-visible')) return;
            
            element.classList.add('skills-visible');
            const bars = element.querySelectorAll('[data-progress]');
            bars.forEach(barContainer => {
                const percentage = barContainer.getAttribute('data-progress');
                const innerBar = barContainer.querySelector('.progress-bar-inner');
                if (innerBar) {
                    // Виправлення: Встановлюємо змінну CSS для активації transition
                    innerBar.style.setProperty('--progress-width', `${percentage}%`);
                }
            });
        }

        // Ініціалізація Intersection Observer
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    
                    // Активація заповнення навичок, якщо це секція #skills
                    if (entry.target.id === 'skills') {
                        activateSkills(entry.target);
                    } 
                    
                    // Припиняємо спостереження лише для fade-in-up анімації, якщо це не #skills
                    if (entry.target.id !== 'skills') {
                        observer.unobserve(entry.target); 
                    }

                }
            });
        }, observerOptions);

        // Спостереження за всіма елементами з класом .fade-in-up
        document.querySelectorAll('.fade-in-up').forEach((el) => {
            observer.observe(el);
        });
        
        // -----------------------------------------------------------
        // 5. Image Modal / Lightbox
        // -----------------------------------------------------------
        const imageModal = document.getElementById('image-modal');
        const modalImage = document.getElementById('modal-image');
        const projectImages = document.querySelectorAll('.project-image');

        function openModal(src) {
            modalImage.src = src;
            imageModal.classList.remove('opacity-0', 'pointer-events-none');
            imageModal.classList.add('opacity-100', 'pointer-events-auto');
            document.body.style.overflow = 'hidden'; // Заблокувати прокрутку
            modalImage.classList.remove('scale-90');
            modalImage.classList.add('scale-100');
        }

        function closeModal(event) {
            // Запобігаємо закриттю, якщо клік був на самій картинці (але не на модальному фоні)
            if (event && event.target === modalImage) return;

            imageModal.classList.remove('opacity-100', 'pointer-events-auto');
            imageModal.classList.add('opacity-0', 'pointer-events-none');
            document.body.style.overflow = 'auto';
            modalImage.classList.remove('scale-100');
            modalImage.classList.add('scale-90');
        }

        projectImages.forEach(image => {
            image.addEventListener('click', (e) => {
                openModal(e.target.src);
            });
        });
        
        // -----------------------------------------------------------
        // 6. Download Modal (Підтвердження завантаження CV)
        // -----------------------------------------------------------
        const downloadModal = document.getElementById('download-modal');
        const confirmDownloadBtn = document.getElementById('confirm-download-btn');
        const navDownloadBtn = document.getElementById('nav-download-btn');
        const contactDownloadBtn = document.getElementById('contact-download-btn');
        
        function openDownloadModal() {
            downloadModal.classList.remove('opacity-0', 'pointer-events-none');
            downloadModal.classList.add('opacity-100', 'pointer-events-auto');
            // Заблокувати прокрутку, якщо не заблоковано іншим модалом
            if (!imageModal.classList.contains('opacity-100')) {
                document.body.style.overflow = 'hidden';
            }
        }

        function closeDownloadModal() {
            downloadModal.classList.remove('opacity-100', 'pointer-events-auto');
            downloadModal.classList.add('opacity-0', 'pointer-events-none');
            // Відновити прокрутку, лише якщо не відкрито інший модал
            if (!imageModal.classList.contains('opacity-100')) {
                document.body.style.overflow = 'auto';
            }
        }
        
        // Встановлення URL для кнопки підтвердження
        confirmDownloadBtn.href = CV_DOWNLOAD_URL;
        
        // Додавання обробників подій до обох кнопок CV
        navDownloadBtn?.addEventListener('click', openDownloadModal);
        contactDownloadBtn?.addEventListener('click', openDownloadModal);

        // Обробка підтвердження (закриваємо модал після натискання кнопки завантаження)
        confirmDownloadBtn.addEventListener('click', () => {
             // Даємо браузеру час для обробки завантаження перед закриттям
             setTimeout(closeDownloadModal, 100);
        });


        // -----------------------------------------------------------
        // 7. Загальні обробники
        // -----------------------------------------------------------
        
        // Закриття модальних вікон при натисканні Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (imageModal.classList.contains('opacity-100')) {
                    closeModal();
                } else if (downloadModal.classList.contains('opacity-100')) {
                    closeDownloadModal();
                }
            }
        });

