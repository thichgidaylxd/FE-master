// Redux slice for user state management
export interface UserState {
  profile: any | null;
  preferences: any;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  profile: null,
  preferences: {},
  loading: false,
  error: null,
};

// This would be implemented with Redux Toolkit
// For now, just exporting the interface and initial state
export { initialState };
