"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const SignIn = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const payload = { username, email, password, image };
      const response = await fetch("/api/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Something went wrong.");
      }

      router.replace("/Login");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-700 to-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white/70 backdrop-blur-lg shadow-2xl rounded-2xl">
        <h2 className="text-3xl font-extrabold text-center text-gray-900">Create an Account</h2>
        <p className="text-center text-gray-600">Join us and explore amazing features! </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Input */}
          <div className="relative">
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-3 text-gray-800 bg-transparent border-2 border-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 peer"
              placeholder=" "
            />
            <label
              htmlFor="username"
              className="absolute left-3 text-sm top-0 text-gray-500 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-lg peer-focus:top-0 peer-focus:text-sm peer-focus:text-indigo-600"
            >
              Username
            </label>
          </div>

          {/* Email Input */}
          <div className="relative">
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 text-gray-800 bg-transparent border-2 border-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 peer"
              placeholder=" "
            />
            <label
              htmlFor="email"
              className="absolute left-3 text-sm top-0 text-gray-500 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-lg peer-focus:top-0 peer-focus:text-sm peer-focus:text-indigo-600"
            >
              Email Address
            </label>
          </div>

          {/* Password Input */}
          <div className="relative">
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 text-gray-800 bg-transparent border-2 border-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 peer"
              placeholder=" "
            />
            <label
              htmlFor="password"
              className="absolute left-3 text-sm top-0 text-gray-500 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-lg peer-focus:top-0 peer-focus:text-sm peer-focus:text-indigo-600"
            >
              Password
            </label>
          </div>

          {/* Profile Image Input */}
          <div className="relative">
            <input
              type="text"
              id="image"
              name="image"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full px-4 py-3 text-gray-800 bg-transparent border-2 border-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 peer"
              placeholder=" "
            />
            <label
              htmlFor="image"
              className="absolute left-3 top-0 text-gray-500 text-sm transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-lg peer-focus:top-0 peer-focus:text-sm peer-focus:text-indigo-600"
            >
              Profile Image URL (Optional)
            </label>
          </div>

          {/* Error Message */}
          {error && <p className="text-red-500 text-center">{error}</p>}

          {/* Sign Up Button */}
          <button
            type="submit"
            className="w-full px-4 py-3 text-white font-bold bg-gradient-to-r rounded-md shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            Sign Up
          </button>
        </form>

        {/* Sign In Link */}
        <p className="text-sm text-center text-gray-700">
          Already have an account?{" "}
          <a href="/Login" className="text-indigo-600 font-bold hover:underline">
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
