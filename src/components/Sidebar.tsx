import React from 'react';
import { 
  Home, 
  FileText, 
  Settings, 
  BookOpen, 
  Edit3, 
  Sparkles, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  User,
  Bot
} from 'lucide-react';
import { User as UserType } from '../types';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  user: UserType;
  onLogout: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  hasResumeData: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onPageChange,
  user,
  onLogout,
  collapsed,
  onToggleCollapse,
  hasResumeData
}) => {
  const menuItems = [
    { id: 'home', label: 'Home', icon: Home, available: true },
    { id: 'prompts', label: 'Prompts', icon: FileText, available: true },
    { id: 'ai-models', label: 'AI Models', icon: Bot, available: true },
    { id: 'instructions', label: 'Instructions', icon: BookOpen, available: true },
    { id: 'edit-resume', label: 'Edit Resume', icon: Edit3, available: hasResumeData },
    { id: 'generate', label: 'Generate Cover Letter', icon: Sparkles, available: hasResumeData }
  ];

  return (
    <div className={`fixed left-0 top-0 h-full bg-white/90 backdrop-blur-sm shadow-xl z-50 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200/50">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <FileText className="text-blue-500" size={24} />
              <span className="text-xl font-bold text-gray-800">Craftly</span>
            </div>
          )}
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-lg hover:bg-gray-100/70 transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </div>

      {/* User Info */}
      {!collapsed && (
        <div className="p-4 border-b border-gray-200/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
              <User className="text-white" size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
              <p className="text-xs text-gray-600 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const isActive = currentPage === item.id;
            const isDisabled = !item.available;
            
            return (
              <button
                key={item.id}
                onClick={() => item.available && onPageChange(item.id)}
                disabled={isDisabled}
                className={`
                  w-full flex items-center space-x-3 px-3 py-2 rounded-xl transition-all duration-200
                  ${isActive 
                    ? 'bg-gradient-to-r from-blue-400 to-purple-400 text-white shadow-lg' 
                    : isDisabled
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100/70 hover:text-gray-900'
                  }
                  ${collapsed ? 'justify-center' : ''}
                `}
                title={collapsed ? item.label : undefined}
              >
                <item.icon size={20} />
                {!collapsed && <span className="font-medium">{item.label}</span>}
                {!collapsed && isDisabled && (
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full ml-auto">
                    {item.id === 'edit-resume' || item.id === 'generate' ? 'Upload Resume' : 'Soon'}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200/50">
        <button
          onClick={onLogout}
          className={`
            w-full flex items-center space-x-3 px-3 py-2 rounded-xl transition-all duration-200
            text-red-600 hover:bg-red-50 hover:text-red-700
            ${collapsed ? 'justify-center' : ''}
          `}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut size={20} />
          {!collapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;