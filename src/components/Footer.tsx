import { Link } from "react-router-dom";
import Logo from "./Logo";

const Footer = () => {
  return (
    <footer className="gradient-hero text-primary-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div>
            <Link to="/" className="inline-block mb-4">
              <Logo size="md" variant="light" />
            </Link>
            <p className="text-slate-300 mb-4 leading-relaxed">
              Helping Pakistani students achieve their study abroad dreams with AI-powered SOPs.
            </p>
            <p className="text-slate-300 flex items-center gap-2">
              <span>📍</span> Lahore, Pakistan
            </p>
          </div>

          {/* Links Column */}
          <div>
            <h4 className="font-semibold text-lg mb-4 text-white">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-slate-300 hover:text-white transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-slate-300 hover:text-white transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#login" className="text-slate-300 hover:text-white transition-colors">
                  Login
                </a>
              </li>
              <li>
                <Link to="/contact" className="text-slate-300 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className="font-semibold text-lg mb-4 text-white">Legal</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-slate-300 hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-white transition-colors">
                  Refund Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Payments Column */}
          <div>
            <h4 className="font-semibold text-lg mb-4 text-white">Secure Payments</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1.5 bg-navy-light rounded text-sm text-slate-300 border border-slate-400/20">
                JazzCash
              </span>
              <span className="px-3 py-1.5 bg-navy-light rounded text-sm text-slate-300 border border-slate-400/20">
                Easypaisa
              </span>
              <span className="px-3 py-1.5 bg-navy-light rounded text-sm text-slate-300 border border-slate-400/20">
                Bank Transfer
              </span>
            </div>
            <p className="text-slate-300 text-sm">
              Email:{" "}
              <a href="mailto:support@sopwriter.pk" className="hover:text-white transition-colors">
                support@sopwriter.pk
              </a>
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-400/20 pt-8 text-center">
          <p className="text-slate-300 text-sm">
            © 2025 SOPWriter Pakistan. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
