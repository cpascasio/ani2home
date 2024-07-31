const Header = () => {
    return (
        <div className="bg-white flex flex-col md:flex-row items-center p-3 px-4 sm:px-6 md:px-8 lg:px-10 drop-shadow-md sticky top-0 z-20">
            <div className="p-2 text-black h-12 w-12 sm:h-16 sm:w-16 flex-shrink-0">
                <img src="../src/assets/logoHeader.png" alt="Ani2Home" className="h-full w-full object-contain" />
            </div>
            <div id="headerLinks" className="flex flex-wrap gap-2 sm:gap-4 md:gap-6 items-center flex-grow text-center md:text-left">
                <a className="p-2 text-sm sm:text-base">Home</a>
                <a className="p-2 text-sm sm:text-base">About Us</a>
                <a className="p-2 text-sm sm:text-base">Contact Us</a>
            </div>
            <form className="flex-1 my-2 sm:my-0 flex justify-center md:justify-start">
                <input id="searchHeaderForm" className="w-full sm:w-4/5 md:w-3/4 lg:w-1/2 rounded-full py-2 px-4 sm:py-3 sm:px-5 text-sm" type="text" placeholder="Vegetables, Fruits, Meat..."/>
            </form>
            <div className="flex gap-4 sm:gap-6 items-center flex-shrink-0 mt-2 md:mt-0">
                <div id="cartHeaderBtn" className="h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center">
                    {/* Cart Icon */}
                </div>
                <div id="profileHeaderBtn" className="h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center">
                    {/* Profile Icon */}
                </div>
            </div>
        </div>
    );
}

export default Header;
