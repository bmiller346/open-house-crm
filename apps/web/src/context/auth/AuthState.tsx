'use client';

//* Dependencies
import React, { useReducer, ReactNode, useEffect } from "react";
import axios from "axios";
import authReducer from "./authReducer";
import setAuthToken from "../../utils/setAuthToken";

//* Action types
import {
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  USER_LOADED,
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  CLEAR_ERRORS,
  UPDATE_USER
} from "../types";

//* State context
import AuthContext from "./authContext";
import { User } from "./authContext";

interface AuthStateProps {
  children: ReactNode;
}

interface FormData {
  name?: string;
  email: string;
  password: string;
}

interface AuthState {
  token: string | null;
  isAuthenticated: boolean | null;
  loading: boolean;
  user: User | null;
  error: string | null;
}

//* Exported context component
const AuthState: React.FC<AuthStateProps> = ({ children }) => {
  const initialState: AuthState = {
    token: typeof window !== 'undefined' ? localStorage.getItem("authToken") : null,
    isAuthenticated: null,
    loading: true,
    user: null,
    error: null,
  };

  //* Initializes state using reducer
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set auth token on initial load only
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setAuthToken(token);
    }
  }, []); // Empty dependency array - only run once on mount

  //* Load user
  const loadUser = async () => {
    const token = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      setAuthToken(token);
      
      try {
        // First try to use stored user data
        const userData = JSON.parse(storedUser);
        dispatch({ type: USER_LOADED, payload: userData });
        
        // Then verify with backend
        const res = await axios.get("/api/auth", {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Workspace-ID': userData.workspaceId || ''
          }
        });
        
        dispatch({ type: USER_LOADED, payload: res.data });
        localStorage.setItem('user', JSON.stringify(res.data));
      } catch (err) {
        console.error('Auth verification failed:', err);
        // Use stored data if backend verification fails
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          dispatch({ type: USER_LOADED, payload: userData });
        } else {
          dispatch({ type: AUTH_ERROR });
        }
      }
    } else {
      dispatch({ type: AUTH_ERROR });
    }
  };

  // Login with token and user data (for OAuth)
  const login = (token: string, userData: User) => {
    // Only set token if it's different from current
    if (token !== state.token) {
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setAuthToken(token);
      
      dispatch({
        type: LOGIN_SUCCESS,
        payload: { token, user: userData }
      });
    }
  };

  //* Register user
  const register = async (formData: FormData) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    try {
      const res = await axios.post("/api/users", formData, config);
      dispatch({
        type: REGISTER_SUCCESS,
        payload: res.data,
      });
      loadUser();
    } catch (err: any) {
      dispatch({
        type: REGISTER_FAIL,
        payload: err.response?.data?.msg || 'Registration failed',
      });
    }
  };

  //* Logout
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('workspaceId');
    setAuthToken(null);
    dispatch({ type: LOGOUT });
  };

  //* Clear errors
  const clearErrors = () => dispatch({ type: CLEAR_ERRORS });

  //* Update user
  const updateUser = async (user: User) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
        'X-Workspace-ID': user.workspaceId || ''
      },
    };

    try {
      const res = await axios.put(`/api/auth/${user.id}`, user, config);
      dispatch({
        type: UPDATE_USER,
        payload: res.data,
      });
      localStorage.setItem('user', JSON.stringify(res.data));
    } catch (err: any) {
      dispatch({
        type: AUTH_ERROR,
        payload: err.response?.msg || 'Update failed'
      });
    }
  };

  //* Defines state data that is returned through the provider
  return (
    <AuthContext.Provider
      value={{
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        loading: state.loading,
        user: state.user,
        error: state.error,
        register,
        loadUser,
        login,
        logout,
        clearErrors,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthState;
