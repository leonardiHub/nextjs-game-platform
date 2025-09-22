'use client'

interface TabNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function TabNavigation({
  activeTab,
  onTabChange,
}: TabNavigationProps) {
  const tabs = [
    { id: 'games', label: '🎮 Games', icon: '🎮' },
    { id: 'wallet', label: '💰 Wallet', icon: '💰' },
    { id: 'kyc', label: '📄 KYC', icon: '📄' },
    { id: 'history', label: '📊 History', icon: '📊' },
  ]

  return (
    <div className="bg-white rounded-2xl p-2 mb-8 shadow-lg">
      <div className="flex flex-col md:flex-row space-y-1 md:space-y-0 md:space-x-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            data-tab={tab.id}
            className={`flex-1 text-center py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg transform scale-[1.02]'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
            }`}
          >
            <span className="hidden md:inline">{tab.label}</span>
            <span className="md:hidden text-lg">{tab.icon}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
