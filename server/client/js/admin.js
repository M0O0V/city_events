//   server\client\js\admin.js
document.addEventListener('DOMContentLoaded', () => {
    // Загружаем данные о мероприятиях
    async function fetchEvents() {
    try {
        const response = await fetch('/api/events');
        if (!response.ok) {
            throw new Error('Ошибка загрузки данных');
        }
        const events = await response.json();
        displayEvents(events);
    } catch (error) {
        console.error('Ошибка загрузки мероприятий:', error);
        alert('Не удалось загрузить мероприятия. Попробуйте позже.');
    }
}

    // Проверка, авторизован ли пользователь
    function userIsLoggedIn() {
        const authToken = localStorage.getItem('authToken');
        return !!authToken; // Вернет true, если токен существует, иначе false
    }


    // Обновление видимости кнопок меню в зависимости от авторизации
function updateMenuVisibility() {
    const favoritesButton = document.getElementById('favoritesButton');
    const reviewsButton = document.getElementById('reviewsButton');

    if (userIsLoggedIn()) {
        // Показываем кнопки
        favoritesButton.style.display = 'inline-block';
        reviewsButton.style.display = 'inline-block';
    } else {
        // Скрываем кнопки
        favoritesButton.style.display = 'none';
        reviewsButton.style.display = 'none';
    }
}

    // Обновление кнопки в меню
    function updateMenuButton() {
        const logoutButton = document.getElementById('logoutButton');
        if (userIsLoggedIn()) {
            logoutButton.textContent = 'Выйти';
            logoutButton.addEventListener('click', logout);
        } else {
            logoutButton.textContent = 'Назад';
            logoutButton.addEventListener('click', () => window.history.back()); // Вернуться на предыдущую страницу
        }
    }

    // Логика выхода из системы
    function logout() {
        localStorage.removeItem('authToken');
        alert('Вы вышли из системы');
        window.location.href = '/index.html'; // Перенаправление на страницу входа
    }

    function getFormattedRating(event) {
        if (event.average_rating === undefined || event.average_rating === null) {
            console.warn(`У события ${event.event_id} отсутствует рейтинг.`);
            return 'Нет данных'; // Возвращаем текст, если рейтинг отсутствует
        }
        return `${event.average_rating} ⭐`; // Форматируем рейтинг с одной цифрой после запятой
    }


    function formatDuration(duration) {
        duration = parseFloat(duration);  // Преобразуем строку в число, если это необходимо
    
        if (isNaN(duration) || duration === 0) {
            return 'Не указано';  // Если продолжительность не указана или равна 0
        }
    
        // Если продолжительность представлена в минутах
        if (duration >= 60) {
            const hours = Math.floor(duration / 60);
            const minutes = duration % 60;
            return `${hours} ч. ${minutes} мин.`;
        }
    
        return `${duration} мин.`;  // Если продолжительность меньше 60 минут
    }


    // Отображение мероприятий
function displayEvents(events) {
    const eventsContainer = document.getElementById('eventsContainer');
    eventsContainer.innerHTML = ''; // Очищаем контейнер

    events.forEach(event => {
        const eventCard = document.createElement('div');
        eventCard.classList.add('event-card');
        
        eventCard.innerHTML = `
            <img src="${event.image_url}" alt="${event.title}">
            <div class="event-card-content">
                <h3>${event.title}</h3>
                <p><strong>Event ID:</strong> ${event.event_id}</p>  <!-- Выводим ID мероприятия -->
                <p><strong>Дата:</strong> ${new Date(event.event_date).toLocaleDateString()}</p>
                <p><strong>Описание:</strong> ${event.description || 'Нет описания'}</p>
                <p><strong>Цена:</strong> ${event.price ? `${event.price} руб.` : 'Бесплатно'}</p>
                <p><strong>Продолжительность:</strong> ${formatDuration(event.duration_minutes)}</p>  <!-- Используем форматированную продолжительность -->
                <p><strong>Место:</strong> ${event.venue_name}, ${event.venue_address}</p>
                <p><strong>Тип:</strong> ${event.type_name}</p>
                <p><strong>Рейтинг:</strong> <strong>${getFormattedRating(event)}</strong></p>
                <p><strong>Организатор:</strong> <a href="${event.organizer_url}" target="_blank">${event.organizer_url}</a></p>
                <div class="event-actions">

                    <button class="favorite-btn" data-event-id="${event.event_id}">❤️</button>
                    <button class="review-btn" data-event-id="${event.event_id}">Оставить отзыв</button>
                    
                </div>
            </div>
        `;
        eventsContainer.appendChild(eventCard);
    });

    // Добавляем обработчики для кнопок
    initializeFavoriteButtons();
    initializeReviewButtons();
}
    
// Инициализация кнопок избранного
function initializeFavoriteButtons() {
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('mouseover', (e) => {
            if (!userIsLoggedIn()) {
                const tooltip = document.createElement('div');
                tooltip.classList.add('tooltip');
                tooltip.textContent = 'Сохранять могут только зарегистрированные пользователи';
                document.body.appendChild(tooltip);

                // Позиционирование подсказки
                const rect = e.target.getBoundingClientRect();
                tooltip.style.left = `${rect.left + window.scrollX}px`;
                tooltip.style.top = `${rect.bottom + window.scrollY + 5}px`;

                // Удаление подсказки при отведении
                e.target.addEventListener('mouseout', () => tooltip.remove(), { once: true });
            }
        });

        btn.addEventListener('click', (e) => {
            const eventId = e.target.getAttribute('data-event-id');
            if (userIsLoggedIn()) {
                addToFavorites(eventId);
            } else {
                alert('Сохранять мероприятия могут только зарегистрированные пользователи.');
            }
        });
    });
}

