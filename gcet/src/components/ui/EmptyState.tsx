import { FileText, Users, Calendar, Clock } from 'lucide-react';

interface EmptyStateProps {
  icon?: 'users' | 'documents' | 'calendar' | 'clock' | 'none';
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ 
  icon = 'none', 
  title, 
  description, 
  action 
}: EmptyStateProps) {
  const getIcon = () => {
    switch (icon) {
      case 'users':
        return <Users className="h-12 w-12 text-gray-400" />;
      case 'documents':
        return <FileText className="h-12 w-12 text-gray-400" />;
      case 'calendar':
        return <Calendar className="h-12 w-12 text-gray-400" />;
      case 'clock':
        return <Clock className="h-12 w-12 text-gray-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="text-center py-12">
      {getIcon()}
      <h3 className="mt-4 text-lg font-medium text-gray-900">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-gray-500">{description}</p>
      )}
      {action && (
        <div className="mt-6">
          <button
            onClick={action.onClick}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {action.label}
          </button>
        </div>
      )}
    </div>
  );
}
