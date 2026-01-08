import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Is this accepted by Visa Officers?",
    answer: "Yes, our AI generates statements that follow formal embassy formats and visa officer expectations. The SOPs are professionally structured and align with the requirements of major visa-granting countries including UK, USA, Canada, Australia, Germany, and Italy.",
  },
  {
    question: "Can I edit the text?",
    answer: "Yes, you get a fully editable text editor. After your SOP is generated, you can modify any section, add personal touches, or adjust the content as needed before downloading the final PDF.",
  },
  {
    question: "Do you write for Spouse Visas?",
    answer: "We are currently focusing on Student Visas to ensure the highest quality output. Spouse visa support and other visa categories are on our roadmap for future releases.",
  },
  {
    question: "How long does it take to generate?",
    answer: "Our AI generates your complete Statement of Purpose in under 2 minutes. Simply fill in your academic details, and the system handles the rest.",
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. We use enterprise-grade encryption and never share your personal information with third parties. Your data is stored securely and used only to generate your SOP.",
  },
];

const FAQ = () => {
  return (
    <section className="py-20 bg-secondary dark:bg-slate-900/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about SOPWriter
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card dark:bg-slate-800 rounded-xl px-6 border border-border shadow-sm"
              >
                <AccordionTrigger className="text-left text-foreground font-medium py-5 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;
