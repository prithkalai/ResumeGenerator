const { google } = require("googleapis");
require("dotenv").config();

const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

// ✅ Create Google OAuth Client with Automatic Token Refresh
const authClient = new google.auth.OAuth2(clientId, clientSecret);
authClient.setCredentials({ refresh_token: refreshToken });

// 🔄 Auto-Update Token in Memory
authClient.on("tokens", (tokens) => {
  if (tokens.access_token) {
    console.log("✅ Access Token Updated Automatically");
    authClient.setCredentials(tokens); // ✅ Ensures future requests use fresh token
  }
});

// ✅ Get the Google Docs Client (Always Uses Valid Token)
async function getGoogleDocsClient() {
  return google.docs({ version: "v1", auth: authClient });
}

async function getGoogleDriveClient() {
  return google.drive({ version: "v3", auth: authClient });
}

module.exports = { getGoogleDocsClient, getGoogleDriveClient };
