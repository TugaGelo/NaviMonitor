import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, RadioTower, Send, ChevronDown, CheckCircle2 } from 'lucide-react';

const faqData = [
  {
    category: "ONBOARDING",
    question: "Adding an Asset & Initial Setup",
    answer: "To register a new vehicle to your garage, click the '+ NEW ENTRY' button in the sidebar or 'Add Vehicle' on the Garage dashboard. You will need the Make, Model, Year, and Current Odometer reading to initialize the telemetry matrix."
  },
  {
    category: "NAVIGATION",
    question: "Global Ledgers vs. Vehicle Dashboards",
    answer: "NaviMonitor operates on two levels. 'Global Navigation' (Fuel Logs, Maintenance, Stats in the upper sidebar) shows aggregated data across your entire fleet. Clicking a specific vehicle in 'My Garage' enters 'Scoped View', showing telemetry strictly for that asset."
  },
  {
    category: "TROUBLESHOOTING",
    question: "V-Matrix Sync Failure (Code 402)",
    answer: "A Code 402 indicates a disconnect between the local diagnostic unit and the cloud matrix. To resolve, perform a hard refresh, wait 30 seconds, and re-initialize the connection sequence via the V-Matrix dashboard."
  },
  {
    category: "DATA",
    question: "Exporting Diagnostic Data",
    answer: "Currently, data export is restricted to Pro-tier accounts. Once activated, an 'Export' protocol will appear on your Global Stats dashboard to download a standard CSV or encrypted JSON payload of your entire fleet history."
  },
  {
    category: "TROUBLESHOOTING",
    question: "Understanding 'Service Required' Status",
    answer: "When a subsystem enters the SERVICE REQUIRED state, immediate action is recommended. Check the Maintenance tab for specific fault codes. Continuing operation may result in data loss or hardware degradation."
  }
];

export default function Support() {
  const [searchQuery, setSearchQuery] = useState('');
  const [transmitState, setTransmitState] = useState<'idle' | 'sending' | 'sent'>('idle');

  const filteredFaqs = faqData.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTransmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTransmitState('sending');
    setTimeout(() => {
      setTransmitState('sent');
      setTimeout(() => setTransmitState('idle'), 3000);
    }, 1500);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-7xl mx-auto">
      
      <header className="border-b border-zinc-200 pb-8">
        <h2 className="text-3xl font-extrabold text-black tracking-tight uppercase">Support & Docs</h2>
        <p className="text-zinc-500 font-medium mt-1">System diagnostics, field manual, and direct engineering contact.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        <section className="lg:col-span-7 flex flex-col gap-8">
          
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-zinc-200 rounded-xl py-3.5 pl-12 pr-4 text-sm font-medium text-black focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all shadow-sm" 
              placeholder="Search documentation, error codes..." 
            />
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Frequently Encountered</h3>
            
            {filteredFaqs.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-zinc-200 rounded-xl text-zinc-500 font-medium text-sm">
                No protocols match your search query.
              </div>
            ) : (
              filteredFaqs.map((faq, index) => (
                <details key={index} className="group bg-white border border-zinc-200 rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden shadow-sm">
                  <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-zinc-50 transition-colors">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{faq.category}</span>
                      <span className="text-sm font-bold text-black">{faq.question}</span>
                    </div>
                    <ChevronDown className="w-5 h-5 text-zinc-400 transition duration-300 group-open:-rotate-180" />
                  </summary>
                  <div className="p-5 pt-0 text-sm text-zinc-600 leading-relaxed border-t border-zinc-100 mt-2 bg-zinc-50/50">
                    {faq.answer}
                  </div>
                </details>
              ))
            )}
          </div>
        </section>

        <section className="lg:col-span-5">
          <div className="bg-white border border-zinc-200 rounded-xl p-8 sticky top-8 shadow-sm">
            
            <div className="flex items-center gap-3 mb-6 border-b border-zinc-100 pb-6">
              <RadioTower className="w-6 h-6 text-secondary" />
              <h2 className="text-xl font-black text-black uppercase tracking-tight">Direct Line</h2>
            </div>
            
            <p className="text-sm text-zinc-500 mb-8 leading-relaxed">
              For critical system failures or hardware inquiries, open a direct transmission to the engineering team.
            </p>

            <form onSubmit={handleTransmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-black uppercase tracking-widest">Operator ID / Email</label>
                <input 
                  required
                  type="email"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg focus:border-black focus:ring-1 focus:ring-black p-3 text-sm font-medium text-black placeholder:text-zinc-400 outline-none transition-all" 
                  placeholder="operator@navisystems.net" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-black uppercase tracking-widest">System Designation</label>
                <select className="w-full bg-zinc-50 border border-zinc-200 rounded-lg focus:border-black focus:ring-1 focus:ring-black p-3 text-sm font-medium text-black outline-none transition-all appearance-none cursor-pointer">
                  <option>V-Matrix Array</option>
                  <option>Telemetry Module</option>
                  <option>Sensor Network</option>
                  <option>Account Access</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-black uppercase tracking-widest">Fault Description</label>
                <textarea 
                  required
                  rows={4}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg focus:border-black focus:ring-1 focus:ring-black p-3 text-sm font-medium text-black placeholder:text-zinc-400 outline-none transition-all resize-none" 
                  placeholder="Detail the anomaly..." 
                ></textarea>
              </div>

              <button 
                type="submit"
                disabled={transmitState !== 'idle'}
                className={`w-full py-4 rounded-lg font-black text-xs uppercase tracking-widest transition-all flex justify-center items-center gap-2 ${
                  transmitState === 'idle' ? 'bg-black text-white hover:bg-zinc-800' :
                  transmitState === 'sending' ? 'bg-zinc-200 text-zinc-500 cursor-not-allowed' :
                  'bg-emerald-500 text-white'
                }`}
              >
                {transmitState === 'idle' && <><Send className="w-4 h-4" /> Initiate Transmission</>}
                {transmitState === 'sending' && <div className="w-4 h-4 border-2 border-zinc-400 border-t-zinc-600 rounded-full animate-spin"></div>}
                {transmitState === 'sent' && <><CheckCircle2 className="w-4 h-4" /> Transmission Sent</>}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-zinc-100 flex items-center justify-center gap-2">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">System Status:</span>
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Optimal
              </span>
            </div>
          </div>
        </section>

      </div>
    </motion.div>
  );
}
