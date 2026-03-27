export interface SystemSettings {
  systemName: string;
  schoolName: string;
  schoolAddress?: string;
  logoUrl?: string;
  budgetTypes: string[];
  adminPassword?: string;
  financeName?: string;
  financeUsername?: string;
  financePassword?: string;
  directorName?: string;
  directorUsername?: string;
  directorPassword?: string;
}

export interface DisbursementItem {
  name: string;
  qty: number;
  price: number;
  total: number;
  isExempted?: boolean;
}

export interface VendorGroup {
  vendorId?: string;
  vendorName: string;
  vendorTaxId: string;
  vendorAddress?: string;
  items: DisbursementItem[];
  subtotal: number;
  exemptedTotal: number;
  taxableTotal: number;
  vat: number;
  withholdingTax: number;
  netTotal: number;
}

export interface Disbursement {
  id?: string;
  docNumber: string;
  date: string;
  requesterId?: string;
  requester: string;
  adminGroup?: string;
  budgetType: string;
  activity: string;
  activityPurpose?: string;
  participants?: string;
  mode?: 'purchase' | 'travel' | 'activity';
  travelDestination?: string;
  travelDate?: string;
  returnTravelDate?: string;
  vendorId?: string;
  vendorName: string; // Primary or first vendor
  vendorTaxId: string;
  vendorAddress?: string;
  items: DisbursementItem[];
  vendors?: VendorGroup[]; // Support for multiple vendors
  subtotal: number;
  exemptedTotal?: number;
  taxableTotal?: number;
  vat: number;
  withholdingTax: number;
  netTotal: number;
  status: 'รอดำเนินการ' | 'การเงินตรวจแล้ว' | 'อนุมัติแล้ว';
  createdAt: string;
}

export interface Vendor {
  id?: string;
  name: string;
  taxId: string;
  address?: string;
}

export interface Requester {
  id?: string;
  name: string;
}

export interface User {
  id?: string;
  name: string;
  role: 'admin' | 'finance' | 'requester';
  initials: string;
  color: string;
}
