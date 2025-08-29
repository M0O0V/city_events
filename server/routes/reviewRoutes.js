// reviewRoutes.js
const express = require('express');
const pool = require('../config/db');

const router = express.Router();

// Добавление отзыва
router.post('/', async (req, res) => {
    const { phone_number, event_id, review_text, rating } = req.body;

    if (!phone_number || !event_id || !review_text || !rating) {
        return res.status(400).json({ error: 'Все поля обязательны.' });
    }

    const query = `
        INSERT INTO reviews (phone_number, event_id, review_text, rating)
        VALUES ($1, $2, $3, $4) RETURNING *;
    `;

    try {
        const result = await pool.query(query, [phone_number, event_id, review_text, rating]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Ошибка при добавлении отзыва:', error.message);
        res.status(500).json({ error: 'Ошибка сервера.' });
    }
});

// Получение всех отзывов для пользователя
router.get('/:phone_number', async (req, res) => {
    const { phone_number } = req.params;

    const query = `
        SELECT reviews.review_id, reviews.review_text, reviews.rating, events.title AS event_title
        FROM reviews
        JOIN events ON reviews.event_id = events.event_id
        WHERE reviews.phone_number = $1;
    `;

    try {
        const result = await pool.query(query, [phone_number]);
        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка при получении отзывов:', error.message);
        res.status(500).json({ error: 'Ошибка сервера.' });
    }
});

// Удаление отзыва
router.delete('/delete', async (req, res) => {
    const { review_id, phone_number } = req.body;

    const query = `DELETE FROM reviews WHERE review_id = $1 AND phone_number = $2 RETURNING *;`;

    try {
        const result = await pool.query(query, [review_id, phone_number]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Отзыв не найден.' });
        }
        res.status(200).json({ message: 'Отзыв удалён.' });
    } catch (error) {
        console.error('Ошибка при удалении отзыва:', error.message);
        res.status(500).json({ error: 'Ошибка сервера.' });
    }
});

module.exports = router;

