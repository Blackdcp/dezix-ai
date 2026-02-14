"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  isActive: boolean;
  expiresAt: string | null;
  totalQuota: number | null;
  usedQuota: number;
  modelWhitelist: string[];
  rateLimit: number | null;
  createdAt: string;
}

// ─── Create Dialog ──────────────────────────────────────────────────
function CreateKeyDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [expiry, setExpiry] = useState("never");
  const [totalQuota, setTotalQuota] = useState("");
  const [rateLimit, setRateLimit] = useState("");
  const [modelWhitelist, setModelWhitelist] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const reset = () => {
    setName("");
    setExpiry("never");
    setTotalQuota("");
    setRateLimit("");
    setModelWhitelist("");
    setLoading(false);
    setCreatedKey(null);
    setCopied(false);
  };

  const handleClose = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("请输入密钥名称");
      return;
    }
    setLoading(true);

    let expiresAt: string | null = null;
    if (expiry !== "never") {
      const d = new Date();
      d.setDate(d.getDate() + Number(expiry));
      expiresAt = d.toISOString();
    }

    const body: Record<string, unknown> = { name: name.trim() };
    if (expiresAt) body.expiresAt = expiresAt;
    if (totalQuota) body.totalQuota = Number(totalQuota);
    if (rateLimit) body.rateLimit = Number(rateLimit);
    if (modelWhitelist.trim()) {
      body.modelWhitelist = modelWhitelist
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    try {
      const res = await fetch("/api/console/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setCreatedKey(data.key);
      onCreated();
      toast.success("密钥创建成功");
    } catch {
      toast.error("创建失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (createdKey) {
      await navigator.clipboard.writeText(createdKey);
      setCopied(true);
      toast.success("已复制到剪贴板");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // After key is created, show the key reveal dialog
  if (createdKey) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>密钥已创建</DialogTitle>
            <DialogDescription>
              请立即复制你的 API Key，此密钥仅展示一次，关闭后无法再次查看。
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 rounded-md border bg-muted p-3">
            <code className="flex-1 break-all text-sm">{createdKey}</code>
            <Button variant="ghost" size="icon" onClick={handleCopy}>
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={() => handleClose(false)}>确认关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>创建 API 密钥</DialogTitle>
          <DialogDescription>
            创建新密钥用于调用 API 接口
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">名称 *</Label>
            <Input
              id="name"
              placeholder="例如：生产环境、测试用"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>过期时间</Label>
            <Select value={expiry} onValueChange={setExpiry}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="never">永不过期</SelectItem>
                <SelectItem value="7">7 天</SelectItem>
                <SelectItem value="30">30 天</SelectItem>
                <SelectItem value="90">90 天</SelectItem>
                <SelectItem value="180">180 天</SelectItem>
                <SelectItem value="365">1 年</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="quota">总额度 (¥，留空表示无限)</Label>
            <Input
              id="quota"
              type="number"
              placeholder="例如：100"
              value={totalQuota}
              onChange={(e) => setTotalQuota(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="rate">速率限制 (次/分钟，留空表示不限)</Label>
            <Input
              id="rate"
              type="number"
              placeholder="例如：60"
              value={rateLimit}
              onChange={(e) => setRateLimit(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="models">模型白名单 (逗号分隔，留空表示全部)</Label>
            <Input
              id="models"
              placeholder="例如：gpt-4o,claude-3.5-sonnet"
              value={modelWhitelist}
              onChange={(e) => setModelWhitelist(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            取消
          </Button>
          <Button onClick={handleCreate} disabled={loading}>
            {loading ? "创建中..." : "创建密钥"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit Dialog ────────────────────────────────────────────────────
function EditKeyDialog({
  apiKey,
  open,
  onOpenChange,
  onUpdated,
}: {
  apiKey: ApiKeyItem | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onUpdated: () => void;
}) {
  const [name, setName] = useState("");
  const [expiry, setExpiry] = useState("never");
  const [totalQuota, setTotalQuota] = useState("");
  const [rateLimit, setRateLimit] = useState("");
  const [modelWhitelist, setModelWhitelist] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (apiKey) {
      setName(apiKey.name);
      setTotalQuota(apiKey.totalQuota != null ? String(apiKey.totalQuota) : "");
      setRateLimit(apiKey.rateLimit != null ? String(apiKey.rateLimit) : "");
      setModelWhitelist(apiKey.modelWhitelist.join(", "));

      if (apiKey.expiresAt) {
        // Calculate remaining days approximately
        const remaining = Math.round(
          (new Date(apiKey.expiresAt).getTime() - Date.now()) / 86400000
        );
        if (remaining <= 7) setExpiry("7");
        else if (remaining <= 30) setExpiry("30");
        else if (remaining <= 90) setExpiry("90");
        else if (remaining <= 180) setExpiry("180");
        else setExpiry("365");
      } else {
        setExpiry("never");
      }
    }
  }, [apiKey]);

  const handleSave = async () => {
    if (!apiKey || !name.trim()) return;
    setLoading(true);

    let expiresAt: string | null = null;
    if (expiry !== "never") {
      const d = new Date();
      d.setDate(d.getDate() + Number(expiry));
      expiresAt = d.toISOString();
    }

    const body: Record<string, unknown> = { name: name.trim() };
    body.expiresAt = expiresAt;
    body.totalQuota = totalQuota ? Number(totalQuota) : null;
    body.rateLimit = rateLimit ? Number(rateLimit) : null;
    body.modelWhitelist = modelWhitelist.trim()
      ? modelWhitelist
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    try {
      const res = await fetch(`/api/console/api-keys/${apiKey.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed");
      onUpdated();
      onOpenChange(false);
      toast.success("密钥已更新");
    } catch {
      toast.error("更新失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>编辑密钥</DialogTitle>
          <DialogDescription>修改密钥属性和权限配置</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-name">名称</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>过期时间</Label>
            <Select value={expiry} onValueChange={setExpiry}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="never">永不过期</SelectItem>
                <SelectItem value="7">7 天</SelectItem>
                <SelectItem value="30">30 天</SelectItem>
                <SelectItem value="90">90 天</SelectItem>
                <SelectItem value="180">180 天</SelectItem>
                <SelectItem value="365">1 年</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-quota">总额度 (¥，留空表示无限)</Label>
            <Input
              id="edit-quota"
              type="number"
              value={totalQuota}
              onChange={(e) => setTotalQuota(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-rate">速率限制 (次/分钟，留空表示不限)</Label>
            <Input
              id="edit-rate"
              type="number"
              value={rateLimit}
              onChange={(e) => setRateLimit(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-models">
              模型白名单 (逗号分隔，留空表示全部)
            </Label>
            <Input
              id="edit-models"
              value={modelWhitelist}
              onChange={(e) => setModelWhitelist(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "保存中..." : "保存"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete Confirm Dialog ──────────────────────────────────────────
function DeleteKeyDialog({
  apiKey,
  open,
  onOpenChange,
  onDeleted,
}: {
  apiKey: ApiKeyItem | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onDeleted: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!apiKey) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/console/api-keys/${apiKey.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed");
      onDeleted();
      onOpenChange(false);
      toast.success("密钥已删除");
    } catch {
      toast.error("删除失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>确认删除</DialogTitle>
          <DialogDescription>
            确定要删除密钥「{apiKey?.name}」吗？此操作不可撤销，使用该密钥的所有
            API 调用将立即失效。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "删除中..." : "确认删除"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────
export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editKey, setEditKey] = useState<ApiKeyItem | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteKey, setDeleteKey] = useState<ApiKeyItem | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const fetchKeys = useCallback(async () => {
    try {
      const res = await fetch("/api/console/api-keys");
      if (res.ok) {
        const data = await res.json();
        setKeys(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const handleToggle = async (key: ApiKeyItem) => {
    try {
      const res = await fetch(`/api/console/api-keys/${key.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !key.isActive }),
      });
      if (res.ok) {
        fetchKeys();
        toast.success(key.isActive ? "密钥已禁用" : "密钥已启用");
      }
    } catch {
      toast.error("操作失败");
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">API 密钥</h1>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          创建密钥
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>密钥列表</CardTitle>
          <CardDescription>
            管理你的 API 密钥，每个密钥可设置独立的额度和权限
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">
              加载中...
            </div>
          ) : keys.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              还没有 API 密钥，点击上方按钮创建
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名称</TableHead>
                  <TableHead>Key 前缀</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="text-right">已用额度</TableHead>
                  <TableHead className="text-right">总额度</TableHead>
                  <TableHead>到期时间</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium">{key.name}</TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                        {key.keyPrefix}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant={key.isActive ? "default" : "secondary"}>
                        {key.isActive ? "启用" : "禁用"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      ¥{key.usedQuota.toFixed(4)}
                    </TableCell>
                    <TableCell className="text-right">
                      {key.totalQuota != null
                        ? `¥${key.totalQuota.toFixed(2)}`
                        : "无限"}
                    </TableCell>
                    <TableCell>
                      {key.expiresAt ? formatDate(key.expiresAt) : "永不"}
                    </TableCell>
                    <TableCell>{formatDate(key.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Switch
                          checked={key.isActive}
                          onCheckedChange={() => handleToggle(key)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditKey(key);
                            setEditOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setDeleteKey(key);
                            setDeleteOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateKeyDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={fetchKeys}
      />
      <EditKeyDialog
        apiKey={editKey}
        open={editOpen}
        onOpenChange={setEditOpen}
        onUpdated={fetchKeys}
      />
      <DeleteKeyDialog
        apiKey={deleteKey}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={fetchKeys}
      />
    </div>
  );
}
