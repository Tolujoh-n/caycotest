import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../config/api';
import { toast } from 'react-hot-toast';

const InvoiceDetail = () => {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      const response = await api.get(`/invoices/${id}`);
      setInvoice(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch invoice');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!invoice) return <div>Invoice not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Link to="/invoices" className="text-primary-600 hover:text-primary-700">← Back to Invoices</Link>
        <button onClick={handlePrint} className="btn btn-primary">Print Invoice</button>
      </div>

      <div className="card max-w-4xl mx-auto" id="invoice-print">
        <div className="border-b pb-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
          <p className="text-gray-600 mt-2">Invoice #{invoice.invoiceNumber}</p>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Bill To:</h3>
            <p className="text-gray-700">
              {invoice.customerId?.firstName} {invoice.customerId?.lastName}<br />
              {invoice.customerId?.email}
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-600">Issue Date: {new Date(invoice.issueDate).toLocaleDateString()}</p>
            {invoice.dueDate && (
              <p className="text-gray-600">Due Date: {new Date(invoice.dueDate).toLocaleDateString()}</p>
            )}
          </div>
        </div>

        <table className="min-w-full mb-6">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-4">Description</th>
              <th className="text-right py-3 px-4">Quantity</th>
              <th className="text-right py-3 px-4">Unit Price</th>
              <th className="text-right py-3 px-4">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lineItems?.map((item, idx) => (
              <tr key={idx} className="border-b">
                <td className="py-3 px-4">{item.description}</td>
                <td className="text-right py-3 px-4">{item.quantity}</td>
                <td className="text-right py-3 px-4">${item.unitPrice?.toLocaleString()}</td>
                <td className="text-right py-3 px-4">${item.total?.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan="3" className="text-right py-3 px-4 font-semibold">Subtotal</td>
              <td className="text-right py-3 px-4 font-semibold">${(invoice.subtotal || 0).toLocaleString()}</td>
            </tr>
            {invoice.taxAmount > 0 && (
              <tr>
                <td colSpan="3" className="text-right py-3 px-4">Tax ({invoice.taxRate}%)</td>
                <td className="text-right py-3 px-4">${(invoice.taxAmount || 0).toLocaleString()}</td>
              </tr>
            )}
            <tr>
              <td colSpan="3" className="text-right py-3 px-4 font-bold text-lg">Total</td>
              <td className="text-right py-3 px-4 font-bold text-lg">${(invoice.total || 0).toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>

        {invoice.notes && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold text-gray-900 mb-2">Notes:</h3>
            <p className="text-gray-700">{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceDetail;