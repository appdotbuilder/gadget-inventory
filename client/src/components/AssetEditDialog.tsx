import { useState, useEffect } from 'react';
import { trpc } from '@/utils/trpc';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, Package, User, Settings, Calendar } from 'lucide-react';
import type { Asset, UpdateAssetInput } from '../../../server/src/schema';

interface AssetEditDialogProps {
  asset: Asset;
  open: boolean;
  onClose: () => void;
  onAssetUpdated: (updatedAsset: Asset) => void;
}

export function AssetEditDialog({ asset, open, onClose, onAssetUpdated }: AssetEditDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<UpdateAssetInput>({
    id: asset.id,
    user_nik: asset.user_nik,
    user_name: asset.user_name,
    user_position: asset.user_position,
    user_unit: asset.user_unit,
    user_location: asset.user_location,
    asset_number: asset.asset_number,
    inventory_number: asset.inventory_number,
    imei_number: asset.imei_number,
    serial_number: asset.serial_number,
    wifi_mac_address: asset.wifi_mac_address,
    purchase_date: asset.purchase_date,
    warranty_date: asset.warranty_date,
    category: asset.category,
    equipment_brand: asset.equipment_brand,
    equipment_type: asset.equipment_type,
    supplier: asset.supplier,
    apk_harv: asset.apk_harv,
    apk_upk: asset.apk_upk,
    apk_nurs: asset.apk_nurs,
    uuid_harvesting: asset.uuid_harvesting,
    uuid_upkeep: asset.uuid_upkeep,
    uuid_nursery: asset.uuid_nursery,
    code_harvesting: asset.code_harvesting,
    code_upkeep: asset.code_upkeep,
    code_nursery: asset.code_nursery,
    code_replanting: asset.code_replanting,
    user_id_efact: asset.user_id_efact,
    status: asset.status,
    notes: asset.notes,
    repair_location: asset.repair_location,
    sent_to_regmis: asset.sent_to_regmis,
    sent_to_jkto: asset.sent_to_jkto,
    recommendation_number: asset.recommendation_number,
    gadget_usage: asset.gadget_usage
  });

  useEffect(() => {
    if (asset) {
      setFormData({
        id: asset.id,
        user_nik: asset.user_nik,
        user_name: asset.user_name,
        user_position: asset.user_position,
        user_unit: asset.user_unit,
        user_location: asset.user_location,
        asset_number: asset.asset_number,
        inventory_number: asset.inventory_number,
        imei_number: asset.imei_number,
        serial_number: asset.serial_number,
        wifi_mac_address: asset.wifi_mac_address,
        purchase_date: asset.purchase_date,
        warranty_date: asset.warranty_date,
        category: asset.category,
        equipment_brand: asset.equipment_brand,
        equipment_type: asset.equipment_type,
        supplier: asset.supplier,
        apk_harv: asset.apk_harv,
        apk_upk: asset.apk_upk,
        apk_nurs: asset.apk_nurs,
        uuid_harvesting: asset.uuid_harvesting,
        uuid_upkeep: asset.uuid_upkeep,
        uuid_nursery: asset.uuid_nursery,
        code_harvesting: asset.code_harvesting,
        code_upkeep: asset.code_upkeep,
        code_nursery: asset.code_nursery,
        code_replanting: asset.code_replanting,
        user_id_efact: asset.user_id_efact,
        status: asset.status,
        notes: asset.notes,
        repair_location: asset.repair_location,
        sent_to_regmis: asset.sent_to_regmis,
        sent_to_jkto: asset.sent_to_jkto,
        recommendation_number: asset.recommendation_number,
        gadget_usage: asset.gadget_usage
      });
    }
  }, [asset]);

  const handleInputChange = (field: keyof UpdateAssetInput, value: any) => {
    setFormData((prev: UpdateAssetInput) => ({
      ...prev,
      [field]: value || null
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const updatedAsset = await trpc.updateAsset.mutate(formData);
      onAssetUpdated(updatedAsset);
    } catch (error) {
      console.error('Failed to update asset:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Edit Asset: {asset.equipment_brand} {asset.equipment_type}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <ScrollArea className="max-h-[70vh] pr-4">
            <Tabs defaultValue="basic" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="user">User</TabsTrigger>
                <TabsTrigger value="technical">Technical</TabsTrigger>
                <TabsTrigger value="applications">Apps</TabsTrigger>
              </TabsList>

              {/* Basic Information */}
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="asset_number">Asset Number *</Label>
                    <Input
                      id="asset_number"
                      value={formData.asset_number || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        handleInputChange('asset_number', e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="inventory_number">Inventory Number</Label>
                    <Input
                      id="inventory_number"
                      value={formData.inventory_number || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        handleInputChange('inventory_number', e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={formData.category || ''} 
                      onValueChange={(value) => handleInputChange('category', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={formData.status || ''} 
                      onValueChange={(value) => handleInputChange('status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baik">✅ Baik</SelectItem>
                        <SelectItem value="rusak">❌ Rusak</SelectItem>
                        <SelectItem value="perbaikan">🔧 Perbaikan</SelectItem>
                        <SelectItem value="hilang">❓ Hilang</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="equipment_brand">Equipment Brand</Label>
                    <Input
                      id="equipment_brand"
                      value={formData.equipment_brand || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        handleInputChange('equipment_brand', e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="equipment_type">Equipment Type</Label>
                    <Input
                      id="equipment_type"
                      value={formData.equipment_type || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        handleInputChange('equipment_type', e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="supplier">Supplier</Label>
                    <Input
                      id="supplier"
                      value={formData.supplier || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        handleInputChange('supplier', e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="purchase_date">Purchase Date</Label>
                    <Input
                      id="purchase_date"
                      type="date"
                      value={formData.purchase_date || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        handleInputChange('purchase_date', e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="warranty_date">Warranty Date</Label>
                    <Input
                      id="warranty_date"
                      type="date"
                      value={formData.warranty_date || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        handleInputChange('warranty_date', e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes || ''}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                      handleInputChange('notes', e.target.value)
                    }
                    rows={3}
                  />
                </div>
              </TabsContent>

              {/* User Assignment */}
              <TabsContent value="user" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="user_nik">User NIK</Label>
                    <Input
                      id="user_nik"
                      value={formData.user_nik || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        handleInputChange('user_nik', e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="user_name">User Name</Label>
                    <Input
                      id="user_name"
                      value={formData.user_name || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        handleInputChange('user_name', e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="user_position">User Position</Label>
                    <Input
                      id="user_position"
                      value={formData.user_position || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        handleInputChange('user_position', e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="user_unit">User Unit</Label>
                    <Input
                      id="user_unit"
                      value={formData.user_unit || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        handleInputChange('user_unit', e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="user_location">User Location</Label>
                    <Input
                      id="user_location"
                      value={formData.user_location || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        handleInputChange('user_location', e.target.value)
                      }
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Technical Details */}
              <TabsContent value="technical" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="imei_number">IMEI Number</Label>
                    <Input
                      id="imei_number"
                      value={formData.imei_number || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        handleInputChange('imei_number', e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="serial_number">Serial Number</Label>
                    <Input
                      id="serial_number"
                      value={formData.serial_number || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        handleInputChange('serial_number', e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="wifi_mac_address">Wi-Fi MAC Address</Label>
                    <Input
                      id="wifi_mac_address"
                      value={formData.wifi_mac_address || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        handleInputChange('wifi_mac_address', e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="user_id_efact">User ID eFACT</Label>
                    <Input
                      id="user_id_efact"
                      value={formData.user_id_efact || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        handleInputChange('user_id_efact', e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="repair_location">Repair Location</Label>
                    <Input
                      id="repair_location"
                      value={formData.repair_location || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        handleInputChange('repair_location', e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recommendation_number">Recommendation Number</Label>
                    <Input
                      id="recommendation_number"
                      value={formData.recommendation_number || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        handleInputChange('recommendation_number', e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="gadget_usage">Gadget Usage</Label>
                    <Textarea
                      id="gadget_usage"
                      value={formData.gadget_usage || ''}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                        handleInputChange('gadget_usage', e.target.value)
                      }
                      rows={2}
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="sent_to_regmis"
                      checked={formData.sent_to_regmis || false}
                      onCheckedChange={(checked) => handleInputChange('sent_to_regmis', checked)}
                    />
                    <Label htmlFor="sent_to_regmis">Sent to RegMis</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="sent_to_jkto"
                      checked={formData.sent_to_jkto || false}
                      onCheckedChange={(checked) => handleInputChange('sent_to_jkto', checked)}
                    />
                    <Label htmlFor="sent_to_jkto">Sent to JKTO</Label>
                  </div>
                </div>
              </TabsContent>

              {/* Applications */}
              <TabsContent value="applications" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* APK Fields */}
                  <div className="space-y-2">
                    <Label htmlFor="apk_harv">APK Harvesting</Label>
                    <Input
                      id="apk_harv"
                      value={formData.apk_harv || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        handleInputChange('apk_harv', e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apk_upk">APK Upkeep</Label>
                    <Input
                      id="apk_upk"
                      value={formData.apk_upk || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        handleInputChange('apk_upk', e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apk_nurs">APK Nursery</Label>
                    <Input
                      id="apk_nurs"
                      value={formData.apk_nurs || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        handleInputChange('apk_nurs', e.target.value)
                      }
                    />
                  </div>

                  {/* UUID Fields */}
                  <div className="space-y-2">
                    <Label htmlFor="uuid_harvesting">UUID Harvesting</Label>
                    <Input
                      id="uuid_harvesting"
                      value={formData.uuid_harvesting || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        handleInputChange('uuid_harvesting', e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="uuid_upkeep">UUID Upkeep</Label>
                    <Input
                      id="uuid_upkeep"
                      value={formData.uuid_upkeep || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        handleInputChange('uuid_upkeep', e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="uuid_nursery">UUID Nursery</Label>
                    <Input
                      id="uuid_nursery"
                      value={formData.uuid_nursery || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        handleInputChange('uuid_nursery', e.target.value)
                      }
                    />
                  </div>

                  {/* Code Fields */}
                  <div className="space-y-2">
                    <Label htmlFor="code_harvesting">Code Harvesting</Label>
                    <Input
                      id="code_harvesting"
                      value={formData.code_harvesting || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        handleInputChange('code_harvesting', e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="code_upkeep">Code Upkeep</Label>
                    <Input
                      id="code_upkeep"
                      value={formData.code_upkeep || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        handleInputChange('code_upkeep', e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="code_nursery">Code Nursery</Label>
                    <Input
                      id="code_nursery"
                      value={formData.code_nursery || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        handleInputChange('code_nursery', e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="code_replanting">Code Replanting</Label>
                    <Input
                      id="code_replanting"
                      value={formData.code_replanting || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        handleInputChange('code_replanting', e.target.value)
                      }
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </ScrollArea>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="gap-2">
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-white"></div>
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Update Asset
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}