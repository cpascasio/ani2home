import { useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";
import useFetch from "../../../hooks/useFetch";
import InventoryTable from "../../components/seller/InventoryTable";
import Menu from "../../components/seller/Menu";
import SellerBanner from "../../components/seller/SellerBanner";
import OrdersTable from "../../components/seller/OrdersTable";
import Overview from "../../components/seller/Overview";

const Seller = () => {
  // Initialize selectedMenu to 'overview' to display it by default
  const [selectedMenu, setSelectedMenu] = useState('overview');

  const renderContent = () => {
    switch (selectedMenu) {
      case 'overview':
        return <Overview />;
      case 'inventory':
        return <InventoryTable />;
      case 'orders':
        return <OrdersTable />;
      default:
        return null;
    }
  };

  const { user } = useUser();
  const { data: userData } = useFetch('/api/users/' + (user ? user?.userId : '') + '/isStore');

  useEffect(() => {
    console.log(userData);
    console.log(userData?.data.isStore);
  }, [userData]);

  useEffect(() => {
    console.log(user);
  }, [user]);

  return (
    <div className="bg-[#e5e7eb] min-h-screen">
      {user && <SellerBanner />}
      {user ? (
        <div className="flex flex-col lg:flex-row w-full h-full font-sans">
          <div className="flex-shrink-0 lg:w-1/5 bg-gray-200">
            <Menu onSelectMenu={setSelectedMenu} />
          </div>
          <div className="flex-1 p-5 bg-gray-200 overflow-auto">
            {renderContent()}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <h1 className="text-gray-800">Welcome Seller</h1>
          <p>Here you can manage your products and orders</p>
        </div>
      )}
    </div>
  );
};

export default Seller;
