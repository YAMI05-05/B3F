import React from 'react';
import { useAppContext } from '../../context/AppContext.jsx';

const ProductList = () => {
  const { products, currency } = useAppContext();

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col justify-between">
      <div className="w-full md:p-10 p-4">
        <h2 className="pb-4 text-lg font-medium">All Products</h2>

        <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
          <table className="table-auto w-full overflow-hidden">
            <thead className="text-gray-900 text-sm text-left">
              <tr>
                <th className="px-4 py-3 font-semibold truncate">Product</th>
                <th className="px-4 py-3 font-semibold truncate">Category</th>
                <th className="px-4 py-3 font-semibold truncate hidden md:table-cell">
                  Selling Price
                </th>
                <th className="px-4 py-3 font-semibold truncate">In Stock</th>
              </tr>
            </thead>

            <tbody className="text-sm text-gray-500">
              {products.map((product) => {
                let imageArray = [];

                try {
                  imageArray = typeof product.images === 'string'
                    ? JSON.parse(product.images)
                    : product.images || [];
                } catch (err) {
                  console.warn('Error parsing images:', err);
                }

                return (
                  <tr key={product.id || product._id} className="border-t border-gray-500/20">
                    <td className="md:px-4 pl-2 py-3 flex items-center space-x-3 truncate">
                      <div className="border border-gray-300 rounded p-2">
                        <img
                            src={
                              imageArray[0]
                                ? (imageArray[0].startsWith('uploads/') || imageArray[0].startsWith('/uploads/')
                                  ? `http://localhost:4000/${imageArray[0].replace(/^\/?/, '')}`
                                  : `http://localhost:4000/uploads/${imageArray[0].replace(/^\/?uploads[\\/]/, '')}`)
                                : '/placeholder.jpg'
                            }
                         alt={product.name}
                         className="w-16 h-16 object-cover"
                    />

                      </div>
                      <span className="truncate max-sm:hidden w-full">{product.name}</span>
                    </td>

                    <td className="px-4 py-3">{product.category}</td>

                    <td className="px-4 py-3 hidden md:table-cell">
                      {currency}
                      {product.offerPrice}
                    </td>

                    <td className="px-4 py-3">
                      <label className="relative inline-flex items-center cursor-pointer text-gray-900 gap-3">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          defaultChecked={product.inStock}
                        />
                        <div className="w-12 h-7 bg-slate-300 rounded-full peer peer-checked:bg-blue-600 transition-colors duration-200" />
                        <span className="dot absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5" />
                      </label>
                    </td>
                  </tr>
                );
              })}

              {products.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center p-4 text-gray-400">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
