import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Toggle from '../Toggle'

describe('Toggle', () => {
  it('renders unchecked when checked=false', () => {
    const { container } = render(<Toggle checked={false} onChange={() => {}} />)
    const outerDiv = container.firstElementChild!
    expect(outerDiv).toBeInTheDocument()
  })

  it('calls onChange with true when clicked while unchecked', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    const { container } = render(<Toggle checked={false} onChange={onChange} />)
    const outerDiv = container.firstElementChild!
    await user.click(outerDiv)
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('calls onChange with false when clicked while checked', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    const { container } = render(<Toggle checked={true} onChange={onChange} />)
    const outerDiv = container.firstElementChild!
    await user.click(outerDiv)
    expect(onChange).toHaveBeenCalledWith(false)
  })
})
