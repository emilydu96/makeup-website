# Makeup E-Commerce API Documentation
The purpose of this API is to add functionality to our e-commerce website such as displaying, searching, and purchasing makeup products and dealing with user data.

## Get Products by Category
**Description**\
Retrieve makeup products by category: 'New', 'All', 'Face', 'Eyes', 'Cheeks', 'Lips'.
Category must follow capitalized formatting.

**Request type**\
GET

**Request format**\
/category/:category

**Returned Data Format**\
JSON of makeup product(s) or plain text of error message

**Example Request**\
‘/category/Face’

**Example Response**
```json
[
	{
    "ProductID": 16,
    "Name": "Light Reflecting Advanced Skincare Foundation",
    "Brand": "NARS",
    "Price": 50,
    "Description": "An advanced makeup-skincare-hybrid foundation with a natural finish that quickly blurs and smooths while visibly improving skin’s clarity over time.",
    "Image": "img/nars-foundation.webp",
    "Quantity": 50,
    "Category": "Face",
    "ReleaseDate": "2023-09-05"
  },
  {
    "ProductID": 17,
    "Name": "Luminous Silk Perfect Glow Flawless Oil-Free Foundation",
    "Brand": "Armani Beauty",
    "Price": 69,
    "Description": "An award-winning, oil-free liquid foundation that delivers buildable medium coverage and a luminous, glowy-skin finish for a natural makeup look.",
    "Image": "img/armani-foundation.webp",
    "Quantity": 45,
    "Category": "Face",
    "ReleaseDate": "2023-11-22"
  },
  // Additional product items
]
```

**Error Handling**\
400: Missing parameter.\
400: Not a valid category.\
500: An error occurred on the server. Try again later.


## Search for Makeup Products
**Description**\
Searches for product (name or brand) based on the given search term.

**Request type**\
GET

**Request format**\
/search/:term

**Returned Data Format**\
JSON of makeup product(s) or plain text of error message

**Example Request**\
'/search/cosmetics'

**Example Response**
```json
[
  {
    "ProductID": 8,
    "Name": "Cookie and Tickle Powder Highlighters",
    "Brand": "Benefit Cosmetics",
    "Price": 35,
    "Description": "A silky-soft, superfine powder highlighter.",
    "Image": "img/benefit-highlighter.webp",
    "Quantity": 49,
    "Category": "Cheeks",
    "ReleaseDate": "2023-03-10"
  },
  {
    "ProductID": 14,
    "Name": "Precisely,  My Brow Pencil Waterproof Eyebrow Definer",
    "Brand": "Benefit Cosmetics",
    "Price": 26,
    "Description": "A bestselling brow pencil to transform shapeless, undefined brows with a few strokes—now available in 12 shades to flatter every hair color.",
    "Image": "img/benefit-eyebrow.webp",
    "Quantity": 44,
    "Category": "Eyes",
    "ReleaseDate": "2023-06-24"
  },
  {
    "ProductID": 21,
    "Name": "Bye Bye Pores Translucent Pressed Setting Powder",
    "Brand": "IT Cosmetics",
    "Price": 32,
    "Description": "A talc-free setting powder infused with silk that mattifies, minimizes pores’ appearance, and sets foundation and concealer in a convenient pressed-powder compact.",
    "Image": "img/it-powder.webp",
    "Quantity": 50,
    "Category": "Face",
    "ReleaseDate": "2023-08-09"
  }
]
```

**Error Handling**\
400: Missing one or more of the required params.\
500: An error occurred on the server. Try again later.


## Placing an Order
**Description**\
Decreases the product quantity and user balance based on the products in the cart. Returns the order confirmation number.

**Request type**\
POST

**Request format**\
/user/place-order/:userID

**Body parameters**\
```orderItems``` (array of product IDs)

**Returned Data Format**\
Plain text

**Example Request**\
‘/user/place-order/4’

**Example Response**
```
Order placed successfully! Confirmation Number: #Order35
```

**Error Handling**\
400: Missing one or more of the required params.\
400: No items in order.\
400: Yikes. User does not exist.\
400: Item is out of stock.\
400: Purchase exceeds user's bank balance.\
500: An error occurred on the server. Try again later.


