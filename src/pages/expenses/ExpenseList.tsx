import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useExpenses, ExpenseCategory, ExpenseStatus } from '../../contexts/ExpenseContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Plus, 
  Search, 
  Filter, 
  ChevronDown,
  Check,
  X,
  Clock,
  SlidersHorizontal,
  FileText
} from 'lucide-react';

// Define filters
type Filters = {
  status: ExpenseStatus | 'all';
  category: ExpenseCategory | 'all';
  dateRange: 'all' | 'last7days' | 'last30days' | 'last90days' | 'custom';
  startDate?: string;
  endDate?: string;
  searchQuery: string;
};

const ExpenseList: React.FC = () => {
  const { expenses, loading } = useExpenses();
  const { checkRole } = useAuth();
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [filteredExpenses, setFilteredExpenses] = useState(expenses);
  const [filters, setFilters] = useState<Filters>({
    status: 'all',
    category: 'all',
    dateRange: 'all',
    searchQuery: '',
  });

  // Status options
  const statusOptions: { value: ExpenseStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
  ];

  // Category options
  const categoryOptions: { value: ExpenseCategory | 'all'; label: string }[] = [
    { value: 'all', label: 'All Categories' },
    { value: 'travel', label: 'Travel' },
    { value: 'meals', label: 'Meals' },
    { value: 'accommodation', label: 'Accommodation' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'office', label: 'Office Supplies' },
    { value: 'other', label: 'Other' },
  ];

  // Date range options
  const dateRangeOptions: { value: string; label: string }[] = [
    { value: 'all', label: 'All Time' },
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'last90days', label: 'Last 90 Days' },
    { value: 'custom', label: 'Custom Range' },
  ];

  // Apply filters
  useEffect(() => {
    let result = [...expenses];

    // Filter by status
    if (filters.status !== 'all') {
      result = result.filter(expense => expense.status === filters.status);
    }

    // Filter by category
    if (filters.category !== 'all') {
      result = result.filter(expense => expense.category === filters.category);
    }

    // Filter by date range
    if (filters.dateRange !== 'all') {
      const today = new Date();
      let startDate: Date;

      switch (filters.dateRange) {
        case 'last7days':
          startDate = new Date(today);
          startDate.setDate(today.getDate() - 7);
          result = result.filter(expense => new Date(expense.date) >= startDate);
          break;
        case 'last30days':
          startDate = new Date(today);
          startDate.setDate(today.getDate() - 30);
          result = result.filter(expense => new Date(expense.date) >= startDate);
          break;
        case 'last90days':
          startDate = new Date(today);
          startDate.setDate(today.getDate() - 90);
          result = result.filter(expense => new Date(expense.date) >= startDate);
          break;
        case 'custom':
          if (filters.startDate) {
            const customStartDate = new Date(filters.startDate);
            result = result.filter(expense => new Date(expense.date) >= customStartDate);
          }
          if (filters.endDate) {
            const customEndDate = new Date(filters.endDate);
            customEndDate.setDate(customEndDate.getDate() + 1); // Include the end date
            result = result.filter(expense => new Date(expense.date) < customEndDate);
          }
          break;
      }
    }

    // Filter by search query
    if (filters.searchQuery.trim() !== '') {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(expense => 
        expense.title.toLowerCase().includes(query) ||
        expense.description.toLowerCase().includes(query) ||
        expense.category.toLowerCase().includes(query)
      );
    }

    setFilteredExpenses(result);
  }, [expenses, filters]);

  const toggleFilterMenu = () => {
    setIsFilterMenuOpen(!isFilterMenuOpen);
  };

  const handleFilterChange = (key: keyof Filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      status: 'all',
      category: 'all',
      dateRange: 'all',
      searchQuery: '',
    });
  };

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

  // Total amount of filtered expenses
  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Expenses</h1>
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row sm:space-x-3">
          <Link
            to="/expenses/new"
            className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Expense
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <div className="flex flex-wrap items-center justify-between">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mr-4">
              Expense List
            </h3>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mt-3 sm:mt-0 w-full sm:w-auto">
              {/* Search input */}
              <div className="relative w-full sm:w-64 md:w-80">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search expenses..."
                  value={filters.searchQuery}
                  onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                />
              </div>

              {/* Filter button */}
              <button
                type="button"
                onClick={toggleFilterMenu}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </button>
            </div>
          </div>

          {/* Expanded filter section */}
          {isFilterMenuOpen && (
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 gap-y-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4">
              {/* Status filter */}
              <div>
                <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  id="status-filter"
                  name="status"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category filter */}
              <div>
                <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  id="category-filter"
                  name="category"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date range filter */}
              <div>
                <label htmlFor="date-range-filter" className="block text-sm font-medium text-gray-700">
                  Date Range
                </label>
                <select
                  id="date-range-filter"
                  name="dateRange"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={filters.dateRange}
                  onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                >
                  {dateRangeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom date range */}
              {filters.dateRange === 'custom' && (
                <>
                  <div>
                    <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">
                      Start Date
                    </label>
                    <input
                      type="date"
                      id="start-date"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={filters.startDate || ''}
                      onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">
                      End Date
                    </label>
                    <input
                      type="date"
                      id="end-date"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={filters.endDate || ''}
                      onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    />
                  </div>
                </>
              )}

              {/* Reset filters button */}
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="overflow-x-auto">
          {filteredExpenses.length > 0 ? (
            <>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expense
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">View</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredExpenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{expense.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{expense.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-gray-100 text-gray-800 capitalize">
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(expense.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(expense.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full items-center gap-1 ${getStatusBadge(expense.status)}`}>
                          {getStatusIcon(expense.status)}
                          <span className="capitalize">{expense.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link to={`/expenses/${expense.id}`} className="text-blue-600 hover:text-blue-900">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-sm font-medium text-gray-900">
                      Total: {filteredExpenses.length} {filteredExpenses.length === 1 ? 'expense' : 'expenses'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(totalAmount)}
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No expenses found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filters.searchQuery || filters.status !== 'all' || filters.category !== 'all' || filters.dateRange !== 'all' ? 
                  'Try adjusting your filters to see more results.' : 
                  'Get started by creating a new expense.'}
              </p>
              <div className="mt-6">
                <Link
                  to="/expenses/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Expense
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseList;