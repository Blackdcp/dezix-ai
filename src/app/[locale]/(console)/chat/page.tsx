"use client";

import { Suspense, useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  Trash2,
  Send,
  Square,
  Loader2,
  MessageSquare,
  Bot,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { MarkdownRenderer } from "@/components/chat/markdown-renderer";

// ---------- Types ----------

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
}

interface ModelOption {
  id: string;
  modelId: string;
  displayName: string;
}

// ---------- localStorage helpers ----------

const STORAGE_CONVOS = "dezix-chat-conversations";
const STORAGE_APIKEY = "dezix-chat-apikey";
const STORAGE_MODEL = "dezix-chat-model";
const MAX_CONVERSATIONS = 50;
const MAX_MESSAGES = 100;

function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_CONVOS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveConversations(convos: Conversation[]) {
  localStorage.setItem(
    STORAGE_CONVOS,
    JSON.stringify(convos.slice(0, MAX_CONVERSATIONS))
  );
}

function newId() {
  return `conv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ---------- Component ----------

export default function ChatPage() {
  return (
    <Suspense>
      <ChatPageInner />
    </Suspense>
  );
}

function ChatPageInner() {
  const t = useTranslations("Chat");
  const searchParams = useSearchParams();
  const queryModel = searchParams.get("model") || "";

  // State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [models, setModels] = useState<ModelOption[]>([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamContent, setStreamContent] = useState("");

  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeConvo = conversations.find((c) => c.id === activeId) || null;

  // Initialize from localStorage
  useEffect(() => {
    const convos = loadConversations();
    setConversations(convos);
    if (convos.length > 0) setActiveId(convos[0].id);

    const savedKey = localStorage.getItem(STORAGE_APIKEY) || "";
    const savedModel = localStorage.getItem(STORAGE_MODEL) || "";
    setApiKey(savedKey);
    if (savedModel) setSelectedModel(savedModel);
  }, []);

  // Load models
  useEffect(() => {
    fetch("/api/console/models")
      .then((r) => r.json())
      .then((data) => {
        const active = (data.models || []).filter(
          (m: ModelOption & { isActive: boolean }) => m.isActive
        );
        setModels(active);
        setSelectedModel((prev) => {
          // Prefer query param model if available
          if (queryModel && active.some((m: ModelOption) => m.modelId === queryModel))
            return queryModel;
          if (prev && active.some((m: ModelOption) => m.modelId === prev))
            return prev;
          return active.length > 0 ? active[0].modelId : "";
        });
      })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist apiKey and model
  useEffect(() => {
    localStorage.setItem(STORAGE_APIKEY, apiKey);
  }, [apiKey]);

  useEffect(() => {
    if (selectedModel) localStorage.setItem(STORAGE_MODEL, selectedModel);
  }, [selectedModel]);

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeConvo?.messages, streamContent]);

  // ---------- Conversation CRUD ----------

  const updateConversations = useCallback(
    (updater: (prev: Conversation[]) => Conversation[]) => {
      setConversations((prev) => {
        const next = updater(prev);
        saveConversations(next);
        return next;
      });
    },
    []
  );

  const handleNewConversation = () => {
    const convo: Conversation = {
      id: newId(),
      title: t("newChat"),
      messages: [],
      createdAt: Date.now(),
    };
    updateConversations((prev) => [convo, ...prev]);
    setActiveId(convo.id);
    setInput("");
  };

  const handleDeleteConversation = (id: string) => {
    updateConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeId === id) {
      setActiveId(() => {
        const remaining = conversations.filter((c) => c.id !== id);
        return remaining.length > 0 ? remaining[0].id : null;
      });
    }
  };

  const handleSwitchConversation = (id: string) => {
    setActiveId(id);
    setInput("");
  };

  // ---------- Send message ----------

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text) return;
    if (!apiKey.trim()) {
      toast.error(t("apiKeyRequired"));
      return;
    }
    if (!selectedModel) {
      toast.error(t("modelRequired"));
      return;
    }

    // If no active conversation, create one
    let convoId = activeId;
    if (!convoId) {
      const convo: Conversation = {
        id: newId(),
        title: text.slice(0, 20),
        messages: [],
        createdAt: Date.now(),
      };
      updateConversations((prev) => [convo, ...prev]);
      convoId = convo.id;
      setActiveId(convo.id);
    }

    // Add user message
    const userMessage: ChatMessage = { role: "user", content: text };
    updateConversations((prev) =>
      prev.map((c) => {
        if (c.id !== convoId) return c;
        const msgs = [...c.messages, userMessage].slice(-MAX_MESSAGES);
        const title =
          c.messages.length === 0 ? text.slice(0, 20) : c.title;
        return { ...c, messages: msgs, title };
      })
    );
    setInput("");

    // Build full messages array for API
    const currentConvo = conversations.find((c) => c.id === convoId);
    const history: ChatMessage[] = currentConvo
      ? [...currentConvo.messages, userMessage]
      : [userMessage];

    // Start streaming
    setStreaming(true);
    setStreamContent("");
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: history.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          stream: true,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const err = await res
          .json()
          .catch(() => ({ error: { message: t("requestFailed") } }));
        throw new Error(err.error?.message || `HTTP ${res.status}`);
      }

      let fullContent = "";

      if (res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith("data:")) continue;
            const data = trimmed.slice(5).trim();
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                fullContent += delta;
                setStreamContent(fullContent);
              }
            } catch {
              // skip
            }
          }
        }
      }

      // Add assistant message to conversation
      if (fullContent) {
        const finalConvoId = convoId;
        updateConversations((prev) =>
          prev.map((c) => {
            if (c.id !== finalConvoId) return c;
            return {
              ...c,
              messages: [
                ...c.messages,
                { role: "assistant" as const, content: fullContent },
              ].slice(-MAX_MESSAGES),
            };
          })
        );
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        toast.error((err as Error).message || t("requestFailed"));
        // Add error message
        const finalConvoId = convoId;
        updateConversations((prev) =>
          prev.map((c) => {
            if (c.id !== finalConvoId) return c;
            return {
              ...c,
              messages: [
                ...c.messages,
                {
                  role: "assistant" as const,
                  content: t("errorPrefix", { message: (err as Error).message }),
                },
              ].slice(-MAX_MESSAGES),
            };
          })
        );
      }
    } finally {
      setStreaming(false);
      setStreamContent("");
      abortRef.current = null;
    }
  }, [
    input,
    apiKey,
    selectedModel,
    activeId,
    conversations,
    updateConversations,
    t,
  ]);

  const handleStop = () => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setStreaming(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ---------- Render ----------

  return (
    <div className="-m-6 flex h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Left: Conversation List */}
      <div className="flex w-64 shrink-0 flex-col border-r bg-muted/30">
        <div className="border-b p-3">
          <Button
            className="w-full"
            variant="outline"
            size="sm"
            onClick={handleNewConversation}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("newChat")}
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="space-y-1 p-2">
            {conversations.length === 0 ? (
              <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                {t("noChatHistory")}
              </div>
            ) : (
              conversations.map((c) => (
                <div
                  key={c.id}
                  className={`group flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                    c.id === activeId
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                  onClick={() => handleSwitchConversation(c.id)}
                >
                  <MessageSquare className="h-4 w-4 shrink-0" />
                  <span className="flex-1 truncate">{c.title}</span>
                  <button
                    className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteConversation(c.id);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Right: Main Chat Area */}
      <div className="flex flex-1 flex-col">
        {/* Top Config Bar */}
        <div className="flex items-center gap-4 border-b px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{t("model")}</span>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t("selectModel")} />
              </SelectTrigger>
              <SelectContent>
                {models.map((m) => (
                  <SelectItem key={m.modelId} value={m.modelId}>
                    {m.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">API Key</span>
            <Input
              type="password"
              placeholder="sk-dezix-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-[240px]"
            />
          </div>
        </div>

        {/* Message Flow */}
        <ScrollArea className="flex-1" ref={scrollRef}>
          <div className="mx-auto max-w-3xl space-y-4 p-6">
            {!activeConvo || activeConvo.messages.length === 0 ? (
              !streaming && (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <Bot className="mb-4 h-12 w-12" />
                  <p className="text-lg font-medium">{t("startNewChat")}</p>
                  <p className="text-sm">{t("startNewChatDesc")}</p>
                </div>
              )
            ) : (
              activeConvo.messages.map((msg, i) => (
                <div
                  key={`${activeConvo.id}-${i}`}
                  className={`flex gap-3 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <MarkdownRenderer content={msg.content} />
                    ) : (
                      <div className="whitespace-pre-wrap text-sm">
                        {msg.content}
                      </div>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))
            )}

            {/* Streaming content */}
            {streaming && (
              <div className="flex gap-3 justify-start">
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="max-w-[80%] rounded-lg bg-muted px-4 py-3">
                  {streamContent ? (
                    <>
                      <MarkdownRenderer content={streamContent} />
                      <span className="inline-block h-4 w-1 animate-pulse bg-foreground" />
                    </>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("thinking")}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Bottom Input */}
        <div className="border-t p-4">
          <div className="mx-auto flex max-w-3xl gap-3">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("inputPlaceholder")}
              rows={1}
              className="min-h-[44px] max-h-[200px] resize-none"
            />
            {streaming ? (
              <Button
                variant="destructive"
                size="icon"
                className="shrink-0"
                onClick={handleStop}
              >
                <Square className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                size="icon"
                className="shrink-0"
                onClick={handleSend}
                disabled={!input.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
