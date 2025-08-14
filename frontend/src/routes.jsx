// frontend/src/routes.jsx
import React from "react";
import HomePage from "./pages/homepage/HomePage";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import ForgotPassword from "./pages/auth/ForgotPassword"; // 🆕 NEW
import ResetPassword from "./pages/auth/ResetPassword"; // 🆕 NEW
import Products from "./pages/products/Products";
import AboutUs from "./pages/about/About";
import Seller from "./pages/seller/Seller";
import ShopProfile from "./pages/shopprofile/ShopProfile";
import MyProfile from "./pages/myProfile/MyProfile";
import MyOrders from "./pages/myOrders/MyOrders";
import MyShop from "./pages/myShop/MyShop";
import Cart from "./pages/cart/Cart";
import Checkout from "./pages/checkout/Checkout";
import AdminDashboard from "./pages/adminDashboard/AdminDashboard"; // 🆕 NEW: Admin Dashboard
import Confirmation from "./pages/confirmation/Confirmation";
import ItemPage from "./pages/itemPage/ItemPage";
import EnableMFA from "./pages/enableMfa/EnableMFA";
import Unauthorized from "./pages/unauthorized/Unauthorized";
import ProtectedRoute from "./components/ProtectedRoute";

const routes = [
  // ===== PUBLIC ROUTES (All users can access) =====
  {
    path: "/",
    element: (
      <ProtectedRoute publicAccess={true}>
        <HomePage />
      </ProtectedRoute>
    ),
    name: "Homepage",
  },
  {
    path: "/aboutus",
    element: (
      <ProtectedRoute publicAccess={true}>
        <AboutUs />
      </ProtectedRoute>
    ),
    name: "AboutUs",
  },
  {
    path: "/products",
    element: (
      <ProtectedRoute publicAccess={true}>
        <Products />
      </ProtectedRoute>
    ),
    name: "Products",
  },
  {
    path: "/profile/:sellerId",
    element: (
      <ProtectedRoute publicAccess={true}>
        <ShopProfile />
      </ProtectedRoute>
    ),
    name: "ShopProfile",
  },
  {
    path: "/item/:productId",
    element: (
      <ProtectedRoute publicAccess={true}>
        <ItemPage />
      </ProtectedRoute>
    ),
    name: "ItemPage",
  },
  // 🆕 NEW: Password Reset Routes (Public Access)
  {
    path: "/forgot-password",
    element: (
      <ProtectedRoute publicAccess={true}>
        <ForgotPassword />
      </ProtectedRoute>
    ),
    name: "ForgotPassword",
  },
  {
    path: "/reset-password",
    element: (
      <ProtectedRoute publicAccess={true}>
        <ResetPassword />
      </ProtectedRoute>
    ),
    name: "ResetPassword",
  },

  // ===== NO-AUTH REQUIRED ROUTES (Only for non-logged in users) =====
  {
    path: "/login",
    element: (
      <ProtectedRoute requireNoAuth={true}>
        <Login />
      </ProtectedRoute>
    ),
    name: "Login",
  },
  {
    path: "/register",
    element: (
      <ProtectedRoute requireNoAuth={true}>
        <Register />
      </ProtectedRoute>
    ),
    name: "Register",
  },

  // ===== AUTHENTICATED ROUTES (Logged in users: buyers and sellers) =====
  {
    path: "/myProfile",
    element: (
      <ProtectedRoute requireAuth={true}>
        <MyProfile />
      </ProtectedRoute>
    ),
    name: "MyProfile",
  },
  {
    path: "/myOrders",
    element: (
      <ProtectedRoute requireAuth={true}>
        <MyOrders />
      </ProtectedRoute>
    ),
    name: "MyOrders",
  },
  {
    path: "/cart",
    element: (
      <ProtectedRoute requireAuth={true}>
        <Cart />
      </ProtectedRoute>
    ),
    name: "Cart",
  },
  {
    path: "/checkout/:sellerId",
    element: (
      <ProtectedRoute requireAuth={true}>
        <Checkout />
      </ProtectedRoute>
    ),
    name: "Checkout",
  },
  {
    path: "/confirmation/:orderId",
    element: (
      <ProtectedRoute requireAuth={true}>
        <Confirmation />
      </ProtectedRoute>
    ),
    name: "Confirmation",
  },
  {
    path: "/enable-mfa",
    element: (
      <ProtectedRoute requireAuth={true}>
        <EnableMFA />
      </ProtectedRoute>
    ),
    name: "EnableMFA",
  },

  // ===== SELLER/STORE ONLY ROUTES (Logged in + isStore = true) =====
  {
    path: "/seller",
    element: (
      <ProtectedRoute requireAuth={true} requireStore={true}>
        <Seller />
      </ProtectedRoute>
    ),
    name: "Seller",
  },
  {
    path: "/myShop",
    element: (
      <ProtectedRoute requireAuth={true} requireStore={true}>
        <MyShop />
      </ProtectedRoute>
    ),
    name: "MyShop",
  },

  // 🆕 ===== ADMIN ONLY ROUTES (Logged in + isAdmin = true) =====
  {
    path: "/admin/dashboard",
    element: (
      <ProtectedRoute requireAuth={true} requireAdmin={true}>
        <AdminDashboard />
      </ProtectedRoute>
    ),
    name: "AdminDashboard",
  },

  // ===== ERROR PAGES =====
  {
    path: "/unauthorized",
    element: <Unauthorized />,
    name: "Unauthorized",
  },
];

export default routes;
