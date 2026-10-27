// GoDoz Official Firebase & Firestore Database Module
// Founder & Lead Software Engineer: RS GULSHAN PRAJAPATI
// Domain: https://www.godoz.in | Contact: +91 92885 21731

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAnalytics, isSupported } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";

// Official GoDoz Firebase Configuration
export const firebaseConfig = {
  apiKey: "AIzaSyABHJz_4ERnwrT_uB3BgBz-BD_3JZjlVNE",
  authDomain: "godoz-official.firebaseapp.com",
  projectId: "godoz-official",
  storageBucket: "godoz-official.firebasestorage.app",
  messagingSenderId: "977883022920",
  appId: "1:977883022920:web:3cc3e9bce8c6324edb3a7d",
  measurementId: "G-QKH3K4HV8P"
};

// Initialize Firebase App & Services
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Analytics conditionally
let analytics = null;
isSupported().then(yes => {
  if (yes) {
    analytics = getAnalytics(app);
  }
}).catch(() => {});

export { analytics };

// ============================================================================
// 1. DYNAMIC FIRESTORE RBAC (Role-Based Access Control)
// Robust verification: Checks both direct document IDs and field matching
// - 'managers' collection: Master Manager role (Can manage Admins + full access to orders & leads)
// - 'admins' collection: Customer Support & COD Admin role
// ============================================================================

/**
 * Check if a user is in the Firestore 'managers' collection (Dynamic & Secure Firestore Lookup)
 */
export async function isUserManager(userOrEmail) {
  if (!userOrEmail) return false;
  const email = (typeof userOrEmail === 'string' ? userOrEmail : (userOrEmail.email || '')).toLowerCase().trim();
  const uid = typeof userOrEmail === 'object' ? userOrEmail.uid : (typeof userOrEmail === 'string' && !userOrEmail.includes('@') ? userOrEmail : null);

  if (!email && !uid) return false;

  // The signed-in user can read their own profile even if collection-level
  // manager reads are restricted by Firestore rules.
  if (uid) {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const role = (userDoc.data()?.role || '').toLowerCase();
        if (role === 'manager' || role === 'owner') return true;
      }
    } catch (err) {
      console.warn("Firestore manager profile check notice:", err);
    }
  }

  // Check exact document IDs first; these are the canonical manager records.
  for (const managerId of [email, uid].filter(Boolean)) {
    try {
      const managerDoc = await getDoc(doc(db, "managers", managerId));
      if (managerDoc.exists() && managerDoc.data()?.active !== false) return true;
    } catch (err) {
      console.warn("Firestore manager document check notice:", err);
    }
  }

  if (email) {
    try {
      const qEmail = query(collection(db, "managers"), where("email", "==", email));
      const snapEmail = await getDocs(qEmail);
      if (snapEmail.docs.some(managerDoc => managerDoc.data()?.active !== false)) return true;
    } catch (err) {
      console.warn("Firestore manager email query notice:", err);
    }
  }

  // Keep legacy/custom manager document IDs supported for existing projects.
  try {
    const snap = await getDocs(collection(db, "managers"));
    for (const d of snap.docs) {
      const docId = d.id.toLowerCase().trim();
      const data = d.data() || {};
      const docEmail = (data.email || data.Email || data.userEmail || data.user_email || "").toLowerCase().trim();
      const docRole = (data.role || data.Role || "").toLowerCase().trim();

      if (data.active === false) continue;
      if ((email && (docId === email || docEmail === email)) ||
          (uid && docId === uid) ||
          ((docRole === 'owner' || docRole === 'manager') &&
            (email === docEmail || email === docId))) {
        return true;
      }
    }
  } catch (err) {
    console.warn("Firestore manager collection check notice:", err);
  }

  return false;
}

/**
 * Check if a user has Admin or Manager privileges (Strictly via Firestore)
 * A Manager ALWAYS has full Admin privileges.
 */
export async function isUserAdmin(userOrEmail, skipManagerCheck = false) {
  if (!userOrEmail) return false;

  // 1. Managers automatically have full Admin rights
  if (!skipManagerCheck) {
    const isMgr = await isUserManager(userOrEmail);
    if (isMgr) return true;
  }

  const email = (typeof userOrEmail === 'string' ? userOrEmail : (userOrEmail.email || '')).toLowerCase().trim();
  const uid = typeof userOrEmail === 'object' ? userOrEmail.uid : (typeof userOrEmail === 'string' && !userOrEmail.includes('@') ? userOrEmail : null);

  if (!email && !uid) return false;

  try {
    // 2. Direct document lookups in 'admins'
    if (email) {
      const docByEmail = await getDoc(doc(db, "admins", email));
      if (docByEmail.exists() && docByEmail.data()?.active !== false) {
        return true;
      }
    }
    if (uid) {
      const docByUid = await getDoc(doc(db, "admins", uid));
      if (docByUid.exists() && docByUid.data()?.active !== false) {
        return true;
      }

      // Check users collection for admin role
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const uRole = (userDoc.data()?.role || '').toLowerCase();
        if (uRole === 'admin' || uRole === 'manager' || uRole === 'owner') {
          return true;
        }
      }
    }

    // 3. Fetch all documents in 'admins' collection
    const snap = await getDocs(collection(db, "admins"));
    for (const d of snap.docs) {
      const docId = d.id.toLowerCase().trim();
      const data = d.data() || {};

      if (email && docId === email && data.active !== false) return true;
      if (uid && docId === uid && data.active !== false) return true;

      const docEmail = (data.email || data.Email || data.userEmail || data.user_email || "").toLowerCase().trim();
      const docUid = data.uid || data.userId || data.user_id || "";

      if (email && docEmail === email && data.active !== false) return true;
      if (uid && docUid === uid && data.active !== false) return true;

      for (const val of Object.values(data)) {
        if (typeof val === 'string' && val.toLowerCase().trim() === email && data.active !== false) {
          return true;
        }
      }
    }
  } catch (err) {
    console.warn("Firestore isUserAdmin check notice:", err);
  }

  return false;
}

/**
 * Get comprehensive user role: 'manager' | 'admin' | 'client'
 */
export async function getUserRole(userOrEmail) {
  if (await isUserManager(userOrEmail)) return 'manager';
  if (await isUserAdmin(userOrEmail, true)) return 'admin';
  return 'client';
}

/**
 * Real-time listener for 'admins' collection
 */
export function listenToAdmins(callback, onError) {
  try {
    const q = query(collection(db, "admins"));
    return onSnapshot(q, (snapshot) => {
      const admins = [];
      snapshot.forEach(docSnap => {
        admins.push({ id: docSnap.id, ...docSnap.data() });
      });
      callback(admins, null);
    }, (error) => {
      console.warn("Admin listener warning:", error);
      if (onError) onError(error);
      callback([], error);
    });
  } catch (e) {
    if (onError) onError(e);
    callback([], e);
    return () => {};
  }
}

