import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext.jsx";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { setUser, currency } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:4000/api/admin/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch stats");
        const data = await res.json();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate('/');
  };

  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Welcome to the Admin Dashboard</h1>
      {loading && <p className="text-gray-600 dark:text-gray-300">Loading stats...</p>}
      {error && <p className="text-red-500 dark:text-red-400">{error}</p>}
      {stats && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
              <h2 className="text-3xl font-bold text-gray-700 dark:text-gray-100">{stats.totalUsers}</h2>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Products</p>
              <h2 className="text-3xl font-bold text-gray-700 dark:text-gray-100">{stats.totalProducts}</h2>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">Orders Today</p>
              <h2 className="text-3xl font-bold text-gray-700 dark:text-gray-100">{stats.ordersToday}</h2>
            </div>
          </div>

          {/* Users List */}
          <section className="mt-10">
            <h2 className="text-2xl font-semibold mb-4 text-primary">All Users</h2>
            <div className="overflow-x-auto rounded shadow">
              <table className="w-full min-w-[600px] table-auto border-collapse bg-white dark:bg-gray-800">
                <thead className="bg-primary/10 dark:bg-primary/5 text-primary">
                  <tr>
                    <th className="px-3 py-2 text-gray-900 dark:text-gray-100">ID</th>
                    <th className="px-3 py-2 text-gray-900 dark:text-gray-100">Name</th>
                    <th className="px-3 py-2 text-gray-900 dark:text-gray-100">Email</th>
                    <th className="px-3 py-2 text-gray-900 dark:text-gray-100">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {(stats.users || []).map((user, i) => (
                    <tr key={user.id} className={`${i % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-700"} border-t border-gray-200 dark:border-gray-600`}>
                      <td className="px-3 py-2 align-middle text-gray-700 dark:text-gray-300">{user.id}</td>
                      <td className="px-3 py-2 align-middle truncate max-w-[120px] text-gray-700 dark:text-gray-300" title={user.name}>{user.name}</td>
                      <td className="px-3 py-2 align-middle truncate max-w-[180px] text-gray-700 dark:text-gray-300" title={user.email}>{user.email}</td>
                      <td className="px-3 py-2 align-middle capitalize">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin' 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : user.role === 'seller'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Products List */}
          <section className="mt-10">
            <h2 className="text-2xl font-semibold mb-4 text-primary">All Products</h2>
            <div className="overflow-x-auto rounded shadow">
              <table className="w-full min-w-[600px] table-auto border-collapse bg-white dark:bg-gray-800">
                <thead className="bg-primary/10 dark:bg-primary/5 text-primary">
                  <tr>
                    <th className="px-3 py-2 text-gray-900 dark:text-gray-100">ID</th>
                    <th className="px-3 py-2 text-gray-900 dark:text-gray-100">Name</th>
                    <th className="px-3 py-2 text-gray-900 dark:text-gray-100">Category</th>
                    <th className="px-3 py-2 text-gray-900 dark:text-gray-100">Price</th>
                    <th className="px-3 py-2 text-gray-900 dark:text-gray-100">Seller</th>
                  </tr>
                </thead>
                <tbody>
                  {(stats.products || []).map((product, i) => (
                    <tr key={product.id} className={`${i % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-700"} border-t border-gray-200 dark:border-gray-600`}>
                      <td className="px-3 py-2 align-middle text-gray-700 dark:text-gray-300">{product.id}</td>
                      <td className="px-3 py-2 align-middle truncate max-w-[150px] text-gray-700 dark:text-gray-300" title={product.name}>{product.name}</td>
                      <td className="px-3 py-2 align-middle capitalize text-gray-700 dark:text-gray-300">{product.category}</td>
                      <td className="px-3 py-2 align-middle text-gray-700 dark:text-gray-300">{currency}{product.price}</td>
                      <td className="px-3 py-2 align-middle text-gray-700 dark:text-gray-300">{product.seller_name || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Orders Today List */}
          <section className="mt-10">
            <h2 className="text-2xl font-semibold mb-4 text-primary">Orders Today</h2>
            <div className="overflow-x-auto rounded shadow">
              <table className="w-full min-w-[600px] table-auto border-collapse bg-white dark:bg-gray-800">
                <thead className="bg-primary/10 dark:bg-primary/5 text-primary">
                  <tr>
                    <th className="px-3 py-2 text-gray-900 dark:text-gray-100">Order ID</th>
                    <th className="px-3 py-2 text-gray-900 dark:text-gray-100">User</th>
                    <th className="px-3 py-2 text-gray-900 dark:text-gray-100">Status</th>
                    <th className="px-3 py-2 text-gray-900 dark:text-gray-100">Date</th>
                    <th className="px-3 py-2 text-gray-900 dark:text-gray-100">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(stats.ordersTodayList || []).map((order, i) => (
                    <tr key={order.id} className={`${i % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-700"} border-t border-gray-200 dark:border-gray-600`}>
                      <td className="px-3 py-2 align-middle text-gray-700 dark:text-gray-300">#{order.id}</td>
                      <td className="px-3 py-2 align-middle text-gray-700 dark:text-gray-300">{order.user_name || 'N/A'}</td>
                      <td className="px-3 py-2 align-middle">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'confirmed' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : order.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 align-middle text-gray-700 dark:text-gray-300">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2 align-middle">
                        <button className="text-primary hover:text-primary-dull text-sm font-medium transition-colors">
                          Confirm Payment
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Dashboard;
