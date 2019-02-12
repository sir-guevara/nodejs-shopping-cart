var express = require('express');
var router = express.Router();
var Cart = require('../models/cart');
var Product = require('../models/product');


//Placing Order
router.post("/", (req, res) => {
    var output = `<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css">
                    <p> New Order   </p>
                    <h3>Contact Details </h3>
                    <ul class='list-group'>
                        <li class='list-group-item'>Name: ${req.body.name} </li>
                        <li class='list-group-item'> Address:${req.body.address}</li>
                        <li class='list-group-item'> Phone:${req.body.phone}</li>   
                        <li class='list-group-item'>Message: ${req.body.message}</li>
                    </ul><br><hr>
                    <p> 
                    <h3 class="text-primary"> Order </h3>
                    <ul class="list-group">

                        ${req.body.orderItems}
                    </ul>
                    </p>
                    `;
    var api_key = 'key-ac2ba5a140ed072f084da560c6f46ebc';
    var domain = 'sandbox371e85dd0701445c99ec997c2b82773f.mailgun.org';
    var mailgun = require('mailgun-js')({ apiKey: api_key, domain: domain });

    var data = {
        from: 'QQmedics <postmaster@sandbox371e85dd0701445c99ec997c2b82773f.mailgun.org>',
        to: 'qqmedics@gmail.com',
        subject: `New Order from [${req.body.name}]`,
        html: output
    };
    

    mailgun.messages().send(data, function (error, body) {
        if (error) {
            console.log('this is an error', error);
            req.flash('danger', ' Failed to Place Order Try again');
            res.redirect("/shopping-cart/");
        } else {
            req.flash('success', 'Order Sent ');
            req.session.cart = null;
            res.render("shop/success");
        }
    });
});

module.exports = router;

