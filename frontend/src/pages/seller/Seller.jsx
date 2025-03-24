import { useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";
import useFetch from "../../../hooks/useFetch";
import InventoryTable from "../../components/seller/InventoryTable";
import Menu from "../../components/seller/Menu";
import SellerBanner from "../../components/seller/SellerBanner";
import OrdersTable from "../../components/seller/OrdersTable";
import Overview from "../../components/seller/Overview";
import { useNavigate } from "react-router-dom";

const Seller = () => {
  const [selectedMenu, setSelectedMenu] = useState("overview");

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

  const navigate = useNavigate();

  const { user, dispatch } = useUser();

  const { data: userFetch } = useFetch(`/api/users/${user?.userId}`);

  const [userData, setUserData] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (user.isStore === false) {
      navigate("/myProfile");
    }
  }, [user, navigate]);

  useEffect(() => {
    console.log(userFetch);
    console.log(userFetch?.data?.isStore);
    setUserData(userFetch?.data);
  }, [userFetch]);

  useEffect(() => {
    console.log(userData);
  }, [userData]);

  useEffect(() => {
    console.log(user);
  }, [user]);

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
