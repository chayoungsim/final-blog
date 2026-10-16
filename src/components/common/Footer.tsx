import { Link } from "react-router";

const footerLinks = [
  { to: "/terms", label: "Terms of Use" },
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/cookie", label: "Cookie Policy" },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-section py-8 text-white">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-4 px-4 md:flex-row md:justify-between md:px-8">
        <div className="flex items-center">
          <span
            aria-hidden="true"
            className="h-8 w-8 bg-accent rounded-full flex items-center justify-center mr-2"
          >
            <span className="text-white font-bold">S</span>
          </span>
          <span className="font-display text-xl font-bold">SULOG</span>
        </div>
        <p className="text-sm text-muted">© 2025 Template. All Rights Reserved.</p>
        <nav aria-label="약관 및 정책">
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {footerLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="inline-flex min-h-11 items-center text-sm text-muted transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
