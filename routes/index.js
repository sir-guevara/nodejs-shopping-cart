const express = require('express');
const router = express.Router();
const Cart = require('../models/cart');
const Product = require('../models/product');
const multer = require('multer');
var upload = multer({ dest: 'public/images/uploads' });
var keys = require('../config/keys')

const stripe = require('stripe')(keys.stripeSecretKey);

/* GET home page. */
router.get('/', function(req, res, next) {
  var messages = req.flash('success')
  Product.find().sort('title')
  .then(function (docs) {
    res.render('shop/index', { title: 'Welcome To QQmedics' , products:docs, messages:messages, hasErrors:messages.length >0, type:'success'});
    });

});


// get add product form
router.get('/add-product/', function(req, res){
  res.render('shop/add-product',{title:'Add new products to shop'})
})


// // Add Product
// router.post('/add-product/',upload.single('image'),function(req, res){
//   var extension = req.file.mimetype.split("/")[1];
//   let path  = req.file.path.split("/");
//   path =`${path[1]}/${path[2]}/${path[3]}`;
//   let data ={
//     type: req.body.type,
//     title: req.body.title,
//     summary:req.body.summary,
//     description: req.body.description,
//     unit: req.body.unit,
//     price: req.body.price,
//     amount: req.body.amount,
//     imagePath: path
//   }

//   var product = new Product(data);
//   product.save((err)=>{
//      if(err){
//             req.flash('danger', "Something Went Wrong TRY AGAIN")
//             res.redirect("/add-product");
//         } else {
//             req.flash('success', "Product Added")
//             res.redirect("/");
//         }
//   });
// })


//Add Items to Cart
router.get('/add-to-cart/:id/', function(req, res){
  var productId = req.params.id;
  var cart = new Cart (req.session.cart ? req.session.cart : {});

  Product.findById(productId, function(err, product){
    if (err){
      return  res.redirect('/');
    }
    cart.add(product, product.id);
    req.session.cart =cart;
    // console.log(req.session.cart);
    res.redirect("/")
  });
});


//Get shopping cart Page
router.get('/shopping-cart/', function(req, res, next){
  if(!req.session.cart){

    return res.render('shop/shopping-cart', { title: 'Shopping Cart',stripPublishableKey:keys.stripePublishableKey, products: null});
  }

  var cart = new Cart(req.session.cart);
  var messages = req.flash('danger');

  res.render('shop/shopping-cart', { title: 'Shopping Cart', stripePublishableKey:keys.stripePublishableKey, products: cart.generateArray(), totalPrice: cart.totalPrice, messages: messages, hasErrors: messages.length > 0,type:'danger'});


});

//Get Remove ByOne
router.get('/reduce/:id/', function (req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});
  cart.reduceByOne(productId);
  req.session.cart = cart;
   res.redirect('/shopping-cart');
});

//Get Remove all Page
router.get('/remove/:id/', function (req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});
  cart.removeItem(productId);
  req.session.cart = cart;
  res.redirect('/shopping-cart');
});



// get product
router.get('/product/:id/', function(req, res){
  Product.findById(req.params.id,function(err, item){
    if (err){
      console.log(err)
    }else{
      res.render('shop/product',{
        title:item.title,item:item
      })
    }
  });
});

// get select product
router.get('/products/:category/', function(req, res) {
  var messages = req.flash('success')
  let category = req.params.category;
  if (category == 'cannabis'){
    category = 'marijuana';
  }
 
  Product.find({type:category})
  .then(function (docs) {
    if (category == 'marijuana'){
      category = 'cannabis';
    }
    res.render('shop/products', { title:category , products:docs, messages:messages, hasErrors:messages.length >0, type:'success'});
    });

});

router.post('/charge/', function(req, res){
  const amount = req.body.priz;
  stripe.customers.create({
    email:req.body.stripeEmail,
    source: req.body.stripeToken
  }).then(customer => stripe.charges.create({
    amount,
    description:`QQmedics Medication Order ${req.body.orderItem}`,
    currency: 'usd',
    customer:customer.id
  })).then(charge => (res.render('shop/order', {title:'Delivery Address', orderItems: req.body.orderItems})))
})


module.exports = router;


