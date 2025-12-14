import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext.jsx'
import { MedicationProvider } from './context/MedicationContext.jsx'
import { NotificationProvider } from './context/NotificationContext.jsx'
import { GoalsProvider } from './context/GoalsContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <NotificationProvider>
        <GoalsProvider>
          <MedicationProvider>
            <App />
          </MedicationProvider>
        </GoalsProvider>
      </NotificationProvider>
    </AuthProvider>
  </React.StrictMode>,
)
