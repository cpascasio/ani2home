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
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User created in Firebase Auth:', userCredential.user);
  
      // Update the user's profile with the displayName
      await updateProfile(userCredential.user, {
        displayName: username,
      });
  
      // Add user data to Firestore
      const userId = userCredential.user.uid; // Get the user's UID
      const userData = {
        address: {
          barangay: '', // Initialize with empty string or provided value
          city: '', // Initialize with empty string or provided value
          country: '', // Initialize with empty string or provided value
          fullAddress: '', // Initialize with empty string or provided value
          lat: null, // Initialize with null or provided value
          lng: null, // Initialize with null or provided value
          postalCode: '', // Initialize with empty string or provided value
          province: '', // Initialize with empty string or provided value
          region: '', // Initialize with empty string or provided value
          streetAddress: '', // Initialize with empty string or provided value
        },
        bio: '', // Initialize with empty string or provided value
        dateOfBirth: '', // Initialize with empty string or provided value
        email: email, // Use the email from the sign-up form
        followers: [], // Initialize with an empty array
        isStore: false, // Default to false
        isVerified: false, // Default to false
        name: username, // Use the username from the sign-up form
        phoneNumber: '', // Initialize with empty string or provided value
        userCover: '', // Initialize with empty string or provided value
        userName: username, // Use the username from the sign-up form
        userProfilePic: '', // Initialize with empty string or provided value
        createdAt: new Date(), // Add a timestamp
      };
  
      // Add the user document to the "users" collection in Firestore
      await setDoc(doc(db, 'users', userId), userData);
      console.log('User added to Firestore:', userData);
  
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
      setError(''); // Clear any previous errors
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
