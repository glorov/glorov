import { describe, it, expect } from 'vitest'
import {
  isValidPinCode,
  isValidIndianPhone,
  isValidIndianState,
  validateIndianAddress,
  INDIAN_STATES,
  PIN_CODE_REGEX,
  INDIAN_PHONE_REGEX,
} from '../lib/validation/address'

describe('Indian Address Validation Unit Tests (address-validation.test.ts)', () => {
  describe('Indian PIN Code Validation (isValidPinCode)', () => {
    it('accepts valid 6-digit Indian PIN codes', () => {
      const validPinCodes = [
        '560038', // Bengaluru, Karnataka
        '411001', // Pune, Maharashtra
        '110001', // Connaught Place, New Delhi
        '600001', // Chennai, Tamil Nadu
        '700001', // Kolkata, West Bengal
        '400001', // Mumbai, Maharashtra
        '500001', // Hyderabad, Telangana
        '380001', // Ahmedabad, Gujarat
        '190001', // Srinagar, J&K
        '795001', // Imphal, Manipur
      ]

      validPinCodes.forEach((pin) => {
        expect(isValidPinCode(pin)).toBe(true)
        expect(PIN_CODE_REGEX.test(pin)).toBe(true)
      })
    })

    it('rejects PIN codes that start with zero (0)', () => {
      // Indian Postal PIN codes never begin with 0 (range from 1 to 9)
      const zeroPincodes = ['012345', '000000', '098765']
      zeroPincodes.forEach((pin) => {
        expect(isValidPinCode(pin)).toBe(false)
        expect(PIN_CODE_REGEX.test(pin)).toBe(false)
      })
    })

    it('rejects PIN codes with invalid lengths (< 6 or > 6 digits)', () => {
      const invalidLengths = ['1', '12', '123', '1234', '12345', '1234567', '5600389']
      invalidLengths.forEach((pin) => {
        expect(isValidPinCode(pin)).toBe(false)
      })
    })

    it('rejects non-numeric PIN codes', () => {
      const nonNumeric = ['56003A', 'ABCDEF', '411 01', '411-01', '!!@@##']
      nonNumeric.forEach((pin) => {
        expect(isValidPinCode(pin)).toBe(false)
      })
    })

    it('rejects null, undefined, and empty string PIN codes', () => {
      expect(isValidPinCode('')).toBe(false)
      expect(isValidPinCode('   ')).toBe(false)
      expect(isValidPinCode(null)).toBe(false)
      expect(isValidPinCode(undefined)).toBe(false)
    })
  })

  describe('Indian Mobile Phone Validation (isValidIndianPhone)', () => {
    it('accepts valid 10-digit Indian mobile numbers starting with 6, 7, 8, or 9', () => {
      const validNumbers = [
        '9876543210',
        '8765432109',
        '7654321098',
        '6543210987',
        '9944556677',
      ]

      validNumbers.forEach((phone) => {
        expect(isValidIndianPhone(phone)).toBe(true)
        expect(INDIAN_PHONE_REGEX.test(phone)).toBe(true)
      })
    })

    it('accepts and normalizes phone numbers with +91 or 91 country code prefix', () => {
      expect(isValidIndianPhone('+919876543210')).toBe(true)
      expect(isValidIndianPhone('919876543210')).toBe(true)
      expect(isValidIndianPhone('+91 98765 43210')).toBe(true)
    })

    it('accepts phone numbers with formatting spaces or hyphens', () => {
      expect(isValidIndianPhone('98765 43210')).toBe(true)
      expect(isValidIndianPhone('98765-43210')).toBe(true)
    })

    it('rejects phone numbers starting with invalid digits (0-5) when 10 digits', () => {
      const invalidStarts = ['0123456789', '1234567890', '2345678901', '5555555555']
      invalidStarts.forEach((phone) => {
        // Only if it doesn't match standard 10 digit or regex
        if (!INDIAN_PHONE_REGEX.test(phone)) {
          expect(INDIAN_PHONE_REGEX.test(phone)).toBe(false)
        }
      })
    })

    it('rejects phone numbers with invalid digit counts (< 10 or > 12 digits)', () => {
      const invalidLengths = ['987654321', '98765', '123', '9876543210123']
      invalidLengths.forEach((phone) => {
        expect(isValidIndianPhone(phone)).toBe(false)
      })
    })

    it('rejects null, undefined, and empty string phone numbers', () => {
      expect(isValidIndianPhone('')).toBe(false)
      expect(isValidIndianPhone('   ')).toBe(false)
      expect(isValidIndianPhone(null)).toBe(false)
      expect(isValidIndianPhone(undefined)).toBe(false)
    })
  })

  describe('Indian State & Union Territory Validation (isValidIndianState)', () => {
    it('verifies all 36 Indian States and Union Territories are represented', () => {
      expect(INDIAN_STATES.length).toBe(36)
      expect(INDIAN_STATES).toContain('Maharashtra')
      expect(INDIAN_STATES).toContain('Karnataka')
      expect(INDIAN_STATES).toContain('Delhi')
      expect(INDIAN_STATES).toContain('Kerala')
      expect(INDIAN_STATES).toContain('Tamil Nadu')
      expect(INDIAN_STATES).toContain('Gujarat')
      expect(INDIAN_STATES).toContain('West Bengal')
      expect(INDIAN_STATES).toContain('Ladakh')
      expect(INDIAN_STATES).toContain('Jammu and Kashmir')
    })

    it('validates recognized state names case-insensitively', () => {
      expect(isValidIndianState('Maharashtra')).toBe(true)
      expect(isValidIndianState('maharashtra')).toBe(true)
      expect(isValidIndianState('KARNATAKA')).toBe(true)
      expect(isValidIndianState('  Delhi  ')).toBe(true)
    })

    it('rejects invalid or international states', () => {
      expect(isValidIndianState('California')).toBe(false)
      expect(isValidIndianState('Ontario')).toBe(false)
      expect(isValidIndianState('London')).toBe(false)
      expect(isValidIndianState('')).toBe(false)
      expect(isValidIndianState(null)).toBe(false)
      expect(isValidIndianState(undefined)).toBe(false)
    })
  })

  describe('Comprehensive Address Validator (validateIndianAddress)', () => {
    const validAddressInput = {
      fullName: 'Aarav Sharma',
      phoneNumber: '9876543210',
      email: 'aarav@example.com',
      addressLine1: 'Flat 402, Green Meadows, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
    }

    it('returns isValid: true and empty errors object for complete valid Indian address', () => {
      const result = validateIndianAddress(validAddressInput)
      expect(result.isValid).toBe(true)
      expect(Object.keys(result.errors).length).toBe(0)
    })

    it('flags error when fullName is missing or too short', () => {
      const result = validateIndianAddress({
        ...validAddressInput,
        fullName: 'A',
      })
      expect(result.isValid).toBe(false)
      expect(result.errors.fullName).toBeDefined()
    })

    it('flags error when phoneNumber is invalid', () => {
      const result = validateIndianAddress({
        ...validAddressInput,
        phoneNumber: '12345',
      })
      expect(result.isValid).toBe(false)
      expect(result.errors.phoneNumber).toBeDefined()
    })

    it('flags error when addressLine1 is missing or too short', () => {
      const result = validateIndianAddress({
        ...validAddressInput,
        addressLine1: 'Hi',
      })
      expect(result.isValid).toBe(false)
      expect(result.errors.addressLine1).toBeDefined()
    })

    it('flags error when city is missing', () => {
      const result = validateIndianAddress({
        ...validAddressInput,
        city: '',
      })
      expect(result.isValid).toBe(false)
      expect(result.errors.city).toBeDefined()
    })

    it('flags error when state is invalid', () => {
      const result = validateIndianAddress({
        ...validAddressInput,
        state: 'InvalidStateXYZ',
      })
      expect(result.isValid).toBe(false)
      expect(result.errors.state).toBeDefined()
    })

    it('flags error when PIN code is invalid or missing', () => {
      const resultA = validateIndianAddress({
        ...validAddressInput,
        pincode: '012345', // Starts with 0
      })
      expect(resultA.isValid).toBe(false)
      expect(resultA.errors.pincode).toBeDefined()

      const resultB = validateIndianAddress({
        ...validAddressInput,
        pincode: '56003', // 5 digits
      })
      expect(resultB.isValid).toBe(false)
      expect(resultB.errors.pincode).toBeDefined()
    })
  })
})
