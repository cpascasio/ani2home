import { useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";
import useFetch from "../../../hooks/useFetch";
import InventoryTable from "../../components/seller/InventoryTable";
import Menu from "../../components/seller/Menu";


// this component contains the Seller Dashboard
const Seller = () => {

    const [selectedMenu, setSelectedMenu] = useState('dashboard');

    const renderContent = () => {
        switch (selectedMenu) {
          case 'dashboard':
            return <div>Dashboard Content</div>;
          case 'inventory':
            return <InventoryTable />;
          case 'summary':
            return <div>Summary Content</div>;
          case 'purchase':
            return <div>Purchase Content</div>;
          case 'suppliers':
            return <div>Suppliers Content</div>;
          case 'sales':
            return <div>Sales Content</div>;
          case 'invoice':
            return <div>Invoice Content</div>;
          case 'bill':
            return <div>Bill Content</div>;
          case 'customers':
            return <div>Customers Content</div>;
          default:
            return <div>Dashboard Content</div>;
        }
      };

    const { user } = useUser();

    const { data: userData } = useFetch('/api/users/' + user ? user?.userId : '' + '/isStore');

    useEffect(() => {
        console.log(userData);
        console.log(userData?.data.isStore);
    }, [userData]);

    useEffect(() => {
        console.log(user);
    }, [user]);
    
    // fetch the user data from firebase api endpoint

    return (
        <div>
            {
                user ? (

                    <div className="flex">
                        <div className="menu-container">
                            <Menu onSelectMenu={setSelectedMenu} />
                        </div>
                        <div className="content-container">
                            {renderContent()}
                        </div>
                    </div>
                ) : (
                    <div>
                        <h1>Welcome Seller</h1>
                        <p>Here you can manage your products and orders</p>
                    </div>
                )
            }

        <h1>Seller Dashboard</h1>
        </div>
    );
}

export default Seller;