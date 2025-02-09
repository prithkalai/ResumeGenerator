const express = require("express");
const morgan = require("morgan");
const { getGoogleDocsClient } = require("./google/auth");
const {
  getAIResumeSuggestions,
  getFormattedPrompt,
  extractJSON,
} = require("./open-router/chatCompletion");

const app = express();

app.use(express.json());
app.use(morgan("tiny"));

app.get("/api/v1/resume/update", async (req, res) => {
  try {
    const docs = await getGoogleDocsClient();

    const response = await docs.documents.get({
      documentId: "10EdDgAr_7adBhpwPQtcDL-Xyah8XyIGsbvUXY5eq2i4",
    });

    return res.json(response.data);
  } catch (error) {
    console.error("❌ API Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to update resume" });
  }
});

app.post("/api/v1/resume/completion", async (req, res) => {
  try {
    // Get properly formatted Prompt
    const resume = req.body.resume;
    const jobDescription = req.body.job;
    const formattedPrompt = getFormattedPrompt(resume, jobDescription);

    // Call OpenRouter API with the prompt
    const completion = await getAIResumeSuggestions(formattedPrompt);

    // Parse the Response into JSON
    const response = extractJSON(completion.data.choices[0].message.content);

    // Return Suggestions to the User
    return res.json(response);
  } catch (error) {
    console.error("❌ API Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to get AI Suggestion" });
  }
});

app.listen(8080, () => {
  console.log("Listening on port 8080.");
});
