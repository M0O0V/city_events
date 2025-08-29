// server/routes/eventRoutes.js
const express = require('express');
const pool = require('../config/db'); // Подключение к базе данных

const router = express.Router();

// Маршрут получения всех мероприятий с рейтингом
router.get('/', async (req, res) => {
    const { search, type, min_price, max_price, start_date, end_date, min_rating } = req.query;

    const queryParams = [];
    let query = `
        SELECT e.event_id, e.title, e.description, e.image_url, e.organizer_url, e.price, e.event_date,
               COALESCE(EXTRACT(EPOCH FROM e.duration) / 60, 0) AS duration_minutes, e.status,
               v.venue_name, v.venue_address, et.type_name,
               COALESCE(ROUND(AVG(r.rating)::NUMERIC, 1), 0) AS average_rating
        FROM events e
        LEFT JOIN venues v ON e.venue_id = v.venue_id
        LEFT JOIN event_types et ON e.event_type = et.type_name
        LEFT JOIN reviews r ON e.event_id = r.event_id
        WHERE e.status = 'active'
    `;

    if (search) {
        queryParams.push(`%${search}%`);
        query += ` AND LOWER(e.title) LIKE LOWER($${queryParams.length})`;
    }
    if (type) {
        queryParams.push(type);
        query += ` AND et.type_name = $${queryParams.length}`;
    }
    if (min_price) {
        queryParams.push(min_price);
        query += ` AND e.price >= $${queryParams.length}`;
    }
    if (max_price) {
        queryParams.push(max_price);
        query += ` AND e.price <= $${queryParams.length}`;
    }
    if (start_date) {
        queryParams.push(start_date);
        query += ` AND e.event_date >= $${queryParams.length}`;
    }
    if (end_date) {
        queryParams.push(end_date);
        query += ` AND e.event_date <= $${queryParams.length}`;
    }
    if (min_rating) {
        queryParams.push(min_rating);
        query += ` HAVING AVG(r.rating) >= $${queryParams.length}`;
    }
    if (type) {
        queryParams.push(type);
        query += ` AND et.type_name = $${queryParams.length}`;
    }

    query += ` GROUP BY e.event_id, v.venue_name, v.venue_address, et.type_name`;

    try {
        const result = await pool.query(query, queryParams);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка сервера');
    }
});

// Обновление информации о мероприятии (для администраторов)
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, image_url, event_date, price, status } = req.body;

    const query = `
        UPDATE events
        SET title = $1, description = $2, image_url = $3, event_date = $4, price = $5, status = $6
        WHERE event_id = $7
        RETURNING *;
    `;
    try {
        const result = await pool.query(query, [title, description, image_url, event_date, price, status, id]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Ошибка при обновлении мероприятия.' });
    }
});

// Удаление мероприятия (для администраторов)
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    const query = `DELETE FROM events WHERE event_id = $1 RETURNING *;`;
    try {
        const result = await pool.query(query, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Мероприятие не найдено.' });
        }
        res.json({ message: 'Мероприятие удалено.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Ошибка при удалении мероприятия.' });
    }
});

// Маршрут получения типов мероприятий
router.get('/types', async (req, res) => {
    try {
        const result = await pool.query(`SELECT type_name FROM event_types ORDER BY type_name ASC`);
        res.json(result.rows);
    } catch (err) {
        console.error('Ошибка получения типов мероприятий:', err.message);
        res.status(500).json({ error: 'Ошибка при загрузке типов мероприятий.' });
    }
});

module.exports = router;
