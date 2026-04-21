import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Search, MoreHorizontal, UserCircle2, ArrowUpDown, Loader2, RefreshCw, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePatientCache } from '../context/PatientCacheContext';
import Skeleton from '../components/Skeleton';

const padId = (id) => String(id || '').padStart(4, '0');

const PatientRow = ({ patient, category }) => {
  const navigate = useNavigate();

  return (
    <tr 
      onClick={() => navigate(`/admin/${category}/${patient.id}`)}
      className="hover:bg-gray-50 cursor-pointer transition-colors group"
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 text-gray-400 group-hover:text-[var(--color-primary)] transition-colors">
            <UserCircle2 className="h-10 w-10" />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{patient.fullName}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-mono text-[var(--color-primary)] font-bold">{padId(patient.id)}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
          patient.status === 'inactive' ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'
        }`}>
          {patient.status || 'active'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button className="text-gray-400 hover:text-[var(--color-primary)] transition-colors">
          <MoreHorizontal size={20} />
        </button>
      </td>
    </tr>
  );
};

const PatientList = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const { patients: allPatients, history: allHistory, loading, refreshCache, lastUpdated } = usePatientCache();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const displayCategory = category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  // Smart Filtering Logic from Cache
  const filteredPatients = useMemo(() => {
    if (loading && allPatients.length === 0) return [];
    
    const normalize = (str) => String(str || '').toLowerCase().replace(/[\s-]/g, '');
    const getPossibleMatches = (cat) => {
      const norm = normalize(cat);
      if (norm.includes('wellness') || norm === 'cwop') return ['wellnessoutreach', 'communitywellnessoutreachprogram', 'cwop'];
      if (norm === 'bloodletting') return ['bloodletting'];
      if (norm === 'bloodextraction') return ['bloodextraction'];
      return [norm];
    };

    const targetNorms = getPossibleMatches(displayCategory);
    let list;

    if (category === 'general-registration') {
      list = allPatients;
    } else {
      const participantIds = new Set(
        allHistory
          .filter(h => targetNorms.includes(normalize(h.eventName)))
          .map(h => String(h.id || h.patientId))
      );

      list = allPatients.filter(p => {
        const matchesHistory = participantIds.has(String(p.id));
        const matchesProfile = targetNorms.includes(normalize(p.category));
        return matchesHistory || matchesProfile;
      });
    }

    // Apply Search
    if (searchTerm) {
      list = list.filter(p => 
        p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        String(p.id).includes(searchTerm)
      );
    }

    return list.sort((a, b) => b.id - a.id);
  }, [allPatients, allHistory, category, displayCategory, searchTerm]);

  const paginatedPatients = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredPatients.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPatients, currentPage]);

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);

  const exportToCSV = () => {
    const headers = ['ID', 'Full Name', 'Age', 'Gender', 'Address', 'Contact', 'Category'];
    const rows = filteredPatients.map(p => [
      padId(p.id), p.fullName, p.age, p.gender, p.address, p.contactNumber, p.category
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TGLFI-${category}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-[var(--color-neutral)] pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-xl">
              <Users size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-headline font-bold text-gray-900">{displayCategory}</h1>
              <p className="text-xs text-gray-500 font-body">
                {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : 'Initializing...'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button 
              onClick={refreshCache} 
              disabled={loading}
              className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] transition-all disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                id="main-search-input"
                type="text"
                placeholder="Search name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all"
              />
            </div>
            <button onClick={exportToCSV} className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-[var(--color-secondary)] hover:border-[var(--color-secondary)] transition-all">
              <Download size={20} />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider text-center">User ID</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading && paginatedPatients.length === 0 ? (
                  [...Array(8)].map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><Skeleton className="w-48 h-5" /></td>
                      <td className="px-6 py-4"><Skeleton className="w-16 h-5 mx-auto" /></td>
                      <td className="px-6 py-4"><Skeleton className="w-20 h-5 rounded-full" /></td>
                      <td className="px-6 py-4"><Skeleton className="w-8 h-5 ml-auto" /></td>
                    </tr>
                  ))
                ) : (
                  paginatedPatients.map((patient) => (
                    <PatientRow key={patient.id} patient={patient} category={category} />
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {filteredPatients.length === 0 && !loading && (
            <div className="py-20 text-center">
              <p className="text-gray-500 font-body">No users found matching your criteria.</p>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-6 flex justify-center items-center gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="p-2 rounded-lg border border-gray-200 disabled:opacity-30"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm font-medium text-gray-600">Page {currentPage} of {totalPages}</span>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="p-2 rounded-lg border border-gray-200 disabled:opacity-30"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientList;
