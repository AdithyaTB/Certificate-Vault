import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define our single API slice object
export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:5000/api',
        prepareHeaders: (headers, { getState }) => {
            // By default, if we have a token in the store (or localStorage), let's use that for authenticated requests
            const token = localStorage.getItem('token');
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['User', 'Certificate', 'Category', 'Analytics', 'Share', 'Folder'],
    endpoints: (builder) => ({
        // Auth
        login: builder.mutation({
            query: (credentials) => ({
                url: '/auth/login',
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ['User'],
        }),
        register: builder.mutation({
            query: (userData) => ({
                url: '/auth/register',
                method: 'POST',
                body: userData,
            }),
            invalidatesTags: ['User'],
        }),
        getMe: builder.query({
            query: () => '/auth/me',
            providesTags: ['User'],
        }),
        updateProfile: builder.mutation({
            query: (userData) => ({
                url: '/auth/update-profile',
                method: 'PUT',
                body: userData,
            }),
            invalidatesTags: ['User'],
        }),
        changePassword: builder.mutation({
            query: (body) => ({
                url: '/auth/change-password',
                method: 'PUT',
                body,
            }),
        }),

        // Certificates
        getCertificates: builder.query({
            query: (queryString = '') => `/certificates${queryString ? `?${queryString}` : ''}`,
            providesTags: ['Certificate'],
        }),
        getCertificateById: builder.query({
            query: (id) => `/certificates/${id}`,
            providesTags: ['Certificate'],
        }),
        uploadCertificate: builder.mutation({
            query: (formData) => ({
                url: '/certificates/upload',
                method: 'POST',
                body: formData,
                // When using FormData, fetchBaseQuery handles setting the correct boundary
            }),
            invalidatesTags: ['Certificate', 'Analytics'],
        }),
        updateCertificate: builder.mutation({
            query: ({ id, ...patch }) => ({
                url: `/certificates/${id}`,
                method: 'PUT',
                body: patch,
            }),
            invalidatesTags: ['Certificate', 'Analytics'],
        }),
        deleteCertificate: builder.mutation({
            query: (id) => ({
                url: `/certificates/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Certificate', 'Analytics'],
        }),

        // Categories
        getCategories: builder.query({
            query: () => '/categories',
            providesTags: ['Category'],
        }),
        createCategory: builder.mutation({
            query: (categoryData) => ({
                url: '/categories',
                method: 'POST',
                body: categoryData,
            }),
            invalidatesTags: ['Category'],
        }),
        deleteCategory: builder.mutation({
            query: (id) => ({
                url: `/categories/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Category'],
        }),

        // Folders
        getFolders: builder.query({
            query: () => '/folders',
            providesTags: ['Folder'],
        }),
        createFolder: builder.mutation({
            query: (folderData) => ({
                url: '/folders',
                method: 'POST',
                body: folderData,
            }),
            invalidatesTags: ['Folder'],
        }),
        deleteFolder: builder.mutation({
            query: (id) => ({
                url: `/folders/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Folder', 'Certificate'],
        }),

        // Analytics
        getDashboardStats: builder.query({
            query: () => '/analytics/dashboard',
            providesTags: ['Analytics'],
        }),

        // Share
        generateShareLink: builder.mutation({
            query: ({ certificateId, expiresAt }) => ({
                url: `/share/${certificateId}`,
                method: 'POST',
                body: { expiresAt },
            }),
            invalidatesTags: ['Share'],
        }),
        getPublicCertificate: builder.query({
            query: (token) => `/public/${token}`,
        }),
    }),
});

export const {
    useLoginMutation,
    useRegisterMutation,
    useGetMeQuery,
    useUpdateProfileMutation,
    useChangePasswordMutation,
    useGetCertificatesQuery,
    useGetCertificateByIdQuery,
    useUploadCertificateMutation,
    useUpdateCertificateMutation,
    useDeleteCertificateMutation,
    useGetCategoriesQuery,
    useCreateCategoryMutation,
    useDeleteCategoryMutation,
    useGetFoldersQuery,
    useCreateFolderMutation,
    useDeleteFolderMutation,
    useGetDashboardStatsQuery,
    useGenerateShareLinkMutation,
    useGetPublicCertificateQuery,
} = apiSlice;
