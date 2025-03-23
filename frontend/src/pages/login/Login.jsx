import React, { useEffect, useState } from "react";
import axios from "axios";
import { auth, provider, db } from "../../config/firebase-config"; // Ensure Firestore is imported
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"; // Import Firestore functions
import { useUser } from "../../../src/context/UserContext.jsx";
import GoogleIcon from "../../assets/google-icon.png"; 
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { user, dispatch } = useUser();
  const [authenticated, setAuthenticated] = useState(false || user === "true");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaToken, setMfaToken] = useState(""); // State for MFA token
  const [showMfaModal, setShowMfaModal] = useState(false); // State to control MFA modal
  const navigate = useNavigate();

  useEffect(() => {
    // Subscribe to authentication state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setAuthenticated(true);
        console.log("🚀 ~ auth.onAuthStateChanged ~ user:", user);

        const userId = user.uid;
        const userName = user.providerData[0]?.displayName?.replace(/\s+/g, "");

        user.getIdTokenResult().then((tokenResult) => {
          console.log(tokenResult);
          localStorage.setItem(
            "user",
            JSON.stringify({
              username: userName,
              userId: userId,
              token: tokenResult.token,
            })
          );
          dispatch({
            type: "LOGIN",
            payload: { username: userName, userId: userId, token: tokenResult.token },
          });
          console.log("ONAUTHSTATECHANED RUNS");
        });
      } else {
        setAuthenticated(false);
        //localStorage.removeItem('user');
        dispatch({ type: "LOGOUT" });
      }
    });

    // Clean up subscription on unmount
    return () => unsubscribe();
  }, [dispatch]);

  const handleLogin = async () => {
    try {
      // Step 1: Sign in with email and password
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("User signed in:", user);

      // Step 2: Check if MFA is enabled for the user
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        throw new Error("User document not found");
      }

      const userData = userDoc.data();
      if (userData.mfaEnabled) {
        // Step 3: Show MFA modal
        setShowMfaModal(true);
        return;
      }

      // Step 4: Complete the login
      setAuthenticated(true);
      navigate("/myProfile");
    } catch (error) {
      console.error("Login failed:", error.message);
      alert(`Login failed: ${error.message}`);
    }
  };

  const handleMfaSubmit = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not signed in");
      }
  
      // Step 4: Verify the MFA token during login
      const verifyResponse = await axios.post(
        `http://localhost:3000/api/users/verify-mfa-login/${user.uid}`,
        { token: mfaToken }
      );
  
      if (verifyResponse.data.state !== "success") {
        throw new Error("Invalid MFA token");
      }
  
      // Step 5: Complete the login
      setAuthenticated(true);
      setShowMfaModal(false);
  
      // Retrieve the Firebase token for backend API calls
      const tokenResult = await user.getIdTokenResult();
      console.log("🚀 ~ handleMfaSubmit ~ tokenResult:", tokenResult);
  
      const userId = user?.uid;
      const email = user.providerData[0]?.email;
      const userName = user.providerData[0]?.displayName?.replace(/\s+/g, "");
      const phoneNumber = user.providerData[0]?.phoneNumber;
      const userProfilePic = user.providerData[0]?.photoURL;
      const name = user.displayName;
  
      // Only create the user in the backend if they are a new user
      if (user.metadata.creationTime === user.metadata.lastSignInTime) {
        const payload = {};
  
        if (userId) payload.userId = userId;
        if (email) payload.email = email;
        if (userName) payload.userName = userName;
        if (phoneNumber) payload.phoneNumber = phoneNumber;
        if (userProfilePic) payload.userProfilePic = userProfilePic;
        if (name.trim()) payload.name = name;
  
        await axios.post("http://localhost:3000/api/users/create-user", payload, {
          headers: {
            Authorization: `Bearer ${tokenResult.token}`,
            "Content-Type": "application/json",
          },
        });
      }
  
      navigate('/myProfile');
    } catch (error) {
      console.error("MFA verification failed:", error.message);
      alert(`MFA verification failed: ${error.message}`);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("🚀 ~ handleGoogleLogin ~ result:", result);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      console.log("🚀 ~ handleGoogleLogin ~ credential:", credential);
      const user = result.user;
  
      console.log(user);

      // Retrieve the Firebase token for backend API calls
      const tokenResult = await user.getIdTokenResult();
      console.log("🚀 ~ handleGoogleLogin ~ tokenResult:", tokenResult);
  
      const userId = user?.uid;
      const email = user.providerData[0]?.email;
      const userName = user.providerData[0]?.displayName?.replace(/\s+/g, "");
      const phoneNumber = user.providerData[0]?.phoneNumber;
      const userProfilePic = user.providerData[0]?.photoURL;
      const name = result?._tokenResponse.firstName + " " + result?._tokenResponse.lastName;
  
      // Only create the user in the backend if they are a new user
      if (result?._tokenResponse.isNewUser) {
        const payload = {};
  
        if (userId) payload.userId = userId;
        if (email) payload.email = email;
        if (userName) payload.userName = userName;
        if (phoneNumber) payload.phoneNumber = phoneNumber;
        if (userProfilePic) payload.userProfilePic = userProfilePic;
        if (name.trim()) payload.name = name;
  
        await axios.post("http://localhost:3000/api/users/create-user", payload, {
          headers: {
            Authorization: `Bearer ${tokenResult.token}`,
            "Content-Type": "application/json",
          },
        });
      }
  
      // Step 1: Check if MFA is enabled for the user
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        throw new Error("User document not found");
      }
  
      const userData = userDoc.data();
      if (userData.mfaEnabled) {
        // Step 2: Show MFA modal
        setShowMfaModal(true);
        return;
      }
  
      // Step 3: Complete the login if MFA is not enabled
      setAuthenticated(true);
  
      navigate('/myProfile');
    } catch (error) {
      console.error("Google login failed:", error.message);
      alert(`Google login failed: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#072C1C] flex items-center justify-center px-4 sm:px-6 md:px-8">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-center text-[#209D48] mb-6">Login to Your Account</h2>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 rounded-lg border border-[#209D48] focus:outline-none focus:ring focus:ring-[#67B045] focus:border-transparent"
          />
        </div>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-lg border border-[#209D48] focus:outline-none focus:ring focus:ring-[#67B045] focus:border-transparent"
          />
        </div>
        <div className="mb-4">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-lg border border-[#209D48] focus:outline-none focus:ring focus:ring-[#67B045] focus:border-transparent"
          />
        </div>
        <button
          onClick={handleLogin}
          className="w-full p-3 bg-[#209D48] text-white rounded-lg hover:bg-[#67B045] focus:outline-none focus:ring focus:ring-[#67B045]"
        >
          Login
        </button>
        <div className="my-4 text-center">
          <p className="text-sm text-gray-600">Or</p>
        </div>
        <button
          onClick={handleGoogleLogin}
          className="w-full p-3 bg-[#209D48] text-white rounded-lg hover:bg-[#67B045] flex items-center justify-center"
        >
          <img src={GoogleIcon} alt="Google" className="w-5 h-5 mr-2" />
          Log in with Google
        </button>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <a href="/register" className="text-[#209D48] hover:underline">
              Register Here
            </a>
          </p>
        </div>

        {/* MFA Modal */}
        {showMfaModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Enter MFA Token</h3>
              <input
                type="text"
                value={mfaToken}
                onChange={(e) => setMfaToken(e.target.value)}
                placeholder="Enter MFA token"
                className="w-full p-3 rounded-lg border border-[#209D48] focus:outline-none focus:ring focus:ring-[#67B045] focus:border-transparent mb-4"
              />
              <button
                onClick={handleMfaSubmit}
                className="w-full p-3 bg-[#209D48] text-white rounded-lg hover:bg-[#67B045] focus:outline-none focus:ring focus:ring-[#67B045]"
              >
                Submit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;