import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext.jsx";
import { assets } from "../assets/assets";

const Cart = () => {
  const navigate = useNavigate();
  const {
    products,
    currency,
    cartItems,
    removeFromCart,
    getCartCount,
    updateCartItem,
    getCartAmount,
    // Add setCartItems from context
    setCartItems,
  } = useAppContext();

  const [cartArray, setCartArray] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [showAddress, setShowAddress] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentOption, setPaymentOption] = useState("COD");

  // Load addresses from backend
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (!token || !user) return;
        
        const response = await fetch(`http://localhost:4000/api/addresses/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const addressesData = await response.json();
          setAddresses(addressesData);
          if (addressesData.length > 0) {
            setSelectedAddress(addressesData[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching addresses:', error);
      }
    };
    
    fetchAddresses();
  }, []);

  // Create cart array from cartItems
  const getCart = () => {
    let tempArray = [];
    for (const key in cartItems) {
      const foundProduct = products.find((item) => item._id.toString() === key);
      if (foundProduct) {
        const productCopy = { ...foundProduct, quantity: cartItems[key] };
        tempArray.push(productCopy);
      }
    }
    setCartArray(tempArray);
  };

  useEffect(() => {
    if (products.length > 0 && cartItems) {
      getCart();
    }
  }, [products, cartItems]);

  // Calculate cart total using offerPrice if available and less than price
  const getCartTotal = () => {
    return cartArray.reduce((total, item) => {
      const price = item.offerPrice && Number(item.offerPrice) < Number(item.price)
        ? Number(item.offerPrice)
        : Number(item.price);
      return total + price * item.quantity;
    }, 0);
  };

  const placeOrder = async () => {
    if (!selectedAddress) {
      alert("Please select or add an address before placing the order.");
      return;
    }

    // List of required address fields
    const requiredFields = [
      'firstName', 'lastName', 'email', 'street', 'city', 'state', 'zipcode', 'country', 'phone'
    ];
    // Check for missing fields
    const missingFields = requiredFields.filter(field => !selectedAddress[field]);
    if (missingFields.length > 0) {
      alert(`Address is missing required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Always send all required fields in the address object
    const addressToSend = {
      id: selectedAddress.id, // may be undefined if new
      firstName: selectedAddress.firstName,
      lastName: selectedAddress.lastName,
      email: selectedAddress.email,
      street: selectedAddress.street,
      city: selectedAddress.city,
      state: selectedAddress.state,
      zipcode: selectedAddress.zipcode,
      country: selectedAddress.country,
      phone: selectedAddress.phone
    };

    const orderData = {
      items: cartArray.map((item) => ({
        id: item._id,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        price: item.offerPrice && Number(item.offerPrice) < Number(item.price) ? item.offerPrice : item.price,
      })),
      address: addressToSend,
      paymentOption,
      total: Number(getCartTotal().toFixed(2)),
    };

    try {
      console.log('orderData:', orderData);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/orders/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Order placed successfully!');
        // Clear cart and redirect to orders page
        localStorage.removeItem('cart');
        setCartItems({}); // <-- Clear cart in React state
        navigate('/my-orders');
      } else {
        alert(data.message || data.error || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    }
  };



  return products.length > 0 && cartItems ? (
    <div className="flex flex-col md:flex-row mt-16">
      {/* LEFT SIDE: Cart Items */}
      <div className="flex-1 mr-8">
        <h2 className="text-xl font-medium mb-4">Your Cart</h2>
        {cartArray.length === 0 ? (
          <p className="text-gray-500">Your cart is empty.</p>
        ) : (
          cartArray.map((item, idx) => (
            <div key={item._id} className="flex items-center justify-between border-b border-gray-200 py-4">
              <div className="flex items-center gap-4">
                <img src={item.image?.[0]
                  ? (item.image[0].startsWith('uploads/') || item.image[0].startsWith('/uploads/')
                    ? `http://localhost:4000/${item.image[0].replace(/^\/?/, '')}`
                    : `http://localhost:4000/uploads/${item.image[0].replace(/^\/?uploads[\\/]/, '')}`)
                  : '/placeholder.jpg'} alt={item.name} className="w-16 h-16 object-cover rounded" />
                <div>
                  <p className="font-medium text-lg">{item.name}</p>
                  <p className="text-primary font-semibold">{currency}{item.offerPrice && Number(item.offerPrice) < Number(item.price) ? item.offerPrice : item.price}</p>
                  <p className="text-gray-500 text-sm">x {item.quantity}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateCartItem(item._id, item.quantity - 1)} disabled={item.quantity <= 1} className="px-2 py-1 border rounded">-</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateCartItem(item._id, item.quantity + 1)} className="px-2 py-1 border rounded">+</button>
                <button onClick={() => removeFromCart(item._id)} className="ml-4 text-red-500 hover:underline">Remove</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* RIGHT SIDE: Order Summary */}
      <div className="max-w-[360px] w-full bg-gray-100/40 p-5 max-md:mt-16 border border-gray-300/70">
        <h2 className="text-xl md:text-xl font-medium">Order Summary</h2>
        <hr className="border-gray-300 my-5" />

        {/* Address Section */}
        <div className="mb-6">
          <p className="text-sm font-medium uppercase">Delivery Address</p>
          <div className="relative flex justify-between items-start mt-2">
            <p className="text-gray-500 text-sm">
              {selectedAddress
                ? `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.country}`
                : "No address found. Please add one."}
            </p>
            <button
              onClick={() => setShowAddress(!showAddress)}
              className="text-primary hover:underline cursor-pointer text-sm"
            >
              Change
            </button>
            {showAddress && (
              <div className="absolute top-12 py-1 bg-white border border-gray-300 text-sm w-full z-20 max-h-40 overflow-y-auto">
                {addresses.map((address, index) => (
                  <p
                    key={index}
                    onClick={() => {
                      setSelectedAddress(address);
                      setShowAddress(false);
                    }}
                    className="text-gray-500 p-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {address.street}, {address.city}, {address.state},{" "}
                    {address.country}
                  </p>
                ))}
                <p
                  onClick={() => navigate("/add-address")}
                  className="text-primary text-center cursor-pointer p-2 hover:bg-primary/10"
                >
                  ➕ Add Address
                </p>
              </div>
            )}
          </div>

          {/* Payment Section */}
          <p className="text-sm font-medium uppercase mt-6">Payment Method</p>
          <select
            onChange={(e) => setPaymentOption(e.target.value)}
            className="w-full border border-gray-300 bg-white px-3 py-2 mt-2 outline-none"
            value={paymentOption}
          >
            <option value="COD">Cash On Delivery</option>
            <option value="Online">Online Payment</option>
          </select>
        </div>

        <hr className="border-gray-300" />

        {/* Summary */}
        <div className="text-gray-500 mt-4 space-y-2">
          <p className="flex justify-between">
            <span>Price</span>
            <span>{currency}{getCartTotal().toFixed(2)}</span>
          </p>
          <p className="flex justify-between">
            <span>Shipping Fee</span>
            <span className="text-green-600">Free</span>
          </p>
          <p className="flex justify-between text-lg font-medium mt-3">
            <span>Total Amount:</span>
            <span>{currency} {getCartTotal().toFixed(2)}</span>
          </p>
        </div>

        <button
          onClick={placeOrder}
          className="w-full py-3 mt-6 cursor-pointer bg-primary text-white font-medium hover:bg-primary-dull transition"
        >
          {paymentOption === "COD" ? "Place Order" : "Proceed to Checkout"}
        </button>
      </div>
    </div>
  ) : null;
};

export default Cart;