// Инициализация кнопок отзывов
function initializeReviewButtons() {
    document.querySelectorAll('.review-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const eventId = e.target.getAttribute('data-event-id');
            if (userIsLoggedIn()) {
                window.location.href = `/review.html?event_id=${eventId}`;
            } else {
                // Создаем всплывающее сообщение
                const tooltip = document.createElement('div');
                tooltip.classList.add('tooltip');
                tooltip.textContent = 'Оставлять отзывы могут только зарегистрированные пользователи.';
                document.body.appendChild(tooltip);

                // Позиционирование сообщения
                const rect = e.target.getBoundingClientRect();
                tooltip.style.left = `${rect.left + window.scrollX}px`;
                tooltip.style.top = `${rect.bottom + window.scrollY + 10}px`;

                // Удаление сообщения через 3 секунды
                setTimeout(() => tooltip.remove(), 3000);
            }
        });
    });
}

// Добавление мероприятия в избранное
async function addToFavorites(eventId) {
    try {
        const response = await fetch('/api/favorites/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                phone_number: localStorage.getItem('userPhoneNumber'),
                event_id: eventId,
            }),
        });

        if (response.ok) {
            alert('Мероприятие добавлено в избранное!');
        } else {
            const error = await response.json();
            alert(error.error || 'Ошибка добавления в избранное.');
        }
    } catch (error) {
        console.error('Ошибка добавления в избранное:', error);
        alert('Произошла ошибка. Попробуйте снова.');
    }
}

// Функция загрузки типов мероприятий
async function fetchEventTypes() {
    try {
        const response = await fetch('/api/events/types');
        if (!response.ok) {
            throw new Error('Ошибка загрузки типов мероприятий');
        }
        const types = await response.json();
        populateEventTypeFilter(types);
    } catch (error) {
        console.error('Ошибка загрузки типов мероприятий:', error);
    }
}

// Заполнение выпадающего списка типами мероприятий
function populateEventTypeFilter(types) {
    const eventTypeFilter = document.getElementById('eventTypeFilter');
    types.forEach(type => {
        const option = document.createElement('option');
        option.value = type.type_name;
        option.textContent = type.type_name;
        eventTypeFilter.appendChild(option);
    });

    // Добавляем обработчик для изменения фильтра
    eventTypeFilter.addEventListener('change', (e) => {
        const selectedType = e.target.value;
        filterEventsByType(selectedType);
    });
}

// Фильтрация мероприятий по типу
function filterEventsByType(selectedType) {
    const allEvents = Array.from(document.querySelectorAll('.event-card'));
    allEvents.forEach(eventCard => {
        const eventType = eventCard.querySelector('p strong:contains("Тип")').nextSibling.textContent.trim();
        if (selectedType === '' || eventType === selectedType) {
            eventCard.style.display = 'block';
        } else {
            eventCard.style.display = 'none';
        }
    });
}

    // Переключение между сеткой и списком
    document.getElementById('toggleViewButton').addEventListener('click', () => {
        const eventsContainer = document.getElementById('eventsContainer');
        eventsContainer.classList.toggle('grid-view');
        eventsContainer.classList.toggle('list-view');
    });


    // Функция для поиска мероприятий
