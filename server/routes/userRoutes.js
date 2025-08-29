// userRoutes.js
const express = require('express');
const bcrypt = require('bcrypt');
const { Pool } = require('pg'); // Подключение к PostgreSQL
const router = express.Router();

// Настройка пула соединений с базой данных
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'city_events',
    password: '1984',
    port: 5432,
});

// Обработка регистрации
router.post('/register', async (req, res) => {
    console.log(req.body); // Это покажет, что сервер получает из формы
    const { nickname, phone_number, email, password } = req.body;

    if (!password) {
        return res.status(400).json({ error: 'Пароль обязателен' });
    }

    try {
        // Проверка, существует ли уже пользователь с таким же никнеймом, email или номером телефона
        const userCheckQuery = `SELECT * FROM users WHERE nickname = $1 OR email = $2 OR phone_number = $3`;
        const existingUser = await pool.query(userCheckQuery, [nickname, email, phone_number]);

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'Пользователь с таким никнеймом, email или телефоном уже существует' });
        }

        // Хеширование пароля
        const hashedPassword = await bcrypt.hash(password, 10);

        // Вставка нового пользователя в базу данных
        const insertUserQuery = `
            INSERT INTO users (phone_number, nickname, password, email, role)
            VALUES ($1, $2, $3, $4, 'registered') RETURNING *
        `;
        const newUser = await pool.query(insertUserQuery, [phone_number, nickname, hashedPassword, email]);

        // Перенаправление на страницу логина
        res.redirect('/login.html'); // Убедитесь, что файл login.html доступен из статической папки
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка при регистрации' });
    }
});

// Обработка входа
router.post('/login', async (req, res) => {
    const { phone_number, password } = req.body;

    try {
        // Проверка пользователя по номеру телефона
        const userQuery = 'SELECT * FROM users WHERE phone_number = $1';
        const userResult = await pool.query(userQuery, [phone_number]);

        if (userResult.rows.length === 0) {
            return res.status(400).json({ error: 'Пользователь не найден' });
        }

        const user = userResult.rows[0];

        // Проверка пароля
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Неверный пароль' });
        }

        // Ответ успешного входа
        res.status(200).json({ message: 'Вход выполнен успешно', user: { phone_number: user.phone_number, nickname: user.nickname, email: user.email } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

module.exports = router;
