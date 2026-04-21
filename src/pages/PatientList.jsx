import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Users, Search, ArrowLeft, MoreHorizontal, UserCircle2, ArrowUpDown, Plus, Loader2, AlertCircle, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { APPS_SCRIPT_URL } from '../config';

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
          patient.status === 'active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
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
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  
  const displayCategory = category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(APPS_SCRIPT_URL);
        if (response.data.success) {
          const allPatients = response.data.data.patients || [];
          const allHistory = response.data.data.history || [];
          
          // Helper to normalize strings for comparison (e.g., "Blood Letting" -> "bloodletting")
          const normalize = (str) => String(str || '').toLowerCase().replace(/[\s-]/g, '');
          
          // Expanded matching for abbreviations (e.g. Wellness Outreach matches CWOP)
          const getPossibleMatches = (cat) => {
            const norm = normalize(cat);
            if (norm.includes('wellness') || norm === 'cwop') return ['wellnessoutreach', 'communitywellnessoutreachprogram', 'cwop'];
            if (norm === 'bloodletting') return ['bloodletting'];
            if (norm === 'bloodextraction') return ['bloodextraction'];
            return [norm];
          };

          const targetNorms = getPossibleMatches(displayCategory);

          let filtered;
          if (category === 'general-registration') {
            filtered = allPatients;
          } else {
            // 1. Find all Patient IDs from the History sheet who participated in this program
            const participantIds = new Set(
              allHistory
                .filter(h => targetNorms.includes(normalize(h.eventName)))
                .map(h => String(h.patientId))
            );

            // 2. Filter the master patients list
            filtered = allPatients.filter(p => {
              const matchesHistory = participantIds.has(String(p.id));
              const matchesProfile = targetNorms.includes(normalize(p.category));
              return matchesHistory || matchesProfile;
            });
          }
            
          setPatients(filtered);
        } else {
          throw new Error(response.data.error || 'Failed to fetch data');
        }
      } catch (err) {
        console.error(err);
        setError('Could not load data from Google Sheets.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [category, displayCategory]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const exportToCSV = () => {
    if (patients.length === 0) return;
    
    const headers = ['User ID', 'Full Name', 'Age', 'Gender', 'Address', 'Contact Number', 'Category', 'Status'];
    const rows = patients.map(p => [
      padId(p.id),
      p.fullName,
      p.age,
      p.gender,
      p.address,
      p.contactNumber,
      p.category,
      p.status || 'active'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `TGLFI-Users-${displayCategory}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sortedAndFilteredPatients = useMemo(() => {
    let filterablePatients = [...patients];
    
    if (searchTerm) {
      filterablePatients = filterablePatients.filter(p => 
        (p.fullName && p.fullName.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (p.id && String(p.id).includes(searchTerm))
      );
    }
    
    if (sortConfig.key !== null) {
      filterablePatients.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];
        
        // Handle numeric IDs for correct sorting
        if (sortConfig.key === 'id') {
          valA = Number(valA);
          valB = Number(valB);
        }

        if (valA < valB) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (valA > valB) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return filterablePatients;
  }, [searchTerm, sortConfig, patients]);

  const totalPages = Math.ceil(sortedAndFilteredPatients.length / itemsPerPage);
  const paginatedPatients = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedAndFilteredPatients.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedAndFilteredPatients, currentPage]);

  return (
    <div className="min-h-screen bg-[var(--color-neutral)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header/Search Area */}
        <div className="mb-8">
          <button onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/admin')} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-[var(--color-primary)] mb-6 transition-colors cursor-pointer focus:outline-none">
            <ArrowLeft size={16} className="mr-1" /> Back
          </button>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-xl shadow-sm">
                <Users size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-headline font-bold text-[var(--color-text-headline)] leading-tight">
                  {displayCategory}
                </h1>
                <p className="text-sm font-body text-gray-500">User List</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64 min-w-[200px]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Search size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Search name or ID..."
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl font-body text-sm focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all shadow-sm"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
              </div>
              
              <button 
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all shadow-sm font-headline font-semibold text-sm active:scale-95"
              >
                <Download size={18} />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
              
              <button 
                onClick={() => navigate('/register')}
                className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-primary)] text-white rounded-xl hover:bg-[var(--color-primary-dark)] transition-all shadow-sm font-headline font-semibold text-sm whitespace-nowrap active:scale-95"
              >
                <Plus size={18} /> Add User
              </button>
            </div>
          </div>
        </div>

        {/* Table Area */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-4 text-left text-xs font-headline font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('fullName')}
                  >
                    <div className="flex items-center gap-1">
                      User Name
                      <ArrowUpDown size={14} className={sortConfig.key === 'fullName' ? "text-[var(--color-primary)]" : "text-gray-400"} />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-headline font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('id')}
                  >
                    <div className="flex items-center gap-1">
                      ID Number
                      <ArrowUpDown size={14} className={sortConfig.key === 'id' ? "text-[var(--color-primary)]" : "text-gray-400"} />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-headline font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="relative px-6 py-4">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 font-body">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <Loader2 className="animate-spin mb-3 text-[var(--color-primary)]" size={32} />
                        <p className="text-sm">Loading users...</p>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-16 text-center text-red-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <AlertCircle size={32} />
                        <p>{error}</p>
                      </div>
                    </td>
                  </tr>
                ) : paginatedPatients.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-16 text-center text-gray-400">
                      <p>No users found matching your search.</p>
                    </td>
                  </tr>
                ) : (
                  paginatedPatients.map((patient) => (
                    <PatientRow key={patient.id} patient={patient} category={category} />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-500 font-body">
                Showing <span className="font-semibold">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-semibold">{Math.min(currentPage * itemsPerPage, sortedAndFilteredPatients.length)}</span> of <span className="font-semibold">{sortedAndFilteredPatients.length}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientList;
