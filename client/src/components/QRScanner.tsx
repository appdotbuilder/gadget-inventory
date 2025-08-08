import { useState } from 'react';
import { trpc } from '@/utils/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Scan, Search, AlertCircle, CheckCircle, Package } from 'lucide-react';
import { AssetDetailDialog } from '@/components/AssetDetailDialog';
import type { Asset } from '../../../server/src/schema';

export function QRScanner() {
  const [qrCode, setQrCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scannedAsset, setScannedAsset] = useState<Asset | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAssetDetail, setShowAssetDetail] = useState(false);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrCode.trim()) return;

    setIsScanning(true);
    setError(null);
    setScannedAsset(null);

    try {
      const result = await trpc.scanQrCode.query({ qr_code: qrCode.trim() });
      setScannedAsset(result);
      setShowAssetDetail(true);
    } catch (error) {
      console.error('Failed to scan QR code:', error);
      setError('Asset not found or QR code is invalid');
    } finally {
      setIsScanning(false);
    }
  };

  const handleManualInput = (value: string) => {
    setQrCode(value);
    setError(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'baik': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rusak': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'perbaikan': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'hilang': return <AlertCircle className="h-4 w-4 text-gray-500" />;
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
      <div className="flex items-center gap-2">
        <h2 className="text-3xl font-bold text-gray-900">📱 QR Code Scanner</h2>
        <Badge variant="outline" className="text-sm">
          Scan or enter manually
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scanner Interface */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scan className="h-5 w-5" />
              Scan QR Code
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* QR Scanner Placeholder */}
            <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Scan className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">QR Camera Scanner</p>
              <p className="text-sm text-gray-500">
                In production, this would integrate with camera API
              </p>
              <Button variant="outline" className="mt-4" disabled>
                📹 Enable Camera
              </Button>
            </div>

            {/* Manual Input */}
            <div className="border-t pt-6">
              <form onSubmit={handleScan} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="qr_code">Or Enter QR Code Manually</Label>
                  <Input
                    id="qr_code"
                    value={qrCode}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      handleManualInput(e.target.value)
                    }
                    placeholder="Enter QR code or asset number..."
                    className="font-mono"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isScanning || !qrCode.trim()}
                  className="w-full gap-2"
                >
                  {isScanning ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-white"></div>
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      Search Asset
                    </>
                  )}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Scan Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <div>
                  <p className="font-medium text-red-800">Asset Not Found</p>
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Success State */}
            {scannedAsset && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="font-medium text-green-800">Asset Found!</span>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Asset Header */}
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getCategoryEmoji(scannedAsset.category)}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {scannedAsset.equipment_brand} {scannedAsset.equipment_type}
                        </h3>
                        <p className="text-sm text-gray-600">#{scannedAsset.asset_number}</p>
                      </div>
                      <Badge className={getStatusColor(scannedAsset.status)}>
                        {getStatusIcon(scannedAsset.status)}
                        <span className="ml-1 capitalize">{scannedAsset.status}</span>
                      </Badge>
                    </div>

                    {/* Quick Info */}
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      {scannedAsset.user_name && (
                        <div>
                          <strong>Assigned to:</strong> {scannedAsset.user_name}
                        </div>
                      )}
                      {scannedAsset.user_location && (
                        <div>
                          <strong>Location:</strong> {scannedAsset.user_location}
                        </div>
                      )}
                      {scannedAsset.serial_number && (
                        <div>
                          <strong>Serial:</strong> <span className="font-mono">{scannedAsset.serial_number}</span>
                        </div>
                      )}
                      {scannedAsset.imei_number && (
                        <div>
                          <strong>IMEI:</strong> <span className="font-mono">{scannedAsset.imei_number}</span>
                        </div>
                      )}
                    </div>

                    <Button 
                      onClick={() => setShowAssetDetail(true)}
                      className="w-full gap-2"
                    >
                      <Package className="h-4 w-4" />
                      View Full Details
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Default State */}
            {!error && !scannedAsset && (
              <div className="text-center py-12">
                <Scan className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Scan</h3>
                <p className="text-gray-500">
                  Use the camera or enter a QR code manually to find asset details
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Tips */}
      <Card className="bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            💡 Quick Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium">📱 For Mobile Use:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Hold device steady when scanning</li>
                <li>• Ensure good lighting</li>
                <li>• Keep QR code in center of frame</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">🔍 Manual Entry:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Enter the complete QR code text</li>
                <li>• Asset numbers also work</li>
                <li>• Check for typos if not found</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Asset Detail Dialog */}
      <AssetDetailDialog
        asset={scannedAsset}
        open={showAssetDetail}
        onClose={() => setShowAssetDetail(false)}
      />
    </div>
  );
}