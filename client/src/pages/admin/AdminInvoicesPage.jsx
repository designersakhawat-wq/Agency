import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Edit2,
  Printer,
  Download,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Building2,
  Calendar,
  DollarSign,
  Coins,
  Send,
  X,
  CreditCard,
  Layers,
  Sparkles,
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useBrand } from '../../context/BrandContext';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { Loader } from '../../components/common/Loader';
import { Badge } from '../../components/common/Badge';

export const AdminInvoicesPage = () => {
  const { showToast } = useToast();
  const { currencySymbol } = useCurrency();
  const { siteLogo } = useBrand();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Modal States
  const [editorOpen, setEditorOpen] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);

  // Active form state for create/edit
  const [formData, setFormData] = useState({
    id: null,
    invoiceNumber: '',
    clientName: '',
    clientEmail: '',
    clientCompany: '',
    clientAddress: '',
    clientPhone: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    status: 'UNPAID', // UNPAID | PAID | OVERDUE
    currency: '$',
    currencyCode: 'USD',
    items: [
      {
        id: '1',
        description: 'Brand Identity Design Suite & Vector Guidelines',
        quantity: 1,
        unitPrice: 280,
      },
    ],
    discountPercent: 0,
    taxPercent: 0,
    notes: 'Thank you for your business! All final source files (AI/PSD/Figma) are transferred upon full settlement.',
    paymentTerms: 'Payment due within 14 days of invoice issuance.',
    paymentMethods: 'Bank Transfer / Wise / Bkash / Nagad / PayPal',
  });

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/invoices', { status: statusFilter, search });
      if (res.success) {
        setInvoices(res.data || []);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load invoices.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter]);

  const openCreateModal = () => {
    const today = new Date().toISOString().split('T')[0];
    const due = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
    setFormData({
      id: null,
      invoiceNumber: `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      clientName: '',
      clientEmail: '',
      clientCompany: '',
      clientAddress: '',
      clientPhone: '',
      issueDate: today,
      dueDate: due,
      status: 'UNPAID',
      currency: currencySymbol || '$',
      currencyCode: currencySymbol === '৳' ? 'BDT' : 'USD',
      items: [
        {
          id: `item_${Date.now()}`,
          description: 'High-Converting Social Media Ad Creatives (Set of 5)',
          quantity: 1,
          unitPrice: 225,
        },
      ],
      discountPercent: 0,
      taxPercent: 0,
      notes: 'Thank you for your business! We appreciate the opportunity to collaborate.',
      paymentTerms: '50% project deposit / 50% on final delivery.',
      paymentMethods: 'Bank Transfer / Wise / Bkash / Nagad / PayPal / Crypto',
    });
    setEditorOpen(true);
  };

  const openEditModal = (inv) => {
    setFormData({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      clientName: inv.clientName,
      clientEmail: inv.clientEmail,
      clientCompany: inv.clientCompany || '',
      clientAddress: inv.clientAddress || '',
      clientPhone: inv.clientPhone || '',
      issueDate: inv.issueDate,
      dueDate: inv.dueDate,
      status: inv.status,
      currency: inv.currency || '$',
      currencyCode: inv.currencyCode || 'USD',
      items: Array.isArray(inv.items) && inv.items.length > 0 ? inv.items : [{ id: '1', description: 'Design Service', quantity: 1, unitPrice: 100 }],
      discountPercent: Number(inv.discountPercent) || 0,
      taxPercent: Number(inv.taxPercent) || 0,
      notes: inv.notes || '',
      paymentTerms: inv.paymentTerms || '',
      paymentMethods: inv.paymentMethods || '',
    });
    setEditorOpen(true);
  };

  // Line item helpers
  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { id: `item_${Date.now()}`, description: 'New Creative Deliverable', quantity: 1, unitPrice: 50 },
      ],
    }));
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...formData.items];
    updated[index][field] = field === 'quantity' || field === 'unitPrice' ? Number(value) || 0 : value;
    setFormData({ ...formData, items: updated });
  };

  // Calculations
  const calcSubtotal = () => {
    return formData.items.reduce((acc, item) => acc + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), 0);
  };

  const subtotal = calcSubtotal();
  const discountAmount = Math.round(subtotal * ((Number(formData.discountPercent) || 0) / 100));
  const taxAmount = Math.round((subtotal - discountAmount) * ((Number(formData.taxPercent) || 0) / 100));
  const grandTotal = subtotal - discountAmount + taxAmount;

  const handleSaveInvoicePrompt = (e) => {
    e.preventDefault();
    if (!formData.clientName || !formData.clientEmail) {
      showToast('Client Name and Email are required.', 'error');
      return;
    }
    setConfirmSaveOpen(true);
  };

  const executeSaveInvoice = async () => {
    setSaving(true);
    try {
      const payload = {
        ...formData,
        subtotal,
        totalAmount: grandTotal,
      };

      let res;
      if (formData.id) {
        res = await api.put(`/invoices/${formData.id}`, payload);
      } else {
        res = await api.post('/invoices', payload);
      }

      if (res.success) {
        showToast(formData.id ? 'Invoice updated successfully!' : 'Invoice created successfully!', 'success');
        setEditorOpen(false);
        setConfirmSaveOpen(false);
        fetchInvoices();
      } else {
        showToast(res.message || 'Failed to save invoice.', 'error');
      }
    } catch (err) {
      showToast('Error saving invoice: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const executeDeleteInvoice = async () => {
    if (!deleteTarget) return;
    try {
      const res = await api.delete(`/invoices/${deleteTarget.id}`);
      if (res.success) {
        showToast('Invoice deleted successfully.', 'success');
        setDeleteTarget(null);
        fetchInvoices();
      }
    } catch (err) {
      showToast('Delete failed: ' + err.message, 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Metrics summary
  const totalBilled = invoices.reduce((acc, inv) => acc + (Number(inv.totalAmount) || 0), 0);
  const totalPaid = invoices
    .filter((inv) => inv.status === 'PAID')
    .reduce((acc, inv) => acc + (Number(inv.totalAmount) || 0), 0);
  const totalPending = invoices
    .filter((inv) => inv.status === 'UNPAID' || inv.status === 'OVERDUE')
    .reduce((acc, inv) => acc + (Number(inv.totalAmount) || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-bold uppercase tracking-wider mb-2">
            <CreditCard className="w-4 h-4 text-teal-400" />
            <span>Client Billing & Financials</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-white">
            Client Invoice Manager & PDF Generator
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Create, send, and download printable client invoices with automated itemized breakdowns and payment details.
          </p>
        </div>

        <Button variant="primary" size="md" icon={Plus} onClick={openCreateModal} className="cursor-pointer font-bold shadow-lg">
          Create New Invoice
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl glass-card border border-zinc-800 space-y-2">
          <span className="text-xs font-semibold text-zinc-400">Total Invoiced Volume</span>
          <div className="text-2xl sm:text-3xl font-black font-display text-white font-mono">
            {currencySymbol} {totalBilled.toLocaleString()}
          </div>
          <p className="text-[11px] text-zinc-500">{invoices.length} Total Generated Invoices</p>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-emerald-500/30 bg-emerald-950/10 space-y-2">
          <span className="text-xs font-semibold text-emerald-300">Total Settled / Paid</span>
          <div className="text-2xl sm:text-3xl font-black font-display text-emerald-400 font-mono">
            {currencySymbol} {totalPaid.toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-400/80">Cleared Client Payments</p>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-amber-500/30 bg-amber-950/10 space-y-2">
          <span className="text-xs font-semibold text-amber-300">Outstanding / Pending</span>
          <div className="text-2xl sm:text-3xl font-black font-display text-amber-400 font-mono">
            {currencySymbol} {totalPending.toLocaleString()}
          </div>
          <p className="text-[11px] text-amber-400/80">Awaiting Settlement</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl glass-card border border-zinc-800">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'UNPAID', 'PAID', 'OVERDUE'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                statusFilter === status
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                  : 'text-zinc-400 hover:text-white bg-zinc-900'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by client or invoice #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchInvoices()}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500"
          />
        </div>
      </div>

      {/* Invoices List Table */}
      {loading ? (
        <Loader message="Loading invoices..." fullScreen />
      ) : invoices.length === 0 ? (
        <div className="text-center py-20 glass-card rounded-2xl border border-zinc-800 space-y-4">
          <FileText className="w-12 h-12 text-zinc-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Invoices Found</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Create your first professional invoice for branding, ad creatives, or custom design retainers.
          </p>
          <Button variant="primary" size="sm" icon={Plus} onClick={openCreateModal}>
            Create First Invoice
          </Button>
        </div>
      ) : (
        <div className="glass-card rounded-2xl border border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 uppercase font-mono text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Invoice #</th>
                  <th className="py-3.5 px-4">Client</th>
                  <th className="py-3.5 px-4">Issue / Due Date</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-white">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-white">{inv.clientName}</div>
                      <div className="text-[11px] text-zinc-500">{inv.clientCompany || inv.clientEmail}</div>
                    </td>
                    <td className="py-4 px-4 font-mono text-zinc-400">
                      <div>Issued: {inv.issueDate}</div>
                      <div className="text-[10px] text-zinc-500">Due: {inv.dueDate}</div>
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-white text-sm">
                      {inv.currency || '$'} {Number(inv.totalAmount).toLocaleString()}
                    </td>
                    <td className="py-4 px-4">
                      <Badge
                        variant={
                          inv.status === 'PAID' ? 'emerald' : inv.status === 'OVERDUE' ? 'rose' : 'amber'
                        }
                        size="sm"
                      >
                        {inv.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setPreviewInvoice(inv)}
                          className="p-1.5 rounded-lg bg-zinc-800 text-teal-300 hover:bg-teal-600 hover:text-white transition-colors cursor-pointer"
                          title="View & Print Invoice"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(inv)}
                          className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors cursor-pointer"
                          title="Edit Invoice"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(inv)}
                          className="p-1.5 rounded-lg bg-zinc-800 text-rose-400 hover:bg-rose-950 transition-colors cursor-pointer"
                          title="Delete Invoice"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* INVOICE CREATE / EDIT MODAL */}
      <Modal
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={formData.id ? 'Edit Invoice' : 'Create Client Invoice'}
        size="xl"
      >
        <form onSubmit={handleSaveInvoicePrompt} className="space-y-6 max-h-[78vh] overflow-y-auto pr-1">
          {/* Header Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
            <div>
              <label className="text-[11px] font-semibold text-zinc-300 block mb-1">Invoice Number *</label>
              <input
                type="text"
                value={formData.invoiceNumber}
                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-teal-300 font-mono focus:outline-none focus:border-teal-400"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-300 block mb-1">Issue Date</label>
              <input
                type="date"
                value={formData.issueDate}
                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-400"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-300 block mb-1">Payment Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-400"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-300 block mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-400 cursor-pointer"
              >
                <option value="UNPAID">UNPAID (Pending)</option>
                <option value="PAID">PAID (Settled)</option>
                <option value="OVERDUE">OVERDUE</option>
              </select>
            </div>
          </div>

          {/* Client Details & Currency */}
          <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Client / Recipient Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Client Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-400"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Client Email *</label>
                <input
                  type="email"
                  placeholder="john@company.com"
                  value={formData.clientEmail}
                  onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-400"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Company / Organization</label>
                <input
                  type="text"
                  placeholder="Acme Studios LLC"
                  value={formData.clientCompany}
                  onChange={(e) => setFormData({ ...formData, clientCompany: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Address / Country</label>
                <input
                  type="text"
                  placeholder="New York, USA / Dhaka, BD"
                  value={formData.clientAddress}
                  onChange={(e) => setFormData({ ...formData, clientAddress: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+1 (555) 000-0000"
                  value={formData.clientPhone}
                  onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Invoice Currency</label>
                <div className="flex gap-2">
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-teal-300 font-bold focus:outline-none focus:border-teal-400"
                  >
                    <option value="$">$ (USD / Dollar)</option>
                    <option value="৳">৳ (BDT / Taka)</option>
                    <option value="€">€ (EUR / Euro)</option>
                    <option value="£">£ (GBP / Pound)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items Builder */}
          <div className="space-y-3 p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Itemized Deliverables & Services</h4>
              <Button type="button" variant="secondary" size="sm" icon={Plus} onClick={handleAddItem}>
                Add Item
              </Button>
            </div>

            <div className="space-y-2.5">
              {formData.items.map((item, idx) => (
                <div key={item.id || idx} className="flex flex-col sm:flex-row items-center gap-3 p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                  <div className="flex-1 w-full">
                    <input
                      type="text"
                      placeholder="Item Description (e.g. Logo Design, Social Media Creatives)"
                      value={item.description}
                      onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-400"
                      required
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="w-20">
                      <input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        min="1"
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono text-center focus:outline-none focus:border-teal-400"
                        required
                      />
                    </div>

                    <div className="w-28">
                      <input
                        type="number"
                        placeholder="Price"
                        value={item.unitPrice}
                        min="0"
                        onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-teal-300 font-mono text-right focus:outline-none focus:border-teal-400"
                        required
                      />
                    </div>

                    <div className="w-24 text-right font-mono font-bold text-white text-xs">
                      {formData.currency} {(Number(item.quantity || 0) * Number(item.unitPrice || 0)).toLocaleString()}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      disabled={formData.items.length <= 1}
                      className="p-1.5 text-zinc-500 hover:text-rose-400 disabled:opacity-30 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Subtotals & Calculations */}
            <div className="flex flex-col items-end pt-3 space-y-1.5 text-xs border-t border-zinc-800">
              <div className="flex justify-between w-64 text-zinc-400">
                <span>Subtotal:</span>
                <span className="font-mono text-white font-bold">{formData.currency} {subtotal.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between w-64 text-zinc-400">
                <span className="flex items-center gap-1">
                  Discount:
                  <input
                    type="number"
                    value={formData.discountPercent}
                    onChange={(e) => setFormData({ ...formData, discountPercent: Number(e.target.value) || 0 })}
                    className="w-12 bg-zinc-950 border border-zinc-700 rounded px-1.5 py-0.5 text-right font-mono text-amber-400 text-[11px]"
                  />
                  %
                </span>
                <span className="font-mono text-amber-400">-{formData.currency} {discountAmount.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between w-64 text-zinc-400">
                <span className="flex items-center gap-1">
                  Tax / VAT:
                  <input
                    type="number"
                    value={formData.taxPercent}
                    onChange={(e) => setFormData({ ...formData, taxPercent: Number(e.target.value) || 0 })}
                    className="w-12 bg-zinc-950 border border-zinc-700 rounded px-1.5 py-0.5 text-right font-mono text-zinc-300 text-[11px]"
                  />
                  %
                </span>
                <span className="font-mono text-zinc-300">+{formData.currency} {taxAmount.toLocaleString()}</span>
              </div>

              <div className="flex justify-between w-64 pt-2 border-t border-zinc-700 text-sm font-bold text-white">
                <span className="text-teal-400">Grand Total:</span>
                <span className="font-mono text-teal-300">{formData.currency} {grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Payment & Terms */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
            <div>
              <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                Payment Methods / Bank Accounts
              </label>
              <textarea
                rows={3}
                value={formData.paymentMethods}
                onChange={(e) => setFormData({ ...formData, paymentMethods: e.target.value })}
                placeholder="e.g. Bank Account details, Bkash/Nagad number, Wise email, etc."
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                Notes & Terms of Service
              </label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="e.g. Thank you for your business..."
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setEditorOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" isLoading={saving}>
              {formData.id ? 'Save Invoice Updates' : 'Generate & Issue Invoice'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* PRINTABLE / PDF PREVIEW MODAL */}
      {previewInvoice && (
        <Modal
          isOpen={!!previewInvoice}
          onClose={() => setPreviewInvoice(null)}
          title={`Printable Invoice Sheet (${previewInvoice.invoiceNumber})`}
          size="xl"
        >
          <div className="space-y-6">
            {/* Print Header Controls */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800 print:hidden">
              <span className="text-xs text-zinc-300">
                Ready for client sharing or exporting as clean A4 PDF.
              </span>
              <div className="flex gap-2">
                <Button variant="primary" size="sm" icon={Printer} onClick={handlePrint} className="cursor-pointer font-bold">
                  Print / Save as PDF
                </Button>
              </div>
            </div>

            {/* A4 PRINTABLE INVOICE SHEET */}
            <div
              id="printable-invoice"
              className="p-8 sm:p-12 rounded-3xl bg-white text-zinc-900 border border-zinc-300 shadow-2xl space-y-8 font-sans"
            >
              {/* Top Row: Brand & Invoice Meta */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-zinc-200 pb-8">
                <div>
                  {siteLogo ? (
                    <img src={siteLogo} alt="Logo" className="h-12 w-auto object-contain mb-2" />
                  ) : (
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-teal-600 text-white font-black font-display text-xl mb-2">
                      SH
                    </div>
                  )}
                  <h2 className="text-xl font-black text-zinc-900">Md Sakhawat Hossain</h2>
                  <p className="text-xs text-zinc-500 font-medium">Creative Graphic Designer & Visual Strategist</p>
                  <p className="text-xs text-zinc-500">designersakhawat@gmail.com • Worldwide Remote</p>
                </div>

                <div className="text-left sm:text-right space-y-1">
                  <span className="text-3xl font-black font-display tracking-tight text-zinc-900 block">
                    INVOICE
                  </span>
                  <p className="text-xs font-mono font-bold text-teal-700">{previewInvoice.invoiceNumber}</p>
                  <div className="text-xs text-zinc-500 pt-2 space-y-0.5">
                    <p>Issue Date: <strong className="text-zinc-800">{previewInvoice.issueDate}</strong></p>
                    <p>Due Date: <strong className="text-zinc-800">{previewInvoice.dueDate}</strong></p>
                  </div>
                  <div className="pt-2">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
                        previewInvoice.status === 'PAID'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      Status: {previewInvoice.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bill To Info */}
              <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                  Billed To / Client:
                </span>
                <h3 className="text-base font-bold text-zinc-900">{previewInvoice.clientName}</h3>
                {previewInvoice.clientCompany && (
                  <p className="text-xs text-zinc-600 font-medium">{previewInvoice.clientCompany}</p>
                )}
                <p className="text-xs text-zinc-600">{previewInvoice.clientEmail}</p>
                {previewInvoice.clientAddress && (
                  <p className="text-xs text-zinc-500">{previewInvoice.clientAddress}</p>
                )}
                {previewInvoice.clientPhone && (
                  <p className="text-xs text-zinc-500">{previewInvoice.clientPhone}</p>
                )}
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b-2 border-zinc-900 text-zinc-900 uppercase font-mono text-[11px]">
                      <th className="py-2.5 px-2">Description</th>
                      <th className="py-2.5 px-2 text-center w-16">Qty</th>
                      <th className="py-2.5 px-2 text-right w-24">Unit Rate</th>
                      <th className="py-2.5 px-2 text-right w-28">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 text-zinc-800">
                    {(Array.isArray(previewInvoice.items) ? previewInvoice.items : []).map((item, i) => (
                      <tr key={i}>
                        <td className="py-3 px-2 font-medium">{item.description}</td>
                        <td className="py-3 px-2 text-center font-mono">{item.quantity}</td>
                        <td className="py-3 px-2 text-right font-mono">
                          {previewInvoice.currency || '$'} {Number(item.unitPrice).toLocaleString()}
                        </td>
                        <td className="py-3 px-2 text-right font-mono font-bold">
                          {previewInvoice.currency || '$'}{' '}
                          {(Number(item.quantity || 0) * Number(item.unitPrice || 0)).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total Calculation Breakdown */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-4 border-t border-zinc-200">
                <div className="space-y-3 flex-1 text-xs text-zinc-600">
                  {previewInvoice.paymentMethods && (
                    <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200">
                      <strong className="block text-zinc-900 mb-1">Payment Instructions:</strong>
                      <p className="whitespace-pre-line text-zinc-700">{previewInvoice.paymentMethods}</p>
                    </div>
                  )}

                  {previewInvoice.notes && (
                    <p className="text-[11px] text-zinc-500 italic">
                      Note: {previewInvoice.notes}
                    </p>
                  )}
                </div>

                <div className="w-full sm:w-64 space-y-1.5 text-xs text-zinc-700">
                  <div className="flex justify-between py-1 border-b border-zinc-100">
                    <span>Subtotal:</span>
                    <span className="font-mono font-bold text-zinc-900">
                      {previewInvoice.currency || '$'} {Number(previewInvoice.subtotal || 0).toLocaleString()}
                    </span>
                  </div>

                  {Number(previewInvoice.discountPercent) > 0 && (
                    <div className="flex justify-between py-1 text-amber-700">
                      <span>Discount ({previewInvoice.discountPercent}%):</span>
                      <span className="font-mono font-bold">
                        -{previewInvoice.currency || '$'}{' '}
                        {Math.round((Number(previewInvoice.subtotal || 0) * Number(previewInvoice.discountPercent)) / 100).toLocaleString()}
                      </span>
                    </div>
                  )}

                  {Number(previewInvoice.taxPercent) > 0 && (
                    <div className="flex justify-between py-1">
                      <span>Tax / VAT ({previewInvoice.taxPercent}%):</span>
                      <span className="font-mono font-bold">
                        +{previewInvoice.currency || '$'}{' '}
                        {Math.round((Number(previewInvoice.subtotal || 0) * Number(previewInvoice.taxPercent)) / 100).toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between py-3 border-t-2 border-zinc-900 text-base font-black text-zinc-900">
                    <span>Total Due:</span>
                    <span className="font-mono text-teal-700">
                      {previewInvoice.currency || '$'} {Number(previewInvoice.totalAmount || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Signature Footer */}
              <div className="pt-6 border-t border-zinc-200 flex items-center justify-between text-[11px] text-zinc-500">
                <span>Authorized Electronic Signature: Md Sakhawat Hossain</span>
                <span>Thank you for choosing Sakhawat Design Studio</span>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmation Modals */}
      <ConfirmDialog
        isOpen={confirmSaveOpen}
        onClose={() => setConfirmSaveOpen(false)}
        onConfirm={executeSaveInvoice}
        title={formData.id ? 'Save Invoice Updates?' : 'Generate & Issue Invoice?'}
        message={`Are you sure you want to save invoice "${formData.invoiceNumber}" for ${formData.clientName}?`}
        confirmText="Yes, Save Invoice"
        cancelText="Review"
        isLoading={saving}
        variant="primary"
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={executeDeleteInvoice}
        title="Delete Invoice Record?"
        message={`Are you sure you want to delete invoice "${deleteTarget?.invoiceNumber}"? This cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default AdminInvoicesPage;
