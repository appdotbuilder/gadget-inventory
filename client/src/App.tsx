import { useState, useEffect, useCallback } from 'react';
import { trpc } from '@/utils/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Plus, Search, BarChart3, Download, Scan, Users, Package } from 'lucide-react';
import { Dashboard } from '@/components/Dashboard';
import { AssetList } from '@/components/AssetList';
import { AssetForm } from '@/components/AssetForm';
import { UserManagement } from '@/components/UserManagement';
import { QRScanner } from '@/components/QRScanner';
import { NotificationPanel } from '@/components/NotificationPanel';
import { ExportDialog } from '@/components/ExportDialog';
import type { Asset, DashboardStats, Notification } from '../../server/src/schema';

type View = 'dashboard' | 'assets' | 'users' | 'add-asset' | 'scanner' | 'export';

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [userType, setUserType] = useState<'admin' | 'user'>('admin'); // In real app, get from auth

  const loadDashboardStats = useCallback(async () => {
    try {
      const stats = await trpc.getDashboardStats.query();
      setDashboardStats(stats);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    try {
      const notifications = await trpc.getUnreadNotifications.query();
      setUnreadNotifications(notifications);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  }, []);

  useEffect(() => {
    loadDashboardStats();
    loadNotifications();
    
    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      loadDashboardStats();
      loadNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [loadDashboardStats, loadNotifications]);

  const handleAssetCreated = () => {
    setCurrentView('assets');
    loadDashboardStats();
  };

  const handleAssetUpdated = () => {
    loadDashboardStats();
  };

  const handleNotificationRead = () => {
    loadNotifications();
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard stats={dashboardStats} onRefresh={loadDashboardStats} />;
      case 'assets':
        return <AssetList userType={userType} onAssetUpdated={handleAssetUpdated} />;
      case 'users':
        return userType === 'admin' ? <UserManagement /> : null;
      case 'add-asset':
        return userType === 'admin' ? <AssetForm onAssetCreated={handleAssetCreated} /> : null;
      case 'scanner':
        return <QRScanner />;
      case 'export':
        return <ExportDialog open={showExport} onClose={() => setShowExport(false)} />;
      default:
        return <Dashboard stats={dashboardStats} onRefresh={loadDashboardStats} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Package className="h-8 w-8 text-indigo-600" />
                <h1 className="text-xl font-bold text-gray-900">Asset Manager</h1>
              </div>
              <Badge variant={userType === 'admin' ? 'default' : 'secondary'}>
                {userType === 'admin' ? '👑 Admin' : '👤 User'}
              </Badge>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative"
              >
                <Bell className="h-5 w-5" />
                {unreadNotifications.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full text-xs p-0">
                    {unreadNotifications.length}
                  </Badge>
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowExport(true)}
              >
                <Download className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setUserType(userType === 'admin' ? 'user' : 'admin')}
                className="text-sm"
              >
                Switch to {userType === 'admin' ? 'User' : 'Admin'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-4 space-y-2">
            <Button
              variant={currentView === 'dashboard' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setCurrentView('dashboard')}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </Button>

            <Button
              variant={currentView === 'assets' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setCurrentView('assets')}
            >
              <Package className="h-4 w-4 mr-2" />
              Assets
            </Button>

            {userType === 'admin' && (
              <Button
                variant={currentView === 'users' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setCurrentView('users')}
              >
                <Users className="h-4 w-4 mr-2" />
                Users
              </Button>
            )}

            {userType === 'admin' && (
              <Button
                variant={currentView === 'add-asset' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setCurrentView('add-asset')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Asset
              </Button>
            )}

            <Button
              variant={currentView === 'scanner' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setCurrentView('scanner')}
            >
              <Scan className="h-4 w-4 mr-2" />
              QR Scanner
            </Button>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>

      {/* Notification Panel */}
      <NotificationPanel
        open={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={unreadNotifications}
        onNotificationRead={handleNotificationRead}
      />

      {/* Export Dialog */}
      <ExportDialog
        open={showExport}
        onClose={() => setShowExport(false)}
      />
    </div>
  );
}

export default App;