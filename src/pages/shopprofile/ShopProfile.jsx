import React from 'react';
import './shopprofile.css';

const ShopProfile = () => {
  
  return (
    // insert navbar here
    <div className="shopBanner">
      <div className="shopLeftBox">
        {/* include to shopPart1: Logo, Followers, Ratings, Products */}
        <div className="shopPart1">

          <div className="shopLogo">
            <img src="images\FarmShop1.jpg" alt="Shop Logo" />
          </div>

          <div className="shopStats">
            <div className="shopFollowersIcon">
            </div>
            <div className="shopFollowersCount">
              Followers: insert numbers here
            </div>

            <div className="shopRatingsIcon">
            </div>
            <div className="shopRatingsCount">
                Rating: 4.4 (1,304)
            </div>

            <div className="shopProductsIcon">
            </div>
            <div className="shopProductsCount">
                Products: 67
            </div>  
          </div> {/* end of shopStats */}

        </div> {/*end of shopPart1 */}

        <div className="shopPart2">
          <div className="shopTitle">
            Pogi Farms
          </div>
          <div className="shopLocation">
            Dasmarinas, Cavite
          </div>
          <div className="shopDescription">
            Real eyes realize real lies. You miss the opportunities you don’t take.
          </div>
          <div className="shopButtons">
            follow and write a review
          </div>
        </div> {/*end of shopPart2 */}

      </div> {/*end of shopLeftBox */}


      <div className="shopRightBox">
        <div className="shopButtons">
            View Seller Button here
          </div>
      </div>

    </div> /*end of shopBanner */

  );
};

export default ShopProfile;
