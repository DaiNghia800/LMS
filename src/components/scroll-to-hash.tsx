"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export function ScrollToHash() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Lấy phần hash từ URL (ví dụ: #post-clp...)
    // Lưu ý: Next.js useSearchParams không lấy được hash trực tiếp, nên ta dùng window.location.hash
    const hash = window.location.hash;
    
    if (hash) {
      // Tìm phần tử có ID tương ứng
      const id = hash.replace("#", "");
      const element = document.getElementById(id);

      if (element) {
        // Nếu thấy ngay -> Cuộn xuống
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        // Hiệu ứng nhấp nháy để gây chú ý (Optional)
        element.classList.add("ring-2", "ring-primary", "transition-all", "duration-1000");
        setTimeout(() => {
            element.classList.remove("ring-2", "ring-primary");
        }, 2000);
      } else {
        // Nếu chưa thấy (do đang load) -> Thử lại sau 1 chút
        const timer = setTimeout(() => {
            const el = document.getElementById(id);
            if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "center" });
                el.classList.add("ring-2", "ring-primary", "transition-all", "duration-1000");
                setTimeout(() => el.classList.remove("ring-2", "ring-primary"), 2000);
            }
        }, 1000); // Chờ 1 giây
        return () => clearTimeout(timer);
      }
    }
  }, [searchParams]); // Chạy lại khi URL thay đổi

  return null; // Component này không hiển thị gì cả
}