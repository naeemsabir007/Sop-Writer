const universities = [
  { code: "it", name: "University of Bologna" },
  { code: "gb", name: "Oxford" },
  { code: "de", name: "TU Munich" },
  { code: "us", name: "Harvard" },
  { code: "au", name: "Melbourne" },
  { code: "it", name: "Politecnico di Milano" },
  { code: "ca", name: "University of Toronto" },
  { code: "nl", name: "TU Delft" },
  { code: "fr", name: "Sorbonne" },
  { code: "se", name: "KTH Stockholm" },
];

const UniversityTicker = () => {
  return (
    <section className="bg-card py-8 overflow-hidden border-y border-border">
      <div className="relative">
        {/* Gradient masks */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-card to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-card to-transparent z-10" />

        {/* Scrolling content */}
        <div className="flex animate-scroll">
          {/* First set */}
          {[...universities, ...universities].map((uni, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-8 whitespace-nowrap"
            >
              <img
                src={`https://flagcdn.com/w40/${uni.code}.png`}
                alt={`${uni.name} flag`}
                className="w-5 h-5 rounded-full object-cover flex-shrink-0"
              />
              <span className="text-muted-foreground font-medium">{uni.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UniversityTicker;
