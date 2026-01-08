import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, Sparkles, Globe, Brain, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Step {
  id: number;
  label: string;
  icon: React.ElementType;
  duration: number;
}

const GeneratingSOP = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [sopData, setSopData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const steps: Step[] = [
    { id: 1, label: "Analyzing Profile...", icon: Brain, duration: 1500 },
    { id: 2, label: `Checking ${sopData?.country || "Country"} Visa Requirements...`, icon: Globe, duration: 2000 },
    { id: 3, label: `Calibrating Tone to IELTS ${sopData?.ielts_score || "Score"}...`, icon: Sparkles, duration: 2000 },
    { id: 4, label: "Finalizing Draft...", icon: FileText, duration: 1500 },
  ];

  useEffect(() => {
    const fetchSOP = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from("sops")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error || !data) {
        setError("SOP not found");
        return;
      }

      setSopData(data);
    };

    fetchSOP();
  }, [id]);

  useEffect(() => {
    if (!sopData || isGenerating) return;

    setIsGenerating(true);
    let stepIndex = 0;

    const advanceStep = () => {
      if (stepIndex < steps.length) {
        setCurrentStep(stepIndex + 1);
        stepIndex++;
        setTimeout(advanceStep, steps[stepIndex - 1]?.duration || 1500);
      } else {
        // All steps complete, trigger AI generation
        generateSOP();
      }
    };

    advanceStep();
  }, [sopData]);

  const generateSOP = async () => {
    try {
      // 🔥 Import Gemini SDK dynamically to avoid issues
      const { GoogleGenerativeAI } = await import("@google/generative-ai");

      // Check API key
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        console.error("🔥 VITE_GEMINI_API_KEY is missing");
        throw new Error("API configuration error. Please contact support.");
      }
      console.log("🔑 API Key Status:", `Present (${apiKey.length} chars)`);

      // Initialize Gemini
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      // Build the comprehensive SOP prompt
      const prompt = `
You are an expert Statement of Purpose (SOP) writer for international student visa applications. 
Write a compelling, professional, and personalized Statement of Purpose based on the following details:

**Applicant Information:**
- Full Name: ${sopData?.full_name || "Applicant"}
- Country of Application: ${sopData?.country || "Not specified"}
- Target University: ${sopData?.university || "Not specified"}
- Course/Program: ${sopData?.course || "Not specified"}
- Degree Level: ${sopData?.degree_level || "Not specified"}
- IELTS Score: ${sopData?.ielts_score || "Not provided"}
- Current Qualification: ${sopData?.current_qualification || "Not specified"}
- Work Experience: ${sopData?.work_experience || "Not provided"}
- Motivation: ${sopData?.motivation || "Not provided"}
- Career Goals: ${sopData?.career_goals || "Not provided"}
- Why This University: ${sopData?.why_university || "Not provided"}
- Why This Country: ${sopData?.why_country || "Not provided"}
- Financial Sponsor: ${sopData?.financial_sponsor || "Not provided"}

**Requirements:**
1. Write in first person, professional yet personal tone
2. Length: 800-1200 words
3. Structure with clear paragraphs (no headers needed)
4. Include: Introduction, Academic Background, Professional Experience (if any), Why this Course, Why this University, Why this Country, Career Goals, Conclusion
5. Make it authentic and specific to the applicant's profile
6. Calibrate language complexity to match IELTS ${sopData?.ielts_score || "7.0"} band
7. Ensure it addresses visa officer concerns about genuine student intent
8. End with strong commitment to return to home country after studies

Write ONLY the SOP content, no additional commentary.
      `.trim();

      console.log("🚀 Calling Gemini API for SOP generation...");

      // Call Gemini
      const result = await model.generateContent(prompt);
      const generatedText = result.response.text();

      if (!generatedText || generatedText.trim().length < 100) {
        throw new Error("Generated content is too short or empty");
      }

      console.log("✅ SOP generated successfully:", generatedText.substring(0, 100) + "...");

      // Save the generated content to Supabase
      const { error: updateError } = await supabase
        .from("sops")
        .update({
          generated_content: generatedText,
          updated_at: new Date().toISOString()
        })
        .eq("id", id);

      if (updateError) {
        console.error("🔥 Failed to save SOP:", updateError);
        throw new Error("Failed to save generated SOP");
      }

      // Success - redirect to result page
      navigate(`/sop-result/${id}`, { replace: true });
    } catch (err: any) {
      console.error("🔥 SOP GEN ERROR:", err);
      console.error("🔥 Error Name:", err?.name);
      console.error("🔥 Error Message:", err?.message);
      setError(err.message || "Failed to generate SOP");
      toast({
        title: "Generation Failed",
        description: err.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRetry = () => {
    setError(null);
    setCurrentStep(0);
    setIsGenerating(false);
    // This will trigger the useEffect to restart
    setSopData({ ...sopData });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
            Generation Failed
          </h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button
            onClick={handleRetry}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 max-w-lg w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-4"
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-2xl font-heading font-bold text-foreground">
            Crafting Your SOP
          </h2>
          <p className="text-muted-foreground mt-2">
            AI is writing your personalized statement
          </p>
        </div>

        {/* Progress Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isComplete = currentStep > index + 1;
            const isCurrent = currentStep === index + 1;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${isComplete
                  ? "bg-emerald-500/10 border border-emerald-500/30"
                  : isCurrent
                    ? "bg-primary/10 border border-primary/30"
                    : "bg-muted/30 border border-transparent"
                  }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isComplete
                    ? "bg-emerald-500 text-white"
                    : isCurrent
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                    }`}
                >
                  <AnimatePresence mode="wait">
                    {isComplete ? (
                      <motion.div
                        key="check"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <Check className="w-5 h-5" />
                      </motion.div>
                    ) : isCurrent ? (
                      <motion.div
                        key="loader"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Loader2 className="w-5 h-5" />
                      </motion.div>
                    ) : (
                      <StepIcon className="w-5 h-5" />
                    )}
                  </AnimatePresence>
                </div>
                <span
                  className={`font-medium ${isComplete
                    ? "text-emerald-500"
                    : isCurrent
                      ? "text-foreground"
                      : "text-muted-foreground"
                    }`}
                >
                  {step.label}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-muted-foreground mt-8"
        >
          This usually takes 10-20 seconds...
        </motion.p>
      </motion.div>
    </div>
  );
};

export default GeneratingSOP;
