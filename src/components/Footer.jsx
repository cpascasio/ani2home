const Footer = () => {
    return (
        <div id="footer" className="w-full h-full flex py-20 justify-center gap-52">
            <div className="flex-col">
                <b>Contact</b>
                <p>email@dlsu.edu.ph</p>
                <p>email@dlsu.edu.ph</p>
            </div>
            <div className="flex-col">
                <b>Our Company</b>
                <a>Products</a>
                <a>About Us</a>
                <a>Contact Us</a>
            </div>
            <div className="flex-col">
                <b>Follow Us</b>
                <a>Facebook</a>
                <a>Twitter</a>
                <a>LinkedIn</a>
            </div>
            <div className="flex-col">
                <div id="footerLogo" className="h-20 w-20 inline-block align-middle">

                </div>
            </div>
        </div>
    );
};

export default Footer;