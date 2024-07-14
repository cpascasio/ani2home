import React from 'react';
import Header from '../../components/Header.jsx'
import Footer from '../../components/Footer.jsx'
import './shopprofile.css';

const ShopProfile = () => {
    return (
      <div className='w-full'>
      <Header />

        <div className="shopBanner">
            <div className="shopLeftBox">
                {/* include to shopPart1: Logo, Followers, Ratings, Products */}
                <div className="shopPart1">
                    <div className="shopLogo">
                        <img src="../src/assets/FarmShop1.jpg" alt="Shop Logo" />
                    </div>
                    <div className="shopStats">
                        <div className="shopStatItem shopStatsContainer">
                            <div className="shopFollowersIcon">
                                <img src="../src/assets/FollowersIcon.png" alt="Followers" />
                            </div>
                            <div className="shopFollowersCount">
                                <strong>Followers:</strong> 1,203
                            </div>
                        </div>
                        <div className="shopStatItem shopStatsContainer">
                            <div className="shopRatingsIcon">
                                <img src="../src/assets/RatingsIcon.png" alt="Ratings" />
                            </div>
                            <div className="shopRatingsCount">
                              <strong>Rating:</strong> 4.4 (1,304)
                            </div>
                        </div>
                        <div className="shopStatItem shopStatsContainer">
                            <div className="shopProductsIcon">
                                <img src="../src/assets/ProductsIcon.png" alt="Products" />
                            </div>
                            <div className="shopProductsCount">
                              <strong>Products:</strong> 67
                            </div>
                        </div>
                    </div> {/* end of shopStats */}
                </div> {/* end of shopPart1 */}
                <div className="shopPart2">
                    <h1 className="shopTitle">
                      Pogi Farms
                    </h1>
                    <div className="shopLocation"style={{ fontStyle: 'italic' }}>
                      <i>Dasmarinas, Cavite</i>
                    </div>
                    <div className="shopDescription">
                        Real eyes realize real lies. You miss the opportunities you don’t take.
                    </div>
                    <div className="shopButtons">
                        follow and write a review button here
                    </div>
                </div> {/* end of shopPart2 */}
            </div> {/* end of shopLeftBox */}
            <div className="shopRightBox">
                <div className="shopButtons">
                    View Seller Button here
                </div>
            </div>
        </div>  {/* end of shopBanner */}
      <Footer />
      </div> /* end of classNAme w-full */
        
    );
};

export default ShopProfile;
