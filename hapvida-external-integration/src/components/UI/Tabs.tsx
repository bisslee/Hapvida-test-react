import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface Tab {
  id: string;
  label: string;
  icon?: string;
  badge?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: ReactNode;
}

/**
 * Componente de abas - Mobile First
 */
export function Tabs({ tabs, activeTab, onTabChange, children }: TabsProps) {
  return (
    <div className="w-full">
      {/* Barra de abas */}
      <div className="flex border-b border-gray-200 bg-white rounded-t-lg overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-medium transition-colors whitespace-nowrap',
                'border-b-2 min-w-fit',
                isActive
                  ? 'border-secondary-blue text-secondary-blue bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-primary-dark hover:bg-gray-50'
              )}
              aria-selected={isActive}
              role="tab"
            >
              {tab.icon && <i className={cn('text-lg', tab.icon)} />}
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  className={cn(
                    'ml-1 px-2 py-0.5 text-xs font-semibold rounded-full',
                    isActive
                      ? 'bg-secondary-blue text-white'
                      : 'bg-gray-200 text-gray-700'
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Conteúdo das abas */}
      <div className="bg-white rounded-b-lg" role="tabpanel">
        <div className="p-4 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

