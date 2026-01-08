import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Check,
  X,
  Loader2,
  Shield,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  Smartphone,
  Building2,
  RefreshCw,
  Eye,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface PaymentVerification {
  id: string;
  user_id: string;
  payment_method: "jazzcash" | "easypaisa" | "hbl";
  sender_name: string;
  transaction_id: string;
  amount: number;
  screenshot_url: string | null;
  status: "pending" | "approved" | "rejected";
  admin_notes: string | null;
  sop_id: string | null;
  package_tier: string | null;
  created_at: string;
  user_email?: string;
}

const PAYMENT_METHOD_CONFIG = {
  jazzcash: {
    name: "JazzCash",
    color: "#E30613",
    bgClass: "bg-red-50 dark:bg-red-950/30",
    textClass: "text-red-600 dark:text-red-400",
    icon: Smartphone,
  },
  easypaisa: {
    name: "Easypaisa",
    color: "#00A651",
    bgClass: "bg-emerald-50 dark:bg-emerald-950/30",
    textClass: "text-emerald-600 dark:text-emerald-400",
    icon: Smartphone,
  },
  hbl: {
    name: "HBL",
    color: "#006C35",
    bgClass: "bg-teal-50 dark:bg-teal-950/30",
    textClass: "text-teal-600 dark:text-teal-400",
    icon: Building2,
  },
};

const AdminPayments = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [verifications, setVerifications] = useState<PaymentVerification[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  
  // Reject modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    checkAdminAndFetch();
  }, []);

  const checkAdminAndFetch = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/login");
        return;
      }

      const { data: hasRole, error: roleError } = await supabase
        .rpc('has_role', { _user_id: user.id, _role: 'admin' });

      if (roleError) throw roleError;

      if (!hasRole) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this page.",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      setIsAdmin(true);
      await fetchVerifications();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load admin panel.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchVerifications = async () => {
    try {
      const { data, error } = await supabase
        .from("payment_verifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch user emails from profiles
      const userIds = [...new Set(data?.map(v => v.user_id) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email")
        .in("id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p.email]) || []);

      const verificationsWithEmails = data?.map(v => ({
        ...v,
        user_email: profileMap.get(v.user_id) || "Unknown",
      })) || [];

      setVerifications(verificationsWithEmails);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch verifications.",
        variant: "destructive",
      });
    }
  };

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      const { error } = await supabase.rpc('approve_payment_verification', {
        p_verification_id: id,
      });

      if (error) throw error;

      toast({
        title: "Payment Approved!",
        description: "User has been upgraded to premium.",
      });

      setVerifications(prev => prev.map(v =>
        v.id === id ? { ...v, status: "approved" as const } : v
      ));
    } catch (error: any) {
      toast({
        title: "Approval Failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectModal = (id: string) => {
    setRejectingId(id);
    setRejectReason("");
    setRejectModalOpen(true);
  };

  const handleReject = async () => {
    if (!rejectingId || !rejectReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please enter a reason for rejection.",
        variant: "destructive",
      });
      return;
    }

    setProcessingId(rejectingId);
    try {
      const { error } = await supabase.rpc('reject_payment_verification', {
        p_verification_id: rejectingId,
        p_admin_notes: rejectReason.trim(),
      });

      if (error) throw error;

      toast({
        title: "Payment Rejected",
        description: "The payment has been marked as rejected.",
      });

      setVerifications(prev => prev.map(v =>
        v.id === rejectingId ? { ...v, status: "rejected" as const, admin_notes: rejectReason.trim() } : v
      ));

      setRejectModalOpen(false);
      setRejectingId(null);
      setRejectReason("");
    } catch (error: any) {
      toast({
        title: "Rejection Failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const filteredVerifications = verifications.filter(v => {
    const matchesSearch = 
      v.transaction_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.sender_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.user_email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = activeTab === "all" || v.status === activeTab;
    
    return matchesSearch && matchesTab;
  });

  const counts = {
    pending: verifications.filter(v => v.status === "pending").length,
    approved: verifications.filter(v => v.status === "approved").length,
    rejected: verifications.filter(v => v.status === "rejected").length,
    all: verifications.length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-100">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-100">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-100">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  const getMethodBadge = (method: "jazzcash" | "easypaisa" | "hbl") => {
    const config = PAYMENT_METHOD_CONFIG[method];
    const Icon = config.icon;
    return (
      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md ${config.bgClass}`}>
        <Icon className={`w-3.5 h-3.5 ${config.textClass}`} />
        <span className={`text-xs font-medium ${config.textClass}`}>
          {config.name}
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading admin panel...</span>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-secondary">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-heading font-bold text-foreground">
                  Payment Verifications
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage TID verification requests
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search TID, sender, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={fetchVerifications}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending
              {counts.pending > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-amber-500 text-white text-xs rounded-full">
                  {counts.pending}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Approved ({counts.approved})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              Rejected ({counts.rejected})
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              All ({counts.all})
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-card rounded-2xl shadow-[var(--shadow-card)] overflow-hidden">
                {filteredVerifications.length === 0 ? (
                  <div className="p-12 text-center text-muted-foreground">
                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No {activeTab} verifications</p>
                    <p className="text-sm mt-1">
                      {activeTab === "pending" 
                        ? "All payment requests have been processed." 
                        : "No records found."}
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="w-[120px]">Date</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead className="w-[110px]">Method</TableHead>
                        <TableHead>Sender</TableHead>
                        <TableHead className="font-mono">TID</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="w-[100px]">Status</TableHead>
                        {activeTab === "pending" && (
                          <TableHead className="text-right w-[180px]">Actions</TableHead>
                        )}
                        {activeTab === "rejected" && (
                          <TableHead>Reason</TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVerifications.map((v) => (
                        <TableRow key={v.id} className="group">
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(v.created_at), "MMM d, HH:mm")}
                          </TableCell>
                          <TableCell>
                            <div className="max-w-[180px]">
                              <p className="text-sm font-medium truncate">
                                {v.user_email}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getMethodBadge(v.payment_method)}
                          </TableCell>
                          <TableCell className="font-medium">
                            {v.sender_name}
                          </TableCell>
                          <TableCell>
                            <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                              {v.transaction_id}
                            </code>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            Rs. {v.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(v.status)}
                          </TableCell>
                          {activeTab === "pending" && (
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  size="sm"
                                  onClick={() => handleApprove(v.id)}
                                  disabled={processingId === v.id}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white h-8"
                                >
                                  {processingId === v.id ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <>
                                      <Check className="w-3.5 h-3.5 mr-1" />
                                      Approve
                                    </>
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => openRejectModal(v.id)}
                                  disabled={processingId === v.id}
                                  className="h-8"
                                >
                                  <X className="w-3.5 h-3.5 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            </TableCell>
                          )}
                          {activeTab === "rejected" && (
                            <TableCell className="max-w-[200px]">
                              <p className="text-sm text-muted-foreground truncate">
                                {v.admin_notes || "-"}
                              </p>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>

      {/* Reject Modal */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="w-5 h-5" />
              Reject Payment
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this payment request.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="reject-reason">Rejection Reason *</Label>
              <Textarea
                id="reject-reason"
                placeholder="e.g., TID Invalid, Amount mismatch, Duplicate submission..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setRejectModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={!rejectReason.trim() || processingId === rejectingId}
                className="flex-1"
              >
                {processingId === rejectingId ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  "Confirm Rejection"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPayments;
