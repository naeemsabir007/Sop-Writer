import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, FileText, GraduationCap, Briefcase, Plane, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface SOPSample {
  id: string;
  title: string;
  university: string;
  country: string;
  program: string;
  archetype: string;
  icon: React.ElementType;
  color: string;
  preview: string;
  fullContent: string;
  tags: string[];
}

const PERFECT_SOP_EXAMPLES: SOPSample[] = [
  {
    id: "us-narrative",
    title: "The US Narrative",
    university: "Massachusetts Institute of Technology (MIT)",
    country: "🇺🇸 USA",
    program: "MS Computer Science",
    archetype: "Emotional Hook + Technical Solution",
    icon: GraduationCap,
    color: "from-blue-500 to-indigo-600",
    preview: "A story about building an offline communication app during a devastating flood in Karachi...",
    tags: ["Narrative-Driven", "Personal Story", "Technical Excellence"],
    fullContent: `Statement of Purpose

The monsoon of 2022 didn't just flood the streets of Karachi—it drowned our voices. For 72 hours, as water levels rose past our doorsteps, my family and I watched our phones become useless rectangles of glass. Cell towers were down. Internet was a memory. And somewhere across the city, my grandmother was alone.

That helplessness changed my life's trajectory.

Within weeks of the floodwaters receding, I had built the first prototype of "SafeLink"—an offline mesh networking application that allows smartphones to communicate through Bluetooth and WiFi Direct, creating ad-hoc networks when infrastructure fails. The technical challenge was immense: designing efficient routing algorithms that could hop through dozens of intermediate devices, managing battery consumption on already-strained phones, and creating an interface simple enough for my grandmother to use.

My undergraduate studies in Computer Science at LUMS provided the foundation. Professor Zia's course on Distributed Systems taught me the theoretical underpinnings of peer-to-peer networks. My 3.89 GPA reflects not just academic rigor, but genuine curiosity—I consistently sought out the hardest problems, the unsolved questions.

But theory wasn't enough. During my internship at Careem, I worked on their real-time dispatch system, learning how to optimize algorithms for millions of daily users. When our team reduced average wait times by 23%, I understood the impact of efficient code on real lives. I implemented a novel caching strategy using Redis that handled 50,000 concurrent connections—skills I immediately applied to SafeLink's message queue system.

SafeLink now has 15,000 active users in flood-prone districts of Sindh. Last year, during Cyclone Biparjoy, it facilitated over 200,000 messages when conventional networks failed. The Dawn newspaper called it "a lifeline born from necessity." But I know its limitations. The current implementation uses a naive flooding protocol that wastes bandwidth. The encryption is adequate but not quantum-resistant. To truly scale this solution for disaster scenarios worldwide, I need to master the cutting edge.

This is why MIT's Computer Science program is not just my goal—it is my necessity.

Professor Hari Balakrishnan's work on delay-tolerant networking directly addresses SafeLink's core challenges. His Haggle project demonstrated mesh networking at a scale I can only dream of. I have read his papers on opportunistic routing algorithms with highlighter in hand, annotating questions I desperately want to ask him. Dr. Samuel Madden's research on mobile data management would help me solve SafeLink's data synchronization conflicts—currently my most frustrating bug.

MIT's culture of "mens et manus"—mind and hand—resonates with my journey. I am not interested in theoretical elegance alone. I want code that runs on phones in disaster zones. I want algorithms that connect grandmothers to grandchildren when the world is falling apart.

Beyond the laboratory, I am drawn to MIT's entrepreneurial ecosystem. The Martin Trust Center's resources could help transform SafeLink from a side project into a sustainable social enterprise. I envision partnerships with UNICEF and the Red Cross, deployments in Bangladesh's delta regions and the typhoon corridors of the Philippines.

Upon completing my Master's degree, I will return to Pakistan. This is not just intention—it is obligation. My country loses an average of $1.5 billion annually to natural disasters. Our early warning systems are decades behind. Our emergency communication infrastructure is virtually non-existent. I want to change this. My goal is to establish a research lab at LUMS focused on disaster-resilient computing, training the next generation of Pakistani engineers to build technology that saves lives.

The floodwaters of 2022 took many things from Karachi. But they also deposited something unexpected in my living room: a purpose. At MIT, I intend to refine that purpose into expertise. I will learn from the best, build with the best, and then bring that knowledge home—so that the next time the monsoons come, no grandmother has to wait alone in the dark.`,
  },
  {
    id: "uk-academic",
    title: "The UK Academic",
    university: "University of Oxford",
    country: "🇬🇧 United Kingdom",
    program: "MSc Data Science",
    archetype: "Professional Tone + Research Focus",
    icon: Briefcase,
    color: "from-emerald-500 to-teal-600",
    preview: "Professional focus on a specific undergraduate thesis and interest in Professor Morrison's research lab...",
    tags: ["Academic Excellence", "Research-Oriented", "Specific Faculty"],
    fullContent: `Statement of Purpose

The intersection of machine learning and healthcare economics presents one of the most consequential research frontiers of our time. My undergraduate thesis at Lahore University of Management Sciences, titled "Predictive Modeling of Hospital Readmission Rates in Pakistani Healthcare Facilities," demonstrated that ensemble methods combining gradient boosting with recurrent neural networks could predict 30-day readmissions with 87.3% accuracy—a 12% improvement over existing models used by Punjab's Department of Health.

This research experience crystallized my academic ambitions. Oxford's MSc in Data Science offers the rigorous methodological training and research environment essential for advancing this work.

My academic preparation has been deliberately structured toward this goal. I graduated with First Class Honours (GPA: 3.92/4.0) in Economics with a minor in Computer Science. My quantitative training included Advanced Econometrics, Time Series Analysis, and Statistical Learning—all courses that demanded not merely computational competence but deep theoretical understanding. Professor Rashid Amjad's seminar on Causal Inference in Observational Studies introduced me to the complexities of drawing valid conclusions from non-experimental data, a challenge central to healthcare analytics.

My technical capabilities extend beyond the classroom. I am proficient in Python (NumPy, pandas, scikit-learn, TensorFlow), R, and SQL. During my research assistantship with Professor Amjad, I processed datasets comprising over 2 million patient records, implementing data cleaning pipelines that reduced missing value rates from 23% to under 3%. The resulting analysis informed policy recommendations presented to the Punjab Health Department.

Professionally, I have applied these skills as a Data Analyst at Jazz (Pakistan's largest telecom). My team developed customer churn prediction models that identified at-risk subscribers with 91% precision, directly contributing to a retention campaign that saved an estimated PKR 50 million in annual revenue. More significantly, I learned to communicate complex analytical findings to non-technical stakeholders—a skill I consider as important as the analysis itself.

Oxford's Data Science programme is distinguished by its integration of rigorous statistics with cutting-edge machine learning methodologies. The emphasis on Bayesian approaches aligns with my research interests; I believe probabilistic methods are essential for healthcare applications where quantifying uncertainty is as important as point predictions.

I am particularly drawn to Professor Sarah Morrison's work in the Department of Statistics. Her research on survival analysis with high-dimensional covariates directly addresses methodological challenges I encountered in my thesis. Specifically, her 2022 paper on regularized Cox models for electronic health records introduced penalization strategies that could significantly improve my readmission prediction models. I am keen to explore whether her approaches could be adapted for the unique characteristics of Pakistani healthcare data, which presents distinct challenges around data sparsity and informal healthcare utilization patterns.

The Oxford Internet Institute's recent initiative on "Health Data Science for Low and Middle-Income Countries" represents precisely the type of applied research I wish to pursue. My background in Pakistani healthcare systems—including firsthand understanding of data collection constraints in resource-limited settings—would contribute meaningfully to this emerging research cluster.

Beyond formal coursework, I intend to engage fully with Oxford's intellectual community. I am interested in the discussions hosted by the Oxford AI Society and the Economics Department's seminars on development economics. The opportunity to engage with scholars across disciplines—epidemiologists, health economists, computer scientists—reflects how I believe impactful research is conducted.

Upon completing the MSc, I plan to pursue doctoral research in health data science, ideally at Oxford or a comparable institution. My long-term goal is to establish a health analytics research center at LUMS that collaborates with government health departments to improve evidence-based policymaking in Pakistan. The country's healthcare system serves over 220 million people with limited resources; data-driven optimization is not merely academically interesting but a moral imperative.

I have chosen Oxford not only for its academic excellence but for its tradition of scholarship that makes real-world impact. My research aims to contribute to both the methodological literature and the practical improvement of healthcare systems in developing nations. I am prepared to bring the same rigor, dedication, and intellectual curiosity that characterized my undergraduate work to Oxford's demanding programme.`,
  },
  {
    id: "canada-visa",
    title: "The Canada Visa-Safe",
    university: "University of Toronto",
    country: "🇨🇦 Canada",
    program: "MBA",
    archetype: "Clear Return Intent + Career Goals",
    icon: Plane,
    color: "from-amber-500 to-orange-600",
    preview: "Focus on supply chain management with explicit intent to return and modernize family logistics business...",
    tags: ["Visa-Compliant", "Return Intent", "Business Focus"],
    fullContent: `Statement of Purpose

I am applying to the University of Toronto's Rotman School of Management MBA program to acquire the strategic and operational expertise necessary to transform my family's logistics business, Malik Transport Services (MTS), into Pakistan's leading technology-enabled supply chain company.

MTS was founded by my grandfather in 1978 with a single truck delivering goods between Lahore and Karachi. Today, we operate a fleet of 85 vehicles and employ 340 people across seven cities. Annual revenue exceeds PKR 800 million. Yet despite this growth, we remain fundamentally the same company my grandfather built—dependent on phone calls, paper manifests, and personal relationships rather than data-driven systems.

I have worked at MTS for four years, most recently as Operations Manager overseeing our Lahore hub. In this role, I implemented our first GPS tracking system, reducing delivery time variances by 18%. I negotiated our first corporate contract with Nestlé Pakistan, adding PKR 50 million in annual revenue. These successes, however, have also revealed my limitations. I lack formal training in supply chain optimization, financial modeling, and strategic management. When I attempted to create a demand forecasting model, I realized I was essentially guessing. When we considered expanding into cold chain logistics, I could not properly evaluate the investment. My MBA is not a credential—it is a necessity.

Canada's supply chain sector represents the global gold standard I wish to study. The Toronto-Waterloo corridor alone handles over $18 billion in annual freight. Canadian companies like Shopify have revolutionized e-commerce fulfillment through technology. The Rotman School's emphasis on integrative thinking—the ability to hold two opposing ideas in tension and create new solutions—aligns precisely with the challenges I face: balancing traditional relationship-based business practices with data-driven modernization.

Rotman's curriculum offers exactly what I need. The Supply Chain Management specialization, including courses like "Operations Strategy" and "Analytics for Managers," will provide frameworks I can directly apply to MTS. Professor Opher Baron's research on inventory management and service operations addresses challenges I encounter daily—how to optimize fleet deployment across routes with variable demand. Professor Gonzalo Romero's work on logistics network design could inform our planned expansion into Gwadar, where the China-Pakistan Economic Corridor is creating unprecedented opportunities.

Beyond academics, I am drawn to Rotman's emphasis on practical application. The capstone consulting project would allow me to work with a Canadian logistics company, understanding their systems firsthand. The Creative Destruction Lab's supply chain focus presents potential connections to technology partners who could help build MTS's digital infrastructure.

My career goal following the MBA is unambiguous: I will return to Pakistan and assume the role of Chief Executive Officer at Malik Transport Services. This is not merely my intention—it is my responsibility and my opportunity.

Pakistan's logistics sector is valued at $30 billion but remains highly fragmented and inefficient. Transport costs represent 10-14% of GDP compared to 6-8% in developed economies—a gap that represents both a national economic drag and an opportunity for companies that can deliver efficiency improvements. With proper technology implementation and professional management practices, I am confident MTS can grow revenues to PKR 3 billion within five years while reducing cost-per-kilometer by 25%.

More importantly, I see MTS as a platform for broader impact. Pakistani supply chains are held back by a shortage of professional managers. I plan to establish a training academy within MTS that develops logistics professionals—truck drivers who understand GPS systems, warehouse managers fluent in inventory optimization, sales staff who can design customized solutions. By raising the capability of our entire workforce, we elevate the industry.

The ties binding me to Pakistan are permanent and substantial. My family—parents, siblings, wife, and two children—all reside in Lahore. Our business employs members of our extended family going back three generations. The company that bears my grandfather's name is not something I can lead from abroad. My return is not just planned; it is inevitable.

I have researched alternative programs extensively. While American programs offer prestige and British programs offer shorter duration, Rotman's specific strengths in operations management and its location within Canada's logistics innovation ecosystem make it the optimal choice for my goals. The 20-month program structure allows sufficient time for deep learning while enabling timely return to take on MTS leadership.

The opportunity before me is significant but time-sensitive. Pakistan's logistics sector is at an inflection point. Companies that modernize now will dominate for decades. With Rotman's training, I will ensure that Malik Transport Services leads this transformation—creating jobs, reducing costs, and connecting Pakistani businesses to global markets. I am committed to bringing Rotman's lessons home.`,
  },
];

