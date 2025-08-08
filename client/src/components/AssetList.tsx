import { useState, useEffect, useCallback } from 'react';
import { trpc } from '@/utils/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Wrench,
  Calendar,
  MapPin,
  User,
  Hash,
  Smartphone
} from 'lucide-react';
import { AssetDetailDialog } from '@/components/AssetDetailDialog';
import { AssetEditDialog } from '@/components/AssetEditDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { Asset, AssetSearchInput } from '../../../server/src/schema';

interface AssetListProps {
  userType: 'admin' | 'user';
  onAssetUpdated: () => void;
}

export function AssetList({ userType, onAssetUpdated }: AssetListProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [totalAssets, setTotalAssets] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [deletingAsset, setDeletingAsset] = useState<Asset | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  const [searchFilters, setSearchFilters] = useState<AssetSearchInput>({
    search_term: '',
    category: undefined,
    status: undefined,
    user_unit: '',
    user_location: '',
    equipment_brand: '',
    page: 1,
    limit: 20
  });

  const loadAssets = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await trpc.searchAssets.query(searchFilters);
      setAssets(result.assets);
      setTotalAssets(result.total);
      setCurrentPage(result.page);
    } catch (error) {
      console.error('Failed to load assets:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchFilters]);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  const handleSearch = (value: string) => {
    setSearchFilters((prev: AssetSearchInput) => ({ 
      ...prev, 
      search_term: value,
      page: 1
    }));
  };

  const handleFilterChange = (key: keyof AssetSearchInput, value: any) => {
    setSearchFilters((prev: AssetSearchInput) => ({ 
      ...prev, 
      [key]: value || undefined,
      page: 1
    }));
  };

  const clearFilters = () => {
    setSearchFilters({
      search_term: '',
      category: undefined,
      status: undefined,
      user_unit: '',
      user_location: '',
      equipment_brand: '',
      page: 1,
      limit: 20
    });
  };

  const handleDeleteAsset = async () => {
    if (!deletingAsset) return;
    
    try {
      await trpc.deleteAsset.mutate({ id: deletingAsset.id });
      setAssets((prev: Asset[]) => prev.filter(asset => asset.id !== deletingAsset.id));
      onAssetUpdated();
    } catch (error) {
      console.error('Failed to delete asset:', error);
    } finally {
      setDeletingAsset(null);
    }
  };

  const handleAssetEdited = (updatedAsset: Asset) => {
    setAssets((prev: Asset[]) => 
      prev.map(asset => asset.id === updatedAsset.id ? updatedAsset : asset)
    );
    onAssetUpdated();
    setEditingAsset(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'baik': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rusak': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'perbaikan': return <Wrench className="h-4 w-4 text-yellow-500" />;
      case 'hilang': return <AlertTriangle className="h-4 w-4 text-gray-500" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'baik': return 'bg-green-100 text-green-800';
      case 'rusak': return 'bg-red-100 text-red-800';
      case 'perbaikan': return 'bg-yellow-100 text-yellow-800';
      case 'hilang': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getCategoryEmoji = (category: string) => {
    const emojis: Record<string, string> = {
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
    return emojis[category] || '📦';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">📦 Assets</h2>
        <Badge variant="outline" className="text-sm">
          {totalAssets > 0 ? `${totalAssets} assets found` : `${assets.length} assets shown`}
        </Badge>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Search & Filter</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search assets by name, asset number, IMEI, serial number..."
              value={searchFilters.search_term || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
              <Select 
                value={searchFilters.category || ''} 
                onValueChange={(value) => handleFilterChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  <SelectItem value="smartphone">📱 Smartphone</SelectItem>
                  <SelectItem value="tablet">📱 Tablet</SelectItem>
                  <SelectItem value="laptop">💻 Laptop</SelectItem>
                  <SelectItem value="desktop">🖥️ Desktop</SelectItem>
                  <SelectItem value="printer">🖨️ Printer</SelectItem>
                  <SelectItem value="scanner">📄 Scanner</SelectItem>
                  <SelectItem value="router">📡 Router</SelectItem>
                  <SelectItem value="switch">🔀 Switch</SelectItem>
                  <SelectItem value="access_point">📶 Access Point</SelectItem>
                  <SelectItem value="other">📦 Other</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={searchFilters.status || ''} 
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="baik">✅ Baik</SelectItem>
                  <SelectItem value="rusak">❌ Rusak</SelectItem>
                  <SelectItem value="perbaikan">🔧 Perbaikan</SelectItem>
                  <SelectItem value="hilang">❓ Hilang</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="Unit"
                value={searchFilters.user_unit || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  handleFilterChange('user_unit', e.target.value)
                }
              />

              <Input
                placeholder="Location"
                value={searchFilters.user_location || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  handleFilterChange('user_location', e.target.value)
                }
              />

              <Input
                placeholder="Brand"
                value={searchFilters.equipment_brand || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  handleFilterChange('equipment_brand', e.target.value)
                }
              />

              <Button variant="outline" onClick={clearFilters} className="gap-2">
                <XCircle className="h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assets Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : assets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assets found</h3>
            <p className="text-gray-500">
              {searchFilters.search_term || Object.values(searchFilters).some(v => v && v !== 1 && v !== 20)
                ? "Try adjusting your search or filters"
                : "Start by adding your first asset"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.map((asset: Asset) => (
            <Card key={asset.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span className="text-xl">{getCategoryEmoji(asset.category)}</span>
                      {asset.equipment_brand} {asset.equipment_type}
                    </CardTitle>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                      <Hash className="h-3 w-3" />
                      {asset.asset_number}
                    </p>
                  </div>
                  <Badge className={getStatusColor(asset.status)}>
                    {getStatusIcon(asset.status)}
                    <span className="ml-1 capitalize">{asset.status}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* User Info */}
                {asset.user_name && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>{asset.user_name}</span>
                  </div>
                )}

                {/* Location */}
                {asset.user_location && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{asset.user_location}</span>
                  </div>
                )}

                {/* Serial/IMEI */}
                {(asset.serial_number || asset.imei_number) && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Smartphone className="h-4 w-4" />
                    <span>{asset.serial_number || asset.imei_number}</span>
                  </div>
                )}

                {/* Warranty */}
                {asset.warranty_date && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Warranty: {asset.warranty_date}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedAsset(asset)}
                    className="flex-1 gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                  
                  {userType === 'admin' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingAsset(asset)}
                        className="gap-2"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeletingAsset(asset)}
                        className="gap-2 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Asset Detail Dialog */}
      <AssetDetailDialog
        asset={selectedAsset}
        open={!!selectedAsset}
        onClose={() => setSelectedAsset(null)}
      />

      {/* Asset Edit Dialog */}
      {userType === 'admin' && editingAsset && (
        <AssetEditDialog
          asset={editingAsset}
          open={!!editingAsset}
          onClose={() => setEditingAsset(null)}
          onAssetUpdated={handleAssetEdited}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingAsset} onOpenChange={() => setDeletingAsset(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Asset</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this asset? This action cannot be undone.
              <br />
              <strong>Asset:</strong> {deletingAsset?.equipment_brand} {deletingAsset?.equipment_type}
              <br />
              <strong>Number:</strong> {deletingAsset?.asset_number}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAsset} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}