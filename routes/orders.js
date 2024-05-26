const express = require('express');
const router = express.Router();
const { database } = require('../config/helper');

// GET ALL ORDERS
router.get('/', (req, res) => {
  database.table('orders_details as od')
    .join([
      { table: 'orders as o', on: 'o.id = od.order_id' },
      { table: 'products as p', on: 'p.id = od.product_id' },
      { table: 'users as u', on: 'u.id = o.user_id' }
    ])
    .withFields(['o.id', 'p.title', 'p.description', 'p.price', 'u.username', 'od.quantity'])
    .getAll()
    .then(orders => {
      res.json(orders.length > 0 ? orders : { message: "No orders found" });
    })
    .catch(err => res.json(err));
});

// Get Single Order
router.get('/:id', (req, res) => {
  let orderId = req.params.id;

  database.table('orders_details as od')
    .join([
      { table: 'orders as o', on: 'o.id = od.order_id' },
      { table: 'products as p', on: 'p.id = od.product_id' },
      { table: 'users as u', on: 'u.id = o.user_id' }
    ])
    .withFields(['o.id', 'p.title', 'p.description', 'p.price', 'p.image', 'od.quantity as quantityOrdered'])
    .filter({ 'o.id': orderId })
    .getAll()
    .then(orders => {
      res.json(orders.length > 0 ? orders : { message: "No orders found" });
    })
    .catch(err => res.json(err));
});

// Place New Order
router.post('/new', async (req, res) => {
  let { userId, products } = req.body;

  if (userId !== null && userId > 0) {
    try {
      const user = await database.table('users').filter({ id: userId }).get();
      if (!user) {
        res.json({ message: 'New order failed: User does not exist', success: false });
        return;
      }

      const insertResult = await database.table('orders').insert({ user_id: userId });
      const newOrderId = insertResult.insertId;

      if (newOrderId > 0) {
        for (let p of products) {
          let productData = await database.table('products').filter({ id: p.id }).withFields(['quantity']).get();
          let inCart = parseInt(p.quantity);

          if (productData && productData.quantity !== undefined) {
            productData.quantity = productData.quantity - inCart;
            if (productData.quantity < 0) {
              productData.quantity = 0;
            }

            await database.table('orders_details').insert({
              order_id: newOrderId,
              product_id: p.id,
              quantity: inCart
            });

            await database.table('products').filter({ id: p.id }).update({ quantity: productData.quantity });
          } else {
            res.json({ message: 'New order failed while adding order details', success: false });
            return;
          }
        }

        res.json({
          message: `Order successfully placed with order id ${newOrderId}`,
          success: true,
          order_id: newOrderId,
          products: products
        });
      } else {
        res.json({ message: 'New order failed while adding order details', success: false });
      }
    } catch (err) {
      res.json({ message: 'New order failed while adding order details', success: false, error: err });
    }
  } else {
    res.json({ message: 'New order failed', success: false });
  }
});

// Update an Order
router.put('/:id', async (req, res) => {
  let orderId = req.params.id;
  let { userId, products } = req.body;

  try {
    await database.table('orders').filter({ id: orderId }).update({ user_id: userId });
    await database.table('orders_details').filter({ order_id: orderId }).remove();

    for (let p of products) {
      await database.table('orders_details').insert({
        order_id: orderId,
        product_id: p.id,
        quantity: p.quantity
      });

      let productData = await database.table('products').filter({ id: p.id }).withFields(['quantity']).get();
      let newQuantity = productData.quantity - p.quantity;
      if (newQuantity < 0) newQuantity = 0;

      await database.table('products').filter({ id: p.id }).update({ quantity: newQuantity });
    }

    res.json({ message: `Order ${orderId} successfully updated`, success: true });
  } catch (err) {
    res.json({ message: 'Failed to update order', success: false, error: err });
  }
});

// Delete an Order
router.delete('/:id', async (req, res) => {
  let orderId = req.params.id;

  try {
    await database.table('orders_details').filter({ order_id: orderId }).remove();
    await database.table('orders').filter({ id: orderId }).remove();

    res.json({ message: `Order ${orderId} successfully deleted`, success: true });
  } catch (err) {
    res.json({ message: 'Failed to delete order', success: false, error: err });
  }
});

// Payment Gateway
router.post('/payment', (req, res) => {
  setTimeout(() => {
    res.status(200).json({ success: true });
  }, 3000);
});

module.exports = router;
