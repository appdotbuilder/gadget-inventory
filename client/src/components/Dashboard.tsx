import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Package, 
  AlertTriangle, 
  Wrench, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  TrendingUp,
  MapPin,
  Calendar
} from 'lucide-react';
import type { DashboardStats } from '../../../server/src/schema';

interface DashboardProps {
  stats: DashboardStats | null;
  onRefresh: () => void;
}

export function Dashboard({ stats, onRefresh }: DashboardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  if (!stats) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900">📊 Dashboard</h2>
          <Button onClick={handleRefresh} disabled className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Loading...
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const statusIcons = {
    baik: <CheckCircle className="h-5 w-5 text-green-500" />,
    rusak: <XCircle className="h-5 w-5 text-red-500" />,
    perbaikan: <Wrench className="h-5 w-5 text-yellow-500" />,
    hilang: <AlertTriangle className="h-5 w-5 text-gray-500" />
  };

  const categoryEmojis: Record<string, string> = {
    smartphone: '📱',
    tablet: '📱',
    laptop: '💻',
    desktop: '🖥️',
    printer: '🖨️',
    scanner: '📄',
    router: '📡',
    switch: '🔀',
    access_point: '📶',
    other: '📦'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">📊 Dashboard</h2>
        <Button 
          onClick={handleRefresh} 
          disabled={isRefreshing}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Total Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Package className="h-8 w-8" />
              <span className="text-2xl font-bold">{stats.total_assets}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Warranty Expiring</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-8 w-8" />
              <span className="text-2xl font-bold">{stats.warranty_expiring_soon}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-500 to-pink-500 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">In Repair</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Wrench className="h-8 w-8" />
              <span className="text-2xl font-bold">{stats.assets_in_repair}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Health Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-8 w-8" />
              <span className="text-2xl font-bold">
                {stats.total_assets > 0 
                  ? Math.round(((stats.assets_by_status.baik || 0) / stats.total_assets) * 100)
                  : 0}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assets by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📊 Assets by Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(stats.assets_by_status).map(([status, count]) => {
              const percentage = stats.total_assets > 0 ? (count / stats.total_assets) * 100 : 0;
              return (
                <div key={status} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {statusIcons[status as keyof typeof statusIcons]}
                      <span className="capitalize font-medium">{status}</span>
                    </div>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Assets by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📦 Assets by Category
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(stats.assets_by_category)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 6)
              .map(([category, count]) => {
                const percentage = stats.total_assets > 0 ? (count / stats.total_assets) * 100 : 0;
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{categoryEmojis[category] || '📦'}</span>
                        <span className="capitalize font-medium">
                          {category.replace('_', ' ')}
                        </span>
                      </div>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
          </CardContent>
        </Card>

        {/* Assets by Location */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Assets by Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(stats.assets_by_location)
                .sort(([, a], [, b]) => b - a)
                .map(([location, count]) => (
                  <div key={location} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{location || 'Unknown Location'}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardHeader>
          <CardTitle>🚀 Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Package className="h-6 w-6" />
              <span className="text-sm">View All Assets</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <AlertTriangle className="h-6 w-6" />
              <span className="text-sm">Warranty Alerts</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Wrench className="h-6 w-6" />
              <span className="text-sm">Repair Queue</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <TrendingUp className="h-6 w-6" />
              <span className="text-sm">Generate Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}