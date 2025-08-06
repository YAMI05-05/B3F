import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';

// Reusable input component
const InputField = ({ type, placeholder, name, handleChange, address }) => (
  <input
    className="w-full px-2 py-2.5 border border-gray-500/30 rounded outline-none text-gray-500 focus:border-primary transition"
    type={type}
    placeholder={placeholder}
    onChange={handleChange}
    name={name}
    value={address[name]}
    required
  />
);

const AddAddress = () => {
  const navigate = useNavigate();
  const [address, setAddress] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: '',
    phone: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(address)
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Address saved successfully!');
        // Redirect back to cart
        navigate('/cart');
      } else {
        alert(data.message || 'Failed to save address');
      }
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Failed to save address. Please try again.');
    }
  };

  return (
    <div className="mt-16 pb-16">
      <p className="text-2xl md:text-3xl text-gray-500">
        Add Shipping <span className="font-semibold text-primary">Address</span>
      </p>

      <div className="flex flex-col-reverse md:flex-row justify-between mt-10">
        <div className="flex-1 max-w-md">
          <form onSubmit={onSubmitHandler} className="space-y-3 mt-6 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <InputField handleChange={handleChange} address={address} name="firstName" type="text" placeholder="First Name" />
              <InputField handleChange={handleChange} address={address} name="lastName" type="text" placeholder="Last Name" />
            </div>

            <InputField handleChange={handleChange} address={address} name="email" type="email" placeholder="Email Address" />
            <InputField handleChange={handleChange} address={address} name="street" type="text" placeholder="Street" />

            <div className="grid grid-cols-2 gap-4">
              <InputField handleChange={handleChange} address={address} name="city" type="text" placeholder="City" />
              <InputField handleChange={handleChange} address={address} name="state" type="text" placeholder="State" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InputField handleChange={handleChange} address={address} name="zipcode" type="text" placeholder="Zipcode" />
              <InputField handleChange={handleChange} address={address} name="country" type="text" placeholder="Country" />
            </div>

            <InputField handleChange={handleChange} address={address} name="phone" type="text" placeholder="Phone" />

            <button className="w-full mt-6 bg-primary text-white py-3 hover:bg-primary-dull transition cursor-pointer uppercase">
              Save Address
            </button>
          </form>
        </div>

        <img
          className="md:mr-16 md:mt-0 max-w-[300px] mx-auto md:mx-0"
          src={assets.add_address_iamge}
          alt="Add Address"
        />
      </div>
    </div>
  );
};

export default AddAddress;
