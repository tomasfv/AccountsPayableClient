import { describe, it, expect } from 'vitest'
import { getActions, statusColors, paymentStatusColors, actionLabel } from '../billActions'

describe('getActions', () => {
  it('Draft — primary is SUBMIT, secondary includes EDIT and DELETE', () => {
    const result = getActions('Draft', null)
    expect(result.primary).toBe('SUBMIT')
    expect(result.secondary).toContain('EDIT')
    expect(result.secondary).toContain('DELETE')
    expect(result.secondary).toContain('VIEW_DETAILS')
    expect(result.secondary).toContain('DOWNLOAD_PDF')
  })

  it('Pending Approval — primary is APPROVE, secondary includes REJECT', () => {
    const result = getActions('Pending Approval', null)
    expect(result.primary).toBe('APPROVE')
    expect(result.secondary).toContain('REJECT')
  })

  it('Approved / null — primary is SCHEDULE', () => {
    const result = getActions('Approved', null)
    expect(result.primary).toBe('SCHEDULE')
    expect(result.secondary).toContain('PAY_NOW')
  })

  it('Approved / Not Scheduled — primary is SCHEDULE', () => {
    const result = getActions('Approved', 'Not Scheduled')
    expect(result.primary).toBe('SCHEDULE')
  })

  it('Approved / Scheduled — primary is PAY_NOW, secondary includes RESCHEDULE and CANCEL_PAYMENT', () => {
    const result = getActions('Approved', 'Scheduled')
    expect(result.primary).toBe('PAY_NOW')
    expect(result.secondary).toContain('RESCHEDULE')
    expect(result.secondary).toContain('CANCEL_PAYMENT')
  })

  it('Approved / Processing — primary is VIEW_PAYMENT', () => {
    const result = getActions('Approved', 'Processing')
    expect(result.primary).toBe('VIEW_PAYMENT')
  })

  it('Approved / Failed — primary is PAY_NOW', () => {
    const result = getActions('Approved', 'Failed')
    expect(result.primary).toBe('PAY_NOW')
    expect(result.secondary).toContain('CHANGE_PAYMENT_METHOD')
  })

  it('Approved / Refunded — primary is REVIEW_REFUND', () => {
    const result = getActions('Approved', 'Refunded')
    expect(result.primary).toBe('REVIEW_REFUND')
  })

  it('Approved / Paid — primary is VIEW_DETAILS', () => {
    const result = getActions('Approved', 'Paid')
    expect(result.primary).toBe('VIEW_DETAILS')
  })

  it('Paid — no primary, secondary only VIEW_DETAILS and DOWNLOAD_PDF', () => {
    const result = getActions('Paid', null)
    expect(result.primary).toBe('VIEW_DETAILS')
    expect(result.secondary).toEqual(['DOWNLOAD_PDF'])
  })

  it('Overdue — primary is RESOLVE_PAYMENT, secondary includes PAY_NOW', () => {
    const result = getActions('Overdue', null)
    expect(result.primary).toBe('RESOLVE_PAYMENT')
    expect(result.secondary).toContain('PAY_NOW')
  })

  it('Rejected — primary is EDIT_RESUBMIT, secondary includes DELETE', () => {
    const result = getActions('Rejected', null)
    expect(result.primary).toBe('EDIT_RESUBMIT')
    expect(result.secondary).toContain('DELETE')
  })

  it('Cancelled — primary is VIEW_DETAILS, no actions besides DOWNLOAD_PDF', () => {
    const result = getActions('Cancelled', null)
    expect(result.primary).toBe('VIEW_DETAILS')
    expect(result.secondary).toEqual(['DOWNLOAD_PDF'])
  })

  it('unknown status — default to VIEW_DETAILS', () => {
    const result = getActions('Unknown', null)
    expect(result.primary).toBe('VIEW_DETAILS')
    expect(result.secondary).toEqual(['DOWNLOAD_PDF'])
  })
})

describe('statusColors', () => {
  it('has entries for all bill statuses', () => {
    const expected = ['Draft', 'Pending Approval', 'Approved', 'Overdue', 'Rejected', 'Cancelled', 'Paid']
    expected.forEach((s) => {
      expect(statusColors[s]).toBeDefined()
    })
  })
})

describe('paymentStatusColors', () => {
  it('has entries for all payment statuses', () => {
    const expected = ['Not Scheduled', 'Scheduled', 'Processing', 'Paid', 'Failed', 'Cancelled', 'Refunded']
    expected.forEach((s) => {
      expect(paymentStatusColors[s]).toBeDefined()
    })
  })
})

describe('actionLabel', () => {
  it('has labels for all BillAction values', () => {
    const actions = [
      'SUBMIT', 'EDIT', 'DELETE', 'APPROVE', 'REJECT',
      'VIEW_DETAILS', 'DOWNLOAD_PDF', 'SCHEDULE', 'PAY_NOW',
      'RESCHEDULE', 'CANCEL_PAYMENT', 'VIEW_PAYMENT',
      'CONTACT_VENDOR', 'VIEW_RECEIPT', 'DOWNLOAD_RECEIPT',
      'DUPLICATE_BILL', 'RESOLVE_PAYMENT', 'CHANGE_PAYMENT_METHOD',
      'REVIEW_REFUND', 'VIEW_PAYMENT_HISTORY', 'EDIT_RESUBMIT',
      'VIEW_REJECTION_REASON',
    ] as const
    actions.forEach((a) => {
      expect(actionLabel[a]).toBeDefined()
      expect(typeof actionLabel[a]).toBe('string')
    })
  })
})
