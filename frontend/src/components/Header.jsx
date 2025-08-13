import React, { useState } from "react";
import {
  FiMenu,
  FiArrowRight,
  FiX,
  FiChevronDown,
  FiShoppingCart,
  FiSettings, // 🆕 Add settings icon for admin
} from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";
import {
  useMotionValueEvent,
  AnimatePresence,
  useScroll,
  motion,
} from "framer-motion";
import useMeasure from "react-use-measure";
import logoImage from "../assets/logo.png";
import logoTitle from "../assets/logotitle.png";
import PropTypes from "prop-types";
import { usePermissions } from "../context/UserContext"; // 🆕 Add this import

const Header = () => {
  return <FlyoutNav />;
};

const FlyoutNav = () => {
  const [scrolled, setScrolled] = React.useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 0);
  });

  return (
    <nav
      className={`fixed top-0 z-50 w-full px-6 text-white 
      transition-all duration-300 ease-out lg:px-12
      ${scrolled ? "bg-[#072C1C] py-3 shadow-xl" : "bg-[#67B045]/0 py-6 shadow-none"}`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Logo />
        <div className="flex-1 hidden lg:flex items-center gap-6">
          <NavLinks />
          <div className="flex-1 mx-6">
            <SearchBar />
          </div>
          <div className="flex items-center gap-6">
            <CartIcon />
            <AdminDashboardIcon /> {/* 🆕 Add admin dashboard icon */}
            <ProfileIcon />
          </div>
        </div>
        <MobileMenu />
      </div>
    </nav>
  );
};

const Logo = () => (
  <a href="/" className="flex items-center gap-2">
    <img src={logoImage} alt="Ani2Home Logo" className="w-10 h-auto" />
    <img src={logoTitle} alt="Ani2Home Title" className="w-13 h-12" />
  </a>
);

const NavLinks = () => (
  <div className="flex items-center gap-8 pl-8">
    <NavLink href="/">Home</NavLink>
    <NavLink href="/aboutus">About Us</NavLink>
    <NavLink href="/products">Shop</NavLink>
  </div>
);

const NavLink = ({ children, href }) => (
  <a
    href={href}
    className="relative font-bold"
    style={{
      color: "#209D48",
      transition: "color 0.3s ease",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.color = "#67b045")}
    onMouseLeave={(e) => (e.currentTarget.style.color = "#209D48")}
  >
    {children}
  </a>
);

NavLink.propTypes = {
  children: PropTypes.node.isRequired,
  href: PropTypes.string.isRequired,
};

const SearchBar = () => (
  <div className="relative">
    <input
      type="text"
      placeholder="What are you looking for?"
      className="rounded-full px-6 py-3 outline-none w-full max-w-lg pl-4"
      style={{
        backgroundColor: "#d9d9d9",
        color: "#0B472D",
        placeholderColor: "#D9D9D9",
      }}
    />
  </div>
);

const CartIcon = () => {
  const [color, setColor] = React.useState("#209D48");

  return (
    <a
      href="/cart"
      className="relative"
      onMouseEnter={() => setColor("#67b045")}
      onMouseLeave={() => setColor("#209D48")}
    >
      <FiShoppingCart size={24} style={{ color }} />
      <span className="absolute -top-2 -right-2 rounded-full bg-red-600 text-xs text-white px-1">
        3
      </span>
    </a>
  );
};

// 🆕 NEW: Admin Dashboard Icon Component
const AdminDashboardIcon = () => {
  const [color, setColor] = React.useState("#209D48");
  const { isAdmin, isAuthenticated } = usePermissions();

  // Only show if user is authenticated and is admin
  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <a
      href="/admin/dashboard"
      className="relative flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200"
      onMouseEnter={() => setColor("#67b045")}
      onMouseLeave={() => setColor("#209D48")}
      style={{
        backgroundColor: "rgba(32, 157, 72, 0.1)",
        border: `1px solid ${color}`,
      }}
      title="Admin Dashboard"
    >
      <FiSettings size={20} style={{ color }} />
      <span
        className="text-sm font-semibold hidden xl:inline"
        style={{ color }}
      >
        Admin
      </span>
    </a>
  );
};

