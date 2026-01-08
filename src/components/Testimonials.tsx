import { motion } from "framer-motion";
import { Quote } from "lucide-react";
const testimonials = [{
  quote: "I was rejected twice from Italy. SOPWriter fixed my refusal explanation.",
  author: "Ali H.",
  location: "Lahore"
}, {
  quote: "My agent asked for 50k. This tool did it for 1k.",
  author: "Fatima R.",
  location: "Karachi"
}, {
  quote: "The AI knew exactly how to explain my study gap.",
  author: "Usman K.",
  location: "Islamabad"
}];
const Testimonials = () => {
  return <section className="py-20 bg-secondary dark:bg-slate-900/50">
      <div className="container mx-auto px-4">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} transition={{
        duration: 0.6
      }} className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
            Trusted by Students across Pakistan      
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Real success stories from Pakistani students who got their visa
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => <motion.div key={testimonial.author} initial={{
          opacity: 0,
          y: 30
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.5,
          delay: index * 0.15
        }} className="bg-card dark:bg-slate-800 rounded-2xl p-8 relative border border-border">
              {/* Quote Icon */}
              <div className="absolute -top-3 left-6">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                  <Quote className="w-5 h-5 text-white" />
                </div>
              </div>

              <div className="pt-6">
                <p className="text-foreground text-lg mb-6 italic">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                    <span className="text-accent font-bold">
                      {testimonial.author[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {testimonial.author}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.location}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>)}
        </div>
      </div>
    </section>;
};
export default Testimonials;