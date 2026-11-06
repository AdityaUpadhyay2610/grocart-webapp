import { CreditCard, Banknote, Smartphone, Landmark, Wallet } from "lucide-react";

export const PAYMENT_METHODS = [
  {
    id: "COD",
    name: "Cash on Delivery (COD)",
    description: "Pay with cash or UPI directly to delivery partner at doorstep",
    icon: Banknote,
    badge: "Most Popular",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10"
  },
  {
    id: "UPI",
    name: "UPI",
    description: "Instant payment via PhonePe, Paytm, Google Pay, CRED or UPI ID",
    icon: Smartphone,
    badge: "Fastest",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10"
  },
  {
    id: "CARD",
    name: "Credit or Debit Card",
    description: "Visa, Mastercard, RuPay & Maestro accepted via Razorpay",
    icon: CreditCard,
    badge: "Instant 5% Off",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10"
  },
  {
    id: "NETBANKING",
    name: "Net Banking",
    description: "Direct bank transfer from SBI, HDFC, ICICI, Axis and 50+ banks",
    icon: Landmark,
    badge: "Direct Bank Transfer",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10"
  },
  {
    id: "WALLET",
    name: "Wallets & Postpaid",
    description: "Paytm Wallet, PhonePe Wallet, Mobikwik, Amazon Pay",
    icon: Wallet,
    badge: "Instant Refund",
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10"
  }
];

export const UPI_APPS = [
  { id: "phonepe", name: "PhonePe", icon: "🟣" },
  { id: "gpay", name: "Google Pay", icon: "🔵" },
  { id: "paytm", name: "Paytm UPI", icon: "🔷" },
  { id: "cred", name: "CRED UPI", icon: "⚫" },
  { id: "other", name: "Other UPI ID", icon: "⚡" }
];

export const POPULAR_BANKS = [
  { code: "HDFC", name: "HDFC Bank", short: "HDFC" },
  { code: "SBIN", name: "State Bank of India", short: "SBI" },
  { code: "ICIC", name: "ICICI Bank", short: "ICICI" },
  { code: "UTIB", name: "Axis Bank", short: "Axis" }
];

export const OTHER_BANKS = [
  { code: "KKBK", name: "Kotak Mahindra Bank" },
  { code: "PUNB_R", name: "Punjab National Bank" },
  { code: "BARB_R", name: "Bank of Baroda" },
  { code: "CNRB", name: "Canara Bank" },
  { code: "UBIN", name: "Union Bank of India" },
  { code: "IDFB", name: "IDFC FIRST Bank" },
  { code: "YESB", name: "Yes Bank" },
  { code: "INDB", name: "IndusInd Bank" },
  { code: "FDRL", name: "Federal Bank" },
  { code: "IOBA", name: "Indian Overseas Bank" }
];