## Get Product Information
**Description**\
Get product information given the product ID.

**Request type**\
GET

**Request format**\
/product/:product

**Returned Data Format**\
JSON of makeup product or plain text of error message

**Example Request**\
‘/product/15’

**Example Response**
```json
{
  "Name": "Limitless Lash Lengthening Clean Mascara",
  "Brand": "ILIA",
  "Price": 28,
  "Description": "An award-winning clean mascara that lengthens, lifts, and separates—now with more planet-friendly packaging.",
  "Image": "img/ilia-mascara.webp"
}
```

**Error Handling**\
400: Missing one or more of the required params.\
400: Product does not exist.\
500: An error occurred on the server. Try again later.


## Create New User
**Description**\
Creates a new user with a default balance of $500 based on the username and password

**Request type**\
POST

**Request format**\
/sign-up

**Body parameters**\
```username```, ```password```, ```email```, ```name```

**Returned Data Format**\
Plain text

**Example Request**\
‘/sign-up’

**Example Response:**\
```Successfully created a new user!```

**Error Handling:**\
400: Username and/or email is already taken.\
500: An error occurred on the server. Try again later.


## Log In
**Description**\
Returns the user ID based on the username and password.

**Request type**\
POST

**Request format**\
/log-in

**Body parameters**\
```username```, ```password```

**Returned Data Format**\
JSON of user ID or plain text of error message

**Example Request**\
‘/log-in’

**Example Response:**\
```json
[
  {
    "UserID": 4
  }
]
```

**Error Handling:**\
400: Username and/or password is incorrect.\
500: An error occurred on the server. Try again later.


## Get User Information
**Description**\
Gets the information of the user based on the user ID.

**Request type**\
GET

**Request format**\
/user/details/:userID

**Returned Data Format**\
JSON of user or plain text of error message

**Example Request**\
‘/user/details/1’

**Example Response:**\
```json
{
  "Email": "ikellyw@uw.edu",
  "Name": "Kelly Wang",
  "Bank": 132
}
```

**Error Handling:**\
400: Missing one or more of the required params.\
400: Yikes. User does not exist.\
500: An error occurred on the server. Try again later.


## Get User Past Orders
**Description**\
Gets the past orders of the user based on the user ID.

**Request type**\
GET

**Request format**\
/user/past-orders/:userID

**Returned Data Format**\
JSON of orders or plain text of error message

**Example Request**\
‘/user/past-orders/4’

**Example Response:**\
```json
[
  {
    "OrderID": 35,
    "products": [
      {
        "ProductID": 10,
        "Name": "Chocolate Soleil Matte Bronzer",
        "Brand": "Too Faced",
        "Price": 36,
        "Image": "img/too-faced-bronzer.webp"
      },
      {
        "ProductID": 20,
        "Name": "Translucent Loose Setting Powder",
        "Brand": "Laura Mercier",
        "Price": 43,
        "Image": "img/lm-powder.jpg"
      }
    ]
  },
  {
    "OrderID": 34,
    "products": [
      {
        "ProductID": 1,
        "Name": "Lip Butter Balm",
        "Brand": "Summer Fridays",
        "Price": 24,
        "Image": "img/sf-lip-balm.jpeg"
      },
      {
        "ProductID": 3,
        "Name": "Soft Pinch Tinted Lip Oil",
        "Brand": "Rare Beauty",
        "Price": 20,
        "Image": "img/rb-lip-oil.webp"
      },
      {
        "ProductID": 5,
        "Name": "Lip Cheat Lip Liner",
        "Brand": "Charlotte Tilbury",
        "Price": 25,
        "Image": "img/ct-lipliner.webp"
      },
      {
        "ProductID": 7,
        "Name": "Rosy Glow Blush",
        "Brand": "Dior",
        "Price": 40,
        "Image": "img/dior-blush.webp"
      }
    ]
  }
]
```

**Error Handling:**\
400: Missing one or more of the required params.\
400: Yikes. User does not exist.\
500: An error occurred on the server. Try again later.