'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Plus, Trash2, Save, Calculator, FileText, Store, X, Layers, UserPlus } from 'lucide-react';
import { DisbursementItem, VendorGroup } from '@/lib/types';

export default function DisbursementTab() {
  const { vendors, requesters, addDisbursement, addVendor, deleteVendor, settings } = useAppContext();
  
  const [docNumber, setDocNumber] = useState('');
  const [date, setDate] = useState('');
  const [requester, setRequester] = useState('');
  const [adminGroup, setAdminGroup] = useState('');
  const [budgetType, setBudgetType] = useState('');
  const [activity, setActivity] = useState('');
  const [activityPurpose, setActivityPurpose] = useState('');
  const [participants, setParticipants] = useState('');
  const [vendorId, setVendorId] = useState('');
  
  useEffect(() => {
    setDate(new Date().toISOString().split('T')[0]);
  }, []);
  
  // Mode state
  const [mode, setMode] = useState<'purchase' | 'travel' | 'activity'>('purchase');
  const [travelDestination, setTravelDestination] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [returnTravelDate, setReturnTravelDate] = useState('');
  
  // Travel expenses state
  const [travelAllowance, setTravelAllowance] = useState<number | ''>('');
  const [travelFood, setTravelFood] = useState<number | ''>('');
  const [travelAccommodation, setTravelAccommodation] = useState<number | ''>('');
  const [travelTransport, setTravelTransport] = useState<number | ''>('');
  const [travelOther, setTravelOther] = useState<number | ''>('');
  
  // Multi-vendor state
  const [isMultiVendorToggle, setIsMultiVendorToggle] = useState(false);
  const isMultiVendor = mode === 'purchase' && isMultiVendorToggle;
  const [vendorGroups, setVendorGroups] = useState<VendorGroup[]>([
    { 
      vendorName: '', 
      vendorTaxId: '', 
      vendorAddress: '', 
      items: [{ name: '', qty: 1, price: 0, total: 0, isExempted: false }], 
      subtotal: 0, 
      exemptedTotal: 0,
      taxableTotal: 0,
      vat: 0, 
      withholdingTax: 0, 
      netTotal: 0 
    }
  ]);
  
  // Vendor Modal State
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [vName, setVName] = useState('');
  const [vTaxId, setVTaxId] = useState('');
  const [vAddress, setVAddress] = useState('');
  
  const [items, setItems] = useState<DisbursementItem[]>([
    { name: '', qty: 1, price: 0, total: 0, isExempted: false }
  ]);
  
  const [hasVat, setHasVat] = useState(false);
  const [hasWht, setHasWht] = useState(false);
  const [vatRate, setVatRate] = useState(7);
  const [whtRate, setWhtRate] = useState(1);
  const [vatAmount, setVatAmount] = useState(0);
  const [whtAmount, setWhtAmount] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [exemptedTotal, setExemptedTotal] = useState(0);
  const [taxableTotalIncVat, setTaxableTotalIncVat] = useState(0);
  const [taxableTotalExclVat, setTaxableTotalExclVat] = useState(0);
  
  const [msg, setMsg] = useState({ text: '', type: '' });

  // Multi-vendor handlers
  const addVendorGroup = () => {
    setVendorGroups([...vendorGroups, { 
      vendorName: '', 
      vendorTaxId: '', 
      vendorAddress: '', 
      items: [{ name: '', qty: 1, price: 0, total: 0, isExempted: false }], 
      subtotal: 0, 
      exemptedTotal: 0,
      taxableTotal: 0,
      vat: 0, 
      withholdingTax: 0, 
      netTotal: 0 
    }]);
  };

  const removeVendorGroup = (index: number) => {
    if (vendorGroups.length > 1) {
      setVendorGroups(vendorGroups.filter((_, i) => i !== index));
    }
  };

  const updateVendorGroup = (index: number, field: keyof VendorGroup, value: any) => {
    const newGroups = [...vendorGroups];
    newGroups[index] = { ...newGroups[index], [field]: value };
    setVendorGroups(newGroups);
  };

  const calculateGroupTotals = useCallback((items: DisbursementItem[]) => {
    const groupSubtotal = items.reduce((sum, item) => sum + item.total, 0);
    const groupExempted = items.reduce((sum, item) => item.isExempted ? sum + item.total : sum, 0);
    const taxableIncVat = groupSubtotal - groupExempted;
    
    let groupVat = 0;
    if (hasVat) {
      groupVat = Number(((taxableIncVat * vatRate) / (100 + vatRate)).toFixed(2));
    }
    
    let groupWht = 0;
    if (hasWht) {
      const base = groupSubtotal - groupVat;
      groupWht = Number((base * (whtRate / 100)).toFixed(2));
    }
    
    return {
      subtotal: groupSubtotal,
      exemptedTotal: groupExempted,
      taxableTotal: taxableIncVat - groupVat,
      vat: groupVat,
      withholdingTax: groupWht,
      netTotal: groupSubtotal - groupWht
    };
  }, [hasVat, vatRate, hasWht, whtRate]);

  const handleGroupItemChange = (groupIndex: number, itemIndex: number, field: keyof DisbursementItem, value: any) => {
    const newGroups = [...vendorGroups];
    const group = newGroups[groupIndex];
    const newItems = [...group.items];
    
    newItems[itemIndex] = { ...newItems[itemIndex], [field]: value };
    
    if (field === 'qty' || field === 'price') {
      newItems[itemIndex].total = (Number(newItems[itemIndex].qty) || 0) * (Number(newItems[itemIndex].price) || 0);
    } else if (field === 'total') {
      const total = Number(value) || 0;
      const qty = Number(newItems[itemIndex].qty) || 1;
      newItems[itemIndex].price = total / qty;
    }
    
    group.items = newItems;
    
    const totals = calculateGroupTotals(newItems);
    Object.assign(group, totals);
    
    setVendorGroups(newGroups);
  };

  const addGroupItem = (groupIndex: number) => {
    const newGroups = [...vendorGroups];
    const group = newGroups[groupIndex];
    group.items.push({ name: '', qty: 1, price: 0, total: 0, isExempted: false });
    
    const totals = calculateGroupTotals(group.items);
    Object.assign(group, totals);
    
    setVendorGroups(newGroups);
  };

  const removeGroupItem = (groupIndex: number, itemIndex: number) => {
    const newGroups = [...vendorGroups];
    const group = newGroups[groupIndex];
    if (group.items.length > 1) {
      group.items = group.items.filter((_, i) => i !== itemIndex);
      
      const totals = calculateGroupTotals(group.items);
      Object.assign(group, totals);
      
      setVendorGroups(newGroups);
    }
  };

  // Recalculate all groups when global tax settings change
  useEffect(() => {
    if (isMultiVendor) {
      setVendorGroups(prevGroups => {
        const newGroups = prevGroups.map(group => {
          const totals = calculateGroupTotals(group.items);
          return { ...group, ...totals };
        });
        
        // Check if anything actually changed to avoid infinite loop
        const hasChanged = JSON.stringify(newGroups) !== JSON.stringify(prevGroups);
        return hasChanged ? newGroups : prevGroups;
      });
    }
  }, [hasVat, vatRate, hasWht, whtRate, isMultiVendor, calculateGroupTotals]);

  const handleItemChange = (index: number, field: keyof DisbursementItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'qty' || field === 'price') {
      newItems[index].total = (Number(newItems[index].qty) || 0) * (Number(newItems[index].price) || 0);
    } else if (field === 'total') {
      const total = Number(value) || 0;
      const qty = Number(newItems[index].qty) || 1;
      newItems[index].price = total / qty;
    }
    
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { name: '', qty: 1, price: 0, total: 0, isExempted: false }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculations = useMemo(() => {
    if (isMultiVendor) {
      const s = vendorGroups.reduce((sum, g) => sum + g.subtotal, 0);
      const e = vendorGroups.reduce((sum, g) => sum + g.exemptedTotal, 0);
      const t = vendorGroups.reduce((sum, g) => sum + g.taxableTotal, 0);
      const v = vendorGroups.reduce((sum, g) => sum + g.vat, 0);
      const w = vendorGroups.reduce((sum, g) => sum + g.withholdingTax, 0);
      const n = vendorGroups.reduce((sum, g) => sum + g.netTotal, 0);
      
      return { 
        subtotal: s, 
        exemptedTotal: e, 
        taxableTotalIncVat: t + v, 
        taxableTotalExclVat: t, 
        vat: v, 
        wht: w, 
        netTotal: n 
      };
    }

    const vat = mode === 'activity' ? 0 : (Number(vatAmount) || 0);
    const wht = mode === 'activity' ? 0 : (Number(whtAmount) || 0);
    const s = Number(subtotal) || 0;
    
    const netTotal = s - wht;
    
    return { 
      subtotal: s, 
      exemptedTotal: mode === 'activity' ? 0 : (Number(exemptedTotal) || 0), 
      taxableTotalIncVat: mode === 'activity' ? 0 : (Number(taxableTotalIncVat) || 0), 
      taxableTotalExclVat: mode === 'activity' ? 0 : (Number(taxableTotalExclVat) || 0), 
      vat, 
      wht, 
      netTotal 
    };
  }, [isMultiVendor, vendorGroups, subtotal, exemptedTotal, taxableTotalIncVat, taxableTotalExclVat, vatAmount, whtAmount, mode]);

  // Sync subtotal and exemptedTotal from items
  useEffect(() => {
    const calcSubtotal = items.reduce((sum, item) => sum + item.total, 0);
    const calcExemptedTotal = items.reduce((sum, item) => item.isExempted ? sum + item.total : sum, 0);
    
    setSubtotal(calcSubtotal);
    setExemptedTotal(calcExemptedTotal);
  }, [items]);

  // Handle summary logic based on subtotal and exemptedTotal
  useEffect(() => {
    const taxableInc = subtotal - exemptedTotal;
    setTaxableTotalIncVat(taxableInc);

    let currentVat = 0;
    if (hasVat) {
      const extractedVat = (taxableInc * vatRate) / (100 + vatRate);
      currentVat = Number(extractedVat.toFixed(2));
      setVatAmount(currentVat);
    } else {
      setVatAmount(0);
    }
    
    setTaxableTotalExclVat(taxableInc - currentVat);

    // WHT calculation (usually from base amount)
    const baseAmount = subtotal - (hasVat ? (taxableInc * vatRate / (100 + vatRate)) : 0);
    if (hasWht) {
      setWhtAmount(Number((baseAmount * (whtRate / 100)).toFixed(2)));
    } else {
      setWhtAmount(0);
    }
  }, [subtotal, exemptedTotal, hasVat, vatRate, hasWht, whtRate]);

  const showMsg = (text: string, type: 'success' | 'error') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 3000);
  };

  const handleAddVendor = async (e: React.FormEvent) => {
    e.preventDefault();
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
      setIsVendorModalOpen(false);
      showMsg('เพิ่มร้านค้าเรียบร้อยแล้ว', 'success');
    } catch (error) {
      showMsg('เกิดข้อผิดพลาดในการเพิ่มร้านค้า', 'error');
    }
  };

  const handleDeleteVendor = async () => {
    if (!vendorId) return;
    const vendor = vendors.find(v => v.id === vendorId);
    if (!vendor) return;

    if (confirm(`ต้องการลบร้านค้า "${vendor.name}" ออกจากระบบใช่หรือไม่?`)) {
      try {
        await deleteVendor(vendorId);
        setVendorId('');
        showMsg('ลบร้านค้าเรียบร้อยแล้ว', 'success');
      } catch (error) {
        showMsg('เกิดข้อผิดพลาดในการลบร้านค้า', 'error');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!docNumber || !date || !requester || !adminGroup || !budgetType || !activity) {
      showMsg('กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
      return;
    }

    if (isMultiVendor) {
      if (vendorGroups.some(g => !g.vendorName || g.items.some(i => !i.name || i.qty <= 0 || i.price <= 0))) {
        showMsg('กรุณากรอกข้อมูลร้านค้าและรายการให้ครบถ้วน', 'error');
        return;
      }

      const selectedRequester = requesters.find(r => r.name === requester);

      try {
        await addDisbursement({
          docNumber,
          date,
          requester,
          requesterId: selectedRequester?.id,
          adminGroup,
          budgetType,
          activity,
          activityPurpose: undefined,
          participants: participants || undefined,
          mode: 'purchase',
          travelDestination: undefined,
          travelDate: undefined,
          vendorName: vendorGroups[0].vendorName, // Use first as primary
          vendorId: vendorGroups[0].vendorId,
          vendorTaxId: vendorGroups[0].vendorTaxId,
          vendorAddress: vendorGroups[0].vendorAddress || '',
          items: vendorGroups.flatMap(g => g.items), // Flatten for simple views
          vendors: vendorGroups,
          subtotal: calculations.subtotal,
          vat: calculations.vat,
          withholdingTax: calculations.wht,
          netTotal: calculations.netTotal,
          status: 'รอดำเนินการ'
        });
        
        showMsg('บันทึกข้อมูลแบบหลายร้านค้าเรียบร้อยแล้ว', 'success');
        
        // Reset
        setDocNumber('');
        setDate(new Date().toISOString().split('T')[0]);
        setActivity('');
        setActivityPurpose('');
        setParticipants('');
        setTravelDestination('');
        setTravelDate('');
        setVendorGroups([{ 
          vendorName: '', vendorTaxId: '', vendorAddress: '', 
          items: [{ name: '', qty: 1, price: 0, total: 0, isExempted: false }], 
          subtotal: 0, exemptedTotal: 0, taxableTotal: 0, vat: 0, withholdingTax: 0, netTotal: 0 
        }]);
      } catch (error) {
        showMsg('เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
      }
      return;
    }
    
    if (mode === 'travel') {
      const travelItems: DisbursementItem[] = [
        { name: 'ค่าเบี้ยเลี้ยง', qty: 1, price: Number(travelAllowance) || 0, total: Number(travelAllowance) || 0, isExempted: true },
        { name: 'ค่าอาหาร', qty: 1, price: Number(travelFood) || 0, total: Number(travelFood) || 0, isExempted: true },
        { name: 'ค่าเช่าที่พัก', qty: 1, price: Number(travelAccommodation) || 0, total: Number(travelAccommodation) || 0, isExempted: true },
        { name: 'ค่าพาหนะ', qty: 1, price: Number(travelTransport) || 0, total: Number(travelTransport) || 0, isExempted: true },
        { name: 'ค่าใช้จ่ายอื่นๆ', qty: 1, price: Number(travelOther) || 0, total: Number(travelOther) || 0, isExempted: true }
      ].filter(item => item.total > 0);

      if (travelItems.length === 0) {
        showMsg('กรุณากรอกค่าใช้จ่ายอย่างน้อย 1 รายการ', 'error');
        return;
      }

      const travelTotal = travelItems.reduce((sum, item) => sum + item.total, 0);

      const selectedRequester = requesters.find(r => r.name === requester);

      try {
        await addDisbursement({
          docNumber,
          date,
          requester,
          requesterId: selectedRequester?.id,
          adminGroup,
          budgetType,
          activity,
          activityPurpose: undefined,
          participants: participants || undefined,
          mode: 'travel',
          travelDestination,
          travelDate,
          returnTravelDate,
          vendorName: requester,
          vendorTaxId: '-',
          vendorAddress: '-',
          items: travelItems,
          subtotal: travelTotal,
          exemptedTotal: travelTotal,
          taxableTotal: 0,
          vat: 0,
          withholdingTax: 0,
          netTotal: travelTotal,
          status: 'รอดำเนินการ'
        });
        
        showMsg('บันทึกข้อมูลการเดินทางเรียบร้อยแล้ว', 'success');
        
        // Reset form
        setDocNumber('');
        setDate(new Date().toISOString().split('T')[0]);
        setAdminGroup('');
        setActivity('');
        setActivityPurpose('');
        setTravelDestination('');
        setTravelDate('');
        setReturnTravelDate('');
        setTravelAllowance('');
        setTravelFood('');
        setTravelAccommodation('');
        setTravelTransport('');
        setTravelOther('');
      } catch (error) {
        showMsg('เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
      }
      return;
    }
    
    if (!vendorId) {
      showMsg('กรุณาเลือกร้านค้า', 'error');
      return;
    }

    const selectedVendor = vendors.find(v => v.id === vendorId);
    if (!selectedVendor) {
      showMsg('ไม่พบข้อมูลร้านค้า', 'error');
      return;
    }

    const selectedRequester = requesters.find(r => r.name === requester);

    try {
        await addDisbursement({
          docNumber,
          date,
          requester,
          requesterId: selectedRequester?.id,
          adminGroup,
          budgetType,
        activity,
        activityPurpose: mode === 'activity' ? activityPurpose : undefined,
        participants: participants || undefined,
        mode,
        travelDestination: undefined,
        travelDate: undefined,
        vendorName: selectedVendor.name,
        vendorId: selectedVendor.id,
        vendorTaxId: selectedVendor.taxId,
        vendorAddress: selectedVendor.address || '',
        items,
        subtotal: calculations.subtotal,
        exemptedTotal: calculations.exemptedTotal,
        taxableTotal: calculations.taxableTotalIncVat,
        vat: calculations.vat,
        withholdingTax: calculations.wht,
        netTotal: calculations.netTotal,
        status: 'รอดำเนินการ'
      });
      
      showMsg('บันทึกข้อมูลเรียบร้อยแล้ว', 'success');
      
      // Reset form
      setDocNumber('');
      setDate(new Date().toISOString().split('T')[0]);
      setAdminGroup('');
      setActivity('');
      setActivityPurpose('');
      setParticipants('');
      setTravelDestination('');
      setTravelDate('');
      setReturnTravelDate('');
      setItems([{ name: '', qty: 1, price: 0, total: 0, isExempted: false }]);
      setHasVat(false);
      setHasWht(false);
    } catch (error) {
      showMsg('เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-[#1a1a35] rounded-xl shadow-xl border border-[#2a2a4a] overflow-hidden fade-up">
      <div className="bg-gradient-to-r from-[#1e3a5f] to-[#1a2744] p-6 border-b border-[#2a4a6a] flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-amber-300 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            รายงานผลการตรวจรับและขออนุมัติจ่ายเงิน
          </h2>
          <p className="text-sm text-blue-200 mt-1 opacity-80">กรอกรายละเอียดเพื่อสร้างเอกสารเบิกจ่าย</p>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={mode}
            onChange={(e) => setMode(e.target.value as 'purchase' | 'travel' | 'activity')}
            className="bg-[#2a2a4a] text-gray-200 px-4 py-2 rounded-lg text-sm font-bold border border-[#3a3a5c] focus:border-amber-400 focus:outline-none"
          >
            <option value="purchase">โหมดจัดซื้อ</option>
            <option value="travel">โหมดเดินทางไปราชการ</option>
            <option value="activity">โหมดจัดกิจกรรม</option>
          </select>
          {mode === 'purchase' && (
            <button
              type="button"
              onClick={() => setIsMultiVendorToggle(!isMultiVendorToggle)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${isMultiVendorToggle ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-[#2a2a4a] text-gray-400 hover:text-gray-200'}`}
            >
              <Layers className="w-4 h-4" />
              {isMultiVendorToggle ? 'โหมดหลายร้านค้า' : 'โหมดร้านค้าเดียว'}
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {msg.text && (
          <div className={`p-4 rounded-lg text-sm text-center font-medium ${msg.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
            {msg.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">เลขที่เอกสาร</label>
              <input 
                type="text" required
                value={docNumber} onChange={e => setDocNumber(e.target.value)}
                className="w-full bg-[#12122a] border border-[#3a3a5c] rounded-lg px-4 py-2 text-gray-100 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 focus:outline-none transition"
                placeholder="เช่น บจ.001/2567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">วันที่เอกสาร</label>
              <input 
                type="date" required
                value={date} onChange={e => setDate(e.target.value)}
                className="w-full bg-[#12122a] border border-[#3a3a5c] rounded-lg px-4 py-2 text-gray-100 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">ผู้เบิก</label>
              <select 
                required value={requester} onChange={e => setRequester(e.target.value)}
                className="w-full bg-[#12122a] border border-[#3a3a5c] rounded-lg px-4 py-2 text-gray-100 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 focus:outline-none transition"
              >
                <option value="">-- เลือกผู้เบิก --</option>
                {requesters.map(r => (
                  <option key={r.id} value={r.name}>{r.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">กลุ่มงานบริหาร</label>
              <select 
                required value={adminGroup} onChange={e => setAdminGroup(e.target.value)}
                className="w-full bg-[#12122a] border border-[#3a3a5c] rounded-lg px-4 py-2 text-gray-100 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 focus:outline-none transition"
              >
                <option value="">-- เลือกกลุ่มงาน --</option>
                <option value="ทั่วไป">ทั่วไป</option>
                <option value="งบประมาณ">งบประมาณ</option>
                <option value="วิชาการ">วิชาการ</option>
                <option value="บุคคล">บุคคล</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">ประเภทเงินงบประมาณ</label>
              <select 
                required value={budgetType} onChange={e => setBudgetType(e.target.value)}
                className="w-full bg-[#12122a] border border-[#3a3a5c] rounded-lg px-4 py-2 text-gray-100 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 focus:outline-none transition"
              >
                <option value="">-- เลือกประเภท --</option>
                {settings.budgetTypes.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">กิจกรรม/โครงการ</label>
              <input 
                type="text" required
                value={activity} onChange={e => setActivity(e.target.value)}
                className="w-full bg-[#12122a] border border-[#3a3a5c] rounded-lg px-4 py-2 text-gray-100 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 focus:outline-none transition"
                placeholder="ชื่อกิจกรรมหรือโครงการ"
              />
            </div>
            {mode === 'activity' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">เพื่อ</label>
                <input 
                  type="text" required
                  value={activityPurpose} onChange={e => setActivityPurpose(e.target.value)}
                  className="w-full bg-[#12122a] border border-[#3a3a5c] rounded-lg px-4 py-2 text-gray-100 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 focus:outline-none transition"
                  placeholder="วัตถุประสงค์การจัดกิจกรรม"
                />
              </div>
            )}
            {mode !== 'travel' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">เข้าร่วม (จำนวน/คน)</label>
                <input 
                  type="text"
                  value={participants} onChange={e => setParticipants(e.target.value)}
                  className="w-full bg-[#12122a] border border-[#3a3a5c] rounded-lg px-4 py-2 text-gray-100 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 focus:outline-none transition"
                  placeholder="เช่น 50 คน"
                />
              </div>
            )}
            {mode === 'travel' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">เข้าร่วม</label>
                  <input 
                    type="text"
                    value={participants} onChange={e => setParticipants(e.target.value)}
                    className="w-full bg-[#12122a] border border-[#3a3a5c] rounded-lg px-4 py-2 text-gray-100 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 focus:outline-none transition"
                    placeholder="เช่น การประชุมสัมมนา..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">สถานที่เดินทาง</label>
                  <input type="text" value={travelDestination} onChange={e => setTravelDestination(e.target.value)} required className="w-full bg-[#12122a] border border-[#3a3a5c] rounded-lg px-4 py-2 text-gray-100 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 focus:outline-none transition" placeholder="สถานที่เดินทาง" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">วันที่เดินทางไป</label>
                    <input type="date" value={travelDate} onChange={e => setTravelDate(e.target.value)} required className="w-full bg-[#12122a] border border-[#3a3a5c] rounded-lg px-4 py-2 text-gray-100 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 focus:outline-none transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">วันที่เดินทางกลับ</label>
                    <input type="date" value={returnTravelDate} onChange={e => setReturnTravelDate(e.target.value)} required className="w-full bg-[#12122a] border border-[#3a3a5c] rounded-lg px-4 py-2 text-gray-100 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 focus:outline-none transition" />
                  </div>
                </div>
              </>
            )}
            {!isMultiVendor && mode !== 'travel' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">ร้านค้า/ผู้รับเงิน</label>
                <div className="flex gap-2">
                  <select 
                    required={!isMultiVendor} value={vendorId} onChange={e => setVendorId(e.target.value)}
                    className="flex-1 bg-[#12122a] border border-[#3a3a5c] rounded-lg px-4 py-2 text-gray-100 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 focus:outline-none transition"
                  >
                    <option value="">-- เลือกร้านค้า --</option>
                    {vendors.map(v => (
                      <option key={v.id} value={v.id}>{v.name} (เลขผู้เสียภาษี: {v.taxId})</option>
                    ))}
                  </select>
                  <button 
                    type="button"
                    onClick={() => setIsVendorModalOpen(true)}
                    className="p-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg hover:bg-amber-500/20 transition"
                    title="เพิ่มร้านค้าใหม่"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                  <button 
                    type="button"
                    onClick={handleDeleteVendor}
                    disabled={!vendorId}
                    className="p-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition disabled:opacity-30 disabled:cursor-not-allowed"
                    title="ลบร้านค้าที่เลือก"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <hr className="border-[#2a2a4a]" />

        {/* Items or Multi-Vendor Sections */}
        {isMultiVendor ? (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-amber-300">รายละเอียดแยกตามร้านค้า</h3>
              <button 
                type="button" onClick={addVendorGroup}
                className="flex items-center gap-2 bg-amber-500/20 text-amber-400 px-4 py-2 rounded-lg hover:bg-amber-500/30 transition border border-amber-500/30"
              >
                <UserPlus className="w-4 h-4" /> เพิ่มร้านค้า
              </button>
            </div>

            {vendorGroups.map((group, gIndex) => (
              <div key={gIndex} className="bg-[#12122a] rounded-xl border border-[#2a2a4a] overflow-hidden">
                <div className="bg-[#1a1a35] p-4 border-b border-[#2a2a4a] flex justify-between items-center">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">{gIndex + 1}</span>
                      <select 
                        required={isMultiVendor}
                        value={vendors.find(v => v.name === group.vendorName)?.id || ''} 
                        onChange={e => {
                          const v = vendors.find(v => v.id === e.target.value);
                          if (v) {
                            updateVendorGroup(gIndex, 'vendorName', v.name);
                            updateVendorGroup(gIndex, 'vendorId', v.id);
                            updateVendorGroup(gIndex, 'vendorTaxId', v.taxId);
                            updateVendorGroup(gIndex, 'vendorAddress', v.address || '');
                          }
                        }}
                        className="flex-1 bg-[#12122a] border border-[#3a3a5c] rounded-lg px-3 py-1.5 text-sm text-gray-100 focus:border-amber-400 focus:outline-none"
                      >
                        <option value="">-- เลือกร้านค้า --</option>
                        {vendors.map(v => (
                          <option key={v.id} value={v.id}>{v.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center">
                      {group.vendorTaxId ? `เลขผู้เสียภาษี: ${group.vendorTaxId}` : 'กรุณาเลือกร้านค้า'}
                    </div>
                  </div>
                  <button 
                    type="button" onClick={() => removeVendorGroup(gIndex)}
                    className="ml-4 p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-4 space-y-3">
                  {group.items.map((item, iIndex) => (
                    <div key={iIndex} className="flex flex-wrap md:flex-nowrap gap-3 items-end bg-[#1a1a35] p-3 rounded-lg border border-[#2a2a4a]">
                      <div className="w-full md:w-1/2">
                        <input 
                          type="text" required
                          value={item.name} onChange={e => handleGroupItemChange(gIndex, iIndex, 'name', e.target.value)}
                          className="w-full bg-[#12122a] border border-[#3a3a5c] rounded-lg px-3 py-2 text-sm text-gray-100 focus:border-amber-400 focus:outline-none"
                          placeholder="ชื่อรายการ"
                        />
                      </div>
                      <div className="w-1/4 md:w-[15%]">
                        <input 
                          type="number" min="1" required
                          value={item.qty || ''} onChange={e => handleGroupItemChange(gIndex, iIndex, 'qty', e.target.value)}
                          className="w-full bg-[#12122a] border border-[#3a3a5c] rounded-lg px-3 py-2 text-sm text-gray-100 focus:border-amber-400 focus:outline-none text-center"
                        />
                      </div>
                      <div className="w-1/4 md:w-[20%]">
                        <input 
                          type="number" min="0" step="0.01" required
                          value={item.price || ''} onChange={e => handleGroupItemChange(gIndex, iIndex, 'price', e.target.value)}
                          className="w-full bg-[#12122a] border border-[#3a3a5c] rounded-lg px-3 py-2 text-sm text-gray-100 focus:border-amber-400 focus:outline-none text-right"
                          placeholder="ราคา"
                        />
                      </div>
                      <div className="w-1/4 md:w-[15%]">
                        <div className="w-full bg-[#12122a] border border-[#3a3a5c] rounded-lg px-3 py-2 text-sm text-amber-400 font-mono text-right">
                          {item.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>
                      <button 
                        type="button" onClick={() => removeGroupItem(gIndex, iIndex)}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button 
                    type="button" onClick={() => addGroupItem(gIndex)}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> เพิ่มรายการสำหรับร้านนี้
                  </button>
                </div>
                
                <div className="bg-[#1a1a35] p-5 border-t border-[#2a2a4a]">
                  <div className="flex items-center gap-2 text-gray-400 mb-4">
                    <Store className="w-4 h-4 text-amber-500/50" />
                    <span className="text-sm">สรุปยอดร้าน: <span className="text-gray-200 font-bold">{group.vendorName || 'ยังไม่ระบุ'}</span></span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-[#12122a] p-3 rounded-xl border border-[#2a2a4a] shadow-inner">
                      <p className="text-[10px] text-gray-500 uppercase font-bold mb-1 tracking-wider">จำนวนเงินที่ขอเบิก</p>
                      <p className="text-xl font-mono text-amber-400">฿{group.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    </div>
                    
                    <div className="bg-[#12122a] p-3 rounded-xl border border-[#2a2a4a] shadow-inner">
                      <p className="text-[10px] text-gray-500 uppercase font-bold mb-1 tracking-wider">มูลค่าสินค้า/ค่าจ้าง</p>
                      <p className="text-xl font-mono text-blue-400/80">฿{group.taxableTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    </div>
                    
                    <div className="bg-[#12122a] p-3 rounded-xl border border-[#2a2a4a] shadow-inner">
                      <p className="text-[10px] text-gray-500 uppercase font-bold mb-1 tracking-wider">สินค้ายกเว้นภาษี</p>
                      <p className="text-xl font-mono text-yellow-500/80">฿{group.exemptedTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap justify-between items-center gap-4 pt-4 border-t border-[#2a2a4a]/50">
                    <div className="flex gap-6 text-[11px]">
                      {hasVat && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">ภาษีมูลค่าเพิ่ม ({vatRate}%):</span>
                          <span className="text-blue-400 font-mono">฿{group.vat.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                      )}
                      {hasWht && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">หัก ณ ที่จ่าย ({whtRate}%):</span>
                          <span className="text-red-400 font-mono">฿{group.withholdingTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-amber-500/10 px-4 py-2 rounded-lg border border-amber-500/20">
                      <span className="text-amber-400 font-bold text-sm">ยอดสุทธิที่ต้องจ่าย: <span className="font-mono ml-2 text-lg">฿{group.netTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : mode === 'travel' ? (
          <div className="bg-[#12122a] rounded-xl overflow-hidden border border-[#2a2a4a] p-5 space-y-4">
            <h3 className="text-lg font-bold text-amber-300 mb-4">รายละเอียดค่าใช้จ่ายเดินทาง</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">ค่าเบี้ยเลี้ยง</label>
                <input type="number" min="0" step="0.01" value={travelAllowance} onChange={e => setTravelAllowance(e.target.value ? Number(e.target.value) : '')} className="w-full bg-[#1a1a35] border border-[#3a3a5c] rounded-lg px-4 py-2 text-gray-100 focus:border-amber-400 focus:outline-none" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">ค่าอาหาร</label>
                <input type="number" min="0" step="0.01" value={travelFood} onChange={e => setTravelFood(e.target.value ? Number(e.target.value) : '')} className="w-full bg-[#1a1a35] border border-[#3a3a5c] rounded-lg px-4 py-2 text-gray-100 focus:border-amber-400 focus:outline-none" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">ค่าเช่าที่พัก</label>
                <input type="number" min="0" step="0.01" value={travelAccommodation} onChange={e => setTravelAccommodation(e.target.value ? Number(e.target.value) : '')} className="w-full bg-[#1a1a35] border border-[#3a3a5c] rounded-lg px-4 py-2 text-gray-100 focus:border-amber-400 focus:outline-none" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">ค่าพาหนะ</label>
                <input type="number" min="0" step="0.01" value={travelTransport} onChange={e => setTravelTransport(e.target.value ? Number(e.target.value) : '')} className="w-full bg-[#1a1a35] border border-[#3a3a5c] rounded-lg px-4 py-2 text-gray-100 focus:border-amber-400 focus:outline-none" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">ค่าใช้จ่ายอื่นๆ</label>
                <input type="number" min="0" step="0.01" value={travelOther} onChange={e => setTravelOther(e.target.value ? Number(e.target.value) : '')} className="w-full bg-[#1a1a35] border border-[#3a3a5c] rounded-lg px-4 py-2 text-gray-100 focus:border-amber-400 focus:outline-none" placeholder="0.00" />
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold text-gray-200">รายการเบิกจ่าย</h3>
              <button 
                type="button" onClick={addItem}
                className="flex items-center gap-1 text-sm bg-[#2a2a4a] text-amber-300 px-3 py-1.5 rounded-lg hover:bg-[#3a3a5c] transition"
              >
                <Plus className="w-4 h-4" /> เพิ่มรายการ
              </button>
            </div>
            <p className="text-sm text-gray-400 mb-4">รายละเอียดดังนี้</p>
            
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="flex flex-wrap md:flex-nowrap gap-3 items-end bg-[#12122a] p-3 rounded-lg border border-[#2a2a4a]">
                  <div className="w-full md:w-1/3">
                    <label className="block text-xs text-gray-400 mb-1">รายการ</label>
                    <input 
                      type="text" required
                      value={item.name} onChange={e => handleItemChange(index, 'name', e.target.value)}
                      className="w-full bg-[#1a1a35] border border-[#3a3a5c] rounded-lg px-3 py-2 text-sm text-gray-100 focus:border-amber-400 focus:outline-none"
                      placeholder="ชื่อรายการ"
                    />
                  </div>
                  <div className="w-1/4 md:w-[12%]">
                    <label className="block text-xs text-gray-400 mb-1">จำนวน</label>
                    <input 
                      type="number" min="1" required
                      value={item.qty || ''} onChange={e => handleItemChange(index, 'qty', e.target.value)}
                      className="w-full bg-[#1a1a35] border border-[#3a3a5c] rounded-lg px-3 py-2 text-sm text-gray-100 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div className="w-1/4 md:w-[15%]">
                    <label className="block text-xs text-gray-400 mb-1">ราคา/หน่วย</label>
                    <input 
                      type="number" min="0" step="0.01" required
                      value={item.price || ''} onChange={e => handleItemChange(index, 'price', e.target.value)}
                      className="w-full bg-[#1a1a35] border border-[#3a3a5c] rounded-lg px-3 py-2 text-sm text-gray-100 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  {mode !== 'activity' && (
                    <div className="w-1/4 md:w-[10%] flex flex-col items-center mb-1">
                      <label className="block text-[10px] text-gray-400 mb-1">ยกเว้นภาษี</label>
                      <input 
                        type="checkbox"
                        checked={item.isExempted || false} onChange={e => handleItemChange(index, 'isExempted', e.target.checked)}
                        className="rounded border-[#3a3a5c] bg-[#1a1a35] text-amber-500 focus:ring-amber-500/50 w-5 h-5"
                      />
                    </div>
                  )}
                  <div className="w-1/4 md:w-[15%]">
                    <label className="block text-xs text-gray-400 mb-1">รวม</label>
                    <input 
                      type="number" step="0.01"
                      value={item.total || ''} onChange={e => handleItemChange(index, 'total', e.target.value)}
                      className="w-full bg-[#1a1a35] border border-[#3a3a5c] rounded-lg px-3 py-2 text-sm text-gray-100 font-mono text-right focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <button 
                    type="button" onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Calculations */}
        <div className="bg-[#12122a] rounded-xl overflow-hidden border border-[#2a2a4a]">
          <div className="p-4 bg-[#1a1a35] border-b border-[#2a2a4a] flex items-center gap-2">
            <Calculator className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-gray-200">สรุปยอดเงิน</h3>
          </div>

          <div className="divide-y divide-[#2a2a4a]">
            {mode === 'travel' ? (
              <div className="flex justify-between items-center p-5 bg-amber-500/10">
                <span className="text-amber-400 font-bold text-lg">ยอดสุทธิที่ต้องจ่าย</span>
                <div className="text-right text-amber-300 font-mono text-2xl font-bold">
                  ฿{((Number(travelAllowance) || 0) + (Number(travelFood) || 0) + (Number(travelAccommodation) || 0) + (Number(travelTransport) || 0) + (Number(travelOther) || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            ) : (
              <>
                {/* Multi-Vendor Breakdown */}
                {isMultiVendor && (
                  <div className="p-4 bg-amber-500/5 space-y-3">
                    <p className="text-[10px] uppercase font-bold text-amber-500/70 mb-2">สรุปยอดแยกตามร้านค้า</p>
                    {vendorGroups.map((g, i) => (
                      <div key={i} className="bg-[#1a1a35]/50 p-3 rounded-lg border border-amber-500/10 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center text-[10px] font-bold">{i + 1}</span>
                            <span className="text-gray-200 font-bold">{g.vendorName || 'ยังไม่ระบุ'}</span>
                          </div>
                          <span className="text-amber-400 font-mono font-bold text-sm">฿{g.netTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] text-gray-400 pl-7">
                          <div>รวม: ฿{g.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                          <div>ยกเว้น: ฿{g.exemptedTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                          {hasVat && <div className="text-blue-400/60">VAT: ฿{g.vat.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>}
                          {hasWht && <div className="text-red-400/60">หัก: ฿{g.withholdingTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 1. จำนวนเงินรวมทั้งสิ้น */}
                {!isMultiVendor && mode !== 'activity' && (
                  <div className="flex justify-between items-center p-3 px-5">
                    <span className="text-gray-300 font-medium">จำนวนเงินรวมทั้งสิ้น</span>
                    <div className="w-32 text-right text-red-400 font-mono text-lg">
                      ฿{calculations.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                )}

                {/* 2. สินค้ายกเว้นภาษี (Yellow highlight) */}
                {!isMultiVendor && mode !== 'activity' && (
                  <div className="flex justify-between items-center p-3 px-5 bg-yellow-400/10">
                    <span className="text-yellow-200 font-medium">สินค้ายกเว้นภาษี</span>
                    <div className="w-32 text-right text-yellow-400 font-mono">
                      ฿{calculations.exemptedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                )}

                {/* 3. สินค้าไม่ยกเว้นภาษี */}
                {!isMultiVendor && mode !== 'activity' && (
                  <div className="flex justify-between items-center p-3 px-5">
                    <span className="text-gray-300 font-medium">สินค้าไม่ยกเว้นภาษี</span>
                    <div className="w-32 text-right text-red-400 font-mono">
                      ฿{calculations.taxableTotalIncVat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                )}

                {/* 4. บวกภาษีมูลค่าเพิ่ม */}
                {!isMultiVendor && mode !== 'activity' && (
                  <div className="flex justify-between items-center p-3 px-5">
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={hasVat} onChange={e => setHasVat(e.target.checked)}
                          className="rounded border-[#3a3a5c] bg-[#1a1a35] text-amber-500 focus:ring-amber-500/50"
                        />
                        บวกภาษีมูลค่าเพิ่ม
                      </label>
                      {hasVat && (
                        <div className="flex items-center gap-1">
                          <input 
                            type="number" step="0.1"
                            value={vatRate} onChange={e => setVatRate(Number(e.target.value))}
                            className="w-10 bg-[#1a1a35] border border-[#3a3a5c] rounded px-1 py-0.5 text-[10px] text-center text-gray-200 focus:outline-none focus:border-amber-400"
                          />
                          <span className="text-[10px] text-gray-400">%</span>
                        </div>
                      )}
                    </div>
                    <div className="w-32 text-right text-red-400 font-mono">
                      ฿{calculations.vat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                )}

                {/* 5. ราคาสินค้า (Yellow highlight) */}
                {!isMultiVendor && mode !== 'activity' && (
                  <div className="flex justify-between items-center p-3 px-5 bg-yellow-400/10">
                    <span className="text-yellow-200 font-medium">ราคาสินค้า (ไม่รวม VAT)</span>
                    <div className="w-32 text-right text-yellow-400 font-mono">
                      ฿{calculations.taxableTotalExclVat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                )}

                {/* WHT Section (Optional) */}
                {!isMultiVendor && mode !== 'activity' && (
                  <div className="flex justify-between items-center p-3 px-5 bg-blue-500/5">
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 text-gray-400 cursor-pointer text-xs">
                        <input 
                          type="checkbox" 
                          checked={hasWht} onChange={e => setHasWht(e.target.checked)}
                          className="rounded border-[#3a3a5c] bg-[#1a1a35] text-amber-500 focus:ring-amber-500/50"
                        />
                        หัก ณ ที่จ่าย
                      </label>
                      {hasWht && (
                        <div className="flex items-center gap-1">
                          <input 
                            type="number" step="0.1"
                            value={whtRate} onChange={e => setWhtRate(Number(e.target.value))}
                            className="w-10 bg-[#1a1a35] border border-[#3a3a5c] rounded px-1 py-0.5 text-[10px] text-center text-gray-200 focus:outline-none focus:border-amber-400"
                          />
                          <span className="text-[10px] text-gray-400">%</span>
                        </div>
                      )}
                    </div>
                    <div className="w-32 text-right text-red-400 font-mono text-sm">
                      ฿{calculations.wht.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {mode !== 'travel' && (
            <div className="p-4 bg-[#1a1a35] border-t border-[#2a2a4a] flex justify-between items-center">
              <span className="text-base font-bold text-amber-300">ยอดจ่ายสุทธิ</span>
              <span className="text-2xl font-bold font-mono text-amber-400">{calculations.netTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท</span>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4 pt-4">
          <button 
            type="button"
            onClick={() => {
              setDocNumber(''); setAdminGroup(''); setActivity(''); 
              setDate(new Date().toISOString().split('T')[0]);
              setTravelDestination(''); setTravelDate(''); setReturnTravelDate('');
              setTravelAllowance(''); setTravelFood(''); setTravelAccommodation(''); setTravelTransport(''); setTravelOther('');
              setItems([{ name: '', qty: 1, price: 0, total: 0, isExempted: false }]);
              setVendorGroups([{ 
                vendorName: '', vendorTaxId: '', vendorAddress: '', 
                items: [{ name: '', qty: 1, price: 0, total: 0, isExempted: false }], 
                subtotal: 0, exemptedTotal: 0, taxableTotal: 0, vat: 0, withholdingTax: 0, netTotal: 0 
              }]);
              setHasVat(false); setHasWht(false);
            }}
            className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-gray-200 hover:bg-[#2a2a4a] transition"
          >
            ล้างข้อมูล
          </button>
          <button 
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-400 hover:to-amber-500 shadow-lg shadow-amber-500/20 transition"
          >
            <Save className="w-4 h-4" /> บันทึกข้อมูล
          </button>
        </div>
      </form>

      {/* Add Vendor Modal */}
      {isVendorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1a1a35] w-full max-w-md rounded-2xl border border-[#2a2a4a] shadow-2xl overflow-hidden fade-up">
            <div className="bg-gradient-to-r from-[#1e3a5f] to-[#1a2744] p-4 flex justify-between items-center border-b border-[#2a4a6a]">
              <h3 className="text-lg font-bold text-amber-300 flex items-center gap-2">
                <Store className="w-5 h-5" /> เพิ่มร้านค้าใหม่
              </h3>
              <button onClick={() => setIsVendorModalOpen(false)} className="text-gray-400 hover:text-white transition">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddVendor} className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider font-bold">ชื่อร้านค้า/ผู้รับเงิน</label>
                <input 
                  type="text" required
                  value={vName} onChange={e => setVName(e.target.value)}
                  className="w-full bg-[#12122a] border border-[#3a3a5c] rounded-lg px-4 py-2 text-gray-100 focus:border-amber-400 focus:outline-none transition"
                  placeholder="เช่น บจก. ตัวอย่าง"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider font-bold">เลขประจำตัวผู้เสียภาษี</label>
                <input 
                  type="text" required
                  value={vTaxId} onChange={e => setVTaxId(e.target.value)}
                  className="w-full bg-[#12122a] border border-[#3a3a5c] rounded-lg px-4 py-2 text-gray-100 focus:border-amber-400 focus:outline-none transition"
                  placeholder="เลข 13 หลัก"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider font-bold">ที่อยู่</label>
                <textarea 
                  value={vAddress} onChange={e => setVAddress(e.target.value)}
                  className="w-full bg-[#12122a] border border-[#3a3a5c] rounded-lg px-4 py-2 text-gray-100 focus:border-amber-400 focus:outline-none transition"
                  placeholder="ที่อยู่ร้านค้า (ถ้ามี)"
                  rows={3}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  type="button" onClick={() => setIsVendorModalOpen(false)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-gray-200 hover:bg-[#2a2a4a] transition"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-amber-500 text-white hover:bg-amber-400 transition shadow-lg shadow-amber-500/20"
                >
                  บันทึกร้านค้า
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
