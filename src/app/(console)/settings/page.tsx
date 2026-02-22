"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, User, Lock, Link } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  authMethods: string[];
  createdAt: string;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit profile
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [saving, setSaving] = useState(false);

  // Change password
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPwd, setChangingPwd] = useState(false);

  useEffect(() => {
    fetch("/api/console/settings")
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
        setEditName(data.name || "");
        setEditEmail(data.email || "");
      })
      .catch(() => toast.error("加载用户信息失败"))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      toast.error("姓名不能为空");
      return;
    }
    if (!editEmail.includes("@")) {
      toast.error("邮箱格式无效");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/console/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim(), email: editEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "保存失败");
      setProfile(data);
      toast.success("资料已更新");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword) {
      toast.error("请输入当前密码");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("新密码至少 8 位");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("两次输入的密码不一致");
      return;
    }
    setChangingPwd(true);
    try {
      const res = await fetch("/api/console/settings/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "修改失败");
      toast.success("密码已修改");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setChangingPwd(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">设置</h1>

      {/* Profile Info */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <User className="h-5 w-5 text-muted-foreground" />
          <div>
            <CardTitle>个人信息</CardTitle>
            <CardDescription>你的账号基本信息</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-20 items-center justify-center text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              加载中...
            </div>
          ) : profile ? (
            <div className="grid gap-3 text-sm">
              <div className="flex gap-2">
                <span className="w-20 text-muted-foreground">姓名</span>
                <span>{profile.name || "未设置"}</span>
              </div>
              <div className="flex gap-2">
                <span className="w-20 text-muted-foreground">邮箱</span>
                <span>{profile.email}</span>
              </div>
              <div className="flex gap-2">
                <span className="w-20 text-muted-foreground">注册时间</span>
                <span>{formatDate(profile.createdAt)}</span>
              </div>
              <div className="flex gap-2">
                <span className="w-20 text-muted-foreground">登录方式</span>
                <div className="flex gap-1">
                  {profile.authMethods.map((m) => (
                    <Badge key={m} variant="outline" className="text-xs">
                      {m === "credentials" ? "密码" : m === "github" ? "GitHub" : m === "google" ? "Google" : m}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Edit Profile */}
      <Card>
        <CardHeader>
          <CardTitle>编辑资料</CardTitle>
          <CardDescription>修改你的姓名和邮箱</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-name">姓名</Label>
            <Input
              id="edit-name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="输入姓名"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-email">邮箱</Label>
            <Input
              id="edit-email"
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              placeholder="输入邮箱"
            />
          </div>
          <Button disabled={saving} onClick={handleSaveProfile}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            保存
          </Button>
        </CardContent>
      </Card>

      {/* Change Password — only for users with password auth */}
      {profile?.authMethods.includes("credentials") && (
      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <Lock className="h-5 w-5 text-muted-foreground" />
          <div>
            <CardTitle>修改密码</CardTitle>
            <CardDescription>更改你的登录密码</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="old-pwd">当前密码</Label>
            <Input
              id="old-pwd"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="输入当前密码"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new-pwd">新密码</Label>
            <Input
              id="new-pwd"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="至少 8 位"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirm-pwd">确认新密码</Label>
            <Input
              id="confirm-pwd"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="再次输入新密码"
            />
          </div>
          <Button disabled={changingPwd} onClick={handleChangePassword}>
            {changingPwd && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            修改密码
          </Button>
        </CardContent>
      </Card>
      )}
    </div>
  );
}
