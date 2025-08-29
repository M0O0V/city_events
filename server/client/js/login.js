// \server\client\js\login.js
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('.login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const phone_number = loginForm.phone_number.value;
            const password = loginForm.password.value;

                       // Заданные данные для входа администратора
                        const adminPhone = '20040624';
                        const adminPassword = 'admin24';

                        if (phone_number === adminPhone && password === adminPassword) {
                            // Имитация регистрации администратора, если его нет в базе данных
                            const adminData = {
                                phone_number: adminPhone,
                                password: adminPassword,
                                isAdmin: true,
                            };
            
                            localStorage.setItem('authToken', 'admin-token'); // Токен для админа
                            localStorage.setItem('userPhoneNumber', adminPhone); // Сохраняем номер телефона
                            localStorage.setItem('userData', JSON.stringify(adminData)); // Сохраняем данные администратора
                            window.location.href = '/admin.html'; // Перенаправляем на страницу администратора
                            return;
                        }
            

            try {
                const response = await fetch('/api/users/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone_number, password }),
                });

                if (response.ok) {
                    const data = await response.json();
                    localStorage.setItem('authToken', data.token); // Сохраняем токен
                    localStorage.setItem('userPhoneNumber', phone_number); // Сохраняем номер телефона
                    window.location.href = '/events'; // Перенаправление на страницу мероприятий
                } else {
                    const data = await response.json();
                    alert(data.error || 'Ошибка при попытке входа.');
                }
            } catch (error) {
                console.error('Ошибка при входе:', error);
                alert('Произошла ошибка. Пожалуйста, попробуйте снова позже.');
            }
        });
    } else {
        console.error('Форма для входа не найдена.');
    }
});
