import { API_BASE_URL } from '@env';

import { supabase } from '../src/shared/lib/supabase';

type ApiRequestOptions = {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: unknown;
    authenticated?: boolean;
};

export class ApiService {

    static async request<T>(
        endpoint: string,
        options: ApiRequestOptions = {}
    ): Promise<T> {
        const {
            method = 'GET',
            body,
            authenticated = true,
        } = options;

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (authenticated) {
            const { data } = await supabase.auth.getSession();

            const token = data.session?.access_token;

            if (!token) {
                throw new Error('Usuário não autenticado.');
            }

            headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        });

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(
                responseData?.message ||
                'Erro ao comunicar com a API.'
            );
        }

        return responseData as T;
    }

    static async get<T>(
        endpoint: string,
        authenticated = true
    ): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'GET',
            authenticated,
        });
    }

    static async post<T>(
        endpoint: string,
        body?: unknown,
        authenticated = true
    ): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body,
            authenticated,
        });
    }
}