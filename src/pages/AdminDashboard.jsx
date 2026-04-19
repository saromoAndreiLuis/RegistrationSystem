import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Search, Users, AlertCircle, RefreshCw } from 'lucide-react';

// Reusing the same URL provided by the user in RegistrationForm.jsx
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyvw6kIB0e_YFUGuVeSf9G67GRGUOHzRvVFSjF16SV4d2nxueVwJjMz8P5PfWiPKAJTUw/exec';

const AdminDashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      // For Apps Script, following redirects is handled automatically by browser for GET, 
      // but cross-origin requests returning JSON can be tricky if not text/plain. 
      // Assuming doPost worked with cross-origin, doGet should work similarly returning JSON.
      const response = await axios.get(APPS_SCRIPT_URL);
      if (response.data.success) {
        setData(response.data.data);
      } else {
        throw new Error(response.data.error || 'Failed to fetch data');
      }
    } catch (err) {
      console.error(err);
      setError('Could not load data from Google Sheets. Ensure you deployed the latest Code.gs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = data.filter(item =>
    Object.values(item).some(val =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-[var(--color-neutral)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-xl">
              <Users size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-headline font-bold text-[var(--color-text-headline)]">
                Admin Dashboard
              </h1>
              <p className="text-sm font-body text-[var(--color-text-body)]">
                Total Registrations: {data.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search records..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg font-body focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={fetchData}
              className="p-2.5 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-[var(--color-primary)] transition-colors"
              title="Refresh Data"
            >
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
            <AlertCircle className="text-red-500 mt-0.5 shrink-0" />
            <div className="text-red-800 text-sm font-medium">{error}</div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['ID', 'Timestamp', 'Full Name', 'Age', 'Gender', 'Address', 'Contact', 'Category'].map((head) => (
                    <th key={head} className="px-6 py-3 text-left text-xs font-headline font-semibold text-gray-500 uppercase tracking-wider">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 font-body text-sm">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <Loader2 className="animate-spin mb-2" size={24} />
                        <p>Loading registrations...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                      {data.length === 0 ? "No registrations found." : "No records match your search."}
                    </td>
                  </tr>
                ) : (
                  filteredData.map((row, i) => (
                    <tr key={row.id || i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-[var(--color-primary)] font-medium">
                        {row.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {row.timestamp ? new Date(row.timestamp).toLocaleString() : ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {row.fullName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {row.age}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {row.gender}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900 truncate max-w-xs" title={row.address}>
                          {row.address}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {row.contactNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]">
                          {row.category}
                        </span>
                      </td>
                    </tr>
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

export default AdminDashboard;
