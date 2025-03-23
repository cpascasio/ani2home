import React, { useEffect, useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../../config/firebase-config"; // Adjust the import path as necessary
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../config/firebase-config"

const Register = () => {
  const [authenticated, setAuthenticated] = useState(false || window.localStorage.getItem("authenticated") === "true");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("AUTHENTICATED? " + window.localStorage.getItem("authenticated"));
  }, []);

  const handleEmailSignUp = async (email, password) => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
  
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User created in Firebase Auth:', userCredential.user);
  
      // Update the user's profile with the displayName
      await updateProfile(userCredential.user, {
        displayName: username,
      });
  
      // Prepare user data for the backend
      const userId = userCredential.user.uid;
      const userData = {
        userId, // Include the userId in the request body
        name: username, 
        userName: username, 
      };
  
      // Call the /create-user POST route
      const response = await fetch('http://localhost:3000/api/users/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
  
      // Check if the request was successful
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create user in backend');
      }
  
      // Update authenticated state and store token
      setAuthenticated(true);
      window.localStorage.setItem('authenticated', 'true');
      const tokenResult = await userCredential.user.getIdTokenResult();
      console.log('Firebase ID token:', tokenResult.token);
  
      // Clear input fields after successful registration
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setUsername('');
      setError('');
    } catch (error) {
      console.error('Error during sign-up:', error.message);
      setError(error.message); // Set error message for the user
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleEmailSignUp(email, password);
  };

  return (
    <div className="min-h-screen bg-[#072C1C] flex items-center justify-center px-4 sm:px-6 md:px-8">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-center text-[#209D48] mb-6">Create a New Account</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 rounded-lg border border-[#209D48] focus:outline-none focus:ring focus:ring-[#67B045] focus:border-transparent"
              required
            />
          </div>
          <div className="mb-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-lg border border-[#209D48] focus:outline-none focus:ring focus:ring-[#67B045] focus:border-transparent"
              required
            />
          </div>
          <div className="mb-4">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg border border-[#209D48] focus:outline-none focus:ring focus:ring-[#67B045] focus:border-transparent"
              required
            />
          </div>
          <div className="mb-4">
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 rounded-lg border border-[#209D48] focus:outline-none focus:ring focus:ring-[#67B045] focus:border-transparent"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full p-3 bg-[#209D48] text-white rounded-lg hover:bg-[#67B045] focus:outline-none focus:ring focus:ring-[#67B045]"
          >
            Sign Up
          </button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <a href="/login" className="text-[#209D48] hover:underline">
              Log in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
