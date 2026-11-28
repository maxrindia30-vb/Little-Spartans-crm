/**
 * Attendance Persistent Storage Service
 * Provides secure client-side storage for coach check-in / check-out verification photos
 * and Admin-authorized exception logs using IndexedDB with fallback in-memory cache.
 * Enforces role-based authorization for image inspection.
 */

const DB_NAME = 'LS_AttendanceStorageDB';
const DB_VERSION = 1;
const STORE_PHOTOS = 'attendance_photos';
const STORE_EXCEPTIONS = 'attendance_exceptions';

// In-memory cache for ultra-fast UI rendering
const memoryPhotoCache = new Map();
const memoryExceptionCache = new Map();

/**
 * Initialize IndexedDB instance
 */
function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }

    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_PHOTOS)) {
          const photoStore = db.createObjectStore(STORE_PHOTOS, { keyPath: 'photoKey' });
          photoStore.createIndex('sessionId', 'sessionId', { unique: false });
          photoStore.createIndex('coachId', 'coachId', { unique: false });
        }
        if (!db.objectStoreNames.contains(STORE_EXCEPTIONS)) {
          const excStore = db.createObjectStore(STORE_EXCEPTIONS, { keyPath: 'id' });
          excStore.createIndex('sessionId', 'sessionId', { unique: false });
          excStore.createIndex('coachId', 'coachId', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        resolve(event.target.result);
      };

      request.onerror = (event) => {
        console.warn('IndexedDB open error:', event.target.error);
        resolve(null);
      };
    } catch (e) {
      console.warn('IndexedDB initialization failed:', e);
      resolve(null);
    }
  });
}

/**
 * Save an attendance photo to persistent storage
 */
export async function saveAttendancePhoto({
  sessionId,
  type = 'checkin', // 'checkin' | 'checkout'
  coachId,
  coachName,
  location,
  photoDataUrl,
  isException = false,
  exceptionReason = null,
  exceptionApprovedBy = null,
}) {
  if (!sessionId) {
    throw new Error('Attendance session ID is required to save photo.');
  }

  const photoKey = `${sessionId}_${type}`;
  const record = {
    photoKey,
    sessionId,
    type,
    coachId,
    coachName,
    location,
    photoDataUrl,
    isException: !!isException,
    exceptionReason,
    exceptionApprovedBy,
    timestamp: new Date().toISOString(),
  };

  // 1. Save in memory cache
  memoryPhotoCache.set(photoKey, record);

  // 2. Persist to IndexedDB
  try {
    const db = await openDB();
    if (db) {
      const tx = db.transaction([STORE_PHOTOS], 'readwrite');
      const store = tx.objectStore(STORE_PHOTOS);
      await new Promise((resolve, reject) => {
        const req = store.put(record);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    }
  } catch (err) {
    console.warn('Failed to persist photo to IndexedDB:', err);
  }

  return {
    success: true,
    photoKey,
    photoUrl: photoDataUrl,
    record,
  };
}

/**
 * Authorize and retrieve an attendance photo
 * Role rules:
 * - Admin / Super Admin: Full access across all academies
 * - Super Coach: Access within assigned locations
 * - Coach: Strictly access to their own attendance records
 */
export async function getAttendancePhoto(sessionId, type = 'checkin', requestingUser = {}) {
  const photoKey = `${sessionId}_${type}`;
  let record = memoryPhotoCache.get(photoKey);

  if (!record) {
    try {
      const db = await openDB();
      if (db) {
        const tx = db.transaction([STORE_PHOTOS], 'readonly');
        const store = tx.objectStore(STORE_PHOTOS);
        record = await new Promise((resolve) => {
          const req = store.get(photoKey);
          req.onsuccess = () => resolve(req.result || null);
          req.onerror = () => resolve(null);
        });
        if (record) {
          memoryPhotoCache.set(photoKey, record);
        }
      }
    } catch (e) {
      console.warn('Error reading from IndexedDB:', e);
    }
  }

  if (!record) {
    return {
      success: false,
      error: 'Photo not found',
      photoUrl: null,
    };
  }

  // Role Authorization Check
  const role = (requestingUser?.role || 'admin').toLowerCase();
  const userId = requestingUser?.id;
  const userLocations = requestingUser?.assignedLocations || requestingUser?.locations || [requestingUser?.center];

  let isAuthorized = false;

  if (role === 'admin' || role === 'super_admin') {
    isAuthorized = true;
  } else if (role === 'super_coach') {
    // Super coach can view if location is in their assigned centers
    isAuthorized = userLocations.includes(record.location) || (userLocations.length === 0);
  } else if (role === 'coach') {
    // Coach can only view their own photos
    isAuthorized = record.coachId === userId || record.coachName === requestingUser?.name;
  }

  if (!isAuthorized) {
    return {
      success: false,
      authorized: false,
      error: 'Unauthorized: You do not have permission to view this attendance photo.',
      photoUrl: null,
    };
  }

  return {
    success: true,
    authorized: true,
    photoUrl: record.photoDataUrl,
    record,
  };
}

/**
 * Record an Admin-authorized Camera Exception
 */
export async function saveAttendanceException({
  sessionId,
  actionType = 'checkin',
  coachId,
  coachName,
  location,
  reason,
  approvedBy,
  notes = '',
}) {
  const id = `EXC-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const exceptionRecord = {
    id,
    sessionId,
    actionType,
    coachId,
    coachName,
    location,
    reason,
    approvedBy,
    notes,
    timestamp: new Date().toISOString(),
  };

  memoryExceptionCache.set(id, exceptionRecord);

  try {
    const db = await openDB();
    if (db) {
      const tx = db.transaction([STORE_EXCEPTIONS], 'readwrite');
      const store = tx.objectStore(STORE_EXCEPTIONS);
      store.put(exceptionRecord);
    }
  } catch (e) {
    console.warn('Failed to save exception to IndexedDB:', e);
  }

  return exceptionRecord;
}

/**
 * Retrieve all exceptions for a session
 */
export async function getSessionExceptions(sessionId) {
  const list = Array.from(memoryExceptionCache.values()).filter(
    (e) => e.sessionId === sessionId
  );
  return list;
}
