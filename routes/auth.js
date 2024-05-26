const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { database } = require('../config/helper');

const secretKey = 'Vv180689'; // Используйте более надежный ключ

// Регистрация
router.post('/register', async (req, res) => {
  const { username, password, email, fname, lname, age, role, photoUrl, type } = req.body;
  try {
    // Проверка существования пользователя
    const userExists = await database.table('users').filter({ username: username }).get();
    if (userExists) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await database.table('users').insert({
      username: username,
      password: hashedPassword,
      email: email,
      fname: fname,
      lname: lname,
      age: age || 18,
      role: role || 555,
      photoUrl: photoUrl || null,
      type: type || 'local'
    });
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to register user.' });
  }
});

// Авторизация
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await database.table('users').filter({ username: username }).get();
    if (user) {
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        const token = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: '1h' });
        res.status(200).json({ token, user: { id: user.id, username: user.username, email: user.email, fname: user.fname, lname: user.lname, age: user.age, photoUrl: user.photoUrl } });
      } else {
        res.status(401).json({ message: 'Invalid credentials.' });
      }
    } else {
      res.status(404).json({ message: 'User not found.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to login.' });
  }
});

// Обновление профиля
router.put('/profile/:id', async (req, res) => {
  const userId = req.params.id;
  const { username, password, email, fname, lname, age, photoUrl } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await database.table('users').filter({ id: userId }).update({
      username: username,
      password: hashedPassword,
      email: email,
      fname: fname,
      lname: lname,
      age: age,
      photoUrl: photoUrl
    });
    res.status(200).json({ message: 'Profile updated successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update profile.' });
  }
});

const authenticateJWT = (req, res, next) => {
  const token = req.header('Authorization').split(' ')[1];
  if (token) {
    jwt.verify(token, secretKey, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

// Пример защищенного маршрута
router.get('/protected', authenticateJWT, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

module.exports = router;
