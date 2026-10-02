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

  try {
    // 1. Direct document lookups in 'managers'
    if (email) {
      const docByEmail = await getDoc(doc(db, "managers", email));
      if (docByEmail.exists() && docByEmail.data()?.active !== false) {
        return true;
      }
    }
    if (uid) {
      const docByUid = await getDoc(doc(db, "managers", uid));
      if (docByUid.exists() && docByUid.data()?.active !== false) {
        return true;
      }

      // Check users collection for manager / owner role
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const uRole = (userDoc.data()?.role || '').toLowerCase();
        if (uRole === 'manager' || uRole === 'owner') {
          return true;
        }
      }
    }

    // 2. Query all documents in 'managers' collection (handles custom auto-generated document IDs)
    const snap = await getDocs(collection(db, "managers"));
    for (const d of snap.docs) {
      const docId = d.id.toLowerCase().trim();
      const data = d.data() || {};
      
      // Match Doc ID
      if (email && docId === email && data.active !== false) return true;
      if (uid && docId === uid && data.active !== false) return true;
      
      // Match email fields
      const docEmail = (data.email || data.Email || data.userEmail || data.user_email || "").toLowerCase().trim();
      const docUid = data.uid || data.userId || data.user_id || "";
      
      if (email && docEmail === email && data.active !== false) return true;
      if (uid && docUid === uid && data.active !== false) return true;
      
      // Value scan in document fields
      for (const val of Object.values(data)) {
        if (typeof val === 'string' && val.toLowerCase().trim() === email && data.active !== false) {
          return true;
        }
      }
    }
  } catch (err) {
    console.warn("Firestore isUserManager check notice:", err);
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
export function listenToAdmins(callback) {
  try {
    const q = query(collection(db, "admins"));
    return onSnapshot(q, (snapshot) => {
      const admins = [];
      snapshot.forEach(docSnap => {
        admins.push({ id: docSnap.id, ...docSnap.data() });
      });
      callback(admins);
    }, (error) => {
      console.warn("Admin listener warning:", error);
      callback([]);
    });
  } catch (e) {
    callback([]);
    return () => {};
  }
}

/**
 * Real-time listener for 'managers' collection
 */
export function listenToManagers(callback) {
  try {
    const q = query(collection(db, "managers"));
    return onSnapshot(q, (snapshot) => {
      const managers = [];
      snapshot.forEach(docSnap => {
        managers.push({ id: docSnap.id, ...docSnap.data() });
      });
      callback(managers);
    }, (error) => {
      console.warn("Manager listener warning:", error);
      callback([]);
    });
  } catch (e) {
    callback([]);
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
export function listenToAllOrders(callback) {
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

      callback(orders);
    }, (err) => {
      console.warn("Orders listener notice:", err);
      const local = JSON.parse(localStorage.getItem('godoz_admin_orders') || '[]');
      callback(local);
    });
  } catch (e) {
    const local = JSON.parse(localStorage.getItem('godoz_admin_orders') || '[]');
    callback(local);
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
    const phoneNorm = (localStorage.getItem('godoz_user_phone') || "").trim();
    const storedName = (localStorage.getItem('godoz_user_name') || "").toLowerCase().trim();

    return onSnapshot(ordersCol, (snapshot) => {
      const userOrders = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        const docEmail = (data.clientEmail || data.email || data.client_email || "").toLowerCase().trim();
        const docUserId = data.userId || data.uid || "";
        const docPhone = (data.clientPhone || data.phone || data.client_phone || "").toString().trim();
        const docName = (data.clientName || data.name || data.client_name || "").toLowerCase().trim();

        const cleanDocPhone = docPhone.replace(/\D/g, '');
        const cleanUserPhone = phoneNorm.replace(/\D/g, '');
        const phoneMatch = cleanDocPhone.length >= 10 && cleanUserPhone.length >= 10 && (cleanDocPhone.slice(-10) === cleanUserPhone.slice(-10));

        // Match by Email, UID, Phone (last 10 digits), or Client Name
        const isMatch = (emailNorm && docEmail && (docEmail === emailNorm || emailNorm.includes(docEmail) || docEmail.includes(emailNorm))) ||
                        (userId && docUserId === userId) ||
                        phoneMatch ||
                        (storedName && docName && (docName === storedName || docName.includes(storedName) || storedName.includes(docName))) ||
                        (!emailNorm && !userId); // If guest without email/uid, show all guest/active orders

        if (isMatch) {
          const ordId = data.id || data.orderId || docSnap.id;
          userOrders.push({ docId: docSnap.id, id: ordId, orderId: ordId, ...data });
        }
      });

      // Merge with user's local orders from localStorage
      try {
        const local = JSON.parse(localStorage.getItem('godoz_orders') || '[]');
        if (Array.isArray(local)) {
          local.forEach(locOrd => {
            const locId = locOrd.id || locOrd.orderId;
            if (locId && !userOrders.some(u => u.id === locId || u.orderId === locId)) {
              userOrders.push(locOrd);
            }
          });
        }
      } catch (e) {}

      // Sort newest first
      userOrders.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : Date.parse(a.createdTime || a.createdAtDate || 0);
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : Date.parse(b.createdTime || b.createdAtDate || 0);
        return (timeB || 0) - (timeA || 0);
      });

      callback(userOrders);
    }, (err) => {
      console.warn("Client orders listener notice:", err);
      const local = JSON.parse(localStorage.getItem('godoz_orders') || '[]');
      callback(local);
    });
  } catch (e) {
    const local = JSON.parse(localStorage.getItem('godoz_orders') || '[]');
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

  const totalPrice = Number(order.price || 0);
  let amountPaid = 0;

  // 1. Check explicit valid amountPaid
  if (typeof order.amountPaid === 'number' && !isNaN(order.amountPaid) && order.amountPaid > 0) {
    amountPaid = order.amountPaid;
  } else if (order.amountPaid && !isNaN(Number(order.amountPaid)) && Number(order.amountPaid) > 0) {
    amountPaid = Number(order.amountPaid);
  }

  // 2. Check paymentHistory array
  if (Array.isArray(order.paymentHistory) && order.paymentHistory.length > 0) {
    const histSum = order.paymentHistory.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    if (histSum > amountPaid) {
      amountPaid = histSum;
    }
  }

  // 3. Check local storage last payment link if matched
  if (amountPaid === 0 && order) {
    try {
      const lastOrdId = localStorage.getItem('godoz_last_order_id');
      const lastPayAmt = Number(localStorage.getItem('godoz_last_pay_amount') || 0);
      const ordId = order.id || order.orderId;
      if (lastOrdId && ordId && lastPayAmt > 0 && (lastOrdId === ordId || ordId.includes(lastOrdId) || lastOrdId.includes(ordId))) {
        amountPaid = lastPayAmt;
      }
    } catch(e) {}
  }

  // 3. Parse amount from paymentStatus string e.g. "10% Advance Paid (₹1 via Razorpay Live - Ref: ...)"
  if (amountPaid === 0 && order.paymentStatus) {
    const statusLower = order.paymentStatus.toLowerCase();
    if (statusLower.includes('100% paid') || statusLower.includes('full paid') || statusLower.includes('paid completed')) {
      amountPaid = totalPrice;
    } else {
      const match = order.paymentStatus.match(/(?:₹|rs\.?|inr\s*)\s*(\d+(?:,\d+)*(?:\.\d+)?)/i);
      if (match && match[1]) {
        amountPaid = Number(match[1].replace(/,/g, ''));
      }
    }
  }

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

    // Server-enforced price & coupon validation (Prevents client-side price tampering via DevTools)
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
        derivedStatus = "COD Requested (Pending Verification)";
      }
    }
    
    const payload = {
      id: orderId,
      orderId: orderId,
      projectName: categoryName || "Custom Software Project",
      features: orderData.features || "",
      notes: orderData.notes || "",
      clientName: orderData.clientName || "Client",
      clientPhone: orderData.clientPhone || "",
      clientEmail: (orderData.clientEmail || "").toLowerCase().trim(),
      userId: orderData.userId || (auth.currentUser ? auth.currentUser.uid : ""),
      price: totalPrice,
      amountPaid: initialPaid,
      remainingBalance: remaining,
      paymentMode: orderData.paymentMode || "Cash on Delivery (COD Milestone)",
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
    return { success: true, offline: true };
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

export function listenToInquiries(callback) {
  try {
    const q = query(collection(db, "inquiries"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      const items = [];
      snapshot.forEach(docSnap => {
        items.push({ id: docSnap.id, ...docSnap.data() });
      });
      callback(items);
    }, (err) => {
      console.warn("Inquiries listener notice:", err);
      callback([]);
    });
  } catch (e) {
    callback([]);
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

export async function loginWithEmail(emailOrUser, password) {
  try {
    let email = emailOrUser.trim();
    if (!email.includes('@')) {
      email = email.toLowerCase().replace(/\s+/g, '') + '@godoz.in';
    }
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    await syncUserProfile(userCredential.user);
    const role = await getUserRole(userCredential.user);
    return { 
      success: true, 
      user: userCredential.user, 
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
    let checkPrefix = '';
    
    if (!email.includes('@')) {
      checkPrefix = email.toLowerCase().replace(/\s+/g, '');
      email = checkPrefix + '@godoz.in';
    } else if (email.toLowerCase().endsWith('@godoz.in')) {
      checkPrefix = email.toLowerCase().split('@')[0];
    }
    
    if (checkPrefix && reservedUsernames.includes(checkPrefix)) {
      return { 
        success: false, 
        error: 'This username / official prefix is reserved. Please use your personal email address or select another username.' 
      };
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (name && auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: name });
    }
    await syncUserProfile(userCredential.user, { name });
    const role = await getUserRole(userCredential.user);
    return { 
      success: true, 
      user: userCredential.user, 
      role: role, 
      isAdmin: (role === 'admin' || role === 'manager'), 
      isManager: (role === 'manager') 
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
    } else {
      try {
        localStorage.removeItem('godoz_user_role');
        localStorage.removeItem('godoz_admin_role');
      } catch(e) {}
    }
    callback(user);
  });
}

// -------------------------------------------------------------
// Firestore Orders & Project Inquiries Management
// -------------------------------------------------------------

/**
 * Retrieve client orders for dashboard
 */
export async function getClientOrders(userId, userEmail) {
  try {
    const ordersCol = collection(db, "orders");
    let q;
    if (userId) {
      q = query(ordersCol, where("userId", "==", userId));
    } else if (userEmail) {
      q = query(ordersCol, where("clientEmail", "==", userEmail));
    } else {
      q = query(ordersCol, orderBy("createdAt", "desc"));
    }
    const snapshot = await getDocs(q);
    const orders = [];
    snapshot.forEach(docSnap => {
      orders.push({ id: docSnap.id, ...docSnap.data() });
    });
    return orders;
  } catch (error) {
    console.warn("Error fetching orders from Firestore, fallback to local:", error);
    try {
      return JSON.parse(localStorage.getItem('godoz_orders') || '[]');
    } catch (e) {
      return [];
    }
  }
}

// ============================================================================
// 6. RAZORPAY PAYMENT GATEWAY INTEGRATION & LOGGING
// ============================================================================
export const RAZORPAY_CONFIG = {
  // Official GoDoz Production Live Razorpay Gateway
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
 * Record a Verified Razorpay Live Payment into Firestore 'payments' & link with 'orders'
 */
export async function recordRazorpayPayment(paymentData) {
  try {
    const payAmount = Number(paymentData.amount) || 0;
    if (payAmount <= 0) {
      return { success: false, error: "Invalid payment amount. Amount must be greater than 0." };
    }
    const payId = paymentData.paymentId || ('pay_' + Date.now());
    const orderId = paymentData.orderId || null;

    const payRef = doc(db, "payments", payId);
    let existingData = null;
    try {
      const snap = await getDoc(payRef);
      if (snap.exists()) {
        existingData = snap.data();
      }
    } catch (e) {
      console.warn("Check existing payment notice:", e);
    }

    // Preserve original creation time if record already exists (prevents refresh from changing time)
    const createdAt = existingData?.createdAt || serverTimestamp();
    const createdAtDate = existingData?.createdAtDate || paymentData.createdAtDate || new Date().toISOString();
    const createdAtFormatted = existingData?.createdAtFormatted || paymentData.createdAtFormatted || new Date().toLocaleString('en-IN');

    const payload = {
      paymentId: payId,
      orderId: orderId || existingData?.orderId || null,
      amount: payAmount,
      currency: "INR",
      clientName: paymentData.clientName || existingData?.clientName || "Client",
      clientEmail: (paymentData.clientEmail || existingData?.clientEmail || "").toLowerCase().trim(),
      clientPhone: paymentData.clientPhone || existingData?.clientPhone || "",
      projectRef: paymentData.projectRef || paymentData.projectName || existingData?.projectRef || "General Service Payment",
      status: "SUCCESS",
      gateway: "Razorpay Live",
      createdAt: createdAt,
      createdAtDate: createdAtDate,
      createdAtFormatted: createdAtFormatted
    };

    await setDoc(payRef, payload, { merge: true });

    // Save/Update in persistent localStorage payment history list
    try {
      const localHistory = JSON.parse(localStorage.getItem('godoz_payments_history') || '[]');
      const newPayItem = {
        paymentId: payId,
        orderId: orderId || 'Direct Payment',
        projectName: payload.projectRef || 'Project Milestone Payment',
        amount: payAmount,
        date: createdAtFormatted,
        dateFormatted: createdAtFormatted,
        method: 'Razorpay Live Online',
        note: paymentData.note || 'Verified Online Payment',
        status: 'SUCCESS'
      };
      const existingIdx = localHistory.findIndex(p => p.paymentId === payId);
      if (existingIdx >= 0) {
        localHistory[existingIdx] = { ...localHistory[existingIdx], ...newPayItem };
      } else {
        localHistory.unshift(newPayItem);
      }
      localStorage.setItem('godoz_payments_history', JSON.stringify(localHistory));
    } catch(e) {}

    if (orderId) {
      try {
        const orderRef = doc(db, "orders", orderId);
        const orderSnap = await getDoc(orderRef);
        let curPaid = 0;
        let totalPrice = 0;
        let existingHistory = [];

        if (orderSnap.exists()) {
          const ordData = orderSnap.data();
          totalPrice = Number(ordData.price || 0);
          curPaid = Number(ordData.amountPaid || 0);
          existingHistory = Array.isArray(ordData.paymentHistory) ? ordData.paymentHistory : [];
        } else {
          // Check local orders fallback
          try {
            const localOrders = JSON.parse(localStorage.getItem('godoz_orders') || '[]');
            const found = localOrders.find(o => o.id === orderId || o.orderId === orderId);
            if (found) {
              totalPrice = Number(found.price || 0);
              curPaid = Number(found.amountPaid || 0);
              existingHistory = Array.isArray(found.paymentHistory) ? found.paymentHistory : [];
            }
          } catch (e) {}
        }

        // Prevent duplicate payment addition if this paymentId was already logged
        const isAlreadyLogged = existingHistory.some(h => h.paymentId === payId);
        if (isAlreadyLogged) {
          return { 
            success: true, 
            paymentId: payId, 
            alreadyRecorded: true,
            createdAtFormatted: createdAtFormatted,
            createdAtDate: createdAtDate
          };
        }

        const newTotalPaid = curPaid + payAmount;
        const remaining = Math.max(0, totalPrice - newTotalPaid);
        const newHistoryItem = {
          paymentId: payId,
          amount: payAmount,
          date: createdAtDate,
          dateFormatted: createdAtFormatted,
          method: "Razorpay Live Online",
          note: paymentData.note || "Project Payment / Milestone"
        };

        const updatedHistory = [...existingHistory, newHistoryItem];
        let newStatus = "";
        if (totalPrice > 0 && newTotalPaid >= totalPrice) {
          newStatus = `100% Paid Completed (₹${newTotalPaid.toLocaleString('en-IN')})`;
        } else if (newTotalPaid > 0) {
          newStatus = `Partially Paid (₹${newTotalPaid.toLocaleString('en-IN')} / ₹${totalPrice.toLocaleString('en-IN')})`;
        } else {
          newStatus = `Paid (₹${payAmount} via Razorpay Live - ID: ${payId})`;
        }

        await updateOrderInFirestore(orderId, {
          amountPaid: newTotalPaid,
          remainingBalance: remaining,
          paymentStatus: newStatus,
          paymentMode: "Razorpay Live Online",
          lastPaymentId: payId,
          lastPaymentAmount: payAmount,
          lastPaymentDate: createdAtDate,
          paymentHistory: updatedHistory
        });
      } catch (err) {
        console.warn("Error updating order payment linkage:", err);
      }
    }

    return { 
      success: true, 
      paymentId: payId, 
      docId: payId,
      createdAtFormatted: createdAtFormatted,
      createdAtDate: createdAtDate
    };
  } catch (error) {
    console.warn("Firestore record payment notice:", error);
    return { success: true, paymentId: paymentData.paymentId || ('pay_' + Date.now()), offline: true };
  }
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
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const docRef = doc(db, "coupons", couponId);
    await updateDoc(docRef, { status: newStatus, updatedAt: serverTimestamp() });

    try {
      const local = JSON.parse(localStorage.getItem('godoz_coupons') || '[]');
      const item = local.find(c => c.id === couponId || c.code === couponId);
      if (item) item.status = newStatus;
      localStorage.setItem('godoz_coupons', JSON.stringify(local));
    } catch(e) {}

    return { success: true, status: newStatus };
  } catch (e) {
    console.error("Error toggling coupon status:", e);
    return { success: false, error: e.message };
  }
}

export async function deleteCouponFromFirestore(couponId) {
  try {
    const docRef = doc(db, "coupons", couponId);
    await deleteDoc(docRef);

    try {
      let local = JSON.parse(localStorage.getItem('godoz_coupons') || '[]');
      local = local.filter(c => c.id !== couponId && c.code !== couponId);
      localStorage.setItem('godoz_coupons', JSON.stringify(local));
    } catch(e) {}

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

export function listenToPayments(callback) {
  try {
    const q = query(collection(db, "payments"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      const items = [];
      snapshot.forEach(docSnap => {
        items.push({ id: docSnap.id, ...docSnap.data() });
      });
      callback(items);
    }, (err) => {
      console.warn("Payments listener notice:", err);
      callback([]);
    });
  } catch (e) {
    callback([]);
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
    const phoneNorm = (localStorage.getItem('godoz_user_phone') || "").trim();
    const storedName = (localStorage.getItem('godoz_user_name') || "").toLowerCase().trim();

    return onSnapshot(payCol, (snapshot) => {
      const userPayments = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        const docEmail = (data.clientEmail || data.email || "").toLowerCase().trim();
        const docUserId = data.userId || data.uid || "";
        const docPhone = (data.clientPhone || data.phone || "").toString().trim();
        const docName = (data.clientName || data.name || "").toLowerCase().trim();

        const cleanDocPhone = docPhone.replace(/\D/g, '');
        const cleanUserPhone = phoneNorm.replace(/\D/g, '');
        const phoneMatch = cleanDocPhone.length >= 10 && cleanUserPhone.length >= 10 && (cleanDocPhone.slice(-10) === cleanUserPhone.slice(-10));

        const isMatch = (emailNorm && docEmail && (docEmail === emailNorm || emailNorm.includes(docEmail) || docEmail.includes(emailNorm))) ||
                        (userId && docUserId === userId) ||
                        phoneMatch ||
                        (storedName && docName && (docName === storedName || docName.includes(storedName) || storedName.includes(docName))) ||
                        (!emailNorm && !userId);

        if (isMatch) {
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
        }
      });

      // Merge with user's local payments history
      try {
        const local = JSON.parse(localStorage.getItem('godoz_payments_history') || '[]');
        if (Array.isArray(local)) {
          local.forEach(locPay => {
            const locId = locPay.paymentId || locPay.id;
            if (locId && !userPayments.some(u => u.paymentId === locId || u.id === locId)) {
              userPayments.push(locPay);
            }
          });
        }
      } catch (e) {}

      // Sort newest first
      userPayments.sort((a, b) => {
        const dateA = new Date(a.createdAtRaw || a.date).getTime() || 0;
        const dateB = new Date(b.createdAtRaw || b.date).getTime() || 0;
        return dateB - dateA;
      });

      callback(userPayments);
    }, (err) => {
      console.warn("Client payments listener notice:", err);
      const local = JSON.parse(localStorage.getItem('godoz_payments_history') || '[]');
      callback(local);
    });
  } catch (e) {
    const local = JSON.parse(localStorage.getItem('godoz_payments_history') || '[]');
    callback(local);
    return () => {};
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
    isUserAdmin,
    isUserManager,
    getUserRole
  };
  window.logoutUser = logoutUser;

  // Global Auth State Observer to keep Navbar and Drawer menus dynamically in sync
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      let userRole = 'client';
      try {
        userRole = await getUserRole(user);
        localStorage.setItem('godoz_auth_logged_in', 'true');
        localStorage.setItem('godoz_auth_uid', user.uid || '');
        localStorage.setItem('godoz_auth_email', user.email || '');
        localStorage.setItem('godoz_auth_name', user.displayName || (user.isAnonymous ? 'Guest Client' : (userRole === 'manager' ? 'RS GULSHAN PRAJAPATI' : 'GoDoz User')));
        localStorage.setItem('godoz_user_role', userRole);
        localStorage.setItem('godoz_auth_timestamp', Date.now().toString());
        if (userRole === 'manager' || userRole === 'admin') {
          localStorage.setItem('godoz_admin_role', userRole);
        } else {
          localStorage.removeItem('godoz_admin_role');
        }
        if (user.photoURL) {
          localStorage.setItem('godoz_user_avatar', user.photoURL);
        }
      } catch (e) {}

      if (typeof window.updateNavAuthStatus === 'function') {
        window.updateNavAuthStatus(true, {
          displayName: user.displayName || (user.isAnonymous ? 'Guest' : (userRole === 'manager' ? 'RS GULSHAN PRAJAPATI' : '')),
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


