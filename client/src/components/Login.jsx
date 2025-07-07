import React, { useState } from 'react';
import { useAppContext } from '../Context/AppContext';
import toast from 'react-hot-toast';
import axios from 'axios';

const Login = () => {
  const { setshowUserLogin, setUser } = useAppContext();

  const [state, setState] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("buyer");

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      const endpoint = state === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload = state === "login"
        ? { email, password }
        : { username: name, email, password, role };

      const res = await axios.post(`http://localhost:4000${endpoint}`, payload, {
        withCredentials: true,
      });

      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
        setUser(res.data.user);
        toast.success("Welcome " + res.data.user.name);
        setshowUserLogin(false);

        // Redirect user based on role
        const userRole = res.data.user.role;
        if (userRole === "seller") {
          window.location.href = "/seller";
        } else if (userRole === "admin") {
          window.location.href = "/admin";
        } else {
          window.location.href = "/";
        }
      } else {
        toast.error("Something went wrong");
      }
    } catch (error) {
      console.error("Login/Register error:", error);
      toast.error(error.response?.data?.message || "Failed to login/register");
    }
  };

  return (
    <div
      onClick={() => setshowUserLogin(false)}
      className="fixed top-0 bottom-0 left-0 right-0 z-30 flex items-center text-sm text-gray-600 bg-black/50"
    >
      <form
        onSubmit={onSubmitHandler}
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col gap-4 m-auto items-start p-8 py-12 w-80 sm:w-[352px] rounded-lg shadow-xl border border-gray-200 bg-white"
      >
        <p className="text-2xl font-medium m-auto">
          <span className="text-primary">User</span> {state === "login" ? "Login" : "Sign Up"}
        </p>

        {state === "register" && (
          <>
            <div className="w-full">
              <p>Name</p>
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                placeholder="Enter Your Name"
                className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
                type="text"
                required
              />
            </div>

            <div className="w-full">
              <p>Register </p>
              <select
                onChange={(e) => setRole(e.target.value)}
                value={role}
                className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
              >
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
              </select>
            </div>
          </>
        )}

        <div className="w-full">
          <p>Email</p>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            placeholder="Enter Your Email"
            className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
            type="email"
            required
          />
        </div>

        <div className="w-full">
          <p>Password</p>
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            placeholder="Enter Your Password"
            className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
            type="password"
            required
          />
        </div>

        <p>
          {state === "register" ? "Already have an account?" : "Create an account?"}{" "}
          <span
            onClick={() => setState(state === "login" ? "register" : "login")}
            className="text-primary cursor-pointer"
          >
            Click here
          </span>
        </p>

        <button
          type="submit"
          className="bg-primary hover:bg-primary-dull transition-all text-white w-full py-2 rounded-md cursor-pointer"
        >
          {state === "register" ? "Create Account" : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;
