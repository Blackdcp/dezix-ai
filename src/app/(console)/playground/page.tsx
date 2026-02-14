"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  Send,
  Copy,
  Check,
  Square,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface ModelOption {
  id: string;
  modelId: string;
  displayName: string;
  isActive: boolean;
}

interface Message {
  id: string;
  role: "system" | "user" | "assistant";
  content: string;
}

interface UsageInfo {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

let msgCounter = 0;
function newMsgId() {
  return `msg-${++msgCounter}`;
}

export default function PlaygroundPage() {
  // Model options
  const [models, setModels] = useState<ModelOption[]>([]);
  const [selectedModel, setSelectedModel] = useState("");

  // Messages
  const [messages, setMessages] = useState<Message[]>([
    { id: newMsgId(), role: "system", content: "You are a helpful assistant." },
    { id: newMsgId(), role: "user", content: "" },
  ]);

  // Parameters
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1024);
  const [topP, setTopP] = useState(1);
  const [stream, setStream] = useState(true);

  // API Key
  const [apiKey, setApiKey] = useState("");

  // Response state
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [duration, setDuration] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load models
  useEffect(() => {
    fetch("/api/console/models")
      .then((r) => r.json())
      .then((data) => {
        const active = data.models.filter((m: ModelOption) => m.isActive);
        setModels(active);
        if (active.length > 0 && !selectedModel) {
          setSelectedModel(active[0].modelId);
        }
      })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll response
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [response]);

  const addMessage = () => {
    setMessages((prev) => [
      ...prev,
      { id: newMsgId(), role: "user", content: "" },
    ]);
  };

  const removeMessage = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const updateMessage = (id: string, field: "role" | "content", value: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const handleStop = () => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setLoading(false);
  };

  const handleSend = useCallback(async () => {
    if (!apiKey.trim()) {
      toast.error("请输入 API Key");
      return;
    }
    if (!selectedModel) {
      toast.error("请选择模型");
      return;
    }

    const validMessages = messages.filter((m) => m.content.trim());
    if (validMessages.length === 0) {
      toast.error("请输入至少一条消息");
      return;
    }

    setResponse("");
    setUsage(null);
    setDuration(0);
    setLoading(true);

    const startTime = Date.now();
    const controller = new AbortController();
    abortRef.current = controller;

    const body = {
      model: selectedModel,
      messages: validMessages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature,
      max_tokens: maxTokens,
      top_p: topP,
      stream,
    };

    try {
      const res = await fetch("/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: { message: "请求失败" } }));
        throw new Error(err.error?.message || `HTTP ${res.status}`);
      }

      if (stream && res.body) {
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
                setResponse((prev) => prev + delta);
              }
              // Capture usage from final chunk if present
              if (parsed.usage) {
                setUsage({
                  promptTokens: parsed.usage.prompt_tokens || 0,
                  completionTokens: parsed.usage.completion_tokens || 0,
                  totalTokens: parsed.usage.total_tokens || 0,
                });
              }
            } catch {
              // skip malformed JSON
            }
          }
        }
      } else {
        // Non-streaming
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content || "";
        setResponse(content);
        if (data.usage) {
          setUsage({
            promptTokens: data.usage.prompt_tokens || 0,
            completionTokens: data.usage.completion_tokens || 0,
            totalTokens: data.usage.total_tokens || 0,
          });
        }
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        // User cancelled
      } else {
        toast.error((err as Error).message || "请求失败");
        setResponse(`错误: ${(err as Error).message}`);
      }
    } finally {
      setDuration(Date.now() - startTime);
      setLoading(false);
      abortRef.current = null;
    }
  }, [apiKey, selectedModel, messages, temperature, maxTokens, topP, stream]);

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    toast.success("已复制");
    setTimeout(() => setCopied(null), 2000);
  };

  // Code examples
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const curlExample = `curl ${baseUrl}/api/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${apiKey || "sk-dezix-your-key"}" \\
  -d '{
    "model": "${selectedModel || "gpt-4o"}",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ],
    "stream": ${stream}
  }'`;

  const pythonExample = `from openai import OpenAI

client = OpenAI(
    api_key="${apiKey || "sk-dezix-your-key"}",
    base_url="${baseUrl}/api/v1"
)

response = client.chat.completions.create(
    model="${selectedModel || "gpt-4o"}",
    messages=[
        {"role": "user", "content": "Hello!"}
    ],
    temperature=${temperature},
    max_tokens=${maxTokens},
    stream=${stream ? "True" : "False"}
)

${stream ? `for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")` : `print(response.choices[0].message.content)`}`;

  const nodeExample = `import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "${apiKey || "sk-dezix-your-key"}",
  baseURL: "${baseUrl}/api/v1",
});

const response = await client.chat.completions.create({
  model: "${selectedModel || "gpt-4o"}",
  messages: [
    { role: "user", content: "Hello!" },
  ],
  temperature: ${temperature},
  max_tokens: ${maxTokens},
  stream: ${stream},
});

${stream ? `for await (const chunk of response) {
  const content = chunk.choices[0]?.delta?.content;
  if (content) process.stdout.write(content);
}` : `console.log(response.choices[0].message.content);`}`;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Playground</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Request Builder */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">请求配置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Model Select */}
              <div className="grid gap-2">
                <Label>模型</Label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择模型" />
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

              {/* Messages */}
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label>消息</Label>
                  <Button variant="ghost" size="sm" onClick={addMessage}>
                    <Plus className="mr-1 h-3 w-3" />
                    添加
                  </Button>
                </div>
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div key={msg.id} className="flex gap-2">
                      <Select
                        value={msg.role}
                        onValueChange={(v) => updateMessage(msg.id, "role", v)}
                      >
                        <SelectTrigger className="w-[110px] shrink-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="system">system</SelectItem>
                          <SelectItem value="user">user</SelectItem>
                          <SelectItem value="assistant">assistant</SelectItem>
                        </SelectContent>
                      </Select>
                      <Textarea
                        value={msg.content}
                        onChange={(e) =>
                          updateMessage(msg.id, "content", e.target.value)
                        }
                        placeholder="输入消息内容..."
                        rows={2}
                        className="min-h-[60px]"
                      />
                      {messages.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0"
                          onClick={() => removeMessage(msg.id)}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Parameters */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Temperature: {temperature.toFixed(1)}</Label>
                  <Slider
                    value={[temperature]}
                    onValueChange={([v]) => setTemperature(v)}
                    min={0}
                    max={2}
                    step={0.1}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Top P: {topP.toFixed(1)}</Label>
                  <Slider
                    value={[topP]}
                    onValueChange={([v]) => setTopP(v)}
                    min={0}
                    max={1}
                    step={0.1}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="max-tokens">Max Tokens</Label>
                  <Input
                    id="max-tokens"
                    type="number"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(Number(e.target.value) || 1024)}
                    min={1}
                    max={128000}
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch checked={stream} onCheckedChange={setStream} />
                  <Label>流式输出</Label>
                </div>
              </div>

              {/* API Key */}
              <div className="grid gap-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="sk-dezix-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>

              {/* Send Button */}
              <div className="flex gap-2">
                {loading ? (
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleStop}
                  >
                    <Square className="mr-2 h-4 w-4" />
                    停止
                  </Button>
                ) : (
                  <Button className="w-full" onClick={handleSend}>
                    <Send className="mr-2 h-4 w-4" />
                    发送请求
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Response Viewer */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">响应结果</CardTitle>
              {response && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(response, "response")}
                >
                  {copied === "response" ? (
                    <Check className="mr-1 h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="mr-1 h-3 w-3" />
                  )}
                  复制
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-3">
            <ScrollArea className="flex-1 rounded-md border bg-muted/30 p-4" ref={scrollRef}>
              <div className="min-h-[300px] whitespace-pre-wrap text-sm">
                {loading && !response && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    等待响应...
                  </div>
                )}
                {response}
                {loading && response && (
                  <span className="inline-block h-4 w-1 animate-pulse bg-foreground" />
                )}
                {!loading && !response && (
                  <span className="text-muted-foreground">
                    发送请求后响应内容将显示在这里
                  </span>
                )}
              </div>
            </ScrollArea>

            {/* Usage Info */}
            {(usage || duration > 0) && (
              <div className="flex flex-wrap gap-2">
                {usage && (
                  <>
                    <Badge variant="outline">
                      输入: {usage.promptTokens} tokens
                    </Badge>
                    <Badge variant="outline">
                      输出: {usage.completionTokens} tokens
                    </Badge>
                    <Badge variant="outline">
                      总计: {usage.totalTokens} tokens
                    </Badge>
                  </>
                )}
                {duration > 0 && (
                  <Badge variant="outline">
                    耗时: {(duration / 1000).toFixed(2)}s
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Code Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">代码示例</CardTitle>
          <CardDescription>
            复制以下代码集成到你的应用中
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="curl">
            <TabsList>
              <TabsTrigger value="curl">cURL</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
              <TabsTrigger value="nodejs">Node.js</TabsTrigger>
            </TabsList>
            <TabsContent value="curl">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2"
                  onClick={() => handleCopy(curlExample, "curl")}
                >
                  {copied === "curl" ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <pre className="overflow-x-auto rounded-md border bg-muted p-4 text-sm">
                  <code>{curlExample}</code>
                </pre>
              </div>
            </TabsContent>
            <TabsContent value="python">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2"
                  onClick={() => handleCopy(pythonExample, "python")}
                >
                  {copied === "python" ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <pre className="overflow-x-auto rounded-md border bg-muted p-4 text-sm">
                  <code>{pythonExample}</code>
                </pre>
              </div>
            </TabsContent>
            <TabsContent value="nodejs">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2"
                  onClick={() => handleCopy(nodeExample, "nodejs")}
                >
                  {copied === "nodejs" ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <pre className="overflow-x-auto rounded-md border bg-muted p-4 text-sm">
                  <code>{nodeExample}</code>
                </pre>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
