const Footer = () => {
    return (
        <div id="footer" className="bg-gray-100 py-10 px-4 lg:px-8 flex flex-col lg:flex-row lg:justify-between items-center lg:items-start max-w-full mx-auto">
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left mb-8 lg:mb-0">
                <b className="text-lg font-semibold">Contact</b>
                <p className="text-sm">email@dlsu.edu.ph</p>
                <p className="text-sm">email@dlsu.edu.ph</p>
            </div>
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left mb-8 lg:mb-0">
                <b className="text-lg font-semibold">Our Company</b>
                <a className="text-sm">Products</a>
                <a className="text-sm">About Us</a>
                <a className="text-sm">Contact Us</a>
            </div>
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left mb-8 lg:mb-0">
                <b className="text-lg font-semibold">Follow Us</b>
                <a className="text-sm">Facebook</a>
                <a className="text-sm">Twitter</a>
                <a className="text-sm">LinkedIn</a>
            </div>
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                <div id="footerLogo" className="h-16 w-16 md:h-20 md:w-20 bg-gray-300 flex items-center justify-center">
                    {/* Footer Logo */}
                </div>
            </div>
        </div>
    );
};

export default Footer;
