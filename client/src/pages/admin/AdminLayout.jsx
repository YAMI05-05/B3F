import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext.jsx";

const AdminLayout = () => {
  const navigate = useNavigate();
  const { setUser } = useAppContext();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-gray-800 text-white p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
          <nav className="flex flex-col gap-4">
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                isActive ? "text-primary font-semibold" : "hover:text-primary"
              }
              end
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                isActive ? "text-primary font-semibold" : "hover:text-primary"
              }
            >
              Manage Users
            </NavLink>
            <NavLink
              to="/admin/products"
              className={({ isActive }) =>
                isActive ? "text-primary font-semibold" : "hover:text-primary"
              }
            >
              Manage Products
            </NavLink>
          </nav>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm border border-white/30 rounded px-3 py-2 hover:bg-white hover:text-black transition"
        >
          Logout
        </button>
      </aside>

      <main className="flex-1 p-6 bg-gray-100 dark:bg-gray-900 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
