import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Loader2, Tag, Percent, Banknote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PromoCode {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  max_uses: number | null;
  current_uses: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

const PromoCodesTab = () => {
  const { toast } = useToast();
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    code: "",
    discount_type: "fixed",
    discount_value: "",
    max_uses: "",
    expires_at: "",
  });

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const fetchPromoCodes = async () => {
    try {
      const { data, error } = await supabase
        .from("promo_codes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPromoCodes(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load promo codes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.code || !formData.discount_value) {
      toast({
        title: "Missing Fields",
        description: "Please fill in the required fields.",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      const { error } = await supabase.from("promo_codes").insert({
        code: formData.code.toUpperCase(),
        discount_type: formData.discount_type,
        discount_value: parseInt(formData.discount_value),
        max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
        expires_at: formData.expires_at || null,
      });

      if (error) throw error;

      toast({
        title: "Promo Code Created!",
        description: `Code "${formData.code.toUpperCase()}" is now active.`,
      });

      setFormData({
        code: "",
        discount_type: "fixed",
        discount_value: "",
        max_uses: "",
        expires_at: "",
      });
      setShowCreateModal(false);
      fetchPromoCodes();
    } catch (error: any) {
      toast({
        title: "Creation Failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("promo_codes")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      setPromoCodes((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_active: !currentStatus } : p))
      );

      toast({
        title: currentStatus ? "Code Deactivated" : "Code Activated",
        description: `Promo code has been ${currentStatus ? "deactivated" : "activated"}.`,
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const { error } = await supabase.from("promo_codes").delete().eq("id", id);

      if (error) throw error;

      setPromoCodes((prev) => prev.filter((p) => p.id !== id));
      toast({
        title: "Promo Code Deleted",
        description: "The promo code has been removed.",
      });
    } catch (error: any) {
      toast({
        title: "Deletion Failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const formatDiscount = (type: string, value: number) => {
    if (type === "fixed") {
      return `Rs. ${value.toLocaleString()}`;
    }
    return `${value}%`;
  };

  const getStatus = (promo: PromoCode) => {
    if (!promo.is_active) return { label: "Inactive", variant: "secondary" as const };
    if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
      return { label: "Expired", variant: "destructive" as const };
    }
    if (promo.max_uses && promo.current_uses >= promo.max_uses) {
      return { label: "Exhausted", variant: "destructive" as const };
    }
    return { label: "Active", variant: "default" as const };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Tag className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-lg">Promo Codes</h2>
            <p className="text-sm text-muted-foreground">
              Manage discount codes for your customers
            </p>
          </div>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Code
        </Button>
      </div>

      {/* Promo Codes Table */}
      <div className="bg-card rounded-2xl shadow-[var(--shadow-card)] overflow-hidden">
        {promoCodes.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Tag className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No promo codes created yet.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setShowCreateModal(true)}
            >
              Create Your First Code
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promoCodes.map((promo) => {
                const status = getStatus(promo);
                return (
                  <TableRow key={promo.id}>
                    <TableCell className="font-mono font-bold">
                      {promo.code}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {promo.discount_type === "fixed" ? (
                          <Banknote className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Percent className="w-4 h-4 text-blue-500" />
                        )}
                        {formatDiscount(promo.discount_type, promo.discount_value)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={status.variant}
                        className={
                          status.label === "Active"
                            ? "bg-emerald-500 hover:bg-emerald-600"
                            : ""
                        }
                      >
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {promo.max_uses
                        ? `${promo.current_uses}/${promo.max_uses}`
                        : `${promo.current_uses} used`}
                    </TableCell>
                    <TableCell>
                      {promo.expires_at
                        ? new Date(promo.expires_at).toLocaleDateString()
                        : "Never"}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={promo.is_active}
                        onCheckedChange={() =>
                          handleToggleActive(promo.id, promo.is_active)
                        }
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(promo.id)}
                        disabled={deletingId === promo.id}
                        className="text-destructive hover:text-destructive"
                      >
                        {deletingId === promo.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Promo Code</DialogTitle>
            <DialogDescription>
              Create a new discount code for your customers.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            {/* Code */}
            <div className="space-y-2">
              <Label htmlFor="code">Code *</Label>
              <Input
                id="code"
                placeholder="e.g., AZADI50"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value.toUpperCase() })
                }
                className="uppercase"
              />
            </div>

            {/* Discount Type */}
            <div className="space-y-2">
              <Label>Discount Type *</Label>
              <Select
                value={formData.discount_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, discount_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">
                    <div className="flex items-center gap-2">
                      <Banknote className="w-4 h-4" />
                      Fixed PKR
                    </div>
                  </SelectItem>
                  <SelectItem value="percentage">
                    <div className="flex items-center gap-2">
                      <Percent className="w-4 h-4" />
                      Percentage
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Discount Value */}
            <div className="space-y-2">
              <Label htmlFor="value">
                Value * {formData.discount_type === "fixed" ? "(PKR)" : "(%)"}
              </Label>
              <Input
                id="value"
                type="number"
                placeholder={formData.discount_type === "fixed" ? "500" : "15"}
                value={formData.discount_value}
                onChange={(e) =>
                  setFormData({ ...formData, discount_value: e.target.value })
                }
                min="1"
                max={formData.discount_type === "percentage" ? "100" : undefined}
              />
            </div>

            {/* Max Uses */}
            <div className="space-y-2">
              <Label htmlFor="max_uses">Max Uses (Optional)</Label>
              <Input
                id="max_uses"
                type="number"
                placeholder="e.g., 50"
                value={formData.max_uses}
                onChange={(e) =>
                  setFormData({ ...formData, max_uses: e.target.value })
                }
                min="1"
              />
              <p className="text-xs text-muted-foreground">
                Leave blank for unlimited uses.
              </p>
            </div>

            {/* Expiry Date */}
            <div className="space-y-2">
              <Label htmlFor="expires_at">Expiry Date (Optional)</Label>
              <Input
                id="expires_at"
                type="datetime-local"
                value={formData.expires_at}
                onChange={(e) =>
                  setFormData({ ...formData, expires_at: e.target.value })
                }
              />
            </div>

            {/* Submit */}
            <Button
              onClick={handleCreate}
              disabled={creating}
              className="w-full"
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Promo Code"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default PromoCodesTab;
