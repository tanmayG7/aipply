import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getUserProfile } from "@/lib/firebaseConfig/firebaseConfig";

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
}

interface UserState {
  profile: UserProfile | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: UserState = {
  profile: null,
  status: "idle",
  error: null,
};

export const fetchUserProfile = createAsyncThunk(
  "user/fetchUserProfile",
  async (userId: string) => {
    const profile = await getUserProfile(userId);
    return {
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
      email: profile.email || "",
    };
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.profile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      });
  },
});

export default userSlice.reducer;
