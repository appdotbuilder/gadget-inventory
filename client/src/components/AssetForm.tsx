import { useState, useEffect, useCallback } from 'react';
import { trpc } from '@/utils/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { User, Package, Calendar, Settings, AlertCircle, CheckCircle } from 'lucide-react';
import type { CreateAssetInput, User as UserType } from '../../../server/src/schema';

interface AssetFormProps {
  onAssetCreated: () => void;
}

export function AssetForm({ onAssetCreated }: AssetFormProps) {
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);

  const [formData, setFormData] = useState<CreateAssetInput>({
    user_nik: null,
    user_name: null,
    user_position: null,
    user_unit: null,
    user_location: null,
    asset_number: '',
    inventory_number: null,
    imei_number: null,
    serial_number: null,
    wifi_mac_address: null,
    purchase_date: null,
    warranty_date: null,
    category: 'smartphone',
    equipment_brand: null,
    equipment_type: null,
    supplier: null,
    apk_harv: null,
    apk_upk: null,
    apk_nurs: null,
    uuid_harvesting: null,
    uuid_upkeep: null,
    uuid_nursery: null,
    code_harvesting: null,
    code_upkeep: null,
    code_nursery: null,
    code_replanting: null,
    user_id_efact: null,
    status: 'baik',
    notes: null,
    repair_location: null,
    sent_to_regmis: false,
    sent_to_jkto: false,
    recommendation_number: null,
    gadget_usage: null
  });

  const loadUsers = useCallback(async () => {
    try {
      const result = await trpc.getUsers.query();
      setUsers(result);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleUserSelect = (nik: string) => {
    const user = users.find(u => u.nik === nik);
    setSelectedUser(user || null);
    
    if (user) {
      setFormData((prev: CreateAssetInput) => ({
        ...prev,
        user_nik: user.nik,
        user_name: user.name,
        user_position: user.position,
        user_unit: user.unit,
        user_location: user.location
      }));
    } else {
      setFormData((prev: CreateAssetInput) => ({
        ...prev,
        user_nik: null,
        user_name: null,
        user_position: null,
        user_unit: null,
        user_location: null
      }));
    }
  };

  const handleInputChange = (field: keyof CreateAssetInput, value: any) => {
    setFormData((prev: CreateAssetInput) => ({
      ...prev,
      [field]: value || null
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await trpc.createAsset.mutate(formData);
      
      // Reset form
      setFormData({
        user_nik: null,
        user_name: null,
        user_position: null,
        user_unit: null,
        user_location: null,
        asset_number: '',
        inventory_number: null,
        imei_number: null,
        serial_number: null,
        wifi_mac_address: null,
        purchase_date: null,
        warranty_date: null,
        category: 'smartphone',
        equipment_brand: null,
        equipment_type: null,
        supplier: null,
        apk_harv: null,
        apk_upk: null,
        apk_nurs: null,
        uuid_harvesting: null,
        uuid_upkeep: null,
        uuid_nursery: null,
        code_harvesting: null,
        code_upkeep: null,
        code_nursery: null,
        code_replanting: null,
        user_id_efact: null,
        status: 'baik',
        notes: null,
        repair_location: null,
        sent_to_regmis: false,
        sent_to_jkto: false,
        recommendation_number: null,
        gadget_usage: null
      });
      setSelectedUser(null);
      
      onAssetCreated();
    } catch (error) {
      console.error('Failed to create asset:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <h2 className="text-3xl font-bold text-gray-900">➕ Add New Asset</h2>
        <Badge variant="outline" className="text-sm">
          Required fields marked with *
        </Badge>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="user" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              User Assignment
            </TabsTrigger>
            <TabsTrigger value="technical" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Technical Details
            </TabsTrigger>
            <TabsTrigger value="applications" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Applications
            </TabsTrigger>
          </TabsList>

          {/* Basic Information */}
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Basic Asset Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="asset_number">Asset Number *</Label>
                    <Input
                      id="asset_number"
                      value={formData.asset_number}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        handleInputChange('asset_number', e.target.value)
                      }
                      placeholder="AST001"
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
                      placeholder="INV001"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select 
                      value={formData.category} 
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
                    <Label htmlFor="status">Status *</Label>
                    <Select 
                      value={formData.status} 
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
                      placeholder="Samsung, Apple, Dell, etc."
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
                      placeholder="Galaxy S21, iPhone 13, Latitude 5520, etc."
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
                      placeholder="PT. Supplier Name"
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
                    placeholder="Additional notes about this asset..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Assignment */}
          <TabsContent value="user">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  User Assignment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="user_select">Select User</Label>
                  <Select 
                    value={selectedUser?.nik || ''} 
                    onValueChange={handleUserSelect}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a user (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No user assigned</SelectItem>
                      {users.map((user: UserType) => (
                        <SelectItem key={user.id} value={user.nik}>
                          {user.name} - {user.nik} ({user.unit})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedUser && (
                  <Card className="bg-blue-50">
                    <CardContent className="pt-4">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Selected User Details
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><strong>NIK:</strong> {selectedUser.nik}</div>
                        <div><strong>Name:</strong> {selectedUser.name}</div>
                        <div><strong>Position:</strong> {selectedUser.position}</div>
                        <div><strong>Unit:</strong> {selectedUser.unit}</div>
                        <div className="col-span-2"><strong>Location:</strong> {selectedUser.location}</div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Manual user input option */}
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600 mb-4">Or enter user details manually:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="user_nik">User NIK</Label>
                      <Input
                        id="user_nik"
                        value={formData.user_nik || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                          handleInputChange('user_nik', e.target.value)
                        }
                        placeholder="User NIK"
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
                        placeholder="User Name"
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
                        placeholder="User Position"
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
                        placeholder="User Unit"
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
                        placeholder="User Location"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Technical Details */}
          <TabsContent value="technical">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Technical Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="imei_number">IMEI Number</Label>
                    <Input
                      id="imei_number"
                      value={formData.imei_number || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        handleInputChange('imei_number', e.target.value)
                      }
                      placeholder="123456789012345"
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
                      placeholder="ABC123DEF456"
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
                      placeholder="00:11:22:33:44:55"
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
                      placeholder="eFACT User ID"
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
                      placeholder="Service center location"
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
                      placeholder="REC001"
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
                      placeholder="Description of how this gadget is used..."
                      rows={2}
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="sent_to_regmis"
                      checked={formData.sent_to_regmis}
                      onCheckedChange={(checked) => handleInputChange('sent_to_regmis', checked)}
                    />
                    <Label htmlFor="sent_to_regmis">Sent to RegMis</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="sent_to_jkto"
                      checked={formData.sent_to_jkto}
                      onCheckedChange={(checked) => handleInputChange('sent_to_jkto', checked)}
                    />
                    <Label htmlFor="sent_to_jkto">Sent to JKTO</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Applications */}
          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Application Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                      placeholder="Harvesting APK version"
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
                      placeholder="Upkeep APK version"
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
                      placeholder="Nursery APK version"
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
                      placeholder="UUID for harvesting"
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
                      placeholder="UUID for upkeep"
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
                      placeholder="UUID for nursery"
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
                      placeholder="Harvesting code"
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
                      placeholder="Upkeep code"
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
                      placeholder="Nursery code"
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
                      placeholder="Replanting code"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Submit Button */}
        <div className="flex justify-end gap-4 pt-6">
          <Button type="button" variant="outline" onClick={() => onAssetCreated()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="gap-2">
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-white"></div>
                Creating...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Create Asset
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}