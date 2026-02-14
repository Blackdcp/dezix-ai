"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface ChannelItem {
  id: string;
  providerId: string;
  name: string;
  apiKey: string;
  baseUrl: string | null;
  priority: number;
  weight: number;
  isActive: boolean;
  models: string[];
  provider: { name: string };
  createdAt: string;
}

const emptyForm = {
  providerId: "",
  name: "",
  apiKey: "",
  baseUrl: "",
  priority: "0",
  weight: "1",
  models: "",
};

export default function AdminChannelsPage() {
  const [channels, setChannels] = useState<ChannelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // Delete
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchChannels = useCallback(() => {
    setLoading(true);
    fetch(`/api/admin/channels?page=${page}&pageSize=20`)
      .then((r) => r.json())
      .then((d) => {
        setChannels(d.channels || []);
        setTotalPages(d.totalPages || 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (c: ChannelItem) => {
    setEditingId(c.id);
    setForm({
      providerId: c.providerId,
      name: c.name,
      apiKey: "",
      baseUrl: c.baseUrl || "",
      priority: String(c.priority),
      weight: String(c.weight),
      models: c.models.join(", "),
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      providerId: form.providerId,
      name: form.name,
      apiKey: form.apiKey || undefined,
      baseUrl: form.baseUrl || undefined,
      priority: parseInt(form.priority) || 0,
      weight: parseInt(form.weight) || 1,
      models: form.models ? form.models.split(",").map((s) => s.trim()).filter(Boolean) : [],
    };

    if (!editingId && !payload.apiKey) {
      toast.error("新建渠道必须提供 API Key");
      setSaving(false);
      return;
    }

    const url = editingId ? `/api/admin/channels/${editingId}` : "/api/admin/channels";
    const method = editingId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      toast.success(editingId ? "渠道已更新" : "渠道已创建");
      setDialogOpen(false);
      fetchChannels();
    } else {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error || "操作失败");
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`/api/admin/channels/${deleteId}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("渠道已删除");
      setDeleteId(null);
      fetchChannels();
    } else {
      toast.error("删除失败");
    }
  };

  const toggleActive = async (c: ChannelItem) => {
    const res = await fetch(`/api/admin/channels/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !c.isActive }),
    });
    if (res.ok) {
      toast.success(c.isActive ? "已禁用" : "已启用");
      fetchChannels();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">渠道管理</h1>
        <Button onClick={openCreate}>新增渠道</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>渠道列表</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">加载中...</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>名称</TableHead>
                    <TableHead>供应商</TableHead>
                    <TableHead>API Key</TableHead>
                    <TableHead>Base URL</TableHead>
                    <TableHead>优先级</TableHead>
                    <TableHead>权重</TableHead>
                    <TableHead>支持模型</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {channels.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{c.provider.name}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{c.apiKey}</TableCell>
                      <TableCell className="text-sm max-w-32 truncate">{c.baseUrl || "-"}</TableCell>
                      <TableCell>{c.priority}</TableCell>
                      <TableCell>{c.weight}</TableCell>
                      <TableCell className="max-w-40 truncate text-sm">
                        {c.models.length > 0 ? c.models.join(", ") : "全部"}
                      </TableCell>
                      <TableCell>
                        <Switch checked={c.isActive} onCheckedChange={() => toggleActive(c)} />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm" onClick={() => openEdit(c)}>
                            编辑
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600" onClick={() => setDeleteId(c.id)}>
                            删除
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {channels.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                        暂无渠道
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-end gap-2 pt-4">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                    上一页
                  </Button>
                  <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
                  <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                    下一页
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "编辑渠道" : "新增渠道"}</DialogTitle>
            <DialogDescription>
              {editingId ? "修改渠道配置（留空 API Key 则不更新）" : "添加一个新的上游渠道"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>渠道名称</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="OpenAI 主力"
                />
              </div>
              <div className="space-y-2">
                <Label>Provider ID</Label>
                <Input
                  value={form.providerId}
                  onChange={(e) => setForm({ ...form, providerId: e.target.value })}
                  placeholder="Provider CUID"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input
                type="password"
                value={form.apiKey}
                onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
                placeholder={editingId ? "留空则不更新" : "sk-..."}
              />
            </div>
            <div className="space-y-2">
              <Label>Base URL（可选，覆盖供应商默认）</Label>
              <Input
                value={form.baseUrl}
                onChange={(e) => setForm({ ...form, baseUrl: e.target.value })}
                placeholder="https://api.openai.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>优先级</Label>
                <Input
                  type="number"
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>权重</Label>
                <Input
                  type="number"
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>支持模型（逗号分隔，留空=全部）</Label>
              <Input
                value={form.models}
                onChange={(e) => setForm({ ...form, models: e.target.value })}
                placeholder="gpt-4o, gpt-4o-mini"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>确定要删除这个渠道吗？此操作不可撤销。</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>取消</Button>
            <Button variant="destructive" onClick={handleDelete}>确认删除</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
