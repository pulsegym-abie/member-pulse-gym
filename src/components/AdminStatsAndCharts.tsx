import React, { useState, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Legend, BarChart, Bar 
} from 'recharts';
import { 
  Calendar, DollarSign, ArrowUpRight, ArrowDownRight, Plus, Trash2, 
  Sparkles, ListCollapse, TrendingUp, Filter, AlertCircle, ShoppingBag, 
  Tv, Clipboard, Users
} from 'lucide-react';
import { GymRegistration, Expense, DateRange } from '../types';
import { MEMBERSHIP_PACKAGES } from '../data';

interface AdminStatsAndChartsProps {
  registrations: GymRegistration[];
  expenses: Expense[];
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onDeleteExpense: (id: string) => void;
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
}

export default function AdminStatsAndCharts({
  registrations,
  expenses,
  onAddExpense,
  onDeleteExpense,
  dateRange,
  setDateRange
}: AdminStatsAndChartsProps) {
  // Local state for Expense Form
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Utilities');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [expenseError, setExpenseError] = useState('');

  // Preset Ranges
  const handlePreset = (preset: 'all' | 'this_month' | 'last_30' | 'this_week') => {
    const today = new Date();
    let start = new Date();
    const endStr = today.toISOString().split('T')[0];

    switch (preset) {
      case 'all':
        // Safe far date (e.g. 2 months ago)
        start.setMonth(today.getMonth() - 6);
        break;
      case 'this_month':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'last_30':
        start.setDate(today.getDate() - 30);
        break;
      case 'this_week':
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Monday
        start = new Date(today.setDate(diff));
        break;
    }

    setDateRange({
      startDate: start.toISOString().split('T')[0],
      endDate: endStr
    });
  };

  // Filtered registrations in Selected Range
  const filteredRegs = useMemo(() => {
    return registrations.filter(r => {
      const regDate = r.registrationDate;
      return regDate >= dateRange.startDate && regDate <= dateRange.endDate;
    });
  }, [registrations, dateRange]);

  // Filtered expenses in Selected Range
  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      return e.date >= dateRange.startDate && e.date <= dateRange.endDate;
    });
  }, [expenses, dateRange]);

  // DYNAMIC STATS WITHIN RANGE
  const stats = useMemo(() => {
    // Total income: sum of package prices of members registered within range
    const income = filteredRegs.reduce((sum, r) => {
      const pkg = MEMBERSHIP_PACKAGES.find(p => p.id === r.packageId);
      return sum + (pkg?.price || 0);
    }, 0);

    // Total expense
    const expenseSum = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Active members in this range
    // A member is considered "active" in the range if they registered before or during the end date, 
    // AND their expiration date is after or on the start date, with status 'Active'.
    const activeCount = registrations.filter(r => {
      return r.status === 'Active' && 
             r.registrationDate <= dateRange.endDate && 
             r.expirationDate >= dateRange.startDate;
    }).length;

    return {
      income,
      expenses: expenseSum,
      profit: income - expenseSum,
      activeMembers: activeCount
    };
  }, [registrations, filteredRegs, filteredExpenses, dateRange]);

  // GENERATE CHART DATA
  // We want to create daily data points from startDate to endDate
  const chartData = useMemo(() => {
    const data: Array<{
      dateStr: string;
      displayDate: string;
      pemasukan: number;
      pengeluaran: number;
      members: number;
    }> = [];

    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    
    // Limit safety (max 180 days to prevent browser hanging)
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    
    // If range is too large, let's group by Month instead of Day
    const useMonthlyGrouping = diffDays > 45;

    if (useMonthlyGrouping) {
      // Group by Year-Month
      const monthlyMap: Record<string, { pemasukan: number; pengeluaran: number; members: number }> = {};
      
      // Populate months in range
      const runner = new Date(start.getFullYear(), start.getMonth(), 1);
      while (runner <= end) {
        const monthKey = `${runner.getFullYear()}-${String(runner.getMonth() + 1).padStart(2, '0')}`;
        monthlyMap[monthKey] = { pemasukan: 0, pengeluaran: 0, members: 0 };
        runner.setMonth(runner.getMonth() + 1);
      }

      // Add registrations
      filteredRegs.forEach(r => {
        const rDate = new Date(r.registrationDate);
        const mKey = `${rDate.getFullYear()}-${String(rDate.getMonth() + 1).padStart(2, '0')}`;
        if (monthlyMap[mKey]) {
          const pkg = MEMBERSHIP_PACKAGES.find(p => p.id === r.packageId);
          monthlyMap[mKey].pemasukan += pkg?.price || 0;
          monthlyMap[mKey].members += 1;
        }
      });

      // Add expenses
      filteredExpenses.forEach(e => {
        const eDate = new Date(e.date);
        const mKey = `${eDate.getFullYear()}-${String(eDate.getMonth() + 1).padStart(2, '0')}`;
        if (monthlyMap[mKey]) {
          monthlyMap[mKey].pengeluaran += e.amount;
        }
      });

      // Format for recharts
      Object.entries(monthlyMap).forEach(([key, val]) => {
        const [yr, mo] = key.split('-');
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const display = `${monthNames[parseInt(mo) - 1]} ${yr.slice(2)}`;
        data.push({
          dateStr: key,
          displayDate: display,
          pemasukan: val.pemasukan,
          pengeluaran: val.pengeluaran,
          members: val.members
        });
      });

    } else {
      // Group by Day
      const dailyMap: Record<string, { pemasukan: number; pengeluaran: number; members: number }> = {};
      
      // Populate all days in range
      const runner = new Date(start);
      while (runner <= end) {
        const dKey = runner.toISOString().split('T')[0];
        dailyMap[dKey] = { pemasukan: 0, pengeluaran: 0, members: 0 };
        runner.setDate(runner.getDate() + 1);
      }

      // Add registrations
      filteredRegs.forEach(r => {
        if (dailyMap[r.registrationDate]) {
          const pkg = MEMBERSHIP_PACKAGES.find(p => p.id === r.packageId);
          dailyMap[r.registrationDate].pemasukan += pkg?.price || 0;
          dailyMap[r.registrationDate].members += 1;
        }
      });

      // Add expenses
      filteredExpenses.forEach(e => {
        if (dailyMap[e.date]) {
          dailyMap[e.date].pengeluaran += e.amount;
        }
      });

      // Format for recharts
      Object.entries(dailyMap).sort((a, b) => a[0].localeCompare(b[0])).forEach(([key, val]) => {
        const dObj = new Date(key);
        const display = dObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        data.push({
          dateStr: key,
          displayDate: display,
          pemasukan: val.pemasukan,
          pengeluaran: val.pengeluaran,
          members: val.members
        });
      });
    }

    return data;
  }, [filteredRegs, filteredExpenses, dateRange]);

  // Handle Adding Expense
  const handleAddNewExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setExpenseError('');

    if (!expenseTitle.trim()) {
      setExpenseError('Please enter a descriptive expense title.');
      return;
    }

    const parsedAmount = parseFloat(expenseAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setExpenseError('Amount must be a positive number.');
      return;
    }

    if (!expenseDate) {
      setExpenseError('Please select a valid transaction date.');
      return;
    }

    onAddExpense({
      title: expenseTitle.trim(),
      amount: parsedAmount,
      category: expenseCategory,
      date: expenseDate
    });

    // Reset Form
    setExpenseTitle('');
    setExpenseAmount('');
    setShowAddExpense(false);
  };

  return (
    <div className="space-y-6" id="dashboard-stats-charts-section">
      
      {/* 1. Cupertino Date Range Picker Controls */}
      <div className="bg-white rounded-[24px] border border-[#E5E5EA] shadow-sm p-5 md:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-[#007AFF]">
              <Filter className="w-4 h-4 stroke-[2.5px]" />
              <span className="text-xs font-extrabold uppercase tracking-widest">Active Filters</span>
            </div>
            <h3 className="text-lg font-extrabold text-black tracking-tight mt-1">Select Reporting Period</h3>
            <p className="text-[11px] text-[#8E8E93] font-medium">All financial calculations, active counters, and graphical metrics adapts dynamically to the date criteria.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Quick Presets Group */}
            <div className="grid grid-cols-4 sm:flex bg-[#F2F2F7] p-1 rounded-xl border border-[#E5E5EA]">
              <button
                type="button"
                onClick={() => handlePreset('this_week')}
                className="px-2.5 py-1.5 text-[10px] font-extrabold rounded-lg transition text-slate-700 hover:text-black hover:bg-white/60 active:scale-95 cursor-pointer"
              >
                1 Week
              </button>
              <button
                type="button"
                onClick={() => handlePreset('last_30')}
                className="px-2.5 py-1.5 text-[10px] font-extrabold rounded-lg transition text-slate-700 hover:text-black hover:bg-white/60 active:scale-95 cursor-pointer"
              >
                30 Days
              </button>
              <button
                type="button"
                onClick={() => handlePreset('this_month')}
                className="px-2.5 py-1.5 text-[10px] font-extrabold rounded-lg transition text-slate-700 hover:text-black hover:bg-white/60 active:scale-95 cursor-pointer"
              >
                Month
              </button>
              <button
                type="button"
                onClick={() => handlePreset('all')}
                className="px-2.5 py-1.5 text-[10px] font-extrabold rounded-lg transition text-slate-700 hover:text-black hover:bg-white/60 active:scale-95 cursor-pointer"
              >
                All Time
              </button>
            </div>

            {/* Range Pickers */}
            <div className="flex items-center space-x-2 bg-slate-50 border border-[#E5E5EA] p-1.5 rounded-xl">
              <div className="flex items-center space-x-1">
                <span className="text-[9px] font-black text-slate-400 uppercase ml-1">From</span>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                  className="bg-transparent border-0 text-xs font-bold text-black focus:ring-0 cursor-pointer p-0.5 outline-none"
                />
              </div>
              <span className="text-slate-300 font-bold text-xs">—</span>
              <div className="flex items-center space-x-1">
                <span className="text-[9px] font-black text-slate-400 uppercase">To</span>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                  className="bg-transparent border-0 text-xs font-bold text-black focus:ring-0 cursor-pointer p-0.5 outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. DYNAMIC PERIOD KPI STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Range Active Members */}
        <div className="bg-white rounded-[22px] border border-[#E5E5EA] p-5 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[110px]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[9px] text-[#8E8E93] font-extrabold uppercase tracking-widest">Active Gym Members</p>
              <p className="text-2xl font-black text-black leading-none mt-1.5 font-display">{stats.activeMembers}</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center">
              <Users className="w-5 h-5 stroke-[2px]" />
            </div>
          </div>
          <p className="text-[10px] text-[#8E8E93] mt-2 font-medium">Currently active in period</p>
        </div>

        {/* Card 2: Range Total Revenue / Pemasukan */}
        <div className="bg-white rounded-[22px] border border-[#E5E5EA] p-5 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[110px]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[9px] text-[#8E8E93] font-extrabold uppercase tracking-widest">Inflow (Pemasukan)</p>
              <p className="text-xl font-black text-emerald-600 leading-none mt-2 font-display">
                Rp {stats.income.toLocaleString('id-ID')}
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 font-medium">New registrations revenue</p>
        </div>

        {/* Card 3: Range Total Expenses / Pengeluaran */}
        <div className="bg-white rounded-[22px] border border-[#E5E5EA] p-5 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[110px]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[9px] text-[#8E8E93] font-extrabold uppercase tracking-widest">Outflow (Pengeluaran)</p>
              <p className="text-xl font-black text-rose-600 leading-none mt-2 font-display">
                Rp {stats.expenses.toLocaleString('id-ID')}
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 font-medium">Gym operational expenditures</p>
        </div>

        {/* Card 4: Range Net Balance / Profit */}
        <div className="bg-white rounded-[22px] border border-[#E5E5EA] p-5 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[110px]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[9px] text-[#8E8E93] font-extrabold uppercase tracking-widest">Net Revenue (Netto)</p>
              <p className={`text-xl font-black leading-none mt-2 font-display ${stats.profit >= 0 ? 'text-[#007AFF]' : 'text-rose-600'}`}>
                Rp {stats.profit.toLocaleString('id-ID')}
              </p>
            </div>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${stats.profit >= 0 ? 'bg-[#007AFF]/10 text-[#007AFF]' : 'bg-rose-50 text-rose-600'}`}>
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className={`text-[10px] font-semibold mt-2 ${stats.profit >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
            {stats.profit >= 0 ? 'Surplus Cashflow' : 'Deficit in Range'}
          </p>
        </div>
      </div>

      {/* 3. DYNAMIC REGISTRATION GROWTH & FINANCIAL CHART */}
      <div className="bg-white rounded-[24px] border border-[#E5E5EA] shadow-sm p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center space-x-1.5 text-black">
              <TrendingUp className="w-5 h-5 text-[#007AFF] stroke-[2px]" />
              <h3 className="text-lg font-black tracking-tight">Growth Trend Graph</h3>
            </div>
            <p className="text-[11px] text-[#8E8E93] mt-0.5 font-medium">Daily visualization of cash inflow vs. cash outflow transactions.</p>
          </div>

          <div className="flex items-center space-x-4 text-[10px] font-extrabold uppercase tracking-wider text-[#8E8E93]">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-1.5 bg-emerald-500 rounded-full" />
              <span>Pemasukan</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-1.5 bg-rose-500 rounded-full" />
              <span>Pengeluaran</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
              <span>Registrations</span>
            </div>
          </div>
        </div>

        {/* Recharts Area Container */}
        <div className="h-72 w-full" id="stats-area-chart">
          {chartData.length === 0 ? (
            <div className="w-full h-full bg-slate-50 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 space-y-2">
              <AlertCircle className="w-8 h-8 text-slate-300" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No transaction records in range</p>
              <p className="text-[10px] text-slate-400 text-center max-w-[200px]">Change the range filters or record mock expenses below.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorPemasukan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorPengeluaran" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2F2F7" />
                <XAxis 
                  dataKey="displayDate" 
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#8E8E93', fontSize: 10, fontWeight: 700 }} 
                />
                <YAxis 
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `Rp ${v >= 1000000 ? (v / 1000000).toFixed(1) + 'M' : v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`}
                  tick={{ fill: '#8E8E93', fontSize: 10, fontWeight: 700 }} 
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-black/90 backdrop-blur-md rounded-xl p-3 border border-white/10 shadow-xl text-white text-left space-y-1.5">
                          <p className="text-[10px] font-black uppercase text-[#8E8E93] tracking-widest">{data.displayDate}</p>
                          <div className="space-y-0.5">
                            <p className="text-xs font-bold text-emerald-400">
                              Inflow: Rp {Number(data.pemasukan).toLocaleString('id-ID')}
                            </p>
                            <p className="text-xs font-bold text-rose-400">
                              Outflow: Rp {Number(data.pengeluaran).toLocaleString('id-ID')}
                            </p>
                            <p className="text-[10px] text-indigo-300 font-extrabold uppercase tracking-wide mt-1.5 flex items-center">
                              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mr-1.5 inline-block" />
                              Registrations: {data.members} new member{data.members !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="pemasukan" 
                  stroke="#10B981" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorPemasukan)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="pengeluaran" 
                  stroke="#EF4444" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorPengeluaran)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 4. EXPENSE LOGGER PANEL (PENGELUARAN DINAMIS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* EXPENSE LOGS TABLE LIST */}
        <div className="bg-white rounded-[24px] border border-[#E5E5EA] shadow-sm p-5 md:p-6 lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-black tracking-tight">Period Outflows (Pengeluaran)</h3>
              <p className="text-[11px] text-[#8E8E93] font-medium">Breakdown of operational expenditures logged in this range.</p>
            </div>
            
            {!showAddExpense && (
              <button
                type="button"
                onClick={() => setShowAddExpense(true)}
                className="h-9 px-4 bg-[#007AFF] hover:bg-[#0062CC] text-white font-extrabold rounded-lg text-xs transition active:scale-95 flex items-center space-x-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Expense</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            {filteredExpenses.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-1">
                <AlertCircle className="w-6 h-6 text-slate-300 mx-auto" />
                <p className="text-xs font-semibold text-slate-500">No expenses recorded in this range.</p>
                <p className="text-[10px] text-[#8E8E93]">Use the button to record a new operational expense.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E5E5EA] text-[10px] text-[#8E8E93] font-black uppercase tracking-widest">
                    <th className="pb-3 pt-1 pl-1">Details</th>
                    <th className="pb-3 pt-1">Category</th>
                    <th className="pb-3 pt-1">Date</th>
                    <th className="pb-3 pt-1 text-right pr-1">Amount</th>
                    <th className="pb-3 pt-1 text-center w-12">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2F2F7]">
                  {filteredExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3 pl-1">
                        <p className="text-xs font-bold text-black uppercase leading-tight">{exp.title}</p>
                      </td>
                      <td className="py-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                          exp.category === 'Utilities' ? 'bg-amber-50 text-amber-700 border-amber-150' :
                          exp.category === 'Marketing' ? 'bg-indigo-50 text-indigo-700 border-indigo-150' :
                          exp.category === 'Maintenance' ? 'bg-slate-50 text-slate-700 border-slate-150' :
                          'bg-sky-50 text-sky-700 border-sky-150'
                        }`}>
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-3 text-[11px] font-mono font-bold text-slate-500">
                        {new Date(exp.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-3 text-right pr-1 text-xs font-bold text-rose-600 font-display">
                        Rp {exp.amount.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 text-center">
                        <button
                          type="button"
                          onClick={() => onDeleteExpense(exp.id)}
                          className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition active:scale-90 cursor-pointer mx-auto block"
                          title="Delete Expense Log"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* EXPENSE LOGGING INLINE FORM */}
        <div className="lg:col-span-4">
          {showAddExpense ? (
            <form onSubmit={handleAddNewExpenseSubmit} className="bg-white rounded-[24px] border border-slate-200 shadow-lg p-5 md:p-6 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-[#007AFF]" />
                  <h3 className="text-sm font-extrabold text-black uppercase tracking-wider">Log Gym Outflow</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddExpense(false)}
                  className="text-xs font-extrabold text-[#8E8E93] hover:text-black hover:bg-[#F2F2F7] px-2 py-1 rounded-md transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              {expenseError && (
                <div className="bg-red-50 border border-red-100 p-2.5 rounded-xl flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-[10px] text-red-600 font-bold leading-normal">{expenseError}</p>
                </div>
              )}

              <div className="space-y-3">
                {/* Title */}
                <div className="space-y-1 text-left">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Expense Detail / Note</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PLN Electricity Bill, Trainer Salary"
                    value={expenseTitle}
                    onChange={(e) => setExpenseTitle(e.target.value)}
                    className="w-full h-10 bg-slate-50 border border-[#E5E5EA] rounded-xl px-3 text-xs font-bold text-black focus:border-[#007AFF] focus:bg-white outline-none transition"
                  />
                </div>

                {/* Amount */}
                <div className="space-y-1 text-left">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Amount (Rupiah)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-extrabold text-slate-400">Rp</span>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 150000"
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value)}
                      className="w-full h-10 bg-slate-50 border border-[#E5E5EA] rounded-xl pl-9 pr-3 text-xs font-bold text-black focus:border-[#007AFF] focus:bg-white outline-none transition"
                    />
                  </div>
                </div>

                {/* Category & Date in two columns */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1 text-left">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Category</label>
                    <select
                      value={expenseCategory}
                      onChange={(e) => setExpenseCategory(e.target.value)}
                      className="w-full h-10 bg-slate-50 border border-[#E5E5EA] rounded-xl px-2.5 text-xs font-bold text-black focus:border-[#007AFF] focus:bg-white outline-none transition cursor-pointer"
                    >
                      <option value="Utilities">Utilities</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Salaries">Salaries</option>
                      <option value="Equipment">Equipment</option>
                    </select>
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Date</label>
                    <input
                      type="date"
                      required
                      value={expenseDate}
                      onChange={(e) => setExpenseDate(e.target.value)}
                      className="w-full h-10 bg-slate-50 border border-[#E5E5EA] rounded-xl px-2.5 text-xs font-bold text-black focus:border-[#007AFF] focus:bg-white outline-none transition cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-10 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-xs transition active:scale-95 cursor-pointer flex items-center justify-center space-x-1.5 shadow-md uppercase tracking-wider"
              >
                <DollarSign className="w-4 h-4" />
                <span>Save Expense Log</span>
              </button>
            </form>
          ) : (
            <div className="bg-slate-100 border border-slate-200 rounded-[24px] p-5 md:p-6 text-left space-y-3">
              <div className="w-10 h-10 bg-[#007AFF]/10 text-[#007AFF] rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 stroke-[2px]" />
              </div>
              <h4 className="text-xs font-black text-black uppercase tracking-widest">Active Ledger System</h4>
              <p className="text-[11px] text-[#8E8E93] leading-relaxed font-semibold">
                This dashboard features a fully dynamic, dual-ledger accounting module. Real-time graphs automatically reconcile income generated from member registration packages against operational expenses logged by the gym management staff.
              </p>
              <button
                type="button"
                onClick={() => setShowAddExpense(true)}
                className="text-[11px] font-extrabold text-[#007AFF] hover:underline flex items-center transition cursor-pointer"
              >
                Log an Expense Now <Plus className="w-3 h-3 ml-1" />
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
