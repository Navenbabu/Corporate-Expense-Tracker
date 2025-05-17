import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useExpenses } from '../../contexts/ExpenseContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Edit,
  ArrowLeft,
  Trash2,
  Check,
  X,
  FileText,
  Calendar,
  Tag,
  DollarSign,
  Clock,
  User,
  MessageSquare,
  SendHorizonal
} from 'lucide-react';

const ExpenseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getExpenseById, deleteExpense, submitExpense, approveExpense, rejectExpense, loading } = useExpenses();
  const { user, checkRole } = useAuth();
  const expense = id ? getExpenseById(id) : undefined;

  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format datetime
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Check if user can edit
  const canEdit = () => {
    if (!user || !expense) return false;
    return expense.submittedBy === user.id && (expense.status === 'draft' || expense.status === 'rejected');
  };

  // Check if user can delete
  const canDelete = () => {
    if (!user || !expense) return false;
    return expense.submittedBy === user.id && expense.status === 'draft';
  };

  // Check if user can approve/reject
  const canReview = () => {
    if (!user || !expense) return false;
    return checkRole(['manager', 'admin']) && expense.status === 'submitted';
  };

  // Check if user can submit
  const canSubmit = () => {
    if (!user || !expense) return false;
    return expense.submittedBy === user.id && expense.status === 'draft';
  };

  // Handle delete
  const handleDelete = async () => {
    if (!id || !expense) return;
    
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }
    
    try {
      await deleteExpense(id);
      toast.success('Expense deleted successfully');
      navigate('/expenses');
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Failed to delete expense');
    }
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!id || !expense) return;
    
    setIsSubmitting(true);
    try {
      await submitExpense(id);
      toast.success('Expense submitted for approval');
      // Refresh the page to show updated status
      navigate(`/expenses/${id}`);
    } catch (error) {
      console.error('Error submitting expense:', error);
      toast.error('Failed to submit expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle approve
  const handleApprove = async () => {
    if (!id || !expense) return;
    
    setIsApproving(true);
    try {
      await approveExpense(id, comments);
      toast.success('Expense approved');
      setIsApproving(false);
      // Refresh the page to show updated status
      navigate(`/expenses/${id}`);
    } catch (error) {
      console.error('Error approving expense:', error);
      toast.error('Failed to approve expense');
      setIsApproving(false);
    }
  };

  // Handle reject
  const handleReject = async () => {
    if (!id || !expense) return;
    
    if (!comments.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    
    setIsRejecting(true);
    try {
      await rejectExpense(id, comments);
      toast.success('Expense rejected');
      setIsRejecting(false);
      // Refresh the page to show updated status
      navigate(`/expenses/${id}`);
    } catch (error) {
      console.error('Error rejecting expense:', error);
      toast.error('Failed to reject expense');
      setIsRejecting(false);
    }
  };

  // Get status badge class
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Expense not found</h3>
        <p className="mt-1 text-sm text-gray-500">The expense you're looking for doesn't exist or you don't have permission to view it.</p>
        <div className="mt-6">
          <Link
            to="/expenses"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Expenses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center">
          <Link to="/expenses" className="mr-4 text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">Expense Details</h1>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
          {canEdit() && (
            <Link
              to={`/expenses/${id}/edit`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          )}
          {canDelete() && (
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </button>
          )}
          {canSubmit() && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <SendHorizonal className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
            </button>
          )}
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="border-b border-gray-200 px-4 py-5 sm:px-6">
          <div className="flex flex-wrap items-center justify-between">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {expense.title}
            </h3>
            <span className={`mt-2 sm:mt-0 px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full items-center gap-1 ${getStatusBadge(expense.status)}`}>
              {expense.status === 'draft' && <Clock className="h-4 w-4" />}
              {expense.status === 'submitted' && <Clock className="h-4 w-4" />}
              {expense.status === 'approved' && <Check className="h-4 w-4" />}
              {expense.status === 'rejected' && <X className="h-4 w-4" />}
              <span className="capitalize">{expense.status}</span>
            </span>
          </div>
        </div>
        <div className="px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <DollarSign className="h-4 w-4 mr-1" />
                Amount
              </dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900">
                {formatCurrency(expense.amount)}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Date
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {formatDate(expense.date)}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <Tag className="h-4 w-4 mr-1" />
                Category
              </dt>
              <dd className="mt-1 text-sm text-gray-900 capitalize">
                {expense.category}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <User className="h-4 w-4 mr-1" />
                Submitted By
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {expense.submittedByName}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Submitted At
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {formatDateTime(expense.submittedAt)}
              </dd>
            </div>
            {(expense.status === 'approved' || expense.status === 'rejected') && (
              <>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    Reviewed By
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {expense.reviewedByName}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Reviewed At
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {expense.reviewedAt ? formatDateTime(expense.reviewedAt) : 'N/A'}
                  </dd>
                </div>
              </>
            )}
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <FileText className="h-4 w-4 mr-1" />
                Description
              </dt>
              <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">
                {expense.description}
              </dd>
            </div>
            {expense.receiptUrl && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Receipt</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <a
                    href={expense.receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    View Receipt
                  </a>
                </dd>
              </div>
            )}
            {expense.comments && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Comments
                </dt>
                <dd className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                  {expense.comments}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Approval/Rejection Section for Managers */}
        {canReview() && (
          <div className="px-4 py-5 sm:px-6 bg-gray-50 border-t border-gray-200">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Review Expense</h4>
            <div className="space-y-4">
              <div>
                <label htmlFor="comments" className="block text-sm font-medium text-gray-700">
                  Comments (required for rejection)
                </label>
                <div className="mt-1">
                  <textarea
                    id="comments"
                    name="comments"
                    rows={3}
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Add any comments or feedback..."
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0">
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={isApproving || isRejecting}
                  className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  <Check className="h-4 w-4 mr-2" />
                  {isApproving ? 'Approving...' : 'Approve'}
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={isApproving || isRejecting}
                  className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  <X className="h-4 w-4 mr-2" />
                  {isRejecting ? 'Rejecting...' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseDetail;