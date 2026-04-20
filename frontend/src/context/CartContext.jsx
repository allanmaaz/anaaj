import { createContext, useContext, useState, useCallback } from 'react';
import { api } from '../api';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartCount, setCartCount] = useState(0);

  const refreshCart = useCallback(async () => {
    try {
      const data = await api.getCart();
      setCartCount(data.count || 0);
    } catch {
      setCartCount(0);
    }
  }, []);

  const addToCart = useCallback(async (productId, qty = 1) => {
    const data = await api.addToCart(productId, qty);
    if (data.success) {
      setCartCount(data.count || 0);
      return { success: true };
    }
    return { success: false, error: data.error };
  }, []);

  return (
    <CartContext.Provider value={{ cartCount, refreshCart, addToCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
