import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

export type ExpenseStatus = 'draft' | 'submitted' | 'approved' | 'rejected';
export type ExpenseCategory = 'travel' | 'meals' | 'accommodation' | 'equipment' | 'office' | 'other';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string;
  category: ExpenseCategory;
  description: string;
  status: ExpenseStatus;
  receiptUrl?: string;
  submittedBy: string;
  submittedByName: string;
  submittedAt: string;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  comments?: string;
}

interface ExpenseContextType {
  expenses: Expense[];
  loading: boolean;
  error: string | null;
  getExpenseById: (id: string) => Expense | undefined;
  createExpense: (expense: Omit<Expense, 'id' | 'submittedBy' | 'submittedByName' | 'submittedAt'>) => Promise<Expense>;
  updateExpense: (id: string, expense: Partial<Expense>) => Promise<Expense>;
  deleteExpense: (id: string) => Promise<void>;
  submitExpense: (id: string) => Promise<Expense>;
  approveExpense: (id: string, comments?: string) => Promise<Expense>;
  rejectExpense: (id: string, comments: string) => Promise<Expense>;
}

// Initial mock expenses
const INITIAL_EXPENSES: Expense[] = [
  {
    id: '1',
    title: 'Business Trip to New York',
    amount: 1250.75,
    date: '2023-10-15',
    category: 'travel',
    description: 'Flight and taxi expenses for the quarterly meeting',
    status: 'approved',
    receiptUrl: 'https://example.com/receipt1.pdf',
    submittedBy: '1',
    submittedByName: 'John Employee',
    submittedAt: '2023-10-16T10:30:00Z',
    reviewedBy: '2',
    reviewedByName: 'Sarah Manager',
    reviewedAt: '2023-10-17T14:20:00Z'
  },
  {
    id: '2',
    title: 'Team Lunch',
    amount: 187.50,
    date: '2023-10-20',
    category: 'meals',
    description: 'Team lunch after project completion',
    status: 'submitted',
    submittedBy: '1',
    submittedByName: 'John Employee',
    submittedAt: '2023-10-21T09:15:00Z'
  },
  {
    id: '3',
    title: 'New Laptop',
    amount: 1899.99,
    date: '2023-10-22',
    category: 'equipment',
    description: 'Replacement laptop for development team',
    status: 'rejected',
    receiptUrl: 'https://example.com/receipt3.pdf',
    submittedBy: '1',
    submittedByName: 'John Employee',
    submittedAt: '2023-10-23T11:45:00Z',
    reviewedBy: '2',
    reviewedByName: 'Sarah Manager',
    reviewedAt: '2023-10-24T16:30:00Z',
    comments: 'Please use the standard equipment request process instead'
  }
];

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize expenses in localStorage if not present
  useEffect(() => {
    const storedExpenses = localStorage.getItem('expenses');
    if (!storedExpenses) {
      localStorage.setItem('expenses', JSON.stringify(INITIAL_EXPENSES));
    }
    loadExpenses();
  }, []);

  // Load expenses based on user role
  const loadExpenses = async () => {
    setLoading(true);
    try {
      const storedExpenses = localStorage.getItem('expenses');
      let allExpenses = storedExpenses ? JSON.parse(storedExpenses) : [];
      
      // Filter expenses based on user role
      if (user?.role === 'employee') {
        allExpenses = allExpenses.filter((e: Expense) => e.submittedBy === user.id);
      }
      // Managers and admins see all expenses
      
      setExpenses(allExpenses);
    } catch (err) {
      setError('Failed to load expenses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Reload expenses when user changes
  useEffect(() => {
    if (user) {
      loadExpenses();
    }
  }, [user]);

  const getExpenseById = (id: string) => {
    return expenses.find(e => e.id === id);
  };

  const createExpense = async (
    expenseData: Omit<Expense, 'id' | 'submittedBy' | 'submittedByName' | 'submittedAt'>
  ): Promise<Expense> => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      
      if (!user) throw new Error('User not authenticated');

      const newExpense: Expense = {
        ...expenseData,
        id: Date.now().toString(),
        submittedBy: user.id,
        submittedByName: user.name,
        submittedAt: new Date().toISOString(),
        status: 'draft'
      };
      
      // Get all expenses and add new one
      const storedExpenses = localStorage.getItem('expenses');
      const allExpenses = storedExpenses ? JSON.parse(storedExpenses) : [];
      const updatedExpenses = [...allExpenses, newExpense];
      
      // Save to localStorage
      localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
      
      // Update state with filtered expenses based on user role
      await loadExpenses();
      
      return newExpense;
    } catch (err) {
      setError('Failed to create expense');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateExpense = async (id: string, expenseData: Partial<Expense>): Promise<Expense> => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      
      // Get all expenses from localStorage
      const storedExpenses = localStorage.getItem('expenses');
      const allExpenses = storedExpenses ? JSON.parse(storedExpenses) : [];
      
      const expenseIndex = allExpenses.findIndex((e: Expense) => e.id === id);
      if (expenseIndex === -1) throw new Error('Expense not found');
      
      const updatedExpense = { ...allExpenses[expenseIndex], ...expenseData };
      allExpenses[expenseIndex] = updatedExpense;
      
      // Save to localStorage
      localStorage.setItem('expenses', JSON.stringify(allExpenses));
      
      // Update state with filtered expenses based on user role
      await loadExpenses();
      
      return updatedExpense;
    } catch (err) {
      setError('Failed to update expense');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteExpense = async (id: string): Promise<void> => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      
      // Get all expenses from localStorage
      const storedExpenses = localStorage.getItem('expenses');
      const allExpenses = storedExpenses ? JSON.parse(storedExpenses) : [];
      
      const updatedExpenses = allExpenses.filter((e: Expense) => e.id !== id);
      
      // Save to localStorage
      localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
      
      // Update state with filtered expenses based on user role
      await loadExpenses();
    } catch (err) {
      setError('Failed to delete expense');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const submitExpense = async (id: string): Promise<Expense> => {
    return updateExpense(id, { status: 'submitted' });
  };

  const approveExpense = async (id: string, comments?: string): Promise<Expense> => {
    if (!user) throw new Error('User not authenticated');
    
    return updateExpense(id, { 
      status: 'approved',
      reviewedBy: user.id,
      reviewedByName: user.name,
      reviewedAt: new Date().toISOString(),
      comments
    });
  };

  const rejectExpense = async (id: string, comments: string): Promise<Expense> => {
    if (!user) throw new Error('User not authenticated');
    
    return updateExpense(id, { 
      status: 'rejected',
      reviewedBy: user.id,
      reviewedByName: user.name,
      reviewedAt: new Date().toISOString(),
      comments
    });
  };

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        loading,
        error,
        getExpenseById,
        createExpense,
        updateExpense,
        deleteExpense,
        submitExpense,
        approveExpense,
        rejectExpense
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};