# Licious Clone

This project is a comprehensive full-stack e-commerce application designed to replicate the core features of Licious, a premium meat and seafood delivery platform. It is structured as a monorepo using [Turborepo](https://turbo.build/repo) to manage multiple frontend applications and a shared backend.

## 🚀 Features

- **Multi-Role Architecture**: Separate applications for Users, Admin, Vendors, and Delivery Partners.
- **User App**: Browse products, manage cart, place orders, and track delivery status.
- **Admin Dashboard**: Manage inventory, view orders, and oversee platform operations.
- **Vendor Portal**: Interface for vendors to manage their specific products and orders.
- **Delivery App**: Dedicated interface for delivery partners to view and fulfill assigned orders.
- **Authentication**: Secure JWT-based authentication for all user roles.
- **Payments**: Integrated Razorpay for secure payment processing.
- **Image Uploads**: Support for product image uploads.

## 🛠 Tech Stack

### Monorepo & Build Tooling

- **Turborepo**: High-performance build system for JavaScript/TypeScript monorepos.

### Frontend (`apps/`)

- **React 19**: Modern UI library for building interactive user interfaces.
- **React Router 7**: Declarative routing for React applications.
- **Axios**: Promise-based HTTP client for API requests.
- **React Toastify**: For toaster notifications.
- **Lucide React**: Clean and consistent icon set.

### Backend (`backend/`)

- **Node.js & Express**: Fast, unopinionated web framework for Node.js.
- **MongoDB & Mongoose**: NoSQL database and object modeling.
- **JWT (JSON Web Tokens)**: Secure user authentication.
- **Bcryptjs**: Password hashing.
- **Multer**: Middleware for handling `multipart/form-data` (file uploads).
- **Razorpay**: Payment gateway integration.

## 📂 Project Structure

```bash
├── apps/               # Frontend applications
│   ├── admin/          # Admin dashboard
│   ├── delivery/       # Delivery partner application
│   ├── user/           # Customer-facing store
│   └── vendor/         # Vendor management portal
├── backend/            # Express.js REST API
├── packages/           # Shared internal libraries/configs
└── package.json        # Root configuration
```

## 🏁 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- MongoDB installed and running locally, or a MongoDB Atlas connection string.

### Installation

1.  **Clone the repository**:

    ```bash
    git clone https://github.com/noelquadras/licious-clone.git
    cd licious-clone
    ```

2.  **Install dependencies**:
    Install dependencies for all workspaces from the root directory:

    ```bash
    npm install
    ```

3.  **Environment Variables**:
    Create a `.env` file in the `backend/` directory and configure the following:
    ```env
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    RAZORPAY_KEY_ID=your_razorpay_key_id
    RAZORPAY_KEY_SECRET=your_razorpay_key_secret
    ```
    _(Note: Check individual app directories if they require specific `.env` configurations)_

### Running the Project

Start the development server for all applications and the backend simultaneously using Turbo:

```bash
npm run dev
```

This command will start the backend server and all frontend applications (User, Admin, Vendor, Delivery) in parallel.

- **Backend**: `http://localhost:5000`
- **User App**: `http://localhost:3000` (default React port, may vary if ports conflict)
- **Admin/Vendor/Delivery**: Check the terminal output for their specific local URLs (e.g., `http://localhost:3001`, `http://localhost:3002`, etc.).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
