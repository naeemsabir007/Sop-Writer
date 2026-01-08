import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Check, X, Loader2, Shield, CreditCard, Tag, Receipt } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PromoCodesTab from "@/components/admin/PromoCodesTab";

interface Payment {
  id: string;
  user_id: string;
  amount: number;
  transaction_id: string;
  status: string;
  created_at: string;
  user_email?: string;
}

const AdminPanel = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    checkAdminAndFetchPayments();
  }, []);

  const checkAdminAndFetchPayments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/login");
        return;
      }

      // Check if user has admin role using the security definer function
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

      // Fetch pending payments with user emails
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("payments")
        .select("*")
        .order("created_at", { ascending: false });

      if (paymentsError) throw paymentsError;

      // Fetch user emails from profiles
      const userIds = [...new Set(paymentsData?.map(p => p.user_id) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email")
        .in("id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p.email]) || []);

      const paymentsWithEmails = paymentsData?.map(p => ({
        ...p,
        user_email: profileMap.get(p.user_id) || "Unknown",
      })) || [];

      setPayments(paymentsWithEmails);
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

  const handleApprove = async (paymentId: string) => {
    setProcessingId(paymentId);
    try {
      const { error } = await supabase.rpc('approve_payment', { payment_id: paymentId });

      if (error) throw error;

      toast({
        title: "Payment Approved!",
        description: "User has been upgraded to premium.",
      });

      // Update local state
      setPayments(prev => prev.map(p => 
        p.id === paymentId ? { ...p, status: "approved" } : p
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

  const handleReject = async (paymentId: string) => {
    setProcessingId(paymentId);
    try {
      const { error } = await supabase.rpc('reject_payment', { payment_id: paymentId });

      if (error) throw error;

      toast({
        title: "Payment Rejected",
        description: "The payment has been marked as rejected.",
      });

      // Update local state
      setPayments(prev => prev.map(p => 
        p.id === paymentId ? { ...p, status: "rejected" } : p
      ));
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

  const pendingPayments = payments.filter(p => p.status === "pending");
  const processedPayments = payments.filter(p => p.status !== "pending");

  return (
    <div className="min-h-screen bg-secondary">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4">
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
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h1 className="font-heading font-bold text-foreground">
                  Admin Panel
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage payments, promo codes, and users
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content with Tabs */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="payments" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="bg-card">
              <TabsTrigger value="payments" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Payments
              </TabsTrigger>
              <TabsTrigger value="promo-codes" className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Promo Codes
              </TabsTrigger>
            </TabsList>
            <Button
              variant="outline"
              onClick={() => navigate("/admin/payments")}
              className="flex items-center gap-2"
            >
              <Receipt className="w-4 h-4" />
              TID Verifications
            </Button>
          </div>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-8">
            {/* Pending Payments */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="bg-card rounded-2xl shadow-[var(--shadow-card)] overflow-hidden">
                <div className="px-6 py-4 border-b border-border">
                  <h2 className="font-heading font-bold text-lg">
                    Pending Payments ({pendingPayments.length})
                  </h2>
                </div>
                
                {pendingPayments.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    No pending payments to review.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User Email</TableHead>
                        <TableHead>Transaction ID</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium">
                            {payment.user_email}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {payment.transaction_id}
                          </TableCell>
                          <TableCell>Rs. {payment.amount.toLocaleString()}</TableCell>
                          <TableCell>
                            {new Date(payment.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleApprove(payment.id)}
                                disabled={processingId === payment.id}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                              >
                                {processingId === payment.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <Check className="w-4 h-4 mr-1" />
                                    Approve
                                  </>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleReject(payment.id)}
                                disabled={processingId === payment.id}
                              >
                                {processingId === payment.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <X className="w-4 h-4 mr-1" />
                                    Reject
                                  </>
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </motion.div>

            {/* Processed Payments */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="bg-card rounded-2xl shadow-[var(--shadow-card)] overflow-hidden">
                <div className="px-6 py-4 border-b border-border">
                  <h2 className="font-heading font-bold text-lg">
                    Payment History ({processedPayments.length})
                  </h2>
                </div>
                
                {processedPayments.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    No processed payments yet.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User Email</TableHead>
                        <TableHead>Transaction ID</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {processedPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium">
                            {payment.user_email}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {payment.transaction_id}
                          </TableCell>
                          <TableCell>Rs. {payment.amount.toLocaleString()}</TableCell>
                          <TableCell>
                            {new Date(payment.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={payment.status === "approved" ? "default" : "destructive"}
                              className={payment.status === "approved" ? "bg-emerald-500" : ""}
                            >
                              {payment.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </motion.div>
          </TabsContent>

          {/* Promo Codes Tab */}
          <TabsContent value="promo-codes">
            <PromoCodesTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
