import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Wrench, 
  CheckCircle2, 
  Clock, 
  Phone, 
  MessageCircle, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import { formatDate, formatINR } from '../utils/formatters';
import { ServiceRequest, ServiceStatus } from '../types';

interface ServiceTrackingModalProps {
  initialTicketId?: string;
  onClose: () => void;
  onBookNewService: () => void;
}

export const ServiceTrackingModal: React.FC<ServiceTrackingModalProps> = ({
  initialTicketId,
  onClose,
  onBookNewService,
}) => {
  const { serviceRequests, settings } = useStore();
  const { language, t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState(initialTicketId || '');
  const [selectedTicket, setSelectedTicket] = useState<ServiceRequest | null>(() => {
    if (initialTicketId) {
      return serviceRequests.find(s => s.id === initialTicketId || s.ticketNumber === initialTicketId) || serviceRequests[0] || null;
    }
    return serviceRequests[0] || null;
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchQuery.trim().toLowerCase();
    const found = serviceRequests.find(
      s => s.ticketNumber.toLowerCase() === clean || s.customerPhone.includes(clean)
    );
    if (found) {
      setSelectedTicket(found);
    } else {
      alert('Service ticket not found. Please verify your ticket number or phone number.');
    }
  };

  const getStatusBadge = (status: ServiceStatus) => {
    switch (status) {
      case 'new':
        return <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-100 text-amber-800">New Request</span>;
      case 'contacted':
        return <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-100 text-blue-800">Contacted</span>;
      case 'scheduled':
        return <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-purple-100 text-purple-800">Scheduled</span>;
      case 'in_progress':
        return <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-sky-100 text-sky-800 animate-pulse">In Progress</span>;
      case 'waiting_parts':
        return <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-orange-100 text-orange-800">Waiting for Parts</span>;
      case 'completed':
        return <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-100 text-emerald-800">Completed & Tested</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-100 text-rose-800">Cancelled</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-6 max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-extrabold text-white">
              {t('checkServiceStatus')}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-5 border-b border-slate-100 bg-white">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter Ticket Number (e.g. VC-SRV-2026-...) or 10-digit Phone"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-blue-600 focus:bg-white"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Lookup
            </button>
          </form>
        </div>

        {/* Ticket Details Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {selectedTicket ? (
            <>
              {/* Ticket Overview Card */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap justify-between items-center gap-3 text-xs">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Service Ticket
                  </div>
                  <div className="font-mono font-extrabold text-blue-900 text-sm">
                    {selectedTicket.ticketNumber}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Logged on {formatDate(selectedTicket.createdAt)}
                  </div>
                </div>

                <div>
                  {getStatusBadge(selectedTicket.status)}
                </div>
              </div>

              {/* Problem & Device info */}
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                  <div className="font-bold text-slate-900">
                    {selectedTicket.serviceType}
                  </div>
                  <div className="text-slate-600 font-mono text-[11px]">
                    Device: {selectedTicket.deviceType} • Model: {selectedTicket.brandModel}
                  </div>
                  <div className="text-slate-700 pt-1">
                    <strong className="text-slate-500 block text-[10px] uppercase">Reported Problem:</strong>
                    {selectedTicket.problemDescription}
                  </div>
                </div>

                {/* Technician Notes & Diagnosis */}
                {selectedTicket.technicianNotes && (
                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
                    <div className="font-bold text-amber-900 flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Technician Diagnosis & Work Note:</span>
                    </div>
                    <p className="text-slate-700 text-[11px]">
                      {selectedTicket.technicianNotes}
                    </p>
                    {selectedTicket.technicianAssigned && (
                      <div className="text-[10px] text-amber-800 font-medium">
                        Engineer Assigned: <strong>{selectedTicket.technicianAssigned}</strong>
                      </div>
                    )}
                  </div>
                )}

                {/* Cost Estimate */}
                {selectedTicket.estimatedCost !== undefined && (
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-semibold text-slate-600">Estimated Cost:</span>
                    <span className="font-extrabold text-slate-900 text-sm">
                      {formatINR(selectedTicket.estimatedCost)}
                    </span>
                  </div>
                )}
              </div>

              {/* Contact Shop for Ticket Update */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-slate-800">Need immediate update?</div>
                  <div className="text-[11px] text-slate-500">Contact Vishvjeet Computer repair desk.</div>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                    className="p-2 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 text-blue-700"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                  <a
                    href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Inquiry for Service Ticket ${selectedTicket.ticketNumber}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              No tickets found. Enter your ticket number above or book a new repair service.
            </div>
          )}

          <div className="pt-2 text-center">
            <button
              onClick={() => {
                onClose();
                onBookNewService();
              }}
              className="text-xs font-bold text-blue-700 hover:underline"
            >
              + Book Another Service Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
