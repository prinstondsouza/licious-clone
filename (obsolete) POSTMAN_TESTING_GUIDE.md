# Postman API Testing Guide
## Base URL: `http://localhost:5000`

---

## 🔐 AUTHENTICATION HEADERS

For protected routes, add this header:
```
Authorization: Bearer <YOUR_TOKEN>
```

**Token Types:**
- **User Token**: Get from `/api/users/login` with role "user"
- **Admin Token**: Get from `/api/users/login` with role "admin" 
- **Vendor Token**: Get from `/api/users/login` with role "vendor" (after approval)
- **Delivery Token**: Get from `/api/users/login` with role "delivery" (after approval)

---

## 👤 USER ROUTES (`/api/users`)

### 1. Register User
**Method:** `POST`  
**URL:** `http://localhost:5000/api/users/register`  
**Headers:** None  
**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

### 2. Login User
**Method:** `POST`  
**URL:** `http://localhost:5000/api/users/login`  
**Headers:** None  
**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
**Response:** Returns token - save this for protected routes

### 3. Get All Users
**Method:** `GET`  
**URL:** `http://localhost:5000/api/users`  
**Headers:** None  
**Body:** None

### 4. Get Current User (Protected)
**Method:** `GET`  
**URL:** `http://localhost:5000/api/users/me`  
**Headers:** `Authorization: Bearer <USER_TOKEN>`  
**Body:** None

### 5. Admin Only Route (Test)
**Method:** `GET`  
**URL:** `http://localhost:5000/api/users/admin-only`  
**Headers:** `Authorization: Bearer <ADMIN_TOKEN>`  
**Body:** None

---

## 🏪 VENDOR ROUTES (`/api/vendors`)

### 1. Self-Register Vendor (Public)
**Method:** `POST`  
**URL:** `http://localhost:5000/api/vendors/register`  
**Headers:** None  
**Body:**
```json
{
  "storeName": "Fresh Meat Store",
  "ownerName": "Vendor Owner",
  "email": "vendor@example.com",
  "phone": "9876543210",
  "password": "password123",
  "documents": {
    "gst": "GST123456",
    "pan": "PAN123456",
    "other": "License123"
  }
}
```
**Note:** Creates user account + vendor profile with status "pending"

### 2. Admin Create Vendor (Alternative)
**Method:** `POST`  
**URL:** `http://localhost:5000/api/vendors`  
**Headers:** `Authorization: Bearer <ADMIN_TOKEN>`  
**Body:**
```json
{
  "storeName": "Premium Meat Store",
  "ownerName": "Admin Created Vendor",
  "email": "adminvendor@example.com",
  "phone": "9876543211",
  "documents": {
    "gst": "GST789012",
    "pan": "PAN789012"
  }
}
```

### 3. Get All Vendors (Admin)
**Method:** `GET`  
**URL:** `http://localhost:5000/api/vendors`  
**URL (Filter by status):** `http://localhost:5000/api/vendors?status=pending`  
**Headers:** `Authorization: Bearer <ADMIN_TOKEN>`  
**Body:** None

### 4. Approve/Reject Vendor (Admin)
**Method:** `PUT`  
**URL:** `http://localhost:5000/api/vendors/status/:id`  
**Example:** `http://localhost:5000/api/vendors/status/507f1f77bcf86cd799439011`  
**Headers:** `Authorization: Bearer <ADMIN_TOKEN>`  
**Body:**
```json
{
  "status": "approved"
}
```
or
```json
{
  "status": "rejected"
}
```

### 5. Get Vendor Profile (Vendor)
**Method:** `GET`  
**URL:** `http://localhost:5000/api/vendors/me`  
**Headers:** `Authorization: Bearer <VENDOR_TOKEN>`  
**Body:** None  

### 6. Vendor Dashboard
**Method:** `GET`  
**URL:** `http://localhost:5000/api/vendors/dashboard`  
**Headers:** `Authorization: Bearer <VENDOR_TOKEN>`  
**Body:** None

### 7. Vendor Inventory
**Method:** `GET`  
**URL:** `http://localhost:5000/api/vendors/inventory`  
**Headers:** `Authorization: Bearer <VENDOR_TOKEN>`  
**Body:** None

---

## 🚚 DELIVERY PARTNER ROUTES (`/api/delivery`)

### 1. Self-Register Delivery Partner (Public)
**Method:** `POST`  
**URL:** `http://localhost:5000/api/delivery/register`  
**Headers:** None  
**Body:**
```json
{
  "name": "Rider One",
  "phone": "9876543210",
  "vehicleType": "Bike",
  "email": "rider@example.com",
  "password": "password123"
}
```
**Note:** Creates user account + delivery partner profile with status "pending"

### 2. Admin Create Delivery Partner (Alternative)
**Method:** `POST`  
**URL:** `http://localhost:5000/api/delivery/create`  
**Headers:** `Authorization: Bearer <ADMIN_TOKEN>`  
**Body:**
```json
{
  "name": "Admin Rider",
  "phone": "9876543211",
  "vehicleType": "Bike",
  "userId": "507f1f77bcf86cd799439011"
}
```
**Note:** `userId` is optional

