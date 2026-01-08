import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, PlusCircle, FileText, Settings, LogOut, Menu, X, Crown, Zap, ShieldAlert, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Logo from "./Logo";

const menuItems = [
  { icon: Home, label: "Dashboard", path: "/dashboard" },
  { icon: PlusCircle, label: "Create New SOP", path: "/create-sop" },
  { icon: FileText, label: "My Documents", path: "/dashboard/documents" },
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
];

const sidebarVariants = {
  hidden: { x: -280, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    }
  },
};

const itemVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
  },
};

const DashboardSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();
        
        setIsAdmin(!!data);
      }
    };
    checkAdminRole();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error logging out");
    } else {
      toast.success("Logged out successfully");
      navigate("/");
    }
  };

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const SidebarContent = () => (
    <motion.div 
      className="flex flex-col h-full"
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Logo */}
      <motion.div 
        className="p-6 border-b border-slate-200 dark:border-slate-800"
        variants={itemVariants}
      >
        <Link to="/">
          <Logo size="md" variant="auto" />
        </Link>
      </motion.div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item, index) => (
          <motion.div
            key={item.path}
            variants={itemVariants}
          >
            <Link
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group ${
                isActive(item.path)
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                  : "text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <item.icon className={`w-5 h-5 transition-transform duration-300 ${!isActive(item.path) ? "group-hover:scale-110" : ""}`} />
              <span className="font-medium">{item.label}</span>
            </Link>
          </motion.div>
        ))}

        {/* Admin Panel Link - Only visible for admins */}
        {isAdmin && (
          <motion.div variants={itemVariants}>
            <Link
              to="/admin-panel"
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group ${
                isActive("/admin-panel")
                  ? "bg-amber-500 text-white shadow-lg shadow-amber-500/25"
                  : "text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-500/10"
              }`}
            >
              <ShieldAlert className={`w-5 h-5 transition-transform duration-300 ${!isActive("/admin-panel") ? "group-hover:scale-110" : ""}`} />
              <span className="font-medium">Admin Panel</span>
            </Link>
          </motion.div>
        )}
      </nav>

      {/* Upgrade to Pro Card */}
      <motion.div 
        className="p-4"
        variants={itemVariants}
      >
        <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-5 h-5 text-amber-500" />
            <span className="font-semibold text-slate-900 dark:text-white text-sm">Upgrade to Pro</span>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-xs mb-3">
            Unlimited SOPs, AI revisions & priority support.
          </p>
          <Button 
            size="sm" 
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium shadow-lg shadow-amber-500/25 transition-all duration-300 hover:shadow-amber-500/40"
          >
            <Zap className="w-4 h-4 mr-1" />
            Go Pro
          </Button>
        </div>
      </motion.div>

      {/* Contact Us & Logout */}
      <motion.div 
        className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-1"
        variants={itemVariants}
      >
        <Link
          to="/contact"
          onClick={() => setIsMobileOpen(false)}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="font-medium">Contact Us</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-300"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </motion.div>
    </motion.div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-primary rounded-lg text-white shadow-lg"
      >
        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <motion.div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}

      {/* Desktop Sidebar - Fixed 280px width with slide-in animation */}
      <motion.aside 
        className="hidden lg:block w-[280px] bg-white dark:bg-slate-900 min-h-screen fixed left-0 top-0 border-r border-slate-200 dark:border-slate-800"
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile Sidebar */}
      <motion.aside
        className={`lg:hidden fixed left-0 top-0 w-[280px] bg-white dark:bg-slate-900 min-h-screen z-50 border-r border-slate-200 dark:border-slate-800`}
        initial={{ x: -280 }}
        animate={{ x: isMobileOpen ? 0 : -280 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <SidebarContent />
      </motion.aside>
    </>
  );
};

export default DashboardSidebar;
