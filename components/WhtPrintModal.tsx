'use client';

import React from 'react';
import { Printer, X } from 'lucide-react';
import { SystemSettings } from '@/lib/types';
import { formatDate } from '@/lib/utils';

interface WhtPrintModalProps {
  summary: { name: string; address: string; amount: number }[];
  settings: SystemSettings;
  onClose: () => void;
  selectedVendor?: string | null;
}

export default function WhtPrintModal({ summary, settings, onClose, selectedVendor }: WhtPrintModalProps) {
  const handlePrint = () => {
    window.print();
  };

  const filteredSummary = selectedVendor 
    ? summary.filter(v => v.name === selectedVendor)
    : summary;

  const totalWht = filteredSummary.reduce((sum, v) => sum + v.amount, 0);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 print:p-0 print:bg-white print:static print:block">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:rounded-none print:w-full">
        {/* Header - Hidden in Print */}
        <div className="bg-gray-100 p-4 border-b flex justify-between items-center print:hidden">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Printer className="w-5 h-5" /> ตัวอย่างก่อนพิมพ์: สรุปภาษี หัก ณ ที่จ่าย {selectedVendor ? `(${selectedVendor})` : ''}
          </h3>
          <div className="flex gap-2">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-lg"
            >
              <Printer className="w-4 h-4" /> สั่งพิมพ์
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-gray-500 hover:bg-gray-200 rounded-lg transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Print Content */}
        <div className="flex-1 overflow-auto p-10 bg-white text-black font-serif print:overflow-visible print:p-0">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">{settings.schoolName}</h1>
            <p className="text-sm text-gray-600 mb-4">{settings.schoolAddress}</p>
            <h2 className="text-xl font-bold border-b-2 border-black pb-2 inline-block">
              รายงานสรุปภาษี หัก ณ ที่จ่าย {selectedVendor ? `เฉพาะร้าน ${selectedVendor}` : ''}
            </h2>
            <p className="text-sm mt-2">ข้อมูล ณ วันที่ {formatDate(new Date().toISOString(), 'long')}</p>
          </div>

          <table className="w-full border-collapse border border-black text-sm mb-8">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black px-4 py-2 text-center w-12">ลำดับ</th>
                <th className="border border-black px-4 py-2 text-left">ชื่อร้านค้า/ผู้รับเงิน</th>
                <th className="border border-black px-4 py-2 text-left">ที่อยู่ร้านค้า</th>
                <th className="border border-black px-4 py-2 text-right w-32">จำนวนภาษี (บาท)</th>
              </tr>
            </thead>
            <tbody>
              {filteredSummary.map((v, index) => (
                <tr key={v.name}>
                  <td className="border border-black px-4 py-2 text-center">{index + 1}</td>
                  <td className="border border-black px-4 py-2 text-left font-bold">{v.name}</td>
                  <td className="border border-black px-4 py-2 text-left text-xs">{v.address || '-'}</td>
                  <td className="border border-black px-4 py-2 text-right font-mono">
                    {v.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 font-bold">
                <td colSpan={3} className="border border-black px-4 py-3 text-right">รวมภาษี หัก ณ ที่จ่าย ทั้งสิ้น</td>
                <td className="border border-black px-4 py-3 text-right font-mono text-lg">
                  {totalWht.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>

          <div className="mt-16 grid grid-cols-2 gap-20">
            <div className="text-center">
              <p className="mb-12">ลงชื่อ...........................................................</p>
              <p>(...........................................................)</p>
              <p className="text-sm mt-1">เจ้าหน้าที่พัสดุ/การเงิน</p>
            </div>
            <div className="text-center">
              <p className="mb-12">ลงชื่อ...........................................................</p>
              <p>(...........................................................)</p>
              <p className="text-sm mt-1 font-bold">ผู้อำนวยการ{settings.schoolName}</p>
            </div>
          </div>

          <div className="mt-20 text-[10px] text-gray-400 text-right print:mt-10">
            พิมพ์โดยระบบ {settings.systemName}
          </div>
        </div>
      </div>
    </div>
  );
}
