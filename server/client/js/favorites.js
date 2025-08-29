//\server\client\js\favorites.js
document.addEventListener('DOMContentLoaded', async () => {
    const phoneNumber = localStorage.getItem('userPhoneNumber');
    if (!phoneNumber) {
        alert('Требуется авторизация для просмотра избранных мероприятий.');
        window.location.href = '/login.html';
        return;
    }

    try {
        const response = await fetch(`/api/favorites/${phoneNumber}`);
        const favorites = await response.json();

        const favoritesContainer = document.getElementById('favoritesContainer');
        favoritesContainer.innerHTML = '';

        if (favorites.length === 0) {
            favoritesContainer.innerHTML = '<p>У вас нет избранных мероприятий.</p>';
            return;
        }

        favorites.forEach(event => {
            const eventCard = document.createElement('div');
            eventCard.classList.add('event-card');
            eventCard.innerHTML = `
                <img src="${event.image_url}" alt="${event.title}">
                <div class="event-card-content">
                    <h3>${event.title}</h3>
                    <p>${event.event_date}</p>
                    <p>${event.venue_name}, ${event.venue_address}</p>
                    <button class="remove-btn" data-event-id="${event.event_id}">Удалить</button>
                </div>
            `;
            favoritesContainer.appendChild(eventCard);
        });

        initializeRemoveButtons();
    } catch (error) {
        console.error('Ошибка загрузки избранного:', error);
        alert('Не удалось загрузить избранное.');
    }
});


// Удаление из избранного
function initializeRemoveButtons() {
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const eventId = e.target.getAttribute('data-event-id');
            try {
                const response = await fetch('/api/favorites/remove', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        phone_number: localStorage.getItem('userPhoneNumber'),
                        event_id: eventId,
                    }),
                });

                if (response.ok) {
                    alert('Мероприятие удалено из избранного.');
                    location.reload();
                } else {
                    const error = await response.json();
                    alert(error.error || 'Ошибка удаления из избранного.');
                }
            } catch (error) {
                console.error('Ошибка удаления из избранного:', error);
                alert('Не удалось удалить мероприятие.');
            }
        });
    });
}
