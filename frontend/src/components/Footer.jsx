const Footer = () => {
  return (
    <div
      id="footer"
      className="bg-[#f5f0ec] py-8 px-4 md:px-24 lg:px-72 flex flex-col lg:flex-row lg:justify-between items-center lg:items-start w-full"
    >
      <div className="flex flex-col items-center lg:items-start text-center lg:text-left mb-8 lg:mb-0 px-4 lg:px-6">
        <b className="text-lg font-semibold">Contact Us</b>
        <p className="text-sm">ani2home@gmail.com</p>
        <p className="text-sm">09123456789</p>
      </div>
      <div className="flex flex-col items-center lg:items-start text-center lg:text-left mb-8 lg:mb-0 px-4 lg:px-6">
        <b className="text-lg font-semibold">Browse</b>
        <a href="/" className="text-sm">
          Home
        </a>
        <a href="/aboutus" className="text-sm">
          About Us
        </a>
        <a href="/products" className="text-sm">
          Shop
        </a>
      </div>
      <div className="flex flex-col items-center lg:items-start text-center lg:text-left mb-8 lg:mb-0 px-4 lg:px-6">
        <b className="text-lg font-semibold">Follow Us</b>
        <a href="https://www.facebook.com" className="text-sm">
          Facebook
        </a>
        <a href="https://www.x.com" className="text-sm">
          Twitter
        </a>
        <a href="https://www.linkedin.com" className="text-sm">
          LinkedIn
        </a>
      </div>
      <div className="flex flex-col items-center lg:items-start text-center lg:text-left px-4 lg:px-6">
        <div
          id="footerLogo"
          className="h-16 w-16 md:h-20 md:w-20 bg-gray-300 flex items-center justify-center"
        >
          {/* Footer Logo */}
        </div>
      </div>
    </div>
  );
};

export default Footer;
