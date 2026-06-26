import { ApiEnvelope, apiClient } from '@/services/apiClient';
import { AuthResponse, LoginPayload, SignupPayload, User } from './types';

export const authApi = {
  async signup(payload: SignupPayload): Promise<AuthResponse> {
    const { data } = await apiClient.post<ApiEnvelope<AuthResponse>>('/auth/signup', payload);
    return data.data;
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await apiClient.post<ApiEnvelope<AuthResponse>>('/auth/login', payload);
    return data.data;
  },

  async me(): Promise<User> {
    const { data } = await apiClient.get<ApiEnvelope<User>>('/auth/me');
    return data.data;
  },
};
