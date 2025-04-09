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
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      navigate("/myProfile");
    }
    //setIsLoading(false);
  }, [navigate]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          // Check if MFA is enabled for the user
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (!userDoc.exists()) {
            throw new Error("User document not found");
          }
          const userData = userDoc.data();
          const mfaEnabled = userData.mfaEnabled;

          // Check if MFA is enabled and not verified in this session
          if (mfaEnabled && sessionStorage.getItem("mfaVerified") !== "true") {
            setShowMfaModal(true);
            return;
          }

          // Proceed with login steps
          const tokenResult = await user.getIdTokenResult();
          const userId = user.uid;
          const userName = user.providerData[0]?.displayName?.replace(
            /\s+/g,
            ""
          );

          // Check store status
          const storeResponse = await axios.get(
            `http://localhost:3000/api/users/${userId}/isStore`,
            { headers: { Authorization: `Bearer ${tokenResult.token}` } }
          );

          const enrichedUser = {
            username: userName,
            userId: userId,
            token: tokenResult.token,
            isStore: storeResponse.data.data,
          };

          localStorage.setItem("user", JSON.stringify(enrichedUser));
          dispatch({ type: "LOGIN", payload: enrichedUser });
          navigate("/myProfile");
        } catch (error) {
          console.error("Authentication error:", error);
          alert(`Authentication error: ${error.message}`);
        }
      } else {
        setAuthenticated(false);
        localStorage.removeItem("user");
        sessionStorage.removeItem("mfaVerified"); // Clear MFA status on logout
        dispatch({ type: "LOGOUT" });
      }
    });

    return () => unsubscribe();
  }, [dispatch, navigate]);

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Login failed:", error.message);
      alert(`Login failed: ${error.message}`);
    }
  };

  const handleMfaSubmit = async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not signed in");

      // Verify MFA token with backend
      const verifyResponse = await axios.post(
        `http://localhost:3000/api/users/verify-mfa-login/${user.uid}`,
        { token: mfaToken }
      );

      if (verifyResponse.data.state !== "success") {
        throw new Error("Invalid MFA token");
      }

      // Mark MFA as verified in this session
      sessionStorage.setItem("mfaVerified", "true");
      setShowMfaModal(false);

      // Proceed to complete login
      const tokenResult = await user.getIdTokenResult();
      const userId = user.uid;
      const userName = user.providerData[0]?.displayName?.replace(/\s+/g, "");

      // Check store status and update user context
      const storeResponse = await axios.get(
        `http://localhost:3000/api/users/${userId}/isStore`,
        { headers: { Authorization: `Bearer ${tokenResult.token}` } }
      );

      const enrichedUser = {
        username: userName,
        userId: userId,
        token: tokenResult.token,
        isStore: storeResponse.data.data,
      };

      localStorage.setItem("user", JSON.stringify(enrichedUser));
      dispatch({ type: "LOGIN", payload: enrichedUser });
      navigate("/myProfile");
    } catch (error) {
      console.error("MFA verification failed:", error.message);
      alert(`MFA verification failed: ${error.message}`);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Google login failed:", error.message);
      alert(`Google login failed: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#072C1C] flex items-center justify-center px-4 sm:px-6 md:px-8">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-center text-[#209D48] mb-6">
          Login to Your Account
        </h2>
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
            Don't have an account?{" "}
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
