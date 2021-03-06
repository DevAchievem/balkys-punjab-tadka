let menuEntries = [];
// ---------- Create menu items

const createMenuItems = function(menuItems) {
    return `
    <li class="menu-item-container">
      <form method='/menu' action="POST">
        <article class="menu-items">
        <img src="images/${menuItems.name}.jpg" class="menu-item-image" width="250" alt="${menuItems.name}">
        <section class="menu-details">
          <header class="name-of-item">
            <span class="name">${menuItems.name}</span>
          </header>
          <div class="max-width menu-item-details">
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
          </section>
        </article>
      </form>
    </li>
`;
};

const convertCentsToDollars = function(cents) {
    const dollars = cents / 100;
    return Math.round(dollars * 100) / 100;
};

const renderMenu = function(items) {
    const $menuItemsContainer = $('#menu-items-container');
    let menuItemHTML = `<ul class="menu-items-container">`;
    for (const item of items) {
        menuItemHTML += createMenuItems(item);
    }
    menuItemHTML += `</ul>`;
    $menuItemsContainer.append(menuItemHTML);
};

const loadMenu = function() {
    $
        .get('/api/menu/')
        .then((resp) => {
            menuEntries = resp.entries;
            renderMenu(resp.entries);
        });
};

// -----------  ADDING TO THE CART
const createAddToCart = function(menuItems) {
    return `
  <form action='/showCartPost' method="POST">
  <div class="flex-column">
  <div class="item1">
  <p><b>${menuItems.name}</b></p>
  <p>Quantity: ${menuItems.quantity}</p>
  <p>$${(convertCentsToDollars(menuItems.price) * menuItems.quantity).toFixed(2)}</p>
  </div>
</div>
</form>
`;
};

const createPlaceOrder = function(items) {
    // console.log(items);
    let sum = 0;
    for (item of items) {
        sum += item.price * item.quantity;
    }
    let gst = gstCalculator(sum);
    let totalGst = gst + sum;
    return (`<div class="total-div">
    <p class="subtotal"> Food & Beverage Subtotal </p>
    <p class="total"> Total: $${(convertCentsToDollars(sum)).toFixed(2)} </p>
    <p class="tax"> GST: $${(convertCentsToDollars(gst)).toFixed(2)} </p>
    <p class="total-amt"> Total Including GST: $${(convertCentsToDollars(totalGst)).toFixed(2)} </p>
    <button class="place-order"> PLACE ORDER </button>
    <button class='clear-cart'> CLEAR CART </button>
  </div>`);
};

//GST CALCULATOR FOR CART
const gstCalculator = function(total) {
    const gst = total * 0.05;
    return gst;
};


//RENDERS BOTH GST TOTAL SECTION AND MENU ITEMS
const renderCart = function(items) {
    for (const item of items) {
        //Holds HTML element for the menu items in the cart
        const itemCartHTML = createAddToCart(item);
        $('.order-cart').prepend(itemCartHTML);
    }
    //Renders the createPlaceOrder for the menu
    if ($('.total-div').length === 0) {
        //Holds HTML element for the totals
        const totalCartHTML = createPlaceOrder(items);
        $('.total-cart').append(totalCartHTML);
    } else {
        const totalCartHTML = createPlaceOrder(items);
        $('.total-div').replaceWith(totalCartHTML);    }
};
const showCart = function() {
    $
        .get('/api/showCart')
        .then((resp) => {
            $('.order-cart').empty();
            renderCart(resp.orderCart);
        });
};

const addCart = function(menuItem) {
    $
        .post('/api/addToCart', menuItem)
        .then(showCart);
};

//Clearing the cart
const clearCart = function() {
    $
        .post('/api/clearCart')
        .then(showCart);
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

const addUser = function() {
  $
    .post('/api/users')
    .then((resp) => {
      // console.log("response: ", resp);
      renderUser(resp.users[0]);
    });
};

//send sms
// const sendSMS = function() {
//   $
//     .post('/api/sms/send')
//     .then((resp) => resp.sendSMS);
//   };


  $(document).ready(function() {
    $('#header-reset').click(function(event) {
      event.preventDefault();
      $('#admin-login').slideDown(500);
      $('#nav-button').slideDown(500);
      $('.hero-image').slideDown(500);
      $('#sidenav').slideUp(500);
      $('#menu-items-container').slideUp(500);
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
      });

    $("#total-cart").on('click', '.clear-cart', function(event) {
        event.preventDefault();
        clearCart();
    });
  });