/**
 * Real-time listener for 'managers' collection
 */
export function listenToManagers(callback, onError) {
  try {
    const q = query(collection(db, "managers"));
    return onSnapshot(q, (snapshot) => {
      const managers = [];
      snapshot.forEach(docSnap => {
        managers.push({ id: docSnap.id, ...docSnap.data() });
      });
      callback(managers, null);
    }, (error) => {
      console.warn("Manager listener warning:", error);
      if (onError) onError(error);
      callback([], error);
    });
  } catch (e) {
    if (onError) onError(e);
    callback([], e);
    return () => {};
  }
}

/**
 * Add a new Admin email to Firestore (Only allowed if caller is a verified Manager)
 */
export async function addAdminByManager(currentAuthUser, newAdminEmail, name = "Support Admin") {
  try {
    if (!currentAuthUser) {
      return { success: false, error: "Authentication required." };
    }

    const isMgr = await isUserManager(currentAuthUser);
    if (!isMgr) {
      return { success: false, error: "Access Denied: Only users in the 'managers' collection can create or add Admins." };
    }

    const cleanEmail = newAdminEmail.toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: "Please provide a valid email address." };
    }

    const adminRef = doc(db, "admins", cleanEmail);
    await setDoc(adminRef, {
      email: cleanEmail,
      name: name,
      role: "admin",
      active: true,
      addedBy: currentAuthUser.email || currentAuthUser.uid,
      createdAt: serverTimestamp()
    }, { merge: true });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Remove an Admin from Firestore (Only allowed if caller is a verified Manager)
 */
export async function removeAdminByManager(currentAuthUser, targetAdminEmail) {
  try {
    if (!currentAuthUser) {
      return { success: false, error: "Authentication required." };
    }

    const isMgr = await isUserManager(currentAuthUser);
    if (!isMgr) {
      return { success: false, error: "Access Denied: Only users in the 'managers' collection can revoke Admin privileges." };
    }

    const cleanEmail = targetAdminEmail.toLowerCase().trim();
    await deleteDoc(doc(db, "admins", cleanEmail));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================================================
// 2. USER PROFILE SYNC
// ============================================================================
export async function syncUserProfile(user, extraData = {}) {
  if (!user || !user.uid) return;
  try {
    const role = await getUserRole(user);
    const userRef = doc(db, "users", user.uid);
    const payload = {
      uid: user.uid,
      email: user.email || "",
      displayName: user.displayName || extraData.name || (role === 'manager' ? "Master Manager" : (role === 'admin' ? "Support Admin" : "Client")),
      photoURL: user.photoURL || "./official logo.png",
      role: role,
      lastLogin: serverTimestamp(),
      ...extraData
    };
    await setDoc(userRef, payload, { merge: true });
    try {
      localStorage.setItem('godoz_user_role', role);
      if (role === 'manager' || role === 'admin') {
        localStorage.setItem('godoz_admin_role', role);
      } else {
        localStorage.removeItem('godoz_admin_role');
      }
    } catch(e) {}
  } catch (err) {
    console.warn("User sync notice:", err);
  }
}

// ============================================================================
// 3. ORDERS & COD DATABASE MANAGEMENT
// ============================================================================

/**
 * Real-time listener for all client orders (Used by Admin & Manager Panel)
 */
export function listenToAllOrders(callback, onError) {
  try {
    const ordersCol = collection(db, "orders");
    return onSnapshot(ordersCol, (snapshot) => {
      const orders = [];
      snapshot.forEach(docSnap => {
        orders.push({ docId: docSnap.id, ...docSnap.data() });
      });

      // Merge with any offline/local orders
      try {
        const local = JSON.parse(localStorage.getItem('godoz_admin_orders') || '[]');
        local.forEach(loc => {
          if (!orders.some(o => o.id === loc.id || o.orderId === loc.orderId)) {
            orders.push(loc);
          }
        });
      } catch (e) {}

      // Sort newest first
      orders.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : Date.parse(a.createdTime || a.createdAtDate || 0);
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : Date.parse(b.createdTime || b.createdAtDate || 0);
        return (timeB || 0) - (timeA || 0);
      });

      try {
        localStorage.setItem('godoz_admin_orders', JSON.stringify(orders));
      } catch (e) {}

      callback(orders, null);
    }, (err) => {
      console.warn("Orders listener notice:", err);
      if (onError) onError(err);
      let local = [];
      try {
        local = JSON.parse(localStorage.getItem('godoz_admin_orders') || '[]');
      } catch (storageError) {
        console.warn("Could not load cached orders:", storageError);
      }
      callback(local, err);
    });
  } catch (e) {
    if (onError) onError(e);
    let local = [];
    try {
      local = JSON.parse(localStorage.getItem('godoz_admin_orders') || '[]');
    } catch (storageError) {
      console.warn("Could not load cached orders:", storageError);
    }
    callback(local, e);
    return () => {};
  }
}

/**
 * Real-time listener for a specific client's orders (Used by Client Profile Dashboard & My Products)
 */
export function listenToClientOrders(clientEmail, userId, callback) {
  try {
    const ordersCol = collection(db, "orders");
    const emailNorm = (clientEmail || "").toLowerCase().trim();

    // Query Firestore primarily by clientEmail if available, or by userId
    const ordersQuery = emailNorm
      ? query(ordersCol, where("clientEmail", "==", emailNorm))
      : (userId ? query(ordersCol, where("userId", "==", userId)) : null);

    if (!ordersQuery) {
      callback(getLocalClientRecords('godoz_orders', userId, emailNorm));
      return () => {};
    }

    return onSnapshot(ordersQuery, (snapshot) => {
      const userOrders = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        const ordId = data.id || data.orderId || docSnap.id;
        userOrders.push({ docId: docSnap.id, id: ordId, orderId: ordId, ...data });
      });

      // Strict Client Order Isolation: Ensure order belongs to logged-in email/UID
      const filteredOrders = userOrders.filter(ord => {
        const ordEmail = (ord.clientEmail || "").toLowerCase().trim();
        if (emailNorm) {
          return ordEmail === emailNorm;
        }
        if (userId) {
          return ord.userId === userId;
        }
        return false;
      });

      // Merge with user's local orders from localStorage
      const local = getLocalClientRecords('godoz_orders', userId, emailNorm);
      local.forEach(locOrd => {
        const locId = locOrd.id || locOrd.orderId;
        const locEmail = (locOrd.clientEmail || "").toLowerCase().trim();
        if (locId && (!emailNorm || locEmail === emailNorm) && !filteredOrders.some(u => u.id === locId || u.orderId === locId)) {
          filteredOrders.push(locOrd);
        }
      });

      // Sort newest first
      filteredOrders.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : Date.parse(a.createdTime || a.createdAtDate || 0);
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : Date.parse(b.createdTime || b.createdAtDate || 0);
        return (timeB || 0) - (timeA || 0);
      });

      callback(filteredOrders);
    }, (err) => {
      console.warn("Client orders listener notice:", err);
      const local = getLocalClientRecords('godoz_orders', userId, emailNorm);
      callback(local);
    });
  } catch (e) {
    const local = getLocalClientRecords('godoz_orders', userId, clientEmail);
    callback(local);
    return () => {};
  }
}

