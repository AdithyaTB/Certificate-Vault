import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './apiSlice';
import { adminApiSlice } from './adminApiSlice';

export const store = configureStore({
    reducer: {
        [apiSlice.reducerPath]: apiSlice.reducer,
        [adminApiSlice.reducerPath]: adminApiSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware()
            .concat(apiSlice.middleware)
            .concat(adminApiSlice.middleware),
});
