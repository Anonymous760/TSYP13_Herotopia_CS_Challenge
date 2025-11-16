/**
 * TopMatchesGaps Component - Display Top Matches and Gaps
 * 
 * Shows the 3 strongest matches and 3 critical gaps in a visually appealing way
 */

import { CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MatchGap {
  title: string;
  description: string;
}

interface TopMatchesGapsProps {
  matches: MatchGap[];
  gaps: MatchGap[];
}

const TopMatchesGaps = ({ matches, gaps }: TopMatchesGapsProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Top Matches */}
      <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-green-700">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6" />
            </div>
            <span className="text-xl">Top 3 Strengths</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {matches.map((match, index) => (
              <div
                key={index}
                className="flex gap-3 p-4 bg-white/70 backdrop-blur-sm rounded-lg border border-green-100 hover:shadow-md transition-shadow"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-green-900 mb-1">{match.title}</h4>
                  <p className="text-sm text-green-700">{match.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Gaps */}
      <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-red-50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-orange-700">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertCircle className="w-6 h-6" />
            </div>
            <span className="text-xl">Top 3 Areas to Improve</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {gaps.map((gap, index) => (
              <div
                key={index}
                className="flex gap-3 p-4 bg-white/70 backdrop-blur-sm rounded-lg border border-orange-100 hover:shadow-md transition-shadow"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-orange-900 mb-1">{gap.title}</h4>
                  <p className="text-sm text-orange-700">{gap.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TopMatchesGaps;
