import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  generateMetadataServer,
  chatAssistantServer,
  toggleConnectionServer,
  getConnectionsServer,
} from "./schemaSense.server";

// Schema for metadata validator
const ColumnSchema = z.object({
  name: z.string(),
  type: z.string(),
});

// 1. Server Function: Generate Metadata
export const generateMetadataFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      columns: z.array(ColumnSchema),
      datasetName: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    try {
      const results = await generateMetadataServer(data);
      return { success: true, results };
    } catch (err: unknown) {
      console.error("Error in generateMetadataFn:", err);
      const errMsg = err instanceof Error ? err.message : String(err);
      return { success: false, error: errMsg };
    }
  });

// 2. Server Function: Chat Assistant
export const chatAssistantFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      query: z.string(),
      history: z.array(
        z.object({
          sender: z.enum(["user", "bot"]),
          text: z.string(),
        }),
      ),
      columns: z.array(ColumnSchema),
      datasetName: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    try {
      const reply = await chatAssistantServer(
        data.query,
        data.history,
        data.columns,
        data.datasetName,
      );
      return { success: true, reply };
    } catch (err: unknown) {
      console.error("Error in chatAssistantFn:", err);
      const errMsg = err instanceof Error ? err.message : String(err);
      return { success: false, error: errMsg };
    }
  });

// 3. Server Function: Toggle Connection
export const toggleConnectionFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      name: z.string(),
      status: z.string(),
      host: z.string().optional(),
      port: z.number().optional(),
      db_name: z.string().optional(),
      username: z.string().optional(),
      password: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    try {
      const result = await toggleConnectionServer(data);
      return { success: true, result };
    } catch (err: unknown) {
      console.error("Error in toggleConnectionFn:", err);
      const errMsg = err instanceof Error ? err.message : String(err);
      return { success: false, error: errMsg };
    }
  });

// 4. Server Function: Get Connections
export const getConnectionsFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const connections = await getConnectionsServer();
    return { success: true, connections };
  } catch (err: unknown) {
    console.error("Error in getConnectionsFn:", err);
    const errMsg = err instanceof Error ? err.message : String(err);
    return { success: false, error: errMsg };
  }
});