const Samples = () => {
  const [selectedSample, setSelectedSample] = useState<SOPSample | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("SOP copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-secondary">
      <Navbar />
      
      {/* Hero Section */}
      <section className="gradient-hero pt-32 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-pill border border-emerald/40 bg-emerald/10 mb-6">
              <FileText className="w-4 h-4 text-emerald" />
              <span className="text-emerald font-medium text-sm">Real Success Stories</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
              Sample SOPs That <span className="text-emerald">Got Approved</span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              Browse our collection of successful Statements of Purpose. Each example showcases our AI's ability to craft compelling, country-specific narratives that meet visa requirements.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Samples Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {PERFECT_SOP_EXAMPLES.map((sample, index) => (
              <motion.div
                key={sample.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div
                  className="bg-card rounded-xl overflow-hidden shadow-card hover:shadow-xl transition-all duration-300 cursor-pointer group border border-border/50 hover:border-emerald/30"
                  onClick={() => setSelectedSample(sample)}
                >
                  {/* Header with gradient */}
                  <div className={`bg-gradient-to-r ${sample.color} p-6`}>
                    <div className="flex items-center justify-between mb-4">
                      <sample.icon className="w-10 h-10 text-white" />
                      <span className="text-white/80 text-sm font-medium">{sample.country}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">{sample.title}</h3>
                    <p className="text-white/80 text-sm">{sample.university}</p>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <GraduationCap className="w-4 h-4" />
                      <span>{sample.program}</span>
                    </div>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {sample.preview}
                    </p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {sample.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <Button 
                      variant="outline" 
                      className="w-full group-hover:bg-emerald group-hover:text-white group-hover:border-emerald transition-all"
                    >
                      Read Full SOP
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Create Your Own Success Story?
          </h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">
            Our AI has helped thousands of students craft compelling SOPs. Start yours today—absolutely free.
          </p>
          <Button
            size="lg"
            className="rounded-pill px-8 py-6 text-lg bg-emerald hover:bg-emerald-light text-accent-foreground font-semibold"
            onClick={() => window.location.href = '/signup'}
          >
            Create My SOP - Free
          </Button>
        </div>
      </section>

      <Footer />

      {/* Modal */}
      <AnimatePresence>
        {selectedSample && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedSample(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className={`bg-gradient-to-r ${selectedSample.color} p-6 flex items-center justify-between`}>
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedSample.title}</h2>
                  <p className="text-white/80">{selectedSample.university} • {selectedSample.program}</p>
                </div>
                <button
                  onClick={() => setSelectedSample(null)}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                <div className="prose prose-slate max-w-none">
                  {selectedSample.fullContent.split('\n\n').map((paragraph, i) => (
                    <p key={i} className="text-foreground leading-relaxed mb-4">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-border flex flex-col sm:flex-row gap-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleCopy(selectedSample.fullContent)}
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Sample
                    </>
                  )}
                </Button>
                <Button
                  className="flex-1 bg-emerald hover:bg-emerald-light text-accent-foreground"
                  onClick={() => window.location.href = '/signup'}
                >
                  Create My SOP
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default Samples;
