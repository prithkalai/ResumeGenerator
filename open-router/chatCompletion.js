const axios = require("axios");
require("dotenv").config();

const OPEN_ROUTER_API_KEY = process.env.OPEN_ROUTER_API_KEY;

// Function to generate prompt
function getFormattedPrompt(resume, jobDescription) {
  const prompt = `
**Role:**  
- **AI Resume Tailoring Assistant**

**Description:**  
- You are a resume optimization assistant that tailors a resume to match a job description.

---

**Instructions:**

1. **Modify Only Specific Sections:**  
   - **General Rule:**  
     - In your output JSON, include an "old"–"new" pair **only** for lines you have modified. Do not include pairs for lines that remain unchanged.

   - **Technical Skills:**  
     - **Entity Definition:**  
       - Treat each original technical skills line (as it appears in the resume) as one complete entity.
     - **Subheading Removal:**  
       - Remove any subheadings or category labels (e.g., "Certifications:", "Languages:", "Database:") so that only the skills remain.
     - **Preserve Formatting:**  
       - When adding new words, retain the original formatting. For example, if the line is formatted as “Java, Python” or “Java | Python” or “Java • Python”, your updated line should follow the same format (e.g., “Java, Python, TypeScript”, “Java | Python | TypeScript”, or “Java • Python • TypeScript”).
     - **Modification Requirement:**  
       - For each technical skills line, provide one \`"old"\` (the original line without subheadings) and one \`"new"\` (the enriched line with additional relevant keywords) pair. **Do not remove the existing keywords; just add to them.** **DO NOT include subheadings**
     - **Example:**  
       - **Original Resume Line:**  
         \`"Certifications: AWS Certified Solutions Architect - Associate"\`
       - **Output:**  
         - \`"old": "AWS Certified Solutions Architect - Associate"\`  
         - \`"new": "AWS Certified Solutions Architect - Associate, Jenkins, Maven, and CICD tools"\`

   - **Work Experience & Projects:**  
     - **Bullet Points Only:**  
       - Improve the existing bullet points so that they better align with the job description.
     - **No Bullet Addition or Removal:**  
       - Do not add or remove any bullet points; only update (replace) the existing bullet text.
       - DO NOT include the bullet symbols. Only Include the text.

2. **Formatting Rules:**  
   - Each line in the output must be **115 characters or fewer**.
   - Use strong, action-oriented language that emphasizes measurable impact.
   - Each point should not be too short. Use the character limit freely.

3. **Output Format:**  
   - The final output must be a JSON object with two keys:
     - \`"technical_skills"\`: an array of objects, each with an \`"old"\` and \`"new"\` field.
     - \`"bullets"\`: an array of objects, each with an \`"old"\` and \`"new"\` field.
   - **Example JSON Structure:**
     \`\`\`json
     {
       "technical_skills": [
         {
           "old": "Original technical skills line without subheadings",
           "new": "Rewritten technical skills line with added keywords without subheadings"
         }
       ],
       "bullets": [
         {
           "old": "Original bullet point text.",
           "new": "Rewritten bullet point text, incorporating relevant keywords."
         }
       ]
     }
     \`\`\`

---

Inputs Provided By the User: 

Resume: 

${resume} 

Job Description: 

${jobDescription}
`;

  return prompt;
}

// Function to extract JSON from the response and clean the JSON
function extractJSON(text) {
  // Regular expression to extract JSON content from text
  const jsonMatch = text.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error("No JSON found in the input text.");
  }

  // Parse JSON
  let jsonData = JSON.parse(jsonMatch[0]);

  // List of unwanted subheading labels to be removed
  const labelsToRemove = [
    "Backend",
    "Frontend",
    "Concepts",
    "Certifications",
    "Languages",
    "Database",
    "Cloud",
  ];

  // Function to clean up the technical skills
  function cleanTechnicalSkills(skill) {
    labelsToRemove.forEach((label) => {
      skill.old = skill.old
        .replace(new RegExp(`\\b${label}:?\\b`, "gi"), "")
        .trim();
      skill.new = skill.new
        .replace(new RegExp(`\\b${label}:?\\b`, "gi"), "")
        .trim();
    });
    return skill;
  }

  // Modify technical_skills to remove labels and trim spaces
  if (jsonData.technical_skills) {
    jsonData.technical_skills =
      jsonData.technical_skills.map(cleanTechnicalSkills);
  }

  return jsonData;
}

// Method that interacts with the AI engine to get the response
async function getAIResumeSuggestions(formattedPrompt) {
  return axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      //   model: "deepseek/deepseek-r1-distill-llama-70b:free", // Great Response. Slightly unreliable
      model: "google/gemini-2.0-flash-thinking-exp:free", // Okaish Response. Very Reliable
      messages: [
        {
          role: "user",
          content: formattedPrompt,
        },
      ],
      //   provider: {
      //     order: ["Targon"],
      //   },
      //   response_format: {
      //     type: "json_schema",
      //     json_schema: {
      //       name: "suggestions",
      //       strict: true,
      //       schema: {
      //         type: "object",
      //         properties: {
      //           technical_skills: {
      //             type: "array",
      //             description: "An array of modified technical skills.",
      //             items: {
      //               type: "object",
      //               properties: {
      //                 old: {
      //                   type: "string",
      //                   description:
      //                     "The original technical skill line without subheadings",
      //                 },
      //                 new: {
      //                   type: "string",
      //                   description:
      //                     "The modified technical skill line with enhancements.",
      //                 },
      //               },
      //               required: ["old", "new"], // ✅ Kept inside `items`, not properties
      //             },
      //           },
      //           bullets: {
      //             type: "array",
      //             description:
      //               "An array of modified bullet points from the resume",
      //             items: {
      //               type: "object",
      //               properties: {
      //                 old: {
      //                   type: "string",
      //                   description: "The original bullet point from the resume.",
      //                 },
      //                 new: {
      //                   type: "string",
      //                   description:
      //                     "The updated bullet point, rewritten to align with the job description.",
      //                 },
      //               },
      //               required: ["old", "new"], // ✅ Kept inside `items`, not properties
      //             },
      //           },
      //         },
      //         required: ["technical_skills", "bullets"], // ✅ Moved `required` to the **root object**
      //       },
      //     },
      //   },
    },
    {
      headers: {
        Authorization: `Bearer ${OPEN_ROUTER_API_KEY}`,
      },
    }
  );
}

module.exports = { getAIResumeSuggestions, getFormattedPrompt, extractJSON };
