/**
 * Sidebar Component - Modern Left Navigation
 * 
 * Features:
 * - Fixed left sidebar with modern design
 * - Navigation links and branding
 * - Responsive collapse on mobile
 */

import { useState } from "react";
import { Home, FileText, History, Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(false);
    // Force navigation to home and reload the component
    navigate('/', { replace: true });
    window.location.reload();
  };

  const navItems = [
    { icon: Home, label: "Home", path: "/", onClick: handleHomeClick },
    { icon: History, label: "Templates", path: "/templates", onClick: null },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 text-white transition-transform duration-300 z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 w-64 shadow-2xl`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-6 border-b border-blue-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Utopia Hire</h1>
                <p className="text-xs text-blue-300">Resume Analyzer</p>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={item.onClick || (() => setIsOpen(false))}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive(item.path)
                    ? "bg-blue-700 shadow-lg"
                    : "hover:bg-blue-800/50"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Bottom Section */}
          <div className="p-4 border-t border-blue-700">
            <div className="text-center text-xs text-blue-300">
              <p>© 2025 Utopia Hire</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
        />
      )}
    </>
  );
};

export default Sidebar;
