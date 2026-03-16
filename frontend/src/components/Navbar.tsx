import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-nav">
      <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <Eye className="w-6 h-6 text-white group-hover:text-primary transition-colors" />
          <span className="font-display font-semibold text-xl tracking-wide text-foreground">
            Insight AI
          </span>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
