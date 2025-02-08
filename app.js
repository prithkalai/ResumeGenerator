const express = require("express");
const app = express();

app.get("/process-resume", (req, res) => {
  console.log("Resume Processed");
});

app.listen(8080, () => {
  console.log("Listening on port 8080.");
});
