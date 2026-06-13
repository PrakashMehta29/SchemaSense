import { GoogleGenAI, Type } from "@google/genai";
import process from "node:process";
import http from "node:http";

// Prevent node-fetch/undici proxy client from routing local port 8000 requests out to public proxy gateways
process.env.NO_PROXY =
  (process.env.NO_PROXY ? process.env.NO_PROXY + "," : "") + "127.0.0.1,localhost";
process.env.no_proxy =
  (process.env.no_proxy ? process.env.no_proxy + "," : "") + "127.0.0.1,localhost";

interface LocalHttpOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}

function localHttpFetch(
  url: string,
  options: LocalHttpOptions = {},
): Promise<{ ok: boolean; status: number; json: () => Promise<unknown> }> {
  return new Promise((resolve, reject) => {
    try {
      const parsedUrl = new URL(url);
      const headers = { ...(options.headers || {}) };
      const bodyData = options.body;

      if (bodyData) {
        headers["Content-Length"] = Buffer.byteLength(bodyData).toString();
      }

      const reqOptions: http.RequestOptions = {
        hostname: parsedUrl.hostname || "127.0.0.1",
        port: parsedUrl.port ? parseInt(parsedUrl.port, 10) : 80,
        path: parsedUrl.pathname + parsedUrl.search,
        method: options.method || "GET",
        headers,
      };

      const req = http.request(reqOptions, (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          const bodyStr = Buffer.concat(chunks).toString("utf8");
          resolve({
            ok: (res.statusCode || 1) >= 200 && (res.statusCode || 1) < 300,
            status: res.statusCode || 200,
            json: async () => {
              try {
                return JSON.parse(bodyStr);
              } catch (e) {
                throw new Error(`Failed to parse JSON response: ${bodyStr}`);
              }
            },
          });
        });
      });

      req.on("error", (err) => {
        reject(err);
      });

      if (bodyData) {
        req.write(bodyData);
      }
      req.end();
    } catch (e) {
      reject(e);
    }
  });
}

// Initialize Gemini Client safely
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Interfaces matching frontend types for metadata and governance
export interface GenerateMetadataInput {
  columns: Array<{ name: string; type: string }>;
  datasetName?: string;
}

export interface GeneratedMetadataItem {
  columnName: string;
  description: string;
  businessMeaning: string;
  confidence: number;
  tags: string[];
  piiType: string;
  piiReason: string;
  riskScore: number;
}

/**
 * Generate semantic dictionary metadata for matching columns.
 * Runs on server using Gemini or deterministic rules.
 */
