import React, { useEffect, useState } from "react";
import axios from "axios";
import { auth, provider } from "../../config/firebase-config"; // Adjust the path as necessary
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from "firebase/auth";
import Sample from "./Sample";

const Login = () => {
  const [authenticated, setAuthenticated] = useState(false || window.localStorage.getItem('authenticated') === 'true');
  const [token, setToken] = useState('');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        setAuthenticated(true);
        window.localStorage.setItem('authenticated', 'true');
        user.getIdTokenResult().then((tokenResult) => {
          console.log(tokenResult);
          setToken(tokenResult.token);
        });
      }
    });
  }, []);

  useEffect(() => {
    console.log("AUTHENTICATED? " + window.localStorage.getItem('authenticated'));
  }, []);

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });
      console.log(response.data);
      // Assuming the API returns a success status for a successful login
      if (response.status === 200) {
        setAuthenticated(true); // Set auth to true if login is successful
        window.localStorage.setItem('authenticated', 'true');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    setAuthenticated(false);
    window.localStorage.removeItem('authenticated');
    auth.signOut();
  };

  const handleEmailLogin = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // User is signed in
      // You can access the user object via userCredential.user
      console.log(userCredential.user);
      // Update authenticated state or perform other actions
      setAuthenticated(true);
      window.localStorage.setItem('authenticated', 'true');
      // Optionally, get the token as you did in the useEffect
      const tokenResult = await userCredential.user.getIdTokenResult();
      setToken(tokenResult.token);
    } catch (error) {
      // Handle Errors here.
      console.error(error.message);
      // Optionally, update UI to reflect the error
    }
  };

  const handleEmailSignUp = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // User account created & signed in
      console.log(userCredential.user);
      // Update authenticated state or perform other actions
      setAuthenticated(true);
      window.localStorage.setItem('authenticated', 'true');
      // Optionally, get the token as you did in the useEffect
      const tokenResult = await userCredential.user.getIdTokenResult();
      setToken(tokenResult.token);
    } catch (error) {
      // Handle Errors here.
      console.error(error.message);
      // Optionally, update UI to reflect the error
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("🚀 ~ handleGoogleLogin ~ result:", result)
      const credential = GoogleAuthProvider.credentialFromResult(result);
      console.log("🚀 ~ handleGoogleLogin ~ credential:", credential)
      //const token = credential.accessToken;
      const user = result.user;
      
      console.log(user);
  
      // Here, you can use the token or user information for your application's login logic
      if (user) {
        setAuthenticated(true); // Set auth to true if Google login is successful
        window.localStorage.setItem('authenticated', 'true');
        // set token
        
  
        // Retrieve the Firebase token instead of the Google token for backend API calls
        const tokenResult = await user.getIdTokenResult();
        console.log("🚀 ~ handleGoogleLogin ~ tokenResult:", tokenResult)
        //setToken(tokenResult);

        const userId = result?._tokenResponse.localId;
        const email = user.providerData[0]?.email;
        const userName = user.providerData[0]?.displayName?.replace(/\s+/g, '');
        const phoneNumber = user.providerData[0]?.phoneNumber;
        const userProfilePic = user.providerData[0]?.photoURL;
        const name = result?._tokenResponse.firstName + " " + result?._tokenResponse.lastName;
  
        console.log(userId, email, userName, phoneNumber, userProfilePic, name);
  
        // Only create the user in the backend if they are a new user
        // Only create the user in the backend if they are a new user
      if (result?._tokenResponse.isNewUser) {
        const payload = {};

        if (userId) payload.userId = userId;
        if (email) payload.email = email;
        if (userName) payload.userName = userName;
        if (phoneNumber) payload.phoneNumber = phoneNumber;
        if (userProfilePic) payload.userProfilePic = userProfilePic;
        if (name.trim()) payload.name = name;

        await axios.post("http://localhost:5000/api/users/create-user", payload, {
          headers: {
            'Authorization': `Bearer ${tokenResult.token}`,
            'Content-Type': 'application/json'
          }
        });
      }
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div>
        <input
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div>
        <button onClick={handleLogin}>Login</button>

        {authenticated ? (
          <div>
            <h1>Authenticated</h1>
            <button onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <div>
            <button onClick={handleGoogleLogin}>Login with Google</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
