'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Disbursement, Vendor, Requester, User, SystemSettings } from '@/lib/types';

interface AppContextType {
  settings: SystemSettings;
  updateSettings: (newSettings: Partial<SystemSettings>) => Promise<void>;
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
  users: User[];
  addUser: (user: Omit<User, 'id'>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  disbursements: Disbursement[];
  addDisbursement: (data: Omit<Disbursement, 'id' | 'createdAt'>) => Promise<void>;
  updateDisbursementStatus: (id: string, status: Disbursement['status']) => Promise<void>;
  deleteDisbursement: (id: string) => Promise<void>;
  vendors: Vendor[];
  addVendor: (data: Omit<Vendor, 'id'>) => Promise<void>;
  deleteVendor: (id: string) => Promise<void>;
  requesters: Requester[];
  addRequester: (data: Omit<Requester, 'id'>) => Promise<void>;
  deleteRequester: (id: string) => Promise<void>;
}

const DEFAULT_SETTINGS: SystemSettings = {
  systemName: 'ระบบจัดการและติดตามการเบิกจ่าย',
  schoolName: 'โรงเรียนสิรินธรวรานุสรณ์ ยะลา',
  schoolAddress: '135 ม.1 ต.บุดี อ.เมือง จ.ยะลา 95000',
  logoUrl: '',
  budgetTypes: ['เงินอุดหนุนรายหัว', 'รายได้สถานศึกษา', 'เงินกิจกรรมพัฒนาผู้เรียน', 'เงินโครงการสานฝันการกีฬาฯ'],
  adminPassword: 'admin'
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [disbursements, setDisbursements] = useState<Disbursement[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [requesters, setRequesters] = useState<Requester[]>([]);

  useEffect(() => {
    // Settings listener
    const unsubSettings = onSnapshot(doc(db, 'settings', 'general'), (docSnap) => {
      if (docSnap.exists()) {
        setSettings({ ...DEFAULT_SETTINGS, ...docSnap.data() } as SystemSettings);
      } else {
        setDoc(doc(db, 'settings', 'general'), DEFAULT_SETTINGS);
      }
    });

    // Users listener
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
      if (data.length === 0) {
        const defaultAdmin: Omit<User, 'id'> = { name: 'ผู้ดูแลระบบ', role: 'admin', initials: 'ผดร', color: 'bg-blue-500/20 text-blue-300' };
        addDoc(collection(db, 'users'), defaultAdmin);
      } else {
        setUsers(data);
        setCurrentUser(prev => {
          if (!prev) return data[0];
          return data.find(u => u.id === prev.id) || data[0];
        });
      }
    });

    // Disbursements listener
    const qDisbursements = query(collection(db, 'disbursements'), orderBy('createdAt', 'desc'));
    const unsubDisbursements = onSnapshot(qDisbursements, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Disbursement));
      setDisbursements(data);
    });

    // Vendors listener
    const unsubVendors = onSnapshot(collection(db, 'vendors'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vendor));
      setVendors(data);
    });

    // Requesters listener
    const unsubRequesters = onSnapshot(collection(db, 'requesters'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Requester));
      setRequesters(data);
    });

    return () => {
      unsubSettings();
      unsubUsers();
      unsubDisbursements();
      unsubVendors();
      unsubRequesters();
    };
  }, []);

  const updateSettings = async (newSettings: Partial<SystemSettings>) => {
    await setDoc(doc(db, 'settings', 'general'), { ...settings, ...newSettings }, { merge: true });
  };

  const addUser = async (data: Omit<User, 'id'>) => {
    await addDoc(collection(db, 'users'), data);
  };

  const deleteUser = async (id: string) => {
    await deleteDoc(doc(db, 'users', id));
  };

  const addDisbursement = async (data: Omit<Disbursement, 'id' | 'createdAt'>) => {
    await addDoc(collection(db, 'disbursements'), {
      ...data,
      createdAt: new Date().toISOString()
    });
  };

  const updateDisbursementStatus = async (id: string, status: Disbursement['status']) => {
    await updateDoc(doc(db, 'disbursements', id), { status });
  };

  const deleteDisbursement = async (id: string) => {
    await deleteDoc(doc(db, 'disbursements', id));
  };

  const addVendor = async (data: Omit<Vendor, 'id'>) => {
    await addDoc(collection(db, 'vendors'), data);
  };

  const deleteVendor = async (id: string) => {
    await deleteDoc(doc(db, 'vendors', id));
  };

  const addRequester = async (data: Omit<Requester, 'id'>) => {
    await addDoc(collection(db, 'requesters'), data);
  };

  const deleteRequester = async (id: string) => {
    await deleteDoc(doc(db, 'requesters', id));
  };

  return (
    <AppContext.Provider value={{
      settings, updateSettings,
      currentUser, setCurrentUser,
      users, addUser, deleteUser,
      disbursements, addDisbursement, updateDisbursementStatus, deleteDisbursement,
      vendors, addVendor, deleteVendor,
      requesters, addRequester, deleteRequester
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
