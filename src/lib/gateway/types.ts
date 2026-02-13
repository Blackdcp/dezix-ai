// OpenAI-compatible request/response types for the API Gateway

export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  name?: string;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
}

export interface ToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  stream?: boolean;
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string | string[];
  n?: number;
  tools?: Tool[];
  tool_choice?: string | { type: string; function?: { name: string } };
}

export interface Tool {
  type: "function";
  function: {
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
  };
}

export interface ChatCompletionResponse {
  id: string;
  object: "chat.completion";
  created: number;
  model: string;
  choices: ChatCompletionChoice[];
  usage: UsageInfo;
}

export interface ChatCompletionChoice {
  index: number;
  message: ChatMessage;
  finish_reason: string | null;
}

export interface UsageInfo {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

// Streaming types
export interface ChatCompletionChunk {
  id: string;
  object: "chat.completion.chunk";
  created: number;
  model: string;
  choices: ChatCompletionChunkChoice[];
  usage?: UsageInfo | null;
}

export interface ChatCompletionChunkChoice {
  index: number;
  delta: Partial<ChatMessage>;
  finish_reason: string | null;
}

// Models list response
export interface ModelsListResponse {
  object: "list";
  data: ModelObject[];
}

export interface ModelObject {
  id: string;
  object: "model";
  created: number;
  owned_by: string;
}

// Internal gateway context passed through the pipeline
export interface GatewayContext {
  requestId: string;
  startTime: number;
  apiKey: {
    id: string;
    userId: string;
    rateLimit: number | null;
  };
  user: {
    id: string;
    balance: number;
  };
  model: {
    id: string;
    modelId: string;
    sellPrice: number;   // per 1K input tokens
    sellOutPrice: number; // per 1K output tokens
  };
  channel?: {
    id: string;
    providerId: string;
    providerName: string;
    apiKey: string;
    baseUrl: string;
  };
  requestIp?: string;
}
