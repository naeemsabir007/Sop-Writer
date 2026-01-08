import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowRight, 
  ArrowLeft,
  Sparkles, 
  GraduationCap, 
  User, 
  Target, 
  Check,
  MapPin,
  Wallet,
  AlertTriangle,
  Phone,
  Mail,
  Home
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

// Validation schemas
const contactSchema = z.object({
  fullName: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  phoneNumber: z.string().trim().min(7, "Phone number must be at least 7 characters").max(20, "Phone number must be less than 20 characters").regex(/^\+?[0-9\s-]+$/, "Invalid phone number format"),
  homeAddress: z.string().trim().min(5, "Address must be at least 5 characters").max(500, "Address must be less than 500 characters"),
});

const destinationSchema = z.object({
  country: z.string().trim().min(2, "Country is required").max(100, "Country name too long"),
  university: z.string().trim().min(2, "University is required").max(200, "University name too long"),
  course: z.string().trim().min(2, "Course is required").max(200, "Course name too long"),
  degreeLevel: z.string().trim().min(2, "Degree level is required"),
});

const academicSchema = z.object({
  currentQualification: z.string().trim().min(2, "Qualification is required"),
  academicScore: z.string().trim().min(1, "Academic score is required").max(50, "Score too long"),
  englishTest: z.string().trim().min(2, "English test is required"),
  englishScore: z.string().max(20, "Score too long").optional(),
  gapYears: z.number().min(0).max(20),
  gapExplanation: z.string().max(1000, "Explanation must be less than 1000 characters").optional(),
});

const financialSchema = z.object({
  sponsor: z.string().trim().min(2, "Sponsor is required"),
  futurePlan: z.string().trim().min(2, "Future plan is required"),
  refusalExplanation: z.string().max(1000, "Explanation must be less than 1000 characters").optional(),
});

const COUNTRIES = [
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "UK", name: "UK", flag: "🇬🇧" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "US", name: "USA", flag: "🇺🇸" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
];

const DEGREE_LEVELS = ["Bachelors", "Masters", "PhD"];
const ENGLISH_TESTS = ["IELTS", "PTE", "Oxford Test", "English Proficiency Cert (No IELTS)"];
const SPONSORS = ["Father", "Self", "Loan", "Uncle/Relative"];
const FUTURE_PLANS = ["Return to Pakistan for Job", "Start Business in Pakistan", "PhD Research"];

const QUALIFICATIONS = [
  "Intermediate (FSc Pre-Engineering)",
  "Intermediate (FSc Pre-Medical)",
  "Intermediate (ICS - Computer Science)",
  "Intermediate (I.Com)",
  "A-Levels",
  "DAE (Diploma)",
  "Bachelors (4 Years)",
  "Masters (16 Years Education)",
];

