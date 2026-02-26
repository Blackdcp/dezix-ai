"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
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
import { Separator } from "@/components/ui/separator";
import { Loader2, User, Lock, Link2, CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";

interface LinkedAccount {
  provider: string;
  providerAccountId: string;
}

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  authMethods: string[];
  linkedAccounts: LinkedAccount[];
  createdAt: string;
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function PasswordIcon({ className }: { className?: string }) {
  return <Lock className={className} />;
}

export default function SettingsPage() {
  const t = useTranslations("Settings");
  const tc = useTranslations("Common");
  const te = useTranslations("Errors");
  const locale = useLocale();

  const providerConfig: Record<string, { label: string; icon: typeof GitHubIcon; color: string; bgColor: string }> = {
    github: {
      label: "GitHub",
      icon: GitHubIcon,
      color: "text-[#24292f]",
      bgColor: "bg-[#24292f]/5",
    },
    google: {
      label: "Google",
      icon: GoogleIcon,
      color: "text-[#4285F4]",
      bgColor: "bg-[#4285F4]/5",
    },
    credentials: {
      label: t("emailPassword"),
      icon: PasswordIcon,
      color: "text-foreground",
      bgColor: "bg-muted",
    },
  };

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
      .catch(() => toast.error(t("loadFailed")))
      .finally(() => setLoading(false));
  }, [t]);

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      toast.error(t("nameRequired"));
      return;
    }
    if (!editEmail.includes("@")) {
      toast.error(t("emailInvalid"));
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
      if (!res.ok) {
        // Try to translate error code from API
        try {
          throw new Error(te(data.error as Parameters<typeof te>[0]));
        } catch {
          throw new Error(data.error || t("saveFailed"));
        }
      }
      setProfile(data);
      toast.success(t("saveSuccess"));
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword) {
      toast.error(t("currentPasswordRequired"));
      return;
    }
    if (newPassword.length < 8) {
      toast.error(t("newPasswordMin"));
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t("passwordMismatch"));
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
      if (!res.ok) {
        // Try to translate error code from API
        try {
          throw new Error(te(data.error as Parameters<typeof te>[0]));
        } catch {
          throw new Error(data.error || t("passwordChangeFailed"));
        }
      }
      toast.success(t("passwordChangeSuccess"));
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
    return new Date(dateStr).toLocaleString(locale === "zh" ? "zh-CN" : "en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Build linked account lookup
  const linkedMap = new Map<string, LinkedAccount>();
  if (profile) {
    for (const a of profile.linkedAccounts) {
      linkedMap.set(a.provider, a);
    }
  }

  // GitHub avatar from providerAccountId (numeric user ID)
  const githubAccount = linkedMap.get("github");
  const githubAvatarUrl = githubAccount
    ? `https://avatars.githubusercontent.com/u/${githubAccount.providerAccountId}?s=40`
    : null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>

      {/* Profile Info */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <User className="h-5 w-5 text-muted-foreground" />
          <div>
            <CardTitle>{t("profileTitle")}</CardTitle>
            <CardDescription>{t("profileDesc")}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-20 items-center justify-center text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {tc("loading")}
            </div>
          ) : profile ? (
            <div className="flex items-start gap-4">
              {/* Avatar - external OAuth URLs, <img> is intentional */}
              {profile.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.image}
                  alt={tc("avatar")}
                  className="h-14 w-14 rounded-full border"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-xl font-semibold text-muted-foreground">
                  {(profile.name?.[0] || profile.email[0]).toUpperCase()}
                </div>
              )}
              <div className="grid gap-1.5 text-sm">
                <div className="text-base font-medium">{profile.name || t("noName")}</div>
                <div className="text-muted-foreground">{profile.email}</div>
                <div className="text-xs text-muted-foreground">
                  {t("registeredAt", { date: formatDate(profile.createdAt) })}
                </div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Linked Accounts */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <Link2 className="h-5 w-5 text-muted-foreground" />
          <div>
            <CardTitle>{t("linkedAccounts")}</CardTitle>
            <CardDescription>{t("linkedAccountsDesc")}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-20 items-center justify-center text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {tc("loading")}
            </div>
          ) : profile ? (
            <div className="space-y-0">
              {/* Credentials */}
              {(() => {
                const isLinked = profile.authMethods.includes("credentials");
                const config = providerConfig.credentials;
                const Icon = config.icon;
                return (
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${config.bgColor}`}>
                        <Icon className={`h-5 w-5 ${config.color}`} />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{config.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {isLinked ? t("emailPasswordLinked") : t("emailPasswordNotSet")}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      {isLinked ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span className="text-green-600">{t("enabled")}</span>
                        </>
                      ) : (
                        <>
                          <Circle className="h-4 w-4 text-muted-foreground/40" />
                          <span className="text-muted-foreground">{t("notEnabled")}</span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })()}

              <Separator />

              {/* GitHub */}
              {(() => {
                const isLinked = linkedMap.has("github");
                const config = providerConfig.github;
                const Icon = config.icon;
                return (
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${config.bgColor}`}>
                        <Icon className={`h-5 w-5 ${config.color}`} />
                      </div>
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="text-sm font-medium">{config.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {isLinked
                              ? t("githubLinked", { id: githubAccount!.providerAccountId })
                              : t("githubNotLinked")}
                          </div>
                        </div>
                        {isLinked && githubAvatarUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={githubAvatarUrl}
                            alt="GitHub"
                            className="h-6 w-6 rounded-full border"
                          />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      {isLinked ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span className="text-green-600">{t("linked")}</span>
                        </>
                      ) : (
                        <>
                          <Circle className="h-4 w-4 text-muted-foreground/40" />
                          <span className="text-muted-foreground">{t("notLinked")}</span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })()}

              <Separator />

              {/* Google */}
              {(() => {
                const isLinked = linkedMap.has("google");
                const googleAccount = linkedMap.get("google");
                const config = providerConfig.google;
                const Icon = config.icon;
                return (
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${config.bgColor}`}>
                        <Icon className={`h-5 w-5 ${config.color}`} />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{config.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {isLinked
                            ? t("googleLinked", { id: googleAccount!.providerAccountId })
                            : t("googleNotLinked")}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      {isLinked ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span className="text-green-600">{t("linked")}</span>
                        </>
                      ) : (
                        <>
                          <Circle className="h-4 w-4 text-muted-foreground/40" />
                          <span className="text-muted-foreground">{t("notLinked")}</span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Edit Profile */}
      <Card>
        <CardHeader>
          <CardTitle>{t("editProfile")}</CardTitle>
          <CardDescription>{t("editProfileDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-name">{t("nameLabel")}</Label>
            <Input
              id="edit-name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder={t("namePlaceholder")}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-email">{t("emailLabel")}</Label>
            <Input
              id="edit-email"
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              placeholder={t("emailPlaceholder")}
            />
          </div>
          <Button disabled={saving} onClick={handleSaveProfile}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("saveButton")}
          </Button>
        </CardContent>
      </Card>

      {/* Change Password — only for users with password auth */}
      {profile?.authMethods.includes("credentials") && (
      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <Lock className="h-5 w-5 text-muted-foreground" />
          <div>
            <CardTitle>{t("changePassword")}</CardTitle>
            <CardDescription>{t("changePasswordDesc")}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="old-pwd">{t("currentPassword")}</Label>
            <Input
              id="old-pwd"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder={t("currentPasswordPlaceholder")}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new-pwd">{t("newPassword")}</Label>
            <Input
              id="new-pwd"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t("newPasswordPlaceholder")}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirm-pwd">{t("confirmPassword")}</Label>
            <Input
              id="confirm-pwd"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t("confirmPasswordPlaceholder")}
            />
          </div>
          <Button disabled={changingPwd} onClick={handleChangePassword}>
            {changingPwd && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("changePasswordButton")}
          </Button>
        </CardContent>
      </Card>
      )}
    </div>
  );
}
