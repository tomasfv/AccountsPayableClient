export interface User {
  id: string
  email: string
  fullName: string
  role: 'Admin' | 'Approver' | 'Submitter'
  createdAt: string
  updatedAt: string
}

export interface Vendor {
  id: string
  name: string
  email: string
  phone: string | null
  bankName: string | null
  bankRoutingNumber: string | null
  bankAccountNumber: string | null
  status: 'Active' | 'Inactive'
  createdAt: string
  updatedAt: string
}

export interface Payment {
  id: string
  billId: string
  paymentMethod: 'ACH' | 'Paper Check' | 'Card'
  amount: number
  scheduledDate: string
  paidDate: string | null
  status: 'Not Scheduled' | 'Scheduled' | 'Processing' | 'Paid' | 'Failed' | 'Cancelled' | 'Refunded'
  transactionReference: string | null
  createdAt: string
  updatedAt: string
}

export interface Bill {
  id: string
  vendorId: string
  createdById: string
  approvedById: string | null
  amount: number
  invoiceNumber: string | null
  dueDate: string
  status: 'Draft' | 'Pending Approval' | 'Approved' | 'Overdue' | 'Rejected' | 'Cancelled' | 'Paid'
  fileUrl: string | null
  vendor?: Pick<Vendor, 'id' | 'name' | 'email'>
  creator?: { id: string; fullName: string; email: string }
  approver?: { id: string; fullName: string; email: string } | null
  payments?: Payment[]
  createdAt: string
  updatedAt: string
}
