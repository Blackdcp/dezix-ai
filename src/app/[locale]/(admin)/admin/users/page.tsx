"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface UserItem {
  id: string;
  name: string | null;
  email: string;
  role: string;
  balance: number;
  referralCode: string | null;
  authMethods: string[];
  createdAt: string;
  _count: { apiKeys: number; usageLogs: number };
}

export default function AdminUsersPage() {
  const t = useTranslations("AdminUsers");
  const tc = useTranslations("Common");
  const locale = useLocale();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  // Balance dialog
  const [balanceOpen, setBalanceOpen] = useState(false);
  const [balanceUser, setBalanceUser] = useState<UserItem | null>(null);
  const [balanceAmount, setBalanceAmount] = useState("");
  const [balanceDesc, setBalanceDesc] = useState("");
  const [balanceLoading, setBalanceLoading] = useState(false);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      pageSize: "20",
    });
    if (search) params.set("search", search);
    if (roleFilter) params.set("role", roleFilter);

    fetch(`/api/admin/users?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setUsers(d.users || []);
        setTotalPages(d.totalPages || 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, search, roleFilter]);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  const toggleRole = async (user: UserItem) => {
    const newRole = user.role === "ADMIN" ? "USER" : "ADMIN";
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    if (res.ok) {
      toast.success(t("roleChangeSuccess", { email: user.email, role: newRole }));
      fetchUsers();
    } else {
      toast.error(t("operationFailed"));
    }
  };

  const handleBalanceSubmit = async () => {
    if (!balanceUser || !balanceAmount) return;
    setBalanceLoading(true);
    const res = await fetch(`/api/admin/users/${balanceUser.id}/balance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: parseFloat(balanceAmount),
        description: balanceDesc || undefined,
      }),
    });
    if (res.ok) {
      toast.success(t("adjustSuccess"));
      setBalanceOpen(false);
      setBalanceAmount("");
      setBalanceDesc("");
      fetchUsers();
    } else {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error || t("operationFailed"));
    }
    setBalanceLoading(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>{t("userList")}</CardTitle>
            <div className="flex gap-2">
              <Input
                placeholder={t("searchPlaceholder")}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-60"
              />
              <Select
                value={roleFilter}
                onValueChange={(v) => {
                  setRoleFilter(v === "ALL" ? "" : v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder={t("allRoles")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{t("allRoles")}</SelectItem>
                  <SelectItem value="USER">USER</SelectItem>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
                    <TableHead>{t("username")}</TableHead>
                    <TableHead>{t("email")}</TableHead>
                    <TableHead>{t("role")}</TableHead>
                    <TableHead>{t("loginMethod")}</TableHead>
                    <TableHead className="text-right">{t("balance")}</TableHead>
                    <TableHead>{t("keysCount")}</TableHead>
                    <TableHead>{t("requestsCount")}</TableHead>
                    <TableHead>{t("registeredAt")}</TableHead>
                    <TableHead>{t("actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.name || "-"}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <Badge variant={u.role === "ADMIN" ? "default" : "secondary"}>
                          {u.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {u.authMethods.map((m) => (
                            <Badge key={m} variant="outline" className="text-xs">
                              {m === "credentials" ? t("credentials") : m === "github" ? "GitHub" : m === "google" ? "Google" : m}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">¥{u.balance.toFixed(2)}</TableCell>
                      <TableCell>{u._count.apiKeys}</TableCell>
                      <TableCell>{u._count.usageLogs}</TableCell>
                      <TableCell>{new Date(u.createdAt).toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US")}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setBalanceUser(u);
                              setBalanceOpen(true);
                            }}
                          >
                            {t("adjustBalance")}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleRole(u)}
                          >
                            {u.role === "ADMIN" ? t("setAsUser") : t("setAsAdmin")}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                        {t("noUsers")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                  >
                    {t("prevPage")}
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    {t("nextPage")}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Balance Dialog */}
      <Dialog open={balanceOpen} onOpenChange={setBalanceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("adjustBalanceTitle")}</DialogTitle>
            <DialogDescription>
              {t("adjustBalanceDesc", { email: balanceUser?.email ?? "" })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>{t("currentBalance")}</Label>
              <div className="text-lg font-bold">¥{balanceUser?.balance.toFixed(2)}</div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">{t("adjustAmount")}</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder={t("adjustAmountPlaceholder")}
                value={balanceAmount}
                onChange={(e) => setBalanceAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">{t("remark")}</Label>
              <Input
                id="desc"
                placeholder={t("remarkPlaceholder")}
                value={balanceDesc}
                onChange={(e) => setBalanceDesc(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBalanceOpen(false)}>
              {t("cancel")}
            </Button>
            <Button
              onClick={handleBalanceSubmit}
              disabled={!balanceAmount || balanceLoading}
            >
              {balanceLoading ? t("processing") : t("confirmAdjust")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
