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

// Get Google Drive Client
async function getGoogleDriveClient() {
  return google.drive({ version: "v3", auth: authClient });
}

function generateBatchUpdateRequests(jsonData) {
  const requests = [];

  // Process Technical Skills replacements
  if (jsonData.technical_skills) {
    jsonData.technical_skills.forEach((skill) => {
      requests.push({
        replaceAllText: {
          containsText: {
            text: skill.old, // Old text to find
            matchCase: true,
          },
          replaceText: skill.new, // New text to replace with
        },
      });
    });
  }

  // Process Bullets replacements
  if (jsonData.bullets) {
    jsonData.bullets.forEach((bullet) => {
      requests.push({
        replaceAllText: {
          containsText: {
            text: bullet.old, // Old text to find
            matchCase: true,
          },
          replaceText: bullet.new, // New text to replace with
        },
      });
    });
  }

  return requests;
}

module.exports = {
  getGoogleDocsClient,
  getGoogleDriveClient,
  generateBatchUpdateRequests,
};
