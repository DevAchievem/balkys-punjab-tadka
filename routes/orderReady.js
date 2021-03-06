const express = require('express');
const bodyParser = require('body-parser');
// const sendSms = require('./twilio');
const router = express.Router();
const accountSid = 'ACb293030513abf9a16262c01ff0ef494e';
const authToken = '1ffdf3e513292591d994d72cc207f699';
const client = require('twilio')(accountSid, authToken);
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());module.exports = (db) => {
  router.post('/', (req, res) => {
    const id = 2;
    db.query(
      `SELECT menu_items.name as menu_item, customers.name, customers.phone_number, order_items.quantity
      FROM menu_items
      JOIN order_items ON menu_item_id = menu_items.id
      JOIN customers ON customers.id = customer_id
      WHERE customer_id = $1;`, [id])
      .then(data => {
        console.log(data.rows);
        const order = data.rows;
        const customer = order.name;
        console.log(order);
        let itemAndQuantity = [];
        for (const rows of data.rows) {
          console.log("each object of data: ", rows);
          itemAndQuantity.push(` ${rows.quantity} ${rows.menu_item}`);
        }        console.log(order);
        client.messages
          .create({
            body: `Your order of ${itemAndQuantity} is ready!.`,
            from: '+14132254219',
            to: '+16043186664'
          })
          .then(message => console.log(message.sid));
      });
  });
  return router;
};
