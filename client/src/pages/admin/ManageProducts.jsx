import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAppContext } from '../../context/AppContext.jsx';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const { fetchProducts, currency } = useAppContext();

  // Rename fetchProducts to fetchProductsLocal for local state
  const fetchProductsLocal = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/products");
      setProducts(res.data);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:4000/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Product deleted");
      fetchProducts(); // Refresh global product list
      fetchProductsLocal(); // Refresh local list
    } catch (err) {
      console.error("Error deleting product:", err);
      toast.error("Delete failed");
    }
  };

  useEffect(() => {
    fetchProductsLocal();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-primary">Manage Products</h1>
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse bg-white shadow rounded">
          <thead className="bg-primary/10 text-primary text-left">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">Name</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, i) => (
              <tr key={product.id} className="border-t">
                <td className="p-3">{i + 1}</td>
                <td className="p-3">{product.name}</td>
                <td className="p-3">{product.category}</td>
                                    <td className="p-3">{currency}{product.price}</td>
                <td className="p-3">
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="text-red-500 hover:underline text-sm"
                  >
                    Delete
                  </button>
                  {/* Add Edit button here if needed */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageProducts;
