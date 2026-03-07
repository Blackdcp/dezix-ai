"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MessageSquare, Mail, Phone } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";

interface ContactDialogProps {
  children: React.ReactNode;
}

export function ContactDialog({ children }: ContactDialogProps) {
  const t = useTranslations("Contact");
  const [open, setOpen] = useState(false);

  const contacts = [
    {
      icon: MessageSquare,
      label: t("wechat"),
      value: "your-wechat-id",
      color: "text-green-500",
      bg: "bg-green-50 dark:bg-green-950/40",
    },
    {
      icon: Phone,
      label: t("phone"),
      value: "138-0000-0000",
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-950/40",
    },
    {
      icon: Mail,
      label: t("email"),
      value: "sales@dezix.ai",
      color: "text-orange-500",
      bg: "bg-orange-50 dark:bg-orange-950/40",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">
            {t("title")}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {t("subtitle")}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2 space-y-3">
          {contacts.map((c) => (
            <div
              key={c.label}
              className="flex items-center gap-4 rounded-xl border border-border bg-card p-4"
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${c.bg}`}
              >
                <c.icon className={`h-5 w-5 ${c.color}`} />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground">{c.label}</div>
                <div className="text-sm font-medium text-foreground">
                  {c.value}
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          {t("workingHours")}
        </p>
      </DialogContent>
    </Dialog>
  );
}
