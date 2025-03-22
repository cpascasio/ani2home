import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const EnableMFA = () => {
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user; // Pass user data via location state if needed

  // Generate the MFA secret and QR code
  const generateMFA = async () => {
    try {
      // Call the backend to generate the MFA secret
      const response = await axios.post(`/api/users/${user?.userId}/enable-mfa`);
      const { qrCodeUrl, secret } = response.data.data;

      // Display the QR code
      setQrCodeUrl(qrCodeUrl);
      setSuccess("MFA secret generated successfully. Scan the QR code with your authenticator app.");
    } catch (error) {
      console.error("Error generating MFA:", error);
      setError("Failed to generate MFA. Please try again.");
    }
  };

  // Verify the MFA token
  const verifyMFA = async () => {
    try {
      // Call the backend to verify the token
      const response = await axios.post(`/api/users/${user?.userId}/verify-mfa`, {
        token: verificationCode,
      });

      if (response.data.state === "success") {
        setSuccess("MFA enabled successfully!");
        navigate("/my-profile"); // Redirect to the profile page
      } else {
        setError("Invalid token. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying MFA:", error);
      setError("Failed to verify MFA. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Enable Multi-Factor Authentication</h1>

        {!qrCodeUrl ? (
          <button
            onClick={generateMFA}
            className="w-full bg-green-900 text-white py-2 px-4 rounded hover:bg-green-800 transition duration-300"
          >
            Generate MFA QR Code
          </button>
        ) : (
          <>
            <p className="text-gray-600 mb-4">
              Scan the QR code below with your authenticator app (e.g., Google Authenticator).
            </p>
            <img src={qrCodeUrl} alt="MFA QR Code" className="w-48 h-48 mx-auto mb-4" />
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter verification code"
              className="w-full p-2 border border-gray-300 rounded mb-4"
            />
            <button
              onClick={verifyMFA}
              className="w-full bg-green-900 text-white py-2 px-4 rounded hover:bg-green-800 transition duration-300"
            >
              Verify and Enable MFA
            </button>
          </>
        )}

        {error && <p className="text-red-500 mt-4">{error}</p>}
        {success && <p className="text-green-500 mt-4">{success}</p>}
      </div>
    </div>
  );
};

export default EnableMFA;