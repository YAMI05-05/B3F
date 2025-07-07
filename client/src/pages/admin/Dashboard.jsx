const Dashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Welcome to the Admin Dashboard</h1>

      {/* Example stats layout (optional) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500">Total Users</p>
          <h2 className="text-2xl font-semibold text-gray-700">124</h2>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500">Total Products</p>
          <h2 className="text-2xl font-semibold text-gray-700">67</h2>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500">Orders Today</p>
          <h2 className="text-2xl font-semibold text-gray-700">13</h2>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
