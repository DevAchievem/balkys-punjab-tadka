// ---------- Create menu items
let menuEntries = [];

const createMenuItems = function(menuItems) {
  return `
<form method='/menu' action="POST">
  <article class="menu-items">
    <header class="name-of-item">
      <span class="name">${menuItems.name}</span>
    </header>
    <main class="max-width">
      <p class="tweeted-text break-long-words hover-blur">${menuItems.description}</p>
    </main>
    <footer class="menu-item-footer">
      <span class="price">$${convertCentsToDollars(menuItems.price)}</span>
      <ul class="icons">
        <li><input id="numOfItems${menuItems.id}" type="number" required minlength="1" maxlength="1" placeholder="0"></li>
        <li><button data-id=${menuItems.id} class="order-button">Add</button>
        </li>
      </ul>
    </footer>
  </article>
</form>
`;
};



const convertCentsToDollars = function(cents) {
  const dollars = cents / 100;
  return dollars;
};

const renderMenu = function(items) {
  for (const item of items) {
    const menuHTML = createMenuItems(item);
    $('#menu-items-container').append(menuHTML);
  }
};

const loadMenu = function() {
  $
    .get('/api/menu/')
    .then((resp) => {
      renderMenu(resp.entries);
    });
};


// -----------  ADDING TO THE CART
const createAddToCart = function(menuItems) {
  return `
  <form action='/showCartPost' method="POST" class="bg-white">
  <div class="flex-column">
  <div class="item1">
    <p>Quantity:${menuItems.quantity}</p>
    <p>${menuItems.name}</p>
    <p>$${convertCentsToDollars(menuItems.price)}</p>
  </div>
</div>
</form>
`;
};

const createPlaceOrder = function() {
  return (`
  <div class="total-div"  class="bg-white">
    <p class="subtotal"> Food & Beverage Subtotal </p>
    <p class="tax"> GST </p>
    <p class="total"> Total </p>
    <p class="total-amt"> Total </p>
    <button class="place-order"> PLACE ORDER </button>
    <button class="place-order"> EMPTY CART </button>
  </div>`);
};

const renderCart = function(items) {
  // console.log('items', items);
  // loadCart();
  for (const item of items) {
    // console.log('item', item);
    const cartHTML = createAddToCart(item);
    $('.order-cart').prepend(cartHTML);
  }
  if ($('.order-cart .total-div').length === 0) {
    $('.order-cart').append(createPlaceOrder());
  }
};

const showCart = function(cartItems) {
  $
    .get('/api/showCart')
    .then((resp) => {
      console.log("response: ", resp);
      renderCart(resp.orderCart);
    });
};

const addCart = function(menuItem) {
  $
    .post('/api/addToCart', menuItem)
    .then((resp) => {
      console.log('RESPONSE:', resp);
      console.log("this is menu item: ", menuItem);
      renderCart(resp.orderCart);
    });
};

const createUser = function(user) {
  return `
<form action='/users' method='POST'>
<h3>${user.name}'s Order</h3>
</form>
`;
};

const renderUser = function(user) {
  const userHTML = createUser(user);
  $('#users-cart').append(userHTML);
};

// const addUser = function() {
//     $
//         .post('/api/users')
//         .then((resp) => {
//             // console.log("response: ", resp);
//             renderUser(resp.users[0]);
//         });

// };

const addUser = function() {
  $
    .post('/api/users')
    .then((resp) => {
      // console.log("response: ", resp);
      renderUser(resp.users[0]);
    });

};

const sendSMS = function() {
  $
    .post('/api/sms/send')
    .then((resp) => resp.sendSMS);
};

$(document).ready(function() {
  // loadMenu();
  $('#header-reset').click(function(event) {
    event.preventDefault();
    $('#admin-login').slideDown(500);
    $('#nav-button').slideDown(500);
    $('.hero-image').slideDown(500);
    $('#sidenav').slideUp(500);
    $('.#menu-items-container').slideUp(500);

  });
  //On click of nav button, pulls up menu skeleton
  $("#nav-button").on('click', function(event) {
    event.preventDefault();
    $('.hero-image').slideUp(500);
    if (menuEntries.length === 0) {
      loadMenu();
    }
  });
  //On click listener for add to cart,
  $("#menu-items-container").on('click', ".order-button", function(event) {
    event.preventDefault();
    addUser();
    const textFieldID = `#numOfItems${event.target.dataset.id}`;
    const itemsToCart = $(textFieldID).val();
    const menuItem = { menuItemId: event.target.dataset.id, quantity: itemsToCart };
    addCart(menuItem);
    $('.order-cart').empty();
    showCart();
    $('.order-cart').on('click', '.place-order', function(event) {
      event.preventDefault();
      sendSMS();
    });
  });
});
