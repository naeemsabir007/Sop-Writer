import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "./Logo";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "glass shadow-card py-3" : "bg-transparent py-5"}`}>
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="hover:opacity-80 transition-opacity">
          <Logo size="md" variant={isScrolled ? "auto" : "light"} />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#pricing" className={`font-medium transition-colors ${isScrolled ? 'text-slate-600 dark:text-slate-300 hover:text-foreground' : 'text-slate-300 hover:text-white'}`}>
            Pricing
          </a>
          <Link to="/samples" className={`font-medium transition-colors ${isScrolled ? 'text-slate-600 dark:text-slate-300 hover:text-foreground' : 'text-slate-300 hover:text-white'}`}>
            Samples
          </Link>
          <Link to="/contact" className={`font-medium transition-colors ${isScrolled ? 'text-slate-600 dark:text-slate-300 hover:text-foreground' : 'text-slate-300 hover:text-white'}`}>
            Contact
          </Link>
          <Link to="/login" className={`font-medium transition-colors ${isScrolled ? 'text-slate-600 dark:text-slate-300 hover:text-foreground' : 'text-slate-300 hover:text-white'}`}>
            Login
          </Link>
          <Link to="/signup">
            <Button className="rounded-pill px-6 bg-navy hover:bg-navy-light text-white">
              Get Started
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6 text-foreground" /> : <Menu className="h-6 w-6 text-foreground" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-card dark:bg-slate-800 mt-2 mx-4 rounded-lg p-4 animate-fade-in border border-border shadow-lg">
          <div className="flex flex-col gap-4">
            <a href="#pricing" className="text-foreground hover:text-accent transition-colors font-medium py-2">
              Pricing
            </a>
            <Link to="/samples" className="text-foreground hover:text-accent transition-colors font-medium py-2">
              Samples
            </Link>
            <Link to="/contact" className="text-foreground hover:text-accent transition-colors font-medium py-2">
              Contact
            </Link>
            <Link to="/login" className="text-foreground hover:text-accent transition-colors font-medium py-2">
              Login
            </Link>
            <Link to="/signup">
              <Button className="rounded-pill bg-navy hover:bg-navy-light text-white w-full">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;