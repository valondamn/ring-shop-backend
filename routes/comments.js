const express = require('express');
const router = express.Router();
const { database } = require('../config/helper');

// Получение комментариев для продукта
router.get('/:productId', (req, res) => {
  const productId = req.params.productId;
  database.table('comments as c')
    .join([
      {
        table: 'users as u',
        on: 'c.user_id = u.id'
      }
    ])
    .withFields(['c.comment', 'u.email as user_email'])
    .filter({ 'c.product_id': productId })
    .getAll()
    .then(comments => {
      res.json(comments);
    })
    .catch(err => res.json(err));
});

// Добавление нового комментария
router.post('/', (req, res) => {
  const { user_id, product_id, comment } = req.body;
  if (user_id && product_id && comment) {
    database.table('comments')
      .insert({
        user_id,
        product_id,
        comment
      })
      .then(newCommentId => {
        // Изменено на правильное имя столбца, если это не `id`
        database.table('comments as c')
          .join([
            {
              table: 'users as u',
              on: 'c.user_id = u.id'
            }
          ])
          .withFields(['c.comment', 'u.email as user_email'])
          .filter({ 'c.comment_id': newCommentId.insertId }) // Измените на правильное имя столбца
          .get()
          .then(newComment => {
            res.json(newComment);
          })
          .catch(err => res.json(err));
      })
      .catch(err => res.json(err));
  } else {
    res.json({ message: 'Missing fields' });
  }
});

module.exports = router;
