'use client';

import { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Users, Settings, Briefcase, Store, Lock } from 'lucide-react';
import PasswordPromptModal from './PasswordPromptModal';

export default function SettingsTab() {
  const { 
    settings, updateSettings, 
    requesters, addRequester, deleteRequester, 
    vendors, addVendor, deleteVendor,
    currentUser,
    disbursements
  } = useAppContext();
  
  const [sysName, setSysName] = useState(settings.systemName);
  const [schName, setSchName] = useState(settings.schoolName);
  const [schAddress, setSchAddress] = useState(settings.schoolAddress || '');
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || '');
  const [adminPassword, setAdminPassword] = useState(settings.adminPassword || '');
  
  const [financeName, setFinanceName] = useState(settings.financeName || '');
  const [financeUsername, setFinanceUsername] = useState(settings.financeUsername || '');
  const [financePassword, setFinancePassword] = useState(settings.financePassword || '');
  
  const [directorName, setDirectorName] = useState(settings.directorName || '');
  const [directorUsername, setDirectorUsername] = useState(settings.directorUsername || '');
  const [directorPassword, setDirectorPassword] = useState(settings.directorPassword || '');
  
  const [newBudget, setNewBudget] = useState('');
  const [rName, setRName] = useState('');
  
  const [vName, setVName] = useState('');
  const [vTaxId, setVTaxId] = useState('');
  const [vAddress, setVAddress] = useState('');
  
  const [msg, setMsg] = useState({ text: '', type: '' });
  
  const [deletingRequesterId, setDeletingRequesterId] = useState<string | null>(null);
  const [deletingVendorId, setDeletingVendorId] = useState<string | null>(null);

  useEffect(() => {
    setSysName(settings.systemName);
    setSchName(settings.schoolName);
    setSchAddress(settings.schoolAddress || '');
    setLogoUrl(settings.logoUrl || '');
    setAdminPassword(settings.adminPassword || '');
    setFinanceName(settings.financeName || '');
    setFinanceUsername(settings.financeUsername || '');
    setFinancePassword(settings.financePassword || '');
    setDirectorName(settings.directorName || '');
    setDirectorUsername(settings.directorUsername || '');
    setDirectorPassword(settings.directorPassword || '');
  }, [settings]);

  const showMsg = (text: string, type: 'success' | 'error') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 3000);
  };

  const handleSaveSystemInfo = async () => {
    if (!sysName.trim() || !schName.trim() || !adminPassword.trim()) {
      showMsg('กรุณากรอกข้อมูลให้ครบถ้วน (รวมถึงรหัสผ่านแอดมิน)', 'error');
      return;
    }
    try {
      await updateSettings({ 
        systemName: sysName.trim(), 
        schoolName: schName.trim(),
        schoolAddress: schAddress.trim(),
        logoUrl: logoUrl.trim(),
        adminPassword: adminPassword.trim(),
        financeName: financeName.trim(),
        financeUsername: financeUsername.trim(),
        financePassword: financePassword.trim(),
        directorName: directorName.trim(),
        directorUsername: directorUsername.trim(),
        directorPassword: directorPassword.trim()
      });
      showMsg('บันทึกข้อมูลระบบแล้ว', 'success');
    } catch (e) {
      showMsg('เกิดข้อผิดพลาดในการบันทึก', 'error');
    }
  };

  const handleAddBudget = async () => {
    if (!newBudget.trim()) return;
    if (settings.budgetTypes.includes(newBudget.trim())) {
      showMsg('ประเภทงบนี้มีอยู่แล้ว', 'error');
      return;
    }
    try {
      await updateSettings({ budgetTypes: [...settings.budgetTypes, newBudget.trim()] });
      setNewBudget('');
      showMsg('เพิ่มประเภทงบแล้ว', 'success');
    } catch (e) {
      showMsg('เกิดข้อผิดพลาด', 'error');
    }
  };

  const handleDeleteBudget = async (budget: string) => {
    if (confirm(`ต้องการลบประเภทงบ "${budget}"?`)) {
      try {
        await updateSettings({ budgetTypes: settings.budgetTypes.filter(b => b !== budget) });
      } catch (e) {
        showMsg('เกิดข้อผิดพลาด', 'error');
      }
    }
  };

  const handleAddRequester = async () => {
    if (!rName.trim()) return;
    try {
      await addRequester({ name: rName.trim() });
      setRName('');
      showMsg('เพิ่มผู้เบิกแล้ว', 'success');
    } catch (e) {
      showMsg('เกิดข้อผิดพลาด', 'error');
    }
  };

  const handleDeleteRequester = async (id: string) => {
    if (currentUser?.role === 'requester') {
      alert('คุณไม่มีสิทธิ์ลบข้อมูลผู้เบิก');
      return;
    }
    
    const requester = requesters.find(r => r.id === id);
    if (!requester) return;

    const isInUse = disbursements.some(d => d.requester === requester.name || d.requesterId === id);
    
    if (isInUse) {
      setDeletingRequesterId(id);
      return;
    }

    if (confirm('ต้องการลบผู้เบิกนี้?')) {
      try {
        await deleteRequester(id);
        showMsg('ลบผู้เบิกแล้ว', 'success');
      } catch (e) {
        showMsg('เกิดข้อผิดพลาด', 'error');
      }
    }
  };

  const confirmDeleteRequester = async (password: string) => {
    if (password !== settings.adminPassword) {
      showMsg('รหัสผ่านแอดมินไม่ถูกต้อง', 'error');
      return;
    }
    if (deletingRequesterId) {
      try {
        await deleteRequester(deletingRequesterId);
        showMsg('ลบผู้เบิกแล้ว', 'success');
      } catch (e) {
        showMsg('เกิดข้อผิดพลาด', 'error');
      }
      setDeletingRequesterId(null);
    }
  };

  const handleAddVendor = async () => {
    if (!vName.trim() || !vTaxId.trim()) {
      showMsg('กรุณากรอกชื่อร้านค้าและเลขผู้เสียภาษี', 'error');
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
      showMsg('เพิ่มร้านค้าแล้ว', 'success');
    } catch (e) {
      showMsg('เกิดข้อผิดพลาด', 'error');
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
        showMsg('ลบร้านค้าแล้ว', 'success');
      } catch (e) {
        showMsg('เกิดข้อผิดพลาด', 'error');
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
        showMsg('ลบร้านค้าแล้ว', 'success');
      } catch (e) {
        showMsg('เกิดข้อผิดพลาด', 'error');
      }
      setDeletingVendorId(null);
    }
  };

  return (
    <section className="fade-up space-y-4">
      {msg.text && (
        <div className={`p-3 rounded-lg text-sm text-center ${msg.type === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
          {msg.text}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-4">
        {/* System Info */}
        <div className="bg-[#1a1a35] rounded-xl p-5 border border-[#2a2a4a]">
          <h3 className="text-base font-bold text-amber-300 mb-4 flex items-center">
            <Settings className="w-4 h-4 mr-1" /> ข้อมูลระบบทั่วไป
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">ชื่อระบบ</label>
              <input 
                value={sysName} onChange={e => setSysName(e.target.value)}
                type="text" 
                className="w-full bg-[#12122a] border border-[#3a3a5c] rounded-lg px-3 py-2 text-sm text-gray-100 focus:border-amber-400 focus:outline-none" 
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">ชื่อโรงเรียน/องค์กร</label>
              <input 
                value={schName} onChange={e => setSchName(e.target.value)}
                type="text" 
                className="w-full bg-[#12122a] border border-[#3a3a5c] rounded-lg px-3 py-2 text-sm text-gray-100 focus:border-amber-400 focus:outline-none" 
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">ที่อยู่โรงเรียน/องค์กร</label>
              <textarea 
                value={schAddress} onChange={e => setSchAddress(e.target.value)}
                className="w-full bg-[#12122a] border border-[#3a3a5c] rounded-lg px-3 py-2 text-sm text-gray-100 focus:border-amber-400 focus:outline-none" 
                rows={2}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">ลิงค์โลโก้โรงเรียน (URL)</label>
              <input 
                value={logoUrl} onChange={e => setLogoUrl(e.target.value)}
                type="text" 
                className="w-full bg-[#12122a] border border-[#3a3a5c] rounded-lg px-3 py-2 text-sm text-gray-100 focus:border-amber-400 focus:outline-none" 
                placeholder="https://example.com/logo.png"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1 flex items-center gap-1">
                <Lock className="w-3 h-3" /> รหัสผ่านแอดมิน (สำหรับยืนยันการลบข้อมูลสำคัญ)
              </label>
              <input 
                value={adminPassword} onChange={e => setAdminPassword(e.target.value)}
                type="password" 
                className="w-full bg-[#12122a] border border-[#3a3a5c] rounded-lg px-3 py-2 text-sm text-gray-100 focus:border-amber-400 focus:outline-none" 
                placeholder="รหัสผ่านแอดมิน"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-[#2a2a4a]">
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-amber-300">เจ้าหน้าที่การเงิน</h4>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">ชื่อ-นามสกุล</label>
                  <input 
                    value={financeName} onChange={e => setFinanceName(e.target.value)}
                    type="text" 
                    className="w-full bg-[#12122a] border border-[#3a3a5c] rounded-lg px-3 py-2 text-sm text-gray-100 focus:border-amber-400 focus:outline-none" 
                    placeholder="ชื่อเจ้าหน้าที่การเงิน"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Username</label>
                  <input 
                    value={financeUsername} onChange={e => setFinanceUsername(e.target.value)}
                    type="text" 
                    className="w-full bg-[#12122a] border border-[#3a3a5c] rounded-lg px-3 py-2 text-sm text-gray-100 focus:border-amber-400 focus:outline-none" 
                    placeholder="Username"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Password</label>
                  <input 
                    value={financePassword} onChange={e => setFinancePassword(e.target.value)}
                    type="password" 
                    className="w-full bg-[#12122a] border border-[#3a3a5c] rounded-lg px-3 py-2 text-sm text-gray-100 focus:border-amber-400 focus:outline-none" 
                    placeholder="Password"
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-amber-300">ผู้อำนวยการ</h4>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">ชื่อ-นามสกุล</label>
                  <input 
                    value={directorName} onChange={e => setDirectorName(e.target.value)}
                    type="text" 
                    className="w-full bg-[#12122a] border border-[#3a3a5c] rounded-lg px-3 py-2 text-sm text-gray-100 focus:border-amber-400 focus:outline-none" 
                    placeholder="ชื่อผู้อำนวยการ"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Username</label>
                  <input 
                    value={directorUsername} onChange={e => setDirectorUsername(e.target.value)}
                    type="text" 
                    className="w-full bg-[#12122a] border border-[#3a3a5c] rounded-lg px-3 py-2 text-sm text-gray-100 focus:border-amber-400 focus:outline-none" 
                    placeholder="Username"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Password</label>
                  <input 
                    value={directorPassword} onChange={e => setDirectorPassword(e.target.value)}
                    type="password" 
                    className="w-full bg-[#12122a] border border-[#3a3a5c] rounded-lg px-3 py-2 text-sm text-gray-100 focus:border-amber-400 focus:outline-none" 
                    placeholder="Password"
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={handleSaveSystemInfo}
              className="w-full bg-amber-500/20 text-amber-300 py-2 rounded-lg hover:bg-amber-500/30 transition text-sm font-medium mt-4"
            >
              บันทึกข้อมูลระบบ
            </button>
          </div>
        </div>

        {/* Budget Types */}
        <div className="bg-[#1a1a35] rounded-xl p-5 border border-[#2a2a4a]">
          <h3 className="text-base font-bold text-amber-300 mb-4 flex items-center">
            <Briefcase className="w-4 h-4 mr-1" /> ประเภทเงินงบประมาณ
          </h3>
          <div className="flex gap-2 mb-3">
            <input 
              value={newBudget} onChange={e => setNewBudget(e.target.value)}
              type="text" 
              className="flex-1 bg-[#12122a] border border-[#3a3a5c] rounded-lg px-3 py-2 text-sm text-gray-100 focus:border-amber-400 focus:outline-none" 
              placeholder="เพิ่มประเภทงบใหม่" 
            />
            <button 
              onClick={handleAddBudget} 
              className="bg-amber-500/20 text-amber-300 px-3 rounded-lg hover:bg-amber-500/30 transition text-sm"
            >
              +
            </button>
          </div>
          <div className="space-y-1 max-h-48 overflow-auto pr-1 custom-scrollbar">
            {settings.budgetTypes.map(b => (
              <div key={b} className="flex items-center justify-between bg-[#12122a] rounded-lg px-3 py-2 border border-[#2a2a4a]">
                <span className="text-sm text-gray-200">{b}</span>
                <button onClick={() => handleDeleteBudget(b)} className="text-red-400 hover:text-red-300 text-xs">ลบ</button>
              </div>
            ))}
            {settings.budgetTypes.length === 0 && (
              <p className="text-xs text-gray-500 text-center py-2">ยังไม่มีประเภทงบประมาณ</p>
            )}
          </div>
        </div>

        {/* Requesters */}
        <div className="bg-[#1a1a35] rounded-xl p-5 border border-[#2a2a4a]">
          <h3 className="text-base font-bold text-amber-300 mb-4 flex items-center">
            <Users className="w-4 h-4 mr-1" /> จัดการรายชื่อผู้เบิก (ในฟอร์ม)
          </h3>
          <div className="flex gap-2 mb-3">
            <input 
              value={rName} onChange={e => setRName(e.target.value)}
              type="text" 
              className="flex-1 bg-[#12122a] border border-[#3a3a5c] rounded-lg px-3 py-2 text-sm text-gray-100 focus:border-amber-400 focus:outline-none" 
              placeholder="ชื่อผู้เบิก" 
            />
            <button 
              onClick={handleAddRequester} 
              className="bg-amber-500/20 text-amber-300 px-3 rounded-lg hover:bg-amber-500/30 transition text-sm"
            >
              +
            </button>
          </div>
          <div className="space-y-1 max-h-48 overflow-auto pr-1 custom-scrollbar">
            {requesters.map(r => (
              <div key={r.id} className="flex items-center justify-between bg-[#12122a] rounded-lg px-3 py-2 border border-[#2a2a4a]">
                <span className="text-sm text-gray-200">{r.name}</span>
                <button onClick={() => handleDeleteRequester(r.id!)} className="text-red-400 hover:text-red-300 text-xs">ลบ</button>
              </div>
            ))}
            {requesters.length === 0 && (
              <p className="text-xs text-gray-500 text-center py-2">ยังไม่มีรายชื่อผู้เบิก</p>
            )}
          </div>
        </div>

        {/* Vendors Management */}
        <div className="bg-[#1a1a35] rounded-xl p-5 border border-[#2a2a4a] lg:col-span-2">
          <h3 className="text-base font-bold text-amber-300 mb-4 flex items-center">
            <Store className="w-4 h-4 mr-1" /> จัดการรายชื่อร้านค้า/ผู้รับเงิน
          </h3>
          <div className="grid md:grid-cols-3 gap-3 mb-4">
            <input 
              value={vName} onChange={e => setVName(e.target.value)}
              type="text" 
              className="bg-[#12122a] border border-[#3a3a5c] rounded-lg px-3 py-2 text-sm text-gray-100 focus:border-amber-400 focus:outline-none" 
              placeholder="ชื่อร้านค้า" 
            />
            <input 
              value={vTaxId} onChange={e => setVTaxId(e.target.value)}
              type="text" 
              className="bg-[#12122a] border border-[#3a3a5c] rounded-lg px-3 py-2 text-sm text-gray-100 focus:border-amber-400 focus:outline-none" 
              placeholder="เลขผู้เสียภาษี" 
            />
            <div className="flex gap-2">
              <input 
                value={vAddress} onChange={e => setVAddress(e.target.value)}
                type="text" 
                className="flex-1 bg-[#12122a] border border-[#3a3a5c] rounded-lg px-3 py-2 text-sm text-gray-100 focus:border-amber-400 focus:outline-none" 
                placeholder="ที่อยู่ (ถ้ามี)" 
              />
              <button 
                onClick={handleAddVendor} 
                className="bg-amber-500/20 text-amber-300 px-4 rounded-lg hover:bg-amber-500/30 transition text-sm font-medium"
              >
                เพิ่มร้านค้า
              </button>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-2 max-h-64 overflow-auto pr-1 custom-scrollbar">
            {vendors.map(v => (
              <div key={v.id} className="flex items-start justify-between bg-[#12122a] rounded-lg px-3 py-2 border border-[#2a2a4a]">
                <div className="flex-1 min-w-0 mr-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-200 truncate">{v.name}</span>
                    <span className="text-[10px] bg-[#2a2a4a] text-gray-400 px-1.5 py-0.5 rounded">ID: {v.taxId}</span>
                  </div>
                  {v.address && <p className="text-xs text-gray-500 truncate mt-0.5">{v.address}</p>}
                </div>
                <button onClick={() => handleDeleteVendor(v.id!)} className="text-red-400 hover:text-red-300 text-xs mt-1">ลบ</button>
              </div>
            ))}
            {vendors.length === 0 && (
              <p className="text-xs text-gray-500 text-center py-4 col-span-2">ยังไม่มีรายชื่อร้านค้า</p>
            )}
          </div>
        </div>
      </div>

      {deletingRequesterId && (
        <PasswordPromptModal
          onConfirm={confirmDeleteRequester}
          onCancel={() => setDeletingRequesterId(null)}
          title="ยืนยันการลบผู้เบิก"
          message="ผู้เบิกรายนี้ถูกใช้งานในรายการเบิกจ่ายแล้ว การลบอาจทำให้ข้อมูลบางส่วนไม่สมบูรณ์ กรุณายืนยันด้วยรหัสผ่านแอดมิน"
        />
      )}

      {deletingVendorId && (
        <PasswordPromptModal
          onConfirm={confirmDeleteVendor}
          onCancel={() => setDeletingVendorId(null)}
          title="ยืนยันการลบร้านค้า"
          message="ร้านค้านี้ถูกใช้งานในรายการเบิกจ่ายแล้ว การลบอาจทำให้ข้อมูลบางส่วนไม่สมบูรณ์ กรุณายืนยันด้วยรหัสผ่านแอดมิน"
        />
      )}
    </section>
  );
}
