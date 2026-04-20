import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider }  from './context/CartContext';
import { ToastContainer } from './components/Toast';
import Navbar from './components/Navbar';

// Pages
import Home          from './pages/Home';
import Shop          from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart          from './pages/Cart';
import Checkout      from './pages/Checkout';
import OrderSuccess  from './pages/OrderSuccess';
import Profile       from './pages/Profile';
import Login         from './pages/Login';
import Register      from './pages/Register';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders   from './pages/admin/AdminOrders';

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Navbar />
        <Routes>
          <Route path="/"                   element={<Home />} />
          <Route path="/shop"               element={<Shop />} />
          <Route path="/product/:id"        element={<ProductDetail />} />
          <Route path="/cart"               element={<Cart />} />
          <Route path="/checkout"           element={<Checkout />} />
          <Route path="/order-success/:orderId" element={<OrderSuccess />} />
          <Route path="/profile"            element={<Profile />} />
          <Route path="/login"              element={<Login />} />
          <Route path="/register"           element={<Register />} />
          <Route path="/admin/products"     element={<AdminProducts />} />
          <Route path="/admin/orders"       element={<AdminOrders />} />
        </Routes>
        <ToastContainer />
      </CartProvider>
    </BrowserRouter>
  );
}
