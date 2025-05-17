import React, { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useExpenses, ExpenseCategory } from '../../contexts/ExpenseContext';
import { 
  ArrowLeft,
  Save,
  SendHorizonal,
  Upload,
  Trash2,
  AlertCircle
} from 'lucide-react';

const categories: ExpenseCategory[] = [
  'travel',
  'meals',
  'accommodation',
  'equipment',
  'office',
  'other'
];

const ExpenseForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getExpenseById, createExpense, updateExpense, submitExpense, loading } = useExpenses();
  
  const isEditMode = !!id;

  // Form state
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('travel');
  const [description, setDescription] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [fileSelected, setFileSelected] = useState<File | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Load expense data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const expense = getExpenseById(id);
      if (expense) {
        setTitle(expense.title);
        setAmount(expense.amount.toString());
        setDate(expense.date);
        setCategory(expense.category);
        setDescription(expense.description);
        setReceiptUrl(expense.receiptUrl || '');
      } else {
        // Expense not found
        toast.error('Expense not found');
        navigate('/expenses');
      }
    } else {
      // Set default date to today for new expenses
      const today = new Date();
      setDate(today.toISOString().split('T')[0]);
    }
  }, [isEditMode, id, getExpenseById, navigate]);

  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      errors.amount = 'Amount must be a positive number';
    }
    
    if (!date) {
      errors.date = 'Date is required';
    }
    
    if (!description.trim()) {
      errors.description = 'Description is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent, submitAsDraft: boolean = true) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Mock file upload
      let uploadedReceiptUrl = receiptUrl;
      if (fileSelected) {
        // In a real application, you would upload the file to a server
        // This is just a mock for demonstration purposes
        await new Promise(resolve => setTimeout(resolve, 1000));
        uploadedReceiptUrl = URL.createObjectURL(fileSelected);
      }
      
      const expenseData = {
        title,
        amount: parseFloat(amount),
        date,
        category,
        description,
        receiptUrl: uploadedReceiptUrl,
        status: 'draft' as const,
      };
      
      let savedExpense;
      
      if (isEditMode && id) {
        // Check if expense exists before updating
        const existingExpense = getExpenseById(id);
        if (!existingExpense) {
          toast.error('Cannot update: Expense no longer exists');
          navigate('/expenses');
          return;
        }
        
        savedExpense = await updateExpense(id, expenseData);
        if (!savedExpense) {
          toast.error('Failed to update expense: The expense may have been deleted');
          navigate('/expenses');
          return;
        }
        toast.success('Expense updated successfully');
      } else {
        savedExpense = await createExpense(expenseData);
        if (!savedExpense) {
          toast.error('Failed to create expense');
          return;
        }
        toast.success('Expense created successfully');
      }
      
      // Submit the expense if not saving as draft
      if (!submitAsDraft && savedExpense) {
        const submitted = await submitExpense(savedExpense.id);
        if (submitted) {
          toast.success('Expense submitted for approval');
        } else {
          toast.error('Failed to submit expense for approval');
          return;
        }
      }
      
      navigate('/expenses');
    } catch (error) {
      console.error('Error saving expense:', error);
      toast.error('Failed to save expense. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileSelected(e.target.files[0]);
    }
  };

  // Reset file selection
  const handleRemoveFile = () => {
    setFileSelected(null);
    setReceiptUrl('');
  };

  if (loading && isEditMode) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/expenses" className="mr-4 text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">
            {isEditMode ? 'Edit Expense' : 'New Expense'}
          </h1>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <form onSubmit={(e) => handleSubmit(e, true)}>
          <div className="border-b border-gray-200 px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Expense Information
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Please fill in all required fields.
            </p>
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              {/* Title */}
              <div className="sm:col-span-6">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title*
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="title"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                      formErrors.title ? 'border-red-300' : ''
                    }`}
                    placeholder="e.g., Business Trip to New York"
                  />
                  {formErrors.title && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>
                  )}
                </div>
              </div>

              {/* Amount and Date */}
              <div className="sm:col-span-3">
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                  Amount ($)*
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    name="amount"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md ${
                      formErrors.amount ? 'border-red-300' : ''
                    }`}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                  {formErrors.amount && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.amount}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Date*
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    name="date"
                    id="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                      formErrors.date ? 'border-red-300' : ''
                    }`}
                  />
                  {formErrors.date && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.date}</p>
                  )}
                </div>
              </div>

              {/* Category */}
              <div className="sm:col-span-3">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category*
                </label>
                <div className="mt-1">
                  <select
                    id="category"
                    name="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat} className="capitalize">
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="sm:col-span-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description*
                </label>
                <div className="mt-1">
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                      formErrors.description ? 'border-red-300' : ''
                    }`}
                    placeholder="Provide details about this expense"
                  />
                  {formErrors.description && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
                  )}
                </div>
              </div>

              {/* Receipt Upload */}
              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-gray-700">
                  Receipt
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          accept="image/*,.pdf"
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                </div>
                
                {(fileSelected || receiptUrl) && (
                  <div className="mt-3 flex items-center">
                    <div className="flex-1 bg-gray-100 rounded-md p-2 text-sm">
                      {fileSelected ? fileSelected.name : receiptUrl.split('/').pop()}
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="ml-2 flex-shrink-0 p-1 rounded-full text-gray-500 hover:text-red-500 focus:outline-none"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="px-4 py-3 bg-gray-50 sm:px-6 flex justify-between">
            <Link
              to="/expenses"
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </Link>
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                Save as Draft
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={(e) => handleSubmit(e, false)}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                <SendHorizonal className="h-4 w-4 mr-2" />
                {isEditMode ? 'Update & Submit' : 'Save & Submit'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;