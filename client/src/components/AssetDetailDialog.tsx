import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  User, 
  Package, 
  Calendar, 
  MapPin, 
  Hash, 
  Smartphone,
  Wifi,
  Settings,
  CheckCircle,
  XCircle,
  Wrench,
  AlertTriangle,
  Building,
  UserCheck,
  Laptop
} from 'lucide-react';
import type { Asset } from '../../../server/src/schema';

interface AssetDetailDialogProps {
  asset: Asset | null;
  open: boolean;
  onClose: () => void;
}

export function AssetDetailDialog({ asset, open, onClose }: AssetDetailDialogProps) {
  if (!asset) return null;

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

  const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | null | undefined }) => {
    if (!value) return null;
    
    return (
      <div className="flex items-start gap-3 py-2">
        <div className="mt-0.5">{icon}</div>
        <div className="flex-1">
          <dt className="text-sm font-medium text-gray-500">{label}</dt>
          <dd className="text-sm text-gray-900 mt-1">{value}</dd>
        </div>
      </div>
    );
  };

  const SectionTitle = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
    <div className="flex items-center gap-2 font-semibold text-gray-900 mb-4">
      {icon}
      <span>{title}</span>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <span className="text-2xl">{getCategoryEmoji(asset.category)}</span>
            <div>
              <div className="font-bold">
                {asset.equipment_brand} {asset.equipment_type}
              </div>
              <div className="text-sm text-gray-500 font-normal flex items-center gap-2">
                <Hash className="h-3 w-3" />
                {asset.asset_number}
                <Badge className={getStatusColor(asset.status)}>
                  {getStatusIcon(asset.status)}
                  <span className="ml-1 capitalize">{asset.status}</span>
                </Badge>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* User Information */}
            {(asset.user_name || asset.user_nik) && (
              <div>
                <SectionTitle icon={<User className="h-5 w-5" />} title="User Information" />
                <div className="bg-blue-50 rounded-lg p-4 space-y-1">
                  <InfoRow icon={<UserCheck className="h-4 w-4 text-blue-600" />} label="Name" value={asset.user_name} />
                  <InfoRow icon={<Hash className="h-4 w-4 text-blue-600" />} label="NIK" value={asset.user_nik} />
                  <InfoRow icon={<Building className="h-4 w-4 text-blue-600" />} label="Position" value={asset.user_position} />
                  <InfoRow icon={<Building className="h-4 w-4 text-blue-600" />} label="Unit" value={asset.user_unit} />
                  <InfoRow icon={<MapPin className="h-4 w-4 text-blue-600" />} label="Location" value={asset.user_location} />
                </div>
              </div>
            )}

            <Separator />

            {/* Asset Details */}
            <div>
              <SectionTitle icon={<Package className="h-5 w-5" />} title="Asset Details" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <InfoRow icon={<Hash className="h-4 w-4 text-purple-600" />} label="Asset Number" value={asset.asset_number} />
                  <InfoRow icon={<Hash className="h-4 w-4 text-purple-600" />} label="Inventory Number" value={asset.inventory_number} />
                  <InfoRow icon={<Package className="h-4 w-4 text-purple-600" />} label="Category" value={asset.category.replace('_', ' ')} />
                  <InfoRow icon={<Building className="h-4 w-4 text-purple-600" />} label="Brand" value={asset.equipment_brand} />
                  <InfoRow icon={<Laptop className="h-4 w-4 text-purple-600" />} label="Type" value={asset.equipment_type} />
                </div>
                <div className="space-y-1">
                  <InfoRow icon={<Building className="h-4 w-4 text-purple-600" />} label="Supplier" value={asset.supplier} />
                  <InfoRow icon={<Calendar className="h-4 w-4 text-purple-600" />} label="Purchase Date" value={asset.purchase_date} />
                  <InfoRow icon={<Calendar className="h-4 w-4 text-purple-600" />} label="Warranty Date" value={asset.warranty_date} />
                  <InfoRow icon={<MapPin className="h-4 w-4 text-purple-600" />} label="Repair Location" value={asset.repair_location} />
                </div>
              </div>
            </div>

            <Separator />

            {/* Technical Information */}
            {(asset.imei_number || asset.serial_number || asset.wifi_mac_address) && (
              <>
                <div>
                  <SectionTitle icon={<Settings className="h-5 w-5" />} title="Technical Information" />
                  <div className="bg-gray-50 rounded-lg p-4 space-y-1">
                    <InfoRow icon={<Smartphone className="h-4 w-4 text-gray-600" />} label="IMEI Number" value={asset.imei_number} />
                    <InfoRow icon={<Hash className="h-4 w-4 text-gray-600" />} label="Serial Number" value={asset.serial_number} />
                    <InfoRow icon={<Wifi className="h-4 w-4 text-gray-600" />} label="Wi-Fi MAC Address" value={asset.wifi_mac_address} />
                    <InfoRow icon={<User className="h-4 w-4 text-gray-600" />} label="eFACT User ID" value={asset.user_id_efact} />
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Application Details */}
            {(asset.apk_harv || asset.apk_upk || asset.apk_nurs || 
              asset.uuid_harvesting || asset.uuid_upkeep || asset.uuid_nursery ||
              asset.code_harvesting || asset.code_upkeep || asset.code_nursery || asset.code_replanting) && (
              <>
                <div>
                  <SectionTitle icon={<Smartphone className="h-5 w-5" />} title="Application Details" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* APK Section */}
                    {(asset.apk_harv || asset.apk_upk || asset.apk_nurs) && (
                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="font-medium text-green-800 mb-2">APK Versions</h4>
                        <div className="space-y-1">
                          <InfoRow icon={<Settings className="h-3 w-3 text-green-600" />} label="Harvesting" value={asset.apk_harv} />
                          <InfoRow icon={<Settings className="h-3 w-3 text-green-600" />} label="Upkeep" value={asset.apk_upk} />
                          <InfoRow icon={<Settings className="h-3 w-3 text-green-600" />} label="Nursery" value={asset.apk_nurs} />
                        </div>
                      </div>
                    )}

                    {/* UUID Section */}
                    {(asset.uuid_harvesting || asset.uuid_upkeep || asset.uuid_nursery) && (
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-medium text-blue-800 mb-2">UUID Codes</h4>
                        <div className="space-y-1">
                          <InfoRow icon={<Hash className="h-3 w-3 text-blue-600" />} label="Harvesting" value={asset.uuid_harvesting} />
                          <InfoRow icon={<Hash className="h-3 w-3 text-blue-600" />} label="Upkeep" value={asset.uuid_upkeep} />
                          <InfoRow icon={<Hash className="h-3 w-3 text-blue-600" />} label="Nursery" value={asset.uuid_nursery} />
                        </div>
                      </div>
                    )}

                    {/* Codes Section */}
                    {(asset.code_harvesting || asset.code_upkeep || asset.code_nursery || asset.code_replanting) && (
                      <div className="bg-yellow-50 rounded-lg p-4">
                        <h4 className="font-medium text-yellow-800 mb-2">Activity Codes</h4>
                        <div className="space-y-1">
                          <InfoRow icon={<Hash className="h-3 w-3 text-yellow-600" />} label="Harvesting" value={asset.code_harvesting} />
                          <InfoRow icon={<Hash className="h-3 w-3 text-yellow-600" />} label="Upkeep" value={asset.code_upkeep} />
                          <InfoRow icon={<Hash className="h-3 w-3 text-yellow-600" />} label="Nursery" value={asset.code_nursery} />
                          <InfoRow icon={<Hash className="h-3 w-3 text-yellow-600" />} label="Replanting" value={asset.code_replanting} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Status & Flags */}
            <div>
              <SectionTitle icon={<CheckCircle className="h-5 w-5" />} title="Status & Flags" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">RegMis:</span>
                    <Badge variant={asset.sent_to_regmis ? "default" : "outline"}>
                      {asset.sent_to_regmis ? "✅ Sent" : "❌ Not Sent"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">JKTO:</span>
                    <Badge variant={asset.sent_to_jkto ? "default" : "outline"}>
                      {asset.sent_to_jkto ? "✅ Sent" : "❌ Not Sent"}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <InfoRow icon={<Hash className="h-4 w-4 text-gray-600" />} label="Recommendation Number" value={asset.recommendation_number} />
                </div>
              </div>
            </div>

            {/* Notes and Usage */}
            {(asset.notes || asset.gadget_usage) && (
              <>
                <Separator />
                <div className="space-y-4">
                  {asset.notes && (
                    <div>
                      <SectionTitle icon={<AlertTriangle className="h-5 w-5" />} title="Notes" />
                      <div className="bg-orange-50 rounded-lg p-4">
                        <p className="text-sm text-gray-700">{asset.notes}</p>
                      </div>
                    </div>
                  )}

                  {asset.gadget_usage && (
                    <div>
                      <SectionTitle icon={<Settings className="h-5 w-5" />} title="Gadget Usage" />
                      <div className="bg-blue-50 rounded-lg p-4">
                        <p className="text-sm text-gray-700">{asset.gadget_usage}</p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Metadata */}
            <Separator />
            <div>
              <SectionTitle icon={<Calendar className="h-5 w-5" />} title="Record Information" />
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                <div>
                  <strong>Created:</strong> {asset.created_at.toLocaleDateString()} {asset.created_at.toLocaleTimeString()}
                </div>
                <div>
                  <strong>Updated:</strong> {asset.updated_at.toLocaleDateString()} {asset.updated_at.toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}