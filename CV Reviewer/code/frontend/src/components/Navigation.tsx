import { Download, Heart, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface NavigationProps {
  onFollowUsClick?: () => void;
}

const Navigation = ({ onFollowUsClick }: NavigationProps) => {
  const navigate = useNavigate();

  const handleDownloadExamples = () => {
    navigate('/templates');
  };

  return (
    <nav className="w-full bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center space-x-3 mr-2 -ml-1">
            <div className="p-2 rounded-xl bg-gradient-to-br from-elevate-blue-500 to-elevate-blue-600 shadow-md">
              <ArrowUp className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-bold text-gray-800">HireMe</span>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center space-x-1 md:space-x-2 flex-1 justify-end">
            {/* Download Examples Button - Blue Filled */}
            <Button
              size="sm"
              onClick={handleDownloadExamples}
              className="flex items-center space-x-1 md:space-x-2 text-xs md:text-sm px-5 md:px-6 py-3 md:py-3 bg-blue-600 hover:bg-blue-700 text-white shadow-md flex-1 sm:flex-none max-w-[140px] sm:max-w-none"
            >
              <Download className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden lg:inline">Resume Examples</span>
              <span className="lg:hidden">Examples</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 