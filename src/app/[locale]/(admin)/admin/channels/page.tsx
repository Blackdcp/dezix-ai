"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
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
import { Copy, Check } from "lucide-react";

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
  const t = useTranslations("AdminChannels");
  const tc = useTranslations("Common");
  const [channels, setChannels] = useState<ChannelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const maskApiKey = (key: string) => {
    if (!key || key.length <= 8) return "sk-****";
    return `${key.slice(0, 4)}...${key.slice(-4)}`;
  };

  const copyApiKey = async (key: string, channelId: string) => {
    await navigator.clipboard.writeText(key);
    setCopiedId(channelId);
    toast.success(t("copied"));
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // Delete
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredChannels = useMemo(() => {
    if (!search.trim()) return channels;
    const q = search.toLowerCase();
    return channels.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.provider.name.toLowerCase().includes(q)
    );
  }, [channels, search]);

  const fetchChannels = useCallback(() => {
    setLoading(true);
    fetch(`/api/admin/channels?page=${page}&pageSize=20`)
      .then((r) => r.json())
      .then((d) => {
        setChannels(d.channels || []);
        setTotalPages(d.totalPages || 1);
      })
      .catch(() => toast.error(t("loadFailed")))
      .finally(() => setLoading(false));
  }, [page, t]);

  useEffect(() => {
    void fetchChannels();
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
      toast.error(t("apiKeyRequired"));
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
      toast.success(editingId ? t("updateSuccess") : t("createSuccess"));
      setDialogOpen(false);
      fetchChannels();
    } else {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error || t("operationFailed"));
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`/api/admin/channels/${deleteId}`, { method: "DELETE" });
    if (res.ok) {
      toast.success(t("deleteSuccess"));
      setDeleteId(null);
      fetchChannels();
    } else {
      toast.error(t("deleteFailed"));
    }
  };

  const toggleActive = async (c: ChannelItem) => {
    const res = await fetch(`/api/admin/channels/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !c.isActive }),
    });
    if (res.ok) {
      toast.success(c.isActive ? t("disableSuccess") : t("enableSuccess"));
      fetchChannels();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <Button onClick={openCreate}>{t("addChannel")}</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t("channelList")}</CardTitle>
            <Input
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-60"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">{tc("loading")}</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("name")}</TableHead>
                    <TableHead>{t("provider")}</TableHead>
                    <TableHead>API Key</TableHead>
                    <TableHead>{t("baseUrl")}</TableHead>
                    <TableHead>{t("priority")}</TableHead>
                    <TableHead>{t("weight")}</TableHead>
                    <TableHead>{t("models")}</TableHead>
                    <TableHead>{t("status")}</TableHead>
                    <TableHead>{t("actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredChannels.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{c.provider.name}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        <div className="flex items-center gap-1">
                          <span>{maskApiKey(c.apiKey)}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => copyApiKey(c.apiKey, c.id)}
                          >
                            {copiedId === c.id ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm max-w-32 truncate">{c.baseUrl || "-"}</TableCell>
                      <TableCell>{c.priority}</TableCell>
                      <TableCell>{c.weight}</TableCell>
                      <TableCell className="max-w-40 truncate text-sm">
                        {c.models.length > 0 ? c.models.join(", ") : t("allModels")}
                      </TableCell>
                      <TableCell>
                        <Switch checked={c.isActive} onCheckedChange={() => toggleActive(c)} />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm" onClick={() => openEdit(c)}>
                            {t("edit")}
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600" onClick={() => setDeleteId(c.id)}>
                            {t("delete")}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredChannels.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                        {t("noChannels")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-end gap-2 pt-4">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                    {t("prevPage")}
                  </Button>
                  <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
                  <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                    {t("nextPage")}
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
            <DialogTitle>{editingId ? t("editTitle") : t("createTitle")}</DialogTitle>
            <DialogDescription>
              {editingId ? t("editDesc") : t("createDesc")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("channelName")}</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder={t("channelNamePlaceholder")}
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
                placeholder={editingId ? t("apiKeyEditHint") : t("apiKeyPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("baseUrlLabel")}</Label>
              <Input
                value={form.baseUrl}
                onChange={(e) => setForm({ ...form, baseUrl: e.target.value })}
                placeholder="https://api.openai.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("priorityLabel")}</Label>
                <Input
                  type="number"
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("weightLabel")}</Label>
                <Input
                  type="number"
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("modelsLabel")}</Label>
              <Input
                value={form.models}
                onChange={(e) => setForm({ ...form, models: e.target.value })}
                placeholder="gpt-4o, gpt-4o-mini"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t("cancel")}</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? t("saving") : t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteTitle")}</DialogTitle>
            <DialogDescription>{t("deleteDesc")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>{t("cancel")}</Button>
            <Button variant="destructive" onClick={handleDelete}>{t("confirmDelete")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
