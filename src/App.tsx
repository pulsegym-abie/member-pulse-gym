/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Mail, Phone, Calendar, ArrowLeft, ArrowRight, Check, 
  CheckCircle2, Dumbbell, Users, Search, Trash2, Download, 
  Sparkles, ChevronRight, ChevronLeft, Info, RefreshCw, X, CreditCard, Loader2,
  Camera, CameraOff, Upload, LayoutDashboard, Lock, Unlock, LogOut, DollarSign, Activity, TrendingUp
} from 'lucide-react';
import { GymRegistration, StepId, GenderType, Expense, DateRange } from './types';
import { MEMBERSHIP_PACKAGES, SOURCE_INFO_OPTIONS } from './data';
import { CupertinoInput } from './components/CupertinoInput';
import { CupertinoSegmentedControl } from './components/CupertinoSegmentedControl';
import { CupertinoSwitch } from './components/CupertinoSwitch';
import { MembershipCardView } from './components/MembershipCardView';
import { RegulationsModal } from './components/RegulationsModal';
import { CupertinoDatePicker } from './components/CupertinoDatePicker';
import AdminStatsAndCharts from './components/AdminStatsAndCharts';

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

// Auto-format Indonesian & global phone numbers in a sleek iOS format
const formatPhoneNumber = (value: string) => {
  let digits = value.replace(/\D/g, '');
  
  // If user starts with '0', remove the leading '0' (since country code is selected separately)
  if (digits.startsWith('0')) {
    digits = digits.substring(1);
  }
  
  if (digits.length <= 3) {
    return digits;
  } else if (digits.length <= 7) {
    return `${digits.slice(0, 3)} - ${digits.slice(3)}`;
  } else {
    return `${digits.slice(0, 3)} - ${digits.slice(3, 7)} - ${digits.slice(7, 12)}`;
  }
};

// Formatter for Rupiah currency
const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount).replace('IDR', 'Rp');
};

