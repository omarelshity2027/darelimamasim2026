"use client";

import { LogOut } from "lucide-react";
import { logout } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => void logout()}
      className="gap-2 text-muted-foreground"
    >
      <LogOut className="size-4" />
      خروج
    </Button>
  );
}
