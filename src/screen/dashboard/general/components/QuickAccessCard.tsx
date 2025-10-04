import { Link } from "react-router-dom";

interface QuickAccessCardProps {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  bgColor: string;
  iconColor: string;
}

export function QuickAccessCard({
  to,
  icon,
  title,
  description,
  bgColor,
  iconColor,
}: QuickAccessCardProps) {
  return (
    <Link
      to={to}
      className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow"
    >
      <div className="text-center">
        <div
          className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center mx-auto mb-3`}
        >
          <div className={iconColor}>{icon}</div>
        </div>
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
    </Link>
  );
}