export default function App() {
  // --- STATE ---
  const [currentView, setCurrentView] = useState<'portal' | 'member' | 'dashboard'>('member');
  const [registrationType, setRegistrationType] = useState<'individual' | 'group'>('individual');
  const [groupSize, setGroupSize] = useState<number>(2);
  const [groupMembers, setGroupMembers] = useState<string[]>(['']);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [passcode, setPasscode] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<StepId>('membership_package');
  const [direction, setDirection] = useState<number>(1); // 1 = forward, -1 = backward
  const [agreedTerms, setAgreedTerms] = useState<boolean>(false);
  const [showRegulationsModal, setShowRegulationsModal] = useState<boolean>(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState<boolean>(false);
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [allRegistrations, setAllRegistrations] = useState<GymRegistration[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: '',
    endDate: ''
  });
  const [paymentState, setPaymentState] = useState<'idle' | 'waiting' | 'processing' | 'success'>('idle');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterPackage, setFilterPackage] = useState<string>('all');
  const [historyPage, setHistoryPage] = useState<number>(1);
  const [countryCode, setCountryCode] = useState<string>('');

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    gender: '' as GenderType | '',
    dob: '',
    email: '',
    phone: '',
    emergencyName: '',
    emergencyPhone: '',
    packageId: MEMBERSHIP_PACKAGES[1].id, // Silver as default
    sourceInfo: '',
    referralName: '',
  });

  // Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Synchronize country code with phone input presence
  useEffect(() => {
    const hasPhoneInput = formData.phone.trim().length > 0;
    if (hasPhoneInput && !countryCode) {
      setCountryCode('+62'); // Default to Indonesia when they start typing
    } else if (!hasPhoneInput && countryCode) {
      setCountryCode(''); // Reset to empty if they clear the input
    }
  }, [formData.phone]);

  // Synchronize group members count based on group size (excluding the main person)
  useEffect(() => {
    setGroupMembers((prev) => {
      const neededLength = Math.max(1, groupSize - 1);
      if (prev.length === neededLength) return prev;
      if (prev.length < neededLength) {
        return [...prev, ...Array(neededLength - prev.length).fill('')];
      } else {
        return prev.slice(0, neededLength);
      }
    });
  }, [groupSize]);

  // Created Member for success step
  const [latestMember, setLatestMember] = useState<GymRegistration | null>(null);

  // Selfie Photo States
  const [selfiePhoto, setSelfiePhoto] = useState<string | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // --- PERSISTENCE & DATA SEEDING ---
  useEffect(() => {
    // 1. Set Initial 30-Day Date Range Filter
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    setDateRange({
      startDate: thirtyDaysAgo.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    });

    // 2. Load and Seed Registrations
    const savedRegs = localStorage.getItem('pulsegym_registrations');
    let loadedRegs: GymRegistration[] = [];
    if (savedRegs) {
      try {
        loadedRegs = JSON.parse(savedRegs);
      } catch (e) {
        console.error('Failed to load registrations', e);
      }
    }
    
    if (loadedRegs.length === 0) {
      const getPastDateString = (daysAgo: number) => {
        const d = new Date();
        d.setDate(today.getDate() - daysAgo);
        return d.toISOString().split('T')[0];
      };
      
      loadedRegs = [
        {
          id: 'PLS-BRN-264901',
          name: 'Amiruddin Siregar',
          email: 'amir.siregar@gmail.com',
          phone: '+628123456781',
          gender: 'Male',
          dob: '1992-04-12',
          packageId: 'bronze_30d',
          sourceInfo: 'Instagram Ads',
          registrationDate: getPastDateString(22),
          expirationDate: getPastDateString(-8), // 30 days total
          status: 'Active'
        },
        {
          id: 'PLS-SLV-268294',
          name: 'Budi Santoso',
          email: 'budi.santoso@yahoo.com',
          phone: '+628123456782',
          gender: 'Male',
          dob: '1988-08-25',
          packageId: 'silver_90d',
          sourceInfo: 'Friend Referral',
          referralName: 'Michael',
          registrationDate: getPastDateString(18),
          expirationDate: getPastDateString(-72), // 90 days total
          status: 'Active'
        },
        {
          id: 'PLS-GLD-261058',
          name: 'Sarah Wijaya',
          email: 'sarah.wijaya@gmail.com',
          phone: '+628123456783',
          gender: 'Female',
          dob: '1995-11-03',
          packageId: 'gold_180d',
          sourceInfo: 'Google Maps / Search',
          registrationDate: getPastDateString(12),
          expirationDate: getPastDateString(-168), // 180 days total
          status: 'Active'
        },
        {
          id: 'PLS-PLT-269103',
          name: 'Michael Chen',
          email: 'michael.chen@hotmail.com',
          phone: '+628123456784',
          gender: 'Male',
          dob: '1990-01-15',
          packageId: 'platinum_360d',
          sourceInfo: 'Walking Passerby',
          registrationDate: getPastDateString(5),
          expirationDate: getPastDateString(-355), // 360 days total
          status: 'Active'
        },
        {
          id: 'PLS-GLD-265502',
          name: 'Jessica Amanda',
          email: 'jessica.amanda@outlook.com',
          phone: '+628123456785',
          gender: 'Female',
          dob: '1997-06-20',
          packageId: 'gold_180d',
          sourceInfo: 'Instagram Ads',
          registrationDate: getPastDateString(2),
          expirationDate: getPastDateString(-178),
          status: 'Active'
        }
      ];
      localStorage.setItem('pulsegym_registrations', JSON.stringify(loadedRegs));
    }
    setAllRegistrations(loadedRegs);

    // 3. Load and Seed Expenses
    const savedExpenses = localStorage.getItem('pulsegym_expenses');
    let loadedExpenses: Expense[] = [];
    if (savedExpenses) {
      try {
        loadedExpenses = JSON.parse(savedExpenses);
      } catch (e) {
        console.error('Failed to load expenses', e);
      }
    }
    
    if (loadedExpenses.length === 0) {
      const getPastDateString = (daysAgo: number) => {
        const d = new Date();
        d.setDate(today.getDate() - daysAgo);
        return d.toISOString().split('T')[0];
      };

      loadedExpenses = [
        {
          id: 'exp_1',
          title: 'PLN Electricity Bill (Ruko AC)',
          amount: 1200000,
          category: 'Utilities',
          date: getPastDateString(20)
        },
        {
          id: 'exp_2',
          title: 'Daikin AC Routine Maintenance',
          amount: 450000,
          category: 'Maintenance',
          date: getPastDateString(15)
        },
        {
          id: 'exp_3',
          title: 'Part-Time Coach Wages',
          amount: 2500000,
          category: 'Salaries',
          date: getPastDateString(10)
        },
        {
          id: 'exp_4',
          title: 'Meta Ads Gym Promotion',
          amount: 600000,
          category: 'Marketing',
          date: getPastDateString(4)
        }
      ];
      localStorage.setItem('pulsegym_expenses', JSON.stringify(loadedExpenses));
    }
    setExpenses(loadedExpenses);
  }, []);

  const saveRegistrations = (newList: GymRegistration[]) => {
    setAllRegistrations(newList);
    localStorage.setItem('pulsegym_registrations', JSON.stringify(newList));
  };

  const saveExpenses = (newList: Expense[]) => {
    setExpenses(newList);
    localStorage.setItem('pulsegym_expenses', JSON.stringify(newList));
  };

  const handleAddExpense = (newExp: Omit<Expense, 'id'>) => {
    const expenseWithId: Expense = {
      ...newExp,
      id: 'exp_' + Date.now()
    };
    const updated = [expenseWithId, ...expenses];
    saveExpenses(updated);
  };

  const handleDeleteExpense = (id: string) => {
    const updated = expenses.filter(e => e.id !== id);
    saveExpenses(updated);
  };

  // --- CAMERA HELPERS FOR SELFIE ---
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 320, facingMode: "user" },
        audio: false
      });
      setCameraStream(stream);
      setIsCameraActive(true);
      
      // Delay slightly to ensure video element is mounted and ready
      setTimeout(() => {
        const videoElement = document.getElementById('selfie-video') as HTMLVideoElement;
        if (videoElement) {
          videoElement.srcObject = stream;
          videoElement.play().catch(err => console.error("Video play failed:", err));
        }
      }, 100);
    } catch (err: any) {
      console.error("Camera access failed:", err);
      setCameraError("Camera access is blocked or not supported on this device/browser. Please upload a photo from your library instead.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    const videoElement = document.getElementById('selfie-video') as HTMLVideoElement;
    if (videoElement) {
      const canvas = document.createElement('canvas');
      // We want a square capture
      const size = Math.min(videoElement.videoWidth, videoElement.videoHeight) || 320;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw image centered and cropped as a square
        const sx = (videoElement.videoWidth - size) / 2;
        const sy = (videoElement.videoHeight - size) / 2;
        ctx.drawImage(videoElement, sx, sy, size, size, 0, 0, size, size);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedImage(dataUrl);
        setSelfiePhoto(dataUrl);
        stopCamera();
      }
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const dataUrl = event.target.result as string;
          setCapturedImage(dataUrl);
          setSelfiePhoto(dataUrl);
          stopCamera();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Stop camera if user navigates away or auto-start if on selfie step
  useEffect(() => {
    if (currentStep !== 'selfie') {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
      }
      setIsCameraActive(false);
    } else {
      startCamera();
    }
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [currentStep]);

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

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      }

      const phoneDigits = formData.phone.replace(/\D/g, '');
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (phoneDigits.length < 6 || phoneDigits.length > 15) {
        newErrors.phone = `Phone number must be 6-15 digits (current: ${phoneDigits.length} digits)`;
      } else if (!/^[0-9\- ]+$/.test(formData.phone)) {
        newErrors.phone = 'Only numbers, spaces, and hyphens are allowed';
      }

      if (!formData.emergencyName.trim()) {
        newErrors.emergencyName = 'Emergency contact name is required';
      } else if (formData.emergencyName.trim().length < 3) {
        newErrors.emergencyName = 'Contact name must be at least 3 characters';
      }

      const emergencyPhoneDigits = formData.emergencyPhone.replace(/\D/g, '');
      if (!formData.emergencyPhone.trim()) {
        newErrors.emergencyPhone = 'Emergency contact phone is required';
      } else if (emergencyPhoneDigits.length < 6 || emergencyPhoneDigits.length > 15) {
        newErrors.emergencyPhone = `Emergency phone must be 6-15 digits (current: ${emergencyPhoneDigits.length} digits)`;
      } else if (!/^[0-9\- ]+$/.test(formData.emergencyPhone)) {
        newErrors.emergencyPhone = 'Only numbers, spaces, and hyphens are allowed';
      }

      if (registrationType === 'group') {
        groupMembers.forEach((member, idx) => {
          if (!member.trim()) {
            newErrors[`groupMember_${idx}`] = `Member #${idx + 2}'s full name is required`;
          } else if (member.trim().length < 3) {
            newErrors[`groupMember_${idx}`] = `Member #${idx + 2}'s name must be at least 3 characters`;
          }
        });
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
    if (currentStep === 'membership_package') {
      setCurrentStep('personal_info');
    } else if (currentStep === 'personal_info') {
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
    if (currentStep === 'personal_info') {
      setCurrentStep('membership_package');
    } else if (currentStep === 'payment') {
      setCurrentStep('personal_info');
      setPaymentState('idle');
    } else if (currentStep === 'referral_source') {
      setCurrentStep('payment');
    } else if (currentStep === 'summary') {
      setCurrentStep('referral_source');
    } else if (currentStep === 'selfie') {
      setCurrentStep('summary');
    }
  };

  // --- SUBMIT REGISTRATION ---
  const handleSubmit = () => {
    if (!agreedTerms) {
      setErrors({ terms: 'You must read and agree to the Terms & Conditions by scrolling down and signing' });
      return;
    }

    if (!signatureImage) {
      setErrors({ terms: 'Please sign electronically to confirm your agreement' });
      return;
    }

    setDirection(1);
    setCurrentStep('selfie');
  };

  // --- COMPLETE AND SAVE REGISTRATION ---
  const handleCompleteRegistration = (photoToSave: string | null) => {
    const pkg = MEMBERSHIP_PACKAGES.find(p => p.id === formData.packageId) || MEMBERSHIP_PACKAGES[1];
    
    // Calculate dates
    const regDateObj = new Date();
    const expDateObj = new Date();
    expDateObj.setDate(expDateObj.getDate() + pkg.durationDays);

    const primaryMemberId = generateMemberID(formData.packageId);

    const primaryRegistration: GymRegistration = {
      id: primaryMemberId,
      name: formData.name,
      email: formData.email,
      phone: `${countryCode} ${formData.phone.trim()}`,
      gender: formData.gender as GenderType,
      dob: formData.dob,
      packageId: formData.packageId,
      sourceInfo: formData.sourceInfo,
      referralName: formData.sourceInfo === 'referral' ? formData.referralName : undefined,
      emergencyName: formData.emergencyName.trim() || undefined,
      emergencyPhone: formData.emergencyPhone.trim() || undefined,
      photoBase64: photoToSave || undefined,
      registrationDate: regDateObj.toISOString().split('T')[0],
      expirationDate: expDateObj.toISOString().split('T')[0],
      status: 'Active',
      groupName: registrationType === 'group' ? `${formData.name}'s Group` : undefined,
      isGroupPrimary: registrationType === 'group' ? true : undefined,
    };

    const newRegistrations: GymRegistration[] = [primaryRegistration];

    if (registrationType === 'group') {
      groupMembers.forEach((member, i) => {
        if (member.trim()) {
          const secondaryMemberId = generateMemberID(formData.packageId);
          newRegistrations.push({
            id: secondaryMemberId,
            name: member.trim().toUpperCase(),
            email: `${formData.email.split('@')[0]}+member${i+2}@${formData.email.split('@')[1] || 'gmail.com'}`,
            phone: `${countryCode} ${formData.phone.trim()}`,
            gender: '',
            dob: formData.dob,
            packageId: formData.packageId,
            sourceInfo: formData.sourceInfo,
            registrationDate: regDateObj.toISOString().split('T')[0],
            expirationDate: expDateObj.toISOString().split('T')[0],
            status: 'Active',
            groupName: `${formData.name}'s Group`,
            isGroupPrimary: false,
          });
        }
      });
    }

    const updatedList = [...newRegistrations, ...allRegistrations];
    saveRegistrations(updatedList);
    setLatestMember(primaryRegistration);
    
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
      emergencyName: '',
      emergencyPhone: '',
      packageId: MEMBERSHIP_PACKAGES[1].id,
      sourceInfo: '',
      referralName: '',
    });
    setCountryCode('+62');
    setAgreedTerms(false);
    setSignatureImage(null);
    setHasScrolledToBottom(false);
    setShowRegulationsModal(false);
    setPaymentState('idle');
    setErrors({});
    setLatestMember(null);
    setSelfiePhoto(null);
    setCapturedImage(null);
    setCameraError(null);
    setRegistrationType('individual');
    setGroupSize(2);
    setGroupMembers(['']);
    setDirection(-1);
    setCurrentStep('membership_package');
    setCurrentView('member');
  };

  // --- EXPORT TO CSV ---
  const handleExportCSV = () => {
    if (allRegistrations.length === 0) {
      alert('No registration data available to export.');
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Member ID,Full Name,Gender,Date of Birth,Email,Phone,Emergency Name,Emergency Phone,Package,Source,Referral,Registration Date,Expiration Date\n";

    allRegistrations.forEach((r) => {
      const row = [
        r.id,
        `"${r.name.replace(/"/g, '""')}"`,
        r.gender,
        r.dob,
        r.email,
        r.phone,
        `"${(r.emergencyName || '').replace(/"/g, '""')}"`,
        `"${(r.emergencyPhone || '').replace(/"/g, '""')}"`,
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

  const ITEMS_PER_PAGE = 20;
  const totalPages = Math.ceil(filteredRegistrations.length / ITEMS_PER_PAGE) || 1;
  const currentPage = Math.min(Math.max(1, historyPage), totalPages);
  const paginatedRegistrations = filteredRegistrations.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Steps definition for UI indicator
  const stepsList = [
    { id: 'membership_package', label: 'Plan', subtitle: 'Select Membership' },
    { id: 'personal_info', label: 'Personal Info', subtitle: 'Contact & Details' },
    { id: 'payment', label: 'Payment', subtitle: 'EDC Terminal' },
    { id: 'referral_source', label: 'Discovery', subtitle: 'How You Found Us' },
    { id: 'summary', label: 'Confirm', subtitle: 'T&C & Signature' },
    { id: 'selfie', label: 'ID Photo', subtitle: 'Selfie (Mandatory)' }
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
    <div className="min-h-screen bg-[#f2f2f7] py-3 px-3 md:py-5 md:px-6 flex flex-col justify-between font-sans relative">
      
      {/* FLOATING BACK BUTTON FOR MEMBERSHIP KIOSK (TOP-LEFT CORNER) */}
      {currentView === 'member' && (
        <button
          onClick={() => {
            if (confirm("Are you sure you want to return to the Main Menu? Current form progress will be reset.")) {
              handleResetForm();
            }
          }}
          className="fixed top-4 left-4 z-50 flex items-center justify-center w-11 h-11 bg-white hover:bg-red-50 border border-[#E5E5EA] hover:border-red-200 text-[#007AFF] hover:text-red-600 rounded-full shadow-lg transition-all active:scale-95 cursor-pointer group"
          title="Exit Kiosk"
        >
          <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5 stroke-[2.5]" />
        </button>
      )}

      {/* HEADER SECTION (ONLY SHOWN ON DASHBOARD) */}
      {currentView === 'dashboard' && (
        <header className="w-full max-w-5xl mx-auto mb-4 bg-white/90 backdrop-blur-md border border-[#E5E5EA] rounded-[18px] px-5 py-3 flex justify-between items-center shadow-sm">
          <div className="flex items-center space-x-2.5">
            <div className="w-9.5 h-9.5 rounded-lg bg-[#007AFF] flex items-center justify-center text-white shadow-md shadow-[#007AFF]/20">
              <Dumbbell className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-black font-display">
                PULSE <span className="text-[#007AFF]">POWERHUB</span>
              </h1>
              <p className="text-[9px] text-[#8E8E93] font-bold uppercase tracking-widest leading-none mt-0.5">
                {currentView === 'portal' ? 'Gateway Portal' : currentView === 'dashboard' ? 'Admin Controller' : 'Self-Service Kiosk'}
              </p>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center space-x-2">
            {currentView === 'dashboard' && (
              <button
                onClick={() => setCurrentView('portal')}
                className="flex items-center space-x-1.5 text-slate-600 hover:text-black font-extrabold text-xs bg-[#F2F2F7] px-3.5 py-2 rounded-xl hover:bg-[#E5E5EA] active:scale-95 transition cursor-pointer border border-[#E5E5EA]"
              >
                <LogOut className="w-3.5 h-3.5 text-red-500" />
                <span>Exit Dashboard</span>
              </button>
            )}
          </div>
        </header>
      )}

      {/* MAIN CONTAINER */}
      <main className="w-full max-w-5xl mx-auto flex-grow flex flex-col justify-center">
        
        {currentView === 'portal' && (
          <div className="w-full max-w-4xl mx-auto py-4 md:py-8 space-y-8 animate-fade-in" id="view-portal">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto pt-4">
              {/* CARD 1: MEMBER KIOSK */}
              <button
                type="button"
                id="btn-goto-member"
                onClick={() => {
                  setDirection(1);
                  setCurrentView('member');
                }}
                className="bg-white rounded-[24px] border border-[#E5E5EA] shadow-lg p-6 md:p-8 flex flex-col justify-between text-left transition hover:shadow-xl hover:border-[#007AFF]/40 hover:-translate-y-1 active:scale-[0.98] group cursor-pointer duration-300"
              >
                <div>
                  <div className="w-14 h-14 bg-[#007AFF]/10 text-[#007AFF] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300">
                    <Users className="w-7 h-7 stroke-[2.5px]" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                    <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest">Self-Service Active</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-black mt-2 tracking-tight">
                    Member Registration
                  </h3>
                  <p className="text-xs text-[#8E8E93] mt-2 font-medium leading-relaxed">
                    Pick your customized membership, register contact credentials, complete terminal payments, capture a quick ID photo, and generate your personal Pulse digital card instantly.
                  </p>
                </div>
                <div className="mt-8 flex items-center justify-between w-full">
                  <span className="text-xs font-extrabold text-[#007AFF] uppercase tracking-wider group-hover:translate-x-1.5 transition duration-300 flex items-center">
                    Start Registration <ChevronRight className="w-4 h-4 ml-0.5" />
                  </span>
                  <div className="text-[10px] text-slate-400 font-mono bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                    TERMINAL-01
                  </div>
                </div>
              </button>

              {/* CARD 2: LOGIN DASHBOARD */}
              <button
                type="button"
                id="btn-goto-dashboard"
                onClick={() => {
                  setLoginError('');
                  setPasscode('');
                  setShowLoginModal(true);
                }}
                className="bg-white rounded-[24px] border border-[#E5E5EA] shadow-lg p-6 md:p-8 flex flex-col justify-between text-left transition hover:shadow-xl hover:border-slate-800/40 hover:-translate-y-1 active:scale-[0.98] group cursor-pointer duration-300"
              >
                <div>
                  <div className="w-14 h-14 bg-slate-100 text-slate-800 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300">
                    <LayoutDashboard className="w-7 h-7 text-slate-600" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full" />
                    <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-widest">Secure Admin Portal</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-black mt-2 tracking-tight">
                    Login Dashboard
                  </h3>
                  <p className="text-xs text-[#8E8E93] mt-2 font-medium leading-relaxed">
                    Access administrative counters, track customer registrations, monitor active plan metrics, review user-submitted photos, delete outdated records, and export excel/CSV spreadsheets.
                  </p>
                </div>
                <div className="mt-8 flex items-center justify-between w-full">
                  <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider group-hover:translate-x-1.5 transition duration-300 flex items-center">
                    Enter Dashboard <ChevronRight className="w-4 h-4 ml-0.5" />
                  </span>
                  <div className="text-[10px] text-slate-400 font-mono bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                    SECURE-GATE
                  </div>
                </div>
              </button>
            </div>

            {/* Quick stats footer for the portal */}
            <div className="max-w-md mx-auto pt-6 text-center">
              <p className="text-[11px] text-[#8E8E93] font-semibold tracking-wide">
                Active Local Database: <span className="text-black font-extrabold font-mono">{allRegistrations.length} registrations</span> saved
              </p>
            </div>
          </div>
        )}

        {currentView === 'dashboard' && (
          <div className="space-y-6 w-full" id="view-dashboard">
            {/* DYNAMIC STATISTICS AND CHARTS MODULE */}
            <AdminStatsAndCharts
              registrations={allRegistrations}
              expenses={expenses}
              onAddExpense={handleAddExpense}
              onDeleteExpense={handleDeleteExpense}
              dateRange={dateRange}
              setDateRange={setDateRange}
            />

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
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setHistoryPage(1);
                  }}
                  className="w-full h-12 pl-11 pr-4 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm font-semibold text-black focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:bg-white transition"
                />
              </div>

              <div className="flex space-x-2">
                <select
                  id="staff-package-filter"
                  value={filterPackage}
                  onChange={(e) => {
                    setFilterPackage(e.target.value);
                    setHistoryPage(1);
                  }}
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
                      setHistoryPage(1);
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
                    <th className="py-2.5 px-3">Member ID / Info</th>
                    <th className="py-2.5 px-3">Contact</th>
                    <th className="py-2.5 px-3">Plan</th>
                    <th className="py-2.5 px-3">Join Date / Expires</th>
                    <th className="py-2.5 px-3">Discovery / Referral</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5EA] text-xs font-semibold text-[#3A3A3C]">
                  {filteredRegistrations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-[#8E8E93]">
                        <Users className="w-10 h-10 mx-auto opacity-30 mb-2" />
                        <p className="font-bold">No registration data found.</p>
                        <p className="text-xs font-medium">Try changing your search terms or register a new member.</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedRegistrations.map((m) => {
                      const mPkg = MEMBERSHIP_PACKAGES.find(p => p.id === m.packageId);
                      return (
                        <tr key={m.id} className="hover:bg-[#F2F2F7]/50 transition">
                          <td className="py-1.5 px-3">
                            <div className="flex items-center space-x-2">
                              {m.photoBase64 ? (
                                <img src={m.photoBase64} alt={m.name} className="w-9 h-9 rounded-full object-cover border border-[#E5E5EA] shadow-sm flex-shrink-0" />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-[#F2F2F7] border border-[#E5E5EA] flex items-center justify-center text-[#8E8E93] flex-shrink-0">
                                  <User className="w-4 h-4" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <span className="font-mono text-[9px] bg-[#F2F2F7] text-black font-bold px-1 py-0.5 rounded border border-[#E5E5EA]">
                                  {m.id}
                                </span>
                                <div className="font-extrabold text-black mt-0.5 uppercase text-xs truncate max-w-[130px] leading-tight" title={m.name}>{m.name}</div>
                                <div className="flex flex-wrap items-center gap-1 mt-1">
                                  <span className="text-[9px] bg-[#007AFF]/10 text-[#007AFF] px-1 py-0.2 rounded font-extrabold whitespace-nowrap">
                                    {m.gender || 'Group Member'} • DOB: {m.dob}
                                  </span>
                                  {m.groupName && (
                                    <span className={`text-[8px] px-1 py-0.2 rounded font-extrabold whitespace-nowrap border ${
                                      m.isGroupPrimary 
                                        ? 'bg-amber-50 text-amber-900 border-amber-200' 
                                        : 'bg-slate-100 text-slate-800 border-slate-200'
                                    }`} title={m.groupName}>
                                      👥 {m.isGroupPrimary ? 'Leader' : 'Group'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-1.5 px-3 text-[11px] font-medium">
                            <div className="flex items-center space-x-1 text-black">
                              <Mail className="w-3 h-3 text-[#8E8E93] flex-shrink-0" />
                              <span className="truncate max-w-[120px]" title={m.email}>{m.email}</span>
                            </div>
                            <div className="flex items-center space-x-1 mt-0.5 text-[#8E8E93]">
                              <Phone className="w-3 h-3 text-[#8E8E93] flex-shrink-0" />
                              <span>{m.phone}</span>
                            </div>
                            {m.emergencyName && (
                              <div className="mt-1 text-[9px] font-bold text-[#FF9500] bg-[#FF9500]/8 px-1 py-0.5 rounded border border-[#FF9500]/15 flex items-center space-x-0.5 max-w-[150px]">
                                <span className="font-extrabold text-[#FF9500]">SOS:</span>
                                <span className="truncate text-slate-700" title={`${m.emergencyName} - ${m.emergencyPhone}`}>
                                  {m.emergencyName} ({m.emergencyPhone})
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="py-1.5 px-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${mPkg?.colorTheme.badge || 'bg-slate-100 text-slate-800'}`}>
                              {mPkg?.name || m.packageId.toUpperCase()}
                            </span>
                            <div className="text-[10px] text-[#8E8E93] mt-0.5 font-medium">{mPkg?.priceDisplay}</div>
                          </td>
                          <td className="py-1.5 px-3 text-[11px] font-semibold">
                            <div className="text-black">
                              <span className="font-bold text-[#8E8E93]">Join:</span> {m.registrationDate}
                            </div>
                            <div className="text-red-500 mt-0.5">
                              <span className="text-[#8E8E93] font-normal">Exp:</span> {m.expirationDate}
                            </div>
                          </td>
                          <td className="py-1.5 px-3">
                            <div className="capitalize font-bold text-black text-[11px] truncate max-w-[120px]">
                              {SOURCE_INFO_OPTIONS.find(o => o.id === m.sourceInfo)?.label || m.sourceInfo}
                            </div>
                            {m.referralName && (
                              <div className="text-[9px] font-bold bg-[#007AFF]/10 text-[#007AFF] px-1 py-0.2 rounded border border-[#007AFF]/15 mt-0.5 inline-block truncate max-w-[110px]" title={m.referralName}>
                                Ref: {m.referralName}
                              </div>
                            )}
                          </td>
                          <td className="py-1.5 px-3 text-center">
                            <button
                              onClick={() => handleDeleteEntry(m.id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
                              title="Delete Member"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION NUMBER CONTROLLER */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-3 bg-[#F2F2F7]/50 border border-[#E5E5EA] p-3 rounded-2xl">
                <div className="text-xs font-semibold text-[#8E8E93]">
                  Showing <span className="text-black font-extrabold">{Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredRegistrations.length)}</span> to{' '}
                  <span className="text-black font-extrabold">{Math.min(currentPage * ITEMS_PER_PAGE, filteredRegistrations.length)}</span> of{' '}
                  <span className="text-black font-extrabold">{filteredRegistrations.length}</span> members
                </div>
                
                <div className="flex items-center space-x-1">
                  {/* Prev Button */}
                  <button
                    onClick={() => setHistoryPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-[#E5E5EA] bg-white text-black disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F2F2F7] transition cursor-pointer flex items-center justify-center"
                    title="Previous Page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Page Numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                    const isNearCurrent = Math.abs(pageNum - currentPage) <= 1;
                    const isFirstOrLast = pageNum === 1 || pageNum === totalPages;
                    
                    if (totalPages <= 7 || isNearCurrent || isFirstOrLast) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setHistoryPage(pageNum)}
                          className={`w-7.5 h-7.5 rounded-lg text-xs font-extrabold transition cursor-pointer flex items-center justify-center ${
                            currentPage === pageNum
                              ? 'bg-[#007AFF] text-white shadow-sm ring-2 ring-[#007AFF]/20'
                              : 'border border-[#E5E5EA] bg-white text-[#3A3A3C] hover:bg-[#F2F2F7]'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                    
                    // Ellipsis placeholders
                    if (pageNum === 2 || pageNum === totalPages - 1) {
                      return (
                        <span key={pageNum} className="px-1 text-xs font-bold text-[#8E8E93] select-none">
                          ...
                        </span>
                      );
                    }
                    
                    return null;
                  })}

                  {/* Next Button */}
                  <button
                    onClick={() => setHistoryPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-[#E5E5EA] bg-white text-black disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F2F2F7] transition cursor-pointer flex items-center justify-center"
                    title="Next Page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="mt-5 text-right">
              <button
                id="staff-close-btn"
                onClick={() => setCurrentView('portal')}
                className="bg-[#007AFF] hover:bg-[#0062CC] text-white font-bold h-11 px-6 rounded-xl text-sm transition active:scale-95 cursor-pointer"
              >
                Exit to Portal Menu
              </button>
            </div>
          </motion.div>
          </div>
        )}

        {currentView === 'member' && (
          /* --- WIZARD FORM SYSTEM --- */
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            
            {/* LEFT SIDEBAR - STEP TRACKER FOR TABLET (10-inch desktop layouts) */}
            <div className="hidden md:block md:col-span-4 lg:col-span-3">
              <div className="bg-white rounded-[24px] border border-slate-100 shadow-lg p-4 flex flex-col justify-between h-full">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Registration Steps</h3>
                  <div className="space-y-1.5">
                    {stepsList.map((step, idx) => {
                      const isCompleted = idx < currentStepIndex;
                      const isActive = step.id === currentStep;
                      
                      return (
                        <div 
                          key={step.id}
                          className={`
                            flex items-center space-x-3 p-2 rounded-xl transition-all duration-200
                            ${isActive ? 'bg-[#007AFF]/10 border border-[#007AFF]/15' : 'bg-transparent border border-transparent'}
                          `}
                        >
                          <div className={`
                            w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                            ${isCompleted ? 'bg-emerald-500 text-white' : ''}
                            ${isActive ? 'bg-[#007AFF] text-white ring-4 ring-[#007AFF]/10' : ''}
                            ${!isCompleted && !isActive ? 'bg-[#F2F2F7] text-[#8E8E93]' : ''}
                          `}>
                            {isCompleted ? <Check className="w-4 h-4 stroke-[3px]" /> : idx + 1}
                          </div>
                          
                          <div className="text-left">
                            <p className={`text-xs font-bold leading-tight ${isActive ? 'text-[#007AFF] font-extrabold' : 'text-black'}`}>
                              {step.label}
                            </p>
                            <p className={`text-[10px] mt-0.5 font-semibold leading-none ${isActive ? 'text-[#007AFF]/85' : 'text-[#8E8E93]'}`}>
                              {step.subtitle}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-[#F2F2F7] border border-[#E5E5EA] rounded-2xl p-3.5 mt-4">
                  <div className="flex space-x-2 items-start">
                    <Info className="w-4 h-4 text-[#007AFF] mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-[#3A3A3C]">Need Help?</h4>
                      <p className="text-[10px] text-[#8E8E93] font-semibold mt-0.5 leading-normal">
                        Please ask our staff at the front desk if you have any questions.
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
                      Step {currentStepIndex + 1} of {stepsList.length}
                    </span>
                    <span className="text-sm font-bold text-black">
                      {stepsList[currentStepIndex].label}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-[#F2F2F7] h-2 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="bg-[#007AFF] h-full rounded-full transition-all duration-300"
                      style={{ width: `${((currentStepIndex + 1) / stepsList.length) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* CARD ENVELOPE */}
              <div className="bg-white rounded-[24px] border border-[#E5E5EA] shadow-xl overflow-hidden flex flex-col justify-between min-h-[320px] md:min-h-[400px]">
                
                {/* WIZARD CONTENT - ANIMATED STEP TRANSITION */}
                <div className="p-5 md:p-6 flex-grow relative overflow-hidden">
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
                      {/* STEP: PERSONAL & CONTACT INFO (CONSOLIDATED) */}
                      {currentStep === 'personal_info' && (
                        <div className="space-y-4" id="step-personal-info">
                          <div>
                            <span className="text-xs font-extrabold text-[#007AFF] uppercase tracking-widest">Basic Information</span>
                            <h2 className="text-2xl md:text-3xl font-extrabold text-black tracking-tight mt-1">Personal & Contact Details</h2>
                            <p className="text-sm text-[#8E8E93] mt-1 font-medium">
                              {registrationType === 'group' 
                                ? "Enter contact details for the group leader, followed by other group members below." 
                                : "Please enter your profile details and contact credentials to complete your registration."}
                            </p>
                          </div>

                          <div className="space-y-4">
                            <CupertinoInput
                              id="input-name"
                              label={registrationType === 'group' ? "Primary Member Full Name (Group Leader) *" : "Full Name *"}
                              placeholder={registrationType === 'group' ? "Enter group leader's full name" : "Enter your full name"}
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                              style={{ textTransform: 'uppercase' }}
                              icon={<User className="w-5 h-5 text-slate-400" />}
                              error={errors.name}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <CupertinoSegmentedControl
                                id="control-gender"
                                label="Gender *"
                                options={[
                                  { value: 'Male', label: 'Male' },
                                  { value: 'Female', label: 'Female' }
                                ]}
                                selectedValue={formData.gender}
                                onChange={(val) => setFormData({ ...formData, gender: val as GenderType })}
                              />

                              <CupertinoDatePicker
                                id="input-dob"
                                label="Date of Birth *"
                                value={formData.dob}
                                onChange={(val) => setFormData({ ...formData, dob: val })}
                                error={errors.dob}
                              />
                            </div>
                            {errors.gender && (
                              <p className="text-xs font-medium text-red-500 px-1 mt-0.5">{errors.gender}</p>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <CupertinoInput
                                id="input-email"
                                label="Email Address *"
                                type="email"
                                placeholder="e.g., member@email.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                icon={<Mail className="w-5 h-5 text-slate-400" />}
                                error={errors.email}
                              />

                              <div className="flex flex-col space-y-1.5 w-full">
                                <label htmlFor="input-phone" className="text-[13px] font-bold text-[#3A3A3C] tracking-wide ml-1">
                                  Phone / WhatsApp Number *
                                </label>
                                <div className="flex space-x-2">
                                  {/* Country Code Select Dropdown */}
                                  <div className="relative flex-shrink-0 w-24">
                                    <select
                                      id="input-country-code"
                                      value={countryCode}
                                      onChange={(e) => setCountryCode(e.target.value)}
                                      className="w-full h-14 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl px-2 text-sm font-semibold text-black focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:bg-white transition-all duration-200 cursor-pointer appearance-none pr-6"
                                    >
                                      <option value="" disabled className="text-slate-400">--</option>
                                      {COUNTRY_CODES.map((c) => (
                                        <option key={c.code} value={c.code}>
                                          {c.country} {c.code}
                                        </option>
                                      ))}
                                    </select>
                                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 font-bold text-[9px]">
                                      ▼
                                    </div>
                                  </div>
                                  
                                  {/* Phone Input field */}
                                  <div className="flex-grow">
                                    <CupertinoInput
                                      id="input-phone"
                                      type="tel"
                                      placeholder="e.g., 812 3456 7890"
                                      value={formData.phone}
                                      onChange={(e) => setFormData({ ...formData, phone: formatPhoneNumber(e.target.value) })}
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
                                  <span className="text-[10px] text-slate-400 px-1">
                                    Please provide an active WhatsApp number.
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* EMERGENCY CONTACT SECTION */}
                            <div className="pt-2 border-t border-[#E5E5EA]">
                              <span className="text-xs font-extrabold text-[#FF9500] uppercase tracking-widest block">Emergency Contact</span>
                              <p className="text-[11px] text-[#8E8E93] font-medium mt-0.5">Please provide contact details in case of medical emergency.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <CupertinoInput
                                id="input-emergency-name"
                                label="Emergency Contact Name *"
                                placeholder="e.g., Jane Doe (Spouse/Parent)"
                                value={formData.emergencyName}
                                onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                                icon={<User className="w-5 h-5 text-slate-400" />}
                                error={errors.emergencyName}
                              />

                              <CupertinoInput
                                id="input-emergency-phone"
                                label="Emergency Phone Number *"
                                placeholder="e.g., 812 3456 7890"
                                value={formData.emergencyPhone}
                                onChange={(e) => setFormData({ ...formData, emergencyPhone: formatPhoneNumber(e.target.value) })}
                                icon={<Phone className="w-5 h-5 text-slate-400" />}
                                error={errors.emergencyPhone}
                              />
                            </div>

                            {/* DYNAMIC ADDITIONAL GROUP MEMBERS */}
                            {registrationType === 'group' && (
                              <div className="pt-4 border-t border-[#E5E5EA] space-y-4">
                                <div>
                                  <span className="text-xs font-extrabold text-[#007AFF] uppercase tracking-widest block">Group Members Details</span>
                                  <p className="text-[11px] text-[#8E8E93] font-medium mt-0.5">Please provide the full names of the other group members.</p>
                                </div>
                                <div className="space-y-3.5">
                                  {groupMembers.map((member, i) => (
                                    <div key={i} className="p-3.5 bg-[#F2F2F7]/50 rounded-2xl border border-[#E5E5EA] space-y-2">
                                      <div className="text-xs font-extrabold text-[#3A3A3C]">Member #{i + 2} Details</div>
                                      <CupertinoInput
                                        id={`input-group-member-${i}`}
                                        label={`Member #${i + 2} Full Name *`}
                                        placeholder={`Enter Member #${i + 2}'s full name`}
                                        value={member}
                                        onChange={(e) => {
                                          const nextMembers = [...groupMembers];
                                          nextMembers[i] = e.target.value.toUpperCase();
                                          setGroupMembers(nextMembers);
                                          // Clear errors when typing
                                          if (errors[`groupMember_${i}`]) {
                                            const nextErrors = { ...errors };
                                            delete nextErrors[`groupMember_${i}`];
                                            setErrors(nextErrors);
                                          }
                                        }}
                                        style={{ textTransform: 'uppercase' }}
                                        icon={<User className="w-5 h-5 text-slate-400" />}
                                        error={errors[`groupMember_${i}`]}
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                       {/* STEP 3: MEMBERSHIP PACKAGE */}
                      {currentStep === 'membership_package' && (
                        <div className="space-y-4" id="step-membership-package">
                          <div>
                            <span className="text-xs font-extrabold text-[#007AFF] uppercase tracking-widest">Plan Option</span>
                            <h2 className="text-xl md:text-2xl font-extrabold text-black tracking-tight mt-0.5">Select Membership</h2>
                            <p className="text-xs text-[#8E8E93] mt-0.5 font-medium">Find the plan that best fits your fitness goals.</p>
                          </div>

                          {/* Individual vs Group Registration Selection */}
                          <div className="bg-[#F2F2F7] p-1.5 rounded-2xl border border-[#E5E5EA]">
                            <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-2 ml-2 mt-1">Registration Type</div>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => setRegistrationType('individual')}
                                className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-bold text-xs md:text-sm transition-all cursor-pointer ${
                                  registrationType === 'individual'
                                    ? 'bg-white text-black border border-[#E5E5EA] shadow-sm font-extrabold'
                                    : 'text-slate-500 hover:text-black hover:bg-white/50'
                                }`}
                              >
                                <User className={`w-4 h-4 ${registrationType === 'individual' ? 'text-[#007AFF]' : 'text-slate-400'}`} />
                                <span>Individual (1 Person)</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setRegistrationType('group')}
                                className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-bold text-xs md:text-sm transition-all cursor-pointer ${
                                  registrationType === 'group'
                                    ? 'bg-white text-black border border-[#E5E5EA] shadow-sm font-extrabold'
                                    : 'text-slate-500 hover:text-black hover:bg-white/50'
                                }`}
                              >
                                <Users className={`w-4 h-4 ${registrationType === 'group' ? 'text-[#007AFF]' : 'text-slate-400'}`} />
                                <span>Group (2+ People)</span>
                              </button>
                            </div>
                          </div>

                          {/* Dynamic Group Size selector if Group chosen */}
                          {registrationType === 'group' && (
                            <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl space-y-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">Group Size Selection</h4>
                                  <p className="text-[11px] text-amber-800 font-semibold mt-0.5">Choose the number of registrations in your group (max 5).</p>
                                </div>
                                <div className="flex items-center bg-white border border-amber-200 rounded-xl p-1 shadow-sm">
                                  <button
                                    type="button"
                                    onClick={() => setGroupSize(prev => Math.max(2, prev - 1))}
                                    disabled={groupSize <= 2}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-amber-900 hover:bg-amber-100 font-bold disabled:opacity-30 cursor-pointer"
                                  >
                                    -
                                  </button>
                                  <span className="w-8 text-center text-sm font-black text-amber-950">{groupSize}</span>
                                  <button
                                    type="button"
                                    onClick={() => setGroupSize(prev => Math.min(5, prev + 1))}
                                    disabled={groupSize >= 5}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-amber-900 hover:bg-amber-100 font-bold disabled:opacity-30 cursor-pointer"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                              <div className="bg-white/80 border border-amber-100 px-3 py-2 rounded-xl text-[11px] font-bold text-emerald-700 flex items-center space-x-1.5 shadow-sm">
                                <Sparkles className="w-3.5 h-3.5 flex-shrink-0 animate-pulse text-amber-600" />
                                <span>Group Promo: Special 10% group discount applied to total price!</span>
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {MEMBERSHIP_PACKAGES.map((pkg) => {
                              const isSelected = formData.packageId === pkg.id;
                              return (
                                <button
                                  key={pkg.id}
                                  id={`pkg-select-${pkg.id}`}
                                  type="button"
                                  onClick={() => setFormData({ ...formData, packageId: pkg.id })}
                                  className={`
                                    relative flex flex-col justify-between text-left p-3.5 rounded-xl border-2 transition-all cursor-pointer h-full
                                    ${isSelected ? 'border-[#007AFF] ring-4 ring-[#007AFF]/10 bg-[#007AFF]/5' : 'border-[#E5E5EA] hover:border-[#C6C6C8] bg-white'}
                                  `}
                                >
                                  {isSelected && (
                                    <div className="absolute top-2.5 right-2.5 bg-[#007AFF] text-white rounded-full p-0.5 shadow-sm z-10">
                                      <Check className="w-3 h-3 stroke-[3px]" />
                                    </div>
                                  )}

                                  <div>
                                    <div className="flex items-center space-x-1.5">
                                      <span className={`text-[9px] font-extrabold tracking-wider px-2 py-0.5 rounded-full uppercase ${pkg.colorTheme.badge}`}>
                                        {pkg.name}
                                      </span>
                                      {pkg.durationDays >= 7 && (
                                        <span className="text-[9px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                                          Best Value
                                        </span>
                                      )}
                                    </div>
                                    <h3 className="font-extrabold text-sm text-black mt-1 leading-tight">{pkg.name}</h3>
                                    <p className="text-[11px] text-[#8E8E93] mt-0.5 font-semibold">{pkg.discountNote}</p>
                                  </div>

                                  <div className="mt-3 pt-2 border-t border-[#E5E5EA] flex items-baseline space-x-1">
                                    <span className="text-lg font-black text-black leading-none">{pkg.priceDisplay}</span>
                                    <span className="text-[#8E8E93] text-[9px] font-bold">/ {pkg.durationDisplay}</span>
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
                              <div className="bg-[#F2F2F7] rounded-2xl p-3.5 border border-[#E5E5EA] mt-1.5">
                                <h4 className="text-xs font-bold text-[#3A3A3C] uppercase tracking-wider mb-1.5">Benefits of {selectedPkg.name}:</h4>
                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-[#3A3A3C] font-semibold">
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
                            const standardTotal = selectedPkg.price * (registrationType === 'group' ? groupSize : 1);
                            const discount = registrationType === 'group' ? Math.round(standardTotal * 0.10) : 0;
                            const finalPrice = standardTotal - discount;
                            
                            return (
                              <div className="bg-[#007AFF]/5 rounded-2xl p-4 border border-[#007AFF]/15 flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <span className="text-[10px] font-extrabold text-[#007AFF] uppercase tracking-wider">
                                    {registrationType === 'group' ? `SELECTED PLAN (GROUP OF ${groupSize})` : 'SELECTED PLAN'}
                                  </span>
                                  <h4 className="text-base font-extrabold text-black">{selectedPkg.name}</h4>
                                  <p className="text-xs text-slate-500 font-semibold">
                                    {registrationType === 'group' 
                                      ? `${selectedPkg.discountNote} • Includes ${groupSize} Members` 
                                      : selectedPkg.discountNote}
                                  </p>
                                </div>
                                <div className="text-right flex flex-col items-end">
                                  {registrationType === 'group' ? (
                                    <>
                                      <span className="text-xs font-bold text-slate-400 line-through">
                                        {formatRupiah(standardTotal)}
                                      </span>
                                      <span className="text-lg font-black text-emerald-600">
                                        {formatRupiah(finalPrice)}
                                      </span>
                                      <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 mt-1">
                                        10% Group Promo
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <span className="text-lg font-black text-black">{selectedPkg.priceDisplay}</span>
                                      <p className="text-[10px] text-slate-400 font-bold">/ {selectedPkg.durationDisplay}</p>
                                    </>
                                  )}
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
                        <div className="space-y-4" id="step-summary">
                          <div>
                            <span className="text-xs font-extrabold text-[#007AFF] uppercase tracking-widest">Final Step</span>
                            <h2 className="text-xl md:text-2xl font-extrabold text-black tracking-tight mt-0.5">Confirm Registration</h2>
                            <p className="text-xs text-[#8E8E93] mt-0.5 font-medium">Please review your details before completing your registration.</p>
                          </div>

                          <div className="space-y-3.5">
                            {/* Cupertino Grouped List Style */}
                            <div className="bg-[#F2F2F7] rounded-2xl border border-[#E5E5EA] divide-y divide-[#E5E5EA] overflow-hidden">
                              <div className="flex justify-between items-center py-2.5 px-3.5">
                                <span className="text-[11px] font-bold text-[#8E8E93] uppercase">
                                  {registrationType === 'group' ? 'Leader Name' : 'Full Name'}
                                </span>
                                <span className="text-xs md:text-sm font-extrabold text-black uppercase">{formData.name}</span>
                              </div>
                              
                              {registrationType === 'group' && (
                                <>
                                  <div className="flex justify-between items-start py-2.5 px-3.5">
                                    <span className="text-[11px] font-bold text-[#8E8E93] uppercase mt-0.5">Other Members</span>
                                    <div className="text-right max-w-[60%]">
                                      {groupMembers.map((member, mIdx) => (
                                        <div key={mIdx} className="text-xs font-bold text-black uppercase truncate">
                                          {member || `MEMBER #${mIdx + 2}`}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="flex justify-between items-center py-2.5 px-3.5">
                                    <span className="text-[11px] font-bold text-[#8E8E93] uppercase">Total Group Size</span>
                                    <span className="text-xs md:text-sm font-extrabold text-[#007AFF]">{groupSize} People</span>
                                  </div>
                                </>
                              )}

                              <div className="flex justify-between items-center py-2.5 px-3.5">
                                <span className="text-[11px] font-bold text-[#8E8E93] uppercase">Gender / Date of Birth</span>
                                <span className="text-xs md:text-sm font-bold text-black">{formData.gender} • {formData.dob}</span>
                              </div>
                              <div className="flex justify-between items-center py-2.5 px-3.5">
                                <span className="text-[11px] font-bold text-[#8E8E93] uppercase">Email</span>
                                <span className="text-xs md:text-sm font-bold text-black">{formData.email}</span>
                              </div>
                              <div className="flex justify-between items-center py-2.5 px-3.5">
                                <span className="text-[11px] font-bold text-[#8E8E93] uppercase">Phone / WhatsApp</span>
                                <span className="text-xs md:text-sm font-bold text-black">{countryCode} {formData.phone}</span>
                              </div>
                              <div className="flex justify-between items-center py-2.5 px-3.5">
                                <span className="text-[11px] font-bold text-[#8E8E93] uppercase">Selected Plan</span>
                                <span className="text-xs md:text-sm font-extrabold text-[#007AFF]">
                                  {MEMBERSHIP_PACKAGES.find(p => p.id === formData.packageId)?.name}
                                </span>
                              </div>

                              {(() => {
                                const selectedPkg = MEMBERSHIP_PACKAGES.find(p => p.id === formData.packageId);
                                if (!selectedPkg) return null;
                                const standardTotal = selectedPkg.price * (registrationType === 'group' ? groupSize : 1);
                                const discount = registrationType === 'group' ? Math.round(standardTotal * 0.10) : 0;
                                const finalPrice = standardTotal - discount;

                                return (
                                  <>
                                    {registrationType === 'group' && (
                                      <div className="flex justify-between items-center py-2.5 px-3.5 bg-slate-100/50">
                                        <span className="text-[11px] font-bold text-[#8E8E93] uppercase">Subtotal ({groupSize} People)</span>
                                        <span className="text-xs md:text-sm font-bold text-slate-500 line-through">
                                          {formatRupiah(standardTotal)}
                                        </span>
                                      </div>
                                    )}
                                    {registrationType === 'group' && (
                                      <div className="flex justify-between items-center py-2.5 px-3.5 bg-emerald-50/50">
                                        <span className="text-[11px] font-bold text-emerald-700 uppercase">10% Group Discount</span>
                                        <span className="text-xs md:text-sm font-bold text-emerald-700">
                                          - {formatRupiah(discount)}
                                        </span>
                                      </div>
                                    )}
                                    <div className="flex justify-between items-center py-2.5 px-3.5 bg-[#007AFF]/5">
                                      <span className="text-[11px] font-bold text-[#007AFF] uppercase">Total Cost</span>
                                      <span className="text-xs md:text-sm font-black text-[#007AFF]">
                                        {formatRupiah(finalPrice)}
                                      </span>
                                    </div>
                                  </>
                                );
                              })()}

                              <div className="flex justify-between items-center py-2.5 px-3.5">
                                <span className="text-[11px] font-bold text-[#8E8E93] uppercase">How You Found Us</span>
                                <span className="text-xs md:text-sm font-bold text-black capitalize">
                                  {SOURCE_INFO_OPTIONS.find(o => o.id === formData.sourceInfo)?.label.split('/')[0]}
                                </span>
                              </div>
                              {formData.sourceInfo === 'referral' && (
                                <div className="flex justify-between items-center py-2.5 px-3.5 bg-[#007AFF]/5">
                                  <span className="text-[11px] font-bold text-[#007AFF] uppercase">Referring Friend (Referral)</span>
                                  <span className="text-xs md:text-sm font-bold text-[#007AFF] uppercase">{formData.referralName}</span>
                                </div>
                              )}
                            </div>

                            {/* Terms agreement and signature preview */}
                            <div className="space-y-3 pt-2">
                              <div 
                                className="p-4 rounded-2xl border border-[#E5E5EA] bg-[#F2F2F7]/50 flex items-start space-x-3 cursor-pointer select-none hover:bg-[#F2F2F7] transition duration-200"
                                onClick={() => setShowRegulationsModal(true)}
                              >
                                <div className="flex-shrink-0 mt-0.5">
                                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                                    agreedTerms && signatureImage 
                                      ? 'bg-[#007AFF] border-[#007AFF] text-white' 
                                      : 'border-[#C6C6C8] bg-white'
                                  }`}>
                                    {agreedTerms && signatureImage && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                                  </div>
                                </div>
                                <div className="flex-grow text-left">
                                  <label className="text-sm font-extrabold text-black block cursor-pointer">
                                    I Agree to the Gym Regulations & Liability Waiver *
                                  </label>
                                  <p className="text-[11px] text-[#8E8E93] font-medium leading-normal mt-0.5">
                                    {signatureImage 
                                      ? 'Regulations have been accepted and signed electronically.' 
                                      : 'Click here to read regulations and provide your electronic signature (Required).'}
                                  </p>
                                </div>
                              </div>

                              {/* Signature preview if exists */}
                              {signatureImage && (
                                <div className="p-3 bg-[#E5E5EA]/30 rounded-2xl border border-[#E5E5EA] flex items-center justify-between text-left">
                                  <div>
                                    <span className="text-[9px] font-extrabold text-[#8E8E93] uppercase tracking-wider block">ELECTRONIC SIGNATURE</span>
                                    <img src={signatureImage} alt="E-Signature" className="h-10 mt-1 object-contain bg-white rounded-lg border border-slate-200 px-2 py-0.5" />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSignatureImage(null);
                                      setAgreedTerms(false);
                                    }}
                                    className="text-xs text-[#E25C5C] font-extrabold hover:underline cursor-pointer px-2 py-1 hover:bg-red-50 rounded-lg transition animate-fade-in"
                                  >
                                    Clear
                                  </button>
                                </div>
                              )}

                              {errors.terms && (
                                <p className="text-xs font-medium text-red-500 px-1">{errors.terms}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* STEP: SELFIE CAPTURE */}
                      {currentStep === 'selfie' && (
                        <div className="space-y-4" id="step-selfie">
                          <div>
                            <span className="text-xs font-extrabold text-[#007AFF] uppercase tracking-widest">Member Identification</span>
                            <h2 className="text-xl md:text-2xl font-extrabold text-black tracking-tight mt-0.5">Take ID Photo</h2>
                            <p className="text-xs text-[#8E8E93] mt-0.5 font-medium">Capture a selfie or upload a photo to display on your digital membership card.</p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                            {/* Photo capture/preview area */}
                            <div className="flex flex-col items-center justify-center bg-slate-50 border border-[#E5E5EA] rounded-2xl p-4 min-h-[260px] relative overflow-hidden shadow-inner">
                              {capturedImage ? (
                                <div className="relative w-44 h-44 rounded-full border-4 border-white shadow-lg overflow-hidden group">
                                  <img src={capturedImage} alt="Captured Selfie" className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <span className="text-xs font-bold text-white uppercase tracking-wider">Captured!</span>
                                  </div>
                                </div>
                              ) : isCameraActive ? (
                                <div className="relative w-44 h-44 rounded-full border-4 border-[#007AFF]/30 overflow-hidden bg-black flex items-center justify-center shadow-lg">
                                  <video id="selfie-video" className="w-full h-full object-cover transform scale-x-[-1]" playsInline muted />
                                  {/* Face target guide overlay */}
                                  <div className="absolute inset-0 border-[3px] border-dashed border-white/45 rounded-full pointer-events-none scale-90" />
                                </div>
                              ) : (
                                <div className="flex flex-col items-center justify-center text-slate-400 space-y-2 py-8">
                                  <div className="w-14 h-14 bg-slate-200/60 rounded-full flex items-center justify-center text-slate-400">
                                    <CameraOff className="w-6 h-6" />
                                  </div>
                                  <p className="text-xs font-semibold text-slate-500 text-center max-w-[200px]">Camera is offline</p>
                                </div>
                              )}

                              {cameraError && !capturedImage && !isCameraActive && (
                                <p className="text-[10px] text-amber-600 font-semibold text-center mt-2 px-4 max-w-xs bg-amber-50 border border-amber-100 p-2 rounded-xl">
                                  {cameraError}
                                </p>
                              )}
                            </div>

                            {/* Camera Actions & File Fallback */}
                            <div className="flex flex-col space-y-3">
                              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Options</h3>
                              
                              {/* Web Cam Capture controls */}
                              {!capturedImage && (
                                <>
                                  {isCameraActive ? (
                                    <button
                                      type="button"
                                      onClick={capturePhoto}
                                      className="w-full h-11 bg-[#007AFF] hover:bg-[#0062CC] text-white font-extrabold rounded-xl text-xs transition active:scale-95 cursor-pointer flex items-center justify-center space-x-2 shadow-md uppercase tracking-wider"
                                    >
                                      <Camera className="w-4.5 h-4.5" />
                                      <span>Capture ID Photo</span>
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={startCamera}
                                      className="w-full h-11 bg-white border border-[#E5E5EA] text-[#007AFF] font-bold rounded-xl text-xs transition hover:border-[#C6C6C8] active:scale-95 cursor-pointer flex items-center justify-center space-x-2 shadow-sm uppercase tracking-wider"
                                    >
                                      <RefreshCw className="w-4 h-4" />
                                      <span>Retry Camera</span>
                                    </button>
                                  )}
                                </>
                              )}

                              {capturedImage && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCapturedImage(null);
                                    setSelfiePhoto(null);
                                    startCamera();
                                  }}
                                  className="w-full h-11 bg-white border border-[#E5E5EA] text-[#3A3A3C] font-bold rounded-xl text-xs transition hover:border-[#C6C6C8] active:scale-95 cursor-pointer flex items-center justify-center space-x-2 shadow-sm uppercase tracking-wider"
                                >
                                  <RefreshCw className="w-4 h-4 text-[#007AFF]" />
                                  <span>Retake Photo</span>
                                </button>
                              )}

                              {/* Cupertino file upload fallback */}
                              <div className="relative">
                                <input
                                  type="file"
                                  accept="image/*"
                                  id="selfie-file-input"
                                  onChange={handlePhotoUpload}
                                  className="hidden"
                                />
                                <button
                                  type="button"
                                  onClick={() => document.getElementById('selfie-file-input')?.click()}
                                  className="w-full h-11 bg-[#F2F2F7] hover:bg-[#E5E5EA] text-[#3A3A3C] font-bold rounded-xl text-xs transition active:scale-95 cursor-pointer flex items-center justify-center space-x-2 border border-[#E5E5EA] uppercase tracking-wider"
                                >
                                  <Upload className="w-4 h-4 text-slate-500" />
                                  <span>Upload Photo</span>
                                </button>
                              </div>

                              <div className="bg-[#007AFF]/5 border border-[#007AFF]/15 rounded-xl p-3 text-left">
                                <div className="flex space-x-2 items-start">
                                  <Sparkles className="w-4 h-4 text-[#007AFF] mt-0.5 flex-shrink-0" />
                                  <p className="text-[10px] text-[#007AFF] font-semibold leading-normal">
                                    Gym receptionists require a clear front-facing ID photo to verify member check-ins.
                                  </p>
                                </div>
                              </div>
                            </div>
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
                  <div className="bg-[#F2F2F7] px-5 py-3 md:px-6 md:py-3.5 border-t border-[#E5E5EA] flex items-center justify-between">
                    <div>
                      {currentStepIndex > 0 ? (
                        <button
                          id="btn-back"
                          type="button"
                          onClick={handleBack}
                          className="h-11 px-4.5 bg-white border border-[#E5E5EA] text-[#007AFF] font-bold rounded-xl text-sm hover:border-[#C6C6C8] transition flex items-center space-x-1.5 shadow-sm active:scale-95 cursor-pointer"
                        >
                          <ArrowLeft className="w-4.5 h-4.5" />
                          <span className="hidden sm:inline">Back</span>
                        </button>
                      ) : (
                        <div className="text-[10px] text-[#8E8E93] font-bold uppercase tracking-wider">
                          POWERHUB KIOSK
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
                              w-1.5 h-1.5 rounded-full transition-all duration-300
                              ${idx === currentStepIndex ? 'w-4.5 bg-[#007AFF]' : 'bg-[#C6C6C8]'}
                            `}
                          />
                        ))}
                      </div>

                      {currentStep === 'summary' ? (
                        <button
                          id="btn-submit"
                          type="button"
                          onClick={handleSubmit}
                          className="h-11 px-6 bg-[#007AFF] hover:bg-[#0062CC] text-white font-extrabold rounded-xl text-sm shadow-md transition flex items-center space-x-1.5 active:scale-95 cursor-pointer"
                        >
                          <span>Activate Membership</span>
                          <Check className="w-4.5 h-4.5 stroke-[3px]" />
                        </button>
                      ) : currentStep === 'selfie' ? (
                        <button
                          id="btn-complete-selfie"
                          type="button"
                          disabled={!selfiePhoto}
                          onClick={() => {
                            if (!selfiePhoto) {
                              alert('A selfie/photo is required to continue!');
                              return;
                            }
                            handleCompleteRegistration(selfiePhoto);
                          }}
                          className={`h-11 px-6 font-extrabold rounded-xl text-sm shadow-md transition flex items-center space-x-1.5 cursor-pointer ${
                            selfiePhoto 
                              ? 'bg-[#007AFF] hover:bg-[#0062CC] text-white active:scale-95' 
                              : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                          }`}
                        >
                          <span>Generate Card</span>
                          <Check className="w-4.5 h-4.5 stroke-[3px]" />
                        </button>
                      ) : currentStep === 'payment' ? (
                        <button
                          id="btn-next"
                          type="button"
                          disabled={paymentState !== 'success'}
                          onClick={handleNext}
                          className={`h-11 px-6 font-extrabold rounded-xl text-sm shadow-md transition flex items-center space-x-1.5 cursor-pointer ${
                            paymentState === 'success' 
                              ? 'bg-[#007AFF] hover:bg-[#0062CC] text-white active:scale-95' 
                              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          <span>{paymentState === 'success' ? 'Continue' : 'Waiting for Payment...'}</span>
                          <ArrowRight className="w-4.5 h-4.5" />
                        </button>
                      ) : (
                        <button
                          id="btn-next"
                          type="button"
                          onClick={handleNext}
                          className="h-11 px-6 bg-[#007AFF] hover:bg-[#0062CC] text-white font-extrabold rounded-xl text-sm shadow-md transition flex items-center space-x-1.5 active:scale-95 cursor-pointer"
                        >
                          <span>Next</span>
                          <ArrowRight className="w-4.5 h-4.5" />
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

      {/* iOS PASSCODE OVERLAY MODAL */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[28px] border border-[#E5E5EA] shadow-xl w-full max-w-xs overflow-hidden p-6 text-center space-y-6"
          >
            {/* Header */}
            <div className="space-y-1 relative">
              <button
                type="button"
                onClick={() => setShowLoginModal(false)}
                className="absolute -right-2 -top-2 p-1 text-[#8E8E93] hover:text-black rounded-full hover:bg-[#F2F2F7] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="w-12 h-12 bg-[#007AFF]/10 text-[#007AFF] rounded-full flex items-center justify-center mx-auto mb-2">
                <Lock className="w-5 h-5 stroke-[2.5px]" />
              </div>
              <h3 className="text-lg font-extrabold text-black tracking-tight">Enter Admin PIN</h3>
              <p className="text-[10px] text-[#8E8E93] font-medium">Default Passcode is <span className="font-extrabold text-[#007AFF]">1234</span></p>
            </div>

            {/* iOS Dot Indicators */}
            <div className="flex justify-center space-x-3.5 my-3">
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className={`
                    w-3.5 h-3.5 rounded-full transition-all duration-150 border border-[#E5E5EA]
                    ${passcode.length > index ? 'bg-[#007AFF] scale-110 shadow-sm shadow-[#007AFF]/20' : 'bg-[#F2F2F7]'}
                  `}
                />
              ))}
            </div>

            {/* Error indicator */}
            {loginError && (
              <p className="text-[11px] text-red-500 font-bold bg-red-50 py-1.5 rounded-lg border border-red-100">
                {loginError}
              </p>
            )}

            {/* PIN Buttons Keyboard */}
            <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    if (passcode.length < 4) {
                      const newPass = passcode + num;
                      setPasscode(newPass);
                      setLoginError('');
                      if (newPass === '1234') {
                        setTimeout(() => {
                          setCurrentView('dashboard');
                          setShowLoginModal(false);
                          setPasscode('');
                        }, 150);
                      } else if (newPass.length === 4) {
                        setTimeout(() => {
                          setLoginError('Incorrect PIN. Try again.');
                          setPasscode('');
                        }, 150);
                      }
                    }
                  }}
                  className="w-14 h-14 bg-[#F2F2F7] hover:bg-[#E5E5EA] active:bg-[#C6C6C8] rounded-full text-lg font-bold text-black flex flex-col items-center justify-center transition cursor-pointer mx-auto shadow-sm"
                >
                  <span>{num}</span>
                </button>
              ))}
              
              {/* Cancel */}
              <button
                type="button"
                onClick={() => setShowLoginModal(false)}
                className="w-14 h-14 text-slate-500 hover:text-red-500 text-[11px] font-bold flex items-center justify-center cursor-pointer mx-auto"
              >
                Cancel
              </button>

              {/* 0 Button */}
              <button
                type="button"
                onClick={() => {
                  if (passcode.length < 4) {
                    const newPass = passcode + '0';
                    setPasscode(newPass);
                    setLoginError('');
                    if (newPass === '1234') {
                      setTimeout(() => {
                        setCurrentView('dashboard');
                        setShowLoginModal(false);
                        setPasscode('');
                      }, 150);
                    } else if (newPass.length === 4) {
                      setTimeout(() => {
                        setLoginError('Incorrect PIN. Try again.');
                        setPasscode('');
                      }, 150);
                    }
                  }
                }}
                className="w-14 h-14 bg-[#F2F2F7] hover:bg-[#E5E5EA] active:bg-[#C6C6C8] rounded-full text-lg font-bold text-black flex items-center justify-center transition cursor-pointer mx-auto shadow-sm"
              >
                0
              </button>

              {/* Delete Button */}
              <button
                type="button"
                onClick={() => {
                  setPasscode(passcode.slice(0, -1));
                  setLoginError('');
                }}
                className="w-14 h-14 text-[#007AFF] hover:text-[#0062CC] text-xs font-bold flex items-center justify-center cursor-pointer mx-auto"
              >
                Delete
              </button>
            </div>

            {/* Bypass link */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setCurrentView('dashboard');
                  setShowLoginModal(false);
                  setPasscode('');
                }}
                className="text-[10px] text-slate-400 hover:text-[#007AFF] underline font-bold transition cursor-pointer"
              >
                Quick Bypass (Developer Demo)
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* REGULATIONS & SIGNATURE MODAL */}
      <RegulationsModal
        isOpen={showRegulationsModal}
        onClose={() => setShowRegulationsModal(false)}
        onAgree={(sigBase64) => {
          setSignatureImage(sigBase64);
          setAgreedTerms(true);
          setShowRegulationsModal(false);
          // Clear validation errors for terms if exist
          setErrors((prev) => {
            const next = { ...prev };
            delete next.terms;
            return next;
          });
        }}
        savedSignature={signatureImage}
      />

      {/* FOOTER SECTION */}
      <footer className="w-full max-w-5xl mx-auto mt-6 text-center text-[11px] text-slate-400 font-medium px-4">
        <p>© 2026 Pulse PowerHUB KIOSK Smart develop by abie IT Solutions</p>
      </footer>

    </div>
  );
}