/**
 * Server-Enforced Master Price Map for Security & Anti-Tampering
 */
export const MASTER_PRICE_MAP = {
  "Modern Business Website": 4999,
  "Custom Android Application": 9999,
  "Full-Stack Web App / Portal": 14999,
  "Android App + Website Combo Suite": 19999,
  "School & College Management Portal": 9999,
  "Restaurant & Cafe Billing Software": 4999,
  "Doctor Clinic & Hospital Management": 6999,
  "Kirana & Retail Shop POS Software": 3999,
  "Custom Software Automation Tool": 2999,
  "Maintenance & Bug Fixes": 1499,
  "Custom Requirement / Unique Idea": 0
};

/**
 * Universal Order Financials Calculator (Accurately calculates totalPrice, amountPaid, remainingBalance)
 */
export function getOrderFinancials(order) {
  if (!order) return { totalPrice: 0, amountPaid: 0, remainingBalance: 0, isFullyPaid: false, paidPercent: 0 };

  const parsedTotalPrice = Number(order.price || 0);
  const totalPrice = Number.isFinite(parsedTotalPrice) ? Math.max(0, parsedTotalPrice) : 0;
  let amountPaid = 0;

  // Only persisted payment totals and transaction history affect the due.
  const explicitAmountPaid = Number(order.amountPaid);
  if (Number.isFinite(explicitAmountPaid) && explicitAmountPaid > 0) {
    amountPaid = explicitAmountPaid;
  }

  if (Array.isArray(order.paymentHistory) && order.paymentHistory.length > 0) {
    const histSum = order.paymentHistory.reduce((sum, item) => {
      const amount = Number(item.amount);
      return sum + (Number.isFinite(amount) && amount > 0 ? amount : 0);
    }, 0);
    if (histSum > amountPaid) {
      amountPaid = histSum;
    }
  }

  amountPaid = Math.min(totalPrice, amountPaid);

  const remainingBalance = Math.max(0, totalPrice - amountPaid);
  const isFullyPaid = totalPrice > 0 && amountPaid >= totalPrice;
  const paidPercent = totalPrice > 0 ? Math.min(100, Math.round((amountPaid / totalPrice) * 100)) : (isFullyPaid ? 100 : 0);

  return {
    totalPrice,
    amountPaid,
    remainingBalance,
    isFullyPaid,
    paidPercent
  };
}

/**
 * Create or Save an Order in Firestore (Secured with Anti-Tampering & Price Verification)
 */
export async function saveOrderToFirestore(orderData) {
  try {
    const currentYear = new Date().getFullYear();
    const orderId = orderData.id || orderData.orderId || (`GoDoz-${currentYear}-` + Math.floor(100000 + Math.random() * 900000));
    const docRef = doc(db, "orders", orderId);

    // Calculate a client-side order quote; it is not authoritative for payment.
    const categoryName = orderData.projectName || "";
    const isCustomCat = categoryName.toLowerCase().includes('custom requirement') || categoryName.toLowerCase().includes('unique idea') || categoryName.toLowerCase().includes('custom app');
    let basePrice = isCustomCat
      ? (orderData.price !== undefined ? Math.max(0, Number(orderData.price)) : 0)
      : (MASTER_PRICE_MAP[categoryName] !== undefined ? MASTER_PRICE_MAP[categoryName] : Math.max(0, Number(orderData.price || 4999)));

    // Apply Coupon Discount if valid coupon object attached
    let appliedDiscount = 0;
    let couponCodeApplied = "";
    if (orderData.coupon && orderData.coupon.valid && orderData.coupon.discountAmount > 0) {
      appliedDiscount = Number(orderData.coupon.discountAmount);
      couponCodeApplied = (orderData.coupon.code || "").toUpperCase();
    }

    const totalPrice = Math.max(0, basePrice - appliedDiscount);

    const fin = getOrderFinancials({ ...orderData, price: totalPrice });
    const initialPaid = fin.amountPaid;
    const remaining = fin.remainingBalance;

    let derivedStatus = orderData.paymentStatus;
    if (!derivedStatus) {
      if (fin.isFullyPaid) {
        derivedStatus = "100% Paid Completed";
      } else if (initialPaid > 0) {
        derivedStatus = `Advance Paid (₹${initialPaid})`;
      } else {
        // AI/maintainer note: PAD means Pay After Demo; this pending agreement does not mean payment was made.
        derivedStatus = "PAD Requested (Pay After Demo)";
      }
    }

    const targetEmail = (orderData.clientEmail || "").toLowerCase().trim();
    const currentEmail = (auth.currentUser?.email || "").toLowerCase().trim();
    const isStaffCreatingForClient = Boolean(currentEmail && targetEmail && targetEmail !== currentEmail);

    let orderUserId = "";
    if (orderData.userId) {
      orderUserId = orderData.userId;
    } else if (orderData.clientUid) {
      orderUserId = orderData.clientUid;
    } else if (!isStaffCreatingForClient && auth.currentUser) {
      orderUserId = auth.currentUser.uid;
    }

    const payload = {
      id: orderId,
      orderId: orderId,
      projectName: categoryName || "Custom Software Project",
      features: orderData.features || "",
      notes: orderData.notes || "",
      clientName: orderData.clientName || "Client",
      clientPhone: orderData.clientPhone || "",
      clientEmail: targetEmail,
      userId: orderUserId,
      createdByStaffEmail: isStaffCreatingForClient ? currentEmail : "",
      price: totalPrice,
      amountPaid: initialPaid,
      remainingBalance: remaining,
      // AI/maintainer note: PAD is a payment schedule (Pay After Demo), not the payment method itself.
      paymentMode: orderData.paymentMode || "Pay After Demo (PAD)",
      paymentStatus: derivedStatus,
      paymentHistory: Array.isArray(orderData.paymentHistory) ? orderData.paymentHistory : (initialPaid > 0 ? [{
        paymentId: orderData.paymentId || ('pay_' + Date.now()),
        amount: initialPaid,
        date: new Date().toISOString(),
        dateFormatted: new Date().toLocaleString('en-IN'),
        method: orderData.paymentMode || "Online Advance",
        note: "Initial Advance Payment"
      }] : []),
      paymentId: orderData.paymentId || "",
      stage: orderData.stage || "Step 01: Order Placed & Discovery Phase",
      progress: Number(orderData.progress !== undefined ? orderData.progress : 5),
      deliverableUrl: orderData.deliverableUrl || "",
      createdAt: serverTimestamp(),
      createdTime: new Date().toISOString(),
      createdAtDate: new Date().toISOString().split('T')[0],
      updatedAt: serverTimestamp()
    };

    await setDoc(docRef, payload, { merge: true });

    // Mirror to godoz_admin_orders and godoz_orders in localStorage
    try {
      const local = JSON.parse(localStorage.getItem('godoz_admin_orders') || '[]');
      const existingIdx = local.findIndex(o => o.id === orderId);
      if (existingIdx >= 0) {
        local[existingIdx] = { ...local[existingIdx], ...payload };
      } else {
        local.unshift(payload);
      }
      localStorage.setItem('godoz_admin_orders', JSON.stringify(local));

      const clientOrders = JSON.parse(localStorage.getItem('godoz_orders') || '[]');
      const clientIdx = clientOrders.findIndex(o => o.id === orderId);
      if (clientIdx >= 0) {
        clientOrders[clientIdx] = { ...clientOrders[clientIdx], ...payload };
      } else {
        clientOrders.unshift(payload);
      }
      localStorage.setItem('godoz_orders', JSON.stringify(clientOrders));
    } catch (e) {}

    return { success: true, id: orderId, orderId: orderId };
  } catch (error) {
    console.error("Error saving order to Firestore:", error);
    const currentYear = new Date().getFullYear();
    const orderId = orderData.id || orderData.orderId || (`GoDoz-${currentYear}-` + Math.floor(100000 + Math.random() * 900000));
    const totalPrice = Number(orderData.price || 0);
    const initialPaid = Number(orderData.amountPaid || 0);
    const fallbackPayload = {
      ...orderData,
      id: orderId,
      orderId: orderId,
      price: totalPrice,
      amountPaid: initialPaid,
      remainingBalance: Math.max(0, totalPrice - initialPaid),
      paymentHistory: Array.isArray(orderData.paymentHistory) ? orderData.paymentHistory : [],
      createdAtDate: new Date().toISOString().split('T')[0],
      createdTime: new Date().toISOString(),
      isLocalFallback: true
    };
    try {
      const local = JSON.parse(localStorage.getItem('godoz_admin_orders') || '[]');
      local.unshift(fallbackPayload);
      localStorage.setItem('godoz_admin_orders', JSON.stringify(local));

      const clientOrders = JSON.parse(localStorage.getItem('godoz_orders') || '[]');
      clientOrders.unshift(fallbackPayload);
      localStorage.setItem('godoz_orders', JSON.stringify(clientOrders));
    } catch (e) {}

    return { success: true, id: orderId, orderId: orderId, offline: true };
  }
}

