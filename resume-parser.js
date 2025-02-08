const fs = require("fs");

// Centralized section titles for easy updates
const SECTION_TITLES = {
  technical_skills: [
    "technical skills",
    "skills",
    "technologies",
    "skills and tools",
  ],
  work_experience: ["work experience", "professional experience"],
  projects: ["projects", "personal projects", "project experience"],
};

// Load the JSON data from file
fs.readFile("data.json", "utf8", (err, data) => {
  if (err) {
    console.error("Error reading file:", err);
    return;
  }

  const docResponse = JSON.parse(data);
  const content = docResponse.body?.content || [];
  let sections = {};
  let currentSection = null;

  content.forEach((element) => {
    if (!element.paragraph) return;

    let paragraphText = "";

    // Merge fragmented text
    element.paragraph.elements.forEach((elem) => {
      if (elem.textRun && elem.textRun.content.trim()) {
        paragraphText += elem.textRun.content;
      }
    });

    paragraphText = paragraphText.trim();
    if (!paragraphText) return; // Skip empty lines

    // Identify Section Titles
    const normalizedText = paragraphText.toLowerCase();

    // Check if the text matches any section title
    for (let section in SECTION_TITLES) {
      if (SECTION_TITLES[section].includes(normalizedText)) {
        currentSection = section;
        sections[currentSection] = [];
        return;
      }
    }

    // Process Content under Each Section
    if (currentSection) {
      if (currentSection === "technical_skills") {
        sections[currentSection].push(paragraphText); // Preserve full lines with delimiters
      } else if (
        currentSection === "work_experience" ||
        currentSection === "projects"
      ) {
        if (paragraphText.startsWith("•") || /^[0-9]+\./.test(paragraphText)) {
          // Bullet point detected: Add to last job/project
          if (sections[currentSection].length > 0) {
            sections[currentSection][
              sections[currentSection].length - 1
            ].points.push(paragraphText);
          }
        } else {
          // New Job/Project Title
          sections[currentSection].push({ title: paragraphText, points: [] });
        }
      }
    }
  });

  // Print the extracted resume content

  console.log("\nTechnical Skills\n");
  (sections["technical_skills"] || []).forEach((skill) => console.log(skill));

  console.log("\nWork Experience\n");
  (sections["work_experience"] || []).forEach((job) => {
    console.log(job.title);
    job.points.forEach((point) => console.log(point));
    console.log(""); // Blank line between jobs
  });

  console.log("Projects\n");
  (sections["projects"] || []).forEach((project) => {
    console.log(project.title);
    project.points.forEach((point) => console.log(point));
    console.log(""); // Blank line between projects
  });
});