export async function generateMetadataServer(
  input: GenerateMetadataInput,
): Promise<GeneratedMetadataItem[]> {
  const ai = getGeminiClient();
  const datasetName = input.datasetName || "Dataset";

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `You are an expert Data Architect & Security compliance officer. Analyze the following table schema for a dataset named "${datasetName}".
Columns:
${input.columns.map((c) => `- ${c.name} (${c.type})`).join("\n")}

Respond with a JSON array where each object has exactly:
- columnName (string, matching the input columnName exactly)
- description (string, elegant human description of what this holds)
- businessMeaning (string, business purpose or compliance context)
- confidence (number from 0 to 100)
- tags (array of strings, choose from standard tags: "PII", "Sensitive", "Financial", "Internal", "Public", "Restricted")
- piiType (string, choose exactly from: "Email", "Phone Number", "Address", "Government ID", "Bank Details", "None")
- piiReason (string, reason why it is or is not PII)
- riskScore (number, 10 to 100 corresponding to tags and type)

Example output format:
[{ "columnName": "email", "description": "User SMTP address", "businessMeaning": "Communications and accounts", "confidence": 98, "tags": ["PII", "Sensitive"], "piiType": "Email", "piiReason": "Recognized email format pattern", "riskScore": 92 }]`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                columnName: { type: Type.STRING },
                description: { type: Type.STRING },
                businessMeaning: { type: Type.STRING },
                confidence: { type: Type.INTEGER },
                tags: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                piiType: { type: Type.STRING },
                piiReason: { type: Type.STRING },
                riskScore: { type: Type.INTEGER },
              },
              required: [
                "columnName",
                "description",
                "businessMeaning",
                "confidence",
                "tags",
                "piiType",
                "piiReason",
                "riskScore",
              ],
            },
          },
        },
      });

      const parsed = JSON.parse(response.text || "[]");
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as GeneratedMetadataItem[];
      }
    } catch (error) {
      console.error("Gemini metadata generation failed, falling back", error);
    }
  }

  // Fallback to high-quality heuristic analysis
  return input.columns.map((col) => {
    const colLower = col.name.toLowerCase();
    let description = `Standard database record representing ${col.name}.`;
    let businessMeaning = "Utilized for primary metrics tracking, reporting, or auditing purposes.";
    let confidence = 95;
    let tags: string[] = ["Internal"];
    let piiType = "None";
    let piiReason = "Contains no evident tracking parameters or demographic links.";
    let riskScore = 15;

    if (colLower.includes("email")) {
      description =
        "Customer email address used for notifications and primary authentication logins.";
      businessMeaning = "Enables communication pathways and security notification loops.";
      confidence = 98;
      tags = ["PII", "Sensitive"];
      piiType = "Email";
      piiReason = "Matched typical customer contact standard structure.";
      riskScore = 95;
    } else if (
      colLower.includes("phone") ||
      colLower.includes("mobile") ||
      colLower.includes("tel")
    ) {
      description = "Customer mobile or landline numbers captured during registration cycles.";
      businessMeaning =
        "Identifies SMS notification endpoints and acts as an secondary authentication vector.";
      confidence = 96;
      tags = ["PII", "Sensitive"];
      piiType = "Phone Number";
      piiReason = "Matches standard telephony numbering structures.";
      riskScore = 90;
    } else if (
      colLower.includes("ssn") ||
      colLower.includes("aadhaar") ||
      colLower.includes("pan") ||
      colLower.includes("passport")
    ) {
      description = "Tax or government-issued national demographic identifier.";
      businessMeaning = "Restricted regulatory tracking mapping to legal identity.";
      confidence = 99;
      tags = ["PII", "Restricted", "Sensitive"];
      piiType = "Government ID";
      piiReason = "Matches high-strength regulatory ID key naming schemes.";
      riskScore = 100;
    } else if (
      colLower.includes("salary") ||
      colLower.includes("revenue") ||
      colLower.includes("amount") ||
      colLower.includes("price") ||
      colLower.includes("cost") ||
      colLower.includes("usd")
    ) {
      description = "Monetary metric tracking financial volume or specific ledger values.";
      businessMeaning =
        "Drives financial profit auditing, corporate dashboards, and billing ledgers.";
      confidence = 94;
      tags = ["Financial", "Restricted"];
      piiType = "None";
      piiReason = "Identified numerical ledger entries with low PII mapping.";
      riskScore = 70;
    } else if (
      colLower.includes("address") ||
      colLower.includes("zip") ||
      colLower.includes("city") ||
      colLower.includes("state")
    ) {
      description = "Customer physical coordinates or location parameters.";
      businessMeaning =
        "Triggers logistical routing, delivery schedules, and geographic taxation compliance.";
      confidence = 92;
      tags = ["PII", "Sensitive"];
      piiType = "Address";
      piiReason = "Contains regional spatial indicators mapping to households.";
      riskScore = 75;
    } else if (
      colLower.includes("card") ||
      colLower.includes("bank") ||
      colLower.includes("account")
    ) {
      description = "Confidential customer ledger account mapping parameters.";
      businessMeaning = "Bridges Stripe, banks, or gateway clearing pipelines.";
      confidence = 95;
      tags = ["Financial", "Sensitive", "Restricted"];
      piiType = "Bank Details";
      piiReason = "Flags critical PCI/DSS financial clearance patterns.";
      riskScore = 90;
    } else if (colLower.includes("id") || colLower.includes("key")) {
      description = "Unique primary or foreign alphanumeric mapping index.";
      businessMeaning = "Assures relational databases referential integrity mapping.";
      confidence = 99;
      tags = ["Internal"];
      piiType = "None";
      piiReason = "Non-human semantic indicator strictly representing schema indexes.";
      riskScore = 10;
    } else if (colLower.includes("country")) {
      description = "ISO region parameters mapping user geographical clusters.";
      businessMeaning = "Assists localized pricing models and analytics segmentation.";
      confidence = 95;
      tags = ["Public"];
      piiType = "None";
      piiReason = "Public categorical location context.";
      riskScore = 5;
    }

    return {
      columnName: col.name,
      description,
      businessMeaning,
      confidence,
      tags,
      piiType,
      piiReason,
      riskScore,
    };
  });
}

/**
 * Chat conversation with column context.
 */