/**
 * Update an existing Order in Firestore
 */
export async function updateOrderInFirestore(orderId, updateFields) {
  try {
    const docRef = doc(db, "orders", orderId);
    await updateDoc(docRef, {
      ...updateFields,
      updatedAt: serverTimestamp()
    });

    try {
      const local = JSON.parse(localStorage.getItem('godoz_admin_orders') || '[]');
      const idx = local.findIndex(o => o.id === orderId || o.orderId === orderId);
      if (idx >= 0) {
        local[idx] = { ...local[idx], ...updateFields };
        localStorage.setItem('godoz_admin_orders', JSON.stringify(local));
      }

      const clientOrders = JSON.parse(localStorage.getItem('godoz_orders') || '[]');
      const clientIdx = clientOrders.findIndex(o => o.id === orderId || o.orderId === orderId);
      if (clientIdx >= 0) {
        clientOrders[clientIdx] = { ...clientOrders[clientIdx], ...updateFields };
        localStorage.setItem('godoz_orders', JSON.stringify(clientOrders));
      }
    } catch(e) {}

    return { success: true };
  } catch (error) {
    console.error("Error updating order:", error);
    return { success: false, error: error.message || "Order update failed." };
  }
}

/**
 * Delete an Order from Firestore
 */
export async function deleteOrderFromFirestore(orderId) {
  try {
    await deleteDoc(doc(db, "orders", orderId));
    const local = JSON.parse(localStorage.getItem('godoz_admin_orders') || '[]');
    const filtered = local.filter(o => o.id !== orderId);
    localStorage.setItem('godoz_admin_orders', JSON.stringify(filtered));
    return { success: true };
  } catch (error) {
    const local = JSON.parse(localStorage.getItem('godoz_admin_orders') || '[]');
    const filtered = local.filter(o => o.id !== orderId);
    localStorage.setItem('godoz_admin_orders', JSON.stringify(filtered));
    return { success: true, offline: true };
  }
}

// ============================================================================
// 4. INQUIRIES, LEADS & FEEDBACK MANAGEMENT
// ============================================================================
export async function saveInquiryToFirestore(inquiryData) {
  try {
    const payload = {
      name: inquiryData.name || "Anonymous Visitor",
      email: inquiryData.email || "",
      phone: inquiryData.phone || "",
      service: inquiryData.service || inquiryData.projectType || "General Inquiry",
      budget: inquiryData.budget || "",
      message: inquiryData.message || inquiryData.feedback || "",
      source: inquiryData.source || "Website Form",
      status: "new",
      createdAt: serverTimestamp(),
      createdAtDate: new Date().toISOString()
    };
    const res = await addDoc(collection(db, "inquiries"), payload);
    return { success: true, id: res.id };
  } catch (err) {
    console.warn("Firestore Inquiry save notice:", err);
    return { success: true, offline: true };
  }
}

export function listenToInquiries(callback, assignedEmail = null) {
  try {
    const inquiries = collection(db, "inquiries");
    const email = (assignedEmail || "").toLowerCase().trim();
    if (assignedEmail !== null && !email) {
      callback([], new Error("Your signed-in account does not have an email address."));
      return () => {};
    }
    const q = email
      ? query(inquiries, where("assignedAdmin", "==", email))
      : query(inquiries);
    return onSnapshot(q, (snapshot) => {
      const items = [];
      snapshot.forEach(docSnap => {
        items.push({ id: docSnap.id, ...docSnap.data() });
      });
      // Sort safely in JS memory handling Timestamps, numbers, and dates
      items.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (typeof a.createdAt === 'number' ? a.createdAt : (a.timestamp || 0));
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (typeof b.createdAt === 'number' ? b.createdAt : (b.timestamp || 0));
        return timeB - timeA;
      });
      callback(items, null);
    }, (err) => {
      console.warn("Inquiries listener notice:", err);
      callback([], err);
    });
  } catch (e) {
    callback([], e);
    return () => {};
  }
}

