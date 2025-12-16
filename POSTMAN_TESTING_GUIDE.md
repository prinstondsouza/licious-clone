# Licious Clone - Postman Testing Guide

**Base URL**: `http://localhost:5000`

> [!NOTE]
> For all authenticated routes, add the header:
> `Authorization: Bearer <your_token>`
> The `<your_token>` is returned in the response of the Login/Register requests.

---

## 1. Authentication
### User
- **Register User**
  - **POST** `http://localhost:5000/api/auth/user/register`
  - **Body (JSON)**:
    ```json
    {
      "name": "John Doe",
      "email": "john@example.com",
      "password": "password123",
      "phone": "9876543210",
      "address": "123 Main St, Bangalore",
      "latitude": 12.9716,
      "longitude": 77.5946
    }
    ```
- **Login User**
  - **POST** `http://localhost:5000/api/auth/user/login`
  - **Body (JSON)**:
    ```json
    {
      "email": "john@example.com",
      "password": "password123"
    }
    ```

### Vendor
- **Register Vendor (Self-Registration)**
  - **POST** `http://localhost:5000/api/auth/vendor/register` (or `http://localhost:5000/api/vendors/register`)
  - **Body (JSON)**:
    ```json
    {
      "storeName": "Fresh Meat Store",
      "ownerName": "Alice Vendor",
      "email": "vendor@example.com",
      "password": "secretvendorpass",
      "phone": "9988776655",
      "address": "456 Market Road",
      "latitude": 12.9352,
      "longitude": 77.6245,
      "documents": ["doc1_link", "doc2_link"]
    }
    ```
- **Login Vendor**
  - **POST** `http://localhost:5000/api/auth/vendor/login`
  - **Body (JSON)**:
    ```json
    {
      "email": "vendor@example.com",
      "password": "secretvendorpass"
    }
    ```

### Delivery Partner
- **Register Delivery Partner**
  - **POST** `http://localhost:5000/api/auth/delivery/register`
  - **Body (JSON)**:
    ```json
    {
      "name": "Bob Delivery",
      "email": "bob@delivery.com",
      "password": "deliverypass",
      "phone": "8877665544",
      "vehicleType": "Bike",
      "vehicleNumber": "KA-01-AB-1234",
      "latitude": 12.95,
      "longitude": 77.60
    }
    ```
- **Login Delivery Partner**
  - **POST** `http://localhost:5000/api/auth/delivery/login`
  - **Body (JSON)**:
    ```json
    {
      "email": "bob@delivery.com",
      "password": "deliverypass"
    }
    ```

### Admin
- **Register Admin**
  - **POST** `http://localhost:5000/api/auth/admin/register`
  - **Body (JSON)**:
    ```json
    {
      "name": "Super Admin",
      "email": "admin@licious.com",
      "password": "adminsecretpass",
      "phone": "1231231234"
    }
    ```
- **Login Admin**
  - **POST** `http://localhost:5000/api/auth/admin/login`
  - **Body (JSON)**:
    ```json
    {
      "email": "admin@licious.com",
      "password": "adminsecretpass"
    }
    ```

---

## 2. User Routes
*Requires User Token*

- **Get Profile**
  - **GET** `http://localhost:5000/api/users/me`
- **Update Location**
  - **PUT** `http://localhost:5000/api/users/location`
  - **Body (JSON)**:
    ```json
    {
      "latitude": 12.9800,
      "longitude": 77.6400,
      "address": "New Address, Indiranagar"
    }
    ```

---

## 3. Product Catalog (Base Products)
*Base Products are the global catalog items managed by Admin.*

### Admin & Vendor Only
- **Get All Base Products**
  - **GET** `http://localhost:5000/api/products/base`
  - **Query Params**: `?category=Chicken&status=active` (Optional)
- **Get Base Product by ID**
  - **GET** `http://localhost:5000/api/products/base/:id`

### Admin Only
- **Create Base Product**
  - **POST** `http://localhost:5000/api/products/base`
  - **Params**: Form-Data (Multipart)
    - `name`: Chicken Curry Cut
    - `category`: Chicken
    - `description`: Fresh curry cut chicken
    - `basePrice`: 150
    - `images`: [Select Files]
