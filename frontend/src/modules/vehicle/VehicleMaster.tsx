import { useState, useEffect, useCallback } from 'react';
import { Vehicle, VehicleFormData } from '../../types/index';
import { fetchVehicles, createVehicle, updateVehicle, deleteVehicle, assignDriver } from './vehicleApi';
import VehicleForm from './VehicleForm';

const statusColors: Record<string, { bg: string; color: string }> = {
  'ON ROAD': { bg: '#DCFCE7', color: '#166534' },
  'MAINTENANCE': { bg: '#FEF9C3', color: '#854D0E' },
  'STANDBY': { bg: '#DBEAFE', color: '#1E40AF' },
};

const typeIcons: Record<string, string> = {
  Truck: '🚛',
  Van: '🚐',
  Bike: '🏍️',
  Tempo: '🚚',
};

export default function VehicleMaster() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [factoryFilter, setFactoryFilter] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const loadVehicles = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchVehicles(search, statusFilter, factoryFilter);
      setVehicles(data);
    } catch (err) {
      setError('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, factoryFilter]);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  const handleSave = async (formData: VehicleFormData) => {
    if (editingVehicle) {
      const updated = await updateVehicle(editingVehicle._id, formData);
      setVehicles(prev => prev.map(v => v._id === updated._id ? updated : v));
    } else {
      const created = await createVehicle(formData);
      setVehicles(prev => [created, ...prev]);
    }
  };

  const handleDelete = async (vehicle: Vehicle) => {
    if (!window.confirm(`Delete vehicle "${vehicle.registrationNumber}"?`)) return;
    try {
      await deleteVehicle(vehicle._id);
      setVehicles(prev => prev.filter(v => v._id !== vehicle._id));
    } catch {
      alert('Failed to delete vehicle');
    }
  };

  const handleStatusChange = async (vehicle: Vehicle, newStatus: string) => {
    try {
      const updated = await updateVehicle(vehicle._id, { status: newStatus as Vehicle['status'] });
      setVehicles(prev => prev.map(v => v._id === updated._id ? updated : v));
    } catch {
      alert('Failed to update status');
    }
  };

  const handleUnassignDriver = async (vehicle: Vehicle) => {
    if (!window.confirm(`Remove driver from ${vehicle.registrationNumber}?`)) return;
    try {
      const updated = await assignDriver(vehicle._id, null);
      setVehicles(prev => prev.map(v => v._id === updated._id ? updated : v));
    } catch {
      alert('Failed to unassign driver');
    }
  };

  // Summary counts
  const onRoad = vehicles.filter(v => v.status === 'ON ROAD').length;
  const maintenance = vehicles.filter(v => v.status === 'MAINTENANCE').length;
  const standby = vehicles.filter(v => v.status === 'STANDBY').length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Vehicle Master</h1>
          <p className="text-sm text-gray-500 mt-1">{vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} found</p>
        </div>
        <button
          onClick={() => { setEditingVehicle(null); setIsModalOpen(true); }}
          className="bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-800"
        >
          + Add Vehicle
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'On Road', count: onRoad, bg: '#DCFCE7', color: '#166534', border: '#86EFAC' },
          { label: 'Maintenance', count: maintenance, bg: '#FEF9C3', color: '#854D0E', border: '#FDE047' },
          { label: 'Standby', count: standby, bg: '#DBEAFE', color: '#1E40AF', border: '#93C5FD' },
        ].map(card => (
          <div key={card.label} style={{
            background: card.bg,
            border: `1px solid ${card.border}`,
            borderRadius: '10px',
            padding: '16px 20px',
          }}>
            <div style={{ fontSize: '13px', color: card.color, fontWeight: 500 }}>{card.label}</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: card.color }}>{card.count}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          type="text"
          placeholder="Search registration, vehicle ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm w-64 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="All">All Status</option>
          <option value="ON ROAD">On Road</option>
          <option value="MAINTENANCE">Maintenance</option>
          <option value="STANDBY">Standby</option>
        </select>
        <select
          value={factoryFilter}
          onChange={e => setFactoryFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
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
        <p className="text-center text-gray-400 py-10">Loading vehicles...</p>
      ) : error ? (
        <p className="text-center text-red-500 py-10">{error}</p>
      ) : vehicles.length === 0 ? (
        <p className="text-center text-gray-400 py-10">No vehicles found. Add one above!</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Vehicle ID</th>
                <th className="px-4 py-3">Registration</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Factory</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Assigned Driver</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {vehicles.map(vehicle => (
                <tr key={vehicle._id} className="bg-white hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-mono text-purple-700">{vehicle.vehicleId}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{vehicle.registrationNumber}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1">
                      <span>{typeIcons[vehicle.type]}</span>
                      <span className="text-gray-600">{vehicle.type}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-medium">
                      {vehicle.factory}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={vehicle.status}
                      onChange={e => handleStatusChange(vehicle, e.target.value)}
                      style={{
                        background: statusColors[vehicle.status].bg,
                        color: statusColors[vehicle.status].color,
                        border: 'none',
                        borderRadius: '20px',
                        padding: '4px 10px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <option value="ON ROAD">ON ROAD</option>
                      <option value="MAINTENANCE">MAINTENANCE</option>
                      <option value="STANDBY">STANDBY</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    {vehicle.assignedDriver ? (
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="text-gray-800 font-medium text-xs">{vehicle.assignedDriver.name}</div>
                          <div className="text-gray-400 text-xs">{vehicle.assignedDriver.driverId}</div>
                        </div>
                        <button
                          onClick={() => handleUnassignDriver(vehicle)}
                          className="text-red-400 hover:text-red-600 text-xs ml-1"
                          title="Remove driver"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs italic">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setEditingVehicle(vehicle); setIsModalOpen(true); }}
                        className="px-3 py-1 text-xs bg-purple-50 text-purple-700 rounded hover:bg-purple-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(vehicle)}
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

      {isModalOpen && (
        <VehicleForm
          vehicle={editingVehicle}
          onSave={handleSave}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}