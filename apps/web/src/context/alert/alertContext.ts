import { createContext } from "react";

interface AlertItem {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  msg: string;
}

interface AlertContextType {
  alerts: AlertItem[];
  setAlert: (msg: string, type: 'error' | 'warning' | 'info' | 'success', timeout?: number) => void;
  removeAlert: (id: string) => void;
}

const alertContext = createContext<AlertContextType | null>(null);

export default alertContext;
export type { AlertItem, AlertContextType };
