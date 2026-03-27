'use client';

import { useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import { FileText, CheckCircle, Clock } from 'lucide-react';

export default function DashboardTab() {
  const { disbursements, settings } = useAppContext();

  const stats = useMemo(() => {
    const types: Record<string, { total: number, count: number, colorMap: any }> = {};
    const adminGroups: Record<string, { total: number, count: number }> = {};
    const monthly: Record<string, number> = {};
    const colorMaps = [
      { from: 'from-[#1e3a5f]', to: 'to-[#1a2744]', border: 'border-[#2a4a6a]', text: 'text-blue-100', textMuted: 'text-blue-300', hex: '#3b82f6' },
      { from: 'from-[#3a1e5f]', to: 'to-[#2a1744]', border: 'border-[#4a2a6a]', text: 'text-purple-100', textMuted: 'text-purple-300', hex: '#a855f7' },
      { from: 'from-[#1e5f3a]', to: 'to-[#1a4427]', border: 'border-[#2a6a4a]', text: 'text-emerald-100', textMuted: 'text-emerald-300', hex: '#10b981' },
      { from: 'from-[#5f3a1e]', to: 'to-[#443a1a]', border: 'border-[#6a4a2a]', text: 'text-amber-100', textMuted: 'text-amber-300', hex: '#f59e0b' },
      { from: 'from-[#5f1e1e]', to: 'to-[#441a1a]', border: 'border-[#6a2a2a]', text: 'text-red-100', textMuted: 'text-red-300', hex: '#ef4444' },
      { from: 'from-[#1e5f5f]', to: 'to-[#1a4444]', border: 'border-[#2a6a6a]', text: 'text-teal-100', textMuted: 'text-teal-300', hex: '#14b8a6' },
      { from: 'from-[#5f1e4a]', to: 'to-[#441a35]', border: 'border-[#6a2a52]', text: 'text-pink-100', textMuted: 'text-pink-300', hex: '#ec4899' },
    ];

    settings.budgetTypes.forEach((bt, idx) => {
      types[bt] = { total: 0, count: 0, colorMap: colorMaps[idx % colorMaps.length] };
    });

    disbursements.forEach(r => {
      // Budget Type Stats
      if (types[r.budgetType]) {
        types[r.budgetType].total += (r.netTotal || 0);
        types[r.budgetType].count++;
      } else {
        if (!types['อื่นๆ']) {
          types['อื่นๆ'] = { total: 0, count: 0, colorMap: { from: 'from-[#3a3a3a]', to: 'to-[#2a2a2a]', border: 'border-[#4a4a4a]', text: 'text-gray-100', textMuted: 'text-gray-300', hex: '#6b7280' } };
        }
        types['อื่นๆ'].total += (r.netTotal || 0);
        types['อื่นๆ'].count++;
      }

      // Admin Group Stats
      const group = r.adminGroup || 'ไม่ระบุ';
      if (!adminGroups[group]) {
        adminGroups[group] = { total: 0, count: 0 };
      }
      adminGroups[group].total += (r.netTotal || 0);
      adminGroups[group].count++;

      // Monthly Stats
      if (r.createdAt) {
        try {
          const date = new Date(r.createdAt);
          if (!isNaN(date.getTime())) {
            const monthKey = new Intl.DateTimeFormat('th-TH', { month: 'short', year: '2-digit' }).format(date);
            monthly[monthKey] = (monthly[monthKey] || 0) + (r.netTotal || 0);
          }
        } catch (e) {
          // ignore invalid dates
        }
      }
    });

    return { types, adminGroups, monthly };
  }, [disbursements, settings.budgetTypes]);

  const chartData = useMemo(() => {
    return Object.entries(stats.types)
      .filter(([_, data]) => data.total > 0)
      .map(([name, data]) => ({
        name,
        value: data.total,
        color: data.colorMap.hex
      }));
  }, [stats.types]);

  const adminGroupChartData = useMemo(() => {
    return Object.entries(stats.adminGroups)
      .map(([name, data]) => ({
        name,
        total: data.total
      }))
      .sort((a, b) => b.total - a.total);
  }, [stats.adminGroups]);

  const monthlyChartData = useMemo(() => {
    return Object.entries(stats.monthly)
      .map(([name, total]) => ({
        name,
        total
      }));
  }, [stats.monthly]);

  const totalAmount = disbursements.reduce((sum, r) => sum + (r.netTotal || 0), 0);
  const pendingCount = disbursements.filter(r => r.status === 'รอดำเนินการ').length;
  const approvedCount = disbursements.filter(r => r.status === 'อนุมัติแล้ว').length;

  return (
    <div className="space-y-6 fade-up">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1a1a35] rounded-xl p-5 border border-[#2a2a4a] flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
            <FileText className="text-blue-400 w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400">ยอดเบิกจ่ายรวมทั้งหมด</p>
            <p className="text-2xl font-bold text-gray-100">฿{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-xs text-gray-500 mt-1">{disbursements.length} รายการ</p>
          </div>
        </div>
        <div className="bg-[#1a1a35] rounded-xl p-5 border border-[#2a2a4a] flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
            <Clock className="text-amber-400 w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400">รอดำเนินการ</p>
            <p className="text-2xl font-bold text-gray-100">{pendingCount}</p>
            <p className="text-xs text-gray-500 mt-1">รายการ</p>
          </div>
        </div>
        <div className="bg-[#1a1a35] rounded-xl p-5 border border-[#2a2a4a] flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle className="text-emerald-400 w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400">อนุมัติแล้ว</p>
            <p className="text-2xl font-bold text-gray-100">{approvedCount}</p>
            <p className="text-xs text-gray-500 mt-1">รายการ</p>
          </div>
        </div>
      </div>

      {/* Budget Type Cards */}
      <h2 className="text-lg font-bold text-amber-300 mt-8 mb-4">สรุปตามประเภทงบประมาณ</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(stats.types).map(([label, data]) => (
          <div key={label} className={`bg-gradient-to-br ${data.colorMap.from} ${data.colorMap.to} rounded-xl p-4 border ${data.colorMap.border}`}>
            <p className={`text-xs ${data.colorMap.textMuted} mb-1 truncate`} title={label}>{label}</p>
            <p className={`text-xl font-bold ${data.colorMap.text}`}>฿{data.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className={`text-xs ${data.colorMap.textMuted} mt-2 opacity-80`}>{data.count} รายการ</p>
          </div>
        ))}
      </div>

      {/* Admin Group Summary */}
      <h2 className="text-lg font-bold text-blue-300 mt-8 mb-4">สรุปตามกลุ่มงานบริหาร</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(stats.adminGroups).map(([label, data]) => (
          <div key={label} className="bg-[#1a1a35] rounded-xl p-4 border border-[#2a2a4a]">
            <p className="text-xs text-gray-400 mb-1 truncate" title={label}>{label}</p>
            <p className="text-xl font-bold text-gray-100">฿{data.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-xs text-gray-500 mt-2 opacity-80">{data.count} รายการ</p>
          </div>
        ))}
      </div>

      {/* Charts & Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-[#1a1a35] rounded-xl p-5 border border-[#2a2a4a]">
          <h3 className="text-sm font-bold text-gray-300 mb-4">แนวโน้มการเบิกจ่าย (รายเดือน)</h3>
          <div className="h-64">
            {monthlyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4a" vertical={false} />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis 
                    stroke="#9ca3af" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `฿${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`฿${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 'ยอดเบิกจ่าย']}
                    contentStyle={{ backgroundColor: '#1a1a35', borderColor: '#2a2a4a', color: '#fff', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#1a1a35' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 text-sm">ไม่มีข้อมูล</div>
            )}
          </div>
        </div>

        <div className="bg-[#1a1a35] rounded-xl p-5 border border-[#2a2a4a]">
          <h3 className="text-sm font-bold text-gray-300 mb-4">การเบิกจ่ายตามกลุ่มงานบริหาร</h3>
          <div className="h-64">
            {adminGroupChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={adminGroupChartData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4a" horizontal={false} />
                  <XAxis type="number" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `฿${(value / 1000).toFixed(0)}k`} />
                  <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} width={80} />
                  <Tooltip 
                    formatter={(value: number) => [`฿${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 'ยอดเบิกจ่าย']}
                    contentStyle={{ backgroundColor: '#1a1a35', borderColor: '#2a2a4a', color: '#fff', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                    cursor={{ fill: '#2a2a4a' }}
                  />
                  <Bar dataKey="total" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 text-sm">ไม่มีข้อมูล</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-[#1a1a35] rounded-xl p-5 border border-[#2a2a4a]">
          <h3 className="text-sm font-bold text-gray-300 mb-4">สัดส่วนการเบิกจ่าย</h3>
          <div className="h-64">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0.2)" />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => `฿${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                    contentStyle={{ backgroundColor: '#1a1a35', borderColor: '#2a2a4a', color: '#fff', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 text-sm">ไม่มีข้อมูล</div>
            )}
          </div>
        </div>

        <div className="bg-[#1a1a35] rounded-xl p-5 border border-[#2a2a4a]">
          <h3 className="text-sm font-bold text-gray-300 mb-4">รายการล่าสุด</h3>
          <div className="space-y-3">
            {disbursements.slice(0, 5).map(r => (
              <div key={r.id} className="flex justify-between items-center p-3 bg-[#12122a] rounded-lg border border-[#2a2a4a]">
                <div>
                  <p className="text-sm text-gray-200 font-medium">{r.docNumber}</p>
                  <p className="text-xs text-gray-500 truncate max-w-[200px]">{r.activity}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-amber-300">฿{r.netTotal.toLocaleString()}</p>
                  <p className={`text-[10px] px-2 py-0.5 rounded-full inline-block mt-1
                    ${r.status === 'อนุมัติแล้ว' ? 'bg-emerald-500/20 text-emerald-400' : 
                      r.status === 'การเงินตรวจแล้ว' ? 'bg-blue-500/20 text-blue-400' : 
                      'bg-amber-500/20 text-amber-400'}`}
                  >
                    {r.status}
                  </p>
                </div>
              </div>
            ))}
            {disbursements.length === 0 && (
              <div className="text-center text-gray-500 text-sm py-8">ยังไม่มีรายการเบิกจ่าย</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
