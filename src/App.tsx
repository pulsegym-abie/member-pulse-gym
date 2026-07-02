/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Mail, Phone, Calendar, ArrowLeft, ArrowRight, Check, 
  CheckCircle2, Dumbbell, Users, Search, Trash2, Download, 
  Sparkles, ChevronRight, Info, RefreshCw, X, CreditCard, Loader2
} from 'lucide-react';
import { GymRegistration, StepId, GenderType } from './types';
import { MEMBERSHIP_PACKAGES, SOURCE_INFO_OPTIONS } from './data';
import { CupertinoInput } from './components/CupertinoInput';
import { CupertinoSegmentedControl } from './components/CupertinoSegmentedControl';
import { CupertinoSwitch } from './components/CupertinoSwitch';
import { MembershipCardView } from './components/MembershipCardView';

// Common country codes for expats
const COUNTRY_CODES = [
  { code: '+62', country: '🇮🇩', name: 'Indonesia (+62)' },
  { code: '+60', country: '🇲🇾', name: 'Malaysia (+60)' },
  { code: '+65', country: '🇸🇬', name: 'Singapore (+65)' },
  { code: '+66', country: '🇹🇭', name: 'Thailand (+66)' },
  { code: '+63', country: '🇵🇭', name: 'Philippines (+63)' },
  { code: '+84', country: '🇻🇳', name: 'Vietnam (+84)' },
  { code: '+673', country: '🇧🇳', name: 'Brunei (+673)' },
  { code: '+855', country: '🇰🇭', name: 'Cambodia (+855)' },
  { code: '+856', country: '🇱🇦', name: 'Laos (+856)' },
  { code: '+95', country: '🇲🇲', name: 'Myanmar (+95)' },
  { code: '+670', country: '🇹🇱', name: 'Timor-Leste (+670)' },
  { code: '+1', country: '🇺🇸', name: 'United States (+1)' },
  { code: '+1', country: '🇨🇦', name: 'Canada (+1)' },
  { code: '+44', country: '🇬🇧', name: 'United Kingdom (+44)' },
  { code: '+61', country: '🇦🇺', name: 'Australia (+61)' },
  { code: '+64', country: '🇳🇿', name: 'New Zealand (+64)' },
  { code: '+81', country: '🇯🇵', name: 'Japan (+81)' },
  { code: '+82', country: '🇰🇷', name: 'South Korea (+82)' },
  { code: '+86', country: '🇨🇳', name: 'China (+86)' },
  { code: '+852', country: '🇭🇰', name: 'Hong Kong (+852)' },
  { code: '+886', country: '🇹🇼', name: 'Taiwan (+886)' },
  { code: '+91', country: '🇮🇳', name: 'India (+91)' },
  { code: '+966', country: '🇸🇦', name: 'Saudi Arabia (+966)' },
  { code: '+971', country: '🇦🇪', name: 'United Arab Emirates (+971)' },
  { code: '+974', country: '🇶🇦', name: 'Qatar (+974)' },
  { code: '+90', country: '🇹🇷', name: 'Turkey (+90)' },
  { code: '+49', country: '🇩🇪', name: 'Germany (+49)' },
  { code: '+33', country: '🇫🇷', name: 'France (+33)' },
  { code: '+31', country: '🇳🇱', name: 'Netherlands (+31)' },
  { code: '+41', country: '🇨🇭', name: 'Switzerland (+41)' },
  { code: '+39', country: '🇮🇹', name: 'Italy (+39)' },
  { code: '+34', country: '🇪🇸', name: 'Spain (+34)' },
  { code: '+7', country: '🇷🇺', name: 'Russia (+7)' },
  { code: '+27', country: '🇿🇦', name: 'South Africa (+27)' },
  { code: '+55', country: '🇧🇷', name: 'Brazil (+55)' },
  { code: '+54', country: '🇦🇷', name: 'Argentina (+54)' },
  { code: '+52', country: '🇲🇽', name: 'Mexico (+52)' },
];

// Unique Member ID Generator
const generateMemberID = (packageId: string) => {
  const prefix = 'PLS';
  const year = new Date().getFullYear().toString().substring(2);
  const randomNum = Math.floor(1000 + Math.random() * 9000); // 4 digit random number
  return `${prefix}-${packageId.substring(0, 3).toUpperCase()}-${year}${randomNum}`;
};

