"use client";

import { useEffect, useState, useCallback } from "react";
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

interface ModelItem {
  id: string;
  modelId: string;
  displayName: string;
  providerId: string;
  category: string;
  inputPrice: number;
  outputPrice: number;
  sellPrice: number;
  sellOutPrice: number;
  maxContext: number;
  isActive: boolean;
}

const emptyForm = {
  modelId: "",
  displayName: "",
  providerId: "",
  category: "chat",
  inputPrice: "0",
  outputPrice: "0",
  sellPrice: "0",
  sellOutPrice: "0",
  maxContext: "4096",
};

export default function AdminModelsPage() {
  const t = useTranslations("AdminModels");
  const tc = useTranslations("Common");
  const [models, setModels] = useState<ModelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  // Dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // Delete
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchModels = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: "20" });
    if (search) params.set("search", search);

    fetch(`/api/admin/models?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setModels(d.models || []);
        setTotalPages(d.totalPages || 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => {
    void fetchModels();
  }, [fetchModels]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (m: ModelItem) => {
    setEditingId(m.id);
    setForm({
      modelId: m.modelId,
      displayName: m.displayName,
      providerId: m.providerId,
      category: m.category,
      inputPrice: String(m.inputPrice),
      outputPrice: String(m.outputPrice),
      sellPrice: String(m.sellPrice),
      sellOutPrice: String(m.sellOutPrice),
      maxContext: String(m.maxContext),
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      modelId: form.modelId,
      displayName: form.displayName,
      providerId: form.providerId,
      category: form.category,
      inputPrice: parseFloat(form.inputPrice) || 0,
      outputPrice: parseFloat(form.outputPrice) || 0,
      sellPrice: parseFloat(form.sellPrice) || 0,
      sellOutPrice: parseFloat(form.sellOutPrice) || 0,
      maxContext: parseInt(form.maxContext) || 4096,
    };

    const url = editingId ? `/api/admin/models/${editingId}` : "/api/admin/models";
    const method = editingId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      toast.success(editingId ? t("updateSuccess") : t("createSuccess"));
      setDialogOpen(false);
      fetchModels();
    } else {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error || t("operationFailed"));
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`/api/admin/models/${deleteId}`, { method: "DELETE" });
    if (res.ok) {
      toast.success(t("deleteSuccess"));
      setDeleteId(null);
      fetchModels();
    } else {
      toast.error(t("deleteFailed"));
    }
  };

  const toggleActive = async (m: ModelItem) => {
    const res = await fetch(`/api/admin/models/${m.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !m.isActive }),
    });
    if (res.ok) {
      toast.success(m.isActive ? t("disableSuccess") : t("enableSuccess"));
      fetchModels();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <Button onClick={openCreate}>{t("addModel")}</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t("modelList")}</CardTitle>
            <Input
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
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
                    <TableHead>{t("modelId")}</TableHead>
                    <TableHead>{t("displayName")}</TableHead>
                    <TableHead>{t("category")}</TableHead>
                    <TableHead className="text-right">{t("costPrice")}</TableHead>
                    <TableHead className="text-right">{t("sellPrice")}</TableHead>
                    <TableHead>{t("context")}</TableHead>
                    <TableHead>{t("status")}</TableHead>
                    <TableHead>{t("actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {models.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-mono text-sm">{m.modelId}</TableCell>
                      <TableCell>{m.displayName}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{m.category}</Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        ¥{m.inputPrice} / ¥{m.outputPrice}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        ¥{m.sellPrice} / ¥{m.sellOutPrice}
                      </TableCell>
                      <TableCell>{(m.maxContext / 1000).toFixed(0)}K</TableCell>
                      <TableCell>
                        <Switch
                          checked={m.isActive}
                          onCheckedChange={() => toggleActive(m)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm" onClick={() => openEdit(m)}>
                            {t("edit")}
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600" onClick={() => setDeleteId(m.id)}>
                            {t("delete")}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {models.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        {t("noModels")}
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
                <Label>{t("modelIdLabel")}</Label>
                <Input
                  value={form.modelId}
                  onChange={(e) => setForm({ ...form, modelId: e.target.value })}
                  placeholder="gpt-4o"
                  disabled={!!editingId}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("displayNameLabel")}</Label>
                <Input
                  value={form.displayName}
                  onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                  placeholder="GPT-4o"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Provider ID</Label>
                <Input
                  value={form.providerId}
                  onChange={(e) => setForm({ ...form, providerId: e.target.value })}
                  placeholder="Provider CUID"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("categoryLabel")}</Label>
                <Input
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="chat"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("costInputLabel")}</Label>
                <Input
                  type="number"
                  step="0.00000001"
                  value={form.inputPrice}
                  onChange={(e) => setForm({ ...form, inputPrice: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("costOutputLabel")}</Label>
                <Input
                  type="number"
                  step="0.00000001"
                  value={form.outputPrice}
                  onChange={(e) => setForm({ ...form, outputPrice: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("sellInputLabel")}</Label>
                <Input
                  type="number"
                  step="0.00000001"
                  value={form.sellPrice}
                  onChange={(e) => setForm({ ...form, sellPrice: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("sellOutputLabel")}</Label>
                <Input
                  type="number"
                  step="0.00000001"
                  value={form.sellOutPrice}
                  onChange={(e) => setForm({ ...form, sellOutPrice: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("maxContextLabel")}</Label>
              <Input
                type="number"
                value={form.maxContext}
                onChange={(e) => setForm({ ...form, maxContext: e.target.value })}
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
            <DialogDescription>
              {t("deleteDesc")}
            </DialogDescription>
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
