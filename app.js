const express = require("express");
const { getGoogleDocsClient } = require("./auth/auth");
const app = express();

app.use(express.json());

app.get("/get-doc", async (req, res) => {
  try {
    const docs = await getGoogleDocsClient();

    const response = await docs.documents.get({
      documentId: "10EdDgAr_7adBhpwPQtcDL-Xyah8XyIGsbvUXY5eq2i4",
    });

    return res.json(response.data);
  } catch (error) {
    console.error(
      "❌ Google Docs API Error:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to fetch document" });
  }
});

app.listen(8080, () => {
  console.log("Listening on port 8080.");
});
