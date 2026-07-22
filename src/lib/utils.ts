import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export const STATUS_META: Record<
  string,
  { label: string; dot: string; text: string; bg: string }
> = {
  DRAFT: { label: "Draft", dot: "#38368A", text: "#38368A", bg: "#ECEBFF" },
  PENDING_APPROVAL: { label: "Pending Approval", dot: "#F59E0B", text: "#92600A", bg: "#FEF3E2" },
  PENDING_CORRECTIONS: { label: "Pending Corrections", dot: "#FB6D3B", text: "#B23C12", bg: "#FEECE4" },
  APPROVED_FOR_SENDING: { label: "Approved", dot: "#4D54F5", text: "#3339C4", bg: "#ECEDFF" },
  SENT: { label: "Sent", dot: "#38BDF8", text: "#0B6E9E", bg: "#E4F5FE" },
  OPENED: { label: "Opened", dot: "#C7E402", text: "#5B6B00", bg: "#F6FBCF" },
  SIGNED: { label: "Signed", dot: "#00C853", text: "#0A7B37", bg: "#E3F9EC" },
  REJECTED: { label: "Rejected", dot: "#FF0000", text: "#B91C1C", bg: "#FEE4E4" },
  EXPIRED: { label: "Expired", dot: "#9AA4B2", text: "#5B6472", bg: "#F0F1F3" },
};
