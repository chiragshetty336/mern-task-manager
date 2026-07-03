import { useState, useEffect, FormEvent } from 'react';
import { Driver, DriverFormData, FactoryType, DriverStatus } from '../../types/index';

interface DriverFormProps {
  driver?: Driver | null;
  onSave: (data: DriverFormData) => Promise<void>;
  onClose: () => void;
}

const emptyForm: DriverFormData = {
  name: '',
  mobile: '',
  altMobile: '',
  address: '',
  aadhaar: '',
  dlNumber: '',
  dlExpiry: '',
  factory: 'DBP',
  status: 'Active',
};

export default function DriverForm({ driver, onSave, onClose }: DriverFormProps) {
  const [form, setForm] = useState<DriverFormData>(emptyForm);
  const [error, setError] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  // Pre-fill form if editing
  useEffect(() => {
    if (driver) {
      setForm({
        name: driver.name,
        mobile: driver.mobile,
        altMobile: driver.altMobile || '',
        address: driver.address || '',
        aadhaar: driver.aadhaar,
        dlNumber: driver.dlNumber,
        dlExpiry: driver.dlExpiry,
        factory: driver.factory,
        status: driver.status,
      });
    } else {
      setForm(emptyForm);
    }
  }, [driver]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
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

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelClass = "block text-xs font-medium text-gray-600 mb-1";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            {driver ? 'Edit Driver' : 'Add New Driver'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">
            ✕
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 bg-red-50 text-red-600 text-sm px-3 py-2 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Row 1: Name + Mobile */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Full Name *</label>
              <input name="name" value={form.name} onChange={handleChange}
                required className={inputClass} placeholder="Nanjunda Gowda" />
            </div>
            <div>
              <label className={labelClass}>Mobile *</label>
              <input name="mobile" value={form.mobile} onChange={handleChange}
                required className={inputClass} placeholder="9731054321" maxLength={10} />
            </div>
          </div>

          {/* Row 2: Alt Mobile + Factory */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Alternate Mobile</label>
              <input name="altMobile" value={form.altMobile} onChange={handleChange}
                className={inputClass} placeholder="Optional" maxLength={10} />
            </div>
            <div>
              <label className={labelClass}>Factory *</label>
              <select name="factory" value={form.factory} onChange={handleChange}
                required className={inputClass}>
                {(['DBP', 'MRS1', 'KOLAR'] as FactoryType[]).map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: DL Number + DL Expiry */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>DL Number *</label>
              <input name="dlNumber" value={form.dlNumber} onChange={handleChange}
                required className={inputClass} placeholder="KA-02-201888990" />
            </div>
            <div>
              <label className={labelClass}>DL Expiry *</label>
              <input name="dlExpiry" value={form.dlExpiry} onChange={handleChange}
                required type="date" className={inputClass} />
            </div>
          </div>

          {/* Row 4: Aadhaar + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Aadhaar Number *</label>
              <input name="aadhaar" value={form.aadhaar} onChange={handleChange}
                required className={inputClass} placeholder="987654321098" />
            </div>
            <div>
              <label className={labelClass}>Status *</label>
              <select name="status" value={form.status} onChange={handleChange}
                required className={inputClass}>
                {(['Active', 'Inactive'] as DriverStatus[]).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className={labelClass}>Address</label>
            <textarea name="address" value={form.address} onChange={handleChange}
              className={inputClass} rows={2} placeholder="Full address..." />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Saving...' : driver ? 'Update Driver' : 'Add Driver'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}