export default function App() {
  // --- STATE ---
  const [currentStep, setCurrentStep] = useState<StepId>('personal_info');
  const [direction, setDirection] = useState<number>(1); // 1 = forward, -1 = backward
  const [agreedTerms, setAgreedTerms] = useState<boolean>(false);
  const [allRegistrations, setAllRegistrations] = useState<GymRegistration[]>([]);
  const [showStaffPanel, setShowStaffPanel] = useState<boolean>(false);
  const [paymentState, setPaymentState] = useState<'idle' | 'waiting' | 'processing' | 'success'>('idle');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterPackage, setFilterPackage] = useState<string>('all');
  const [countryCode, setCountryCode] = useState<string>('+62');

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    gender: '' as GenderType | '',
    dob: '',
    email: '',
    phone: '',
    packageId: MEMBERSHIP_PACKAGES[1].id, // Silver as default
    sourceInfo: '',
    referralName: '',
  });

  // Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Created Member for success step
  const [latestMember, setLatestMember] = useState<GymRegistration | null>(null);

  // --- PERSISTENCE ---
  useEffect(() => {
    // Load from local storage
    const saved = localStorage.getItem('pulsegym_registrations');
    if (saved) {
      try {
        setAllRegistrations(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load registrations', e);
      }
    }
  }, []);

  const saveRegistrations = (newList: GymRegistration[]) => {
    setAllRegistrations(newList);
    localStorage.setItem('pulsegym_registrations', JSON.stringify(newList));
  };

  // --- VALIDATION HELPERS ---
  const validateStep = (step: StepId): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 'personal_info') {
      if (!formData.name.trim()) {
        newErrors.name = 'Full name is required';
      } else if (formData.name.trim().length < 3) {
        newErrors.name = 'Name must be at least 3 characters';
      }

      if (!formData.gender) {
        newErrors.gender = 'Please select a gender';
      }

      if (!formData.dob) {
        newErrors.dob = 'Date of birth is required';
      } else {
        const dobDate = new Date(formData.dob);
        const today = new Date();
        const age = today.getFullYear() - dobDate.getFullYear();
        if (dobDate > today) {
          newErrors.dob = 'Invalid date of birth';
        } else if (age < 10) {
          newErrors.dob = 'Minimum age is 10 years old';
        }
      }
    }

    if (step === 'contact_info') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      }

      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (formData.phone.trim().length < 6 || formData.phone.trim().length > 15) {
        newErrors.phone = 'Phone number must be 6-15 digits';
      } else if (!/^[0-9\- ]+$/.test(formData.phone)) {
        newErrors.phone = 'Only numbers, spaces, and hyphens are allowed';
      }
    }

    if (step === 'referral_source') {
      if (!formData.sourceInfo) {
        newErrors.sourceInfo = 'Please select where you heard about us';
      }

      if (formData.sourceInfo === 'referral' && !formData.referralName.trim()) {
        newErrors.referralName = 'Please enter friend\'s name or referral code';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- NAVIGATION ACTION ---
  const handleNext = () => {
    if (!validateStep(currentStep)) return;

    setDirection(1);
    if (currentStep === 'personal_info') {
      setCurrentStep('contact_info');
    } else if (currentStep === 'contact_info') {
      setCurrentStep('membership_package');
    } else if (currentStep === 'membership_package') {
      setCurrentStep('payment');
      setPaymentState('waiting');
    } else if (currentStep === 'payment') {
      if (paymentState === 'success') {
        setCurrentStep('referral_source');
      }
    } else if (currentStep === 'referral_source') {
      setCurrentStep('summary');
    }
  };

  const handleBack = () => {
    setDirection(-1);
    setErrors({});
    if (currentStep === 'contact_info') {
      setCurrentStep('personal_info');
    } else if (currentStep === 'membership_package') {
      setCurrentStep('contact_info');
    } else if (currentStep === 'payment') {
      setCurrentStep('membership_package');
      setPaymentState('idle');
    } else if (currentStep === 'referral_source') {
      setCurrentStep('payment');
    } else if (currentStep === 'summary') {
      setCurrentStep('referral_source');
    }
  };

  // --- SUBMIT REGISTRATION ---
  const handleSubmit = () => {
    if (!agreedTerms) {
      setErrors({ terms: 'You must agree to the Terms & Conditions' });
      return;
    }

    const pkg = MEMBERSHIP_PACKAGES.find(p => p.id === formData.packageId) || MEMBERSHIP_PACKAGES[1];
    
    // Calculate dates
    const regDateObj = new Date();
    const expDateObj = new Date();
    expDateObj.setDate(expDateObj.getDate() + pkg.durationDays);

    const memberId = generateMemberID(formData.packageId);

    const newRegistration: GymRegistration = {
      id: memberId,
      name: formData.name,
      email: formData.email,
      phone: `${countryCode} ${formData.phone.trim()}`,
      gender: formData.gender as GenderType,
      dob: formData.dob,
      packageId: formData.packageId,
      sourceInfo: formData.sourceInfo,
      referralName: formData.sourceInfo === 'referral' ? formData.referralName : undefined,
      registrationDate: regDateObj.toISOString().split('T')[0],
      expirationDate: expDateObj.toISOString().split('T')[0],
      status: 'Active'
    };

    const updatedList = [newRegistration, ...allRegistrations];
    saveRegistrations(updatedList);
    setLatestMember(newRegistration);
    
    setDirection(1);
    setCurrentStep('success');
  };

  // --- RESET FORM FOR NEW REGISTRATION ---
  const handleResetForm = () => {
    setFormData({
      name: '',
      gender: '',
      dob: '',
      email: '',
      phone: '',
      packageId: MEMBERSHIP_PACKAGES[1].id,
      sourceInfo: '',
      referralName: '',
    });
    setCountryCode('+62');
    setAgreedTerms(false);
    setPaymentState('idle');
    setErrors({});
    setLatestMember(null);
    setDirection(-1);
    setCurrentStep('personal_info');
  };

  // --- EXPORT TO CSV ---
  const handleExportCSV = () => {
    if (allRegistrations.length === 0) {
      alert('No registration data available to export.');
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Member ID,Full Name,Gender,Date of Birth,Email,Phone,Package,Source,Referral,Registration Date,Expiration Date\n";

    allRegistrations.forEach((r) => {
      const row = [
        r.id,
        `"${r.name.replace(/"/g, '""')}"`,
        r.gender,
        r.dob,
        r.email,
        r.phone,
        r.packageId.toUpperCase(),
        r.sourceInfo,
        `"${(r.referralName || '').replace(/"/g, '""')}"`,
        r.registrationDate,
        r.expirationDate
      ].join(",");
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `PulseGym_Member_Data_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- DELETE ENTRY ---
  const handleDeleteEntry = (id: string) => {
    if (confirm('Are you sure you want to delete this registration?')) {
      const filtered = allRegistrations.filter(r => r.id !== id);
      saveRegistrations(filtered);
    }
  };

  // --- FILTERED AND SEARCHED STAFF DATA ---
  const filteredRegistrations = allRegistrations.filter(r => {
    const matchesSearch = 
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.phone.includes(searchQuery) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPackage = filterPackage === 'all' || r.packageId === filterPackage;

    return matchesSearch && matchesPackage;
  });

  // Steps definition for UI indicator
  const stepsList = [
    { id: 'personal_info', label: 'Personal Info', subtitle: 'Name & Age' },
    { id: 'contact_info', label: 'Contact', subtitle: 'Email & Phone' },
    { id: 'membership_package', label: 'Plan', subtitle: 'Select Membership' },
    { id: 'payment', label: 'Payment', subtitle: 'EDC Terminal' },
    { id: 'referral_source', label: 'Discovery', subtitle: 'How You Found Us' },
    { id: 'summary', label: 'Confirm', subtitle: 'Final Review' }
  ];

  // Map Step to Index
  const currentStepIndex = stepsList.findIndex(s => s.id === currentStep);

  // Framer Motion Animation Settings
  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 150 : -150,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 150 : -150,
      opacity: 0
    })
  };

  return (
    <div className="min-h-screen bg-[#f2f2f7] py-4 px-4 md:py-10 md:px-6 flex flex-col justify-between font-sans">
      
      {/* HEADER SECTION */}
      <header className="w-full max-w-5xl mx-auto mb-6 bg-white/90 backdrop-blur-md border border-[#E5E5EA] rounded-[22px] px-6 py-4.5 flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-xl bg-[#007AFF] flex items-center justify-center text-white shadow-md shadow-[#007AFF]/20">
            <Dumbbell className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-black font-display">
              PULSE <span className="text-[#007AFF]">POWERHUB</span>
            </h1>
            <p className="text-[10px] text-[#8E8E93] font-bold uppercase tracking-widest leading-none mt-0.5">Self-Service Kiosk</p>
          </div>
        </div>

      </header>

      {/* MAIN CONTAINER */}
      <main className="w-full max-w-5xl mx-auto flex-grow flex flex-col justify-center">
        
        {showStaffPanel ? (
          /* --- STAFF PANEL / RIWAYAT PENDAFTARAN --- */
          <motion.div 
            id="staff-panel-container"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[24px] border border-[#E5E5EA] shadow-xl overflow-hidden p-6 md:p-8"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-extrabold text-black tracking-tight">Member Registration History</h2>
                <p className="text-sm text-[#8E8E93] mt-1 font-medium">
                  View and manage registrations processed locally on this kiosk.
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  id="csv-export-btn"
                  onClick={handleExportCSV}
                  className="flex items-center space-x-2 bg-emerald-600 text-white font-semibold px-4 h-12 rounded-xl text-sm shadow-sm hover:bg-emerald-700 active:scale-95 transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Export to CSV</span>
                </button>
                <button
                  id="refresh-list-btn"
                  onClick={() => {
                    const saved = localStorage.getItem('pulsegym_registrations');
                    if (saved) setAllRegistrations(JSON.parse(saved));
                  }}
                  className="p-3 bg-[#F2F2F7] hover:bg-[#E5E5EA] rounded-xl text-[#3A3A3C] transition active:scale-95 cursor-pointer"
                  title="Refresh Data"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* SEARCH AND FILTERS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#8E8E93] pointer-events-none" />
                <input
                  id="staff-search-input"
                  type="text"
                  placeholder="Search by Name, Email, Phone, or Member ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm font-semibold text-black focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:bg-white transition"
                />
              </div>

              <div className="flex space-x-2">
                <select
                  id="staff-package-filter"
                  value={filterPackage}
                  onChange={(e) => setFilterPackage(e.target.value)}
                  className="flex-1 h-12 px-4 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm font-bold text-black focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:bg-white transition"
                >
                  <option value="all">All Plans</option>
                  {MEMBERSHIP_PACKAGES.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                
                {searchQuery || filterPackage !== 'all' ? (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setFilterPackage('all');
                    }}
                    className="px-4 text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl transition cursor-pointer"
                  >
                    Reset Filters
                  </button>
                ) : null}
              </div>
            </div>

            {/* REGISTERED LIST */}
            <div className="overflow-x-auto rounded-2xl border border-[#E5E5EA]">
              <table className="w-full text-left border-collapse" id="staff-members-table">
                <thead>
                  <tr className="bg-[#F2F2F7] text-xs font-bold text-[#8E8E93] uppercase tracking-wider border-b border-[#E5E5EA]">
                    <th className="p-4">Member ID / Info</th>
                    <th className="p-4">Contact</th>
                    <th className="p-4">Plan</th>
                    <th className="p-4">Join Date / Expires</th>
                    <th className="p-4">Discovery / Referral</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5EA] text-sm font-semibold text-[#3A3A3C]">
                  {filteredRegistrations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-[#8E8E93]">
                        <Users className="w-12 h-12 mx-auto opacity-30 mb-2" />
                        <p className="font-bold">No registration data found.</p>
                        <p className="text-xs font-medium">Try changing your search terms or register a new member.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredRegistrations.map((m) => {
                      const mPkg = MEMBERSHIP_PACKAGES.find(p => p.id === m.packageId);
                      return (
                        <tr key={m.id} className="hover:bg-[#F2F2F7]/50 transition">
                          <td className="p-4">
                            <span className="font-mono text-xs bg-[#F2F2F7] text-black font-bold px-2 py-0.5 rounded border border-[#E5E5EA]">
                              {m.id}
                            </span>
                            <div className="font-extrabold text-black mt-1 uppercase text-base">{m.name}</div>
                            <span className="text-[10px] bg-[#007AFF]/10 text-[#007AFF] px-1.5 py-0.5 rounded font-extrabold">
                              {m.gender} • DOB: {m.dob}
                            </span>
                          </td>
                          <td className="p-4 text-xs font-medium">
                            <div className="flex items-center space-x-1.5 text-black">
                              <Mail className="w-3.5 h-3.5 text-[#8E8E93]" />
                              <span>{m.email}</span>
                            </div>
                            <div className="flex items-center space-x-1.5 mt-1 text-[#8E8E93]">
                              <Phone className="w-3.5 h-3.5 text-[#8E8E93]" />
                              <span>{m.phone}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${mPkg?.colorTheme.badge}`}>
                              {mPkg?.name || m.packageId.toUpperCase()}
                            </span>
                            <div className="text-xs text-[#8E8E93] mt-1 font-medium">{mPkg?.priceDisplay}</div>
                          </td>
                          <td className="p-4 text-xs font-semibold">
                            <div className="text-black">
                              <span className="font-bold text-[#8E8E93]">Join:</span> {m.registrationDate}
                            </div>
                            <div className="text-red-500 mt-0.5">
                              <span className="text-[#8E8E93] font-normal">Exp:</span> {m.expirationDate}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="capitalize font-bold text-black text-xs">
                              {SOURCE_INFO_OPTIONS.find(o => o.id === m.sourceInfo)?.label || m.sourceInfo}
                            </div>
                            {m.referralName && (
                              <div className="text-[11px] font-bold bg-[#007AFF]/10 text-[#007AFF] px-2 py-0.5 rounded border border-[#007AFF]/15 mt-1 inline-block">
                                Ref: {m.referralName}
                              </div>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => handleDeleteEntry(m.id)}
                              className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition cursor-pointer"
                              title="Delete Member"
                            >
                              <Trash2 className="w-4.5 h-4.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6 text-right">
              <button
                id="staff-close-btn"
                onClick={() => setShowStaffPanel(false)}
                className="bg-[#007AFF] hover:bg-[#0062CC] text-white font-bold h-12 px-6 rounded-xl text-sm transition active:scale-95 cursor-pointer"
              >
                Back to Registration Form
              </button>
            </div>
          </motion.div>
        ) : (
          /* --- WIZARD FORM SYSTEM --- */
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            
            {/* LEFT SIDEBAR - STEP TRACKER FOR TABLET (10-inch desktop layouts) */}
            <div className="hidden md:block md:col-span-4 lg:col-span-3">
              <div className="bg-white rounded-[24px] border border-slate-100 shadow-lg p-5 sticky top-6 flex flex-col justify-between h-full min-h-[380px] md:min-h-[480px]">
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-5 px-1">Registration Steps</h3>
                  <div className="space-y-3">
                    {stepsList.map((step, idx) => {
                      const isCompleted = idx < currentStepIndex;
                      const isActive = step.id === currentStep;
                      
                      return (
                        <div 
                          key={step.id}
                          className={`
                            flex items-center space-x-3.5 p-3 rounded-2xl transition-all duration-200
                            ${isActive ? 'bg-[#007AFF]/10 border border-[#007AFF]/15' : 'bg-transparent border border-transparent'}
                          `}
                        >
                          <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
                            ${isCompleted ? 'bg-emerald-500 text-white' : ''}
                            ${isActive ? 'bg-[#007AFF] text-white ring-4 ring-[#007AFF]/10' : ''}
                            ${!isCompleted && !isActive ? 'bg-[#F2F2F7] text-[#8E8E93]' : ''}
                          `}>
                            {isCompleted ? <Check className="w-4.5 h-4.5 stroke-[3px]" /> : idx + 1}
                          </div>
                          
                          <div className="text-left">
                            <p className={`text-sm font-bold leading-tight ${isActive ? 'text-[#007AFF] font-extrabold' : 'text-black'}`}>
                              {step.label}
                            </p>
                            <p className={`text-[11px] mt-0.5 font-medium leading-none ${isActive ? 'text-[#007AFF]/85' : 'text-[#8E8E93]'}`}>
                              {step.subtitle}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-[#F2F2F7] border border-[#E5E5EA] rounded-2xl p-4 mt-6">
                  <div className="flex space-x-2.5 items-start">
                    <Info className="w-4.5 h-4.5 text-[#007AFF] mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-[#3A3A3C]">Need Help?</h4>
                      <p className="text-[11px] text-[#8E8E93] font-medium mt-0.5 leading-relaxed">
                        Please ask our friendly staff at the front desk if you have any questions during registration.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* WIZARD ACTIVE PAGE - FORM CARD */}
            <div className="md:col-span-8 lg:col-span-9 flex flex-col">
                           {/* TOP STEPPER INDICATOR FOR SMALL TABLETS (7-inch) & MOBILE */}
              {currentStep !== 'success' && (
                <div className="md:hidden bg-white p-4 rounded-2xl border border-[#E5E5EA] shadow-sm mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#007AFF] uppercase tracking-widest">
                      Step {currentStepIndex + 1} of 5
                    </span>
                    <span className="text-sm font-bold text-black">
                      {stepsList[currentStepIndex].label}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-[#F2F2F7] h-2 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="bg-[#007AFF] h-full rounded-full transition-all duration-300"
                      style={{ width: `${((currentStepIndex + 1) / 5) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* CARD ENVELOPE */}
              <div className="bg-white rounded-[24px] border border-[#E5E5EA] shadow-xl overflow-hidden flex flex-col justify-between min-h-[380px] md:min-h-[480px]">
                
                {/* WIZARD CONTENT - ANIMATED STEP TRANSITION */}
                <div className="p-6 md:p-10 flex-grow relative overflow-hidden">
                  <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                      key={currentStep}
                      custom={direction}
                      variants={variants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      className="w-full h-full flex flex-col justify-between"
                    >
                      {/* STEP 1: PERSONAL INFO */}
                      {currentStep === 'personal_info' && (
                        <div className="space-y-6" id="step-personal-info">
                          <div>
                            <span className="text-xs font-extrabold text-[#007AFF] uppercase tracking-widest">Basic Information</span>
                            <h2 className="text-2xl md:text-3xl font-extrabold text-black tracking-tight mt-1">Personal Details</h2>
                            <p className="text-sm text-[#8E8E93] mt-1 font-medium">Please enter your full name and other basic information.</p>
                          </div>

                          <div className="space-y-5">
                            <CupertinoInput
                              id="input-name"
                              label="Full Name"
                              placeholder="Enter your full name"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              icon={<User className="w-5 h-5 text-slate-400" />}
                              error={errors.name}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                              <CupertinoSegmentedControl
                                id="control-gender"
                                label="Gender"
                                options={[
                                  { value: 'Male', label: 'Male' },
                                  { value: 'Female', label: 'Female' }
                                ]}
                                selectedValue={formData.gender}
                                onChange={(val) => setFormData({ ...formData, gender: val as GenderType })}
                              />

                              <CupertinoInput
                                id="input-dob"
                                label="Date of Birth"
                                type="date"
                                placeholder="Select date of birth"
                                value={formData.dob}
                                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                icon={<Calendar className="w-5 h-5 text-slate-400" />}
                                error={errors.dob}
                              />
                            </div>
                            {errors.gender && (
                              <p className="text-xs font-medium text-red-500 px-1 mt-1">{errors.gender}</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* STEP 2: CONTACT INFO */}
                      {currentStep === 'contact_info' && (
                        <div className="space-y-6" id="step-contact-info">
                          <div>
                            <span className="text-xs font-extrabold text-[#007AFF] uppercase tracking-widest">Contact Information</span>
                            <h2 className="text-2xl md:text-3xl font-extrabold text-black tracking-tight mt-1">Contact Details</h2>
                            <p className="text-sm text-[#8E8E93] mt-1 font-medium">We use this to send your digital membership card & registration details.</p>
                          </div>

                          <div className="space-y-5">
                            <CupertinoInput
                              id="input-email"
                              label="Email Address"
                              type="email"
                              placeholder="e.g., member@email.com"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              icon={<Mail className="w-5 h-5 text-slate-400" />}
                              error={errors.email}
                            />

                            <div className="flex flex-col space-y-1.5 w-full">
                              <label htmlFor="input-phone" className="text-[13px] font-bold text-[#3A3A3C] tracking-wide ml-1">
                                Phone / WhatsApp Number
                              </label>
                              <div className="flex space-x-2">
                                {/* Country Code Select Dropdown */}
                                <div className="relative flex-shrink-0 w-32">
                                  <select
                                    id="input-country-code"
                                    value={countryCode}
                                    onChange={(e) => setCountryCode(e.target.value)}
                                    className="w-full h-14 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl px-3 text-base font-semibold text-black focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:bg-white transition-all duration-200 cursor-pointer appearance-none pr-8"
                                  >
                                    {COUNTRY_CODES.map((c) => (
                                      <option key={c.code} value={c.code}>
                                        {c.country} {c.code}
                                      </option>
                                    ))}
                                  </select>
                                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 font-bold text-[10px]">
                                    ▼
                                  </div>
                                </div>
                                
                                {/* Phone Input field */}
                                <div className="flex-grow">
                                  <CupertinoInput
                                    id="input-phone"
                                    type="tel"
                                    placeholder="e.g., 81234567890"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    icon={<Phone className="w-5 h-5 text-slate-400" />}
                                    className="!space-y-0"
                                  />
                                </div>
                              </div>
                              {errors.phone ? (
                                <span className="text-xs font-medium text-red-500 px-1">
                                  {errors.phone}
                                </span>
                              ) : (
                                <span className="text-xs text-slate-400 px-1">
                                  Please provide an active number for verification.
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* STEP 3: MEMBERSHIP PACKAGE */}
                      {currentStep === 'membership_package' && (
                        <div className="space-y-6" id="step-membership-package">
                          <div>
                            <span className="text-xs font-extrabold text-[#007AFF] uppercase tracking-widest">Plan Option</span>
                            <h2 className="text-2xl md:text-3xl font-extrabold text-black tracking-tight mt-1">Select Membership</h2>
                            <p className="text-sm text-[#8E8E93] mt-1 font-medium">Find the plan that best fits your fitness goals.</p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {MEMBERSHIP_PACKAGES.map((pkg) => {
                              const isSelected = formData.packageId === pkg.id;
                              return (
                                <button
                                  key={pkg.id}
                                  id={`pkg-select-${pkg.id}`}
                                  type="button"
                                  onClick={() => setFormData({ ...formData, packageId: pkg.id })}
                                  className={`
                                    relative flex flex-col justify-between text-left p-4 rounded-2xl border-2 transition-all cursor-pointer h-full
                                    ${isSelected ? 'border-[#007AFF] ring-4 ring-[#007AFF]/10 bg-[#007AFF]/5' : 'border-[#E5E5EA] hover:border-[#C6C6C8] bg-white'}
                                  `}
                                >
                                  {isSelected && (
                                    <div className="absolute top-3 right-3 bg-[#007AFF] text-white rounded-full p-1 shadow-sm z-10">
                                      <Check className="w-3.5 h-3.5 stroke-[3px]" />
                                    </div>
                                  )}

                                  <div>
                                    <div className="flex items-center space-x-1.5">
                                      <span className={`text-[10px] font-extrabold tracking-wider px-2 py-0.5 rounded-full uppercase ${pkg.colorTheme.badge}`}>
                                        {pkg.name}
                                      </span>
                                      {pkg.durationDays >= 7 && (
                                        <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                                          Best Value
                                        </span>
                                      )}
                                    </div>
                                    <h3 className="font-extrabold text-base text-black mt-1.5 leading-tight">{pkg.name}</h3>
                                    <p className="text-xs text-[#8E8E93] mt-0.5 font-medium">{pkg.discountNote}</p>
                                  </div>

                                  <div className="mt-4 pt-3 border-t border-[#E5E5EA] flex items-baseline space-x-1">
                                    <span className="text-xl font-black text-black leading-none">{pkg.priceDisplay}</span>
                                    <span className="text-[#8E8E93] text-[10px] font-bold">/ {pkg.durationDisplay}</span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>

                          {/* List chosen package features as context */}
                          {(() => {
                            const selectedPkg = MEMBERSHIP_PACKAGES.find(p => p.id === formData.packageId);
                            if (!selectedPkg) return null;
                            return (
                              <div className="bg-[#F2F2F7] rounded-2xl p-4 border border-[#E5E5EA] mt-2">
                                <h4 className="text-xs font-bold text-[#3A3A3C] uppercase tracking-wider mb-2">Benefits of {selectedPkg.name}:</h4>
                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-[#3A3A3C] font-semibold">
                                  {selectedPkg.features.map((feature, i) => (
                                    <li key={i} className="flex items-center space-x-1.5">
                                      <div className="w-1.5 h-1.5 rounded-full bg-[#007AFF] flex-shrink-0" />
                                      <span className="truncate">{feature}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            );
                          })()}
                        </div>
                      )}

                      {/* STEP: PAYMENT */}
                      {currentStep === 'payment' && (
                        <div className="space-y-6" id="step-payment">
                          <div>
                            <span className="text-xs font-extrabold text-[#007AFF] uppercase tracking-widest">Payment Authorization</span>
                            <h2 className="text-2xl md:text-3xl font-extrabold text-black tracking-tight mt-1">Complete Your Payment</h2>
                            <p className="text-sm text-[#8E8E93] mt-1 font-medium">Please follow the instructions below to activate your account.</p>
                          </div>

                          {/* Selected Plan Details */}
                          {(() => {
                            const selectedPkg = MEMBERSHIP_PACKAGES.find(p => p.id === formData.packageId);
                            if (!selectedPkg) return null;
                            return (
                              <div className="bg-[#007AFF]/5 rounded-2xl p-4 border border-[#007AFF]/15 flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <span className="text-[10px] font-extrabold text-[#007AFF] uppercase tracking-wider">SELECTED PLAN</span>
                                  <h4 className="text-base font-extrabold text-black">{selectedPkg.name}</h4>
                                  <p className="text-xs text-slate-500 font-semibold">{selectedPkg.discountNote}</p>
                                </div>
                                <div className="text-right">
                                  <span className="text-lg font-black text-black">{selectedPkg.priceDisplay}</span>
                                  <p className="text-[10px] text-slate-400 font-bold">/ {selectedPkg.durationDisplay}</p>
                                </div>
                              </div>
                            );
                          })()}

                          {/* Interactive Payment Stage Terminal Graphic */}
                          <div className="bg-[#F2F2F7] rounded-[24px] border border-[#E5E5EA] p-6 text-center space-y-6 relative overflow-hidden flex flex-col items-center justify-center min-h-[280px]">
                            {paymentState === 'waiting' && (
                              <div className="space-y-5 flex flex-col items-center py-4">
                                <div className="relative flex items-center justify-center">
                                  {/* Wave Pulse Animation */}
                                  <div className="absolute w-24 h-24 rounded-full bg-[#007AFF]/10 animate-ping" />
                                  <div className="absolute w-16 h-16 rounded-full bg-[#007AFF]/20 animate-pulse" />
                                  <div className="w-12 h-12 rounded-full bg-[#007AFF] flex items-center justify-center text-white relative shadow-md">
                                    <CreditCard className="w-6 h-6 stroke-[2.2]" />
                                  </div>
                                </div>
                                
                                <div className="space-y-1 max-w-sm">
                                  <h3 className="text-md font-extrabold text-black uppercase tracking-tight">Please complete your payment at the reception desk</h3>
                                  <p className="text-xs text-[#8E8E93] font-semibold leading-relaxed">
                                    Please proceed to the nearest reception terminal to pay with our card/EDC terminal.
                                  </p>
                                </div>

                                <div className="bg-white/80 backdrop-blur-md border border-[#E5E5EA] p-3.5 rounded-xl max-w-xs shadow-sm space-y-2 mt-2">
                                  <p className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wider">Demo / Kiosk Simulator</p>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setPaymentState('processing');
                                      setTimeout(() => {
                                        setPaymentState('success');
                                      }, 1500);
                                    }}
                                    className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-lg text-xs transition active:scale-95 shadow-sm cursor-pointer flex items-center justify-center space-x-1.5"
                                  >
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>Tap Card / Approve Payment</span>
                                  </button>
                                </div>
                              </div>
                            )}

                            {paymentState === 'processing' && (
                              <div className="space-y-4 flex flex-col items-center py-8">
                                <Loader2 className="w-10 h-10 text-[#007AFF] animate-spin stroke-[2.5]" />
                                <div className="space-y-1">
                                  <h3 className="text-md font-extrabold text-black uppercase tracking-tight">Processing Transaction</h3>
                                  <p className="text-xs text-[#8E8E93] font-semibold">Contacting PULSE POWERHUB terminal. Do not close this screen.</p>
                                </div>
                              </div>
                            )}

                            {paymentState === 'success' && (
                              <div className="space-y-4 flex flex-col items-center py-6">
                                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shadow-sm animate-bounce">
                                  <Check className="w-8 h-8 stroke-[3.5]" />
                                </div>
                                <div className="space-y-2 max-w-md">
                                  <h3 className="text-lg font-black text-emerald-600 tracking-tight leading-tight uppercase">Payment Approved</h3>
                                  <p className="text-sm font-extrabold text-slate-800">
                                    Thank you for your membership at PULSE POWERHUB Gym and Wellness!
                                  </p>
                                  <p className="text-xs text-[#8E8E93] font-medium leading-relaxed">
                                    Your transaction has been authorized successfully. Click "Continue" below to complete your registration process.
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* STEP 4: REFERRAL & TRACKER */}
                      {currentStep === 'referral_source' && (
                        <div className="space-y-6" id="step-referral-source">
                          <div>
                            <span className="text-xs font-extrabold text-[#007AFF] uppercase tracking-widest">Discovery Information</span>
                            <h2 className="text-2xl md:text-3xl font-extrabold text-black tracking-tight mt-1">How did you find us?</h2>
                            <p className="text-sm text-[#8E8E93] mt-1 font-medium">Let us know how you heard about PulseGym.</p>
                          </div>

                          <div className="space-y-4">
                            <span className="text-[13px] font-bold text-[#3A3A3C] tracking-wide ml-1 block">
                              Where did you hear about us?
                            </span>
                            
                            {/* Option list built with large interactive row items */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="source-info-choices">
                              {SOURCE_INFO_OPTIONS.map((opt) => {
                                const isSelected = formData.sourceInfo === opt.id;
                                return (
                                  <div
                                    key={opt.id}
                                    id={`src-opt-${opt.id}`}
                                    onClick={() => {
                                      setFormData({ ...formData, sourceInfo: opt.id });
                                      setErrors({ ...errors, sourceInfo: '' });
                                    }}
                                    className={`
                                      flex items-center justify-between p-4 rounded-xl border cursor-pointer select-none transition-all h-14
                                      ${isSelected ? 'border-[#007AFF] bg-[#007AFF]/5 ring-2 ring-[#007AFF]/10' : 'border-[#E5E5EA] hover:border-[#C6C6C8] bg-white'}
                                    `}
                                  >
                                    <span className="text-sm font-bold text-black">{opt.label}</span>
                                    <div className={`
                                      w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                                      ${isSelected ? 'border-[#007AFF] bg-[#007AFF]' : 'border-[#C6C6C8] bg-white'}
                                    `}>
                                      {isSelected && <Check className="w-3 h-3 text-white stroke-[3px]" />}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            {errors.sourceInfo && (
                              <p className="text-xs font-medium text-red-500 px-1 mt-1">{errors.sourceInfo}</p>
                            )}

                            {/* CONDITIONAL REFERRAL FIELD */}
                            <AnimatePresence>
                              {formData.sourceInfo === 'referral' && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.25 }}
                                  className="overflow-hidden pt-2"
                                >
                                  <CupertinoInput
                                    id="input-referral-name"
                                    label="Referrer's Name or Member ID"
                                    placeholder="e.g., John Doe / PLS-SIL-2309"
                                    value={formData.referralName}
                                    onChange={(e) => setFormData({ ...formData, referralName: e.target.value })}
                                    icon={<Users className="w-5 h-5 text-slate-400" />}
                                    error={errors.referralName}
                                    helpText="The referring member will receive 1 free month of membership!"
                                  />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      )}

                      {/* STEP 5: SUMMARY & T&C */}
                      {currentStep === 'summary' && (
                        <div className="space-y-6" id="step-summary">
                          <div>
                            <span className="text-xs font-extrabold text-[#007AFF] uppercase tracking-widest">Final Step</span>
                            <h2 className="text-2xl md:text-3xl font-extrabold text-black tracking-tight mt-1">Confirm Registration</h2>
                            <p className="text-sm text-[#8E8E93] mt-1 font-medium">Please review your details before completing your registration.</p>
                          </div>

                          <div className="space-y-5">
                            {/* Cupertino Grouped List Style */}
                            <div className="bg-[#F2F2F7] rounded-2xl border border-[#E5E5EA] divide-y divide-[#E5E5EA] overflow-hidden">
                              <div className="flex justify-between items-center p-3.5 px-4">
                                <span className="text-xs font-bold text-[#8E8E93] uppercase">Full Name</span>
                                <span className="text-sm font-extrabold text-black uppercase">{formData.name}</span>
                              </div>
                              <div className="flex justify-between items-center p-3.5 px-4">
                                <span className="text-xs font-bold text-[#8E8E93] uppercase">Gender / Date of Birth</span>
                                <span className="text-sm font-bold text-black">{formData.gender} • {formData.dob}</span>
                              </div>
                              <div className="flex justify-between items-center p-3.5 px-4">
                                <span className="text-xs font-bold text-[#8E8E93] uppercase">Email</span>
                                <span className="text-sm font-bold text-black">{formData.email}</span>
                              </div>
                              <div className="flex justify-between items-center p-3.5 px-4">
                                <span className="text-xs font-bold text-[#8E8E93] uppercase">Phone / WhatsApp</span>
                                <span className="text-sm font-bold text-black">{countryCode} {formData.phone}</span>
                              </div>
                              <div className="flex justify-between items-center p-3.5 px-4">
                                <span className="text-xs font-bold text-[#8E8E93] uppercase">Selected Plan</span>
                                <span className="text-sm font-extrabold text-[#007AFF]">
                                  {MEMBERSHIP_PACKAGES.find(p => p.id === formData.packageId)?.name}
                                </span>
                              </div>
                              <div className="flex justify-between items-center p-3.5 px-4">
                                <span className="text-xs font-bold text-[#8E8E93] uppercase">Membership Cost</span>
                                <span className="text-sm font-black text-black">
                                  {MEMBERSHIP_PACKAGES.find(p => p.id === formData.packageId)?.priceDisplay}
                                </span>
                              </div>
                              <div className="flex justify-between items-center p-3.5 px-4">
                                <span className="text-xs font-bold text-[#8E8E93] uppercase">How You Found Us</span>
                                <span className="text-sm font-bold text-black capitalize">
                                  {SOURCE_INFO_OPTIONS.find(o => o.id === formData.sourceInfo)?.label.split(' / ')[0]}
                                </span>
                              </div>
                              {formData.sourceInfo === 'referral' && (
                                <div className="flex justify-between items-center p-3.5 px-4 bg-[#007AFF]/5">
                                  <span className="text-xs font-bold text-[#007AFF] uppercase">Referring Friend (Referral)</span>
                                  <span className="text-sm font-bold text-[#007AFF] uppercase">{formData.referralName}</span>
                                </div>
                              )}
                            </div>

                            {/* Terms switch */}
                            <CupertinoSwitch
                              id="terms-switch"
                              checked={agreedTerms}
                              onChange={(val) => {
                                  setAgreedTerms(val);
                                  if (val) setErrors({ ...errors, terms: '' });
                              }}
                              label="I agree to the Terms & Conditions"
                              description="I agree to the gym rules, locker room usage guidelines, equipment code of conduct, and fee cancellation policies."
                            />
                            {errors.terms && (
                              <p className="text-xs font-medium text-red-500 px-1">{errors.terms}</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* STEP 6: SUCCESS & MEMBER CARD */}
                      {currentStep === 'success' && latestMember && (
                        <div className="space-y-5 text-center py-2" id="step-success">
                          <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-3.5 animate-bounce">
                              <CheckCircle2 className="w-10 h-10 stroke-[2.5px]" />
                            </div>
                            <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-widest">Registration Successful</span>
                            <h2 className="text-2xl md:text-3xl font-extrabold text-black tracking-tight mt-1">Welcome to PULSE POWERHUB!</h2>
                            <p className="text-xs text-[#8E8E93] font-medium max-w-md mx-auto mt-1">
                              Your digital membership card has been successfully generated. Please take a screenshot or show it to our receptionist to scan.
                            </p>
                          </div>

                          {/* GORGEOUS PASS VIEW */}
                          <div className="w-full">
                            <MembershipCardView registration={latestMember} />
                          </div>

                          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto pt-2">
                            <button
                              id="btn-print-card"
                              onClick={() => {
                                alert(`Printing kiosk registration receipt for Member ${latestMember.name}.\nID: ${latestMember.id}`);
                              }}
                              className="flex-1 h-12 bg-[#F2F2F7] text-[#3A3A3C] font-bold rounded-xl text-sm transition hover:bg-[#E5E5EA] active:scale-95 flex items-center justify-center space-x-2 cursor-pointer"
                            >
                              <span>Print Receipt</span>
                            </button>
                            
                            <button
                              id="btn-register-another"
                              onClick={handleResetForm}
                              className="flex-1 h-12 bg-[#007AFF] hover:bg-[#0062CC] text-white font-extrabold rounded-xl text-sm shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center space-x-1"
                            >
                              <span>Done</span>
                              <Check className="w-4 h-4 stroke-[2.5]" />
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* BOTTOM ACTION BAR - EXCLUDING SUCCESS STEP */}
                {currentStep !== 'success' && (
                  <div className="bg-[#F2F2F7] px-6 py-4 md:px-10 md:py-6 border-t border-[#E5E5EA] flex items-center justify-between">
                    <div>
                      {currentStepIndex > 0 ? (
                        <button
                          id="btn-back"
                          type="button"
                          onClick={handleBack}
                          className="h-14 px-6 bg-white border border-[#E5E5EA] text-[#007AFF] font-bold rounded-xl text-base hover:border-[#C6C6C8] transition flex items-center space-x-2 shadow-sm active:scale-95 cursor-pointer"
                        >
                          <ArrowLeft className="w-5 h-5" />
                          <span className="hidden sm:inline">Back</span>
                        </button>
                      ) : (
                        <div className="text-xs text-[#8E8E93] font-bold">
                          PulseGym Kiosk v2.4
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-3">
                      {/* Interactive indicator pills inside bottom bar for Tablet layout */}
                      <div className="hidden sm:flex space-x-1.5 px-3">
                        {stepsList.map((step, idx) => (
                          <div 
                            key={step.id} 
                            className={`
                              w-2 h-2 rounded-full transition-all duration-300
                              ${idx === currentStepIndex ? 'w-5 bg-[#007AFF]' : 'bg-[#C6C6C8]'}
                            `}
                          />
                        ))}
                      </div>

                      {currentStep === 'summary' ? (
                        <button
                          id="btn-submit"
                          type="button"
                          onClick={handleSubmit}
                          className="h-14 px-8 bg-[#007AFF] hover:bg-[#0062CC] text-white font-extrabold rounded-xl text-base shadow-md transition flex items-center space-x-2 active:scale-95 cursor-pointer"
                        >
                          <span>Activate Membership</span>
                          <Check className="w-5 h-5 stroke-[3px]" />
                        </button>
                      ) : currentStep === 'payment' ? (
                        <button
                          id="btn-next"
                          type="button"
                          disabled={paymentState !== 'success'}
                          onClick={handleNext}
                          className={`h-14 px-8 font-extrabold rounded-xl text-base shadow-md transition flex items-center space-x-2 cursor-pointer ${
                            paymentState === 'success' 
                              ? 'bg-[#007AFF] hover:bg-[#0062CC] text-white active:scale-95' 
                              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          <span>{paymentState === 'success' ? 'Continue' : 'Waiting for Payment...'}</span>
                          <ArrowRight className="w-5 h-5" />
                        </button>
                      ) : (
                        <button
                          id="btn-next"
                          type="button"
                          onClick={handleNext}
                          className="h-14 px-8 bg-[#007AFF] hover:bg-[#0062CC] text-white font-extrabold rounded-xl text-base shadow-md transition flex items-center space-x-2 active:scale-95 cursor-pointer"
                        >
                          <span>Next</span>
                          <ArrowRight className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>
        )}

      </main>

      {/* FOOTER SECTION */}
      <footer className="w-full max-w-5xl mx-auto mt-6 text-center text-[11px] text-slate-400 font-medium px-4">
        <p>© 2026 Pulse PowerHUB KIOSK Smart develop by abie IT Solutions</p>
      </footer>

    </div>
  );
}
