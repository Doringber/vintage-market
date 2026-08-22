function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function getTransferPhone(): string | null {
  const raw = process.env.BIT_PAYBOX_PHONE?.trim();
  if (!raw) {
    return null;
  }

  const digits = digitsOnly(raw);
  if (digits.length < 9 || digits.length > 12) {
    return null;
  }

  return digits;
}

export function formatTransferPhone(digits: string): string {
  if (digits.startsWith("972") && digits.length === 12) {
    return `0${digits.slice(3, 5)}-${digits.slice(5, 8)}-${digits.slice(8)}`;
  }

  if (digits.length === 10 && digits.startsWith("05")) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  return digits;
}

export function isIsraeliMobile(value: string): boolean {
  const digits = digitsOnly(value);
  if (digits.startsWith("972")) {
    return /^9725\d{8}$/.test(digits);
  }

  return /^05\d{8}$/.test(digits);
}