### 3. Get All Delivery Partners (Admin)
**Method:** `GET`  
**URL:** `http://localhost:5000/api/delivery`  
**URL (Filter by status):** `http://localhost:5000/api/delivery?status=pending`  
**Headers:** `Authorization: Bearer <ADMIN_TOKEN>`  
**Body:** None

### 4. Approve/Reject Delivery Partner (Admin)
**Method:** `PUT`  
**URL:** `http://localhost:5000/api/delivery/status/:id`  
**Example:** `http://localhost:5000/api/delivery/status/507f1f77bcf86cd799439011`  
**Headers:** `Authorization: Bearer <ADMIN_TOKEN>`  
**Body:**
```json
{
  "status": "approved"
}
```
or
```json
{
  "status": "rejected"
}
```

### 5. Assign Delivery Partner to Order (Admin)
**Method:** `POST`  
**URL:** `http://localhost:5000/api/delivery/assign`  
**Headers:** `Authorization: Bearer <ADMIN_TOKEN>`  
**Body:**
```json
{
  "orderId": "507f1f77bcf86cd799439011",
  "partnerId": "507f1f77bcf86cd799439012"
}
```

### 6. Update Delivery Status
**Method:** `PUT`  
**URL:** `http://localhost:5000/api/delivery/update-status`  
**Headers (Option 1 - Admin):** `Authorization: Bearer <ADMIN_TOKEN>`  
**Headers (Option 2 - No Auth):** None  
**Body (Option 1 - Admin):**
```json
{
  "orderId": "507f1f77bcf86cd799439011",
  "status": "delivered"
}
```
**Body (Option 2 - With deliveryPartnerId):**
```json
{
  "orderId": "507f1f77bcf86cd799439011",
  "status": "delivered",
  "deliveryPartnerId": "507f1f77bcf86cd799439012"
}
```
**Valid statuses:** `"out-for-delivery"`, `"delivered"`, `"cancelled"`

### 7. Link User to Delivery Partner
**Method:** `POST`  
**URL:** `http://localhost:5000/api/delivery/link-user`  
**Headers:** `Authorization: Bearer <DELIVERY_TOKEN>`  
**Body:**
```json
{
  "partnerId": "507f1f77bcf86cd799439011"
}
```

### 8. Get Assigned Orders (Delivery Partner)
**Method:** `GET`  
**URL:** `http://localhost:5000/api/delivery/my-orders`  
**Headers:** `Authorization: Bearer <DELIVERY_TOKEN>`  
**Body:** None

---

## 📦 PRODUCT ROUTES (`/api/products`)

### 1. Get All Products (Public)
**Method:** `GET`  
**URL:** `http://localhost:5000/api/products`  
**Headers:** None  
**Body:** None

### 2. Get Product by ID (Public)
**Method:** `GET`  
**URL:** `http://localhost:5000/api/products/:id`  
**Example:** `http://localhost:5000/api/products/507f1f77bcf86cd799439011`  
**Headers:** None  
**Body:** None

### 3. Create Product (Admin/Vendor)
**Method:** `POST`  
**URL:** `http://localhost:5000/api/products`  
**Headers:** `Authorization: Bearer <ADMIN_TOKEN>` or `<VENDOR_TOKEN>`  
**Body:**
```json
{
  "name": "Fresh Chicken Breast",
  "description": "Premium quality chicken breast",
  "price": 299,
  "category": "Chicken",
  "image": "https://example.com/chicken.jpg",
  "stock": 100,
  "vendor": "507f1f77bcf86cd799439011"
}
```

### 4. Update Product (Admin/Vendor)
**Method:** `PUT`  
**URL:** `http://localhost:5000/api/products/:id`  
**Example:** `http://localhost:5000/api/products/507f1f77bcf86cd799439011`  
**Headers:** `Authorization: Bearer <ADMIN_TOKEN>` or `<VENDOR_TOKEN>`  
**Body:**
```json
{
  "name": "Updated Product Name",
  "price": 349,
  "stock": 50
}
```

### 5. Delete Product (Admin/Vendor)
**Method:** `DELETE`  
**URL:** `http://localhost:5000/api/products/:id`  
**Example:** `http://localhost:5000/api/products/507f1f77bcf86cd799439011`  
**Headers:** `Authorization: Bearer <ADMIN_TOKEN>` or `<VENDOR_TOKEN>`  
**Body:** None

---

## 🛒 CART ROUTES (`/api/cart`)

### 1. Get Cart (User)
**Method:** `GET`  
**URL:** `http://localhost:5000/api/cart`  
**Headers:** `Authorization: Bearer <USER_TOKEN>`  
**Body:** None

### 2. Add to Cart (User)
**Method:** `POST`  
**URL:** `http://localhost:5000/api/cart/add`  
**Headers:** `Authorization: Bearer <USER_TOKEN>`  
**Body:**
```json
{
  "productId": "507f1f77bcf86cd799439011",
  "quantity": 2
}
```

