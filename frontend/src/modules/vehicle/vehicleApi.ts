import API from '../../api/axios';
import { Vehicle, VehicleFormData } from '../../types/index';

export const fetchVehicles = async (
  search?: string,
  status?: string,
  factory?: string
): Promise<Vehicle[]> => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (status && status !== 'All') params.append('status', status);
  if (factory && factory !== 'All') params.append('factory', factory);
  const res = await API.get(`/vehicles?${params.toString()}`);
  return res.data;
};

export const createVehicle = async (data: VehicleFormData): Promise<Vehicle> => {
  const res = await API.post('/vehicles', data);
  return res.data;
};

export const updateVehicle = async (id: string, data: Partial<VehicleFormData>): Promise<Vehicle> => {
  const res = await API.put(`/vehicles/${id}`, data);
  return res.data;
};

export const assignDriver = async (vehicleId: string, driverId: string | null): Promise<Vehicle> => {
  const res = await API.put(`/vehicles/${vehicleId}/assign-driver`, { driverId });
  return res.data;
};

export const deleteVehicle = async (id: string): Promise<void> => {
  await API.delete(`/vehicles/${id}`);
};