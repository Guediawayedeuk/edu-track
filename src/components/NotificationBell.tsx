import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { listMyNotifications, markAllAsRead, markAsRead, type Notification } from "@/lib/api/notifications";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const NotificationBell = () => {
  const [items, setItems] = useState<Notification[]>([]);
  const unread = items.filter((n) => !n.read_at).length;

  const load = async () => {
    try { setItems(await listMyNotifications(20)); } catch {}
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel("notifications-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, load)
      .subscribe();
    const t = setInterval(load, 30000);
    return () => { supabase.removeChannel(ch); clearInterval(t); };
  }, []);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative rounded-lg p-2 text-muted-foreground hover:bg-muted">
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between border-b p-3">
          <p className="font-semibold">Notifications</p>
          {unread > 0 && (
            <Button size="sm" variant="ghost" onClick={async () => { await markAllAsRead(); load(); }}>
              <Check className="mr-1 h-3 w-3" /> Tout marquer lu
            </Button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto divide-y">
          {items.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">Aucune notification</p>}
          {items.map((n) => (
            <Link
              key={n.id}
              to={n.link || "#"}
              onClick={async () => { if (!n.read_at) { await markAsRead(n.id); load(); } }}
              className={`block p-3 hover:bg-muted/50 ${!n.read_at ? "bg-primary/5" : ""}`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium">{n.title}</p>
                <span className="shrink-0 text-[10px] text-muted-foreground">
                  {formatDistanceToNow(new Date(n.created_at), { locale: fr, addSuffix: true })}
                </span>
              </div>
              {n.body && <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{n.body}</p>}
            </Link>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
