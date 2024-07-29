import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

const Header = () => {

  return (
        <div
        className="flex flex-row gap-8 p-3 px-20 drop-shadow-md top-0 sticky z-20"
        style={{ backgroundColor: '#0b472d' }} 
        >
        <div className="p-3 text-black h-24 w-24 my-auto">
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

      <form className="flex-1 my-auto flex items-center">
        <FontAwesomeIcon icon={faSearch} className="text-gray-500 mr-3" />
        <input
          id="searchHeaderForm"
          className="flex-1 rounded-full py-3 px-5 outline-none"
          type="text"
          placeholder="What are you looking for?"
        />
      </form>
      <div className="flex gap-6 h-100">
        <div id="cartHeaderBtn" className="h-10 w-10 my-auto"></div>
        <div id="profileHeaderBtn" className="h-10 w-10 my-auto"></div>
      </div>      

    </div>
  );
};

export default Header;
