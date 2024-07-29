import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';


const firebaseConfig = {
    apiKey: "AIzaSyAwttPbRQqWaT-6RJcPKqdn_0CwZZb5WNY",
    authDomain: "ani2home-fede2.firebaseapp.com",
    projectId: "ani2home-fede2",
    storageBucket: "ani2home-fede2.appspot.com",
    messagingSenderId: "660379576038",
    appId: "1:660379576038:web:495817096c1f3b7e4cfd27",
    measurementId: "G-2SMHL861T8"
  };
  
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
  const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };