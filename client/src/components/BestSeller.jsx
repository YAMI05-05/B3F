import React from 'react';
import ProductCard from './ProductCard';
import { useAppContext } from '../Context/AppContext';

const BestSeller = () => {
  const { products } = useAppContext();

  const bestSellingProducts = products
    .filter(product => product.inStock)
    .slice(0, 5); // only first 5 in-stock

  return (
    <div className="mt-16">
      <p className="text-2xl md:text-3xl font-medium">Best Seller</p>

      {bestSellingProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6 mt-6">
          {bestSellingProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 mt-4">No best sellers available.</p>
      )}
    </div>
  );
};

export default BestSeller;
