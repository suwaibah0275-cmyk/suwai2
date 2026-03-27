'use client';

import { useState, useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Search, Filter, Printer, Trash2, CheckCircle, Clock, FileCheck, Calculator, FileDown, Store } from 'lucide-react';
import { Disbursement } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import PrintModal from './PrintModal';
import WhtPrintModal from './WhtPrintModal';

export default function RecordsTab() {
  const { disbursements, updateDisbursementStatus, deleteDisbursement, currentUser, settings } = useAppContext();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBudget, setFilterBudget] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  const [printRecord, setPrintRecord] = useState<Disbursement | null>(null);
  const [isWhtPrintOpen, setIsWhtPrintOpen] = useState(false);
  const [selectedWhtVendor, setSelectedWhtVendor] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredRecords = useMemo(() => {
    return disbursements.filter(r => {
      const matchSearch = r.docNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.activity.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (r.adminGroup || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchBudget = filterBudget ? r.budgetType === filterBudget : true;
      const matchStatus = filterStatus ? r.status === filterStatus : true;
      
      return matchSearch && matchBudget && matchStatus;
    });
  }, [disbursements, searchTerm, filterBudget, filterStatus]);

  const vendorWhtSummary = useMemo(() => {
    const summary: Record<string, { name: string; address: string; amount: number }> = {};
    filteredRecords.forEach(r => {
      if (r.vendors && r.vendors.length > 0) {
        r.vendors.forEach(v => {
          if (v.withholdingTax > 0) {
            if (!summary[v.vendorName]) {
              summary[v.vendorName] = {
                name: v.vendorName,
                address: v.vendorAddress || '',
                amount: 0
              };
            }
            summary[v.vendorName].amount += v.withholdingTax;
          }
        });
      } else if (r.withholdingTax > 0) {
        if (!summary[r.vendorName]) {
          summary[r.vendorName] = {
            name: r.vendorName,
            address: r.vendorAddress || '',
            amount: 0
          };
        }
        summary[r.vendorName].amount += r.withholdingTax;
      }
    });
    return Object.values(summary).sort((a, b) => b.amount - a.amount);
  }, [filteredRecords]);

  const vendorNetSummary = useMemo(() => {
    const summary: Record<string, { name: string; address: string; amount: number }> = {};
    filteredRecords.forEach(r => {
      if (r.vendors && r.vendors.length > 0) {
        r.vendors.forEach(v => {
          if (!summary[v.vendorName]) {
            summary[v.vendorName] = {
              name: v.vendorName,
              address: v.vendorAddress || '',
              amount: 0
            };
          }
          summary[v.vendorName].amount += v.netTotal;
        });
      } else {
        if (!summary[r.vendorName]) {
          summary[r.vendorName] = {
            name: r.vendorName,
            address: r.vendorAddress || '',
            amount: 0
          };
        }
        summary[r.vendorName].amount += r.netTotal;
      }
    });
    return Object.values(summary).sort((a, b) => b.amount - a.amount);
  }, [filteredRecords]);

  const handleStatusChange = async (id: string, newStatus: Disbursement['status']) => {
    if (currentUser?.role === 'requester') {
      alert('คุณไม่มีสิทธิ์เปลี่ยนสถานะเอกสาร');
      return;
    }
    
    if (newStatus === 'อนุมัติแล้ว' && currentUser?.role !== 'admin') {
      alert('เฉพาะผู้อำนวยการเท่านั้นที่สามารถอนุมัติเอกสารได้');
      return;
    }

    try {
      await updateDisbursementStatus(id, newStatus);
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการเปลี่ยนสถานะ');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    if (currentUser?.role === 'requester') {
      alert('คุณไม่มีสิทธิ์ลบเอกสาร');
      setDeleteId(null);
      return;
    }

    try {
      await deleteDisbursement(deleteId);
      setDeleteId(null);
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการลบเอกสาร');
    }
  };

  return (
    <div className="space-y-4 fade-up">
      {/* Filters */}
      <div className="bg-[#1a1a35] p-4 rounded-xl border border-[#2a2a4a] flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            type="text" 
            placeholder="ค้นหาเลขที่เอกสาร, กิจกรรม, ร้านค้า..." 
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-[#12122a] border border-[#3a3a5c] rounded-lg pl-10 pr-4 py-2 text-sm text-gray-100 focus:border-amber-400 focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
          <select 
            value={filterBudget} onChange={e => setFilterBudget(e.target.value)}
            className="bg-[#12122a] border border-[#3a3a5c] rounded-lg px-3 py-2 text-sm text-gray-300 focus:border-amber-400 focus:outline-none"
          >
            <option value="">ทุกประเภทงบ</option>
            {settings.budgetTypes.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
          <select 
            value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="bg-[#12122a] border border-[#3a3a5c] rounded-lg px-3 py-2 text-sm text-gray-300 focus:border-amber-400 focus:outline-none"
          >
            <option value="">ทุกสถานะ</option>
            <option value="รอดำเนินการ">รอดำเนินการ</option>
            <option value="การเงินตรวจแล้ว">การเงินตรวจแล้ว</option>
            <option value="อนุมัติแล้ว">อนุมัติแล้ว</option>
          </select>
        </div>
      </div>

      {/* Vendor Summaries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* WHT Summary */}
        {vendorWhtSummary.length > 0 && (
          <div className="bg-[#1a1a35] p-4 rounded-xl border border-[#2a2a4a] fade-up">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-red-400 flex items-center gap-2">
                <Calculator className="w-4 h-4" /> สรุปภาษี หัก ณ ที่จ่าย
              </h3>
              <button 
                onClick={() => setIsWhtPrintOpen(true)}
                className="flex items-center gap-1.5 text-xs bg-red-500/10 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/20 transition border border-red-500/20"
              >
                <Printer className="w-3.5 h-3.5" /> พิมพ์สรุปภาษี
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {vendorWhtSummary.map((v) => (
                <div key={v.name} className="bg-[#12122a] p-3 rounded-lg border border-[#2a2a4a] flex justify-between items-center group">
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-xs text-gray-300 truncate font-bold" title={v.name}>{v.name}</span>
                    <span className="text-[10px] text-gray-500 truncate">{v.address || 'ไม่มีที่อยู่'}</span>
                  </div>
                  <div className="flex items-center gap-2 ml-2 shrink-0">
                    <span className="text-sm font-mono text-red-400 font-bold">
                      ฿{v.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          setSelectedWhtVendor(v.name);
                          setIsWhtPrintOpen(true);
                        }}
                        className="p-1.5 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 transition"
                        title="พิมพ์เฉพาะร้านนี้"
                      >
                        <Printer className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => setSearchTerm(v.name)}
                        className="p-1.5 bg-blue-500/10 text-blue-400 rounded hover:bg-blue-500/20 transition"
                        title="กรองดูรายการร้านนี้"
                      >
                        <Search className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Net Total Summary */}
        {vendorNetSummary.length > 0 && (
          <div className="bg-[#1a1a35] p-4 rounded-xl border border-[#2a2a4a] fade-up">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                <Store className="w-4 h-4" /> สรุปยอดจ่ายสุทธิ
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {vendorNetSummary.map((v) => (
                <div key={v.name} className="bg-[#12122a] p-3 rounded-lg border border-[#2a2a4a] flex justify-between items-center group">
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-xs text-gray-300 truncate font-bold" title={v.name}>{v.name}</span>
                    <span className="text-[10px] text-gray-500 truncate">{v.address || 'ไม่มีที่อยู่'}</span>
                  </div>
                  <div className="flex items-center gap-2 ml-2 shrink-0">
                    <span className="text-sm font-mono text-amber-300 font-bold">
                      ฿{v.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setSearchTerm(v.name)}
                        className="p-1.5 bg-blue-500/10 text-blue-400 rounded hover:bg-blue-500/20 transition"
                        title="กรองดูรายการร้านนี้"
                      >
                        <Search className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-[#1a1a35] rounded-xl border border-[#2a2a4a] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-[#12122a] text-xs uppercase text-gray-400 border-b border-[#2a2a4a]">
              <tr>
                <th className="px-4 py-3 font-medium">เลขที่/วันที่</th>
                <th className="px-4 py-3 font-medium">กิจกรรม/ร้านค้า</th>
                <th className="px-4 py-3 font-medium">ประเภทงบ</th>
                <th className="px-4 py-3 font-medium text-right">หัก ณ ที่จ่าย</th>
                <th className="px-4 py-3 font-medium text-right">ยอดสุทธิ</th>
                <th className="px-4 py-3 font-medium text-center">สถานะ</th>
                <th className="px-4 py-3 font-medium text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a4a]">
              {filteredRecords.map(r => (
                <tr key={r.id} className="hover:bg-[#1f1f3d] transition">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-200">{r.docNumber}</p>
                    <p className="text-xs text-gray-500">{formatDate(r.date, 'short')}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-200 truncate max-w-[200px]" title={r.activity}>
                      {r.mode === 'travel' && <span className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20 mr-1">เดินทาง</span>}
                      {r.mode === 'activity' && <span className="text-[10px] bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded border border-purple-500/20 mr-1">กิจกรรม</span>}
                      {r.mode === 'purchase' && <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 mr-1">จัดซื้อ</span>}
                      {r.activity}
                    </p>
                    {r.mode === 'travel' ? (
                      <p className="text-xs text-gray-500">
                        กลับ: {r.returnTravelDate ? formatDate(r.returnTravelDate, 'short') : '-'}
                      </p>
                    ) : r.vendors && r.vendors.length > 0 ? (
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[10px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20">หลายร้านค้า ({r.vendors.length})</span>
                        <p className="text-xs text-gray-500 truncate max-w-[120px]" title={r.vendors.map(v => v.vendorName).join(', ')}>{r.vendors.map(v => v.vendorName).join(', ')}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 truncate max-w-[200px]" title={r.vendorName}>{r.vendorName}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    <p>{r.budgetType}</p>
                    {r.adminGroup && <p className="text-[10px] text-amber-500/70 mt-0.5">{r.adminGroup}</p>}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-red-400/80 text-xs">
                    {r.withholdingTax > 0 ? `฿${r.withholdingTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-amber-300 font-medium">
                    ฿{r.netTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-[10px] px-2 py-1 rounded-full inline-flex items-center gap-1
                      ${r.status === 'อนุมัติแล้ว' ? 'bg-emerald-500/20 text-emerald-400' : 
                        r.status === 'การเงินตรวจแล้ว' ? 'bg-blue-500/20 text-blue-400' : 
                        'bg-amber-500/20 text-amber-400'}`}
                    >
                      {r.status === 'อนุมัติแล้ว' && <CheckCircle className="w-3 h-3" />}
                      {r.status === 'การเงินตรวจแล้ว' && <FileCheck className="w-3 h-3" />}
                      {r.status === 'รอดำเนินการ' && <Clock className="w-3 h-3" />}
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      {/* Status Actions */}
                      {r.status === 'รอดำเนินการ' && currentUser?.role !== 'requester' && (
                        <button 
                          onClick={() => handleStatusChange(r.id!, 'การเงินตรวจแล้ว')}
                          className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg transition" title="การเงินตรวจแล้ว"
                        >
                          <FileCheck className="w-4 h-4" />
                        </button>
                      )}
                      {r.status === 'การเงินตรวจแล้ว' && currentUser?.role === 'admin' && (
                        <button 
                          onClick={() => handleStatusChange(r.id!, 'อนุมัติแล้ว')}
                          className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition" title="อนุมัติ"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      
                      <button 
                        onClick={() => setPrintRecord(r)}
                        className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-[#2a2a4a] rounded-lg transition" title="พิมพ์เอกสาร"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      
                      {currentUser?.role !== 'requester' && (
                        <button 
                          onClick={() => setDeleteId(r.id!)}
                          className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition" title="ลบ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    ไม่พบรายการเบิกจ่ายที่ตรงกับเงื่อนไข
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1a1a35] rounded-xl p-6 max-w-sm w-full border border-[#2a2a4a] shadow-2xl fade-up">
            <h3 className="text-lg font-bold text-gray-100 mb-2">ยืนยันการลบ</h3>
            <p className="text-sm text-gray-400 mb-6">คุณแน่ใจหรือไม่ที่จะลบรายการเบิกจ่ายนี้? การกระทำนี้ไม่สามารถย้อนกลับได้</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:bg-[#2a2a4a] rounded-lg transition"
              >
                ยกเลิก
              </button>
              <button 
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition"
              >
                ยืนยันการลบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Modal */}
      {printRecord && (
        <PrintModal record={printRecord} onClose={() => setPrintRecord(null)} />
      )}

      {/* WHT Print Modal */}
      {isWhtPrintOpen && (
        <WhtPrintModal 
          summary={vendorWhtSummary} 
          settings={settings} 
          onClose={() => {
            setIsWhtPrintOpen(false);
            setSelectedWhtVendor(null);
          }} 
          selectedVendor={selectedWhtVendor}
        />
      )}
    </div>
  );
}
