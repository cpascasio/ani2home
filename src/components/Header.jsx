const Header = () => {
    return (
        <div className="bg-black flex flex-row gap-6 p-3">
            <div className="p-3">Logo</div>
            <a className="p-3">Home</a>
            <a className="p-3">About Us</a>
            <a className="p-3">Contact Us</a>
            <form className="flex-1">
                <input className="w-9/12 rounded-full py-3 px-5" type="text"/>
            </form>
            <button id="cartHeaderBtn"></button>
            <button id="profileHeaderBtn"></button>
        </div>
    );
  };

export default Header;