//index.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path'); // Для работы с путями файлов

// Импортируем маршруты (проверьте, что они существуют в папке routes)
const userRoutes = require('./routes/userRoutes'); 
const eventRoutes = require('./routes/eventRoutes'); 
const favoriteRoutes = require('./routes/favoriteRoutes'); 
const reviewRoutes = require('./routes/reviewRoutes'); 
const adminRoutes = require('./routes/adminRoutes');
const app = express();

app.use(express.json()); // Middleware для парсинга JSON
app.use('/user', userRoutes);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.post('/login', userRoutes);
app.post('/register', userRoutes);
// Включаем CORS и парсинг JSON
app.use(cors());
app.use(bodyParser.json());

// Обслуживаем статические файлы (например, css, js, изображения и index.html) из папки 'client'
app.use(express.static(path.join(__dirname, 'client')));

// Главная страница (index.html) будет доступна по корневому пути
app.get('/', (req, res) => {
    // Здесь предполагается, что index.html находится в папке 'client'
    res.sendFile(path.join(__dirname, 'client', 'index.html'));
});
app.get('/events', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'events.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'login.html'));
});



// Используем маршруты для API
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// Устанавливаем порт
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
