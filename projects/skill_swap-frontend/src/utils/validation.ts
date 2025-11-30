import algosdk from 'algosdk'

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validateAlgorandAddress = (address: string): boolean => {
  try {
    return algosdk.isValidAddress(address.trim())
  } catch {
    return false
  }
}

export const validateSkillRate = (rate: number | string, min = 0.1, max = 1000): boolean => {
  const num = typeof rate === 'string' ? parseFloat(rate) : rate
  return !isNaN(num) && num >= min && num <= max
}

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export const sanitizeInput = (input: string): string => {
  return input.trim().slice(0, 500)
}

export const validateSearchQuery = (query: string): boolean => {
  return query.trim().length > 0 && query.length <= 100
}