### 3. Remove from Cart (User)
**Method:** `POST`  
**URL:** `http://localhost:5000/api/cart/remove`  
**Headers:** `Authorization: Bearer <USER_TOKEN>`  
**Body:**
```json
{
  "productId": "507f1f77bcf86cd799439011"
}
```

---

## 📋 ORDER ROUTES (`/api/orders`)

### 1. Place Order (User)
**Method:** `POST`  
**URL:** `http://localhost:5000/api/orders/place`  
**Headers:** `Authorization: Bearer <USER_TOKEN>`  
**Body:**
```json
{
  "address": "123 Main Street, City, State, 12345",
  "paymentMethod": "cod"
}
```

### 2. Get My Orders (User)
**Method:** `GET`  
**URL:** `http://localhost:5000/api/orders/my-orders`  
**Headers:** `Authorization: Bearer <USER_TOKEN>`  
**Body:** None

### 3. Get All Orders (Admin)
**Method:** `GET`  
**URL:** `http://localhost:5000/api/orders/all`  
**Headers:** `Authorization: Bearer <ADMIN_TOKEN>`  
**Body:** None

### 4. Update Order Status (Admin/Delivery)
**Method:** `PUT`  
**URL:** `http://localhost:5000/api/orders/status/:id`  
**Example:** `http://localhost:5000/api/orders/status/507f1f77bcf86cd799439011`  
**Headers:** `Authorization: Bearer <ADMIN_TOKEN>` or `<DELIVERY_TOKEN>`  
**Body:**
```json
{
  "status": "confirmed"
}
```
**Valid statuses:** `"pending"`, `"confirmed"`, `"out-for-delivery"`, `"delivered"`, `"cancelled"`

### 5. Get Vendor Orders (Vendor)
**Method:** `GET`  
**URL:** `http://localhost:5000/api/orders/vendor`  
**Headers:** `Authorization: Bearer <VENDOR_TOKEN>`  
**Body:** None

---

## 👨‍💼 ADMIN ROUTES (`/api/admin`)

### 1. Admin Dashboard
**Method:** `GET`  
**URL:** `http://localhost:5000/api/admin/dashboard`  
**Headers:** `Authorization: Bearer <ADMIN_TOKEN>`  
**Body:** None

### 2. Get Vendors (Admin)
**Method:** `GET`  
**URL:** `http://localhost:5000/api/admin/vendors`  
**Headers:** `Authorization: Bearer <ADMIN_TOKEN>`  
**Body:** None

### 3. Get Delivery Partners (Admin)
**Method:** `GET`  
**URL:** `http://localhost:5000/api/admin/delivery`  
**Headers:** `Authorization: Bearer <ADMIN_TOKEN>`  
**Body:** None

---

## 🧪 TESTING WORKFLOW

### Step 1: Create Admin User
1. Register admin: `POST /api/users/register` with `"role": "admin"`
2. Login admin: `POST /api/users/login` → Save admin token

### Step 2: Register Vendor
1. Self-register vendor: `POST /api/vendors/register` → Status: "pending"
2. Login vendor: `POST /api/users/login` with vendor email → Save vendor token
3. Admin approves: `PUT /api/vendors/status/:id` with `"status": "approved"`
4. Vendor can now access dashboard: `GET /api/vendors/dashboard`

### Step 3: Register Delivery Partner
1. Self-register delivery: `POST /api/delivery/register` → Status: "pending"
2. Login delivery: `POST /api/users/login` with delivery email → Save delivery token
3. Admin approves: `PUT /api/delivery/status/:id` with `"status": "approved"`
4. Delivery can now access orders: `GET /api/delivery/my-orders`

### Step 4: User Flow
1. Register user: `POST /api/users/register` with `"role": "user"`
2. Login user: `POST /api/users/login` → Save user token
3. Browse products: `GET /api/products`
4. Add to cart: `POST /api/cart/add`
5. Place order: `POST /api/orders/place`

### Step 5: Admin Management
1. View pending vendors: `GET /api/vendors?status=pending`
2. View pending delivery partners: `GET /api/delivery?status=pending`
3. Approve/reject as needed

---

## 📝 NOTES

- Replace `:id` with actual MongoDB ObjectId
- Replace `<TOKEN>` with actual JWT token from login
- All timestamps are automatically added by Mongoose
- Status enums are case-sensitive
- Payment routes are disabled (commented out in server.js)

---

## 🔍 QUICK REFERENCE

|           Route            | Method | Auth Required |  Role |
|----------------------------|--------|---------------|-------|
| `/api/users/register`      | POST   |       No      |      |
| `/api/users/login`         | POST   |       No      |      |
| `/api/vendors/register`    | POST   |       No      |      |
| `/api/delivery/register`   | POST   |       No      |      |
| `/api/products`            | GET    |       No      |      |
| `/api/cart`                | GET    |      Yes      | user  |
| `/api/orders/place`        | POST   |      Yes      | user  |
| `/api/vendors/status/:id`  | PUT    |      Yes      | admin |
| `/api/delivery/status/:id` | PUT    |      Yes      | admin |


---

**Happy Testing! 🚀**

