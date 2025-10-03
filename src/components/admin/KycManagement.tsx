// KYC Management Component
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  FileText, 
  Check, 
  X, 
  Eye, 
  Clock, 
  AlertTriangle,
  Loader2,
  User,
  Calendar,
  FileImage,
  Download
} from 'lucide-react';
import { adminService, KycDocument, AdminUser } from '@/services/adminService';
import { useToast } from '@/hooks/use-toast';

interface KycManagementProps {
  className?: string;
}

export function KycManagement({ className }: KycManagementProps) {
  const [documents, setDocuments] = useState<KycDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedDocument, setSelectedDocument] = useState<KycDocument | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewDecision, setReviewDecision] = useState<'APPROVED' | 'REJECTED' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    loadDocuments();
  }, [statusFilter, typeFilter]);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const response = await adminService.getKycDocuments({
        status: statusFilter,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        limit: 50,
      });
      
      if (response.success && response.data) {
        setDocuments(response.data.data || response.data);
      }
    } catch (error) {
      console.error('Error loading KYC documents:', error);
      toast({
        title: "Error",
        description: "Failed to load KYC documents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReviewDocument = async () => {
    if (!selectedDocument || !reviewDecision) return;

    setProcessing(true);
    try {
      const response = await adminService.reviewKycDocument(
        selectedDocument.id,
        reviewDecision,
        reviewDecision === 'REJECTED' ? rejectionReason : undefined
      );

      if (response.success) {
        toast({
          title: "Success",
          description: `Document ${reviewDecision.toLowerCase()} successfully`,
        });
        
        setShowReviewDialog(false);
        setSelectedDocument(null);
        setReviewDecision(null);
        setRejectionReason('');
        await loadDocuments();
      } else {
        throw new Error(response.error || 'Review failed');
      }
    } catch (error) {
      console.error('Error reviewing document:', error);
      toast({
        title: "Error",
        description: "Failed to review document",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    const variants = {
      PENDING: 'secondary',
      APPROVED: 'default',
      REJECTED: 'destructive',
    };
    return variants[status] || 'secondary';
  };

  const getTypeIcon = (type: string) => {
    return adminService.getKycTypeIcon(type);
  };

  const formatDate = (date: string) => {
    return adminService.formatDate(date);
  };

  const DocumentRow = ({ document }: { document: KycDocument }) => {
    return (
      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-muted rounded-lg">
            <FileText className="h-6 w-6" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium flex items-center gap-1">
                <span>{getTypeIcon(document.type)}</span>
                {document.type.replace('_', ' ')}
              </h3>
              <Badge variant={getStatusBadgeVariant(document.status)}>
                {document.status}
              </Badge>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>Submitted: {formatDate(document.submittedAt)}</p>
              {document.reviewedAt && (
                <p>Reviewed: {formatDate(document.reviewedAt)}</p>
              )}
            </div>

            {document.rejectionReason && (
              <Alert className="mt-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Rejection reason: {document.rejectionReason}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedDocument(document);
              setShowReviewDialog(true);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          
          {document.status === 'PENDING' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedDocument(document);
                  setReviewDecision('APPROVED');
                  setShowReviewDialog(true);
                }}
                className="text-green-600 hover:text-green-700"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedDocument(document);
                  setReviewDecision('REJECTED');
                  setShowReviewDialog(true);
                }}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            KYC Management
          </h2>
          <p className="text-muted-foreground">
            Review and verify user identity documents
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending Review</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="type-filter">Document Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger id="type-filter">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="ID_CARD">ID Card</SelectItem>
                  <SelectItem value="PASSPORT">Passport</SelectItem>
                  <SelectItem value="DRIVERS_LICENSE">Driver's License</SelectItem>
                  <SelectItem value="UTILITY_BILL">Utility Bill</SelectItem>
                  <SelectItem value="BANK_STATEMENT">Bank Statement</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Documents ({documents.length})</span>
            <Button variant="outline" size="sm" onClick={loadDocuments}>
              <Shield className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading documents...</span>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No documents found</h3>
              <p className="text-muted-foreground">
                {statusFilter === 'PENDING' 
                  ? 'No documents are pending review'
                  : 'No documents match the current filter'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {documents.map((document) => (
                <DocumentRow key={document.id} document={document} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Review KYC Document</DialogTitle>
          </DialogHeader>
          
          {selectedDocument && (
            <div className="space-y-6">
              {/* Document Info */}
              <div className="flex items-center gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <FileText className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <span>{getTypeIcon(selectedDocument.type)}</span>
                    {selectedDocument.type.replace('_', ' ')}
                  </h3>
                  <p className="text-muted-foreground">
                    Submitted: {formatDate(selectedDocument.submittedAt)}
                  </p>
                </div>
              </div>

              {/* Document Images */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedDocument.frontImageUrl && (
                  <div className="space-y-2">
                    <Label>Front Image</Label>
                    <div className="border rounded-lg p-4 bg-muted/50">
                      <img 
                        src={selectedDocument.frontImageUrl} 
                        alt="Document front"
                        className="w-full h-auto rounded"
                      />
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                )}

                {selectedDocument.backImageUrl && (
                  <div className="space-y-2">
                    <Label>Back Image</Label>
                    <div className="border rounded-lg p-4 bg-muted/50">
                      <img 
                        src={selectedDocument.backImageUrl} 
                        alt="Document back"
                        className="w-full h-auto rounded"
                      />
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                )}
              </div>

              {/* Document Metadata */}
              {selectedDocument.metadata && (
                <div className="space-y-4">
                  <h4 className="font-semibold">Document Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {selectedDocument.metadata.documentNumber && (
                      <div>
                        <p className="text-muted-foreground">Document Number</p>
                        <p>{selectedDocument.metadata.documentNumber}</p>
                      </div>
                    )}
                    {selectedDocument.metadata.expiryDate && (
                      <div>
                        <p className="text-muted-foreground">Expiry Date</p>
                        <p>{selectedDocument.metadata.expiryDate}</p>
                      </div>
                    )}
                    {selectedDocument.metadata.issueDate && (
                      <div>
                        <p className="text-muted-foreground">Issue Date</p>
                        <p>{selectedDocument.metadata.issueDate}</p>
                      </div>
                    )}
                    {selectedDocument.metadata.issuingAuthority && (
                      <div>
                        <p className="text-muted-foreground">Issuing Authority</p>
                        <p>{selectedDocument.metadata.issuingAuthority}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Review Decision */}
              <div className="space-y-4">
                <h4 className="font-semibold">Review Decision</h4>
                
                <div className="flex gap-4">
                  <Button
                    variant={reviewDecision === 'APPROVED' ? 'default' : 'outline'}
                    onClick={() => setReviewDecision('APPROVED')}
                    className="flex-1"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve Document
                  </Button>
                  <Button
                    variant={reviewDecision === 'REJECTED' ? 'destructive' : 'outline'}
                    onClick={() => setReviewDecision('REJECTED')}
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject Document
                  </Button>
                </div>

                {reviewDecision === 'REJECTED' && (
                  <div className="space-y-2">
                    <Label htmlFor="rejection-reason">Rejection Reason</Label>
                    <Textarea
                      id="rejection-reason"
                      placeholder="Provide a reason for rejection..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowReviewDialog(false)}
                  disabled={processing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReviewDocument}
                  disabled={!reviewDecision || processing || (reviewDecision === 'REJECTED' && !rejectionReason.trim())}
                  className="flex-1"
                >
                  {processing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    `Submit ${reviewDecision}`
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
