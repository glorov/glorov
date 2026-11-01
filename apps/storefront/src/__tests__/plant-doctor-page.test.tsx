import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import PlantDoctorPage from '../app/plant-doctor/page'
import { PlantDoctorDiagnosticWizard } from '../app/plant-doctor/PlantDoctorDiagnosticWizard'
import { ConsultationBookingForm } from '../app/plant-doctor/ConsultationBookingForm'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/plant-doctor',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

describe('Plant Doctor Page & Diagnostic Clinic', () => {
  it('renders hero title, trust badges, and breadcrumb navigation', () => {
    render(<PlantDoctorPage />)

    expect(screen.getByRole('heading', { level: 1, name: /GLOROV Plant Doctor/i })).toBeDefined()
    expect(screen.getByText(/Certified Pune Nursery Horticultural Clinic/i)).toBeDefined()
    expect(screen.getByText('50,000+')).toBeDefined()
    expect(screen.getByText(/15-Min Free/i)).toBeDefined()
    expect(screen.getAllByText(/100% Organic/i).length).toBeGreaterThanOrEqual(1)

    // Breadcrumb verification
    expect(screen.getByRole('navigation', { name: /breadcrumb/i })).toBeDefined()
  })

  it('renders the common botanical ailments knowledgebase cards', () => {
    render(<PlantDoctorPage />)

    expect(screen.getByRole('heading', { level: 2, name: /Common Plant Ailments & Quick Remedies/i })).toBeDefined()
    expect(screen.getByText(/Overwatering vs. Underwatering/i)).toBeDefined()
    expect(screen.getByText(/Spider Mites & Mealybugs/i)).toBeDefined()
    expect(screen.getByText(/Solar Scorch vs. Light Starvation/i)).toBeDefined()
  })

  it('navigates through interactive diagnostic wizard to provide organic care prescription', () => {
    render(<PlantDoctorDiagnosticWizard />)

    // Step 1: Select Plant Category
    expect(screen.getByText(/Step 1: Which plant is showing signs of distress\?/i)).toBeDefined()
    const indoorOption = screen.getByRole('button', { name: /Indoor Foliage Plants/i })
    fireEvent.click(indoorOption)

    // Step 2: Select Affected Plant Area
    expect(screen.getByText(/Step 2: Where are the symptoms appearing\?/i)).toBeDefined()
    const leavesOption = screen.getByRole('button', { name: /Leaves and Foliage/i })
    fireEvent.click(leavesOption)

    // Step 3: Select Observed Symptom
    expect(screen.getByText(/Step 3: What does the symptom look like\?/i)).toBeDefined()
    const overwateringSymptom = screen.getByRole('button', {
      name: /Lower leaves turning pale yellow and soft/i,
    })
    fireEvent.click(overwateringSymptom)

    // Step 4: Diagnosis Card & Organic Prescription
    expect(screen.getByText(/Overwatering & Root Hypoxia/i)).toBeDefined()
    expect(screen.getByText(/Suffocatio radicum/i)).toBeDefined()
    expect(screen.getByText(/SEVERITY: MODERATE/i)).toBeDefined()
    expect(screen.getByText(/Step-by-Step Organic Care Protocol:/i)).toBeDefined()

    // Test Reset
    const resetBtn = screen.getByRole('button', { name: /Start New Plant Diagnosis/i })
    fireEvent.click(resetBtn)
    expect(screen.getByText(/Step 1: Which plant is showing signs of distress\?/i)).toBeDefined()
  })

  it('submits consultation booking form and renders confirmation ticket with WhatsApp action', async () => {
    render(<ConsultationBookingForm />)

    // Fill form fields
    const nameInput = screen.getByLabelText(/Full Name/i)
    const phoneInput = screen.getByLabelText(/WhatsApp Number/i)
    const emailInput = screen.getByLabelText(/Email Address/i)
    const speciesInput = screen.getByLabelText(/Plant or Seed Name/i)
    const symptomsInput = screen.getByLabelText(/Symptoms & Observations/i)

    fireEvent.change(nameInput, { target: { value: 'Ananya Deshmukh' } })
    fireEvent.change(phoneInput, { target: { value: '+91 98220 12345' } })
    fireEvent.change(emailInput, { target: { value: 'ananya@puneplants.org' } })
    fireEvent.change(speciesInput, { target: { value: 'Monstera Deliciosa' } })
    fireEvent.change(symptomsInput, {
      target: { value: 'Yellowing bottom leaves with brown spots on mature leaves.' },
    })

    // Select Afternoon slot
    const afternoonSlot = screen.getByRole('button', { name: /Afternoon Slot 2 PM to 4 PM/i })
    fireEvent.click(afternoonSlot)

    // Submit form
    const submitBtn = screen.getByRole('button', { name: /Submit Plant Doctor Consultation Booking/i })
    fireEvent.click(submitBtn)

    // Verify confirmation state
    await waitFor(() => {
      expect(screen.getByText(/Consultation Confirmed!/i)).toBeDefined()
    })

    expect(screen.getByText(/Ananya Deshmukh/i)).toBeDefined()
    expect(screen.getByText(/Monstera Deliciosa/i)).toBeDefined()
    expect(screen.getByRole('link', { name: /Connect with Plant Doctor on WhatsApp/i })).toBeDefined()
  })
})
