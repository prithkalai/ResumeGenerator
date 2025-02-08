const fs = require("fs");

// Centralized section titles for easy updates
const SECTION_TITLES = {
  work_experience: ["work experience", "professional experience"],
  projects: ["projects", "personal projects", "project experience"],
  exclude: [
    "technical skills",
    "skills",
    "technologies",
    "certifications",
    "skills and tools",
  ], // Sections to skip
};

// Load the JSON data from file
fs.readFile("data.json", "utf8", (err, data) => {
  if (err) {
    console.error("Error reading file:", err);
    return;
  }

  const docResponse = JSON.parse(data);
  const content = docResponse.body?.content || [];
  let currentSection = null;

  console.log("\n🔍 Extracted Bullet Points with Indexes:\n");

  content.forEach((element) => {
    if (!element.paragraph) return;

    let paragraphText = "";
    let bulletDetected = element.paragraph.bullet !== undefined; // Google Docs API marks bullets separately
    let startIndex = null;
    let endIndex = null;

    // Merge fragmented text runs and find global start & end index
    element.paragraph.elements.forEach((elem) => {
      if (elem.textRun && elem.textRun.content.trim()) {
        if (startIndex === null) startIndex = elem.startIndex; // First fragment start index
        endIndex = elem.endIndex; // Continuously update end index
        paragraphText += elem.textRun.content;
      }
    });

    paragraphText = paragraphText.trim();
    if (!paragraphText) return; // Skip empty lines

    // Identify Section Titles and update `currentSection`
    const normalizedText = paragraphText.toLowerCase();
    for (let section in SECTION_TITLES) {
      if (SECTION_TITLES[section].includes(normalizedText)) {
        currentSection = section;
        return;
      }
    }

    // Ignore text if we're inside an excluded section
    if (currentSection && SECTION_TITLES.exclude.includes(currentSection)) {
      return;
    }

    // Process only Work Experience & Projects
    if (
      currentSection &&
      (currentSection === "work_experience" || currentSection === "projects")
    ) {
      if (bulletDetected) {
        // Only process bullet points (marked by Google Docs API)
        console.log(`Bullet Point: "${paragraphText}"`);
        console.log(`  📌 Start Index: ${startIndex}`);
        console.log(`  📌 End Index: ${endIndex}\n`);
      }
    }
  });
});
