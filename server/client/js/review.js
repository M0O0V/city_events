document.getElementById('reviewForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('event_id');
    const reviewText = document.getElementById('reviewText').value;
    const rating = document.getElementById('rating').value;

    // Проверка авторизации
if (!localStorage.getItem('userPhoneNumber')) {
    alert('Только авторизованные пользователи могут оставлять отзывы.');
    return;
}

    try {
        const response = await fetch('/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phone_number: localStorage.getItem('userPhoneNumber'),
                event_id: eventId,
                review_text: reviewText,
                rating,
            }),
        });

        if (response.ok) {
            alert('Ваш отзыв успешно отправлен!');
            window.location.href = '/events.html';
        } else {
            const error = await response.json();
            alert(error.error || 'Ошибка отправки отзыва');
        }
    } catch (error) {
        console.error('Ошибка отправки отзыва:', error);
    }
});


