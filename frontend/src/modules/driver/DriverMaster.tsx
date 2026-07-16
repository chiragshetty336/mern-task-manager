import { useState, useEffect, useCallback } from 'react';
import { Driver, DriverFormData } from '../../types/index';
import { fetchDrivers, createDriver, updateDriver, deleteDriver } from './driverApi';
import DriverBulkImport from './DriverBulkImport';
import DriverForm from './DriverForm';

export default function DriverMaster() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isBulkImportOpen, setIsBulkImportOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [factoryFilter, setFactoryFilter] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

  const loadDrivers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchDrivers(search, statusFilter, factoryFilter);
      setDrivers(data);
    } catch (err) {
      setError('Failed to load drivers');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, factoryFilter]);

  useEffect(() => {
    loadDrivers();
  }, [loadDrivers]);

  const handleAdd = () => {
    setEditingDriver(null);
    setIsModalOpen(true);
  };

  const handleEdit = (driver: Driver) => {
    setEditingDriver(driver);
    setIsModalOpen(true);
  };

  const handleDelete = async (driver: Driver) => {
    if (!window.confirm(`Delete driver "${driver.name}"? This cannot be undone.`)) return;
    try {
      await deleteDriver(driver._id);
      setDrivers((prev) => prev.filter((d) => d._id !== driver._id));
    } catch (err) {
      alert('Failed to delete driver');
    }
  };

  const handleSave = async (formData: DriverFormData) => {
    if (editingDriver) {
      const updated = await updateDriver(editingDriver._id, formData);
      setDrivers((prev) => prev.map((d) => (d._id === updated._id ? updated : d)));
    } else {
      const created = await createDriver(formData);
      setDrivers((prev) => [created, ...prev]);
    }
  };

  const isDlExpiringSoon = (dlExpiry: string): boolean => {
    const expiry = new Date(dlExpiry);
    const today = new Date();
    const daysLeft = (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return daysLeft <= 30 && daysLeft >= 0;
  };

  const isDlExpired = (dlExpiry: string): boolean => {
    return new Date(dlExpiry) < new Date();
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Driver Master</h1>
          <p className="text-sm text-gray-500 mt-1">
            {drivers.length} driver{drivers.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsBulkImportOpen(true)}
            className="px-4 py-2 border border-purple-700 text-purple-700 rounded-md text-sm font-medium hover:bg-purple-50"
          >
            Bulk Import
          </button>
          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
          >
            + Add Driver
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          type="text"
          placeholder="Search name, mobile, DL..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
        <select
          value={factoryFilter}
          onChange={(e) => setFactoryFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="All">All Factories</option>
          <option value="DBP">DBP</option>
          <option value="MRS1">MRS1</option>
          <option value="KOLAR">KOLAR</option>
        </select>
        <button
          onClick={() => { setSearch(''); setStatusFilter('All'); setFactoryFilter('All'); }}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50"
        >
          Reset
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-center text-gray-400 py-10">Loading drivers...</p>
      ) : error ? (
        <p className="text-center text-red-500 py-10">{error}</p>
      ) : drivers.length === 0 ? (
        <p className="text-center text-gray-400 py-10">No drivers found. Add one above!</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Driver ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Mobile</th>
                <th className="px-4 py-3">Factory</th>
                <th className="px-4 py-3">DL Number</th>
                <th className="px-4 py-3">DL Expiry</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {drivers.map((driver) => (
                <tr key={driver._id} className="bg-white hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-mono text-blue-600">{driver.driverId}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{driver.name}</td>
                  <td className="px-4 py-3 text-gray-600">{driver.mobile}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-medium">
                      {driver.factory}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-gray-600">{driver.dlNumber}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${
                      isDlExpired(driver.dlExpiry)
                        ? 'text-red-600'
                        : isDlExpiringSoon(driver.dlExpiry)
                        ? 'text-orange-500'
                        : 'text-gray-600'
                    }`}>
                      {driver.dlExpiry}
                      {isDlExpired(driver.dlExpiry) && ' ⚠ Expired'}
                      {!isDlExpired(driver.dlExpiry) && isDlExpiringSoon(driver.dlExpiry) && ' ⚠ Expiring Soon'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      driver.status === 'Active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {driver.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(driver)}
                        className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(driver)}
                        className="px-3 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Driver Form Modal */}
      {isModalOpen && (
        <DriverForm
          driver={editingDriver}
          onSave={handleSave}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {/* Bulk Import Modal */}
      {isBulkImportOpen && (
        <DriverBulkImport
          onClose={() => setIsBulkImportOpen(false)}
          onSuccess={() => {
            setIsBulkImportOpen(false);
            loadDrivers();
          }}
        />
      )}
    </div>
  );
}