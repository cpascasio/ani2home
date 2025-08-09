import React from "react";
import "./About.css";
import farmersImage from "../../assets/farmers.png";
import blobShapeImage from "../../assets/shape.png";
import logoImage from "../../assets/logo-shadow.png";

const AboutUs = () => {
  return (
    <div className="bg-[#f5f0ec] py-10 px-6 flex flex-col items-center relative pt-48">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Our Company Section */}
        <section className="content-intro lg:order-1 flex flex-col justify-center">
          <h1 className="text-4xl font-bold text-[#0b472d] mb-6">
            Our Company
          </h1>
          <p className="text-lg text-gray-700 leading-relaxed mb-4 text-justify">
            <strong>Ani2Home</strong> is a farm-to-table delivery service
            dedicated to{" "}
            <strong>
              {" "}
              connecting the people of Metro Manila with fresh, locally sourced
              produce{" "}
            </strong>{" "}
            from nearby farmers and public markets. Our mission is to{" "}
            <strong> empower </strong> small-scale farmers by providing them
            direct access to consumers, fostering a{" "}
            <strong> sustainable and vibrant local economy</strong>.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed mb-4 text-justify">
            We believe in the importance of eating seasonal, sustainably grown
            food, not only for our health but for the health of our planet. By{" "}
            <strong> bridging the gap </strong> between farmers and consumers,
            Ani2Home helps you discover the{" "}
            <strong>freshest fruits, vegetables, and artisanal goods</strong>{" "}
            while supporting the hardworking farmers who grow them.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed mb-4 text-justify">
            Our app offers a unique experience where you can{" "}
            <strong>
              {" "}
              explore the profiles of local farmers, learn about their farming
              practices, and even discover recipes{" "}
            </strong>{" "}
            that feature the products you purchase.
          </p>
        </section>

        {/* Images Section */}
        <div className="images relative flex justify-center items-center">
          <img
            src={blobShapeImage}
            alt="Blob Shape"
            className="shape w-full sm:w-4/5 md:w-3/4 lg:w-full"
          />
          <img
            src={farmersImage}
            alt="Farmers"
            className="intro w-full sm:w-4/5 md:w-3/4 lg:w-full"
          />
        </div>
      </div>

      {/* Banner Section */}
      <div className="banner">
        <div className="banner-content">
          <img src={logoImage} alt="Ani2Home Logo" className="banner-logo" />
          <p className="text-lg font-semibold banner-text">
            At Ani2Home, we’re not just delivering food—we’re connecting you
            with the story behind every product, building a stronger, more
            sustainable community one meal at a time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
