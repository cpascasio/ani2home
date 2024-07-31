import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faShoppingCart, faUser } from '@fortawesome/free-solid-svg-icons';
import '../App.css';

const Header = () => {
  const [cartColor, setCartColor] = useState('#efefef');
  const [profileColor, setProfileColor] = useState('#efefef');
  const [searchIconColor, setSearchIconColor] = useState('#737373');

  return (
    <div
      className="flex flex-row gap-8 p-3 px-20 drop-shadow-md top-0 sticky z-20"
      style={{ backgroundColor: '#0b472d' }}
    >
      <div className="logo p-3 text-black h-24 w-24 my-auto">
        <img src="../src/assets/logo.png" alt="Ani2Home" className="h-full w-full object-contain" />
      </div>

      <div id="headerLinks" className="flex gap-8 items-center">
        <a
          className="p-3"
          style={{ color: '#efefef', transition: 'color 0.3s' }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#67b045'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#efefef'}
        >
          Home
        </a>
        <a
          className="p-3"
          style={{ color: '#efefef', transition: 'color 0.3s' }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#67b045'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#efefef'}
        >
          About Us
        </a>
        <a
          className="p-3"
          style={{ color: '#efefef', transition: 'color 0.3s' }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#67b045'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#efefef'}
        >
          Shop
        </a>
      </div>

      <form className="search-form flex-1 my-auto flex items-center">
        <FontAwesomeIcon
          icon={faSearch}
          className="search-icon"
          style={{ color: searchIconColor, transition: 'color 0.3s' }}
          onMouseEnter={() => setSearchIconColor('#67b045')}
          onMouseLeave={() => setSearchIconColor('#737373')}
        />
        <input
          id="searchHeaderForm"
          className="search-input flex-1 rounded-full py-3 px-5 outline-none"
          type="text"
          placeholder="What are you looking for?"
        />
      </form>

      <div className="flex gap-6 h-100">
        <FontAwesomeIcon
          icon={faShoppingCart}
          className="header-icon"
          style={{ color: cartColor, transition: 'color 0.3s' }}
          onMouseEnter={() => setCartColor('#67b045')}
          onMouseLeave={() => setCartColor('#efefef')}
        />
        <FontAwesomeIcon
          icon={faUser}
          className="header-icon"
          style={{ color: profileColor, transition: 'color 0.3s' }}
          onMouseEnter={() => setProfileColor('#67b045')}
          onMouseLeave={() => setProfileColor('#efefef')}
        />
      </div>
    </div>
  );
};

export default Header;
