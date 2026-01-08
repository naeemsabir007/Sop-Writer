import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLoginTheme } from "@/hooks/use-login-theme";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { z } from "zod";
import Logo from "@/components/Logo";

const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

const Signup = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme } = useLoginTheme();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        navigate("/dashboard", { replace: true });
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate("/dashboard", { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const validatePassword = (pwd: string): string[] => {
    const result = passwordSchema.safeParse(pwd);
    if (result.success) return [];
    return result.error.errors.map(e => e.message);
  };

  const getPasswordStrength = (pwd: string): { level: number; label: string; color: string } => {
    if (!pwd) return { level: 0, label: "", color: "" };
    const errors = validatePassword(pwd);
    const strength = 5 - errors.length;
    if (strength <= 1) return { level: 1, label: "Weak", color: "bg-red-500" };
    if (strength <= 2) return { level: 2, label: "Fair", color: "bg-orange-500" };
    if (strength <= 3) return { level: 3, label: "Good", color: "bg-yellow-500" };
    if (strength <= 4) return { level: 4, label: "Strong", color: "bg-emerald-400" };
    return { level: 5, label: "Excellent", color: "bg-emerald-500" };
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      toast({
        title: "Password Requirements Not Met",
        description: passwordErrors[0],
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      console.error("Signup error:", error.message);
      toast({
        title: "Signup Failed",
        description: "Unable to create account. Please check your details and try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Account Created!",
        description: "Please check your email to verify your account.",
      });
    }

    setLoading(false);
  };

  const passwordStrength = getPasswordStrength(password);

  const handleGoogleSignup = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      console.error("Google signup error:", error.message);
      toast({
        title: "Google Signup Failed",
        description: "Unable to sign up with Google. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-screen flex flex-col lg:flex-row overflow-hidden">
      {/* Left Side - Visual Experience */}
      <div className="lg:w-1/2 h-[200px] lg:h-screen relative overflow-hidden flex-shrink-0">
        {/* Layer 1: Deep Navy Background (always visible) */}
        <div className="absolute inset-0 bg-[#0B1120]" />
        
        {/* Layer 2: Background Image with Fade-in on Load */}
        {theme && (
          <img
            src={theme.image}
            alt="Background"
            onLoad={() => setImageLoaded(true)}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[800ms] ease-in ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              animation: imageLoaded ? 'slow-zoom 10s ease-out forwards' : 'none',
            }}
          />
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-[#0B1120]/85" />
        
        {/* Content Container */}
        <div className="relative z-10 h-full flex flex-col justify-between p-8 lg:p-12">
          {/* Logo - Top Left */}
          <Link to="/" className="flex-shrink-0">
            <Logo size="lg" variant="light" />
          </Link>

          {/* Spacer for mobile */}
          <div className="flex-1" />

          {/* Glassmorphism Quote Card - Bottom Left */}
          <div 
            className={`hidden lg:block mb-8 transition-all duration-1000 ${
              imageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`} 
            style={{ transitionDelay: '0.3s' }}
          >
            <div 
              className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 max-w-md"
              style={{
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              }}
            >
              <p className="font-['Playfair_Display'] text-2xl xl:text-3xl text-white italic leading-relaxed mb-4">
                "Your journey to a top university starts with a single click."
              </p>
              <p className="text-[#F59E0B] text-sm uppercase tracking-widest font-medium">
                Join 15,000+ Successful Applicants
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="lg:w-1/2 bg-white dark:bg-[#0B1120] p-8 lg:p-16 xl:p-24 flex items-center justify-center flex-1 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Glassmorphism Card */}
          <div className="bg-white dark:bg-white/5 dark:backdrop-blur-xl dark:border dark:border-white/10 dark:shadow-2xl rounded-2xl p-8 lg:p-10">
            <div className="mb-10">
              <h1 className="text-2xl lg:text-3xl font-semibold text-[#0B1120] dark:text-white mb-2 font-['Inter']">
                Claim Your Student Profile
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-['Inter']">
                Enter your details to generate your first visa document
              </p>
            </div>

            <form onSubmit={handleSignup} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-[#0B1120] dark:text-white font-medium font-['Inter']">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Ahmad Khan"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="pl-12 h-12 bg-[#F8FAFC] dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:border-[#0B1120] dark:focus:border-emerald-500 focus:ring-[#0B1120] dark:focus:ring-emerald-500 rounded-lg font-['Inter'] text-slate-900 dark:text-white placeholder:text-slate-400"
                  />
                </div>
              </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#0B1120] dark:text-white font-medium font-['Inter']">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-12 h-12 bg-[#F8FAFC] dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:border-[#0B1120] dark:focus:border-emerald-500 focus:ring-[#0B1120] dark:focus:ring-emerald-500 rounded-lg font-['Inter'] text-slate-900 dark:text-white placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#0B1120] dark:text-white font-medium font-['Inter']">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="pl-12 pr-12 h-12 bg-[#F8FAFC] dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:border-[#0B1120] dark:focus:border-emerald-500 focus:ring-[#0B1120] dark:focus:ring-emerald-500 rounded-lg font-['Inter'] text-slate-900 dark:text-white placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {password && (
                <div className="space-y-1 pt-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          level <= passwordStrength.level ? passwordStrength.color : "bg-slate-200 dark:bg-slate-700"
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs font-['Inter'] ${passwordStrength.level >= 4 ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"}`}>
                    {passwordStrength.label}
                  </p>
                </div>
              )}
              <p className="text-xs text-slate-400 font-['Inter']">
                Must be 8+ characters with uppercase, lowercase, number, and special character
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#F59E0B] hover:bg-[#F59E0B]/90 hover:scale-[1.02] text-white rounded-lg text-base font-medium transition-all duration-200 mt-2 font-['Inter']"
            >
              {loading ? "Creating account..." : "Start My Application"}
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-transparent text-slate-400 font-['Inter']">or</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignup}
            className="w-full h-12 rounded-lg text-base font-medium border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 font-['Inter'] text-slate-900 dark:text-white"
          >
            <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>

          <p className="text-center mt-8 text-slate-500 dark:text-slate-400 font-['Inter']">
            Already have an account?{" "}
            <Link to="/login" className="text-[#0B1120] dark:text-emerald-400 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
