/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GenderType = 'Male' | 'Female';

export interface MembershipPackage {
  id: string;
  name: string;
  durationMonths?: number;
  durationDays: number;
  durationDisplay: string;
  price: number;
  priceDisplay: string;
  discountNote?: string;
  features: string[];
  colorTheme: {
    bg: string;
    border: string;
    text: string;
    accent: string;
    badge: string;
  };
}

export interface GymRegistration {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: GenderType | '';
  dob: string;
  packageId: string;
  sourceInfo: string;
  referralName?: string;
  photoBase64?: string;
  registrationDate: string;
  expirationDate: string;
  status: 'Active' | 'Pending';
}

export type StepId = 'personal_info' | 'contact_info' | 'membership_package' | 'payment' | 'referral_source' | 'summary' | 'selfie' | 'success';

export interface RegistrationStep {
  id: StepId;
  title: string;
  subtitle: string;
}
