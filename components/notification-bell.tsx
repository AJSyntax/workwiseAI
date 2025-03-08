"use client"

import { useEffect, useState } from "react"
import { useSupabase } from "@/components/providers/supabase-provider"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Bell } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  read: boolean
  created_at: string
}

export function NotificationBell() {
  const { supabase, user, error } = useSupabase()
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && supabase && !error) {
      fetchNotifications()

      // Subscribe to new notifications
      const channel = supabase
        .channel(`notifications:${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const newNotification = payload.new as Notification
            setNotifications((prev) => [newNotification, ...prev])
            setUnreadCount((prev) => prev + 1)

            toast({
              title: newNotification.title,
              description: newNotification.message,
            })
          },
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [user, supabase, toast, error])

  const fetchNotifications = async () => {
    if (!user || !supabase) return

    setLoading(true)
    try {
      const { data, error: fetchError } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10)

      if (fetchError) throw fetchError

      setNotifications(data || [])
      setUnreadCount(data?.filter((n) => !n.read).length || 0)
    } catch (err: any) {
      console.error("Error fetching notifications:", err)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    if (!supabase) return

    try {
      const { error: updateError } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId)

      if (updateError) throw updateError

      setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (err: any) {
      console.error("Error marking notification as read:", err)
    }
  }

  const markAllAsRead = async () => {
    if (!user || !supabase) return

    try {
      const { error: updateError } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", user.id)
        .eq("read", false)

      if (updateError) throw updateError

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (err: any) {
      console.error("Error marking all notifications as read:", err)
    }
  }

  // If there's an error with Supabase, don't render the notification bell
  if (error || !supabase) {
    return null
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0"
              variant="destructive"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-medium">Notifications</h4>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>
        <ScrollArea className="h-80">
          {loading ? (
            <div className="p-4 text-center">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No notifications yet</div>
          ) : (
            <div>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b ${!notification.read ? "bg-muted/50" : ""}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex justify-between items-start">
                    <h5 className="font-medium">{notification.title}</h5>
                    <span className="text-xs text-gray-500">
                      {new Date(notification.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-sm mt-1">{notification.message}</p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}

