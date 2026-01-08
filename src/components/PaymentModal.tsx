import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Copy, 
  Check, 
  Loader2, 
  Crown, 
  Tag, 
  X, 
  CheckCircle, 
  ShieldCheck,
  Smartphone,
  Building2,
  MessageCircle,
  CreditCard,
  Clock
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface AppliedPromo {
  code: string;
  discount_type: string;
  discount_value: number;
}

type PaymentMethod = "jazzcash" | "easypaisa" | "hbl";

const PAYMENT_METHODS = {
  jazzcash: {
    name: "JazzCash",
    accountTitle: "Naeem Sabir",
    accountNumber: "0322 4684181",
    brandColor: "#E30613",
    gradientFrom: "#E30613",
    gradientTo: "#ff4757",
    icon: Smartphone,
    smsCode: "8558",
    helperText: "Enter the TID sent by 8558.",
  },
  easypaisa: {
    name: "Easypaisa",
    accountTitle: "Naeem Sabir",
    accountNumber: "0322 4684181",
    brandColor: "#00A651",
    gradientFrom: "#00A651",
    gradientTo: "#2ed573",
    icon: Smartphone,
    smsCode: "3737",
    helperText: "Enter the TID sent by 3737.",
  },
  hbl: {
    name: "HBL Bank",
    accountTitle: "Naeem Sabir",
    accountNumber: "01197991957003",
    brandColor: "#006C35",
    gradientFrom: "#006C35",
    gradientTo: "#00a859",
    icon: Building2,
    smsCode: null,
    helperText: "Enter the Transaction Ref Number from your receipt.",
  },
};

