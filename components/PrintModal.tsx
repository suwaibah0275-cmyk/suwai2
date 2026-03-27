'use client';

import React from 'react';
import { Disbursement } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { X, Printer } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

interface PrintModalProps {
  record: Disbursement;
  onClose: () => void;
}

// Helper to convert number to Thai text
function numberToThaiText(num: number): string {
  if (num === 0) return 'ศูนย์บาทถ้วน';
  
  const thaiNumbers = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
  const thaiPositions = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];
  
  let result = '';
  const parts = num.toFixed(2).split('.');
  const baht = parts[0];
  const satang = parts[1];
  
  const processNumber = (str: string) => {
    let res = '';
    const len = str.length;
    for (let i = 0; i < len; i++) {
      const digit = parseInt(str[i]);
      const pos = len - i - 1;
      
      if (digit === 0) continue;
      
      if (pos === 0 && digit === 1 && len > 1 && str[i-1] !== '0') {
        res += 'เอ็ด';
      } else if (pos === 1 && digit === 1) {
        res += 'สิบ';
      } else if (pos === 1 && digit === 2) {
        res += 'ยี่สิบ';
      } else {
        res += thaiNumbers[digit] + thaiPositions[pos];
      }
    }
    return res;
  };
  
  if (parseInt(baht) > 0) {
    result += processNumber(baht) + 'บาท';
  }
  
  if (parseInt(satang) > 0) {
    result += processNumber(satang) + 'สตางค์';
  } else {
    result += 'ถ้วน';
  }
  
  return result;
}

