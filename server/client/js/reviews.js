// /client/js/reviews.js
document.addEventListener('DOMContentLoaded', async () => {
    const phoneNumber = localStorage.getItem('userPhoneNumber');
    if (!phoneNumber) {
        alert('Требуется авторизация для просмотра отзывов.');
        window.location.href = '/login.html';
        return;
    }

    // Загрузка отзывов пользователя
    try {
        const response = await fetch(`/api/reviews/${phoneNumber}`);
        const reviews = await response.json();

        const reviewsContainer = document.getElementById('reviewsContainer');
        reviewsContainer.innerHTML = ''; // Очищаем контейнер перед добавлением отзывов

        if (reviews.length === 0) {
            reviewsContainer.innerHTML = '<p>У вас нет оставленных отзывов.</p>';
            return;
        }

        reviews.forEach(review => {
            const reviewCard = document.createElement('div');
            reviewCard.classList.add('review-card');
            reviewCard.innerHTML = `
                <div class="reviewww-content">
                    <h3>${review.event_title}</h3>
                    <p>${review.review_text}</p>
                    <p><strong>Рейтинг:</strong> ${review.rating} / 5</p>
                    <button class="edit-btn" data-review-id="${review.review_id}">Редактировать</button>
                    <button class="delete-btn" data-review-id="${review.review_id}">Удалить</button>
                </div>
            `;
            reviewsContainer.appendChild(reviewCard);
        });

        // Инициализация кнопок редактирования и удаления
        initializeEditButtons();
        initializeDeleteButtons();
    } catch (error) {
        console.error('Ошибка загрузки отзывов:', error);
        alert('Не удалось загрузить ваши отзывы.');
    }
});

// Инициализация кнопок редактирования
function initializeEditButtons() {
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const reviewId = e.target.getAttribute('data-review-id');
            window.location.href = `/editReview.html?review_id=${reviewId}`; // Перенаправляем на страницу редактирования отзыва
        });
    });
}


// Инициализация кнопок удаления
function initializeDeleteButtons() {
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const reviewId = e.target.getAttribute('data-review-id');
            const phoneNumber = localStorage.getItem('userPhoneNumber');

            try {
                const response = await fetch('/api/reviews/delete', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ review_id: reviewId, phone_number: phoneNumber }),
                });

                if (response.ok) {
                    alert('Отзыв удалён.');
                    location.reload(); // Перезагружаем страницу для обновления списка отзывов
                } else {
                    const error = await response.json();
                    alert(error.error || 'Ошибка удаления отзыва.');
                }
            } catch (error) {
                console.error('Ошибка удаления отзыва:', error);
                alert('Не удалось удалить отзыв.');
            }
        });
    });
}