const CreateSOP = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [direction, setDirection] = useState(1);
  const [userEmail, setUserEmail] = useState("");
  
  // Step 1: Contact Details
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("+92");
  const [email, setEmail] = useState("");
  const [homeAddress, setHomeAddress] = useState("");
  
  // Step 2: Target Details
  const [country, setCountry] = useState("");
  const [isOtherCountry, setIsOtherCountry] = useState(false);
  const [customCountry, setCustomCountry] = useState("");
  const [university, setUniversity] = useState("");
  const [course, setCourse] = useState("");
  const [degreeLevel, setDegreeLevel] = useState("");
  
  // Step 2: Academic Profile
  const [currentQualification, setCurrentQualification] = useState("");
  const [academicScore, setAcademicScore] = useState("");
  const [englishTest, setEnglishTest] = useState("");
  const [englishScore, setEnglishScore] = useState("");
  const [gapYears, setGapYears] = useState(0);
  const [gapExplanation, setGapExplanation] = useState("");
  
  // Step 3: Financial & Ties
  const [sponsor, setSponsor] = useState("");
  const [futurePlan, setFuturePlan] = useState("");
  const [hasVisaRefusal, setHasVisaRefusal] = useState(false);
  const [refusalExplanation, setRefusalExplanation] = useState("");
  
  // Step 3: Story toggle
  const [wantsPersonalStory, setWantsPersonalStory] = useState(false);
  const [personalStory, setPersonalStory] = useState("");

  // Fetch user email on mount
  useEffect(() => {
    const fetchUserEmail = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
        setEmail(user.email);
      }
    };
    fetchUserEmail();
  }, []);

  const steps = [
    { number: 1, title: "Contact", icon: User },
    { number: 2, title: "Destination", icon: Target },
    { number: 3, title: "Academic", icon: GraduationCap },
    { number: 4, title: "Financial", icon: Wallet },
    { number: 5, title: "Generate", icon: Sparkles },
  ];

  const selectedCountry = isOtherCountry ? customCountry : country;
  const needsEnglishScore = englishTest === "IELTS" || englishTest === "PTE";
  
  const isStep1Valid = fullName && phoneNumber.length > 3 && email && homeAddress;
  const isStep2Valid = selectedCountry && university && course && degreeLevel;
  const isStep3Valid = currentQualification && academicScore && englishTest && 
    (!needsEnglishScore || englishScore) && 
    (gapYears === 0 || gapExplanation);
  const isStep4Valid = sponsor && futurePlan && (!hasVisaRefusal || refusalExplanation);

  const handleNext = () => {
    if (currentStep < 5) {
      setDirection(1);
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setDirection(-1);
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCountrySelect = (countryName: string) => {
    if (countryName === "other") {
      setIsOtherCountry(true);
      setCountry("");
    } else {
      setIsOtherCountry(false);
      setCountry(countryName);
      setCustomCountry("");
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);

    try {
      // Validate all form data before submission
      const contactValidation = contactSchema.safeParse({
        fullName,
        email,
        phoneNumber,
        homeAddress,
      });

      if (!contactValidation.success) {
        const firstError = contactValidation.error.errors[0];
        throw new Error(`Contact details: ${firstError.message}`);
      }

      const destinationValidation = destinationSchema.safeParse({
        country: selectedCountry,
        university,
        course,
        degreeLevel,
      });

      if (!destinationValidation.success) {
        const firstError = destinationValidation.error.errors[0];
        throw new Error(`Destination details: ${firstError.message}`);
      }

      const academicValidation = academicSchema.safeParse({
        currentQualification,
        academicScore,
        englishTest,
        englishScore: needsEnglishScore ? englishScore : undefined,
        gapYears,
        gapExplanation: gapYears > 0 ? gapExplanation : undefined,
      });

      if (!academicValidation.success) {
        const firstError = academicValidation.error.errors[0];
        throw new Error(`Academic details: ${firstError.message}`);
      }

      const financialValidation = financialSchema.safeParse({
        sponsor,
        futurePlan,
        refusalExplanation: hasVisaRefusal ? refusalExplanation : undefined,
      });

      if (!financialValidation.success) {
        const firstError = financialValidation.error.errors[0];
        throw new Error(`Financial details: ${firstError.message}`);
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to create an SOP.",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      // Use validated & sanitized data
      const validatedContact = contactValidation.data;
      const validatedDestination = destinationValidation.data;
      const validatedAcademic = academicValidation.data;
      const validatedFinancial = financialValidation.data;

      // Insert main SOP data (non-sensitive fields remain in sops table)
      const { data: sopData, error: sopError } = await supabase
        .from("sops")
        .insert({
          user_id: user.id,
          full_name: validatedContact.fullName,
          email: validatedContact.email,
          country: validatedDestination.country,
          university: validatedDestination.university,
          course: validatedDestination.course,
          degree_level: validatedDestination.degreeLevel,
          current_qualification: validatedAcademic.currentQualification,
          academic_score: validatedAcademic.academicScore,
          ielts_score: needsEnglishScore ? `${validatedAcademic.englishTest}: ${validatedAcademic.englishScore}` : validatedAcademic.englishTest,
          gap_years: validatedAcademic.gapYears,
          motivation: validatedAcademic.gapExplanation || null,
          future_goals: `${validatedFinancial.futurePlan}${hasVisaRefusal ? ` | Visa Refusal: ${validatedFinancial.refusalExplanation}` : ""}`,
          status: "processing",
        })
        .select()
        .single();

      if (sopError) throw sopError;

      // Insert sensitive PII into separate secure table
      const { error: sensitiveError } = await supabase
        .from("sop_sensitive_details")
        .insert({
          sop_id: sopData.id,
          user_id: user.id,
          home_address: validatedContact.homeAddress,
          phone_number: validatedContact.phoneNumber,
          financial_background: validatedFinancial.sponsor,
        });

      if (sensitiveError) {
        console.error("Error saving sensitive details:", sensitiveError);
        // Continue anyway - main SOP data is saved
      }

      // Redirect to the generating page with animated progress
      navigate(`/generating/${sopData.id}`);

    } catch (error: any) {
      setIsLoading(false);
      toast({
        title: "Error creating SOP",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <div className="relative mx-auto w-32 h-32">
            <motion.div 
              className="absolute inset-0 rounded-full border-4 border-accent/30"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div 
              className="absolute inset-2 rounded-full border-4 border-t-accent border-r-transparent border-b-transparent border-l-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Sparkles className="w-10 h-10 text-accent" />
            </motion.div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-heading font-bold text-foreground">
              Crafting Your Perfect SOP...
            </h2>
            <p className="text-muted-foreground">
              Our AI is analyzing your profile and generating a personalized statement
            </p>
          </div>
          <div className="flex justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 rounded-full bg-accent"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="relative">
            {/* Background Track */}
            <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-accent to-emerald-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            
            {/* Step Indicators */}
            <div className="flex justify-between mt-4">
              {steps.map((step) => (
                <div key={step.number} className="flex flex-col items-center">
                  <motion.div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                      currentStep > step.number
                        ? "bg-accent text-accent-foreground"
                        : currentStep === step.number
                        ? "bg-primary text-primary-foreground shadow-lg"
                        : "bg-muted/50 text-muted-foreground"
                    }`}
                    animate={currentStep === step.number ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    {currentStep > step.number ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </motion.div>
                  <span className={`mt-2 text-xs font-medium hidden sm:block ${
                    currentStep >= step.number ? "text-foreground" : "text-muted-foreground"
                  }`}>
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form Card */}
        <motion.div 
          className="bg-card rounded-2xl shadow-2xl border border-border/50 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AnimatePresence mode="wait" custom={direction}>
            {/* Step 1: Contact Details */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="p-8"
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                  <h1 className="text-2xl font-heading font-bold text-foreground">
                    Contact Details
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    Required for the official letter header
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Legal Name</Label>
                    <Input
                      id="fullName"
                      placeholder="e.g., Muhammad Ahmed Khan"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <div className="flex gap-2">
                      <Input
                        id="phoneNumber"
                        placeholder="+92 300 1234567"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="h-12"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12 pl-10"
                      />
                    </div>
                    {userEmail && email === userEmail && (
                      <p className="text-xs text-muted-foreground">Auto-filled from your login</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="homeAddress">Home Address</Label>
                    <div className="relative">
                      <Home className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Textarea
                        id="homeAddress"
                        placeholder="House 12, Street 5, DHA Phase 6, Lahore"
                        value={homeAddress}
                        onChange={(e) => setHomeAddress(e.target.value)}
                        rows={2}
                        className="pl-10 resize-none"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleNext}
                  disabled={!isStep1Valid}
                  className="w-full mt-8 h-14 bg-gradient-to-r from-accent to-emerald-500 hover:from-accent/90 hover:to-emerald-500/90 text-accent-foreground font-semibold text-lg shadow-lg"
                >
                  Next: Destination
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
            )}

            {/* Step 2: Target Details */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="p-8"
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8 text-accent" />
                  </div>
                  <h1 className="text-2xl font-heading font-bold text-foreground">
                    Where are you going?
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    Select your dream destination
                  </p>
                </div>

                {/* Country Cards Grid */}
                <div className="space-y-6">
                  <div>
                    <Label className="mb-3 block">Target Country</Label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                      {COUNTRIES.map((c) => (
                        <motion.button
                          key={c.code}
                          type="button"
                          onClick={() => handleCountrySelect(c.name)}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            country === c.name && !isOtherCountry
                              ? "border-accent bg-accent/10 shadow-lg"
                              : "border-border/50 hover:border-accent/50 hover:bg-muted/50"
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <div className="text-3xl mb-1">{c.flag}</div>
                          <div className="text-xs font-medium">{c.name}</div>
                        </motion.button>
                      ))}
                      <motion.button
                        type="button"
                        onClick={() => handleCountrySelect("other")}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          isOtherCountry
                            ? "border-accent bg-accent/10 shadow-lg"
                            : "border-dashed border-border hover:border-accent/50"
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="text-3xl mb-1">🌍</div>
                        <div className="text-xs font-medium">Other</div>
                      </motion.button>
                    </div>
                    
                    {isOtherCountry && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-4"
                      >
                        <Input
                          placeholder="Enter country name"
                          value={customCountry}
                          onChange={(e) => setCustomCountry(e.target.value)}
                          className="border-accent"
                        />
                      </motion.div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="university">Target University</Label>
                    <Input
                      id="university"
                      placeholder="e.g., University of Milan, Harvard"
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="degreeLevel">Degree Level</Label>
                    <Select value={degreeLevel} onValueChange={setDegreeLevel}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select degree level" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEGREE_LEVELS.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="course">Major / Course Name</Label>
                    <Input
                      id="course"
                      placeholder="e.g., Computer Science, Business Administration"
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1 h-14"
                  >
                    <ArrowLeft className="mr-2 w-5 h-5" />
                    Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={!isStep2Valid}
                    className="flex-1 h-14 bg-gradient-to-r from-accent to-emerald-500 hover:from-accent/90 hover:to-emerald-500/90 text-accent-foreground font-semibold text-lg shadow-lg"
                  >
                    Next: Academic Profile
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Academic Profile */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="p-8"
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <GraduationCap className="w-8 h-8 text-primary" />
                  </div>
                  <h1 className="text-2xl font-heading font-bold text-foreground">
                    Your Academic Profile
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    Help us calibrate the AI to your background
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="qualification">Last Qualification</Label>
                      <Select value={currentQualification} onValueChange={setCurrentQualification}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select your qualification" />
                        </SelectTrigger>
                        <SelectContent>
                          {QUALIFICATIONS.map((qual) => (
                            <SelectItem key={qual} value={qual}>
                              {qual}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="academicScore">CGPA / Percentage</Label>
                      <Input
                        id="academicScore"
                        placeholder="e.g., 3.8 GPA or 85%"
                        value={academicScore}
                        onChange={(e) => setAcademicScore(e.target.value)}
                        className="h-12"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>English Proficiency Test</Label>
                    <RadioGroup 
                      value={englishTest} 
                      onValueChange={setEnglishTest}
                      className="grid grid-cols-2 gap-3"
                    >
                      {ENGLISH_TESTS.map((test) => (
                        <div key={test} className="flex items-center space-x-2">
                          <RadioGroupItem value={test} id={test} />
                          <Label htmlFor={test} className="cursor-pointer text-sm">
                            {test}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                    
                    {needsEnglishScore && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-4"
                      >
                        <Label htmlFor="englishScore">Enter Exact Score</Label>
                        <Input
                          id="englishScore"
                          placeholder="e.g., 6.5 or 7.0"
                          value={englishScore}
                          onChange={(e) => setEnglishScore(e.target.value)}
                          className="h-12 mt-2 border-accent"
                        />
                      </motion.div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gapYears">Study Gaps (Years)</Label>
                    <Input
                      id="gapYears"
                      type="number"
                      min="0"
                      max="10"
                      placeholder="0"
                      value={gapYears}
                      onChange={(e) => setGapYears(parseInt(e.target.value) || 0)}
                      className="h-12"
                    />
                    
                    {gapYears > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-4"
                      >
                        <Label htmlFor="gapExplanation">Explain your gap (Work? Family?)</Label>
                        <Textarea
                          id="gapExplanation"
                          placeholder="The AI will address this professionally in your SOP..."
                          rows={3}
                          value={gapExplanation}
                          onChange={(e) => setGapExplanation(e.target.value)}
                          className="mt-2 border-amber-500"
                        />
                      </motion.div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1 h-14"
                  >
                    <ArrowLeft className="mr-2 w-5 h-5" />
                    Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={!isStep3Valid}
                    className="flex-1 h-14 bg-gradient-to-r from-accent to-emerald-500 hover:from-accent/90 hover:to-emerald-500/90 text-accent-foreground font-semibold text-lg shadow-lg"
                  >
                    Next: Financial
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Financial & Ties */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="p-8"
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                    <Wallet className="w-8 h-8 text-amber-500" />
                  </div>
                  <h1 className="text-2xl font-heading font-bold text-foreground">
                    Ties to Home Country
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    This helps build a strong visa case
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="sponsor">Who is sponsoring you?</Label>
                    <Select value={sponsor} onValueChange={setSponsor}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select sponsor" />
                      </SelectTrigger>
                      <SelectContent>
                        {SPONSORS.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      This helps AI write the 'Financial Stability' paragraph
                    </p>
                  </div>

                  {/* Personal Story Toggle */}
                  <div className="p-4 rounded-xl border border-border bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-primary" />
                        <div>
                          <Label htmlFor="personalStory" className="cursor-pointer">
                            Add a personal background story?
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Optional: Share your unique journey
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="personalStory"
                        checked={wantsPersonalStory}
                        onCheckedChange={setWantsPersonalStory}
                      />
                    </div>
                    
                    {wantsPersonalStory && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-4"
                      >
                        <Textarea
                          placeholder="Tell us your story - what inspired you to pursue this field? Any unique experiences?"
                          rows={4}
                          value={personalStory}
                          onChange={(e) => setPersonalStory(e.target.value)}
                          className="border-primary/50"
                        />
                      </motion.div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="futurePlan">Future Plans After Study</Label>
                    <Select value={futurePlan} onValueChange={setFuturePlan}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="What do you plan to do after?" />
                      </SelectTrigger>
                      <SelectContent>
                        {FUTURE_PLANS.map((plan) => (
                          <SelectItem key={plan} value={plan}>
                            {plan}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="p-4 rounded-xl border border-border bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        <div>
                          <Label htmlFor="visaRefusal" className="cursor-pointer">
                            Visa Refusal History
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Have you been refused a visa before?
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="visaRefusal"
                        checked={hasVisaRefusal}
                        onCheckedChange={setHasVisaRefusal}
                      />
                    </div>
                    
                    {hasVisaRefusal && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-4"
                      >
                        <Textarea
                          placeholder="Which country refused you and why? The AI will address this professionally..."
                          rows={3}
                          value={refusalExplanation}
                          onChange={(e) => setRefusalExplanation(e.target.value)}
                          className="border-amber-500"
                        />
                      </motion.div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1 h-14"
                  >
                    <ArrowLeft className="mr-2 w-5 h-5" />
                    Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={!isStep4Valid}
                    className="flex-1 h-14 bg-gradient-to-r from-accent to-emerald-500 hover:from-accent/90 hover:to-emerald-500/90 text-accent-foreground font-semibold text-lg shadow-lg"
                  >
                    Review & Generate
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 5: Summary & Generate */}
            {currentStep === 5 && (
              <motion.div
                key="step5"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="p-8"
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-accent" />
                  </div>
                  <h1 className="text-2xl font-heading font-bold text-foreground">
                    Ready to Generate
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    Review your information before generating
                  </p>
                </div>

                {/* Summary Cards */}
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-muted/50 border border-border">
                    <div className="flex items-center gap-3 mb-3">
                      <User className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold">Contact Details</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Name:</span>
                        <span className="ml-2 font-medium">{fullName}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Phone:</span>
                        <span className="ml-2 font-medium">{phoneNumber}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="ml-2 font-medium">{email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-muted/50 border border-border">
                    <div className="flex items-center gap-3 mb-3">
                      <Target className="w-5 h-5 text-accent" />
                      <h3 className="font-semibold">Destination</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Country:</span>
                        <span className="ml-2 font-medium">{selectedCountry}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">University:</span>
                        <span className="ml-2 font-medium">{university}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Degree:</span>
                        <span className="ml-2 font-medium">{degreeLevel}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Course:</span>
                        <span className="ml-2 font-medium">{course}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-muted/50 border border-border">
                    <div className="flex items-center gap-3 mb-3">
                      <GraduationCap className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold">Academic Profile</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Qualification:</span>
                        <span className="ml-2 font-medium">{currentQualification}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Score:</span>
                        <span className="ml-2 font-medium">{academicScore}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">English:</span>
                        <span className="ml-2 font-medium">
                          {englishTest}{needsEnglishScore ? ` (${englishScore})` : ""}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Gap Years:</span>
                        <span className="ml-2 font-medium">{gapYears}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-muted/50 border border-border">
                    <div className="flex items-center gap-3 mb-3">
                      <Wallet className="w-5 h-5 text-amber-500" />
                      <h3 className="font-semibold">Financial & Ties</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Sponsor:</span>
                        <span className="ml-2 font-medium">{sponsor}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Future Plan:</span>
                        <span className="ml-2 font-medium">{futurePlan}</span>
                      </div>
                      {hasVisaRefusal && (
                        <div className="col-span-2">
                          <span className="text-amber-500">⚠️ Has previous visa refusal</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1 h-14"
                  >
                    <ArrowLeft className="mr-2 w-5 h-5" />
                    Back
                  </Button>
                  <Button
                    onClick={handleGenerate}
                    className="flex-1 h-14 bg-gradient-to-r from-accent to-emerald-500 hover:from-accent/90 hover:to-emerald-500/90 text-accent-foreground font-bold text-lg shadow-xl"
                  >
                    <Sparkles className="mr-2 w-5 h-5" />
                    Generate Perfect SOP
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateSOP;
