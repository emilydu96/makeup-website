/*
 * Name: Emily Du
 * Date: October 24, 2023
 *
 * This is the index.js file for our final project. It provides the functionality of our website
 * such as switching between pages, viewing data, adding products to the cart, checking out,
 * creating an account, and logging in.
 */

"use strict";

(function() {
  window.addEventListener("load", init);

  /**
   * Function that runs when the window first loads
   */
  function init() {
    shopPage();
    loginPage();
    signupPage();
    accountPage();
    cartPage();
    mainPage();
    productPage();
    id('search').addEventListener('keypress', search);
  }

  /**
   * This function checks whether the current webpage URL is set to the log in page to call
   * specific functions that should be executed
   */
  function loginPage() {
    let loginForm = id("login-form");
    if (loginForm) {
      loginForm.addEventListener("submit", (event) => {
        event.preventDefault();
        let username = id("login-username").value;
        let password = id("login-password").value;
        loginUser(username, password);
      });
    }
  }

  /**
   * This function checks whether the current webpage URL is set to the sign up page to call
   * specific functions that should be executed
   */
  function signupPage() {
    let signupForm = id('create-form');
    if (signupForm) {
      signupForm.addEventListener("submit", (event) => {
        event.preventDefault();
        let username = id("create-username").value;
        let email = id("create-email").value;
        let name = id("create-name").value;
        let password = id("create-password").value;
        createNewUser(username, email, name, password);
      });
    }
  }

  /**
   * This function checks whether the current webpage URL is set to the account page to call
   * specific functions that should be executed
   */
  function accountPage() {
    let account = document.URL.includes("account.html");
    if (account) {
      id('logout').addEventListener('click', logoutUser);
      userInformation();
      let userID = localStorage.getItem("userID");
      getPastOrder(userID);
    }
  }

  /**
   * This function checks whether the current webpage URL is set to the cart page to call
   * specific functions that should be executed
   */
  function cartPage() {
    let cart = document.URL.includes("cart.html");
    if (cart) {
      displayCart();
      qs(".button").addEventListener("click", placeOrder);
      let cartProducts = window.localStorage.getItem("cart");
      let userID = localStorage.getItem("userID");
      if (cartProducts === "[]" || !cartProducts) {
        id('check-out').disabled = true;
        id('check-out').textContent = "No items in cart";
      }
      if (!userID) {
        id('check-out').disabled = true;
        id('check-out').textContent = "You must be logged in";
      }
    }
  }

  /**
   * This function checks whether the current webpage URL is set to the main page to call
   * specific functions that should be executed
   */
  function mainPage() {
    let indexPage = document.URL.includes("index.html");
    if (indexPage) {
      newArrivals();
      forYou();
    }
  }

  /**
   * This function checks whether the current webpage URL is set to the product page to call
   * specific functions that should be executed
   */
  function productPage() {
    let product = document.URL.includes("product-page.html");
    if (product) {
      displayProduct();
    }
  }

  /**
   * This function checks whether the current webpage URL is set to which shopping page to call
   * specific functions that should be executed
   */
  function shopPage() {
    let newPage = document.URL.includes("new-arrivals.html");
    let shopAllPage = document.URL.includes("shop.html");
    let facePage = document.URL.includes("face.html");
    let eyesPage = document.URL.includes("eyes.html");
    let cheeksPage = document.URL.includes("cheeks.html");
    let lipsPage = document.URL.includes("lips.html");
    let searchPage = document.URL.includes("search.html");
    if (newPage || shopAllPage || facePage || eyesPage || cheeksPage || lipsPage || searchPage) {
      qs('.sidebar-nav fieldset').addEventListener('change', changeView);
    }
    if (newPage) {
      populateShop('New');
    } else if (shopAllPage) {
      populateShop('All');
    } else if (facePage) {
      populateShop('Face');
    } else if (eyesPage) {
      populateShop('Eyes');
    } else if (cheeksPage) {
      populateShop('Cheeks');
    } else if (lipsPage) {
      populateShop('Lips');
    } else if (searchPage) {
      showSearch();
    }
  }

  /**
   * This function handles the process of adding makeup products to
   * shopping cart by keeping track of the IDs of the products.
   */
  function addToCart() {
    let productID = sessionStorage.getItem('product');
    id('add-to-cart').disabled = true;
    let cartProducts = window.localStorage.getItem("cart");
    let arr;
    if (!cartProducts) {
      arr = [productID];
    } else {
      arr = JSON.parse(cartProducts);
      arr.push(productID);
    }
    let stringArr = JSON.stringify(arr);
    window.localStorage.setItem("cart", stringArr);
  }

  /**
   * This function displays the products in the shopping cart by retrieving information about
   * each product. It also updates the total number of items and the total price in the cart.
   */
  function displayCart() {
    let products = window.localStorage.getItem('cart');
    let totalItems = 0;
    let totalPrice = 0;
    if (products) {
      products = JSON.parse(products);
      for (let i = 0; i < products.length; i++) {
        fetch('/product/' + products[i])
          .then(statusCheck)
          .then(res => res.json())
          .then((res) => {
            totalItems++;
            totalPrice = totalPrice + res.Price;
            id('cart-products-list').appendChild(generateProductCard(res, "cart"));
            id('total-price').textContent = "$" + totalPrice;
            id('total-items').textContent = totalItems;
          })
          .catch(handleInternalError);
      }
    }
    id('total-price').textContent = "$" + totalPrice;
    id('total-items').textContent = totalItems;
  }

  /**
   * This function handles the removal of an item in the shopping cart.
   */
  function removeItem() {
    let thisElement = this.parentNode;
    let num;
    let allElements = qsa('.product-card');
    for (let i = 0; i < allElements.length; i++) {
      if (allElements[i] === thisElement) {
        num = i;
      }
    }
    let products = window.localStorage.getItem('cart');
    products = JSON.parse(products);
    products.splice(num, 1);
    let stringArr = JSON.stringify(products);
    window.localStorage.setItem("cart", stringArr);
    location.href = "cart.html";
  }

  /**
   * This function handles the search functionality on the webpage.
   * @param {event} evt - Event object that determines which key was pressed by the user
   */
  function search(evt) {
    let term = id('search').value.trim();
    if (evt.key === 'Enter' && term.length > 0) {
      sessionStorage.setItem('search', term);
      location.href = "search.html";
    }
  }

  /**
   * This function retrieves the search term from the user and displays the number
   * of results found and the items on the page
   */
  function showSearch() {
    let term = sessionStorage.getItem('search');
    fetch('/search/' + term)
      .then(statusCheck)
      .then(res => res.json())
      .then((res) => {
        qs('.sidebar-nav p').textContent = res.length + " results";
        for (let i = 0; i < res.length; i++) {
          qs('.shop-products').appendChild(generateProductCard(res[i], "grid"));
        }
      })
      .catch(handleInternalError);
  }

  /**
   * This function displays the products on the page based on the specified makeup category
   * @param {String} category - The specified category of the products
   */
  function populateShop(category) {
    fetch('/category/' + category)
      .then(statusCheck)
      .then(res => res.json())
      .then((res) => {
        qs('.sidebar-nav p').textContent = res.length + " results";
        for (let i = 0; i < res.length; i++) {
          qs('.shop-products').appendChild(generateProductCard(res[i], "grid"));
        }
      })
      .catch(handleInternalError);
  }

  /**
   * This function retrieves and displays the new arrival products on the main page
   */
  function newArrivals() {
    const numOfProducts = 4;
    fetch('/category/New')
      .then(statusCheck)
      .then(res => res.json())
      .then((res) => {
        for (let i = 0; i < numOfProducts; i++) {
          qs('#new-arrivals .products-row').appendChild(generateProductCard(res[i]));
        }
      })
      .catch(handleInternalError);
  }

  /**
   * This function displays the personalized selection of products in the 'For You'
   * section of the main page by generating 4 random makeup products.
   */
  function forYou() {
    fetch('/category/All')
      .then(statusCheck)
      .then(res => res.json())
      .then((res) => {
        let num1 = Math.floor(Math.random() * (res.length));
        let num2 = Math.floor(Math.random() * (res.length));
        let num3 = Math.floor(Math.random() * (res.length));
        let num4 = Math.floor(Math.random() * (res.length));
        qs('#for-you .products-row').appendChild(generateProductCard(res[num1]));
        qs('#for-you .products-row').appendChild(generateProductCard(res[num2]));
        qs('#for-you .products-row').appendChild(generateProductCard(res[num3]));
        qs('#for-you .products-row').appendChild(generateProductCard(res[num4]));
      })
      .catch(handleInternalError);
  }

  /**
   * This function checks if the user's credentials exists. If it does,
   * then it completes the login process and takes the user to their account page.
   * @param {String} username - The username input for login
   * @param {String} password - The password input for login
   */
  function loginUser(username, password) {
    let params = new FormData();
    params.append("username", username);
    params.append("password", password);
    fetch("/log-in", {method: "POST", body: params})
      .then(statusCheck)
      .then(res => res.json())
      .then(data => {
        if (data.length > 0 && data[0].UserID) {
          let userID = data[0].UserID;
          localStorage.setItem("userID", userID);
          id('login-username').value = "";
          id('login-password').value = "";
          window.location.href = "account.html";
        }
      })
      .catch((error) => {
        qs('#login p').textContent = error.message;
      });
  }

  /**
   * This function manages the creation of new user accounts by handling the
   * username, email, name, and password for the new account.
   * @param {String} username - The chosen username for the new account
   * @param {String} email - The email address associated with the new account
   * @param {String} name - The name of the user creating the account
   * @param {String} password - The chosen password for the new account
   */
  function createNewUser(username, email, name, password) {
    let params = new FormData();
    params.append("username", username);
    params.append("email", email);
    params.append("name", name);
    params.append("password", password);
    fetch("/sign-up", {method: "POST", body: params})
      .then(statusCheck)
      .then(res => res.text())
      .then(res => {
        qs('#create-acc p').textContent = res;
        id('create-username').value = "";
        id('create-password').value = "";
        id('create-name').value = "";
        id('create-email').value = "";
      })
      .catch((error) => {
        qs('#create-acc p').textContent = error.message;
      });
  }

  /**
   * This function handles the process when the user log outs of their account
   */
  function logoutUser() {
    localStorage.removeItem("userID");
    window.location.href = "index.html";
  }

  /**
   * This function retrieves the user's name, email, and bank balance by their userID.
   * It then displays the user's information on their account page.
   */
  function userInformation() {
    let userID = localStorage.getItem("userID");
    let url = "/user/details/" + userID;
    if (userID) {
      fetch(url)
        .then(statusCheck)
        .then(res => res.json())
        .then(data => {
          id("user-email").textContent = data.Email;
          id("user-name").textContent = data.Name;
          id('balance').textContent = "$" + data.Bank;
        })
        .catch(handleInternalError);
    } else {
      window.location.href = "login.html";
    }
  }

  /**
   * This function retrieves the user's past orders based on the provided user ID.
   * @param {String} userId - The unique identifier of the user
   */
  function getPastOrder(userId) {
    let url = '/user/past-orders/' + userId;
    fetch(url)
      .then(statusCheck)
      .then(res => res.json())
      .then(data => {
        displayPastOrders(data);
      })
      .catch(handleInternalError);
  }

  /**
   * This function displays the user's past orders on the account page.
   * @param {Object} data - An object containing details of their past orders
   */
  function displayPastOrders(data) {
    let ordersContainer = id("orders");
    ordersContainer.innerHTML = "";
    data.forEach(order => {
      let orderSection = generateOrderSection(order.OrderID, order.products);
      ordersContainer.appendChild(orderSection);
    });
  }

  /**
   * This function constructs a new section for an order based on the order ID. It also
   * populates a list of products associated with that order.
   * @param {String} orderID - The unique identifier of the order
   * @param {Array} products - An array of product objects associated with the order
   * @returns {Object} - A DOM section element that represents the order and its products
   */
  function generateOrderSection(orderID, products) {
    let section = gen('section');
    section.classList.add('order');
    let strong = gen('strong');
    strong.textContent = "Order: #Order" + orderID;
    let orderNum = gen('p');
    orderNum.appendChild(strong);
    section.appendChild(orderNum);
    for (let i = 0; i < products.length; i++) {
      section.appendChild(generateProductCard(products[i], "list"));
    }
    return section;
  }

  /**
   * This function handles the process of placing an order for the currently logged-in user.
   * If successful, it clears the cart and displays a confirmation message.
   */
  function placeOrder() {
    let cartProducts = localStorage.getItem("cart");
    let params = new FormData();
    let userID = localStorage.getItem('userID');
    params.append("orderItems", cartProducts);
    fetch("/user/place-order/" + userID, {method: "POST", body: params})
      .then(statusCheck)
      .then(res => res.text())
      .then(data => {
        displayMessage(data, 'success');
        id('total-items').textContent = "0";
        id('total-price').textContent = "$0";
        localStorage.removeItem("cart");
        id('cart-products-list').innerHTML = "";
      })
      .catch((err) => {
        id('message').textContent = err.message;
      });
  }

  /**
   * This method constructs a product card that contains the product's
   * image, brand, name, and price
   * @param {Object} product - containing product's details
   * @param {String} special - indicating how each product card is being displayed on the page.
   * @returns {Object} - A DOM element representing the product card
   */
  function generateProductCard(product, special) {
    let card = gen('section');
    card.classList.add('product-card');
    let productImg = gen('img');
    productImg.src = product.Image;
    productImg.alt = product.Name;
    let productBrand = gen('p');
    productBrand.textContent = product.Brand;
    productBrand.classList.add('brand-name');
    let productName = gen('p');
    productName.textContent = product.Name;
    productName.classList.add('product-name');
    let productPrice = gen('p');
    productPrice.textContent = "$" + product.Price;
    productPrice.classList.add('product-price');
    let div = gen('div');
    div.append(productBrand, productName);
    card.append(productImg, div, productPrice);
    return addSpecialStyling(card, product, special);
  }

  /**
   * Adds styling to the product card based on the given parameter
   * @param {Object} card - DOM element representing the product card
   * @param {Object} product - containing product's details
   * @param {String} special - indicating how each product card is being displayed on the page
   * @returns {Object} - The DOM element representing the product card with added styling
   */
  function addSpecialStyling(card, product, special) {
    if (special === "grid") {
      card.classList.add('grid');
    } else if (special === "list" || special === "cart") {
      card.classList.add('list');
    }
    if (special === "cart") {
      let button = gen('button');
      button.classList.add('remove');
      button.textContent = "X";
      button.addEventListener('click', removeItem);
      card.appendChild(button);
    } else {
      card.addEventListener('click', () => {
        sessionStorage.setItem('product', product.ProductID);
        location.href = "product-page.html";
      });
    }
    return card;
  }

  /**
   * This function alters the display style of the products based on the user interaction.
   * It allows users to switch between 'list' or 'grid' mode.
   * @param {Event} evt - The event object that determines the selected view mode
   */
  function changeView(evt) {
    let shopContainer = qs('.shop-products');
    if (evt.target.value === "list") {
      shopContainer.classList.remove('grid-view');
      shopContainer.classList.add('list-view');
      for (const child of shopContainer.children) {
        child.classList.remove('grid');
        child.classList.add('list');
      }
    } else {
      shopContainer.classList.add('grid-view');
      shopContainer.classList.remove('list-view');
      for (const child of shopContainer.children) {
        child.classList.add('grid');
        child.classList.remove('list');
      }
    }
  }

  /**
   * This function retrieves and displays the brand, name, price, and image of the
   * specified product based on the product ID.
   */
  function displayProduct() {
    let productID = sessionStorage.getItem('product');
    id('add-to-cart').addEventListener('click', addToCart);
    fetch('/product/' + productID)
      .then(statusCheck)
      .then(res => res.json())
      .then((res) => {
        let productImg = id('product-image');
        productImg.src = res.Image;
        productImg.alt = res.Name;
        let productBrand = qs('#product-about .brand-name');
        productBrand.textContent = res.Brand;
        let productName = qs('#product-about .product-name');
        productName.textContent = res.Name;
        let productPrice = qs('#product-about .product-price');
        productPrice.textContent = "$" + res.Price;
        let productDesc = qs('#product-about .product-desc');
        productDesc.textContent = res.Description;
      })
      .catch(handleInternalError);
  }

  /**
   * Displays the error page when an internal error occurs
   */
  function handleInternalError() {
    location.href = "error.html";
  }

  /**
   * This function helps displays a message based if the transaction was successful or not
   * @param {String} message - the displayed message
   * @param {string} type - determine the type of message
   */
  function displayMessage(message, type = 'success') {
    let messageElement = id("message");
    messageElement.innerHTML = message;
    messageElement.className = type;
  }

  /**
   * Checks the status of the response
   * @param {Object} res - Response object of the Promise
   * @returns {Object} - Response object of the Promise
   */
  async function statusCheck(res) {
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res;
  }

  /**
   * Returns the element that has the ID attribute with the specified value.
   * @param {string} id - element ID.
   * @returns {Object} - DOM object associated with id.
   */
  function id(id) {
    return document.getElementById(id);
  }

  /**
   * Returns first element matching selector.
   * @param {string} selector - CSS query selector.
   * @returns {Object} - DOM object associated selector.
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * Returns an array of elements matching the given query.
   * @param {string} query - CSS query selector.
   * @returns {array} - Array of DOM objects matching the given query.
   */
  function qsa(query) {
    return document.querySelectorAll(query);
  }

  /**
   * Returns a generated element.
   * @param {string} element - HTML element.
   * @returns {Object} - Created DOM object.
   */
  function gen(element) {
    return document.createElement(element);
  }
})();