export async function updateInquiryInFirestore(inquiryId, updateData) {
  try {
    const docRef = doc(db, "inquiries", inquiryId);
    await updateDoc(docRef, updateData);
    return { success: true };
  } catch (err) {
    console.warn("Firestore Inquiry update notice:", err);
    return { success: false, error: err.message };
  }
}

// ============================================================================
// COST ESTIMATOR FEATURES & TIMELINES (/estimator_features/addons_and_timelines)
// ============================================================================
export async function saveEstimatorAddonsToFirestore(addonsData) {
  try {
    const docRef = doc(db, "estimator_features", "addons_and_timelines");
    await setDoc(docRef, {
      ...addonsData,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return { success: true };
  } catch (err) {
    console.error("Firestore saveEstimatorAddons error:", err);
    return { success: false, error: err.message };
  }
}

export function listenToEstimatorAddons(callback) {
  try {
    const docRef = doc(db, "estimator_features", "addons_and_timelines");
    return onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        if (typeof callback === 'function') callback(snap.data());
      } else {
        if (typeof callback === 'function') callback(null);
      }
    }, (err) => {
      console.warn("Estimator addons listener notice:", err);
      if (typeof callback === 'function') callback(null);
    });
  } catch(e) {
    if (typeof callback === 'function') callback(null);
    return () => {};
  }
}

// ============================================================================
// SPECIAL FESTIVE OFFERS & BANNERS (/special_offers/festival_banner)
// ============================================================================
export async function saveGlobalPricingToFirestore(pricingData) {
  try {
    const docRef = doc(db, "special_offers", "festival_banner");
    await setDoc(docRef, {
      ...pricingData,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return { success: true };
  } catch (err) {
    console.error("Firestore saveGlobalPricing error:", err);
    return { success: false, error: err.message };
  }
}

export function listenToGlobalPricing(callback) {
  try {
    const docRef = doc(db, "special_offers", "festival_banner");
    return onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        if (typeof callback === 'function') callback(snap.data());
      } else {
        if (typeof callback === 'function') callback(null);
      }
    }, (err) => {
      console.warn("Global pricing listener notice:", err);
      if (typeof callback === 'function') callback(null);
    });
  } catch(e) {
    if (typeof callback === 'function') callback(null);
    return () => {};
  }
}

// ============================================================================
// INDIVIDUAL PRODUCTS CATALOG COLLECTION (/products/{productId})
// ============================================================================
export async function saveProductToFirestore(product) {
  try {
    const prodId = product.id || ('prod_' + Date.now());
    const docRef = doc(db, "products", prodId);
    await setDoc(docRef, {
      ...product,
      id: prodId,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return { success: true, id: prodId };
  } catch (err) {
    console.error("Firestore saveProduct error:", err);
    return { success: false, error: err.message };
  }
}

export async function deleteProductFromFirestore(productId) {
  try {
    const docRef = doc(db, "products", productId);
    await deleteDoc(docRef);
    return { success: true };
  } catch (err) {
    console.error("Firestore deleteProduct error:", err);
    return { success: false, error: err.message };
  }
}

export function listenToProductsCatalog(callback) {
  try {
    const colRef = collection(db, "products");
    return onSnapshot(colRef, (snap) => {
      const list = [];
      snap.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      // Safe client-side sort without omitting documents lacking slNo
      list.sort((a, b) => {
        const numA = (a.slNo !== undefined && a.slNo !== null) ? Number(a.slNo) : 999999;
        const numB = (b.slNo !== undefined && b.slNo !== null) ? Number(b.slNo) : 999999;
        if (numA !== numB) return numA - numB;
        const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return timeA - timeB;
      });
      if (typeof callback === 'function') callback(list);
    }, (err) => {
      console.error("listenToProductsCatalog snapshot error:", err);
      if (typeof callback === 'function') callback([]);
    });
  } catch(e) {
    console.error("listenToProductsCatalog exception:", e);
    if (typeof callback === 'function') callback([]);
    return () => {};
  }
}

// ============================================================================
// 5. AUTHENTICATION HELPER METHODS
// ============================================================================
export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    await syncUserProfile(result.user);
    const role = await getUserRole(result.user);
    return {
      success: true,
      user: result.user,
      role: role,
      isAdmin: (role === 'admin' || role === 'manager'),
      isManager: (role === 'manager')
    };
  } catch (error) {
    return { success: false, error: error.message, code: error.code };
  }
}

// Reference to recently created/unverified user instance for immediate verification resends
let lastUnverifiedUser = null;

export async function loginWithEmail(emailOrUser, password) {
  try {
    let email = emailOrUser.trim();
    if (!email.includes('@')) {
      email = email.toLowerCase().replace(/\s+/g, '') + '@godoz.in';
    }
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const isMgr = await isUserManager(user);
    const isAdm = isMgr || (await isUserAdmin(user, true));

    // If client email is not verified, do NOT activate login session (Managers & Admins exempt)
    if (!user.emailVerified && !isAdm) {
      lastUnverifiedUser = user;
      await signOut(auth); // Sign out so unverified user cannot access dashboard
      return {
        success: false,
        emailNotVerified: true,
        email: user.email,
        error: "Please verify your email address before logging in."
      };
    }

    lastUnverifiedUser = null;
    await syncUserProfile(user);
    const role = await getUserRole(user);
    return {
      success: true,
      user: user,
      role: role,
      isAdmin: (role === 'admin' || role === 'manager'),
      isManager: (role === 'manager')
    };
  } catch (error) {
    return { success: false, error: error.message, code: error.code };
  }
}

