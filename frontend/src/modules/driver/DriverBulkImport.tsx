import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import API from '../../api/axios';

interface DriverRow {
  name: string;
  mobile: string;
  altMobile?: string;
  address?: string;
  aadhaar: string;
  dlNumber: string;
  dlExpiry: string;
  factory: string;
  status: string;
}

interface ImportResult {
  message: string;
  count?: number;
  errors?: string[];
}

interface DriverBulkImportProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function DriverBulkImport({ onClose, onSuccess }: DriverBulkImportProps) {
  const [preview, setPreview] = useState<DriverRow[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [importing, setImporting] = useState<boolean>(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [parseError, setParseError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setParseError('');
    setResult(null);
    setPreview([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });

        // Read first sheet
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Convert to JSON — first row becomes keys
        const rows = XLSX.utils.sheet_to_json<DriverRow>(sheet, { raw: false });

        if (rows.length === 0) {
          setParseError('No data found in the file. Make sure row 1 contains headers.');
          return;
        }

        // Check required columns exist
        const required = ['name', 'mobile', 'aadhaar', 'dlNumber', 'dlExpiry', 'factory', 'status'];
        const firstRow = rows[0];
        const missing = required.filter(col => !(col in firstRow));
        if (missing.length > 0) {
          setParseError(`Missing required columns: ${missing.join(', ')}. Check the column headers match exactly.`);
          return;
        }

        setPreview(rows);
      } catch (err) {
        setParseError('Failed to read file. Make sure it is a valid .xlsx or .csv file.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleImport = async () => {
    if (preview.length === 0) return;
    setImporting(true);
    setResult(null);
    try {
      const res = await API.post('/drivers/bulk-import', { drivers: preview });
      setResult(res.data);
      onSuccess();
    } catch (err: unknown) {
      const response = (err as any).response?.data;
      setResult(response || { message: 'Import failed. Please try again.' });
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadTemplate = () => {
    // Create a blank template with just headers
    const ws = XLSX.utils.aoa_to_sheet([
      ['name', 'mobile', 'altMobile', 'address', 'aadhaar', 'dlNumber', 'dlExpiry', 'factory', 'status'],
      ['Example Driver', '9845012345', '9845012346', 'Address here', '234567890123', 'KA-01-20200001', '2026-08-15', 'DBP', 'Active'],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Drivers');
    XLSX.writeFile(wb, 'drivers_template.xlsx');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Bulk Import Drivers</h2>
            <p className="text-xs text-gray-500 mt-0.5">Upload an Excel or CSV file to import multiple drivers at once</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
        </div>

        <div className="px-6 py-4 space-y-4">

          {/* Download template button */}
          <div className="flex items-center justify-between bg-purple-50 border border-purple-200 rounded-lg px-4 py-3">
            <div>
              <p className="text-sm font-medium text-purple-800">Need a template?</p>
              <p className="text-xs text-purple-600">Download the template, fill in your data, then upload it here</p>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="px-4 py-2 bg-purple-700 text-white text-sm rounded-md hover:bg-purple-800"
            >
              Download Template
            </button>
          </div>

          {/* File upload area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition"
          >
            <div className="text-3xl mb-2">📂</div>
            <p className="text-sm font-medium text-gray-700">
              {fileName ? fileName : 'Click to select your Excel or CSV file'}
            </p>
            <p className="text-xs text-gray-400 mt-1">Supports .xlsx and .csv</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Parse error */}
          {parseError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              {parseError}
            </div>
          )}

          {/* Preview table */}
          {preview.length > 0 && !result && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium text-gray-700">
                  Preview — {preview.length} drivers ready to import
                </p>
                <p className="text-xs text-gray-400">Showing first 5 rows</p>
              </div>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 text-gray-600 uppercase">
                    <tr>
                      <th className="px-3 py-2">#</th>
                      <th className="px-3 py-2">Name</th>
                      <th className="px-3 py-2">Mobile</th>
                      <th className="px-3 py-2">Factory</th>
                      <th className="px-3 py-2">DL Number</th>
                      <th className="px-3 py-2">DL Expiry</th>
                      <th className="px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {preview.slice(0, 5).map((row, idx) => (
                      <tr key={idx} className="bg-white">
                        <td className="px-3 py-2 text-gray-400">{idx + 1}</td>
                        <td className="px-3 py-2 font-medium text-gray-800">{row.name}</td>
                        <td className="px-3 py-2 text-gray-600">{row.mobile}</td>
                        <td className="px-3 py-2">
                          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs">
                            {row.factory}
                          </span>
                        </td>
                        <td className="px-3 py-2 font-mono text-gray-600">{row.dlNumber}</td>
                        <td className="px-3 py-2 text-gray-600">{row.dlExpiry}</td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            row.status === 'Active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {preview.length > 5 && (
                <p className="text-xs text-gray-400 mt-1 text-right">
                  ...and {preview.length - 5} more rows
                </p>
              )}
            </div>
          )}

          {/* Result message */}
          {result && (
            <div className={`border rounded-lg px-4 py-3 ${
              result.errors && result.errors.length > 0
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-green-50 border-green-200'
            }`}>
              <p className={`text-sm font-medium ${
                result.errors && result.errors.length > 0
                  ? 'text-yellow-800'
                  : 'text-green-800'
              }`}>
                {result.message}
              </p>
              {result.errors && result.errors.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {result.errors.map((err, i) => (
                    <li key={i} className="text-xs text-yellow-700">• {err}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {result ? 'Close' : 'Cancel'}
          </button>
          {preview.length > 0 && !result && (
            <button
              onClick={handleImport}
              disabled={importing}
              className="px-4 py-2 text-sm bg-purple-700 text-white rounded-md hover:bg-purple-800 disabled:opacity-50"
            >
              {importing ? 'Importing...' : `Import ${preview.length} Drivers`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}