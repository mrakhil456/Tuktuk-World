import React, {
  createContext,
  useContext,
  useEffect,
  useState
} from 'react';

import api from '../api';

const StoreContext = createContext(null);

// ======================================================
// STORAGE KEYS
// ======================================================

const USER_KEY = 'tw_user';
const TOKEN_KEY = 'tw_token';
const GUEST_CART_KEY = 'tw_cart_guest';

// ======================================================
// SAFE JSON PARSER
// ======================================================

const readJSON = (key, fallback = null) => {
  try {
    const value = localStorage.getItem(key);

    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.error(`Storage read error (${key}):`, error);
    return fallback;
  }
};

// ======================================================
// GET USER ID
// Backend response uses user.id
// ======================================================

const getUserId = (user) => {
  return user?.id || user?._id || null;
};

// ======================================================
// USER-SPECIFIC CART KEY
// ======================================================

const getUserCartKey = (user) => {
  const userId = getUserId(user);

  if (!userId) {
    return null;
  }

  return `tw_cart_user_${userId}`;
};

// ======================================================
// LOAD CART FOR CURRENT USER
// ======================================================

const loadUserCart = (user) => {
  // Admin must never receive a customer's cart.
  if (user?.role === 'admin') {
    return [];
  }

  const userCartKey = getUserCartKey(user);

  if (!userCartKey) {
    return readJSON(GUEST_CART_KEY, []);
  }

  const savedCart = localStorage.getItem(userCartKey);

  if (savedCart !== null) {
    const parsed = readJSON(userCartKey, []);

    return Array.isArray(parsed) ? parsed : [];
  }

  // Migrate the old shared cart only for the
  // customer who was already logged in.
  const legacyCart = localStorage.getItem('tw_cart');

  if (legacyCart !== null) {
    const oldCart = readJSON('tw_cart', []);

    localStorage.setItem(
      userCartKey,
      JSON.stringify(Array.isArray(oldCart) ? oldCart : [])
    );

    localStorage.removeItem('tw_cart');

    return Array.isArray(oldCart) ? oldCart : [];
  }

  return [];
};

// ======================================================
// INITIAL USER
// ======================================================

const getInitialUser = () => {
  const user = readJSON(USER_KEY, null);

  return user && typeof user === 'object'
    ? user
    : null;
};

// ======================================================
// PROVIDER
// ======================================================

export function StoreProvider({ children }) {
  const [user, setUser] = useState(getInitialUser);

  const [cart, setCart] = useState(() => {
    const initialUser = getInitialUser();

    return loadUserCart(initialUser);
  });

  // ====================================================
  // SAVE CART FOR THE CURRENT USER
  // ====================================================

  useEffect(() => {
    // Never save customer data in admin storage.
    if (user?.role === 'admin') {
      return;
    }

    const cartKey = user
      ? getUserCartKey(user)
      : GUEST_CART_KEY;

    if (!cartKey) {
      return;
    }

    try {
      localStorage.setItem(
        cartKey,
        JSON.stringify(cart)
      );
    } catch (error) {
      console.error('Cart save error:', error);
    }
  }, [cart, user]);

  // ====================================================
  // LOGIN
  // ====================================================

  const login = (data) => {
    if (!data?.token || !data?.user) {
      throw new Error('Invalid login response.');
    }

    const loggedInUser = data.user;

    try {
      localStorage.setItem(TOKEN_KEY, data.token);

      localStorage.setItem(
        USER_KEY,
        JSON.stringify(loggedInUser)
      );

      // Load only this user's own cart.
      const savedCart = loadUserCart(loggedInUser);

      setUser(loggedInUser);
      setCart(savedCart);
    } catch (error) {
      console.error('Login storage error:', error);
      throw error;
    }
  };

  // ====================================================
  // LOGOUT
  // ====================================================

  const logout = () => {
    try {
      // Save the current customer's cart before logout.
      if (user && user.role !== 'admin') {
        const cartKey = getUserCartKey(user);

        if (cartKey) {
          localStorage.setItem(
            cartKey,
            JSON.stringify(cart)
          );
        }
      }

      // Remove authentication only.
      // Do not delete the customer's saved cart.
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);

      setUser(null);

      // Clear the visible cart after logout.
      // The saved customer cart remains untouched.
      setCart([]);
    } catch (error) {
      console.error('Logout error:', error);

      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);

      setUser(null);
      setCart([]);
    }
  };

  // ====================================================
  // ADD PRODUCT TO CART
  // ====================================================

  const add = (product) => {
    if (!product?._id) {
      console.error('Invalid product.');
      return;
    }

    // Do not allow admin cart to contain customer data.
    if (user?.role === 'admin') {
      return;
    }

    const stock = Number(product.stock);

    if (!Number.isFinite(stock) || stock <= 0) {
      return;
    }

    setCart((previousCart) => {
      const existing = previousCart.find(
        (item) => item.product === product._id
      );

      if (existing) {
        return previousCart.map((item) =>
          item.product === product._id
            ? {
                ...item,
                qty: Math.min(item.qty + 1, stock)
              }
            : item
        );
      }

      return [
        ...previousCart,
        {
          product: product._id,
          name: product.name,
          price: Number(product.price || 0),
          image: product.image || '',
          qty: 1
        }
      ];
    });
  };

  // ====================================================
  // CONTEXT VALUE
  // ====================================================

  const value = {
    user,
    setUser,
    login,
    logout,

    cart,
    setCart,
    add,

    api
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}

// ======================================================
// CUSTOM HOOK
// ======================================================

export const useStore = () => {
  const context = useContext(StoreContext);

  if (!context) {
    throw new Error(
      'useStore must be used inside StoreProvider.'
    );
  }

  return context;
};