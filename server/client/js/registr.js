document.querySelector('#registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
        const response = await fetch('/api/users/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (response.ok) {
            alert(result.message);
            window.location.href = result.redirectUrl; // Перенаправление на страницу логина
        } else {
            alert(result.error);
        }
    } catch (error) {
        console.error('Ошибка регистрации:', error);
    }
});
