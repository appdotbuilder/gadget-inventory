import { trpc } from '@/utils/trpc';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Calendar, 
  Wrench,
  Info
} from 'lucide-react';
import type { Notification } from '../../../server/src/schema';

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
  notifications: Notification[];
  onNotificationRead: () => void;
}

export function NotificationPanel({ open, onClose, notifications, onNotificationRead }: NotificationPanelProps) {
  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await trpc.markNotificationAsRead.mutate({ id: notificationId });
      onNotificationRead();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await trpc.markAllNotificationsAsRead.mutate();
      onNotificationRead();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warranty_expiring':
        return <Calendar className="h-4 w-4 text-orange-500" />;
      case 'repair_reminder':
        return <Wrench className="h-4 w-4 text-red-500" />;
      case 'general':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'warranty_expiring':
        return 'bg-orange-100 text-orange-800';
      case 'repair_reminder':
        return 'bg-red-100 text-red-800';
      case 'general':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatNotificationTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
              {notifications.length > 0 && (
                <Badge variant="secondary">{notifications.length}</Badge>
              )}
            </SheetTitle>
            {notifications.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleMarkAllAsRead}
                className="gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Mark All Read
              </Button>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-100px)] mt-6">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
              <p className="text-gray-500">No new notifications to show.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification: Notification, index) => (
                <div key={notification.id}>
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                          {notification.title}
                        </h4>
                        <Badge 
                          variant="outline" 
                          className={`${getNotificationColor(notification.type)} text-xs whitespace-nowrap`}
                        >
                          {notification.type.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2 line-clamp-3">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          {formatNotificationTime(notification.created_at)}
                        </span>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="gap-1 text-xs h-6 px-2"
                        >
                          <CheckCircle className="h-3 w-3" />
                          Mark Read
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {index < notifications.length - 1 && <Separator className="my-2" />}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Quick Stats */}
        {notifications.length > 0 && (
          <div className="border-t pt-4 mt-4">
            <div className="grid grid-cols-3 gap-4 text-center text-xs">
              <div>
                <div className="font-medium text-orange-600">
                  {notifications.filter(n => n.type === 'warranty_expiring').length}
                </div>
                <div className="text-gray-500">Warranty</div>
              </div>
              <div>
                <div className="font-medium text-red-600">
                  {notifications.filter(n => n.type === 'repair_reminder').length}
                </div>
                <div className="text-gray-500">Repairs</div>
              </div>
              <div>
                <div className="font-medium text-blue-600">
                  {notifications.filter(n => n.type === 'general').length}
                </div>
                <div className="text-gray-500">General</div>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}