const countries = [
  { code: "it", name: "Italy" },
  { code: "gb", name: "UK" },
  { code: "de", name: "Germany" },
  { code: "us", name: "USA" },
  { code: "au", name: "Australia" },
  { code: "ca", name: "Canada" },
  { code: "fr", name: "France" },
  { code: "nl", name: "Netherlands" },
  { code: "se", name: "Sweden" },
  { code: "nz", name: "New Zealand" },
  { code: "ie", name: "Ireland" },
  { code: "at", name: "Austria" },
];

const SupportedCountries = () => {
  return (
    <section className="py-20 bg-secondary dark:bg-slate-900/50">
      <div className="container mx-auto px-4">
        {/* Heading */}
        <div className="text-center mb-12">
          <p className="text-muted-foreground uppercase tracking-widest text-sm font-medium mb-3">
            Works For Every Embassy
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Accepted Worldwide
          </h2>
        </div>

        {/* Country Pills */}
        <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
          {countries.map((country, index) => (
            <div
              key={country.name}
              className="flex items-center gap-2 px-5 py-3 bg-card dark:bg-slate-800 rounded-pill border border-border shadow-sm hover:shadow-card hover:border-emerald/30 transition-all duration-300 cursor-default"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <img
                src={`https://flagcdn.com/w40/${country.code}.png`}
                alt={`${country.name} flag`}
                className="w-5 h-5 rounded-full object-cover flex-shrink-0"
              />
              <span className="text-foreground font-medium">{country.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SupportedCountries;
