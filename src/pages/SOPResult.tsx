import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  FileText,
  Download,
  Copy,
  RefreshCw,
  Check,
  Loader2,
  Crown,
  Lock,
  Unlock,
  GraduationCap,
  MapPin,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import PaymentConfirmationModal from "@/components/PaymentConfirmationModal";
import SOPPaymentModal from "@/components/SOPPaymentModal";

// Country flag mapping
const getCountryFlag = (country: string): string => {
  const flags: Record<string, string> = {
    "United Kingdom": "🇬🇧",
    "UK": "🇬🇧",
    "United States": "🇺🇸",
    "USA": "🇺🇸",
    "Canada": "🇨🇦",
    "Australia": "🇦🇺",
    "Germany": "🇩🇪",
    "Italy": "🇮🇹",
    "France": "🇫🇷",
    "Netherlands": "🇳🇱",
    "Ireland": "🇮🇪",
    "Sweden": "🇸🇪",
    "New Zealand": "🇳🇿",
    "Switzerland": "🇨🇭",
    "Spain": "🇪🇸",
    "Poland": "🇵🇱",
    "Austria": "🇦🇹",
    "Belgium": "🇧🇪",
    "Denmark": "🇩🇰",
    "Norway": "🇳🇴",
    "Finland": "🇫🇮",
  };
  return flags[country] || "🌍";
};

