import React, { useEffect, useState } from 'react';
import { useAppContext } from "../context/AppContext.jsx"; // ✅ fixed path
import axios from 'axios';

const MyOrders = () => {
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currency, user } = useAppContext();

  const fetchMyOrders = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(
        `http://localhost:4000/api/orders/user/${user.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMyOrders(res.data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      console.error('Error details:', err.response?.data);
      setError(err.response?.data?.error || 'Failed to fetch orders');
      setMyOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, [user]);

  return (
    <div className="mt-16 pb-16 px-4">
      <div className="flex flex-col items-end w-max mb-8">
        <p className="text-2xl font-medium uppercase text-primary">My Orders</p>
        <div className="w-16 h-0.5 bg-primary rounded-full"></div>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading orders...</p>
      ) : error ? (
        <p className="text-center text-red-500">Error: {error}</p>
      ) : myOrders.length === 0 ? (
        <p className="text-center text-gray-500">No orders found.</p>
      ) : (
        myOrders.map((order, index) => (
          <div
            key={index}
            className="border border-gray-300 rounded-lg mb-10 p-4 py-5 max-w-4xl"
          >
            <p className="flex justify-between flex-wrap md:items-center text-gray-400 md:font-medium gap-2">
              <span>Order ID: {order.id}</span>
              <span>Status: {order.status}</span>
              <span>
                Total: {currency}
                {order.total?.toFixed(2) || '0.00'}
              </span>
            </p>

            {order.items?.map((item, idx) => (
              <div
                key={idx}
                className={`relative bg-white text-gray-500/70 ${
                  order.items.length !== idx + 1 ? 'border-b' : ''
                } border-gray-300 flex flex-col md:flex-row md:items-center justify-between gap-4 py-5 md:gap-16`}
              >
                <div className="flex items-center">
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <img
                      src={item.product?.image?.[0]
                        ? (item.product.image[0].startsWith('uploads/') || item.product.image[0].startsWith('/uploads/')
                          ? `http://localhost:4000/${item.product.image[0].replace(/^\/?/, '')}`
                          : `http://localhost:4000/uploads/${item.product.image[0].replace(/^\/?uploads[\\/]/, '')}`)
                        : '/fallback.jpg'}
                      alt={item.product?.name}
                      className="w-16 h-16 object-cover"
                    />
                  </div>
                  <div className="ml-4">
                    <h2 className="text-xl font-medium text-gray-800">
                      {item.product?.name}
                    </h2>
                    <p>Category: {item.product?.category}</p>
                  </div>
                </div>

                <div className="flex flex-col justify-center md:ml-8">
                  <p>Quantity: {item.quantity || 1}</p>
                  <p>
                    Date:{' '}
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>

                <p className="text-primary text-lg font-semibold">
                  Amount: {currency}
                  {(
                    (item.product?.offerPrice && Number(item.product.offerPrice) < Number(item.product.price)
                      ? Number(item.product.offerPrice)
                      : Number(item.product.price)) * (item.quantity || 1)
                  ).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
};

export default MyOrders;
