import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();

  const currency = import.meta.env.VITE_CURRENCY || "₹";

  const [user, setUser] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [showUserLogin, setshowUserLogin] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ Validate token and load user data
  const validateToken = async () => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    
    if (token && savedUser) {
      try {
        const response = await axios.get("http://localhost:4000/api/users/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data) {
          setUser(response.data);
          localStorage.setItem("user", JSON.stringify(response.data));
        }
      } catch (error) {
        console.error("Token validation failed:", error);
        // Clear invalid data
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      }
    }
  };

  // ✅ Load user, cart, and theme from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    const savedTheme = localStorage.getItem("theme");

    if (savedCart) setCartItems(JSON.parse(savedCart));
    if (savedTheme) setIsDarkMode(savedTheme === "dark");
    
    // Validate token and load user
    validateToken();
  }, []);

  // ✅ Save user to localStorage when user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  // ✅ Save cart to localStorage when cart changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // ✅ Save theme to localStorage when theme changes
  useEffect(() => {
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    // Apply theme to document
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // ✅ Toggle theme function
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // ✅ Fetch products from backend
  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/products");
      const mapped = response.data.map((p) => ({
        ...p,
        _id: p.id?.toString() || p._id,
        image: (() => {
          if (p.images) {
            try {
              return JSON.parse(p.images);
            } catch {
              return [];
            }
          }
          return p.image ? [p.image] : [];
        })(),
        description: Array.isArray(p.description)
          ? p.description
          : [p.description],
        inStock: p.inStock ?? true,
      }));
      setProducts(mapped);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      toast.error("Could not load products");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ✅ Add item to cart
  const addToCart = (itemId) => {
    const cartData = { ...cartItems };
    cartData[itemId] = (cartData[itemId] || 0) + 1;
    setCartItems(cartData);
    toast.success("Added to cart");
  };

  // ✅ Update cart item quantity
  const updateCartItem = (itemId, quantity) => {
    const cartData = { ...cartItems };
    cartData[itemId] = quantity;
    setCartItems(cartData);
    toast.success("Cart updated");
  };

  // ✅ Remove item from cart
  const removeFromCart = (itemId) => {
    const cartData = { ...cartItems };
    if (cartData[itemId]) {
      cartData[itemId] -= 1;
      if (cartData[itemId] === 0) delete cartData[itemId];
    }
    setCartItems(cartData);
    toast.success("Removed from cart");
  };

  // ✅ Count total items in cart
  const getCartCount = () => {
    return Object.values(cartItems).reduce((a, b) => a + b, 0);
  };

  // ✅ Calculate total cart amount (using price)
  const getCartAmount = () => {
    let total = 0;
    for (const itemId in cartItems) {
      const product = products.find(p => p._id === itemId);
      if (product) {
        total += product.price * cartItems[itemId];
      }
    }
    return Math.round(total * 100) / 100;
  };

  const value = {
    navigate,
    user,
    setUser,
    isSeller,
    setIsSeller,
    showUserLogin,
    setshowUserLogin,
    isDarkMode,
    toggleTheme,
    products,
    currency,
    addToCart,
    updateCartItem,
    removeFromCart,
    cartItems,
    setCartItems, // <-- Export setCartItems
    searchQuery,
    setSearchQuery,
    getCartCount,
    getCartAmount,
    fetchProducts,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
