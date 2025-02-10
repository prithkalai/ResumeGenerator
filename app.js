const express = require("express");
const morgan = require("morgan");
require("dotenv").config();
const {
  getGoogleDocsClient,
  getGoogleDriveClient,
  generateBatchUpdateRequests,
} = require("./google/auth");
const {
  getAIResumeSuggestions,
  getFormattedPrompt,
  extractJSON,
} = require("./open-router/chatCompletion");

const app = express();

app.use(express.json());
app.use(morgan("tiny"));

const BASE_RESUME_FILE_ID = process.env.BASE_RESUME_FILE_ID;
const SPECIFIED_FOLDER = process.env.SPECIFIED_FOLDER;

app.post("/api/v1/resume/update", async (req, res) => {
  try {
    const suggestions = req.body;

    const drive = await getGoogleDriveClient();
    const docs = await getGoogleDocsClient();

    // Create a Copy of Base Resume
    const newFile = await drive.files.copy({
      fileId: BASE_RESUME_FILE_ID,
      requestBody: {
        name: "Copied_Updated_Resume_API_Generated",
      },
    });

    // Move new Resume to specified folder
    drive.files.update({
      fileId: newFile.data.id,
      addParents: [SPECIFIED_FOLDER],
    });

    // Use replaceAllText() to remove all the text and send it as a batchUpdate
    docs.documents.batchUpdate({
      documentId: newFile.data.id,
      requestBody: {
        requests: generateBatchUpdateRequests(suggestions),
      },
    });

    return res.send("Done");
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