const PaymentModal = ({ open, onOpenChange }: PaymentModalProps) => {
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("jazzcash");
  const [senderName, setSenderName] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Promo code state
  const [promoCode, setPromoCode] = useState("");
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);
  const [promoError, setPromoError] = useState("");
  const [showPromo, setShowPromo] = useState(false);

  const selectedMethod = PAYMENT_METHODS[paymentMethod];
  const basePrice = 1000;

  // Calculate final price with promo
  const calculateFinalPrice = () => {
    if (!appliedPromo) return basePrice;
    
    if (appliedPromo.discount_type === "fixed") {
      return Math.max(0, basePrice - appliedPromo.discount_value);
    } else {
      const discount = Math.round((basePrice * appliedPromo.discount_value) / 100);
      return Math.max(0, basePrice - discount);
    }
  };

  const finalPrice = calculateFinalPrice();
  const discountAmount = basePrice - finalPrice;

  const formatPKR = (amount: number) => {
    return `Rs. ${amount.toLocaleString()}`;
  };

  const handleCopyNumber = async () => {
    await navigator.clipboard.writeText(selectedMethod.accountNumber.replace(/\s/g, ""));
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Account number copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      setPromoError("Please enter a promo code");
      return;
    }

    setApplyingPromo(true);
    setPromoError("");

    try {
      const { data, error } = await supabase.rpc("validate_promo_code", {
        p_code: promoCode.trim(),
      });

      if (error) throw error;

      const result = data?.[0];
      
      if (!result?.is_valid) {
        setPromoError(result?.error_message || "Invalid or Expired Code");
        setAppliedPromo(null);
        return;
      }

      setAppliedPromo({
        code: promoCode.trim().toUpperCase(),
        discount_type: result.discount_type,
        discount_value: result.discount_value,
      });
      setPromoError("");
      setShowPromo(false);
      
      toast({
        title: "Promo Code Applied!",
        description: `You saved ${result.discount_type === "fixed" 
          ? formatPKR(result.discount_value) 
          : `${result.discount_value}%`}!`,
      });
    } catch (error: any) {
      setPromoError("Failed to validate code. Please try again.");
    } finally {
      setApplyingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCode("");
    setPromoError("");
  };

  const handleSubmit = async () => {
    if (!senderName.trim()) {
      toast({
        title: "Sender Name Required",
        description: "Please enter the name of the person who sent the payment.",
        variant: "destructive",
      });
      return;
    }

    if (!transactionId || transactionId.length < 6) {
      toast({
        title: "Invalid Transaction ID",
        description: "Please enter a valid Transaction ID from your payment receipt.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Please login to continue");
      }

      // Insert into payment_verifications table
      const { error } = await supabase.from("payment_verifications").insert({
        user_id: user.id,
        payment_method: paymentMethod,
        sender_name: senderName.trim(),
        transaction_id: transactionId.trim(),
        amount: finalPrice,
        status: "pending",
      });

      if (error) throw error;

      // If promo code was applied, increment its usage
      if (appliedPromo) {
        await supabase.rpc("increment_promo_usage", {
          p_code: appliedPromo.code,
        });
      }

      setSubmitted(true);
      
      setTimeout(() => {
        setTransactionId("");
        setSenderName("");
        setPromoCode("");
        setAppliedPromo(null);
        setSubmitted(false);
        onOpenChange(false);
      }, 2500);
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleWhatsApp = () => {
    window.open("https://wa.me/923224684181?text=Hi, I need help with my payment.", "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden bg-gradient-to-b from-card to-secondary/50 backdrop-blur-xl border border-border/50">
        {/* Trust Header */}
        <div className="px-6 pt-6 pb-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-xl font-heading">
              <CreditCard className="w-5 h-5 text-primary" />
              Upgrade to Premium
            </DialogTitle>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                Verified Merchant
              </span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Remove watermarks and download the official PDF.
          </p>
        </div>

        <div className="p-6 space-y-5">
          {/* Success State */}
          <AnimatePresence>
            {submitted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-card/95 backdrop-blur-sm p-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.1 }}
                  className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mb-4"
                >
                  <Clock className="w-10 h-10 text-amber-500" />
                </motion.div>
                <h3 className="text-xl font-heading font-bold text-foreground">
                  Payment Submitted!
                </h3>
                <div className="mt-3 px-4 py-2 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Your TID</p>
                  <code className="font-mono font-bold text-foreground">{transactionId}</code>
                </div>
                <p className="text-muted-foreground text-center mt-3 text-sm">
                  Your payment is being verified. Usually within 24 hours.
                </p>
                <div className="flex items-center gap-2 mt-4 text-amber-600 dark:text-amber-400">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Verification pending</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Price Display */}
          <div className="text-center py-3 px-4 rounded-xl bg-muted/50 border border-border/50">
            {appliedPromo ? (
              <div className="flex items-center justify-center gap-3">
                <span className="text-sm text-muted-foreground line-through">
                  {formatPKR(basePrice)}
                </span>
                <span className="text-2xl font-bold text-foreground">
                  {formatPKR(finalPrice)}
                </span>
                <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full">
                  -{formatPKR(discountAmount)}
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl font-bold text-foreground">{formatPKR(basePrice)}</span>
                <span className="text-sm text-muted-foreground">One-time payment</span>
              </div>
            )}
          </div>

          {/* Payment Method Tabs */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Step 1: Choose Payment Method</Label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(PAYMENT_METHODS) as PaymentMethod[]).map((method) => {
                const methodData = PAYMENT_METHODS[method];
                const isSelected = paymentMethod === method;
                const IconComponent = methodData.icon;
                
                return (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`relative p-3 rounded-xl border-2 transition-all duration-200 ${
                      isSelected 
                        ? "border-transparent shadow-lg" 
                        : "border-border/50 hover:border-border bg-card"
                    }`}
                    style={{
                      background: isSelected 
                        ? `linear-gradient(135deg, ${methodData.gradientFrom}15, ${methodData.gradientTo}25)` 
                        : undefined,
                      borderColor: isSelected ? methodData.brandColor : undefined,
                    }}
                  >
                    <div className="flex flex-col items-center gap-1.5">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ 
                          background: isSelected 
                            ? `linear-gradient(135deg, ${methodData.gradientFrom}, ${methodData.gradientTo})` 
                            : "hsl(var(--muted))" 
                        }}
                      >
                        <IconComponent className={`w-4 h-4 ${isSelected ? "text-white" : "text-muted-foreground"}`} />
                      </div>
                      <span 
                        className="text-xs font-medium"
                        style={{ color: isSelected ? methodData.brandColor : "hsl(var(--muted-foreground))" }}
                      >
                        {methodData.name}
                      </span>
                    </div>
                    {isSelected && (
                      <motion.div
                        layoutId="payment-method-indicator"
                        className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full"
                        style={{ background: methodData.brandColor }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Account Card - Digital Debit Card Style */}
          <motion.div
            key={paymentMethod}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="relative overflow-hidden rounded-2xl p-5"
            style={{
              background: `linear-gradient(135deg, ${selectedMethod.gradientFrom}, ${selectedMethod.gradientTo})`,
            }}
          >
            {/* Card Pattern Overlay */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/30 -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/20 translate-y-1/2 -translate-x-1/2" />
            </div>
            
            <div className="relative z-10">
              {/* Card Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <selectedMethod.icon className="w-5 h-5 text-white/90" />
                  <span className="text-white/90 font-medium text-sm">{selectedMethod.name}</span>
                </div>
                <div className="text-white/70 text-xs">Send to this account</div>
              </div>
              
              {/* Account Number - Large Display */}
              <div className="mb-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-2xl font-bold text-white tracking-wider">
                    {selectedMethod.accountNumber}
                  </span>
                  <button
                    onClick={handleCopyNumber}
                    className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors group"
                    title="Copy account number"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-white" />
                    ) : (
                      <Copy className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                    )}
                  </button>
                </div>
              </div>
              
              {/* Account Title */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white/60 text-xs uppercase tracking-wide mb-0.5">Account Title</div>
                  <div className="text-white font-semibold">{selectedMethod.accountTitle}</div>
                </div>
                <div className="text-right">
                  <div className="text-white/60 text-xs uppercase tracking-wide mb-0.5">Amount</div>
                  <div className="text-white font-bold">{formatPKR(finalPrice)}</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* TID Verification Section */}
          <div className="space-y-4">
            <Label className="text-sm font-medium flex items-center gap-2">
              Step 2: Enter Transaction Details
            </Label>
            
            {/* Sender Name */}
            <div className="space-y-1.5">
              <Label htmlFor="sender-name" className="text-xs text-muted-foreground">
                Sender Name (Who sent the money?)
              </Label>
              <Input
                id="sender-name"
                placeholder="e.g., Muhammad Ahmed"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="h-11"
              />
            </div>
            
            {/* Transaction ID */}
            <div className="space-y-1.5">
              <Label htmlFor="tid" className="text-xs text-muted-foreground">
                Transaction ID / TID
              </Label>
              <Input
                id="tid"
                placeholder="e.g., 1234567890"
                value={transactionId}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9A-Za-z-]/g, "");
                  setTransactionId(value);
                }}
                className="h-11 font-mono"
                maxLength={25}
              />
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Smartphone className="w-3 h-3" />
                {selectedMethod.helperText}
              </p>
            </div>
          </div>

          {/* Promo Code Section */}
          {!appliedPromo && (
            <div className="space-y-2">
              {!showPromo ? (
                <button
                  onClick={() => setShowPromo(true)}
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  <Tag className="w-3.5 h-3.5" />
                  Have a promo code?
                </button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="flex gap-2"
                >
                  <Input
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => {
                      setPromoCode(e.target.value.toUpperCase());
                      setPromoError("");
                    }}
                    className="uppercase h-10"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleApplyPromo}
                    disabled={applyingPromo || !promoCode.trim()}
                    className="h-10 px-4"
                  >
                    {applyingPromo ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => { setShowPromo(false); setPromoCode(""); setPromoError(""); }}
                    className="h-10 w-10"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </motion.div>
              )}
              {promoError && (
                <p className="text-sm text-destructive">{promoError}</p>
              )}
            </div>
          )}
          
          {appliedPromo && (
            <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/30 rounded-lg px-4 py-2.5 border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                  {appliedPromo.code}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemovePromo}
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={submitting || !transactionId || !senderName}
            className="w-full h-12 text-base font-semibold"
            style={{
              background: `linear-gradient(135deg, ${selectedMethod.gradientFrom}, ${selectedMethod.gradientTo})`,
            }}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying TID...
              </>
            ) : (
              <>
                <Crown className="w-4 h-4 mr-2" />
                Verify Payment • {formatPKR(finalPrice)}
              </>
            )}
          </Button>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              Payments verified within 24 hours
            </p>
            <button
              onClick={handleWhatsApp}
              className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              WhatsApp Support
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
