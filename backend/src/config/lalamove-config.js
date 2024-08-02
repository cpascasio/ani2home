// config/lalamove-config.js

const SDKClient = require("@lalamove/lalamove-js");

const sdkClient = new SDKClient.ClientModule(
    new SDKClient.Config(
        process.env.LALAMOVE_PUBLIC_KEY,  // Use environment variables for sensitive data
        process.env.LALAMOVE_SECRET_KEY,
        "sandbox" // Default to sandbox environment
    )
);

module.exports = sdkClient;
