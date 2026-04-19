import React from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, Droplets, Syringe, Users, ArrowLeft } from 'lucide-react';

const CategoryCard = ({ title, icon: Icon, colorClass, to }) => (
  <Link 
    to={to}
    className="group flex flex-col items-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-[var(--color-primary)]/30 transition-all duration-300 ease-out hover:-translate-y-1"
  >
    <div className={`p-4 rounded-full mb-4 ${colorClass} group-hover:scale-110 transition-transform duration-300`}>
      <Icon size={32} />
    </div>
    <h3 className="text-lg font-headline font-semibold text-center text-[var(--color-text-headline)] group-hover:text-[var(--color-primary)] transition-colors">
      {title}
    </h3>
  </Link>
);

const DashboardPage = () => {
  const currentYear = new Date().getFullYear();

  const categories = [
    {
      title: "Community Wellness Outreach Program",
      icon: HeartPulse,
      colorClass: "bg-rose-100 text-rose-600",
      to: "/admin/wellness-outreach"
    },
    {
      title: "Bloodletting",
      icon: Droplets,
      colorClass: "bg-red-100 text-red-600",
      to: "/admin/bloodletting"
    },
    {
      title: "Blood Extraction",
      icon: Syringe,
      colorClass: "bg-blue-100 text-blue-600",
      to: "/admin/blood-extraction"
    },
    {
      title: "General Registration",
      icon: Users,
      colorClass: "bg-emerald-100 text-emerald-600",
      to: "/admin/general-registration"
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--color-neutral)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link to="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-[var(--color-primary)] mb-4 transition-colors">
              <ArrowLeft size={16} className="mr-1" /> Back to Home
            </Link>
            <h1 className="text-3xl font-headline font-bold text-[var(--color-text-headline)]">
              Program Dashboard
            </h1>
            <p className="mt-2 text-sm text-[var(--color-text-body)] font-body">
              Overview of active programs for {currentYear}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, idx) => (
            <CategoryCard 
              key={idx}
              title={cat.title}
              icon={cat.icon}
              colorClass={cat.colorClass}
              to={cat.to}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
