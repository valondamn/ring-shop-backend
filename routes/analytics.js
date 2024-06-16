const express = require('express');
const router = express.Router();
const { database } = require('../config/helper');

// Маршрут для получения суммы заказов за сегодняшний день
router.get('/daily-revenue', (req, res) => {
  const today = new Date().toISOString().split('T')[0]; // Получаем текущую дату в формате YYYY-MM-DD

  database.table('orders_details')
    .filter({ order_date: today })
    .withFields(['SUM(total_amount) as dailyRevenue'])
    .get()
    .then(result => {
      res.json(result);
    })
    .catch(err => res.json({ error: err }));
});

// Маршрут для получения суммы заказов за последнюю неделю


module.exports = router;
