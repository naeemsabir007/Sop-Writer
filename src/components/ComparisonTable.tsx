import { Check, X } from "lucide-react";

const comparisons = [
  {
    feature: "Cost",
    agent: "Rs. 50,000+",
    sopwriter: "Rs. 1,000",
    agentBad: true,
    sopwriterGood: true,
  },
  {
    feature: "Time",
    agent: "7 Days",
    sopwriter: "2 Minutes",
    agentBad: false,
    sopwriterGood: true,
  },
  {
    feature: "Quality",
    agent: "Copy-Paste Template",
    sopwriter: "Unique & Humanized",
    agentBad: true,
    sopwriterGood: true,
  },
  {
    feature: "IELTS Calibration",
    agent: "None",
    sopwriter: "Matched to Score",
    agentBad: true,
    sopwriterGood: true,
  },
  {
    feature: "Plagiarism Check",
    agent: "No Guarantee",
    sopwriter: "100% Original",
    agentBad: true,
    sopwriterGood: true,
  },
];

const ComparisonTable = () => {
  return (
    <section className="py-20 bg-card dark:bg-background">
      <div className="container mx-auto px-4">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why Students Choose Us
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            See how SOPWriter compares to traditional visa consultants
          </p>
        </div>

        {/* Table */}
        <div className="max-w-4xl mx-auto overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="text-left py-4 px-4 font-semibold text-foreground">
                  Feature
                </th>
                <th className="text-center py-4 px-4">
                  <div className="flex items-center justify-center gap-2">
                    <X className="w-5 h-5 text-destructive" />
                    <span className="font-semibold text-muted-foreground">Local Agent</span>
                  </div>
                </th>
                <th className="text-center py-4 px-4">
                  <div className="flex items-center justify-center gap-2">
                    <Check className="w-5 h-5 text-emerald" />
                    <span className="font-semibold text-foreground">SOPWriter</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisons.map((row, index) => (
                <tr
                  key={row.feature}
                  className={`border-b border-border transition-colors hover:bg-secondary/50 ${
                    index % 2 === 0 ? "bg-secondary/20" : ""
                  }`}
                >
                  <td className="py-5 px-4 font-medium text-foreground">
                    {row.feature}
                  </td>
                  <td className="py-5 px-4 text-center">
                    <span className={row.agentBad ? "text-destructive" : "text-muted-foreground"}>
                      {row.agent}
                    </span>
                  </td>
                  <td className="py-5 px-4 text-center">
                    <span className={row.sopwriterGood ? "text-emerald font-medium" : "text-foreground"}>
                      {row.sopwriter}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default ComparisonTable;
