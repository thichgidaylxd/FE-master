// Redux slice for authentication state management
export interface AuthState {
  user: any | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// This would be implemented with Redux Toolkit
// For now, just exporting the interface and initial state
export { initialState };