export default function PrintModal({ record, onClose }: PrintModalProps) {
  const { settings } = useAppContext();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 print:p-0 print:bg-white">
      {/* Modal Container */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto print:max-h-none print:shadow-none print:rounded-none print:w-full print:h-full flex flex-col fade-up">
        
        {/* Header Actions (Hidden in print) */}
        <div className="sticky top-0 bg-gray-100 border-b border-gray-200 p-4 flex justify-between items-center print:hidden z-10">
          <h3 className="text-lg font-bold text-gray-800">ตัวอย่างก่อนพิมพ์</h3>
          <div className="flex gap-3">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
            >
              <Printer className="w-4 h-4" /> พิมพ์เอกสาร
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-gray-500 hover:bg-gray-200 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Content */}
        <div className="p-8 md:p-12 text-black bg-white print-content">
          {/* Document Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">รายงานผลการตรวจรับและขออนุมัติจ่ายเงิน</h1>
            <p className="text-lg">{settings.schoolName}</p>
            {settings.schoolAddress && <p className="text-sm text-gray-600 mt-1">{settings.schoolAddress}</p>}
          </div>

          {/* Document Info */}
          <div className="flex justify-between mb-6 text-sm">
            <div>
              <p><span className="font-bold">เลขที่เอกสาร:</span> {record.docNumber}</p>
              <p className="mt-1"><span className="font-bold">ผู้เบิก:</span> {record.requester}</p>
              <p className="mt-1"><span className="font-bold">กลุ่มงานบริหาร:</span> {record.adminGroup || '-'}</p>
              <p className="mt-1"><span className="font-bold">ประเภทงบ:</span> {record.budgetType}</p>
              {record.mode === 'travel' && (
                <>
                  <p className="mt-1"><span className="font-bold">สถานที่เดินทาง:</span> {record.travelDestination || '-'}</p>
                  <p className="mt-1"><span className="font-bold">วันที่เดินทางไป:</span> {record.travelDate ? formatDate(record.travelDate, 'long') : '-'}</p>
                  <p className="mt-1"><span className="font-bold">วันที่เดินทางกลับ:</span> {record.returnTravelDate ? formatDate(record.returnTravelDate, 'long') : '-'}</p>
                </>
              )}
            </div>
            <div className="text-right">
              <p><span className="font-bold">วันที่:</span> {formatDate(record.date, 'long')}</p>
              <p className="mt-1"><span className="font-bold">กิจกรรม/โครงการ:</span> {record.activity}</p>
              {record.mode === 'activity' && record.activityPurpose && (
                <p className="mt-1"><span className="font-bold">เพื่อ:</span> {record.activityPurpose}</p>
              )}
              {record.participants && (
                <p className="mt-1">
                  <span className="font-bold">
                    {record.mode === 'travel' ? 'เข้าร่วม:' : 'เข้าร่วม (จำนวน/คน):'}
                  </span> {record.participants}
                </p>
              )}
              {record.vendors && record.vendors.length > 0 ? (
                <p className="mt-1"><span className="font-bold">จ่ายให้:</span> ร้านค้าจำนวน {record.vendors.length} ราย (ตามรายละเอียด)</p>
              ) : record.mode === 'travel' ? (
                <p className="mt-1"><span className="font-bold">ผู้รับเงิน:</span> {record.requester}</p>
              ) : (
                <>
                  <p className="mt-1"><span className="font-bold">จ่ายให้:</span> {record.vendorName}</p>
                  {record.vendorAddress && <p className="mt-1"><span className="font-bold">ที่อยู่:</span> {record.vendorAddress}</p>}
                  <p className="mt-1"><span className="font-bold">เลขผู้เสียภาษี:</span> {record.vendorTaxId}</p>
                </>
              )}
            </div>
          </div>

          {/* Items Table */}
          <p className="text-sm mb-2">รายละเอียดดังนี้</p>
          <table className="w-full border-collapse border border-gray-800 text-sm mb-6">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-800 p-2 w-12 text-center">ลำดับ</th>
                <th className="border border-gray-800 p-2 text-left">รายการ/ร้านค้า</th>
                <th className="border border-gray-800 p-2 w-24 text-center">จำนวน</th>
                <th className="border border-gray-800 p-2 w-32 text-right">ราคา/หน่วย</th>
                <th className="border border-gray-800 p-2 w-32 text-right">จำนวนเงิน</th>
              </tr>
            </thead>
            <tbody>
              {record.vendors && record.vendors.length > 0 ? (
                record.vendors.map((vendor, vIndex) => (
                  <React.Fragment key={vIndex}>
                    <tr className="bg-gray-50 font-bold">
                      <td className="border border-gray-800 p-2 text-center">{vIndex + 1}</td>
                      <td colSpan={4} className="border border-gray-800 p-2">
                        ร้าน: {vendor.vendorName} (เลขผู้เสียภาษี: {vendor.vendorTaxId})
                      </td>
                    </tr>
                    {vendor.items.map((item, iIndex) => (
                      <tr key={`${vIndex}-${iIndex}`}>
                        <td className="border border-gray-800 p-2 text-center text-gray-400">{vIndex + 1}.{iIndex + 1}</td>
                        <td className="border border-gray-800 p-2 pl-6">
                          {item.name}
                          {item.isExempted && <span className="text-[10px] ml-1 text-gray-500 font-normal">(ยกเว้นภาษี)</span>}
                        </td>
                        <td className="border border-gray-800 p-2 text-center">{item.qty}</td>
                        <td className="border border-gray-800 p-2 text-right">{item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="border border-gray-800 p-2 text-right">{item.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                    <tr className="text-[10px] italic text-gray-600">
                      <td colSpan={4} className="border border-gray-800 p-1 text-right">รวมร้าน {vendor.vendorName} (หักภาษี {vendor.withholdingTax.toLocaleString()} บาท)</td>
                      <td className="border border-gray-800 p-1 text-right font-bold">{vendor.netTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    </tr>
                  </React.Fragment>
                ))
              ) : (
                record.items.map((item, index) => (
                  <tr key={index}>
                    <td className="border border-gray-800 p-2 text-center">{index + 1}</td>
                    <td className="border border-gray-800 p-2">
                      {item.name}
                      {item.isExempted && <span className="text-[10px] ml-1 text-gray-500 font-normal">(ยกเว้นภาษี)</span>}
                    </td>
                    <td className="border border-gray-800 p-2 text-center">{item.qty}</td>
                    <td className="border border-gray-800 p-2 text-right">{item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="border border-gray-800 p-2 text-right">{item.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))
              )}
              
              {/* Empty rows for padding if needed (only for single vendor) */}
              {!record.vendors && Array.from({ length: Math.max(0, 5 - record.items.length) }).map((_, i) => (
                <tr key={`empty-${i}`}>
                  <td className="border border-gray-800 p-2 text-center text-transparent">-</td>
                  <td className="border border-gray-800 p-2"></td>
                  <td className="border border-gray-800 p-2"></td>
                  <td className="border border-gray-800 p-2"></td>
                  <td className="border border-gray-800 p-2"></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              {record.mode === 'travel' ? (
                <>
                  <tr>
                    <td colSpan={3} rowSpan={6} className="border border-gray-800 p-2 align-top">
                      <span className="font-bold">ตัวอักษร:</span> <br/>
                      <span className="italic">({numberToThaiText(record.netTotal)})</span>
                    </td>
                    <td className="border border-gray-800 p-2 text-right text-xs">ค่าเบี้ยเลี้ยง</td>
                    <td className="border border-gray-800 p-2 text-right text-xs">{(record.items.find(i => i.name === 'ค่าเบี้ยเลี้ยง')?.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-800 p-2 text-right text-xs">ค่าอาหาร</td>
                    <td className="border border-gray-800 p-2 text-right text-xs">{(record.items.find(i => i.name === 'ค่าอาหาร')?.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-800 p-2 text-right text-xs">ค่าเช่าที่พัก</td>
                    <td className="border border-gray-800 p-2 text-right text-xs">{(record.items.find(i => i.name === 'ค่าเช่าที่พัก')?.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-800 p-2 text-right text-xs">ค่าพาหนะ</td>
                    <td className="border border-gray-800 p-2 text-right text-xs">{(record.items.find(i => i.name === 'ค่าพาหนะ')?.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-800 p-2 text-right text-xs">ค่าใช้จ่ายอื่นๆ</td>
                    <td className="border border-gray-800 p-2 text-right text-xs">{(record.items.find(i => i.name === 'ค่าใช้จ่ายอื่นๆ')?.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-800 p-2 text-right font-bold bg-gray-100">ยอดจ่ายสุทธิ</td>
                    <td className="border border-gray-800 p-2 text-right font-bold bg-gray-100 underline decoration-double">
                      {record.netTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </>
              ) : record.mode === 'activity' ? (
                <tr>
                  <td colSpan={3} className="border border-gray-800 p-2 align-top">
                    <span className="font-bold">ตัวอักษร:</span> <br/>
                    <span className="italic">({numberToThaiText(record.netTotal)})</span>
                  </td>
                  <td className="border border-gray-800 p-2 text-right font-bold bg-gray-100">ยอดจ่ายสุทธิ</td>
                  <td className="border border-gray-800 p-2 text-right font-bold bg-gray-100 underline decoration-double">
                    {record.netTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ) : (
                <>
                  <tr>
                    <td colSpan={3} rowSpan={7} className="border border-gray-800 p-2 align-top">
                      <span className="font-bold">ตัวอักษร:</span> <br/>
                      <span className="italic">({numberToThaiText(record.netTotal)})</span>
                    </td>
                    <td className="border border-gray-800 p-2 text-right font-bold">จำนวนเงินรวมทั้งสิ้น</td>
                    <td className="border border-gray-800 p-2 text-right">{record.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-800 p-2 text-right text-xs">สินค้ายกเว้นภาษี</td>
                    <td className="border border-gray-800 p-2 text-right text-xs">{(record.exemptedTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-800 p-2 text-right text-xs">สินค้าไม่ยกเว้นภาษี</td>
                    <td className="border border-gray-800 p-2 text-right text-xs">{(record.taxableTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-800 p-2 text-right text-xs">บวกภาษีมูลค่าเพิ่ม</td>
                    <td className="border border-gray-800 p-2 text-right text-xs">{record.vat.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-800 p-2 text-right text-xs">ราคาสินค้า</td>
                    <td className="border border-gray-800 p-2 text-right text-xs">{((record.taxableTotal || 0) - record.vat).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-800 p-2 text-right text-xs">หัก ณ ที่จ่าย</td>
                    <td className="border border-gray-800 p-2 text-right text-xs">{(record.withholdingTax || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-800 p-2 text-right font-bold bg-gray-100">ยอดจ่ายสุทธิ</td>
                    <td className="border border-gray-800 p-2 text-right font-bold bg-gray-100 underline decoration-double">
                      {record.netTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </>
              )}
            </tfoot>
          </table>

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-8 mt-16 text-center text-sm">
            <div>
              <p className="mb-12">ลงชื่อ.......................................................</p>
              <p>({record.requester})</p>
              <p className="mt-1">ผู้เบิก</p>
            </div>
            <div>
              <p className="mb-12">ลงชื่อ.......................................................</p>
              <p>(.......................................................)</p>
              <p className="mt-1">เจ้าหน้าที่การเงิน</p>
            </div>
            <div>
              <p className="mb-12">ลงชื่อ.......................................................</p>
              <p>(.......................................................)</p>
              <p className="mt-1">ผู้อำนวยการ{settings.schoolName}</p>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
