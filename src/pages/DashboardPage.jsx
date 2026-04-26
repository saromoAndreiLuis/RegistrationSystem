import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  HeartPulse, Droplets, Syringe, Users, ArrowLeft, 
  TrendingUp, Activity, UserPlus, Database, RefreshCw, ArrowRight
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { usePatientCache } from '../context/PatientCacheContext';
import { useAppMode } from '../context/AppModeContext';

// ── RADIANT MODE COMPONENTS ──
const RadiantStatCard = ({ title, value, icon: Icon, colorClass, iconColorClass, trend }) => (
  <div className="bg-white p-4 rounded-xl border-none shadow-[0_20px_40px_rgba(47,51,52,0.04)]">
    <div className="flex items-center justify-between mb-2">
      <span className="text-gray-500 font-medium text-xs">{title}</span>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colorClass}`}>
        <Icon size={16} className={iconColorClass} />
      </div>
    </div>
    <div className="flex items-end gap-2">
      <span className="text-2xl font-extrabold text-gray-900 font-headline leading-none">{value}</span>
      {trend !== undefined && (
        <span className={`text-[10px] font-bold mb-0.5 ${trend > 0 ? 'text-[var(--color-primary)]' : 'text-gray-400'}`}>
          {trend > 0 ? `+${trend} today` : 'No new data'}
        </span>
      )}
    </div>
  </div>
);

const RadiantProgramCard = ({ title, desc, tag, tagColor, imgSrc, to, count }) => (
  <Link to={to} className="group bg-white rounded-xl overflow-hidden hover:-translate-y-1 transition-all duration-300 shadow-[0_10px_30px_rgba(47,51,52,0.03)] flex flex-col">
    <div className="h-16 bg-gray-100 relative">
      <img className="w-full h-full object-cover opacity-60 mix-blend-multiply" src={imgSrc} alt={title} />
      <div className={`absolute top-2 left-2 bg-white/90 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-widest uppercase ${tagColor}`}>{tag}</div>
    </div>
    <div className="p-3 flex-1 flex flex-col justify-between">
      <div>
        <h4 className="font-bold text-sm mb-0.5 text-gray-900 font-headline leading-tight">{title}</h4>
        <p className="text-[10px] text-gray-500 mb-2 leading-tight line-clamp-1">{desc}</p>
      </div>
      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
        <span className="text-[10px] font-semibold text-gray-400">{count} Records</span>
        <ArrowRight size={14} className="text-[var(--color-primary)] group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  </Link>
);

// ── LITE MODE COMPONENTS ──
const StatCard = ({ title, value, icon: Icon, colorClass, trend }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start justify-between">
    <div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{title}</p>
      <h3 className="text-2xl font-headline font-bold text-gray-900">{value}</h3>
      {trend !== undefined && (
        <p className={`text-[10px] font-bold mt-2 flex items-center gap-1 ${trend > 0 ? 'text-emerald-500' : 'text-gray-400'}`}>
          <TrendingUp size={12} />
          {trend > 0 ? `+${trend} today` : 'No new data'}
        </p>
      )}
    </div>
    <div className={`p-3 rounded-xl ${colorClass}`}>
      <Icon size={24} />
    </div>
  </div>
);

const CategoryCard = ({ title, icon: Icon, colorClass, to, count }) => (
  <Link 
    to={to}
    className="group flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-[var(--color-primary)]/30 transition-all duration-300 ease-out hover:-translate-y-1"
  >
    <div className={`p-4 rounded-full mb-4 ${colorClass} group-hover:scale-110 transition-transform duration-300`}>
      <Icon size={32} />
    </div>
    <h3 className="text-sm font-headline font-semibold text-center text-[var(--color-text-headline)] group-hover:text-[var(--color-primary)] transition-colors mb-1">
      {title}
    </h3>
    <span className="text-xs font-mono font-bold text-gray-400">{count} Records</span>
  </Link>
);


const DashboardPage = () => {
  const navigate = useNavigate();
  const { patients, history, loading, refreshCache, lastUpdated } = usePatientCache();
  const { mode } = useAppMode();
  const currentYear = new Date().getFullYear();

  // ── DATA PROCESSING ──
  const stats = useMemo(() => {
    const totalUsers = patients.length;
    const totalServices = history.length;

    const isToday = (dateStr) => {
      if (!dateStr) return false;
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return false;
      const today = new Date();
      return d.getDate() === today.getDate() && 
             d.getMonth() === today.getMonth() && 
             d.getFullYear() === today.getFullYear();
    };

    const usersToday = patients.filter(p => isToday(p.timestamp)).length;
    const servicesToday = history.filter(h => isToday(h.timestamp) || isToday(h.date)).length;

    const categories = ['Beneficiary', 'Volunteer', 'Sponsor', 'Staff', 'Other'];
    const categoryData = categories.map(cat => ({
      name: cat,
      count: patients.filter(p => p.category === cat).length
    }));

    const normalize = (str) => String(str || '').toLowerCase().replace(/[\s-]/g, '');
    
    const getCountFor = (targetNorms) => {
      const participantIds = new Set(
        history
          .filter(h => targetNorms.includes(normalize(h.eventName)))
          .map(h => String(h.id || h.patientId))
      );
      return patients.filter(p => participantIds.has(String(p.id)) || targetNorms.includes(normalize(p.category))).length;
    };

    const programCounts = {
      wellness: getCountFor(['wellnessoutreach', 'communitywellnessoutreachprogram', 'cwop']),
      bloodletting: getCountFor(['bloodletting']),
      extraction: getCountFor(['bloodextraction']),
      general: patients.length
    };

    const trendData = [...Array(7)].map((_, i) => {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - (6 - i));
      
      const isSameDate = (dateStr) => {
        if (!dateStr) return false;
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return false;
        return d.getDate() === targetDate.getDate() && 
               d.getMonth() === targetDate.getMonth() && 
               d.getFullYear() === targetDate.getFullYear();
      };

      return {
        date: targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        registrations: patients.filter(p => isSameDate(p.timestamp)).length,
        services: history.filter(h => isSameDate(h.timestamp) || isSameDate(h.date)).length
      };
    });

    return { totalUsers, totalServices, usersToday, servicesToday, categoryData, programCounts, trendData };
  }, [patients, history]);

  const CHART_COLORS = ['#438E82', '#607D8B', '#A1887F', '#E2E8F0', '#1A1A1A'];

  const radiantProgramData = [
    {
      title: "Community Wellness Outreach Program",
      desc: "Holistic physical and mental health workshops.",
      tag: "Active", tagColor: "text-[var(--color-primary)]",
      imgSrc: "/Event Icons/CWOP/_2470103.JPG",
      to: "/admin/wellness-outreach", count: stats.programCounts.wellness
    },
    {
      title: "Bloodletting",
      desc: "Bi-weekly community blood drive events.",
      tag: "Critical", tagColor: "text-red-500",
      imgSrc: "/Event Icons/Bloodletting/_1622591.JPG",
      to: "/admin/bloodletting", count: stats.programCounts.bloodletting
    },
    {
      title: "Blood Extraction",
      desc: "Mobile dental clinic services for suburbs.",
      tag: "Scheduled", tagColor: "text-blue-500",
      imgSrc: "/Event Icons/Blood Extraction/Screenshot 2026-04-26 201539.png",
      to: "/admin/blood-extraction", count: stats.programCounts.extraction
    },
    {
      title: "General Instructions",
      desc: "Walk-in checkups and basic health consultations.",
      tag: "Standard", tagColor: "text-amber-600",
      imgSrc: "/Event Icons/General Registration/_1877516.JPG",
      to: "/admin/general-registration", count: stats.programCounts.general
    }
  ];

  const liteCategories = [
    { title: "Community Wellness Outreach Program", icon: HeartPulse, colorClass: "bg-rose-100 text-rose-600", to: "/admin/wellness-outreach", count: stats.programCounts.wellness },
    { title: "Bloodletting", icon: Droplets, colorClass: "bg-red-100 text-red-600", to: "/admin/bloodletting", count: stats.programCounts.bloodletting },
    { title: "Blood Extraction", icon: Syringe, colorClass: "bg-blue-100 text-blue-600", to: "/admin/blood-extraction", count: stats.programCounts.extraction },
    { title: "General Instructions", icon: Users, colorClass: "bg-emerald-100 text-emerald-600", to: "/admin/general-registration", count: stats.programCounts.general }
  ];

  const headerContent = (isRadiant) => (
    <div className={`flex items-center justify-between relative z-10 ${isRadiant ? 'mb-3' : 'mb-8'}`}>
      <div>
        <h1 className={`font-headline font-bold text-gray-900 tracking-tight ${isRadiant ? 'text-xl' : 'text-3xl'}`}>
          Program Dashboard
        </h1>
        {!isRadiant && (
          <p className="mt-2 text-sm text-gray-500 font-body">
            Real-time analytics for {currentYear} outreach activities.
          </p>
        )}
      </div>
      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-2">
          <button 
            onClick={refreshCache} 
            disabled={loading}
            className={`rounded-xl bg-white shadow-sm text-gray-400 hover:text-[var(--color-primary)] transition-all disabled:opacity-50 flex items-center justify-center ${isRadiant ? 'p-2' : 'p-2.5 border border-gray-100'}`}
            title="Refresh Dashboard"
          >
            <RefreshCw size={isRadiant ? 16 : 18} className={loading ? 'animate-spin' : ''} />
          </button>
          <div className={`bg-white shadow-sm flex items-center gap-2 ${isRadiant ? 'px-3 py-1.5 rounded-lg' : 'px-4 py-2 border border-gray-100 rounded-xl'}`}>
            <div className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`} />
            <span className={`font-bold text-gray-500 uppercase tracking-wider ${isRadiant ? 'text-[10px]' : 'text-xs'}`}>
              {loading ? 'Syncing...' : 'Live'}
            </span>
          </div>
        </div>
        {lastUpdated && (
          <span className="text-[9px] text-gray-400 font-medium">
            Last Synced: {new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    </div>
  );

  if (mode === 'radiant') {
    return (
      <div className="h-screen overflow-hidden pt-16 pb-2 px-4 sm:px-6 lg:px-8 transition-colors duration-400 flex flex-col">
        <div className="max-w-7xl mx-auto w-full h-full flex flex-col">
          {headerContent(true)}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
            <RadiantStatCard title="Total Registrations" value={stats.totalUsers} icon={Users} colorClass="bg-emerald-50" iconColorClass="text-[var(--color-primary)]" trend={stats.usersToday} />
            <RadiantStatCard title="Services Logged" value={stats.totalServices} icon={Activity} colorClass="bg-blue-50" iconColorClass="text-blue-600" trend={stats.servicesToday} />
            <RadiantStatCard title="Active Programs" value="4" icon={HeartPulse} colorClass="bg-rose-50" iconColorClass="text-rose-600" />
            <RadiantStatCard title="Database Records" value={stats.totalUsers + stats.totalServices} icon={Database} colorClass="bg-gray-100" iconColorClass="text-gray-600" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-3 flex-1 min-h-0">
            <div className="lg:col-span-2 bg-white rounded-2xl p-4 relative overflow-hidden shadow-[0_20px_40px_rgba(47,51,52,0.03)] border-none flex flex-col">
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                <span className="text-7xl font-black text-[var(--color-primary)] tracking-widest">GROWTH</span>
              </div>
              <div className="flex justify-between items-start mb-2 relative z-10">
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-0.5 font-headline leading-none">Outreach Momentum</h3>
                  <p className="text-[10px] text-gray-500">Weekly growth trajectory of wellness sessions</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" /> Registrations
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-secondary)]" /> Services
                  </div>
                </div>
              </div>
              <div className="flex-1 w-full relative z-10 -ml-4 -mb-2">
                <ResponsiveContainer width="105%" height="100%">
                  <AreaChart data={stats.trendData}>
                    <defs>
                      <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} dy={5} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.08)' }} itemStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                    <Area type="monotone" dataKey="services" stroke="var(--color-secondary)" strokeWidth={2} strokeDasharray="4 4" fill="transparent" />
                    <Area type="monotone" dataKey="registrations" stroke="var(--color-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorReg)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 flex flex-col shadow-[0_20px_40px_rgba(47,51,52,0.03)] border-none overflow-hidden">
              <h3 className="text-base font-bold text-gray-900 mb-3 font-headline leading-none">User Category Mix</h3>
              <div className="space-y-3 flex-1 flex flex-col justify-center">
                {stats.categoryData.map((cat, idx) => {
                  const percentage = stats.totalUsers > 0 ? Math.round((cat.count / stats.totalUsers) * 100) : 0;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="font-medium text-gray-700">{cat.name}</span>
                        <span className="text-gray-500 font-bold">{percentage}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-1000 ease-out" 
                             style={{ width: `${percentage}%`, backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
            {radiantProgramData.map((prog, idx) => (
              <RadiantProgramCard key={idx} {...prog} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── LITE MODE DASHBOARD (Legacy UI) ──
  return (
    <div className="min-h-screen bg-[var(--color-neutral)] pt-20 pb-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {headerContent(false)}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard title="Total Registrations" value={stats.totalUsers} icon={Users} colorClass="bg-emerald-50 text-emerald-600" trend={stats.usersToday} />
          <StatCard title="Services Logged" value={stats.totalServices} icon={Activity} colorClass="bg-blue-50 text-blue-600" trend={stats.servicesToday} />
          <StatCard title="Active Programs" value="4" icon={HeartPulse} colorClass="bg-rose-50 text-rose-600" />
          <StatCard title="Database Records" value={stats.totalUsers + stats.totalServices} icon={Database} colorClass="bg-amber-50 text-amber-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-headline font-bold text-gray-800 flex items-center gap-2">
                <TrendingUp size={18} className="text-[var(--color-primary)]" />
                Outreach Momentum (Last 7 Days)
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                  <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]" /> Registrations
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                  <div className="w-2 h-2 rounded-full bg-[var(--color-secondary)]" /> Services
                </div>
              </div>
            </div>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.trendData}>
                  <defs>
                    <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#438E82" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#438E82" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} itemStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                  <Area type="monotone" dataKey="registrations" stroke="#438E82" strokeWidth={3} fillOpacity={1} fill="url(#colorReg)" />
                  <Area type="monotone" dataKey="services" stroke="#607D8B" strokeWidth={2} strokeDasharray="5 5" fill="transparent" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-headline font-bold text-gray-800 flex items-center gap-2 mb-6">
              <UserPlus size={18} className="text-[var(--color-primary)]" />
              User Category Mix
            </h3>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.categoryData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={70} tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                    {stats.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-headline font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Activity size={20} className="text-[var(--color-primary)]" />
          Program Details & Lists
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {liteCategories.map((cat, idx) => (
            <CategoryCard key={idx} title={cat.title} icon={cat.icon} colorClass={cat.colorClass} to={cat.to} count={cat.count} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
