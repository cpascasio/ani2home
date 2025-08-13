// frontend/src/pages/seller/Seller.jsx
import { useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";
import { useSecureAuth } from "../../hooks/useSecureAuth";
import useFetch from "../../../hooks/useFetch";
import InventoryTable from "../../components/seller/InventoryTable";
import Menu from "../../components/seller/Menu";
import SellerBanner from "../../components/seller/SellerBanner";
import OrdersTable from "../../components/seller/OrdersTable";
import Overview from "../../components/seller/Overview";

const Seller = () => {
  const [selectedMenu, setSelectedMenu] = useState("overview");
  const { user } = useUser();
  const { localUser } = useSecureAuth();

  const { data: userFetch } = useFetch(`/api/users/${user?.userId}`);
  const [userData, setUserData] = useState("");

  const renderContent = () => {
    switch (selectedMenu) {
      case "overview":
        return <Overview />;
      case "inventory":
        return <InventoryTable />;
      case "orders":
        return <OrdersTable />;
      default:
        return null;
    }
  };

  // Remove all validation logic - ProtectedRoute handles this now
  // If this component renders, the user is guaranteed to have store access

  useEffect(() => {
    console.log("Seller userFetch:", userFetch);
    console.log("Seller userFetch isStore:", userFetch?.data?.isStore);
    setUserData(userFetch?.data);
  }, [userFetch]);

  useEffect(() => {
    console.log("Seller userData:", userData);
  }, [userData]);

  useEffect(() => {
    console.log("Seller context user:", user);
    console.log("Seller local user:", localUser);
  }, [user, localUser]);

  return (
    <div className="seller-bg">
      {user && <SellerBanner user={userData} />}
      <div className="flex flex-col lg:flex-row flex-1">
        <div className="lg:w-1/5 lg:order-1 order-2 flex-shrink-0 bg-gray-200">
          <Menu onSelectMenu={setSelectedMenu} />
        </div>
        <div className="lg:order-2 order-3 flex-1 bg-gray-200 overflow-auto p-4">
          {renderContent()}
        </div>
      </div>
      <footer className="bg-gray-200 py-4">{/* Footer content */}</footer>
    </div>
  );
};

export default Seller;
