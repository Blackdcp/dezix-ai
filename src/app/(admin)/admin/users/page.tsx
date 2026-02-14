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
  createdAt: string;
  _count: { apiKeys: number; usageLogs: number };
}

export default function AdminUsersPage() {
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
    fetchUsers();
  }, [fetchUsers]);

  const toggleRole = async (user: UserItem) => {
    const newRole = user.role === "ADMIN" ? "USER" : "ADMIN";
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    if (res.ok) {
      toast.success(`已将 ${user.email} 设为 ${newRole}`);
      fetchUsers();
    } else {
      toast.error("操作失败");
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
      toast.success("余额调整成功");
      setBalanceOpen(false);
      setBalanceAmount("");
      setBalanceDesc("");
      fetchUsers();
    } else {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error || "操作失败");
    }
    setBalanceLoading(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">用户管理</h1>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>用户列表</CardTitle>
            <div className="flex gap-2">
              <Input
                placeholder="搜索用户名或邮箱..."
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
                  <SelectValue placeholder="全部角色" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">全部角色</SelectItem>
                  <SelectItem value="USER">USER</SelectItem>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">加载中...</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>用户名</TableHead>
                    <TableHead>邮箱</TableHead>
                    <TableHead>角色</TableHead>
                    <TableHead className="text-right">余额</TableHead>
                    <TableHead>密钥数</TableHead>
                    <TableHead>请求数</TableHead>
                    <TableHead>注册时间</TableHead>
                    <TableHead>操作</TableHead>
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
                      <TableCell className="text-right">¥{u.balance.toFixed(2)}</TableCell>
                      <TableCell>{u._count.apiKeys}</TableCell>
                      <TableCell>{u._count.usageLogs}</TableCell>
                      <TableCell>{new Date(u.createdAt).toLocaleDateString("zh-CN")}</TableCell>
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
                            调整余额
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleRole(u)}
                          >
                            {u.role === "ADMIN" ? "设为 USER" : "设为 ADMIN"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        暂无用户
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
                    上一页
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
                    下一页
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
            <DialogTitle>调整余额</DialogTitle>
            <DialogDescription>
              为 {balanceUser?.email} 调整余额（正数增加，负数扣减）
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>当前余额</Label>
              <div className="text-lg font-bold">¥{balanceUser?.balance.toFixed(2)}</div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">调整金额</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="如 100 或 -50"
                value={balanceAmount}
                onChange={(e) => setBalanceAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">备注（可选）</Label>
              <Input
                id="desc"
                placeholder="调整原因"
                value={balanceDesc}
                onChange={(e) => setBalanceDesc(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBalanceOpen(false)}>
              取消
            </Button>
            <Button
              onClick={handleBalanceSubmit}
              disabled={!balanceAmount || balanceLoading}
            >
              {balanceLoading ? "处理中..." : "确认调整"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
