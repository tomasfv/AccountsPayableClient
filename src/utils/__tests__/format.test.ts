import { describe, it, expect } from 'vitest'
import { formatCurrency, formatDate } from '../format'

describe('formatCurrency', () => {
  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00')
  })

  it('formats a whole number', () => {
    expect(formatCurrency(1234)).toBe('$1,234.00')
  })

  it('formats a decimal', () => {
    expect(formatCurrency(1234.5)).toBe('$1,234.50')
  })

  it('formats a negative number', () => {
    expect(formatCurrency(-50)).toBe('-$50.00')
  })

  it('formats large numbers with commas', () => {
    expect(formatCurrency(1_000_000)).toBe('$1,000,000.00')
  })
})

describe('formatDate', () => {
  it('formats a date string', () => {
    expect(formatDate('2026-06-09')).toBe('Jun 9, 2026')
  })

  it('returns em-dash for empty string', () => {
    expect(formatDate('')).toBe('—')
  })

  it('returns em-dash for null', () => {
    expect(formatDate(null as unknown as string)).toBe('—')
  })

  it('returns em-dash for undefined', () => {
    expect(formatDate(undefined as unknown as string)).toBe('—')
  })

  it('formats a full ISO date', () => {
    expect(formatDate('2026-01-15T10:30:00.000Z')).toBe('Jan 15, 2026')
  })
})
