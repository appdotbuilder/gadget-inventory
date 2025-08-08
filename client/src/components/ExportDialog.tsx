import { useState } from 'react';
import { trpc } from '@/utils/trpc';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Download, 
  FileText, 
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
}

type ExportStatus = 'idle' | 'exporting' | 'success' | 'error';

export function ExportDialog({ open, onClose }: ExportDialogProps) {
  const [excelStatus, setExcelStatus] = useState<ExportStatus>('idle');
  const [pdfStatus, setPdfStatus] = useState<ExportStatus>('idle');
  const [excelError, setExcelError] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const handleExportExcel = async () => {
    setExcelStatus('exporting');
    setExcelError(null);
    
    try {
      const response = await trpc.exportToExcel.mutate();
      setExcelStatus('success');
      
      // In a real implementation, this would trigger a file download
      // For now, we'll show a success message
      console.log('Excel export successful:', response);
      
      // Reset status after a delay
      setTimeout(() => {
        setExcelStatus('idle');
      }, 3000);
    } catch (error) {
      console.error('Excel export failed:', error);
      setExcelError('Failed to export to Excel. Please try again.');
      setExcelStatus('error');
      
      setTimeout(() => {
        setExcelStatus('idle');
        setExcelError(null);
      }, 5000);
    }
  };

  const handleExportPdf = async () => {
    setPdfStatus('exporting');
    setPdfError(null);
    
    try {
      const response = await trpc.exportToPdf.mutate();
      setPdfStatus('success');
      
      // In a real implementation, this would trigger a file download
      // For now, we'll show a success message
      console.log('PDF export successful:', response);
      
      // Reset status after a delay
      setTimeout(() => {
        setPdfStatus('idle');
      }, 3000);
    } catch (error) {
      console.error('PDF export failed:', error);
      setPdfError('Failed to export to PDF. Please try again.');
      setPdfStatus('error');
      
      setTimeout(() => {
        setPdfStatus('idle');
        setPdfError(null);
      }, 5000);
    }
  };

  const getStatusIcon = (status: ExportStatus) => {
    switch (status) {
      case 'exporting':
        return <Clock className="h-4 w-4 animate-pulse text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Download className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: ExportStatus, type: string) => {
    switch (status) {
      case 'exporting':
        return `Exporting ${type}...`;
      case 'success':
        return `${type} exported successfully!`;
      case 'error':
        return `${type} export failed`;
      default:
        return `Export to ${type}`;
    }
  };

  const getStatusColor = (status: ExportStatus) => {
    switch (status) {
      case 'exporting':
        return 'bg-blue-100 text-blue-800';
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Asset Data
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <p className="text-gray-600">
            Download your asset data in various formats. All current assets with their complete information will be included.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Excel Export */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileSpreadsheet className="h-5 w-5 text-green-600" />
                  Excel Export
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-600">
                  <p className="mb-2">Perfect for:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Data analysis and calculations</li>
                    <li>Inventory management</li>
                    <li>Creating reports and charts</li>
                    <li>Bulk data editing</li>
                  </ul>
                </div>

                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(excelStatus)}>
                    {getStatusIcon(excelStatus)}
                    <span className="ml-1">{getStatusText(excelStatus, 'Excel')}</span>
                  </Badge>
                </div>

                {excelError && (
                  <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    {excelError}
                  </div>
                )}

                <Button 
                  onClick={handleExportExcel}
                  disabled={excelStatus === 'exporting'}
                  className="w-full gap-2"
                  variant={excelStatus === 'success' ? 'outline' : 'default'}
                >
                  {getStatusIcon(excelStatus)}
                  {excelStatus === 'exporting' ? 'Exporting...' : 'Export Excel (.xlsx)'}
                </Button>
              </CardContent>
            </Card>

            {/* PDF Export */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-red-600" />
                  PDF Export
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-600">
                  <p className="mb-2">Perfect for:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Professional reports</li>
                    <li>Documentation and archiving</li>
                    <li>Sharing with stakeholders</li>
                    <li>Printing and presentations</li>
                  </ul>
                </div>

                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(pdfStatus)}>
                    {getStatusIcon(pdfStatus)}
                    <span className="ml-1">{getStatusText(pdfStatus, 'PDF')}</span>
                  </Badge>
                </div>

                {pdfError && (
                  <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    {pdfError}
                  </div>
                )}

                <Button 
                  onClick={handleExportPdf}
                  disabled={pdfStatus === 'exporting'}
                  className="w-full gap-2"
                  variant={pdfStatus === 'success' ? 'outline' : 'default'}
                >
                  {getStatusIcon(pdfStatus)}
                  {pdfStatus === 'exporting' ? 'Exporting...' : 'Export PDF (.pdf)'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Export Information */}
          <Card className="bg-blue-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                💡 Export Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">📊 Data Included:</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• All asset basic information</li>
                    <li>• User assignments</li>
                    <li>• Technical specifications</li>
                    <li>• Application details</li>
                    <li>• Status and notes</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">⏰ Processing Time:</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Small datasets: ~5-10 seconds</li>
                    <li>• Large datasets: ~30-60 seconds</li>
                    <li>• Files are generated server-side</li>
                    <li>• Download starts automatically</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Note about demo */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Demo Note</span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              In this demo, export functions simulate the process. In production, files would automatically download to your device.
            </p>
          </div>

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}