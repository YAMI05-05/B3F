import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:4000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // Delete user
  const handleDelete = async (id, email) => {
    if (!window.confirm(`Are you sure you want to delete user: ${email}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:4000/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("User deleted successfully");
      fetchUsers(); // Refresh list
    } catch (err) {
      console.error("Failed to delete user", err);
      toast.error(err.response?.data?.message || "Failed to delete user");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600 dark:text-gray-300">Loading users...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-primary">Manage Users</h1>
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse bg-white dark:bg-gray-800 shadow rounded">
          <thead className="bg-primary/10 dark:bg-primary/5 text-primary text-left">
            <tr>
              <th className="p-3 text-gray-900 dark:text-gray-100">#</th>
              <th className="p-3 text-gray-900 dark:text-gray-100">Name</th>
              <th className="p-3 text-gray-900 dark:text-gray-100">Email</th>
              <th className="p-3 text-gray-900 dark:text-gray-100">Role</th>
              <th className="p-3 text-gray-900 dark:text-gray-100">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, i) => (
              <tr key={user.id} className="border-t border-gray-200 dark:border-gray-700">
                <td className="p-3 text-gray-700 dark:text-gray-300">{i + 1}</td>
                <td className="p-3 text-gray-700 dark:text-gray-300">{user.name || user.username || 'N/A'}</td>
                <td className="p-3 text-gray-700 dark:text-gray-300">{user.email}</td>
                <td className="p-3 capitalize">
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
                <td className="p-3">
                  <button
                    onClick={() => handleDelete(user.id, user.email)}
                    className="text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:underline text-sm font-medium transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No users found
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;