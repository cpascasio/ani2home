import { useEffect } from "react";
import { useUser } from "../../context/UserContext";
import useFetch from "../../../hooks/useFetch";
import InventoryTable from "../../components/seller/InventoryTable";


// this component contains the Seller Dashboard
const Seller = () => {

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
                    <div>
                        <h1>Welcome {user.username}</h1>
                        <p>Here you can manage your products and orders</p>

                        <InventoryTable />


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