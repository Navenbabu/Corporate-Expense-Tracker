import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ExpenseProvider } from './contexts/ExpenseContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard';
import ExpenseList from './pages/expenses/ExpenseList';
import ExpenseForm from './pages/expenses/ExpenseForm';
import ExpenseDetail from './pages/expenses/ExpenseDetail';
import ReportPage from './pages/reports/ReportPage';
import UserManagement from './pages/admin/UserManagement';
import MainLayout from './components/layouts/MainLayout';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <ExpenseProvider>
        <Router>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="expenses">
                <Route index element={<ExpenseList />} />
                <Route path="new" element={<ExpenseForm />} />
                <Route path=":id" element={<ExpenseDetail />} />
                <Route path=":id/edit" element={<ExpenseForm />} />
              </Route>
              <Route path="reports" element={<ReportPage />} />
              <Route path="admin/users" element={<UserManagement />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ExpenseProvider>
    </AuthProvider>
  );
}

export default App;