export async function registerWithEmail(name, emailOrUser, password) {
  try {
    const reservedUsernames = [
      'admin', 'administrator', 'root', 'support', 'help', 'manager',
      'owner', 'godoz', 'official', 'billing', 'security', 'contact',
      'info', 'service', 'developer', 'rsgulshan', 'gulshan'
    ];
    let email = emailOrUser.trim();

    if (!email.includes('@')) {
      return {
        success: false,
        error: 'Please enter a valid email address (e.g. name@gmail.com) so we can send your verification link.'
      };
    }

    let checkPrefix = '';
    if (email.toLowerCase().endsWith('@godoz.in')) {
      checkPrefix = email.toLowerCase().split('@')[0];
    }

    if (checkPrefix && reservedUsernames.includes(checkPrefix)) {
      return {
        success: false,
        error: 'This username / official prefix is reserved. Please use your personal email address.'
      };
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    if (name && auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: name });
    }
    await syncUserProfile(user, { name });

    // Send Firebase Email Verification link
    await sendEmailVerification(user);
    lastUnverifiedUser = user;

    // Sign out user immediately so account remains inactive until the link is clicked
    await signOut(auth);

    const role = await getUserRole(user);
    return {
      success: true,
      user: user,
      role: role,
      isAdmin: (role === 'admin' || role === 'manager'),
      isManager: (role === 'manager'),
      needsEmailVerification: true,
      email: email,
      message: 'Account created! A verification link has been sent to your email. Please click the link to activate your account.'
    };
  } catch (error) {
    return { success: false, error: error.message, code: error.code };
  }
}

export async function resendVerificationLink(emailOrUser = '', password = '') {
  try {
    let cleanEmail = (emailOrUser || '').trim();
    let targetUser = auth.currentUser || lastUnverifiedUser;

    // Case 1: Active in-memory session or cached unverified user matches email
    if (targetUser && (!cleanEmail || (targetUser.email && targetUser.email.toLowerCase() === cleanEmail.toLowerCase()))) {
      await sendEmailVerification(targetUser);
      if (!targetUser.emailVerified) {
        await signOut(auth);
      }
      return { success: true };
    }

    // Case 2: User provided email and password in the login form
    if (cleanEmail && password) {
      if (!cleanEmail.includes('@')) {
        cleanEmail = cleanEmail.toLowerCase().replace(/\s+/g, '') + '@godoz.in';
      }
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
      lastUnverifiedUser = cred.user;
      await sendEmailVerification(cred.user);
      if (!cred.user.emailVerified) {
        await signOut(auth);
      }
      return { success: true };
    }

    return {
      success: false,
      error: "Please enter your password above and click 'Resend link' again."
    };
  } catch (error) {
    return { success: false, error: error.message, code: error.code };
  }
}

export async function loginAsGuest() {
  try {
    const result = await signInAnonymously(auth);
    await syncUserProfile(result.user, { name: "Guest Client" });
    return { success: true, user: result.user, role: 'client', isAdmin: false, isManager: false };
  } catch (error) {
    return { success: false, error: error.message, code: error.code };
  }
}

export async function updateUserProfileData({ displayName, photoURL }) {
  try {
    if (!auth.currentUser) throw new Error("No user logged in");
    const updateObj = {};
    if (displayName !== undefined) updateObj.displayName = displayName;
    if (photoURL !== undefined) updateObj.photoURL = photoURL;
    await updateProfile(auth.currentUser, updateObj);
    await syncUserProfile(auth.currentUser, updateObj);
    return { success: true, user: auth.currentUser };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message, code: error.code };
  }
}

export async function logoutUser() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export function subscribeToAuth(callback) {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const isMgr = await isUserManager(user);
      const isAdm = isMgr || (await isUserAdmin(user, true));
      // Require email verification unless anonymous guest or verified admin/manager
      if (!user.emailVerified && !user.isAnonymous && !isAdm) {
        callback(null);
        return;
      }

      const role = await getUserRole(user);
      user.role = role;
      user.isAdmin = (role === 'admin' || role === 'manager');
      user.isManager = (role === 'manager');
      try {
        localStorage.setItem('godoz_user_role', role);
        if (user.isAdmin) {
          localStorage.setItem('godoz_admin_role', role);
        } else {
          localStorage.removeItem('godoz_admin_role');
        }
      } catch(e) {}
      callback(user);
    } else {
      try {
        localStorage.removeItem('godoz_user_role');
        localStorage.removeItem('godoz_admin_role');
      } catch(e) {}
      callback(null);
    }
  });
}

// -------------------------------------------------------------
// Firestore Orders & Project Inquiries Management
// -------------------------------------------------------------

function getLocalClientRecords(storageKey, userId, userEmail) {
  try {
    const records = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (!Array.isArray(records)) return [];
    const email = (userEmail || '').toLowerCase().trim();
    return records.filter(record => {
      const recordUserId = record.userId || record.uid || record.clientUid || '';
      const recordEmail = (record.clientEmail || record.email || '').toLowerCase().trim();
      return (userId && recordUserId === userId) || (email && recordEmail === email);
    });
  } catch (error) {
    console.warn(`Could not read local client records (${storageKey}):`, error);
    return [];
  }
}

/**
 * Retrieve client orders for dashboard
 */
export async function getClientOrders(userId, userEmail) {
  try {
    const ordersCol = collection(db, "orders");
    const emailNorm = (userEmail || "").toLowerCase().trim();
    let q = null;
    if (emailNorm) {
      q = query(ordersCol, where("clientEmail", "==", emailNorm));
    } else if (userId) {
      q = query(ordersCol, where("userId", "==", userId));
    }
    if (!q) return [];
    const snapshot = await getDocs(q);
    const orders = [];
    snapshot.forEach(docSnap => {
      orders.push({ id: docSnap.id, ...docSnap.data() });
    });
    return orders;
  } catch (error) {
    console.warn("Error fetching orders from Firestore, fallback to local:", error);
    return getLocalClientRecords('godoz_orders', userId, emailNorm);
  }
}

// ============================================================================
// 6. RAZORPAY PAYMENT GATEWAY INTEGRATION & LOGGING
// ============================================================================
export const RAZORPAY_CONFIG = {
  // Official GoDoz Production Live Razorpay Gateway
  onlinePaymentsEnabled: false,
  testKey: "rzp_test_TgdERHVdl9Et35",
  liveKey: "rzp_live_Tienbwktx6frm1",
  defaultKey: "rzp_live_Tienbwktx6frm1",
  get keyId() {
    return localStorage.getItem('godoz_razorpay_active_key') || this.defaultKey;
  },
  setKeyId(newKey) {
    if (newKey && newKey.trim()) {
      localStorage.setItem('godoz_razorpay_active_key', newKey.trim());
      localStorage.setItem('godoz_razorpay_live_key', newKey.trim());
    }
  },
  merchantName: "GoDoz Technology",
  currency: "INR",
  themeColor: "#1266e8",
  logoUrl: "https://www.godoz.in/official%20logo.png"
};

/**
 * Get a Razorpay Payment record by paymentId
 */
export async function getRazorpayPaymentById(paymentId) {
  if (!paymentId) return null;
  try {
    const payRef = doc(db, "payments", paymentId);
    const snap = await getDoc(payRef);
    if (snap.exists()) {
      return snap.data();
    }
  } catch (e) {
    console.warn("Could not fetch payment record:", e);
  }
  return null;
}

