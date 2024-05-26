const express = require('express');
const router = express.Router();
const {database} = require('../config/helper')



/* ALL PRODUCTS *//* ALL PRODUCTS */
router.get('/', function(req, res) {
  const page = req.query.page || 1; // Убираем проверку на наличие параметра и устанавливаем значение по умолчанию 1
  const limit = req.query.limit || 10000; // Убираем проверку на наличие параметра и устанавливаем значение по умолчанию 10000

  const startValue = (page - 1) * limit;
  const endValue = page * limit;

  database.table('products as p')
    .join([
      {
        table: 'categories as c',
        on: 'c.id = p.cat_id'
      }
    ])
    .withFields([
      'c.title as category',
      'p.title as title',
      'p.price',
      'p.quantity',
      'p.description',
      'p.short_desc',
      'p.image',
      'p.cat_id',
      'p.id'
    ])
    .slice(startValue, endValue)
    .sort({ id: -1 })
    .getAll()
    .then(prods => {
      if (prods.length > 0) {
        res.status(200).json({
          products: prods,
          count: prods.length
        });
      } else {
        res.json({ message: 'No products found' });
      }
    }).catch(err => { console.log(err) });
});

/* GET ALL PRODUCTS BY CATEGORY*/
router.get('/category/:catName', (req, res) => {
  const page = req.query.page || 1; // Убираем проверку на наличие параметра и устанавливаем значение по умолчанию 1
  const limit = req.query.limit || 10000; // Убираем проверку на наличие параметра и устанавливаем значение по умолчанию 10000

  const startValue = (page - 1) * limit;
  const endValue = page * limit;

  // Get category title value from param
  const cat_title = req.params.catName;

  database.table('products as p')
    .join([
      {
        table: "categories as c",
        on: `c.id = p.cat_id WHERE c.title LIKE '%${cat_title}%'`
      }
    ])
    .withFields([
      'c.title as category',
      'p.title as name',
      'p.price',
      'p.quantity',
      'p.description',
      'p.image',
      'p.id'
    ])
    .slice(startValue, endValue)
    .sort({ id: 1 })
    .getAll()
    .then(prods => {
      if (prods.length > 0) {
        res.status(200).json({
          count: prods.length,
          products: prods
        });
      } else {
        res.json({ message: `No products found matching the category ${cat_title}` });
      }
    }).catch(err => res.json(err));
});


/* SINGLE PRODUCT */
router.get('/:prodId', (req, res) => {
  let productId = req.params.prodId;
  database.table('products as p')
    .join([
      {
        table: "categories as c",
        on: `c.id = p.cat_id`
      }
    ])
    .withFields(['c.title as category',
      'p.title as name',
      'p.price',
      'p.quantity',
      'p.description',
      'p.image',
      'p.id',
      'p.images'
    ])
    .filter({'p.id': productId})
    .get()
    .then(prod => {
      console.log(prod);
      if (prod) {
        res.status(200).json(prod);
      } else {
        res.json({message: `No product found with id ${productId}`});
      }
    }).catch(err => res.json(err));
});

/* GET ALL PRODUCTS BY CATEGORY*/
router.get('/category/:catName', (req, res) => { // Sending Page Query Parameter is mandatory http://localhost:3636/api/products/category/categoryName?page=1
  let page = (req.query.page !== undefined && req.query.page !== 0) ? req.query.page : 1;   // check if page query param is defined or not
  const limit = (req.query.limit !== undefined && req.query.limit !== 0) ? req.query.limit : 10000;   // set limit of items per page
  let startValue;
  let endValue;
  if (page > 0) {
    startValue = (page * limit) - limit;      // 0, 10, 20, 30
    endValue = page * limit;                  // 10, 20, 30, 40
  } else {
    startValue = 0;
    endValue = 1000;
  }

  // Get category title value from param
  const cat_title = req.params.catName;

  database.table('products as p')
    .join([
      {
        table: "categories as c",
        on: `c.id = p.cat_id WHERE c.title LIKE '%${cat_title}%'`
      }
    ])
    .withFields(['c.title as category',
      'p.title as name',
      'p.price',
      'p.quantity',
      'p.description',
      'p.image',
      'p.id'
    ])
    .slice(startValue, endValue)
    .sort({id: 1})
    .getAll()
    .then(prods => {
      if (prods.length > 0) {
        res.status(200).json({
          count: prods.length,
          products: prods
        });
      } else {
        res.json({message: `No products found matching the category ${cat_title}`});
      }
    }).catch(err => res.json(err));

});

// Update product
router.put('/:id', (req, res) => {
  const productId = req.params.id;
  const { title, image, images, description, price, quantity, short_desc, cat_id } = req.body;

  database.table('products')
    .filter({ id: productId })
    .update({
      title: title,
      image: image,
      images: images,
      description: description,
      price: price,
      quantity: quantity,
      short_desc: short_desc,
      cat_id: cat_id
    })
    .then(result => {
      if (result) {
        res.status(200).json({ message: 'Product updated successfully!', success: true });
      } else {
        res.status(404).json({ message: 'Product not found', success: false });
      }
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({ message: 'Failed to update product.', success: false, error: error });
    });
});

router.post('/add', (req, res) => {
// Assuming your database object has an `insert` function
  let { title, image, images, description, price, quantity, short_desc, cat_id} = req.body;

  database.table('products')
    .insert({ title: title,
      image:image,
      images: images,
      description:description,
      price:price,
      quantity:quantity,
      short_desc:short_desc,
      cat_id: cat_id})
    .then(productId => {
      // Product saved successfully
      res.status(201).json({ message: 'Product created successfully!', productId });
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({ message: 'Failed to create product.' });
    });
});



router.delete('/delete/:id', async (req, res) => {
  let productId = req.params.id;

  if (productId !== null && productId > 0) {
    try {
      // Удаляем продукт из базы данных
      const deletedProduct = await database.table('products').filter({ id: productId }).remove();

      if (deletedProduct) {
        res.json({ message: `Product with ID ${productId} successfully deleted.`, success: true });
      } else {
        res.json({ message: `Product with ID ${productId} not found.`, success: false });
      }
    } catch (error) {
      console.log("Error:", error);
      res.status(500).json({ message: 'Failed to delete product.', success: false, error: error });
    }
  } else {
    res.status(400).json({ message: 'Invalid product ID.', success: false });
  }
});

module.exports = router;
