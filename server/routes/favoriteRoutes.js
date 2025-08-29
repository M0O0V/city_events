// favoriteRoutes.js
const express = require('express');
const pool = require('../config/db'); // Подключение к базе данных

const router = express.Router();

// Добавление мероприятия в избранное
router.post('/add', async (req, res) => {
    const { phone_number, event_id } = req.body;

    const query = `INSERT INTO favorite_events (phone_number, event_id) VALUES ($1, $2) RETURNING *;`;

    try {
        const result = await pool.query(query, [phone_number, event_id]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Ошибка при добавлении в избранное.' });
    }
});

// Удаление мероприятия из избранного
router.delete('/remove', async (req, res) => {
    const { phone_number, event_id } = req.body;

    const query = `DELETE FROM favorite_events WHERE phone_number = $1 AND event_id = $2 RETURNING *;`;

    try {
        const result = await pool.query(query, [phone_number, event_id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Мероприятие не найдено в избранном.' });
        }
        res.json({ message: 'Мероприятие удалено из избранного.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Ошибка при удалении из избранного.' });
    }
});

// Получение избранных мероприятий пользователя
router.get('/:phone_number', async (req, res) => {
    const { phone_number } = req.params;

    const query = `
        SELECT e.event_id, e.title, e.description, e.image_url, e.event_date, e.price, v.venue_name, v.venue_address, et.type_name
        FROM favorite_events fe
        JOIN events e ON fe.event_id = e.event_id
        JOIN venues v ON e.venue_id = v.venue_id
        JOIN event_types et ON e.event_type = et.type_name
        WHERE fe.phone_number = $1
    `;

    try {
        const result = await pool.query(query, [phone_number]);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Ошибка при загрузке избранных мероприятий.' });
    }
});

module.exports = router;
