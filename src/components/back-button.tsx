import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils"; // Hàm tiện ích của Shadcn để gộp class

interface BackButtonProps {
  href: string;        // Đường dẫn muốn quay về (Bắt buộc)
  label?: string;      // Chữ hiển thị (Tùy chọn, mặc định là "Back")
  className?: string;  // Để chỉnh margin/padding nếu cần
}

export function BackButton({ href, label = "Back", className }: BackButtonProps) {
  return (
    <Button 
      asChild 
      variant="outline" 
      size="sm" 
      className={cn("pl-0 gap-2 text-muted-foreground hover:text-primary", className)}
    >
      <Link href={href}>
        <ArrowLeft className="w-4 h-4" />
        {label}
      </Link>
    </Button>
  );
}