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
  - **POST** `/api/auth/user/register`
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
  - **POST** `/api/auth/user/login`
  - **Body (JSON)**:
    ```json
    {
      "email": "john@example.com",
      "password": "password123"
    }
    ```

### Vendor
- **Register Vendor (Self-Registration)**
  - **POST** `/api/auth/vendor/register` (or `/api/vendors/register`)
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
  - **POST** `/api/auth/vendor/login`
  - **Body (JSON)**:
    ```json
    {
      "email": "vendor@example.com",
      "password": "secretvendorpass"
    }
    ```

### Delivery Partner
- **Register Delivery Partner**
  - **POST** `/api/auth/delivery/register`
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
  - **POST** `/api/auth/delivery/login`
  - **Body (JSON)**:
    ```json
    {
      "email": "bob@delivery.com",
      "password": "deliverypass"
    }
    ```

### Admin
- **Register Admin**
  - **POST** `/api/auth/admin/register`
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
  - **POST** `/api/auth/admin/login`
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
  - **GET** `/api/users/me`
- **Update Location**
  - **PUT** `/api/users/location`
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

- **Get All Base Products (Public)**
  - **GET** `/api/products/base`
  - **Query Params**: `?category=Chicken&status=active` (Optional)
- **Get Base Product by ID (Public)**
  - **GET** `/api/products/base/:id`

### Admin Only
- **Create Base Product**
  - **POST** `/api/products/base`
  - **Params**: Form-Data (Multipart)
    - `name`: Chicken Curry Cut
    - `category`: Chicken
    - `description`: Fresh curry cut chicken
    - `basePrice`: 150
    - `images`: [Select Files]
- **Update Base Product**
  - **PUT** `/api/products/base/:id`
  - **Params**: Form-Data or JSON (if no images)
- **Delete Base Product**
  - **DELETE** `/api/products/base/:id`

---

## 4. Vendor Inventory & Products
*Vendor specific products available for sale.*

### Public / User
- **Get Products Nearby**
  - **GET** `/api/products/nearby?latitude=12.9716&longitude=77.5946`
  - **Query Params**: `maxDistance` (meters, default 5000), `category`
- **Get All Vendor Products**
  - **GET** `/api/products/vendor`
  - **Query Params**: `?vendorId=<id>`

### Vendor Only
- **Add Product to Inventory** (From Base Catalog)
  - **POST** `/api/products/vendor/inventory`
  - **Params**: Form-Data (for images) or JSON
    - `baseProductId`: `<base_product_id>`
    - `price`: 180
    - `stock`: 50
- **Create Own Product** (New Base + Inventory)
  - **POST** `/api/products/vendor/create-new`
  - **Params**: Form-Data
    - `name`: Special Marinade Chicken
    - `category`: Marinades
    - `price`: 250
    - `stock`: 20
    - `images`: [Select Files]
- **Get My Inventory**
  - **GET** `/api/products/vendor/inventory`
- **Update Vendor Product**
  - **PUT** `/api/products/vendor/:id` (Vendor Product ID)
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
  - **GET** `/api/cart`
- **Add to Cart**
  - **POST** `/api/cart/add`
  - **Body (JSON)**:
    ```json
    {
      "vendorProductId": "<vendor_product_id>",
      "quantity": 1
    }
    ```
- **Remove from Cart**
  - **POST** `/api/cart/remove`
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
  - **POST** `/api/orders/place`
  - **Body (JSON)**: `{}` (Uses items from cart)
- **Get My Orders**
  - **GET** `/api/orders/my-orders`

### Vendor
- **Get Vendor Orders**
  - **GET** `/api/orders/vendor`

### Admin
- **Get All Orders**
  - **GET** `/api/orders/all`

---

## 7. Delivery Management
### Admin
- **Create Delivery Partner**
  - **POST** `/api/delivery/create`
  - **Body**: Similar to Auth register body.
- **Get All Delivery Partners**
  - **GET** `/api/delivery`
- **Update Partner Status** (Approve/Reject)
  - **PUT** `/api/delivery/status/:id`
  - **Body (JSON)**: `{"status": "approved"}`
- **Assign Partner to Order**
  - **POST** `/api/delivery/assign`
  - **Body (JSON)**:
    ```json
    {
      "orderId": "<order_id>",
      "partnerId": "<partner_id>"
    }
    ```

### Delivery Partner / Admin
- **Update Order Delivery Status**
  - **PUT** `/api/delivery/update-status`
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
  - **GET** `/api/delivery/my-orders`

---

## 8. Admin Dashboard
*Requires Admin Token*

- **Get Dashboard Stats**
  - **GET** `/api/admin/dashboard`
- **Get All Users**
  - **GET** `/api/users` (Admin access only)
- **Get All Vendors**
  - **GET** `/api/vendors` (?status=pending)
- **Approve/Reject Vendor**
  - **PUT** `/api/vendors/status/:id`
  - **Body (JSON)**: `{"status": "approved"}`
- **Get All Delivery Partners**
  - **GET** `/api/admin/delivery` (or `/api/delivery`)

---

## 9. Payment (To Be Implemented)
*Module currently inactive.*

- **Create Order**
  - **POST** `/api/payment/create-order`
- **Verify Payment**
  - **POST** `/api/payment/verify`