async function searchEvents(query) {
    try {
        const response = await fetch(`/api/events?search=${encodeURIComponent(query)}`);
        if (!response.ok) {
            throw new Error('Ошибка поиска мероприятий');
        }
        const events = await response.json();
        displayEvents(events);
    } catch (error) {
        console.error('Ошибка при поиске мероприятий:', error);
        alert('Не удалось выполнить поиск. Попробуйте позже.');
    }
}

// Добавляем обработчики для строки поиска
document.getElementById('searchButton').addEventListener('click', () => {
    const query = document.getElementById('searchInput').value.trim();
    searchEvents(query);
});

document.getElementById('searchInput').addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        const query = e.target.value.trim();
        searchEvents(query);
    }
});
// Функция сброса поиска
document.getElementById('resetButton').addEventListener('click', () => {
    document.getElementById('searchInput').value = ''; // Очистить поле ввода
    fetchEvents(); // Загрузить все мероприятия
});

// Загрузка мероприятий с учетом фильтров
async function fetchEvents() {
    const search = document.getElementById('searchInput').value;
    const type = document.getElementById('eventTypeFilter').value;
    const minPrice = document.getElementById('priceMin').value;
    const maxPrice = document.getElementById('priceMax').value;
    const startDate = document.getElementById('eventDateStart').value;
    const endDate = document.getElementById('eventDateEnd').value;
    const minRating = document.getElementById('minRating').value;

    try {
        const response = await fetch(`/api/events?search=${search}&type=${type}&min_price=${minPrice}&max_price=${maxPrice}&start_date=${startDate}&end_date=${endDate}&min_rating=${minRating}`);
        if (!response.ok) {
            throw new Error('Ошибка загрузки данных');
        }
        const events = await response.json();
        displayEvents(events);
    } catch (error) {
        console.error('Ошибка загрузки мероприятий:', error);
        alert('Не удалось загрузить мероприятия. Попробуйте позже.');
    }
}

// Применить фильтры
document.getElementById('applyFiltersButton').addEventListener('click', () => {
    fetchEvents(); // Загружаем мероприятия с учетом фильтров
});

// Сбросить фильтры
document.getElementById('resetFiltersButton').addEventListener('click', () => {
    // Сбрасываем все поля фильтров
    document.getElementById('priceMin').value = '';
    document.getElementById('priceMax').value = '';
    document.getElementById('eventDateStart').value = '';
    document.getElementById('eventDateEnd').value = '';
    document.getElementById('eventTypeFilter').value = '';
    document.getElementById('minRating').value = '';
    fetchEvents(); // Загружаем все мероприятия
});

// Функция для загрузки типов мероприятий
async function fetchEventTypes() {
    try {
        const response = await fetch('/api/events/types');
        if (!response.ok) {
            throw new Error('Ошибка загрузки типов мероприятий');
        }
        const types = await response.json();
        populateEventTypeFilter(types);
    } catch (error) {
        console.error('Ошибка загрузки типов мероприятий:', error);
    }
}

// Заполнение фильтра типами мероприятий
function populateEventTypeFilter(types) {
    const eventTypeFilter = document.getElementById('eventTypeFilter');
    types.forEach(type => {
        const option = document.createElement('option');
        option.value = type.type_name;
        option.textContent = type.type_name;
        eventTypeFilter.appendChild(option);
    });
}
// Обработчик клика по кнопке "Показать фильтры"
toggleFiltersButton.addEventListener('click', () => {
    // Если фильтры скрыты, показываем их
    if (filterSection.hidden) {
        filterSection.hidden = false;
        toggleFiltersButton.textContent = 'Скрыть фильтры'; // Меняем текст кнопки
    } else {
        // Если фильтры видны, скрываем их
        filterSection.hidden = true;
        toggleFiltersButton.textContent = 'Показать фильтры'; // Меняем текст кнопки обратно
    }
});

        // показ кнопки
    updateMenuVisibility();
    // Загружаем мероприятия
    fetchEvents();
        // типы
    fetchEventTypes();
    // Обновляем меню кнопки
    updateMenuButton();

    
});