const ProfileIcon = () => {
  const [color, setColor] = React.useState("#209D48");

  return (
    <a
      href="/myProfile"
      className="relative"
      onMouseEnter={() => setColor("#67b045")}
      onMouseLeave={() => setColor("#209D48")}
    >
      <FaUserCircle size={24} style={{ color }} />
    </a>
  );
};

const MobileMenu = () => {
  const [open, setOpen] = useState(false);
  const { isAdmin, isAuthenticated } = usePermissions(); // 🆕 Add this

  return (
    <div className="block lg:hidden relative z-50">
      <button
        onClick={() => setOpen(true)}
        className="absolute top-4 left-1/2 transform -translate-x-1/2 -mt-7 text-3xl text-[#209D48]"
        aria-label="Open menu"
      >
        <FiMenu />
      </button>
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ x: "100vw" }}
            animate={{ x: 0 }}
            exit={{ x: "100vw" }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed left-0 top-0 flex h-screen w-full flex-col bg-[#072C1C] z-50"
          >
            <div className="flex items-center justify-between p-6">
              <Logo />
              <div className="flex items-center gap-4">
                <CartIcon />
                {/* 🆕 Show admin button in mobile menu if admin */}
                {isAuthenticated && isAdmin && (
                  <a
                    href="/admin/dashboard"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg"
                    style={{
                      backgroundColor: "rgba(32, 157, 72, 0.2)",
                      border: "1px solid #209D48",
                    }}
                    onClick={() => setOpen(false)}
                  >
                    <FiSettings size={20} style={{ color: "#209D48" }} />
                    <span className="text-sm font-semibold text-[#209D48]">
                      Admin
                    </span>
                  </a>
                )}
                <ProfileIcon />
                <button
                  onClick={() => setOpen(false)}
                  className="text-3xl text-[#209D48]"
                  aria-label="Close menu"
                >
                  <FiX />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-scroll bg-[#0b472d] p-6">
              <div className="mb-6">
                <SearchBar />
              </div>
              <div className="flex flex-col">
                {/* 🆕 Add admin dashboard to mobile links if admin */}
                {isAuthenticated && isAdmin && (
                  <MobileMenuLink href="/admin/dashboard" setMenuOpen={setOpen}>
                    🛡️ Admin Dashboard
                  </MobileMenuLink>
                )}
                {LINKS.map((l) => (
                  <MobileMenuLink
                    key={l.text}
                    href={l.href}
                    FoldContent={l.component}
                    setMenuOpen={setOpen}
                  >
                    {l.text}
                  </MobileMenuLink>
                ))}
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
};

const MobileMenuLink = ({ children, href, FoldContent, setMenuOpen }) => {
  const [ref, { height }] = useMeasure();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative text-white">
      {FoldContent ? (
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              setOpen((prev) => !prev);
            }
          }}
          className="flex w-full cursor-pointer items-center justify-between border-b border-neutral-300 py-6 text-start text-2xl font-semibold"
        >
          <a
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(false);
            }}
            href={href}
          >
            {children}
          </a>
          <motion.div
            animate={{ rotate: open ? "180deg" : "0deg" }}
            transition={{
              duration: 0.3,
              ease: "easeOut",
            }}
          >
            <FiChevronDown />
          </motion.div>
        </button>
      ) : (
        <a
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen(false);
          }}
          href={href}
          className="flex w-full cursor-pointer items-center justify-between border-b border-neutral-300 py-6 text-start text-2xl font-semibold"
        >
          <span>{children}</span>
          <FiArrowRight />
        </a>
      )}
      {FoldContent && (
        <motion.div
          initial={false}
          animate={{
            height: open ? height : "0px",
            marginBottom: open ? "24px" : "0px",
            marginTop: open ? "12px" : "0px",
          }}
          className="overflow-hidden"
        >
          <div ref={ref}>
            <FoldContent />
          </div>
        </motion.div>
      )}
    </div>
  );
};

MobileMenuLink.propTypes = {
  children: PropTypes.node.isRequired,
  href: PropTypes.string.isRequired,
  FoldContent: PropTypes.elementType,
  setMenuOpen: PropTypes.func.isRequired,
};

const LINKS = [
  {
    text: "Home",
    href: "/",
  },
  {
    text: "About Us",
    href: "/aboutus",
  },
  {
    text: "Shop",
    href: "/products",
  },
];

export default Header;
