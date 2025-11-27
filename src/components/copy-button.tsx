"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

interface CopyButtonProps {
  code: string;
  className?: string;
}

export function CopyButton({ code, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault(); // Chặn sự kiện click lan ra ngoài (nếu nút nằm trong thẻ Link)
    e.stopPropagation(); 

    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Code copied to clipboard!");
      
      // Reset icon sau 2 giây
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  return (
    <div 
      onClick={handleCopy}
      className={`group flex items-center gap-2 bg-secondary/50 hover:bg-secondary px-2 py-1 rounded border border-secondary-foreground/10 cursor-pointer transition-colors ${className}`}
      title="Click to copy"
    >
      <span className="font-mono text-xs font-bold text-secondary-foreground tracking-wide">
        {code}
      </span>
      <div className="text-muted-foreground group-hover:text-foreground transition-colors">
        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      </div>
    </div>
  );
}