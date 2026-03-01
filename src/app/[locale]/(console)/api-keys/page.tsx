"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
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
  fullKey: string | null;
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
  const t = useTranslations("ApiKeys");
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
      toast.error(t("nameRequired"));
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
      toast.success(t("createSuccess"));
    } catch {
      toast.error(t("createFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (createdKey) {
      await navigator.clipboard.writeText(createdKey);
      setCopied(true);
      toast.success(t("copiedToClipboard"));
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // After key is created, show the key reveal dialog
  if (createdKey) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("keyCreated")}</DialogTitle>
            <DialogDescription>
              {t("keyCreatedDesc")}
            </DialogDescription>
          </DialogHeader>
          <div
            className="group flex items-center gap-2 rounded-md border bg-muted p-3 cursor-pointer hover:border-primary/50 transition-colors"
            onClick={handleCopy}
            title={t("clickToCopy")}
          >
            <code className="flex-1 break-all text-sm select-all">{createdKey}</code>
          </div>
          <Button onClick={handleCopy} className="w-full gap-2">
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                {t("copied")}
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                {t("copyApiKey")}
              </>
            )}
          </Button>
          <DialogFooter>
            <Button variant="outline" onClick={() => handleClose(false)}>{t("closeConfirm")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("createTitle")}</DialogTitle>
          <DialogDescription>
            {t("createDesc")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">{t("nameLabel")}</Label>
            <Input
              id="name"
              placeholder={t("namePlaceholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>{t("expiry")}</Label>
            <Select value={expiry} onValueChange={setExpiry}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="never">{t("neverExpire")}</SelectItem>
                <SelectItem value="7">{t("days7")}</SelectItem>
                <SelectItem value="30">{t("days30")}</SelectItem>
                <SelectItem value="90">{t("days90")}</SelectItem>
                <SelectItem value="180">{t("days180")}</SelectItem>
                <SelectItem value="365">{t("year1")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="quota">{t("quotaLabel")}</Label>
            <Input
              id="quota"
              type="number"
              placeholder={t("quotaPlaceholder")}
              value={totalQuota}
              onChange={(e) => setTotalQuota(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="rate">{t("rateLimitLabel")}</Label>
            <Input
              id="rate"
              type="number"
              placeholder={t("rateLimitPlaceholder")}
              value={rateLimit}
              onChange={(e) => setRateLimit(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="models">{t("modelWhitelistLabel")}</Label>
            <Input
              id="models"
              placeholder={t("modelWhitelistPlaceholder")}
              value={modelWhitelist}
              onChange={(e) => setModelWhitelist(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            {t("cancel")}
          </Button>
          <Button onClick={handleCreate} disabled={loading}>
            {loading ? t("creating") : t("createKey")}
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
  const t = useTranslations("ApiKeys");
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
      toast.success(t("updateSuccess"));
    } catch {
      toast.error(t("updateFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("editTitle")}</DialogTitle>
          <DialogDescription>{t("editDesc")}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-name">{t("name")}</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>{t("expiry")}</Label>
            <Select value={expiry} onValueChange={setExpiry}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="never">{t("neverExpire")}</SelectItem>
                <SelectItem value="7">{t("days7")}</SelectItem>
                <SelectItem value="30">{t("days30")}</SelectItem>
                <SelectItem value="90">{t("days90")}</SelectItem>
                <SelectItem value="180">{t("days180")}</SelectItem>
                <SelectItem value="365">{t("year1")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-quota">{t("quotaLabel")}</Label>
            <Input
              id="edit-quota"
              type="number"
              value={totalQuota}
              onChange={(e) => setTotalQuota(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-rate">{t("rateLimitLabel")}</Label>
            <Input
              id="edit-rate"
              type="number"
              value={rateLimit}
              onChange={(e) => setRateLimit(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-models">
              {t("modelWhitelistLabel")}
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
            {t("cancel")}
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? t("saving") : t("save")}
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
  const t = useTranslations("ApiKeys");
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
      toast.success(t("deleteSuccess"));
    } catch {
      toast.error(t("deleteFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("deleteTitle")}</DialogTitle>
          <DialogDescription>
            {t("deleteDesc", { name: apiKey?.name ?? "" })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? t("deleting") : t("confirmDelete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────
export default function ApiKeysPage() {
  const t = useTranslations("ApiKeys");
  const tc = useTranslations("Common");
  const locale = useLocale();
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
      toast.error(t("loadFailed"));
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
        toast.success(key.isActive ? t("disableSuccess") : t("enableSuccess"));
      }
    } catch {
      toast.error(t("operationFailed"));
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("createKey")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("keyList")}</CardTitle>
          <CardDescription>
            {t("keyListDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">
              {tc("loading")}
            </div>
          ) : keys.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              {t("noKeys")}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("name")}</TableHead>
                  <TableHead>{t("apiKey")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                  <TableHead className="text-right">{t("usedQuota")}</TableHead>
                  <TableHead className="text-right">{t("totalQuota")}</TableHead>
                  <TableHead>{t("expiresAt")}</TableHead>
                  <TableHead>{t("createdAt")}</TableHead>
                  <TableHead className="text-right">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium">{key.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs max-w-[280px] truncate block">
                          {key.fullKey || key.keyPrefix}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={async () => {
                            const text = key.fullKey || key.keyPrefix;
                            await navigator.clipboard.writeText(text);
                            toast.success(t("copiedToClipboard"));
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={key.isActive ? "default" : "secondary"}>
                        {key.isActive ? t("active") : t("inactive")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      ¥{key.usedQuota.toFixed(4)}
                    </TableCell>
                    <TableCell className="text-right">
                      {key.totalQuota != null
                        ? `¥${key.totalQuota.toFixed(2)}`
                        : t("unlimited")}
                    </TableCell>
                    <TableCell>
                      {key.expiresAt ? formatDate(key.expiresAt) : t("never")}
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
