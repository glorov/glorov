import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '../../src/components/ui/Button'
import { IconButton } from '../../src/components/ui/IconButton'
import { Badge } from '../../src/components/ui/Badge'
import { Input } from '../../src/components/ui/Input'
import { Checkbox } from '../../src/components/ui/Checkbox'
import { Alert } from '../../src/components/feedback/Alert'
import { Card } from '../../src/components/ui/Card'
import { Divider } from '../../src/components/ui/Divider'

describe('Button Component', () => {
  it('renders children and default classes', () => {
    render(<Button>Add to Nursery Cart</Button>)
    const button = screen.getByRole('button', { name: /add to nursery cart/i })
    expect(button).toBeDefined()
    expect(button.className).toContain('bg-forest-deep')
    expect(button.className).toContain('min-h-[44px]') // Mobile 44px touch target
  })

  it('renders different variants and handles loading state', () => {
    render(
      <Button variant="danger" isLoading>
        Delete Item
      </Button>
    )
    const button = screen.getByRole('button')
    expect(button.className).toContain('bg-brand-error')
    expect(button.getAttribute('aria-busy')).toBe('true')
    expect(button.hasAttribute('disabled')).toBe(true)
  })
})

describe('IconButton Component', () => {
  it('enforces aria-label for accessibility', () => {
    render(
      <IconButton
        aria-label="Toggle favorite"
        icon={<span data-testid="heart-icon">♥</span>}
      />
    )
    const button = screen.getByRole('button', { name: /toggle favorite/i })
    expect(button).toBeDefined()
    expect(screen.getByTestId('heart-icon')).toBeDefined()
    expect(button.className).toContain('min-h-[44px]')
  })
})

describe('Badge Component', () => {
  it('renders semantic statuses and dot indicator', () => {
    render(
      <Badge status="brand" withDot>
        Heirloom Verified
      </Badge>
    )
    const badge = screen.getByText(/heirloom verified/i)
    expect(badge).toBeDefined()
  })
})

describe('Input Component', () => {
  it('associates label, input, and error message with ARIA', () => {
    render(
      <Input
        label="Postal Code"
        error="Invalid Indian PIN code"
        defaultValue="411"
      />
    )
    const input = screen.getByLabelText(/postal code/i)
    expect(input).toBeDefined()
    expect(input.getAttribute('aria-invalid')).toBe('true')
    const errorMsg = screen.getByRole('alert')
    expect(errorMsg.textContent).toContain('Invalid Indian PIN code')
  })
})

describe('Checkbox Component', () => {
  it('handles change events and renders label', () => {
    let checked = false
    render(
      <Checkbox
        label="Include sowing manual"
        checked={checked}
        onChange={(e) => {
          checked = e.target.checked
        }}
      />
    )
    const checkbox = screen.getByRole('checkbox', { name: /include sowing manual/i })
    expect(checkbox).toBeDefined()
    expect((checkbox as HTMLInputElement).checked).toBe(false)

    fireEvent.click(checkbox)
    expect(checked).toBe(true)
  })
})

describe('Alert Component', () => {
  it('renders with role="alert" and dismiss handler', () => {
    let dismissed = false
    render(
      <Alert
        variant="warning"
        title="Perishable flora alert"
        onDismiss={() => {
          dismissed = true
        }}
      >
        Requires fast transit.
      </Alert>
    )
    expect(screen.getByRole('alert')).toBeDefined()
    expect(screen.getByText(/perishable flora alert/i)).toBeDefined()

    const dismissBtn = screen.getByLabelText(/dismiss alert/i)
    fireEvent.click(dismissBtn)
    expect(dismissed).toBe(true)
  })
})

describe('Card & Divider Components', () => {
  it('renders card with header and divider', () => {
    render(
      <Card header={<h4>Nursery Details</h4>}>
        <p>Pune Central Garden Hub</p>
        <Divider label="LOGISTICS" />
      </Card>
    )
    expect(screen.getByText(/nursery details/i)).toBeDefined()
    expect(screen.getByText(/logistics/i)).toBeDefined()
  })
})
