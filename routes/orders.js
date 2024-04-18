const express = require('express');
const router = express.Router();
const {database} = require('../config/helper');
const crypto = require('crypto');

router.use(express.json());


// GET ALL ORDERS
router.get('/', (req, res) => {
  database.table('orders_details as od')
    .join([
      {
        table: 'orders as o',
        on: 'o.id = od.order_id'
      },
      {
        table: 'products as p',
        on: 'p.id = od.product_id'
      },
      {
        table: 'users as u',
        on: 'u.id = o.user_id'
      }
    ])
    .withFields(['o.id', 'p.title', 'p.description', 'p.price', 'u.username'])
    .getAll()
    .then(orders => {
      if (orders.length > 0) {
        res.json(orders);
      } else {
        res.json({message: "No orders found"});
      }

    }).catch(err => res.json(err));
});

// Get Single Order
router.get('/:id', async (req, res) => {
  let orderId = req.params.id;
  console.log(orderId);

  database.table('orders_details as od')
    .join([
      {
        table: 'orders as o',
        on: 'o.id = od.order_id'
      },
      {
        table: 'products as p',
        on: 'p.id = od.product_id'
      },
      {
        table: 'users as u',
        on: 'u.id = o.user_id'
      }
    ])
    .withFields(['o.id', 'p.title', 'p.description', 'p.price', 'p.image', 'od.quantity as quantityOrdered'])
    .filter({'o.id': orderId})
    .getAll()
    .then(orders => {
      console.log(orders);
      if (orders.length > 0) {
        res.json(orders);
      } else {
        res.json({message: "No orders found"});
      }

    }).catch(err => res.json(err));
});

// Place New Order
router.post('/new', async (req, res) => {
  let { userId, products } = req.body;
  console.log("Received userId:", userId);
  console.log("Received products:", products);

  if (userId !== null && userId > 0) {
    database.table('orders')
      .insert({
        user_id: userId
      })
      .then(async (insertResult) => {
        const newOrderId = insertResult.insertId;
        console.log("New order ID:", newOrderId);
        if (newOrderId > 0) {
          for (let p of products) {
            let data = await database.table('products').filter({ id: p.id }).withFields(['quantity']).get();
            console.log("Product data:", data);
            let inCart = parseInt(p.incart);

            if (data && data.quantity !== undefined) {
              data.quantity = data.quantity - inCart;
              if (data.quantity < 0) {
                data.quantity = 0;
              }
            } else {
              console.log("Error: Invalid product data or quantity");
              res.json({ message: 'New order failed while adding order details', success: false });
              return; // Exit the function early
            }

            await database.table('orders_details').insert({
              order_id: newOrderId,
              product_id: p.id,
              quantity: inCart
            });

            await database.table('products').filter({ id: p.id }).update({ quantity: data.quantity });
          }

          res.json({
            message: `Order successfully placed with order id ${newOrderId}`,
            success: true,
            order_id: newOrderId,
            products: products
          });
        } else {
          console.log("Error: New order ID is invalid");
          res.json({ message: 'New order failed while adding order details', success: false });
        }
      })
      .catch(err => {
        console.log("Error:", err);
        res.json({ message: 'New order failed while adding order details', success: false, error: err });
      });
  } else {
    console.log("Error: Invalid userId");
    res.json({ message: 'New order failed', success: false });
  }
});


// Payment Gateway
router.post('/payment', (req, res) => {
  setTimeout(() => {
    res.status(200).json({success: true});
  }, 3000)
});






module.exports = router;
