// src/context/CartContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

// Validates a single cart item loaded from localStorage.
// Returns true only if the item has all fields the checkout flow depends on.
// Any corrupt / outdated entry is silently dropped rather than crashing.
function isValidItem(i) {
  return (
    i &&
    typeof i._id        === 'string' &&
    typeof i.name       === 'string' &&
    typeof i.finalPrice === 'number' && isFinite(i.finalPrice) && i.finalPrice >= 0 &&
    typeof i.qty        === 'number' && Number.isInteger(i.qty) && i.qty >= 1
  );
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('shop_cart');
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      // Bug medium-2 fix: drop any item that fails validation so corrupt
      // localStorage data can never produce NaN totals or backend 400 errors.
      if (Array.isArray(parsed)) {
        const clean = parsed.filter(isValidItem);
        if (clean.length !== parsed.length) {
          // Some items were invalid — persist the cleaned list right away
          localStorage.setItem('shop_cart', JSON.stringify(clean));
        }
        setItems(clean);
      }
    } catch {
      // JSON was unparseable — clear it so the cart starts fresh
      localStorage.removeItem('shop_cart');
    }
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

  const removeItem = (id)      => persist(items.filter(i => i._id !== id));
  const updateQty  = (id, qty) => {
    if (qty < 1) { removeItem(id); return; }
    persist(items.map(i => i._id === id ? { ...i, qty } : i));
  };
  const clearCart  = ()        => { setItems([]); localStorage.removeItem('shop_cart'); };

  // Bug medium-2 fix: guard each term against NaN with Number() + fallback to 0.
  // If finalPrice or qty is somehow still non-finite after validation, the
  // reduce produces 0 for that item instead of poisoning the whole total.
  const total = items.reduce((s, i) => s + (Number(i.finalPrice) || 0) * (Number(i.qty) || 0), 0);
  const count = items.reduce((s, i) => s + (Number(i.qty) || 0), 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
