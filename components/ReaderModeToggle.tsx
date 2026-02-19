"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { BookOpen, BookX } from "lucide-react";

export default function ReaderModeToggle({ targetId = "article-container" }: { targetId?: string }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // initialize from localStorage
    try {
      const stored = localStorage.getItem("reader_mode");
      if (stored === "on") setEnabled(true);
    } catch {}
  }, []);

  useEffect(() => {
    const el = document.getElementById(targetId);
    if (!el) return;
    if (enabled) {
      el.classList.add("reader-mode");
      document.documentElement.setAttribute("data-reader", "on");
      try { localStorage.setItem("reader_mode", "on"); } catch {}
    } else {
      el.classList.remove("reader-mode");
      document.documentElement.removeAttribute("data-reader");
      try { localStorage.removeItem("reader_mode"); } catch {}
    }
    return () => {
      el.classList.remove("reader-mode");
    };
  }, [enabled, targetId]);

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => setEnabled((v) => !v)}
      aria-pressed={enabled}
      aria-label={enabled ? "Disable reader mode" : "Enable reader mode"}
      className="ml-auto"
    >
      {enabled ? <BookX className="h-4 w-4 mr-2" /> : <BookOpen className="h-4 w-4 mr-2" />}
      {enabled ? "Reader Off" : "Reader Mode"}
    </Button>
  );
}
