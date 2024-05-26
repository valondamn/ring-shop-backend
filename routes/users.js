const express = require('express');
const router = express.Router();
const { database } = require('../config/helper');

// Получение списка всех пользователей
router.get('/', (req, res) => {
  database.table('users')
    .getAll()
    .then(users => {
      res.status(200).json(users);
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({ message: 'Failed to fetch users.' });
    });
});

// Добавление нового пользователя
router.post('/add', (req, res) => {
  const { username, password, email, fname, lname, age, role, photoUrl, type } = req.body;

  // Проверяем, чтобы все необходимые поля были заполнены
  if (!username || !password || !email || !type) {
    return res.status(400).json({ message: 'Username, password, email, and type are required.' });
  }

  // Вставляем нового пользователя в базу данных
  database.table('users')
    .insert({ username, password, email, fname, lname, age, role, photoUrl, type })
    .then(userId => {
      res.status(201).json({ message: 'User added successfully!', userId });
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({ message: 'Failed to add user.' });
    });
});

// Обновление данных пользователя
router.put('/:id', (req, res) => {
  const userId = req.params.id;
  const { username, password, email, fname, lname, age, role, photoUrl, type } = req.body;

  // Обновляем данные пользователя в базе данных
  database.table('users')
    .filter({ id: userId })
    .update({ username, password, email, fname, lname, age, role, photoUrl, type })
    .then(result => {
      if (result) {
        res.status(200).json({ message: 'User updated successfully!' });
      } else {
        res.status(404).json({ message: 'User not found.' });
      }
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({ message: 'Failed to update user.' });
    });
});

// Удаление пользователя
router.delete('/delete/:id', async (req, res) => {
  const userId = req.params.id;
  if (userId !== null && userId > 0) {
    // Удаляем пользователя из базы данных
    try {
      const deletedUser = await database.table('users').filter({id: userId}).remove();

      if (deletedUser) {
        res.status(200).json({message: 'User deleted successfully!'});
      } else {
        res.status(404).json({message: 'User not found.'});
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({message: 'Failed to delete user.'});
    }
  }
});

module.exports = router;
