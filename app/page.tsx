'use client';

import { useState } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { LayoutDashboard, FileText, List, Users, Settings } from 'lucide-react';
const DashboardTab = dynamic(() => import('@/components/DashboardTab'), { ssr: false });
import DisbursementTab from '@/components/DisbursementTab';
import RecordsTab from '@/components/RecordsTab';
import VendorsTab from '@/components/VendorsTab';
import SettingsTab from '@/components/SettingsTab';
import UserSwitcher from '@/components/UserSwitcher';
import { useAppContext } from '@/context/AppContext';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { disbursements, settings, currentUser } = useAppContext();

  const tabs = [
    { id: 'dashboard', name: 'ภาพรวม', icon: LayoutDashboard },
    { id: 'disbursement', name: 'รายงานผลการตรวจรับและขออนุมัติจ่ายเงิน', icon: FileText },
    { id: 'records', name: 'รายการทั้งหมด', icon: List },
    { id: 'vendors', name: 'ร้านค้า', icon: Users },
    { id: 'settings', name: 'ตั้งค่าระบบ', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-[#1a1a35] border-b border-[#2a2a4a] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20 overflow-hidden relative">
                {settings.logoUrl ? (
                  <Image src={settings.logoUrl} alt="School Logo" fill className="object-cover" unoptimized />
                ) : (
                  <FileText className="text-white w-5 h-5" />
                )}
              </div>
              <div>
                <h1 className="text-base font-bold text-amber-300 leading-tight">{settings.systemName}</h1>
                <p className="text-xs text-gray-400">{settings.schoolName}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500 hidden sm:inline">
                {disbursements.length} รายการ
              </span>
              {currentUser && <UserSwitcher />}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 overflow-x-auto no-scrollbar pb-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                    ${isActive 
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm' 
                      : 'text-gray-400 hover:text-gray-200 hover:bg-[#2a2a4a] border border-transparent'}
                  `}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-gray-500'}`} />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'disbursement' && <DisbursementTab />}
        {activeTab === 'records' && <RecordsTab />}
        {activeTab === 'vendors' && <VendorsTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </main>
    </div>
  );
}
