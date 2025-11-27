"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { markAllAsRead, getNotifications } from "@/actions/notification"; // Nhớ import getNotifications

export function NotificationBell({ initialNotifications }: { initialNotifications: any[] }) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isOpen, setIsOpen] = useState(false);

  // Tính số lượng chưa đọc
  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const interval = setInterval(async () => {
      // Gọi Server Action lấy dữ liệu mới nhất
      const latestNotifications = await getNotifications();
      if (latestNotifications) {
        setNotifications(latestNotifications);
      }
    }, 3000);

    // Dọn dẹp khi tắt component
    return () => clearInterval(interval);
  }, []);

  // Khi mở chuông -> Đánh dấu đã đọc
  const handleOpenChange = async (open: boolean) => {
      setIsOpen(open);
      if (open && unreadCount > 0) {
          await markAllAsRead();
          // Update Client ngay lập tức để mất chấm đỏ
          setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-muted-foreground" />
          
          {/* Chấm đỏ thần thánh */}
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-background animate-pulse" />
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b bg-muted/50 flex justify-between items-center">
            <h4 className="font-semibold leading-none">Notifications</h4>
            {unreadCount > 0 && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                    {unreadCount} new
                </span>
            )}
        </div>
        
        <div className="max-h-[300px] overflow-y-auto">
            {notifications.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">No notifications yet.</div>
            ) : (
                notifications.map((notification) => (
                    <Link 
                        key={notification.id} 
                        href={notification.link}
                        className={`block p-4 hover:bg-muted/50 transition-colors border-b last:border-0 ${!notification.isRead ? 'bg-primary/5' : ''}`}
                        onClick={() => setIsOpen(false)}
                    >
                        <div className="flex justify-between gap-2 mb-1">
                            <span className={`text-sm font-medium ${!notification.isRead ? 'text-primary' : 'text-muted-foreground'}`}>
                                {notification.isRead ? "Read" : "● New Message"}
                            </span>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </span>
                        </div>
                        <p className="text-sm text-foreground line-clamp-2">
                            {notification.message}
                        </p>
                    </Link>
                ))
            )}
        </div>
      </PopoverContent>
    </Popover>
  );
}