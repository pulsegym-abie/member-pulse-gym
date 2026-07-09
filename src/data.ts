import { MembershipPackage } from './types';

export const MEMBERSHIP_PACKAGES: MembershipPackage[] = [
  {
    id: 'day_pass',
    name: 'Day Pass',
    durationDays: 1,
    durationDisplay: 'Day',
    price: 275000,
    priceDisplay: 'Rp 275.000',
    discountNote: 'Single day full access',
    features: [
      'Access Gym',
      'Recovery'
    ],
    colorTheme: {
      bg: 'bg-sky-50/50',
      border: 'border-sky-200 focus:border-sky-500',
      text: 'text-sky-900',
      accent: 'bg-sky-600 hover:bg-sky-700',
      badge: 'bg-sky-100 text-sky-900 border-sky-200'
    }
  },
  {
    id: 'three_day_passes',
    name: '3 Day Passes',
    durationDays: 3,
    durationDisplay: '3 Days',
    price: 700000,
    priceDisplay: 'Rp 700.000',
    discountNote: 'Flexible multi-day access',
    features: [
      'Access Gym',
      'Recovery'
    ],
    colorTheme: {
      bg: 'bg-indigo-50/50',
      border: 'border-indigo-200 focus:border-indigo-500',
      text: 'text-indigo-900',
      accent: 'bg-indigo-600 hover:bg-indigo-700',
      badge: 'bg-indigo-100 text-indigo-900 border-indigo-200'
    }
  },
  {
    id: 'one_week',
    name: '1 Week',
    durationDays: 7,
    durationDisplay: 'Week',
    price: 1200000,
    priceDisplay: 'Rp 1.200.000',
    discountNote: 'Save with weekly pass',
    features: [
      'Access Gym',
      'Recovery',
      'Discount 10% at Kembali Berawa Restaurant'
    ],
    colorTheme: {
      bg: 'bg-emerald-50/50',
      border: 'border-emerald-200 focus:border-emerald-500',
      text: 'text-emerald-900',
      accent: 'bg-emerald-600 hover:bg-emerald-700',
      badge: 'bg-emerald-100 text-emerald-900 border-emerald-200'
    }
  },
  {
    id: 'two_weeks',
    name: '2 Weeks',
    durationDays: 14,
    durationDisplay: '2 Weeks',
    price: 1800000,
    priceDisplay: 'Rp 1.800.000',
    discountNote: 'Extended stay package',
    features: [
      'Access Gym',
      'Recovery',
      'Discount 10% at Kembali Berawa Restaurant'
    ],
    colorTheme: {
      bg: 'bg-purple-50/50',
      border: 'border-purple-200 focus:border-purple-500',
      text: 'text-purple-900',
      accent: 'bg-purple-600 hover:bg-purple-700',
      badge: 'bg-purple-100 text-purple-900 border-purple-200'
    }
  },
  {
    id: 'four_weeks',
    name: '4 Weeks',
    durationDays: 28,
    durationDisplay: '4 Weeks',
    price: 2500000,
    priceDisplay: 'Rp 2.500.000',
    discountNote: 'Best value full month',
    features: [
      'Access Gym',
      'Recovery',
      'Discount 10% at Kembali Berawa Restaurant'
    ],
    colorTheme: {
      bg: 'bg-amber-50/50',
      border: 'border-amber-200 focus:border-amber-500',
      text: 'text-amber-900',
      accent: 'bg-amber-600 hover:bg-amber-700',
      badge: 'bg-amber-100 text-amber-900 border-amber-200'
    }
  }
];

export const SOURCE_INFO_OPTIONS = [
  { id: 'instagram', label: 'Instagram / Social Media' },
  { id: 'website', label: 'Google / Search Engine' },
  { id: 'brosur', label: 'Flyer / Billboard / Local Area' },
  { id: 'referral', label: 'Recommended by Friend / Member (Referral)' },
  { id: 'event', label: 'Event / Mall Exhibition' },
  { id: 'lainnya', label: 'Other Sources' }
];
