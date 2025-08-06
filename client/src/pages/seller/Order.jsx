import React, { useEffect, useState } from 'react';
import { useAppContext } from "../../context/AppContext.jsx";
import { assets } from '../../assets/assets';
import axios from 'axios';

const Order = () => {
  const { currency } = useAppContext();
  const [orders, setOrders] = useState([]);

  // Fetch orders from backend
  const fetchOrders = async () => {
  try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:4000/api/orders/seller', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to fetch orders', err);
      setOrders([]);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []); // ✅ Added dependency array to avoid infinite re-renders

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll">
      <div className="md:p-10 p-4 space-y-4">
        <h2 className="text-lg font-medium text-primary">Orders List</h2>

        {orders.map((order, index) => (
          <div
            key={index}
            className="flex flex-col md:items-center md:flex-row gap-5 justify-between p-5 max-w-4xl rounded-md border border-gray-300"
          >
            {/* Product Info */}
            <div className="flex gap-5 max-w-80">
              <div>
                {order.items.map((item, itemIndex) => {
                  let images = [];
                  try {
                    images = Array.isArray(item.images) ? item.images : (typeof item.images === 'string' ? JSON.parse(item.images) : []);
                  } catch { images = []; }
                  return (
                    <div key={itemIndex} className="flex items-center gap-2 mb-1">
                      {images[0] && (
                        <img src={`http://localhost:4000${images[0]}`} alt={item.name} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} />
                      )}
                      <div>
                        <p className="font-medium">
                          {item.name} <span className="text-primary"> x{item.quantity}</span>
                  </p>
                        <p className="text-sm text-gray-500">
                          Price: {currency}{item.offerPrice && Number(item.offerPrice) < Number(item.price) ? item.offerPrice : item.price}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shipping Info */}
            <div className="text-sm md:text-base text-black/60">
              {order.address_id ? (
                <>
                  <p className="text-black/80 font-medium">
                    Address ID: {order.address_id}
                  </p>
              <p className="text-black/80 font-medium">
                    {order.firstName} {order.lastName}
              </p>
              <p>
                    {order.street}, {order.city}
              </p>
              <p>
                    {[order.state, order.zipcode, order.country].filter(Boolean).join(', ')}
              </p>
                  <p>{order.phone}</p>
                </>
              ) : (
                <p className="text-black/80 font-medium text-red-500">
                  No address info
                </p>
              )}
            </div>

            {/* Amount */}
            <p className="font-medium text-lg my-auto">
              {currency}
              {order.items.reduce((sum, item) => {
                const price = item.offerPrice && Number(item.offerPrice) < Number(item.price)
                  ? Number(item.offerPrice)
                  : Number(item.price);
                return sum + price * item.quantity;
              }, 0).toFixed(2)}
            </p>

            {/* Payment Info */}
            <div className="flex flex-col text-sm md:text-base text-black/60">
              <p>Method: {order.paymentType}</p>
              <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
              <p>Payment: {order.isPaid ? "✅ Paid" : "❌ Pending"}</p>
            </div>
            {order.status === 'pending' && (
  <button
    onClick={async () => {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:4000/api/orders/confirm/${order.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refresh orders after confirmation
      fetchOrders();
    }}
    className="bg-green-600 text-white px-4 py-2 rounded mt-2"
  >
    Confirm Payment
  </button>
)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Order;