const SOPResult = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sop, setSop] = useState<any>(null);
  const [sensitiveDetails, setSensitiveDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editedContent, setEditedContent] = useState("");
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  
  // Payment flow states
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<"standard" | "expert">("standard");

  // Computed states
  const isLocked = sop?.is_locked || sop?.payment_status === "paid";
  const isPaid = sop?.payment_status === "paid";

  useEffect(() => {
    const fetchSOPAndProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        // Fetch SOP
        const { data, error } = await supabase
          .from("sops")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          toast({
            title: "SOP not found",
            description: "The requested SOP does not exist.",
            variant: "destructive",
          });
          navigate("/dashboard");
          return;
        }

        setSop(data);
        setEditedContent(data.generated_content || "");

        // Fetch sensitive details from the secure table (only if user owns the SOP)
        if (user && data.user_id === user.id) {
          const { data: sensitiveData } = await supabase
            .from("sop_sensitive_details")
            .select("*")
            .eq("sop_id", id)
            .maybeSingle();
          
          setSensitiveDetails(sensitiveData);
        }

        // Fetch premium status
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("is_premium")
            .eq("id", user.id)
            .single();
          
          setIsPremium(profile?.is_premium || false);
        }
      } catch (error: any) {
        toast({
          title: "Error loading SOP",
          description: error.message || "Something went wrong.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSOPAndProfile();
  }, [id, navigate, toast]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedContent);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "SOP copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Failed to copy",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadPDF = () => {
    if (!isPaid) {
      setSelectedPackage("standard");
      setConfirmationModalOpen(true);
      return;
    }

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    doc.setFont("times", "normal");
    doc.setFontSize(12);

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginLeft = 25;
    const marginRight = 25;
    const marginTop = 20;
    const marginBottom = 25;
    const maxWidth = pageWidth - marginLeft - marginRight;
    const lineHeight = 7;

    let yPosition = marginTop;

    const fullName = sop?.full_name;
    const homeAddress = sensitiveDetails?.home_address || sop?.home_address;
    const phoneNumber = sensitiveDetails?.phone_number || sop?.phone_number;
    const email = sop?.email;

    if (fullName || email || phoneNumber || homeAddress) {
      doc.setFontSize(11);
      doc.setFont("times", "normal");
      
      if (fullName) {
        doc.text(fullName, marginLeft, yPosition);
        yPosition += 5;
      }
      if (homeAddress) {
        const addressLines = doc.splitTextToSize(homeAddress, maxWidth);
        addressLines.forEach((line: string) => {
          doc.text(line, marginLeft, yPosition);
          yPosition += 5;
        });
      }
      if (phoneNumber) {
        doc.text(phoneNumber, marginLeft, yPosition);
        yPosition += 5;
      }
      if (email) {
        doc.text(email, marginLeft, yPosition);
        yPosition += 5;
      }
      
      yPosition += 3;
      const today = new Date();
      const dateStr = today.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      doc.text(dateStr, marginLeft, yPosition);
      yPosition += 12;
    }

    doc.setFontSize(14);
    doc.setFont("times", "bold");
    doc.text("Statement of Purpose", pageWidth / 2, yPosition, { align: "center" });
    yPosition += 8;
    
    doc.setFontSize(11);
    doc.setFont("times", "italic");
    doc.text(`${sop?.university} - ${sop?.course}`, pageWidth / 2, yPosition, { align: "center" });
    yPosition += 12;

    doc.setFontSize(12);
    doc.setFont("times", "normal");
    
    const splitText = doc.splitTextToSize(editedContent, maxWidth);
    
    splitText.forEach((line: string) => {
      if (yPosition + lineHeight > pageHeight - marginBottom) {
        doc.addPage();
        yPosition = marginTop;
      }
      
      doc.text(line, marginLeft, yPosition);
      yPosition += lineHeight;
    });

    const fileName = `SOP-${sop?.university?.replace(/\s+/g, "-") || "document"}.pdf`;
    doc.save(fileName);
    
    toast({
      title: "PDF Downloaded!",
      description: "Your SOP has been saved as a PDF.",
    });
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      // The edge function uses the LOCKED university/course from the database
      // It cannot be manipulated from the frontend
      const { data, error } = await supabase.functions.invoke("generate-sop", {
        body: { sopId: id },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // Refetch the SOP
      const { data: updatedSop } = await supabase
        .from("sops")
        .select("*")
        .eq("id", id)
        .single();

      if (updatedSop) {
        setSop(updatedSop);
        setEditedContent(updatedSop.generated_content || "");
      }

      toast({
        title: "Regenerated!",
        description: "Your SOP has been regenerated with the locked target details.",
      });
    } catch (error: any) {
      toast({
        title: "Regeneration failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setRegenerating(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Only update generated_content - the trigger will block changes to locked fields
      const { error } = await supabase
        .from("sops")
        .update({ generated_content: editedContent, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Saved!",
        description: "Your changes have been saved.",
      });
    } catch (error: any) {
      toast({
        title: "Save failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleProceedToPayment = (packageType: "standard" | "expert") => {
    setSelectedPackage(packageType);
    setConfirmationModalOpen(true);
  };

  const handleConfirmationProceed = () => {
    setConfirmationModalOpen(false);
    setPaymentModalOpen(true);
  };

  const handlePaymentSuccess = async () => {
    // Refetch the SOP to get updated payment status
    const { data: updatedSop } = await supabase
      .from("sops")
      .select("*")
      .eq("id", id)
      .single();

    if (updatedSop) {
      setSop(updatedSop);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading your SOP...</span>
        </div>
      </div>
    );
  }

  const wordCount = editedContent.split(/\s+/).filter(Boolean).length;

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
              {/* Country Flag - Always visible */}
              <div className="w-10 h-10 flex-shrink-0 rounded-full bg-accent/10 flex items-center justify-center text-xl">
                {getCountryFlag(sop?.country || "")}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="font-heading font-bold text-foreground truncate">
                    {sop?.university}
                  </h1>
                  {isLocked && (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                      <Lock className="w-3 h-3 mr-1" />
                      Locked
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {sop?.course} • {sop?.degree_level}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {wordCount} words
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              disabled={saving || !isPaid}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - Split Screen */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Side - Editor */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-card rounded-2xl shadow-[var(--shadow-card)] overflow-hidden">
              <div className="bg-muted/30 px-6 py-3 border-b border-border flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <span className="text-sm text-muted-foreground ml-4">
                  Statement of Purpose — {sop?.university}
                </span>
              </div>
              
              {/* Content container with strict locking for unpaid users */}
              <div 
                className={`relative ${!isPaid ? 'max-h-[300px] overflow-hidden' : ''}`}
              >
                {/* Content area - locked for unpaid users */}
                <div className={!isPaid ? 'pointer-events-none select-none' : ''}>
                  {isPaid ? (
                    <Textarea
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className="border-0 rounded-none focus-visible:ring-0 p-6 text-base leading-relaxed font-serif resize-none min-h-[600px]"
                      placeholder="Your generated SOP will appear here..."
                    />
                  ) : (
                    <div className="p-6 text-base leading-relaxed font-serif whitespace-pre-wrap text-foreground">
                      {editedContent}
                    </div>
                  )}
                </div>
                
                {/* Blur overlay for unpaid users - blocks all interaction */}
                {!isPaid && (
                  <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent via-card/80 to-card flex flex-col items-center justify-end pb-8">
                    <Lock className="w-8 h-8 text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground mb-4 text-center px-4">
                      Pay to unlock full SOP and regeneration
                    </p>
                    <Button
                      onClick={() => handleProceedToPayment("standard")}
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Unlock Full SOP (Rs. 1,000)
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right Side - Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            {/* Locked Target Details Card - Shows when paid */}
            {isLocked && (
              <div className="bg-card rounded-2xl shadow-[var(--shadow-card)] p-6 border-2 border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-2 mb-4">
                  <Lock className="w-5 h-5 text-amber-600" />
                  <h3 className="font-heading font-bold text-foreground">
                    Locked Target
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <Label className="text-xs text-muted-foreground">University</Label>
                    <Input 
                      value={sop?.university || ""} 
                      disabled 
                      className="mt-1 bg-muted/30 border-dashed cursor-not-allowed opacity-75"
                    />
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <Label className="text-xs text-muted-foreground">Course</Label>
                    <Input 
                      value={sop?.course || ""} 
                      disabled 
                      className="mt-1 bg-muted/30 border-dashed cursor-not-allowed opacity-75"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <Label className="text-xs text-muted-foreground">Degree</Label>
                      <Input 
                        value={sop?.degree_level || ""} 
                        disabled 
                        className="mt-1 bg-muted/30 border-dashed cursor-not-allowed opacity-75"
                      />
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <Label className="text-xs text-muted-foreground">Country</Label>
                      <Input 
                        value={sop?.country || ""} 
                        disabled 
                        className="mt-1 bg-muted/30 border-dashed cursor-not-allowed opacity-75"
                      />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  These fields are permanently locked after payment.
                </p>
              </div>
            )}

            {/* Download Card */}
            <div className="bg-card rounded-2xl shadow-[var(--shadow-card)] p-6">
              <h3 className="font-heading font-bold text-foreground mb-4">
                Export Your SOP
              </h3>
              <div className="space-y-3">
                {isPaid ? (
                  <Button
                    onClick={handleDownloadPDF}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleProceedToPayment("standard")}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Unlock Full PDF (Rs. 1,000)
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={handleCopy}
                  className="w-full"
                  disabled={!isPaid}
                >
                  {!isPaid ? (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Pay to Unlock
                    </>
                  ) : copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2 text-emerald-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy to Clipboard
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Regenerate Card */}
            <div className="bg-card rounded-2xl shadow-[var(--shadow-card)] p-6">
              <h3 className="font-heading font-bold text-foreground mb-2">
                {isPaid ? "Regenerate Content" : "Not Happy?"}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {isPaid 
                  ? "Generate a fresh version with your locked target details. Unlimited regenerations!"
                  : "Pay to unlock unlimited regenerations with your locked target."}
              </p>
              <Button
                onClick={isPaid ? handleRegenerate : () => handleProceedToPayment("standard")}
                disabled={regenerating}
                className={`w-full ${isPaid 
                  ? "bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground"
                  : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                }`}
              >
                {regenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Regenerating...
                  </>
                ) : isPaid ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerate SOP
                  </>
                ) : (
                  <>
                    <Crown className="w-4 h-4 mr-2" />
                    Unlock to Regenerate
                  </>
                )}
              </Button>
            </div>

            {/* Details Card */}
            <div className="bg-card rounded-2xl shadow-[var(--shadow-card)] p-6">
              <h3 className="font-heading font-bold text-foreground mb-4">
                Application Details
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Country</span>
                  <span className="font-medium text-foreground">{sop?.country}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IELTS Score</span>
                  <span className="font-medium text-foreground">{sop?.ielts_score || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Qualification</span>
                  <span className="font-medium text-foreground">{sop?.current_qualification || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Status</span>
                  <Badge 
                    variant={isPaid ? "default" : "secondary"}
                    className={isPaid ? "bg-emerald-500" : ""}
                  >
                    {isPaid ? "Paid" : "Pending"}
                  </Badge>
                </div>
                {sop?.package_tier && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Package</span>
                    <span className="font-medium text-foreground capitalize">
                      {sop.package_tier}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Confirmation Modal - Phase 2 */}
      <PaymentConfirmationModal
        open={confirmationModalOpen}
        onOpenChange={setConfirmationModalOpen}
        university={sop?.university || ""}
        course={sop?.course || ""}
        degreeLevel={sop?.degree_level || ""}
        country={sop?.country || ""}
        packageTier={selectedPackage}
        onConfirm={handleConfirmationProceed}
      />

      {/* Payment Modal - Phase 3 */}
      <SOPPaymentModal
        open={paymentModalOpen}
        onOpenChange={setPaymentModalOpen}
        sopId={id || ""}
        university={sop?.university || ""}
        course={sop?.course || ""}
        packageTier={selectedPackage}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default SOPResult;
