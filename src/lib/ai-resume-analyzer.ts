/**
 * AI-powered resume analyzer for extracting data from screenshots
 * This module uses vision AI to parse resume screenshots and extract structured data
 */


// Types for extracted resume data
export interface ParsedResumeData {
  basics?: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    website?: string;
    linkedin?: string;
    github?: string;
  };
  summary?: string;
  work?: Array<{
    company?: string;
    position?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  }>;
  education?: Array<{
    institution?: string;
    degree?: string;
    field?: string;
    startDate?: string;
    endDate?: string;
    gpa?: string;
  }>;
  skills?: string[];
  projects?: Array<{
    name?: string;
    description?: string;
    url?: string;
  }>;
  certifications?: Array<{
    name?: string;
    issuer?: string;
    date?: string;
  }>;
  languages?: Array<{
    language?: string;
    proficiency?: string;
  }>;
}

/**
 * Extract resume data from an image using AI vision
 */
export async function analyzeResumeScreenshot(
  imageUrl: string,
  aiApiKey?: string
): Promise<ParsedResumeData> {
  try {
    // Use AI vision to analyze the screenshot
    const prompt = `You are an expert resume parser. Analyze this resume screenshot and extract all the information in a structured JSON format.

Return ONLY a valid JSON object with this exact structure:
{
  "basics": {
    "name": "full name",
    "email": "email address",
    "phone": "phone number",
    "location": "city, country",
    "website": "personal website",
    "linkedin": "linkedin url",
    "github": "github url"
  },
  "summary": "professional summary",
  "work": [
    {
      "company": "company name",
      "position": "job title",
      "startDate": "MM/YYYY or present",
      "endDate": "MM/YYYY or present",
      "description": "job description"
    }
  ],
  "education": [
    {
      "institution": "university name",
      "degree": "degree type",
      "field": "field of study",
      "startDate": "MM/YYYY",
      "endDate": "MM/YYYY",
      "gpa": "GPA if present"
    }
  ],
  "skills": ["skill1", "skill2", ...],
  "projects": [
    {
      "name": "project name",
      "description": "project description",
      "url": "project url"
    }
  ],
  "certifications": [
    {
      "name": "certification name",
      "issuer": "issuing organization",
      "date": "date obtained"
    }
  ],
  "languages": [
    {
      "language": "language name",
      "proficiency": "proficiency level"
    }
  ]
}

Important rules:
- Return ONLY the JSON, no additional text
- If a field is not found, use null or empty string/array
- Dates should be in MM/YYYY format when possible
- Extract all work experience entries in chronological order
- Extract all skills as individual items in an array
- For descriptions, preserve the full text
- If the resume is in Spanish, still return the field names in English but translate the content to English if needed`;

    // Make the API call to analyze the image
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": aiApiKey || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3.5-sonnet-20241022",
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "url",
                  url: imageUrl,
                },
              },
              {
                type: "text",
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`AI API error: ${error}`);
    }

    const data = await response.json();
    const content = data.content[0]?.text || "{}";

    // Extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not extract JSON from AI response");
    }

    const parsedData = JSON.parse(jsonMatch[0]);
    return parsedData as ParsedResumeData;
  } catch (error) {
    console.error("Error analyzing resume screenshot:", error);
    throw error;
  }
}

/**
 * Detect resume style from screenshot for style suggestions
 */
export async function detectResumeStyle(
  imageUrl: string,
  aiApiKey?: string
): Promise<{
  suggestedCategory: string;
  colorScheme: string;
  layout: string;
  confidence: number;
}> {
  try {
    const prompt = `Analyze this resume screenshot and identify its style characteristics. Return a JSON object with:

{
  "suggestedCategory": "one of: minimal, modern, classic, creative, professional, tech, academic",
  "colorScheme": "dominant color(s) observed (hex codes if possible)",
  "layout": "one of: single-column, two-column, sidebar-left, sidebar-right",
  "confidence": 0-100 score of how confident you are in this classification
}

Return ONLY the JSON, no additional text.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": aiApiKey || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3.5-sonnet-20241022",
        max_tokens: 500,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "url",
                  url: imageUrl,
                },
              },
              {
                type: "text",
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error("Style detection API error");
    }

    const data = await response.json();
    const content = data.content[0]?.text || "{}";

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not extract JSON from style detection");
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Error detecting resume style:", error);
    // Return defaults on error
    return {
      suggestedCategory: "modern",
      colorScheme: "#2563eb",
      layout: "single-column",
      confidence: 50,
    };
  }
}
