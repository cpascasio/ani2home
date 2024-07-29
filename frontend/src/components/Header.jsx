const Header = () => {
    return (
        <div className="bg-white flex flex-row gap-8 p-3 px-20 drop-shadow-md top-0 sticky z-20">
            <div className="p-3 text-black h-16 w-16 my-auto">
            <   img src="../src/assets/logoHeader.png" alt="Ani2Home" />
            </div>
            <div id="headerLinks" className=" flex gap-8 items-center">
                <a className="p-3">Home</a>
                <a className="p-3">About Us</a>
                <a className="p-3">Contact Us</a>
            </div>            
            <form className="flex-1 my-auto">
                <input id="searchHeaderForm" className="w-4/5 rounded-full py-3 px-5" type="text" placeholder="Vegetables, Fruits, Meat..."/>
            </form>
            <div className="flex gap-6 h-100">
                <div id="cartHeaderBtn" className="h-10 w-10 my-auto"></div>
                <div id="profileHeaderBtn" className="h-10 w-10 my-auto"></div>
            </div>            
        </div>
    );
  };

export default Header;