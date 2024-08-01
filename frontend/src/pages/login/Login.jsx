import React, { useEffect, useState } from "react";
import axios from "axios";
import { auth, provider } from "../../config/firebase-config"; // Adjust the path as necessary
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { useUser } from "../../../src/context/UserContext.jsx";
import GoogleIcon from "../../assets/google-icon.png"; // Adjust the path as necessary

const Login = () => {
  const { user, dispatch } = useUser();
  const [authenticated, setAuthenticated] = useState(false || user === "true");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

  useEffect(() => {
    console.log("AUTHENTICATED? " + (user ? "true" : "false"));
  }, []);

  useEffect(() => {
    console.log("USERACCOUNT " + (user ? user?.username : "false"));
  }, [user]);

  const handleLogout = () => {
    setAuthenticated(false);
    auth.signOut();
  };

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // User account created & signed in
      console.log(userCredential.user);
      // Update authenticated state or perform other actions
      setAuthenticated(true);
      //window.localStorage.setItem('authenticated', 'true');
      // Optionally, get the token as you did in the useEffect
      //const tokenResult = await userCredential.user.getIdTokenResult();
      //setToken(tokenResult.token);
    } catch (error) {
      // Handle Errors here.
      console.error(error.message);
      // Optionally, update UI to reflect the error
    }
  };

  const handleEmailSignUp = async () => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log("🚀 ~ handleEmailSignUp ~ result:", result);
      // User account created & signed in
      //console.log(userCredential.user);
      // Update authenticated state or perform other actions
      //setAuthenticated(true);
      //window.localStorage.setItem('authenticated', 'true');
      // Optionally, get the token as you did in the useEffect
      //const tokenResult = await userCredential.user.getIdTokenResult();
      //setToken(tokenResult.token);

      const user = result.user;
      console.log("🚀 ~ handleEmailSignUp ~ user:", user);

      // Update the user's profile with the displayName
      await updateProfile(user, {
        displayName: username,
      });

      // Here, you can use the token or user information for your application's login logic
      if (user) {
        setAuthenticated(true); // Set auth to true if Google login is successful

        // Retrieve the Firebase token instead of the Google token for backend API calls
        const tokenResult = await user.getIdTokenResult();
        console.log("🚀 ~ handleGoogleLogin ~ tokenResult:", tokenResult);
        //setToken(tokenResult);

        const userId = user?.uid;

        //const phoneNumber = user.providerData[0]?.phoneNumber;
        //const userProfilePic = user.providerData[0]?.photoURL;
        //const name = result?._tokenResponse.firstName + " " + result?._tokenResponse.lastName;

        //localStorage.setItem('user', JSON.stringify({username: userName, userId: userId, token}));

        console.log("USERINPUTS" + userId, email, username);

        // Only create the user in the backend if they are a new user
        const payload = {};

        if (userId) payload.userId = userId;
        if (email) payload.email = email;
        if (username) payload.userName = username;

        await axios.post("http://localhost:3000/api/users/create-user", payload, {
          headers: {
            Authorization: `Bearer ${tokenResult.token}`,
            "Content-Type": "application/json",
          },
        });

        setEmail("");
        setPassword("");
        setUsername("");
      }
    } catch (error) {
      // Handle Errors here.
      console.error(error.message);
      // Optionally, update UI to reflect the error
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("🚀 ~ handleGoogleLogin ~ result:", result);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      console.log("🚀 ~ handleGoogleLogin ~ credential:", credential);
      //const token = credential.accessToken;
      const user = result.user;

      console.log(user);

      // Here, you can use the token or user information for your application's login logic
      if (user) {
        setAuthenticated(true); // Set auth to true if Google login is successful

        // Retrieve the Firebase token instead of the Google token for backend API calls
        const tokenResult = await user.getIdTokenResult();
        console.log("🚀 ~ handleGoogleLogin ~ tokenResult:", tokenResult);
        //setToken(tokenResult);

        const userId = user?.uid;
        const email = user.providerData[0]?.email;
        const userName = user.providerData[0]?.displayName?.replace(/\s+/g, "");
        const phoneNumber = user.providerData[0]?.phoneNumber;
        const userProfilePic = user.providerData[0]?.photoURL;
        const name = result?._tokenResponse.firstName + " " + result?._tokenResponse.lastName;

        //localStorage.setItem('user', JSON.stringify({username: userName, userId: userId, token}));

        console.log(userId, email, userName, phoneNumber, userProfilePic, name);

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
      }
    } catch (error) {
      console.error(error);
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
      </div>
    </div>
  );
};

export default Login;