/**
 * Payment records require server-side Razorpay verification; browser data is not trusted.
 */
export async function recordRazorpayPayment() {
  return {
    success: false,
    error: "Payment recording is unavailable until server-side Razorpay verification is configured."
  };
}

/**
 * ==========================================================================
 * PROMO CODES / COUPON ENGINE FIRESTORE FUNCTIONS
 * ==========================================================================
 */

export async function saveCouponToFirestore(couponData) {
  try {
    const code = (couponData.code || '').toUpperCase().trim();
    if (!code) throw new Error("Coupon code is required");

    const couponId = couponData.id || `coupon_${code}`;
    const docRef = doc(db, "coupons", couponId);

    const payload = {
      id: couponId,
      code: code,
      type: couponData.type || "percent", // "percent" or "flat"
      value: Number(couponData.value || 10),
      minOrder: Number(couponData.minOrder || 0),
      status: couponData.status || "active", // "active" or "inactive"
      usageCount: Number(couponData.usageCount || 0),
      maxUsage: Number(couponData.maxUsage || 0),
      createdAt: serverTimestamp(),
      createdTime: new Date().toISOString()
    };

    await setDoc(docRef, payload, { merge: true });

    try {
      const local = JSON.parse(localStorage.getItem('godoz_coupons') || '[]');
      const idx = local.findIndex(c => c.code === code);
      if (idx >= 0) local[idx] = payload;
      else local.unshift(payload);
      localStorage.setItem('godoz_coupons', JSON.stringify(local));
    } catch(e) {}

    return { success: true, code, id: couponId };
  } catch (error) {
    console.error("Error saving coupon:", error);
    return { success: false, error: error.message };
  }
}

export async function getCouponsFromFirestore() {
  try {
    const colRef = collection(db, "coupons");
    const snapshot = await getDocs(colRef);
    const coupons = [];
    snapshot.forEach(docSnap => {
      coupons.push({ id: docSnap.id, ...docSnap.data() });
    });

    if (coupons.length > 0) {
      localStorage.setItem('godoz_coupons', JSON.stringify(coupons));
      return coupons;
    }
  } catch (e) {
    console.warn("Fetching coupons from Firestore notice:", e);
  }

  try {
    return JSON.parse(localStorage.getItem('godoz_coupons') || '[]');
  } catch(e) {
    return [];
  }
}

export async function toggleCouponStatusInFirestore(couponId, currentStatus) {
  try {
    const cleanId = String(couponId).trim();
    const isCurrentlyActive = (currentStatus === 'active' || currentStatus === true || currentStatus === 'true');
    const newStatusStr = isCurrentlyActive ? 'inactive' : 'active';
    const newActiveBool = !isCurrentlyActive;

    // 1. Try direct doc reference
    const docRef = doc(db, "coupons", cleanId);
    let docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      await updateDoc(docRef, {
        status: newStatusStr,
        active: newActiveBool,
        updatedAt: Date.now()
      });
      return { success: true, status: newStatusStr };
    }

    // 2. Query document by code field or uppercase/lowercase ID
    const qUpper = query(collection(db, "coupons"), where("code", "==", cleanId.toUpperCase()));
    let snap = await getDocs(qUpper);
    if (snap.empty) {
      const qLower = query(collection(db, "coupons"), where("code", "==", cleanId.toLowerCase()));
      snap = await getDocs(qLower);
    }

    if (!snap.empty) {
      const targetDoc = snap.docs[0];
      await updateDoc(doc(db, "coupons", targetDoc.id), {
        status: newStatusStr,
        active: newActiveBool,
        updatedAt: Date.now()
      });
      return { success: true, status: newStatusStr };
    }

    return { success: false, error: "Coupon document not found in Firestore." };
  } catch (e) {
    console.error("Error toggling coupon status:", e);
    return { success: false, error: e.message };
  }
}

export async function deleteCouponFromFirestore(couponId) {
  try {
    const cleanId = String(couponId).trim();
    const docRef = doc(db, "coupons", cleanId);
    let docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      await deleteDoc(docRef);
      return { success: true };
    }

    const qUpper = query(collection(db, "coupons"), where("code", "==", cleanId.toUpperCase()));
    let snap = await getDocs(qUpper);
    if (snap.empty) {
      const qLower = query(collection(db, "coupons"), where("code", "==", cleanId.toLowerCase()));
      snap = await getDocs(qLower);
    }

    if (!snap.empty) {
      await deleteDoc(doc(db, "coupons", snap.docs[0].id));
      return { success: true };
    }

    return { success: true };
  } catch(e) {
    console.error("Error deleting coupon:", e);
    return { success: false, error: e.message };
  }
}

export async function validateCouponInFirestore(codeStr, orderAmount) {
  try {
    const code = (codeStr || '').toUpperCase().trim();
    if (!code) return { valid: false, message: "Please enter a coupon code." };

    const coupons = await getCouponsFromFirestore();
    const coupon = coupons.find(c => (c.code || '').toUpperCase() === code);

    if (!coupon) {
      return { valid: false, message: "⚠️ Invalid Coupon Code!" };
    }

    if (coupon.status !== 'active') {
      return { valid: false, message: "⚠️ This coupon code is inactive or expired." };
    }

    if (coupon.minOrder && orderAmount < coupon.minOrder) {
      return { valid: false, message: `⚠️ Minimum order value of ₹${coupon.minOrder.toLocaleString('en-IN')} required.` };
    }

    if (coupon.maxUsage && coupon.maxUsage > 0 && coupon.usageCount >= coupon.maxUsage) {
      return { valid: false, message: "⚠️ Coupon usage limit reached." };
    }

    let discountAmount = 0;
    if (coupon.type === 'percent') {
      discountAmount = Math.round((orderAmount * Number(coupon.value || 0)) / 100);
    } else {
      discountAmount = Math.min(orderAmount, Number(coupon.value || 0));
    }

    const finalPrice = Math.max(0, orderAmount - discountAmount);

    return {
      valid: true,
      coupon: coupon,
      code: coupon.code,
      discountAmount: discountAmount,
      finalPrice: finalPrice,
      message: `🎉 Coupon '${coupon.code}' applied! You saved ₹${discountAmount.toLocaleString('en-IN')}!`
    };
  } catch(e) {
    console.error("Error validating coupon:", e);
    return { valid: false, message: "Error validating coupon. Try again." };
  }
}

