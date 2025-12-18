import { Button } from '../../ui/button';
import { toast } from 'sonner';

export function CMSDashboard() {
  const [stats, setStats] = useState({
    properties: 0,
    enquiries: 0,
    views: 12450,
    conversion: '2.4%'
  });

  const loadStats = async () => {
    const props = await getAllPropertiesAdmin();
    const enqs = await getAllContactSubmissions();
    setStats(prev => ({
      ...prev,
      properties: props.length,
      enquiries: enqs.length
    }));
  };

  useEffect(() => {
    loadStats();
  }, []);

  const StatCard = ({ label, value, icon: Icon, trend }: any) => (
    <div className="bg-white p-6 rounded-xl border border-gray-200/60 shadow-[0_2px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 group">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-[#1A2551]/5 flex items-center justify-center text-[#1A2551] group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className="text-emerald-600 text-xs font-medium flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
            <ArrowUpRight className="w-3 h-3" /> {trend}
          </span>
        )}
      </div>
      <h3 className="text-3xl font-bold text-[#1A2551] mb-1 tracking-tight">{value}</h3>
      <p className="text-gray-500 text-sm font-medium">{label}</p>
    </div>
  );

  return (
    <CMSPageLayout title="Dashboard" description="Welcome back to your control center.">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard label="Active Listings" value={stats.properties} icon={Home} trend="+2 this month" />
        <StatCard label="New Enquiries" value={stats.enquiries} icon={MessageSquare} trend="+5 this week" />
        <StatCard label="Total Site Views" value={stats.views.toLocaleString()} icon={Users} trend="+12% vs last month" />
        <StatCard label="Conversion Rate" value={stats.conversion} icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-xl border border-gray-200/60 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
          <h3 className="text-xl font-bold text-[#1A2551] mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
                <div className="w-2 h-2 rounded-full bg-[#C5A059] ring-4 ring-[#C5A059]/20" />
                <div>
                  <p className="text-sm text-[#1A2551] font-medium">New enquiry received for "Riverside Gardens"</p>
                  <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#1A2551] p-8 rounded-xl text-white shadow-xl shadow-[#1A2551]/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          
          <h3 className="text-xl font-bold mb-6 relative z-10">System Status</h3>
          <div className="space-y-6 relative z-10">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span className="text-white/60 text-sm font-medium">Database Connection</span>
              <span className="text-[#4ADE80] text-xs font-bold px-2.5 py-1 bg-[#4ADE80]/20 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse" />
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span className="text-white/60 text-sm font-medium">Image Storage</span>
              <span className="text-[#4ADE80] text-xs font-bold px-2.5 py-1 bg-[#4ADE80]/20 rounded-full">Optimized</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-sm font-medium">SEO Indexing</span>
              <span className="text-[#4ADE80] text-xs font-bold px-2.5 py-1 bg-[#4ADE80]/20 rounded-full">Good</span>
            </div>
          </div>
        </div>
      </div>

    </CMSPageLayout>
  );
}