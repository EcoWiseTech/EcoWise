import React, { createContext, useContext, useState } from 'react';

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState({ show: false, severity: 'success', message: '' });

  const showAlert = (severity, message) => {
    setAlert({ show: true, severity, message });
  };

  const hideAlert = () => {
    setAlert({ ...alert, show: false});
  };

  return (
    <AlertContext.Provider value={{ alert, showAlert, hideAlert }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlert = () => useContext(AlertContext);