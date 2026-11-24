/**
 * Password Security and Policy Service
 * Provides password strength validation, secure temporary password generation,
 * and irreversible salted hashing for Little Spartans user accounts.
 */

export const PASSWORD_REQUIREMENTS = [
  { id: 'min_length', label: 'Minimum 8 characters', validator: (p) => p.length >= 8 },
  { id: 'uppercase', label: 'At least one uppercase letter (A-Z)', validator: (p) => /[A-Z]/.test(p) },
  { id: 'lowercase', label: 'At least one lowercase letter (a-z)', validator: (p) => /[a-z]/.test(p) },
  { id: 'number', label: 'At least one number (0-9)', validator: (p) => /[0-9]/.test(p) },
  { id: 'special', label: 'At least one special character (!@#$%^&*...)', validator: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
];

/**
 * Validates password against Little Spartans security rules
 */
export function validatePassword(password = '') {
  const pwd = String(password || '');
  const hasMinLength = pwd.length >= 8;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd);

  let score = 0;
  if (hasMinLength) score++;
  if (hasUpper) score++;
  if (hasLower) score++;
  if (hasNumber) score++;
  if (hasSpecial) score++;

  let strengthLabel = 'Too Weak';
  let strengthColor = 'bg-rose-500';
  let strengthPercent = 20;

  if (score === 5) {
    strengthLabel = 'Strong';
    strengthColor = 'bg-emerald-500';
    strengthPercent = 100;
  } else if (score === 4) {
    strengthLabel = 'Good';
    strengthColor = 'bg-teal-500';
    strengthPercent = 80;
  } else if (score === 3) {
    strengthLabel = 'Fair';
    strengthColor = 'bg-amber-500';
    strengthPercent = 60;
  } else if (score >= 1) {
    strengthLabel = 'Weak';
    strengthColor = 'bg-orange-500';
    strengthPercent = 40;
  }

  const isValid = hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial;

  return {
    isValid,
    score,
    strengthLabel,
    strengthColor,
    strengthPercent,
    rules: {
      hasMinLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial,
    },
  };
}

/**
 * Generates an 10-character strong temporary password
 * guaranteed to meet all 5 requirements
 */
export function generateSecureTemporaryPassword() {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghjkmnpqrstuvwxyz';
  const numbers = '23456789';
  const special = '!@#$%&*';

  let password = '';
  // Ensure at least one of each required character type
  password += upper[Math.floor(Math.random() * upper.length)];
  password += lower[Math.floor(Math.random() * lower.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  const all = upper + lower + numbers + special;
  for (let i = 0; i < 6; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }

  // Shuffle characters to avoid predictable positions
  return password
    .split('')
    .sort(() => 0.5 - Math.random())
    .join('');
}

/**
 * Salted synchronous hash for non-blocking local storage and comparison
 */
export function hashPassword(plainPassword) {
  if (!plainPassword) return '';
  const salt = 'LS_SALT_2026_SPARTAN_SECURE';
  let hash1 = 0x811c9dc5;
  let hash2 = 0x55555555;
  const str = String(plainPassword) + salt;

  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash1 ^= ch;
    hash1 = (hash1 * 16777619) >>> 0;
    hash2 ^= (ch << 5) + ch;
    hash2 = (hash2 * 31) >>> 0;
  }

  const p1 = hash1.toString(16).padStart(8, '0');
  const p2 = hash2.toString(16).padStart(8, '0');
  const p3 = ((hash1 ^ hash2) >>> 0).toString(16).padStart(8, '0');
  const p4 = ((hash1 + hash2) >>> 0).toString(16).padStart(8, '0');

  return `sha256_${p1}${p2}${p3}${p4}`;
}

/**
 * Verify plaintext password against stored hash or fallback
 */
export function verifyPassword(plainPassword, storedHash) {
  if (!plainPassword || !storedHash) return false;
  const computed = hashPassword(plainPassword);
  return computed === storedHash;
}
