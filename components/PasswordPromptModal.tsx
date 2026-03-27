import React, { useState } from 'react';
import { Lock, X } from 'lucide-react';

interface PasswordPromptModalProps {
  onConfirm: (password: string) => void;
  onCancel: () => void;
  title?: string;
  message?: string;
}

export default function PasswordPromptModal({ 
  onConfirm, 
  onCancel, 
  title = 'ยืนยันด้วยรหัสผ่านแอดมิน', 
  message = 'ข้อมูลนี้ถูกใช้งานอยู่ หากต้องการลบ กรุณายืนยันด้วยรหัสผ่านแอดมิน' 
}: PasswordPromptModalProps) {
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(password);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#1a1a35] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-[#2a2a4a]">
        <div className="bg-[#12122a] p-4 border-b border-[#2a2a4a] flex justify-between items-center">
          <h3 className="text-lg font-bold text-amber-300 flex items-center gap-2">
            <Lock className="w-5 h-5" /> {title}
          </h3>
          <button onClick={onCancel} className="p-2 text-gray-400 hover:bg-[#2a2a4a] rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <p className="text-sm text-gray-300 mb-4">{message}</p>
          <input
            type="password"
            autoFocus
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-[#12122a] border border-[#3a3a5c] rounded-lg px-4 py-3 text-gray-100 focus:border-amber-400 focus:outline-none mb-6"
            placeholder="รหัสผ่านแอดมิน"
          />
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:bg-[#2a2a4a] transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 transition"
            >
              ยืนยันการลบ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
