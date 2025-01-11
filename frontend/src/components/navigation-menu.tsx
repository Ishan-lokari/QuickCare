import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Stethoscope, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';

export function NavigationMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const links = [
    { href: '/', label: 'Home' },
    { href: '/opd-queue', label: 'OPD Queue' },
    { href: '/bed-booking', label: 'Bed Booking' },
    { href: '/admin/login', label: 'Admin Login' },
  ];

  return (
    <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-sm z-50 border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Stethoscope className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">Quickcare</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === link.href
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <ModeToggle />
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center">
            <ModeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="ml-2"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="absolute h-6 w-6 text-background dark:text-foreground" /> : <Menu className="absolute h-6 w-6 text-background dark:text-foreground" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 bg-background border-b">
            {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === link.href
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </nav>
  );
}