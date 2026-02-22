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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";

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
  isManual: boolean;
}

interface SyncPreview {
  added: string[];
  deactivated: string[];
  total: number;
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

const emptyPriceForm = {
  sellPrice: "",
  sellOutPrice: "",
  inputPrice: "",
  outputPrice: "",
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

  // Sync
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncPreview, setSyncPreview] = useState<SyncPreview | null>(null);
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [syncExecuting, setSyncExecuting] = useState(false);

  // Selection & Batch pricing
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchDialogOpen, setBatchDialogOpen] = useState(false);
  const [priceForm, setPriceForm] = useState(emptyPriceForm);
  const [batchSaving, setBatchSaving] = useState(false);

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

  // Clear selection when page/search changes
  useEffect(() => {
    setSelectedIds(new Set());
  }, [page, search]);

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

  // --- Sync handlers ---
  const handleSyncPreview = async () => {
    setSyncLoading(true);
    try {
      const res = await fetch("/api/admin/models/sync");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Preview failed");
      }
      const preview: SyncPreview = await res.json();
      setSyncPreview(preview);
      setSyncDialogOpen(true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("syncFailed"));
    } finally {
      setSyncLoading(false);
    }
  };

  const handleSyncExecute = async () => {
    setSyncExecuting(true);
    try {
      const res = await fetch("/api/admin/models/sync", { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Sync failed");
      }
      toast.success(t("syncSuccess"));
      setSyncDialogOpen(false);
      setSyncPreview(null);
      fetchModels();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("syncFailed"));
    } finally {
      setSyncExecuting(false);
    }
  };

  // --- Selection handlers ---
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === models.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(models.map((m) => m.id)));
    }
  };

  // --- Batch pricing ---
  const openBatchPrice = () => {
    if (selectedIds.size === 0) {
      toast.error(t("selectModels"));
      return;
    }
    setPriceForm(emptyPriceForm);
    setBatchDialogOpen(true);
  };

  const handleBatchPrice = async () => {
    setBatchSaving(true);
    const payload: Record<string, unknown> = {
      modelIds: Array.from(selectedIds),
    };
    if (priceForm.sellPrice) payload.sellPrice = parseFloat(priceForm.sellPrice);
    if (priceForm.sellOutPrice) payload.sellOutPrice = parseFloat(priceForm.sellOutPrice);
    if (priceForm.inputPrice) payload.inputPrice = parseFloat(priceForm.inputPrice);
    if (priceForm.outputPrice) payload.outputPrice = parseFloat(priceForm.outputPrice);

    try {
      const res = await fetch("/api/admin/models/batch-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success(t("batchSuccess"));
        setBatchDialogOpen(false);
        setSelectedIds(new Set());
        fetchModels();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || t("operationFailed"));
      }
    } catch {
      toast.error(t("operationFailed"));
    } finally {
      setBatchSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <Button variant="outline" onClick={openBatchPrice}>
              {t("batchPrice")} ({selectedIds.size})
            </Button>
          )}
          <Button variant="outline" onClick={handleSyncPreview} disabled={syncLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${syncLoading ? "animate-spin" : ""}`} />
            {syncLoading ? t("syncing") : t("syncButton")}
          </Button>
          <Button onClick={openCreate}>{t("addModel")}</Button>
        </div>
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
                    <TableHead className="w-10">
                      <Checkbox
                        checked={models.length > 0 && selectedIds.size === models.length}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
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
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(m.id)}
                          onCheckedChange={() => toggleSelect(m.id)}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        <span>{m.modelId}</span>
                        {m.isManual && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            {t("manualBadge")}
                          </Badge>
                        )}
                      </TableCell>
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
                      <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
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

      {/* Sync Preview Dialog */}
      <Dialog open={syncDialogOpen} onOpenChange={setSyncDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("syncPreview")}</DialogTitle>
            <DialogDescription>{t("syncPreviewDesc")}</DialogDescription>
          </DialogHeader>
          {syncPreview && (
            <div className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground">
                {t("upstreamTotal", { count: syncPreview.total })}
              </p>

              {syncPreview.added.length === 0 && syncPreview.deactivated.length === 0 ? (
                <p className="text-sm">{t("noChanges")}</p>
              ) : (
                <>
                  {syncPreview.added.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-green-600 mb-1">
                        + {t("newModels")} ({syncPreview.added.length})
                      </h4>
                      <div className="max-h-40 overflow-y-auto rounded border p-2 space-y-1">
                        {syncPreview.added.map((id) => (
                          <div key={id} className="font-mono text-xs text-green-700">{id}</div>
                        ))}
                      </div>
                    </div>
                  )}
                  {syncPreview.deactivated.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-red-600 mb-1">
                        - {t("removedModels")} ({syncPreview.deactivated.length})
                      </h4>
                      <div className="max-h-40 overflow-y-auto rounded border p-2 space-y-1">
                        {syncPreview.deactivated.map((id) => (
                          <div key={id} className="font-mono text-xs text-red-700">{id}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSyncDialogOpen(false)}>{t("cancel")}</Button>
            {syncPreview && (syncPreview.added.length > 0 || syncPreview.deactivated.length > 0) && (
              <Button onClick={handleSyncExecute} disabled={syncExecuting}>
                {syncExecuting ? t("syncing") : t("confirmSync")}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Batch Pricing Dialog */}
      <Dialog open={batchDialogOpen} onOpenChange={setBatchDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("batchPrice")}</DialogTitle>
            <DialogDescription>
              {t("batchPriceDesc", { count: selectedIds.size })}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("sellInputLabel")}</Label>
                <Input
                  type="number"
                  step="0.00000001"
                  placeholder="0.002"
                  value={priceForm.sellPrice}
                  onChange={(e) => setPriceForm({ ...priceForm, sellPrice: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("sellOutputLabel")}</Label>
                <Input
                  type="number"
                  step="0.00000001"
                  placeholder="0.006"
                  value={priceForm.sellOutPrice}
                  onChange={(e) => setPriceForm({ ...priceForm, sellOutPrice: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("costInputLabel")}</Label>
                <Input
                  type="number"
                  step="0.00000001"
                  placeholder="0.001"
                  value={priceForm.inputPrice}
                  onChange={(e) => setPriceForm({ ...priceForm, inputPrice: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("costOutputLabel")}</Label>
                <Input
                  type="number"
                  step="0.00000001"
                  placeholder="0.004"
                  value={priceForm.outputPrice}
                  onChange={(e) => setPriceForm({ ...priceForm, outputPrice: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBatchDialogOpen(false)}>{t("cancel")}</Button>
            <Button onClick={handleBatchPrice} disabled={batchSaving}>
              {batchSaving ? t("saving") : t("applyPrice")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
