import React, { useState } from "react";
import toast from "react-hot-toast";

const NewsLetter = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();

    if (!email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    // OPTIONAL: You can send email to your backend here
    // e.g., await axios.post("/api/subscribe", { email });

    toast.success("Subscribed successfully!");
    setEmail(""); // Clear input
  };

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-2 mt-24 pb-14">
      <h1 className="md:text-4xl text-2xl font-semibold text-gray-900 dark:text-gray-100">Never Miss a Deal!</h1>
      <p className="md:text-lg text-gray-500/70 dark:text-gray-400/70 pb-8">
        Subscribe to get the latest offers, new arrivals, and exclusive discounts
      </p>
      <form
        onSubmit={handleSubscribe}
        className="flex items-center justify-between max-w-2xl w-full md:h-13 h-12"
      >
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded-md h-full border-r-0 outline-none w-full rounded-r-none px-3 text-gray-500 dark:text-gray-300 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400"
          type="email"
          placeholder="Enter your email"
          required
        />
        <button
          type="submit"
          className="md:px-12 px-8 h-full text-white bg-primary hover:bg-primary-dull transition-all cursor-pointer rounded-md rounded-l-none"
        >
          Subscribe
        </button>
      </form>
    </div>
  );
};

export default NewsLetter;
