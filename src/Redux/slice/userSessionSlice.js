import { createSlice } from "@reduxjs/toolkit";

const userSessionSlice = createSlice({
  name: 'userSession',
  initialState: {
    data: null,
    loading: false,
    error: null,
  },
  reducers: {
    requestUserSession: (state) => {
      state.loading = true;
      state.error = null;
    },
    requestUserSessionSuccess: (state, action) => {
      state.loading = false;
      state.data = action.payload;
    },
    requestUserSessionFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { requestUserSession, requestUserSessionSuccess, requestUserSessionFailure } = userSessionSlice.actions;
export default userSessionSlice.reducer;
