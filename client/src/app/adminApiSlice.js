import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const adminApiSlice = createApi({
    reducerPath: 'adminApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'https://certificate-vault-backend-adhi.onrender.com/api/admin',
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('adminToken');
            if (token) headers.set('authorization', `Bearer ${token}`);
            return headers;
        },
    }),
    tagTypes: ['AdminUsers', 'AdminCerts', 'AdminConfig', 'AdminLogs', 'AdminAnalytics', 'AdminStorage'],
    endpoints: (builder) => ({

        // ── Auth ──────────────────────────────────────────────────────────────
        adminLogin: builder.mutation({
            query: (credentials) => ({ url: '/login', method: 'POST', body: credentials }),
        }),

        // ── Public ────────────────────────────────────────────────────────────
        getPublicConfig: builder.query({
            query: () => '/public/config',
            providesTags: ['AdminConfig'],
        }),

        // ── Analytics ─────────────────────────────────────────────────────────
        getPlatformAnalytics: builder.query({
            query: () => '/analytics',
            providesTags: ['AdminAnalytics'],
        }),

        // ── Users ─────────────────────────────────────────────────────────────
        getAdminUsers: builder.query({
            query: (params = '') => `/users?${params}`,
            providesTags: ['AdminUsers'],
        }),
        getAdminUserDetail: builder.query({
            query: (id) => `/users/${id}`,
        }),
        getUserCertificates: builder.query({
            query: (id) => `/users/${id}/certificates`,
        }),
        updateUserRole: builder.mutation({
            query: ({ id, role }) => ({ url: `/users/${id}/role`, method: 'PATCH', body: { role } }),
            invalidatesTags: ['AdminUsers'],
        }),
        updateUserStatus: builder.mutation({
            query: ({ id, status }) => ({ url: `/users/${id}/status`, method: 'PATCH', body: { status } }),
            invalidatesTags: ['AdminUsers'],
        }),
        deleteAdminUser: builder.mutation({
            query: (id) => ({ url: `/users/${id}`, method: 'DELETE' }),
            invalidatesTags: ['AdminUsers', 'AdminAnalytics'],
        }),
        bulkDeleteUsers: builder.mutation({
            query: (ids) => ({ url: '/users/bulk', method: 'DELETE', body: { ids } }),
            invalidatesTags: ['AdminUsers', 'AdminAnalytics'],
        }),

        // ── Certificates ──────────────────────────────────────────────────────
        getAdminCertificates: builder.query({
            query: (params = '') => `/certificates?${params}`,
            providesTags: ['AdminCerts'],
        }),
        moderateCertificate: builder.mutation({
            query: ({ id, action, reason }) => ({ url: `/certificates/${id}/moderate`, method: 'PATCH', body: { action, reason } }),
            invalidatesTags: ['AdminCerts'],
        }),
        deleteAdminCertificate: builder.mutation({
            query: (id) => ({ url: `/certificates/${id}`, method: 'DELETE' }),
            invalidatesTags: ['AdminCerts', 'AdminAnalytics'],
        }),
        bulkDeleteCerts: builder.mutation({
            query: (ids) => ({ url: '/certificates/bulk', method: 'DELETE', body: { ids } }),
            invalidatesTags: ['AdminCerts'],
        }),
        bulkModerateCerts: builder.mutation({
            query: ({ ids, action }) => ({ url: '/certificates/bulk-moderate', method: 'PATCH', body: { ids, action } }),
            invalidatesTags: ['AdminCerts'],
        }),

        // ── Config ────────────────────────────────────────────────────────────
        getAdminConfig: builder.query({
            query: () => '/config',
            providesTags: ['AdminConfig'],
        }),
        updateFeatureFlags: builder.mutation({
            query: (features) => ({ url: '/config/features', method: 'PATCH', body: features }),
            invalidatesTags: ['AdminConfig'],
        }),
        updateAnnouncement: builder.mutation({
            query: (announcement) => ({ url: '/config/announcement', method: 'PATCH', body: announcement }),
            invalidatesTags: ['AdminConfig'],
        }),

        // ── Issuers ───────────────────────────────────────────────────────────
        addVerifiedIssuer: builder.mutation({
            query: (issuer) => ({ url: '/issuers', method: 'POST', body: issuer }),
            invalidatesTags: ['AdminConfig'],
        }),
        deleteVerifiedIssuer: builder.mutation({
            query: (issuerId) => ({ url: `/issuers/${issuerId}`, method: 'DELETE' }),
            invalidatesTags: ['AdminConfig'],
        }),

        // ── Audit Logs ────────────────────────────────────────────────────────
        getAuditLogs: builder.query({
            query: (params = '') => `/logs?${params}`,
            providesTags: ['AdminLogs'],
        }),

        // ── Storage ───────────────────────────────────────────────────────────
        getStorageStats: builder.query({
            query: () => '/storage',
            providesTags: ['AdminStorage'],
        }),
    }),
});

export const {
    useAdminLoginMutation,
    useGetPublicConfigQuery,
    useGetPlatformAnalyticsQuery,
    useGetAdminUsersQuery,
    useGetAdminUserDetailQuery,
    useGetUserCertificatesQuery,
    useUpdateUserRoleMutation,
    useUpdateUserStatusMutation,
    useDeleteAdminUserMutation,
    useBulkDeleteUsersMutation,
    useGetAdminCertificatesQuery,
    useModerateCertificateMutation,
    useDeleteAdminCertificateMutation,
    useBulkDeleteCertsMutation,
    useBulkModerateCertsMutation,
    useGetAdminConfigQuery,
    useUpdateFeatureFlagsMutation,
    useUpdateAnnouncementMutation,
    useAddVerifiedIssuerMutation,
    useDeleteVerifiedIssuerMutation,
    useGetAuditLogsQuery,
    useGetStorageStatsQuery,
} = adminApiSlice;
