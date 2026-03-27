'use client';

import { useState, useRef, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { ChevronDown, Check } from 'lucide-react';

export default function UserSwitcher() {
  const { currentUser, setCurrentUser, users } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!currentUser) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-[#12122a] border border-[#3a3a5c] hover:border-amber-500/50 px-3 py-1.5 rounded-full transition-all"
      >
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${currentUser.color}`}>
          {currentUser.initials}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-xs font-medium text-gray-200 leading-tight">{currentUser.name}</p>
          <p className="text-[10px] text-gray-500 leading-tight">
            {currentUser.role === 'admin' ? 'ผู้อำนวยการ' : currentUser.role === 'finance' ? 'การเงิน' : 'ผู้เบิก'}
          </p>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-[#1a1a35] border border-[#2a2a4a] rounded-xl shadow-2xl py-2 z-50 fade-up">
          <div className="px-3 py-2 border-b border-[#2a2a4a] mb-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">สลับผู้ใช้งาน (จำลอง)</p>
          </div>
          
          <div className="max-h-64 overflow-y-auto custom-scrollbar">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => {
                  setCurrentUser(user);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 hover:bg-[#2a2a4a] transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${user.color}`}>
                    {user.initials}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${currentUser.id === user.id ? 'text-amber-400' : 'text-gray-200'}`}>
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user.role === 'admin' ? 'ผู้อำนวยการ' : user.role === 'finance' ? 'การเงิน' : 'ผู้เบิก'}
                    </p>
                  </div>
                </div>
                {currentUser.id === user.id && (
                  <Check className="w-4 h-4 text-amber-400" />
                )}
              </button>
            ))}
          </div>
          
          {users.length === 0 && (
            <div className="px-4 py-3 text-center text-xs text-gray-500">
              ไม่มีผู้ใช้งานในระบบ
            </div>
          )}
        </div>
      )}
    </div>
  );
}
