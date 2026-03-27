'use client';

import { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Store, Trash2, Plus } from 'lucide-react';
import PasswordPromptModal from './PasswordPromptModal';

export default function VendorsTab() {
  const { vendors, addVendor, deleteVendor, currentUser, disbursements, settings } = useAppContext();
  
  const [vName, setVName] = useState('');
  const [vTaxId, setVTaxId] = useState('');
  const [vAddress, setVAddress] = useState('');
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [deletingVendorId, setDeletingVendorId] = useState<string | null>(null);

  const showMsg = (text: string, type: 'success' | 'error') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 3000);
  };

  const handleAddVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vName.trim() || !vTaxId.trim()) {
      showMsg('กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
      return;
    }
    
    try {
      await addVendor({ 
        name: vName.trim(), 
        taxId: vTaxId.trim(),
        address: vAddress.trim()
      });
      setVName('');
      setVTaxId('');
      setVAddress('');
      showMsg('เพิ่มร้านค้าเรียบร้อยแล้ว', 'success');
    } catch (error) {
      showMsg('เกิดข้อผิดพลาดในการเพิ่มร้านค้า', 'error');
    }
  };

  const handleDeleteVendor = async (id: string) => {
    if (currentUser?.role === 'requester') {
      alert('คุณไม่มีสิทธิ์ลบข้อมูลร้านค้า');
      return;
    }
    
    const vendor = vendors.find(v => v.id === id);
    if (!vendor) return;

    const isInUse = disbursements.some(d => 
      d.vendorName === vendor.name || 
      d.vendorId === id || 
      d.vendors?.some(gv => gv.vendorName === vendor.name || gv.vendorId === id)
    );

    if (isInUse) {
      setDeletingVendorId(id);
      return;
    }

    if (confirm('ต้องการลบร้านค้านี้?')) {
      try {
        await deleteVendor(id);
        showMsg('ลบร้านค้าเรียบร้อยแล้ว', 'success');
      } catch (error) {
        showMsg('เกิดข้อผิดพลาดในการลบร้านค้า', 'error');
      }
    }
  };

  const confirmDeleteVendor = async (password: string) => {
    if (password !== settings.adminPassword) {
      showMsg('รหัสผ่านแอดมินไม่ถูกต้อง', 'error');
      return;
    }
    if (deletingVendorId) {
      try {
        await deleteVendor(deletingVendorId);
        showMsg('ลบร้านค้าเรียบร้อยแล้ว', 'success');
      } catch (error) {
        showMsg('เกิดข้อผิดพลาดในการลบร้านค้า', 'error');
      }
      setDeletingVendorId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 fade-up">
      {msg.text && (
        <div className={`p-3 rounded-lg text-sm text-center ${msg.type === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
          {msg.text}
        </div>
      )}

      <div className="bg-[#1a1a35] rounded-xl p-5 border border-[#2a2a4a]">
        <h3 className="text-base font-bold text-amber-300 mb-4 flex items-center">
          <Store className="w-5 h-5 mr-2" /> จัดการข้อมูลร้านค้า
        </h3>
        
        <form onSubmit={handleAddVendor} className="space-y-3 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <input 
              type="text" required
              value={vName} onChange={e => setVName(e.target.value)}
              className="flex-1 bg-[#12122a] border border-[#3a3a5c] rounded-lg px-3 py-2 text-sm text-gray-100 focus:border-amber-400 focus:outline-none" 
              placeholder="ชื่อร้านค้า/บริษัท" 
            />
            <input 
              type="text" required
              value={vTaxId} onChange={e => setVTaxId(e.target.value)}
              className="flex-1 bg-[#12122a] border border-[#3a3a5c] rounded-lg px-3 py-2 text-sm text-gray-100 focus:border-amber-400 focus:outline-none" 
              placeholder="เลขประจำตัวผู้เสียภาษี (13 หลัก)" 
              maxLength={13}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input 
              type="text"
              value={vAddress} onChange={e => setVAddress(e.target.value)}
              className="flex-1 bg-[#12122a] border border-[#3a3a5c] rounded-lg px-3 py-2 text-sm text-gray-100 focus:border-amber-400 focus:outline-none" 
              placeholder="ที่อยู่ร้านค้า" 
            />
            <button 
              type="submit"
              className="flex items-center justify-center gap-1 bg-amber-500/20 text-amber-300 px-4 py-2 rounded-lg hover:bg-amber-500/30 transition text-sm whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> เพิ่มร้านค้า
            </button>
          </div>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-[#12122a] text-xs uppercase text-gray-400 border-b border-[#2a2a4a]">
              <tr>
                <th className="px-4 py-3 font-medium">ชื่อร้านค้า/บริษัท</th>
                <th className="px-4 py-3 font-medium">เลขประจำตัวผู้เสียภาษี</th>
                <th className="px-4 py-3 font-medium">ที่อยู่</th>
                <th className="px-4 py-3 font-medium text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a4a]">
              {vendors.map(v => (
                <tr key={v.id} className="hover:bg-[#1f1f3d] transition">
                  <td className="px-4 py-3 text-gray-200">{v.name}</td>
                  <td className="px-4 py-3 font-mono text-gray-400">{v.taxId}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs truncate max-w-[200px]">{v.address || '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <button 
                      onClick={() => handleDeleteVendor(v.id!)}
                      className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition" title="ลบ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {vendors.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    ยังไม่มีข้อมูลร้านค้า
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {deletingVendorId && (
        <PasswordPromptModal
          onConfirm={confirmDeleteVendor}
          onCancel={() => setDeletingVendorId(null)}
          title="ยืนยันการลบร้านค้า"
          message="ร้านค้านี้ถูกใช้งานในรายการเบิกจ่ายแล้ว การลบอาจทำให้ข้อมูลบางส่วนไม่สมบูรณ์ กรุณายืนยันด้วยรหัสผ่านแอดมิน"
        />
      )}
    </div>
  );
}
