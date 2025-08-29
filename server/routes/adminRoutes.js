// server/routes/adminRoutes.js
const express = require('express');
const pool = require('../config/db'); // Подключение к базе данных

const router = express.Router();

// Преобразование длительности в INTERVAL
function parseDuration(duration) {
    const match = duration.match(/(\d+)\s*hours?\s*(\d+)?\s*minutes?/i);
    if (!match) return null;
    const hours = parseInt(match[1], 10) || 0;
    const minutes = parseInt(match[2], 10) || 0;
    return `${hours} hours ${minutes} minutes`;
}

// Добавление мероприятия
router.post('/add-event', async (req, res) => {
    const { title, description, event_type, venue_id, price, event_date, duration, status } = req.body;

    if (!title || !description || !event_date) {
        return res.status(400).json({ error: 'Пожалуйста, заполните все обязательные поля.' });
    }

    const parsedDuration = parseDuration(duration);
    if (!parsedDuration) {
        return res.status(400).json({ error: 'Неверный формат длительности. Используйте "X hours Y minutes".' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO events (title, description, event_type, venue_id, price, event_date, duration, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [title, description, event_type, venue_id, price, event_date, parsedDuration, status]
        );

        res.status(201).json({ message: 'Мероприятие успешно добавлено.', event: result.rows[0] });
    } catch (error) {
        console.error('Ошибка при добавлении мероприятия:', error.message);
        res.status(500).json({ error: 'Ошибка при добавлении мероприятия.' });
    }
});


// Получение типов мероприятий
router.get('/types', async (req, res) => {
    try {
        const result = await pool.query(`SELECT type_name FROM event_types ORDER BY type_name ASC`);
        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка получения типов мероприятий:', error.message);
        res.status(500).json({ error: 'Ошибка при загрузке типов мероприятий.' });
    }
});

module.exports = router;