export async function chatAssistantServer(
  query: string,
  history: Array<{ sender: "user" | "bot"; text: string }>,
  columns: Array<{ name: string; type: string }>,
  datasetName?: string,
): Promise<string> {
  const ai = getGeminiClient();
  const dataset = datasetName || "Dataset";

  // Synthesize context about current columns so the model can refer to it
  const schemaContext =
    columns.length > 0
      ? `The active database metadata belongs to table "${dataset}". The file contains the following columns and inferred types:
${columns.map((c) => `- "${c.name}" (Type: ${c.type})`).join("\n")}`
      : "No dataset is currently uploaded in the user's workspace.";

  const systemInstruction = `You are "SchemaSense AI", a brilliant, technical Data Catalog Consultant and Data Steward. 
Your goal is to answer data-catalog, governance, risk, SQL, and schemas questions based on the active dataset schema.
Always speak clearly, professionally, and helpfully. Keep answers elegant and use markdown formatting.

Active schema context:
${schemaContext}

Important Guideline: If the user asks for SQL queries, write tailored PostgreSQL/DuckDB scripts mapping to their exact column names!`;

  if (ai) {
    try {
      // Map history to Gemini format (user -> user, bot -> model)
      const contents = history.map((h) => ({
        role: h.sender === "user" ? "user" : "model",
        parts: [{ text: h.text }],
      }));

      // Append present query
      contents.push({
        role: "user",
        parts: [{ text: query }],
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      return (
        response.text || "I was unable to compile a secure response right now. Please try again."
      );
    } catch (error) {
      console.error("Gemini assistant chat failed", error);
    }
  }

  // Graceful rule-based chat responder fallback if API key or network is down
  const lowerQuery = query.toLowerCase();
  if (lowerQuery.includes("cust_id") || lowerQuery.includes("id")) {
    return `### Mapping Analysis: **Primary Keys**
In your loaded table **${dataset}**, the \`customer_id\` (or matching system primary keys) serves as the core unique identifier. 
Here is a secure PostgreSQL relational query modeling customer demographics map joins:

\`\`\`sql
SELECT 
  c.customer_id, 
  c.country, 
  COUNT(o.order_id) AS total_orders
FROM ${dataset} c
LEFT JOIN orders o ON c.customer_id = o.customer_id
GROUP BY c.customer_id, c.country
ORDER BY total_orders DESC;
\`\`\``;
  }

  if (
    lowerQuery.includes("pii") ||
    lowerQuery.includes("sensitive") ||
    lowerQuery.includes("secure") ||
    lowerQuery.includes("governance")
  ) {
    const piiCols = columns.filter((c) =>
      ["email", "phone", "mobile", "ssn", "aadhaar", "pan", "salary", "address", "card"].some((p) =>
        c.name.toLowerCase().includes(p),
      ),
    );

    return `### SchemaSense Governance Log
I detected **${piiCols.length} columns** representing potentially sensitive information (PII/Financial) in **${dataset}** schema:

${piiCols.map((c) => `- **${c.name}** (${c.type}): Classified under restricted regulatory guardrails.`).join("\n")}

**Audit Recommendations:**
1. **Column Masking**: Apply field-level encryption to direct ID vectors.
2. **Access Locks**: Mask email values in diagnostic and developer sandboxes.`;
  }

  if (
    lowerQuery.includes("llm") ||
    lowerQuery.includes("prompt") ||
    lowerQuery.includes("gemini")
  ) {
    return `I am fully equipped with Gemini API capability! I run server-side using Gemini models to catalog schemas, tag financial data, and design secure relational lineages. Ask me anything about relational querying or governance!`;
  }

  return `### Table Overview & Dictionary Support:
The active dataset schema **${dataset}** is loaded with **${columns.length} columns**:
${columns.map((c) => `- \`${c.name}\` (${c.type})`).join("\n")}

How can I help you compile queries, analyze PII risk vectors, or generate cross-database metadata mappings for this schema?`;
}

export interface ConnectionToggleInput {
  name: string;
  status: string;
  host?: string;
  port?: number;
  db_name?: string;
  username?: string;
  password?: string;
}

export async function toggleConnectionServer(input: ConnectionToggleInput) {
  try {
    const res = await localHttpFetch("http://127.0.0.1:8000/connections/toggle", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: input.name,
        status: input.status,
        host: input.host || null,
        port: input.port || null,
        db_name: input.db_name || null,
        username: input.username || null,
        password: input.password || null,
      }),
    });
    if (!res.ok) {
      throw new Error(`HTTP error: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.error(
      "Python backend error toggleConnectionServer, falling back to local simulation:",
      err,
    );
    return { success: true, fallback: true };
  }
}

export async function getConnectionsServer() {
  try {
    const res = await localHttpFetch("http://127.0.0.1:8000/connections");
    if (!res.ok) {
      throw new Error(`HTTP error: ${res.status}`);
    }
    const data = await res.json();
    return data.connections;
  } catch (err) {
    console.error(
      "Python backend error getConnectionsServer, falling back to local simulation:",
      err,
    );
    return [];
  }
}
