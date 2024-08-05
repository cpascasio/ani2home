import { useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";
import useFetch from "../../../hooks/useFetch";
import InventoryTable from "../../components/seller/InventoryTable";
import Menu from "../../components/seller/Menu";
import SellerBanner from "../../components/seller/SellerBanner";
import OrdersTable from "../../components/seller/OrdersTable";
import Overview from "../../components/seller/Overview";

const Seller = () => {
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
    <div className="bg-[#e5e7eb] min-h-screen flex flex-col">
      {user && <SellerBanner className="flex-shrink-0" />}
      <div className="flex flex-col lg:flex-row flex-1">
        <div className="lg:w-1/5 lg:order-1 order-2 flex-shrink-0 bg-gray-200">
          <Menu onSelectMenu={setSelectedMenu} />
        </div>
        <div className="lg:order-2 order-3 flex-1 bg-gray-200 overflow-auto p-4">
          {renderContent()}
        </div>
      </div>
    </div>
  );
  
};

export default Seller;
