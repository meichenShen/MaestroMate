// Shared public contract. Credentials and provider URLs belong only in worker/.
export const chatModels = [
  { id: "qwen3.7-plus-2026-05-26", label: "Qwen Plus" },
  { id: "qwen3.6-flash-2026-04-16", label: "Qwen Flash" },
] as const;
export type ChatModelId = (typeof chatModels)[number]["id"];
export type ReplyKind = "fact" | "listening" | "unknown";
export interface ChatReply {
  answer: string;
  sourceIds: string[];
  kind: ReplyKind;
  mode: "ai" | "guidance";
}
export interface ChatHistoryItem {
  role: "user" | "assistant";
  content: string;
}
export interface ChatConfig {
  enabled: boolean;
  models: { id: string; label: string }[];
}
