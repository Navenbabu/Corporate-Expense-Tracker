import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useExpenses } from '../contexts/ExpenseContext';
import {
  CreditCard,
  TrendingUp,
  AlertCircle,
  Check,
  X,
  Clock,
  Plus,
  ChevronRight
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, checkRole } = useAuth();
  const { expenses, loading } = useExpenses();

  // Calculate summary statistics
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const pendingExpenses = expenses.filter(e => e.status === 'submitted').length;
  const approvedExpenses = expenses.filter(e => e.status === 'approved').length;
  const rejectedExpenses = expenses.filter(e => e.status === 'rejected').length;
  
  const pendingAmount = expenses
    .filter(e => e.status === 'submitted')
    .reduce((sum, expense) => sum + expense.amount, 0);
    
  const approvedAmount = expenses
    .filter(e => e.status === 'approved')
    .reduce((sum, expense) => sum + expense.amount, 0);

  // Get recent expenses
  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 5);

  // Get expense categories for chart
  const expensesByCategory = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Clock className="h-4 w-4" />;
      case 'submitted':
        return <Clock className="h-4 w-4" />;
      case 'approved':
        return <Check className="h-4 w-4" />;
      case 'rejected':
        return <X className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Welcome, {user?.name}</h1>
        <Link
          to="/expenses/new"
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Expense
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Expenses Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Expenses</dt>
                  <dd>
                    <div className="text-lg font-semibold text-gray-900">{formatCurrency(totalExpenses)}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/expenses" className="font-medium text-blue-600 hover:text-blue-500 flex items-center">
                View all expenses
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Pending Approval Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending Approval</dt>
                  <dd className="flex items-baseline">
                    <div className="text-lg font-semibold text-gray-900">{pendingExpenses}</div>
                    <div className="ml-2 text-sm text-gray-600">
                      ({formatCurrency(pendingAmount)})
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/expenses" className="font-medium text-blue-600 hover:text-blue-500 flex items-center">
                View pending expenses
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Approved Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <Check className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Approved Expenses</dt>
                  <dd className="flex items-baseline">
                    <div className="text-lg font-semibold text-gray-900">{approvedExpenses}</div>
                    <div className="ml-2 text-sm text-gray-600">
                      ({formatCurrency(approvedAmount)})
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/expenses" className="font-medium text-blue-600 hover:text-blue-500 flex items-center">
                View approved expenses
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Rejected Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                <X className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Rejected Expenses</dt>
                  <dd>
                    <div className="text-lg font-semibold text-gray-900">{rejectedExpenses}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/expenses" className="font-medium text-blue-600 hover:text-blue-500 flex items-center">
                View rejected expenses
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Recent Expenses */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Expenses
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {recentExpenses.length > 0 ? (
              recentExpenses.map((expense) => (
                <Link 
                  key={expense.id} 
                  to={`/expenses/${expense.id}`}
                  className="block hover:bg-gray-50"
                >
                  <div className="px-6 py-4 flex items-center">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-blue-600 truncate">{expense.title}</p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full items-center gap-1 whitespace-nowrap 
                                      ${getStatusBadge(expense.status)}">
                            {getStatusIcon(expense.status)}
                            <span className="capitalize">{expense.status}</span>
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 flex justify-between">
                        <div>
                          <p className="flex items-center text-sm text-gray-500">
                            <span className="capitalize">{expense.category}</span>
                            <span className="mx-1">•</span>
                            <span>{new Date(expense.date).toLocaleDateString()}</span>
                          </p>
                        </div>
                        <div>
                          <span className="inline-flex font-semibold text-gray-800">{formatCurrency(expense.amount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="px-6 py-4 text-center text-gray-500">
                No expenses found
              </div>
            )}
          </div>
          {recentExpenses.length > 0 && (
            <div className="bg-gray-50 px-6 py-3">
              <div className="text-sm">
                <Link to="/expenses" className="font-medium text-blue-600 hover:text-blue-500 flex items-center justify-center">
                  View all expenses
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Expenses By Category */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Expenses By Category
            </h3>
          </div>
          <div className="p-6">
            {Object.keys(expensesByCategory).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(expensesByCategory)
                  .sort(([, a], [, b]) => b - a)
                  .map(([category, amount]) => (
                    <div key={category}>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <span className="capitalize">{category}</span>
                        </div>
                        <span className="font-medium">{formatCurrency(amount)}</span>
                      </div>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${(amount / totalExpenses) * 100}%` }}></div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                No expense data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Manager-specific dashboard elements */}
      {checkRole(['manager', 'admin']) && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Pending Approvals
            </h3>
          </div>
          <div>
            {expenses.filter(e => e.status === 'submitted').length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Expense
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {expenses
                      .filter(expense => expense.status === 'submitted')
                      .map((expense) => (
                        <tr key={expense.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{expense.submittedByName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{expense.title}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatCurrency(expense.amount)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{new Date(expense.date).toLocaleDateString()}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                              {expense.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link to={`/expenses/${expense.id}`} className="text-blue-600 hover:text-blue-900">
                              Review
                            </Link>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                No expenses pending approval
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;