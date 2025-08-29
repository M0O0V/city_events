// Получаем параметр review_id из URL
const urlParams = new URLSearchParams(window.location.search);
const reviewId = urlParams.get('review_id');

// Функция для загрузки отзыва
async function loadReviewForEditing() {
    try {
        const response = await fetch(`/api/reviews/${reviewId}`);
        const review = await response.json();

        // Заполняем поля формы значениями отзыва
        document.getElementById('reviewTitle').value = review.event_title;
        document.getElementById('reviewText').value = review.review_text;
        document.getElementById('reviewRating').value = review.rating;
    } catch (error) {
        console.error('Ошибка загрузки отзыва:', error);
        alert('Не удалось загрузить отзыв для редактирования.');
    }
}

// Загружаем отзыв при загрузке страницы
loadReviewForEditing();

// Обработчик отправки формы
document.getElementById('editReviewForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Получаем отредактированные данные
    const updatedReview = {
        event_title: document.getElementById('reviewTitle').value,
        review_text: document.getElementById('reviewText').value,
        rating: document.getElementById('reviewRating').value,
    };

    try {
        const response = await fetch(`/api/reviews/${reviewId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedReview),
        });

        if (response.ok) {
            alert('Отзыв успешно отредактирован!');
            window.location.href = '/reviews.html'; // Перенаправляем на страницу отзывов
        } else {
            const error = await response.json();
            alert(error.error || 'Ошибка при редактировании отзыва.');
        }
    } catch (error) {
        console.error('Ошибка при редактировании отзыва:', error);
        alert('Не удалось отредактировать отзыв.');
    }
});