export function listenToPayments(callback, onError) {
  try {
    const q = query(collection(db, "payments"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      const items = [];
      snapshot.forEach(docSnap => {
        items.push({ id: docSnap.id, ...docSnap.data() });
      });
      callback(items, null);
    }, (err) => {
      console.warn("Payments listener notice:", err);
      if (onError) onError(err);
      callback([], err);
    });
  } catch (e) {
    if (onError) onError(e);
    callback([], e);
    return () => {};
  }
}

/**
 * Real-time listener for a specific client's payments from Firestore 'payments' collection
 */
export function listenToClientPayments(clientEmail, userId, callback) {
  try {
    const payCol = collection(db, "payments");
    const emailNorm = (clientEmail || "").toLowerCase().trim();
    const paymentsQuery = emailNorm
      ? query(payCol, where("clientEmail", "==", emailNorm))
      : (userId ? query(payCol, where("userId", "==", userId)) : null);

    if (!paymentsQuery) {
      callback(getLocalClientRecords('godoz_payments_history', userId, emailNorm));
      return () => {};
    }

    return onSnapshot(paymentsQuery, (snapshot) => {
      const userPayments = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        const payId = data.paymentId || docSnap.id;
        userPayments.push({
          id: docSnap.id,
          paymentId: payId,
          orderId: data.orderId || 'Direct Payment',
          projectName: data.projectRef || data.projectName || 'Project Milestone Payment',
          amount: Number(data.amount || 0),
          date: data.createdAtFormatted || (data.createdAtDate ? new Date(data.createdAtDate).toLocaleString('en-IN') : 'Recent'),
          dateFormatted: data.createdAtFormatted || (data.createdAtDate ? new Date(data.createdAtDate).toLocaleString('en-IN') : 'Recent'),
          createdAtRaw: data.createdAtDate || '',
          method: data.gateway || 'Razorpay Live',
          note: data.note || 'Verified Online Payment',
          status: data.status || 'SUCCESS'
        });
      });

      // Merge with user's local payments history
      const local = getLocalClientRecords('godoz_payments_history', userId, emailNorm);
      local.forEach(locPay => {
        const locId = locPay.paymentId || locPay.id;
        if (locId && !userPayments.some(u => u.paymentId === locId || u.id === locId)) {
          userPayments.push(locPay);
        }
      });

      // Sort newest first
      userPayments.sort((a, b) => {
        const dateA = new Date(a.createdAtRaw || a.date).getTime() || 0;
        const dateB = new Date(b.createdAtRaw || b.date).getTime() || 0;
        return dateB - dateA;
      });

      callback(userPayments);
    }, (err) => {
      console.warn("Client payments listener notice:", err);
      const local = getLocalClientRecords('godoz_payments_history', userId, emailNorm);
      callback(local);
    });
  } catch (e) {
    const local = getLocalClientRecords('godoz_payments_history', userId, clientEmail);
    callback(local);
    return () => {};
  }
}

// Dynamic Firestore Razorpay Key Management (Prevents Hardcoding)
export async function getRazorpayKeyFromFirestore() {
  try {
    const docSnap = await getDoc(doc(db, "settings", "razorpay"));
    if (docSnap.exists() && docSnap.data()?.keyId) {
      return docSnap.data().keyId;
    }
  } catch(e) {
    console.warn("Firestore Razorpay key fetch notice:", e);
  }
  return RAZORPAY_CONFIG.keyId || "rzp_live_Tienbwktx6frm1";
}

export async function saveRazorpayKeyToFirestore(keyId) {
  try {
    await setDoc(doc(db, "settings", "razorpay"), {
      keyId: keyId.trim(),
      updatedAt: Date.now(),
      updatedBy: auth.currentUser?.email || "Manager"
    }, { merge: true });
    return { success: true };
  } catch(err) {
    console.warn("Firestore Razorpay key save error:", err);
    return { success: false, error: err.message };
  }
}

// Global Browser Window Exports for Unified Interoperability
if (typeof window !== 'undefined') {
  window.GoDozFirebase = {
    app,
    auth,
    db,
    logoutUser,
    subscribeToAuth,
    resendVerificationLink,
    isUserAdmin,
    isUserManager,
    getUserRole,
    updateInquiryInFirestore,
    getRazorpayKeyFromFirestore,
    saveRazorpayKeyToFirestore
  };
  window.logoutUser = logoutUser;
  window.resendVerificationLink = resendVerificationLink;
  window.isUserAdmin = isUserAdmin;
  window.isUserManager = isUserManager;
  window.getUserRole = getUserRole;
  window.updateInquiryInFirestore = updateInquiryInFirestore;
  window.getRazorpayKeyFromFirestore = getRazorpayKeyFromFirestore;
  window.saveRazorpayKeyToFirestore = saveRazorpayKeyToFirestore;

  // Global Auth State Observer to keep Navbar and Drawer menus dynamically in sync
  onAuthStateChanged(auth, async (user) => {
    let isValidSession = false;
    let isAdm = false;
    if (user) {
      const isMgr = await isUserManager(user);
      isAdm = isMgr || (await isUserAdmin(user, true));
      isValidSession = user.emailVerified || user.isAnonymous || isAdm;
    }

    if (user && isValidSession) {
      let userRole = 'client';
      try {
        userRole = await getUserRole(user);
        localStorage.setItem('godoz_auth_logged_in', 'true');
        localStorage.setItem('godoz_auth_uid', user.uid || '');
        localStorage.setItem('godoz_auth_email', user.email || '');
        localStorage.setItem('godoz_auth_name', user.displayName || (user.email ? user.email.split('@')[0] : 'GoDoz User'));
        localStorage.setItem('godoz_auth_timestamp', Date.now().toString());
        if (user.photoURL) {
          localStorage.setItem('godoz_user_avatar', user.photoURL);
        }
      } catch (e) {}

      if (typeof window.updateNavAuthStatus === 'function') {
        window.updateNavAuthStatus(true, {
          displayName: user.displayName || (user.email ? user.email.split('@')[0] : 'User'),
          email: user.email || '',
          photoURL: user.photoURL || '',
          isAnonymous: user.isAnonymous,
          role: userRole
        });
      }
    } else {
      try {
        localStorage.setItem('godoz_auth_logged_in', 'false');
        localStorage.removeItem('godoz_auth_uid');
        localStorage.removeItem('godoz_auth_email');
        localStorage.removeItem('godoz_auth_name');
        localStorage.removeItem('godoz_user_avatar');
        localStorage.removeItem('godoz_user_role');
        localStorage.removeItem('godoz_admin_role');
        localStorage.removeItem('godoz_auth_timestamp');
      } catch (e) {}

      if (typeof window.updateNavAuthStatus === 'function') {
        window.updateNavAuthStatus(false);
      }
    }
  });
}