- **Update Base Product**
  - **PUT** `http://localhost:5000/api/products/base/:id`
  - **Params**: Form-Data or JSON (if no images)
- **Delete Base Product**
  - **DELETE** `http://localhost:5000/api/products/base/:id`

---

## 4. Vendor Inventory & Products
*Vendor specific products available for sale.*

### Public / User
- **Get Products Nearby**
  - **GET** `http://localhost:5000/api/products/nearby?latitude=12.9716&longitude=77.5946`
  - **Query Params**: `maxDistance` (meters, default 5000), `category`
- **Get All Vendor Products**
  - **GET** `http://localhost:5000/api/products/vendor`
  - **Query Params**: `?vendorId=<id>`
- **Get Vendor Product by ID**
  - **GET** `http://localhost:5000/api/products/vendor/:id`

### Vendor Only
- **Add Product to Inventory** (From Base Catalog)
  - **POST** `http://localhost:5000/api/products/vendor/inventory`
  - **Params**: Form-Data (for images) or JSON
    - `baseProductId`: `<base_product_id>`
    - `price`: 180
    - `stock`: 50
- **Create Own Product** (Standalone Product)
  - **POST** `http://localhost:5000/api/products/vendor/create-new`
  - **Params**: Form-Data
    - `name`: Special Marinade Chicken
    - `category`: Marinades
    - `price`: 250
    - `stock`: 20
    - `images`: [Select Files]
- **Get My Inventory**
  - **GET** `http://localhost:5000/api/products/vendor/inventory`
- **Update Vendor Product**
  - **PUT** `http://localhost:5000/api/products/vendor/:id` (Vendor Product ID)
  - **Body (JSON)**:
    ```json
    {
      "price": 190.5,
      "stock": 45,
      "status": "active"
    }
    ```

---

## 5. Cart
*Requires User Token*

- **Get Cart**
  - **GET** `http://localhost:5000/api/cart`
- **Add to Cart**
  - **POST** `http://localhost:5000/api/cart/add`
  - **Body (JSON)**:
    ```json
    {
      "vendorProductId": "<vendor_product_id>",
      "quantity": 1
    }
    ```
- **Remove from Cart**
  - **POST** `http://localhost:5000/api/cart/remove`
  - **Body (JSON)**:
    ```json
    {
      "vendorProductId": "<vendor_product_id>"
    }
    ```

---

## 6. Orders
### User
- **Place Order**
  - **POST** `http://localhost:5000/api/orders/place`
  - **Body (JSON)**:
    ```json
    {
      "latitude": 12.9716, // Optional: Update location and check eligibility
      "longitude": 77.5946,
      "address": "123 New Street, Bangalore" // Optional
    }
    ```
    *(Empty body `{}` uses existing profile location)*
- **Get My Orders**
  - **GET** `http://localhost:5000/api/orders/my-orders`

### Vendor
- **Get Vendor Orders**
  - **GET** `http://localhost:5000/api/orders/vendor`

### Admin
- **Get All Orders**
  - **GET** `http://localhost:5000/api/orders/all`

---

## 7. Delivery Management
### Admin
- **Create Delivery Partner**
  - **POST** `http://localhost:5000/api/delivery/create`
  - **Body**: Similar to Auth register body.
- **Get All Delivery Partners**
  - **GET** `http://localhost:5000/api/delivery`
- **Update Partner Status** (Approve/Reject)
  - **PUT** `http://localhost:5000/api/delivery/status/:id`
  - **Body (JSON)**: `{"status": "approved"}`
- **Assign Partner to Order**
  - **POST** `http://localhost:5000/api/delivery/assign`
  - **Body (JSON)**:
    ```json
    {
      "orderId": "<order_id>",
      "partnerId": "<partner_id>"
    }
    ```

