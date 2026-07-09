import API from '../../api/axios';
import { Driver, DriverFormData } from '../../types/index';



export const fetchDrivers = async (
  search?: string,
  status?: string,
  factory?: string
): Promise<Driver[]> => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (status && status !== 'All') params.append('status', status);
  if (factory && factory !== 'All') params.append('factory', factory);

  const res = await API.get(`/drivers?${params.toString()}`);
  return res.data;
};

export const createDriver = async (data: DriverFormData): Promise<Driver> => {
  const res = await API.post('/drivers', data);
  return res.data;
};

export const updateDriver = async (id: string, data: Partial<DriverFormData>): Promise<Driver> => {
  const res = await API.put(`/drivers/${id}`, data);
  return res.data;
};

export const deleteDriver = async (id: string): Promise<void> => {
  await API.delete(`/drivers/${id}`);
};

