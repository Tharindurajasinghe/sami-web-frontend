// src/context/CartContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('shop_cart');
    if (saved) try { setItems(JSON.parse(saved)); } catch {}
  }, []);

  const persist = (next) => {
    setItems(next);
    localStorage.setItem('shop_cart', JSON.stringify(next));
  };

  const addItem = (item) => {
    setItems(prev => {
      const exists = prev.find(i => i._id === item._id);
      const next   = exists
        ? prev.map(i => i._id === item._id ? { ...i, qty: i.qty + 1 } : i)
        : [...prev, { ...item, qty: 1 }];
      localStorage.setItem('shop_cart', JSON.stringify(next));
      return next;
    });
  };

  const removeItem = (id)       => persist(items.filter(i => i._id !== id));
  const updateQty  = (id, qty)  => {
    if (qty < 1) { removeItem(id); return; }
    persist(items.map(i => i._id === id ? { ...i, qty } : i));
  };
  const clearCart  = ()         => { setItems([]); localStorage.removeItem('shop_cart'); };

  const total = items.reduce((s, i) => s + i.finalPrice * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