### Delivery Partner / Admin
- **Update Order Delivery Status**
  - **PUT** `http://localhost:5000/api/delivery/update-status`
  - **Body (JSON)**:
    ```json
    {
      "orderId": "<order_id>",
      "status": "delivered",
      "deliveryPartnerId": "<partner_id>"
    }
    ```
    *(Note: `deliveryPartnerId` required if not Admin)*
- **Get Assigned Orders** (Delivery Partner Dashboard)
  - **GET** `http://localhost:5000/api/delivery/my-orders`

---

## 8. Admin Dashboard
*Requires Admin Token*

- **Get Dashboard Stats**
  - **GET** `http://localhost:5000/api/admin/dashboard`
- **Get All Users**
  - **GET** `http://localhost:5000/api/users` (Admin access only)
- **Get All Vendors**
  - **GET** `http://localhost:5000/api/vendors` (?status=pending)
- **Approve/Reject Vendor**
  - **PUT** `http://localhost:5000/api/vendors/status/:id`
  - **Body (JSON)**: `{"status": "approved"}`
- **Get All Delivery Partners**
  - **GET** `http://localhost:5000/api/admin/delivery` (or `http://localhost:5000/api/delivery`)

---

## 9. Payment (To Be Implemented)
*Module currently inactive.*

- **Create Order**
  - **POST** `/api/payment/create-order`
- **Verify Payment**
  - **POST** `/api/payment/verify`















Added from VENDOR_PRODUCT_TESTING_GUIDE.md

# Vendor Product Creation - Postman Testing Guide

This guide details how to test the new feature allowing vendors to create their own products.

## Base URL
`http://localhost:5000`

---

## 🧪 Testing Steps

### 1. Vendor Login & Token Retrieval
First, you need to be logged in as a **Vendor**.

*   **Method:** `POST`
*   **URL:** `http://localhost:5000/api/users/login`
*   **Body (JSON):**
    ```json
    {
      "email": "vendor@example.com", 
      "password": "password123"
    }
    ```
    *(Use an existing vendor email/password or create one via `/api/vendors/register` and approve it via admin)*

*   **Response:** Copy the `token` from the response.

### 2. Create Vendor Product
Use the token to create a new product.

*   **Method:** `POST`
*   **URL:** `http://localhost:5000/api/products/vendor/create-new`
*   **Headers:**
    *   `Authorization`: `Bearer <YOUR_VENDOR_TOKEN>`
*   **Body (Form-Data):**
    *   `name`: `My Special Chicken Masala` (Text)
    *   `category`: `Chicken` (Text)
    *   `description`: `Secret vendor recipe marinated chicken` (Text)
    *   `price`: `350` (Text/Number) - *This sets both BasePrice and Selling Price*
    *   `stock`: `50` (Text/Number)
    *   `images`: [Select File] (File) - *Optional*

*   **Expected Response (201 Created):**
    ```json
    {
      "message": "Product created and added to inventory successfully",
      "vendorProduct": {
        "_id": "...",
        "baseProduct": {
          "_id": "...",
          "name": "My Special Chicken Masala",
          "creatorModel": "Vendor",
          ...
        },
        "price": 350,
        "vendor": { ... },
        ...
      }
    }
    ```

### 3. Verify Product in Inventory
Check if the product appears in the vendor's inventory.

*   **Method:** `GET`
*   **URL:** `http://localhost:5000/api/products/vendor/inventory`
*   **Headers:**
    *   `Authorization`: `Bearer <YOUR_VENDOR_TOKEN>`
*   **Response:** The list should include the newly created product.

### 4. Verify Product in Public Feed (Optional)
Check if the product is visible to users (e.g., via "Nearby Products").

*   **Method:** `GET`
*   **URL:** `http://localhost:5000/api/products/nearby?latitude=12.9716&longitude=77.5946`
    *(Replace lat/long with coordinates near the vendor's location)*
*   **Response:** The product should be listed if within range.

----

## 📝 Troubleshooting

*   **401 Unauthorized:** check if you included `Bearer ` prefix in the token.
*   **403 Forbidden:** check if the user role is actually `vendor`.
*   **400 Bad Request:** check if all required fields (`name`, `category`, `price`) are provided.
