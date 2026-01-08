import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Rocket, Download, Edit, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

interface SOP {
  id: string;
  university: string;
  course: string;
  country: string;
  status: string;
  created_at: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

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

const Dashboard = () => {
  const [userName, setUserName] = useState<string>("Scholar");
  const [sops, setSops] = useState<SOP[]>([]);
  const [loading, setLoading] = useState(true);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  useEffect(() => {
    const fetchUserAndSops = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Get user profile
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", user.id)
            .maybeSingle();
          
          if (profile?.full_name) {
            setUserName(profile.full_name.split(" ")[0]);
          }

          // Fetch SOPs
          const { data: sopsData } = await supabase
            .from("sops")
            .select("id, university, course, country, status, created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

          if (sopsData) {
            setSops(sopsData);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndSops();
  }, []);

  return (
    <motion.div 
      className="p-6 lg:p-8 space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Dynamic Header */}
      <motion.div 
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        variants={itemVariants}
      >
        <div>
          <p className="text-muted-foreground text-sm mb-1">Dashboard</p>
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground font-serif">
            {getGreeting()}, {userName}.
          </h1>
        </div>

        {/* Visa Readiness Widget */}
        <motion.div 
          className="bg-card border border-border rounded-full px-6 py-3 flex items-center gap-4 shadow-sm"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            <span className="text-sm font-medium text-foreground">Visa Readiness</span>
          </div>
          <div className="flex items-center gap-3">
            <Progress value={30} className="w-24 h-2" />
            <span className="text-sm font-bold text-accent">30%</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Hero Launchpad Banner */}
      <motion.div 
        className="relative overflow-hidden rounded-2xl gradient-hero p-8 lg:p-12"
        variants={itemVariants}
      >
        {/* Abstract background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/20 rounded-full blur-3xl" />
          <svg className="absolute right-0 bottom-0 w-1/2 h-full opacity-20" viewBox="0 0 400 400">
            <path d="M 50 200 Q 150 100 250 200 T 450 200" stroke="currentColor" strokeWidth="0.5" fill="none" className="text-white" />
            <path d="M 50 250 Q 150 150 250 250 T 450 250" stroke="currentColor" strokeWidth="0.5" fill="none" className="text-white" />
            <circle cx="300" cy="100" r="50" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-white" />
            <circle cx="350" cy="150" r="30" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-white" />
          </svg>
        </div>

        <div className="relative z-10 max-w-2xl">
          <h2 className="text-2xl lg:text-3xl font-bold text-white font-serif mb-3">
            Start New Application
          </h2>
          <p className="text-slate-300 text-lg mb-6">
            Draft a university-specific SOP in 2 minutes with AI assistance.
          </p>
          <Link to="/create-sop">
            <Button 
              size="lg" 
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 py-6 text-lg shadow-lg glow-green transition-all duration-300 hover:scale-105"
            >
              <Rocket className="w-5 h-5 mr-2" />
              Launch Generator
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Stats Section */}
      <motion.div 
        className="grid gap-6 md:grid-cols-3"
        variants={itemVariants}
      >
        <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
          <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-accent/10 rounded-xl">
                  <FileText className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Total SOPs</p>
                  <p className="text-3xl font-bold text-foreground">{loading ? "-" : sops.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
          <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-accent/10 rounded-xl">
                  <Sparkles className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Ready to Submit</p>
                  <p className="text-3xl font-bold text-foreground">
                    {loading ? "-" : sops.filter(s => s.status === "completed" || s.status === "ready").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
          <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gold/10 rounded-xl">
                  <Edit className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Drafts</p>
                  <p className="text-3xl font-bold text-foreground">
                    {loading ? "-" : sops.filter(s => s.status === "draft" || s.status === "processing").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Document Grid Section */}
      <motion.div variants={itemVariants}>
        <h3 className="text-xl font-bold text-foreground mb-4 font-serif">Your Documents</h3>

        {/* Loading State */}
        {loading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-card border-border overflow-hidden">
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                  <div className="flex gap-2 pt-4">
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && sops.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-2 border-dashed border-border bg-card/50">
              <CardContent className="p-12 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mb-6">
                  <FileText className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2 font-serif">
                  No SOPs yet
                </h3>
                <p className="text-muted-foreground mb-6 max-w-sm">
                  Launch the generator to create your first Statement of Purpose and kickstart your study abroad journey.
                </p>
                <Link to="/create-sop">
                  <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Rocket className="w-4 h-4 mr-2" />
                    Launch Generator
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Data State - Document Cards */}
        {!loading && sops.length > 0 && (
          <motion.div 
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {sops.map((sop, index) => (
              <motion.div
                key={sop.id}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="bg-card border-border shadow-sm hover:shadow-lg transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Country Flag - Always visible */}
                        <div className="w-8 h-8 flex-shrink-0 rounded-full bg-accent/10 flex items-center justify-center text-lg">
                          {getCountryFlag(sop.country)}
                        </div>
                        <h4 className="font-bold text-foreground text-lg line-clamp-1 group-hover:text-accent transition-colors">
                          {sop.university}
                        </h4>
                      </div>
                      <Badge 
                        variant={sop.status === "completed" || sop.status === "ready" ? "default" : "secondary"}
                        className={`flex-shrink-0 ml-2 ${sop.status === "completed" || sop.status === "ready"
                          ? "bg-accent/10 text-accent border-accent/20" 
                          : "bg-muted/50 text-muted-foreground"
                        }`}
                      >
                        {sop.status === "completed" || sop.status === "ready" ? "Ready" : "Draft"}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm mb-1">{sop.course}</p>
                    <p className="text-muted-foreground/70 text-sm mb-4">{sop.country}</p>

                    <div className="flex gap-2 pt-2 border-t border-border">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 hover:bg-accent hover:text-accent-foreground hover:border-accent transition-colors"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        PDF
                      </Button>
                      <Link to={`/sop-result/${sop.id}`} className="flex-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full hover:bg-muted"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
