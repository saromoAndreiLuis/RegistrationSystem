import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Users, Search, ArrowLeft, MoreHorizontal, UserCircle2, ArrowUpDown, Plus, Loader2, AlertCircle } from 'lucide-react';
import { APPS_SCRIPT_URL } from '../config';

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
        <div className="text-sm font-mono text-[var(--color-primary)]">{patient.id}</div>
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
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  
  const displayCategory = category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(APPS_SCRIPT_URL);
        if (response.data.success) {
          // Filter patients by the selected category
          const allPatients = response.data.data.patients || [];
          
          // Map URL category 'general-registration' to 'General Registration' or similar
          // Alternatively, just show all if 'general-registration', or filter properly.
          // For now, let's filter if it matches exactly, or show all if it's 'general-registration'
          const filteredByCategory = category === 'general-registration' 
            ? allPatients 
            : allPatients.filter(p => p.category && p.category.toLowerCase() === displayCategory.toLowerCase());
            
          setPatients(filteredByCategory);
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
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return filterablePatients;
  }, [searchTerm, sortConfig, patients]);

  return (
    <div className="min-h-screen bg-[var(--color-neutral)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <button onClick={() => navigate(-1)} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-[var(--color-primary)] mb-4 transition-colors cursor-pointer focus:outline-none">
            <ArrowLeft size={16} className="mr-1" /> Back
          </button>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-xl">
                <Users size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-headline font-bold text-[var(--color-text-headline)]">
                  {displayCategory}
                </h1>
                <p className="text-sm font-body text-[var(--color-text-body)]">
                  Patient List
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="relative w-full sm:w-72">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by name or ID..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg font-body focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button 
                onClick={() => navigate('/register')}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors shadow-sm font-headline font-semibold whitespace-nowrap"
              >
                <Plus size={18} /> Add
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-headline font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('fullName')}
                  >
                    <div className="flex items-center gap-1">
                      Patient Name
                      <ArrowUpDown size={14} className={sortConfig.key === 'fullName' ? "text-[var(--color-primary)]" : "text-gray-400"} />
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-headline font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('id')}
                  >
                    <div className="flex items-center gap-1">
                      ID Number
                      <ArrowUpDown size={14} className={sortConfig.key === 'id' ? "text-[var(--color-primary)]" : "text-gray-400"} />
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-headline font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 font-body">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <Loader2 className="animate-spin mb-2" size={24} />
                        <p>Loading patients...</p>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-red-500">
                      <div className="flex items-center justify-center gap-2">
                        <AlertCircle size={20} />
                        {error}
                      </div>
                    </td>
                  </tr>
                ) : sortedAndFilteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                      No patients found.
                    </td>
                  </tr>
                ) : (
                  sortedAndFilteredPatients.map((patient) => (
                    <PatientRow key={patient.id} patient={patient} category={category} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientList;
