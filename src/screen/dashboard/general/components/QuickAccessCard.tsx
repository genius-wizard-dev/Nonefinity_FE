import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface QuickAccessCardProps {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}

export function QuickAccessCard({
  to,
  icon,
  title,
  description,
  gradient,
}: QuickAccessCardProps) {
  return (
    <Link to={to} className="group block h-full">
      <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 overflow-hidden relative">
        <div
          className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 ${gradient}`}
        />
        <CardContent className="p-6 relative">
          <div className="flex flex-col items-start space-y-4">
            <div
              className={`p-3 rounded-xl ${gradient} bg-opacity-10 group-hover:scale-110 transition-transform duration-300`}
            >
              <div className="w-6 h-6 text-primary">{icon}</div>
            </div>
            <div className="space-y-2 flex-1">
              <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                {title}
                <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
