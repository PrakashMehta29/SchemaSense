import { MOCK_RESPONSES, MockAIResponse } from "./mockResponses";

// Keep track of the last column/metric queried in memory for multi-turn context
let lastMentionedColumn: string | null = null;

export const setLastMentionedColumn = (col: string | null) => {
  lastMentionedColumn = col;
};

export const getLastMentionedColumn = () => {
  return lastMentionedColumn;
};

export interface ThinkingStage {
  label: string;
  status: "pending" | "thinking" | "completed";
}

export const THINKING_STAGES: string[] = [
  "Retrieving metadata schemas",
  "Checking lineage relationships",
  "Evaluating quality constraints",
  "Synthesizing context explanation",
];

export function determineResponseKey(prompt: string): string {
  const query = prompt.toLowerCase();

  // 1. Identify direct matching fields
  if (query.includes("customer_id") || query.includes("cust_id") || query.includes("customer id")) {
    lastMentionedColumn = "customer_id";
    return "customer_id";
  }
  if (query.includes("revenue_usd") || query.includes("revenue") || query.includes("sales")) {
    lastMentionedColumn = "revenue_usd";
    return "revenue_usd";
  }
  if (query.includes("pii") || query.includes("gdpr") || query.includes("sensitive")) {
    lastMentionedColumn = "pii";
    return "pii";
  }
  if (query.includes("lineage") || query.includes("relationship") || query.includes("flow")) {
    lastMentionedColumn = "relationships";
    return "relationships";
  }
  if (query.includes("dashboard") || query.includes("executive")) {
    lastMentionedColumn = "executive_dashboard";
    return "executive_dashboard";
  }

  // 2. Pronoun reference memory mapping ("it", "where is it used?", "explain it")
  if (
    query.includes("it") ||
    query.includes("this") ||
    query.includes("that") ||
    query.includes("where is it")
  ) {
    if (lastMentionedColumn) {
      return lastMentionedColumn;
    }
  }

  return "default";
}

export function simulateAIService(
  prompt: string,
  onStageUpdate: (stages: ThinkingStage[]) => void,
  onToken: (text: string) => void,
  onComplete: (response: MockAIResponse) => void,
) {
  const responseKey = determineResponseKey(prompt);
  const response = MOCK_RESPONSES[responseKey] || MOCK_RESPONSES.default;

  // Initial Thinking stages simulation
  const stages: ThinkingStage[] = THINKING_STAGES.map((label) => ({ label, status: "pending" }));
  onStageUpdate([...stages]);

  let currentStageIndex = 0;

  const thinkingInterval = setInterval(() => {
    if (currentStageIndex < stages.length) {
      // Complete previous stage
      if (currentStageIndex > 0) {
        stages[currentStageIndex - 1].status = "completed";
      }
      // Start current stage
      stages[currentStageIndex].status = "thinking";
      onStageUpdate([...stages]);
      currentStageIndex += 1;
    } else {
      // Complete last stage
      stages[stages.length - 1].status = "completed";
      onStageUpdate([...stages]);
      clearInterval(thinkingInterval);

      // Start response streaming
      startStreaming();
    }
  }, 500); // 500ms per thinking step

  const startStreaming = () => {
    const tokens = response.answer.split(" ");
    let currentTokenIndex = 0;
    let accumulatedText = "";

    const streamingInterval = setInterval(() => {
      if (currentTokenIndex < tokens.length) {
        accumulatedText += (currentTokenIndex === 0 ? "" : " ") + tokens[currentTokenIndex];
        onToken(accumulatedText);
        currentTokenIndex += 1;
      } else {
        clearInterval(streamingInterval);
        onComplete(response);
      }
    }, 45); // ~45ms per word/token
  };
}
