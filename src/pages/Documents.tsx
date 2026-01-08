import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, Download, Edit, Plus, Search, Calendar, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import jsPDF from "jspdf";
import { toast } from "sonner";

interface SOP {
  id: string;
  university: string;
  course: string;
  country: string;
  status: string;
  created_at: string;
  generated_content: string | null;
}

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
    "Ireland": "🇮🇪",
    "Netherlands": "🇳🇱",
    "New Zealand": "🇳🇿",
  };
  return flags[country] || "🌍";
};

const Documents = () => {
  const navigate = useNavigate();
  const [sops, setSops] = useState<SOP[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('sops')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSops(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = (sop: SOP) => {
    if (!sop.generated_content) {
      toast.error('No content available to download');
      return;
    }

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;

    pdf.setFont("times", "normal");
    pdf.setFontSize(16);
    pdf.text("Statement of Purpose", pageWidth / 2, 20, { align: "center" });

    pdf.setFontSize(11);
    pdf.setTextColor(100);
    pdf.text(`${sop.university} - ${sop.course}`, pageWidth / 2, 28, { align: "center" });

    pdf.setFontSize(12);
    pdf.setTextColor(0);
    const lines = pdf.splitTextToSize(sop.generated_content, maxWidth);
    pdf.text(lines, margin, 45);

    pdf.save(`SOP-${sop.university.replace(/\s+/g, '_')}.pdf`);
    toast.success('PDF downloaded successfully!');
  };

  const filteredSops = sops.filter(sop => 
    sop.university.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sop.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sop.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-muted-foreground">Loading documents...</div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">My Documents</h1>
            <p className="text-muted-foreground">
              {sops.length} {sops.length === 1 ? 'document' : 'documents'} in your library
            </p>
          </div>
          <Button 
            onClick={() => navigate('/create-sop')}
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New SOP
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by university, course, or country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Empty State */}
        {sops.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 bg-card rounded-xl border border-border"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <FileText className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No documents yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Create your first Statement of Purpose and it will appear here.
            </p>
            <Button 
              onClick={() => navigate('/create-sop')}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First SOP
            </Button>
          </motion.div>
        ) : (
          /* Documents Table */
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left py-4 px-6 font-medium text-muted-foreground">Document</th>
                    <th className="text-left py-4 px-6 font-medium text-muted-foreground hidden md:table-cell">Country</th>
                    <th className="text-left py-4 px-6 font-medium text-muted-foreground hidden lg:table-cell">Date</th>
                    <th className="text-left py-4 px-6 font-medium text-muted-foreground">Status</th>
                    <th className="text-right py-4 px-6 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSops.map((sop, index) => (
                    <motion.tr
                      key={sop.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-emerald-500" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{sop.university}</p>
                            <p className="text-sm text-muted-foreground">{sop.course}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{getCountryFlag(sop.country)}</span>
                          <span className="text-muted-foreground">{sop.country}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 hidden lg:table-cell">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(sop.created_at).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <Badge 
                          variant={sop.status === 'completed' ? 'default' : 'secondary'}
                          className={sop.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : ''}
                        >
                          {sop.status === 'completed' ? 'Ready' : 'Draft'}
                        </Badge>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          {sop.status === 'completed' && sop.generated_content && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadPDF(sop)}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/sop-result/${sop.id}`)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Documents;
