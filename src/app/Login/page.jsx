"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const LogIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        document.cookie = `token=${data.token}; path=/; max-age=3600`;
        localStorage.setItem("userId", data.id);
        localStorage.setItem("username", data.name);
        router.push("/");
      } else {
        setError(data.error || "Failed to log in");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-red-400">
      <div className="w-full max-w-md p-8 space-y-6 bg-white/70 backdrop-blur-lg shadow-2xl rounded-2xl">
        <h2 className="text-3xl font-extrabold text-center text-gray-900">Welcome Back</h2>
        <p className="text-center text-gray-600">Sign in to continue! </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div className="relative">
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-4 bottom-0 text-gray-800 bg-transparent border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 peer"
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
              className="w-full bottom-0 px-4 py-4 text-gray-800 bg-transparent border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 peer"
              placeholder=" "
            />
            <label
              htmlFor="password"
              className="absolute left-3 text-sm top-0 text-gray-500 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-lg peer-focus:top-0 peer-focus:text-sm peer-focus:text-indigo-600"
            >
              Password
            </label>
          </div>

          {/* Error Message */}
          {error && <p className="text-red-500 text-center">{error}</p>}

          {/* Sign In Button */}
          <button
            type="submit"
            className="w-full px-4 py-3 text-white font-bold bg-gradient-to-r from-indigo-500 to-blue-600 rounded-md shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            Sign In
          </button>
        </form>

        {/* Sign Up Link */}
        <p className="text-sm text-center text-gray-700">
          Don't have an account?{" "}
          <a href="/signin" className="text-indigo-600 font-bold hover:underline">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
};

export default LogIn;
