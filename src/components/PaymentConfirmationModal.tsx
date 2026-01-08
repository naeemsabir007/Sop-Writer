import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Lock, GraduationCap, MapPin, Crown } from "lucide-react";

interface PaymentConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  university: string;
  course: string;
  degreeLevel: string;
  country: string;
  packageTier: "standard" | "expert";
  onConfirm: () => void;
}

const PaymentConfirmationModal = ({
  open,
  onOpenChange,
  university,
  course,
  degreeLevel,
  country,
  packageTier,
  onConfirm,
}: PaymentConfirmationModalProps) => {
  const [confirmed, setConfirmed] = useState(false);

  const price = packageTier === "standard" ? 1000 : 5000;

  const handleConfirm = () => {
    if (confirmed) {
      onConfirm();
    }
  };

  // Reset confirmation when modal opens/closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setConfirmed(false);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Double Check Your Target Details
          </DialogTitle>
          <DialogDescription>
            Please review carefully before proceeding to payment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-4">
          {/* Target Details Card */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-heading font-bold text-foreground text-lg">
                    {university}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {course} • {degreeLevel}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{country}</span>
              </div>
            </div>
          </div>

          {/* Warning Box */}
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
            <div className="flex gap-3">
              <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                  These details will be permanently locked after payment:
                </p>
                <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
                  <li>• <strong>University:</strong> {university}</li>
                  <li>• <strong>Course:</strong> {course}</li>
                  <li>• <strong>Degree Level:</strong> {degreeLevel}</li>
                  <li>• <strong>Country:</strong> {country}</li>
                </ul>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-2">
                  To prevent abuse, you <strong>cannot change</strong> the University or Degree after payment.
                </p>
              </div>
            </div>
          </div>

          {/* What You CAN Do */}
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
            <p className="text-sm text-emerald-800 dark:text-emerald-200">
              <strong>✓ You CAN:</strong> Regenerate the essay text unlimited times, edit content, refine your story, and download PDFs.
            </p>
          </div>

          {/* Confirmation Checkbox */}
          <div className="flex items-start gap-3 p-4 rounded-xl border border-border bg-muted/30">
            <Checkbox
              id="confirm-details"
              checked={confirmed}
              onCheckedChange={(checked) => setConfirmed(checked === true)}
              className="mt-0.5"
            />
            <Label
              htmlFor="confirm-details"
              className="text-sm cursor-pointer leading-relaxed"
            >
              I confirm that <strong>{university}</strong> and <strong>{course}</strong> are correct.
              I understand these cannot be changed after payment.
            </Label>
          </div>

          {/* Price & Action */}
          <div className="space-y-3">
            <div className="text-center py-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-xl border border-amber-200 dark:border-amber-800">
              <p className="text-2xl font-bold text-foreground">
                Rs. {price.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">
                {packageTier === "standard" ? "Standard Package" : "Expert Package"}
              </p>
            </div>

            <Button
              onClick={handleConfirm}
              disabled={!confirmed}
              className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Crown className="w-4 h-4 mr-2" />
              {confirmed 
                ? `Proceed to Pay Rs. ${price.toLocaleString()}` 
                : "Please confirm details above"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentConfirmationModal;
