// frontend/src/App.jsx
import "./App.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import Layout from "/layout/Layout";
import { Toaster } from "react-hot-toast";
// ❌ remove this line
// import { UserProvider, TokenDebugInfo } from "./context/UserContext";
import { UserProvider } from "./context/UserContext";

function App() {
  return (
    <UserProvider>
      <div className="flex flex-col w-full h-screen">
        <Layout />
        <Toaster position="top-left" />
        {/* ❌ remove this line */}
        {/* <TokenDebugInfo /> */}
      </div>
    </UserProvider>
  );
}

export default App;
