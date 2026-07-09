import { useState, useEffect, FormEvent } from 'react';
import { Vehicle, VehicleFormData, VehicleType, VehicleStatus, FactoryType } from '../../types/index';
import { Driver } from '../../types/index';
import { fetchDrivers } from '../driver/driverApi';

interface VehicleFormProps {
  vehicle?: Vehicle | null;
  onSave: (data: VehicleFormData) => Promise<void>;
  onClose: () => void;
}

const emptyForm: VehicleFormData = {
  registrationNumber: '',
  type: 'Truck',
  factory: 'DBP',
  status: 'STANDBY',
  assignedDriver: null,
};

export default function VehicleForm({ vehicle, onSave, onClose }: VehicleFormProps) {
  const [form, setForm] = useState<VehicleFormData>(emptyForm);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [error, setError] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    // Fetch active drivers for the dropdown
    fetchDrivers('', 'Active', 'All').then(setDrivers).catch(console.error);
  }, []);

  useEffect(() => {
    if (vehicle) {
      setForm({
        registrationNumber: vehicle.registrationNumber,
        type: vehicle.type,
        factory: vehicle.factory,
        status: vehicle.status,
        assignedDriver: vehicle.assignedDriver?._id || null,
      });
    } else {
      setForm(emptyForm);
    }
  }, [vehicle]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (err: unknown) {
      setError((err as any).response?.data?.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500";
  const labelClass = "block text-xs font-medium text-gray-600 mb-1";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            {vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
        </div>

        {error && (
          <div className="mx-6 mt-4 bg-red-50 text-red-600 text-sm px-3 py-2 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Registration Number */}
          <div>
            <label className={labelClass}>Registration Number *</label>
            <input
              name="registrationNumber"
              value={form.registrationNumber}
              onChange={handleChange}
              required
              className={inputClass}
              placeholder="KA-01-AB-1234"
            />
          </div>

          {/* Type + Factory */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Vehicle Type *</label>
              <select name="type" value={form.type} onChange={handleChange} required className={inputClass}>
                {(['Truck', 'Van', 'Bike', 'Tempo'] as VehicleType[]).map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Factory *</label>
              <select name="factory" value={form.factory} onChange={handleChange} required className={inputClass}>
                {(['DBP', 'MRS1', 'KOLAR'] as FactoryType[]).map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className={labelClass}>Status *</label>
            <select name="status" value={form.status} onChange={handleChange} required className={inputClass}>
              {(['STANDBY', 'ON ROAD', 'MAINTENANCE'] as VehicleStatus[]).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Assign Driver — populated from DB */}
          <div>
            <label className={labelClass}>Assign Driver (optional)</label>
            <select
              name="assignedDriver"
              value={form.assignedDriver || ''}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">-- No Driver --</option>
              {drivers.map(d => (
                <option key={d._id} value={d._id}>
                  {d.driverId} — {d.name} ({d.mobile})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">Only Active drivers are shown</p>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 text-sm bg-purple-700 text-white rounded-md hover:bg-purple-800 disabled:opacity-50">
              {saving ? 'Saving...' : vehicle ? 'Update Vehicle' : 'Add Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}