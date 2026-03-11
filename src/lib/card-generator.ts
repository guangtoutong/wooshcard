export function generateCardNumber(bin: string, customLastFour?: string): {
  cardNumber: string
  lastFour: string
  cvv: string
  expMonth: number
  expYear: number
} {
  // Generate remaining digits (16 total, BIN is 6 digits)
  const middleLength = 16 - 6 - 4
  const middleDigits = Array.from({ length: middleLength }, () =>
    Math.floor(Math.random() * 10)
  ).join('')

  const lastFour = customLastFour || Array.from({ length: 4 }, () =>
    Math.floor(Math.random() * 10)
  ).join('')

  const cardNumber = bin + middleDigits + lastFour

  // Generate CVV (3 digits)
  const cvv = Array.from({ length: 3 }, () =>
    Math.floor(Math.random() * 10)
  ).join('')

  // Expiry: 3 years from now
  const now = new Date()
  const expMonth = now.getMonth() + 1 // 1-12
  const expYear = now.getFullYear() + 3

  return { cardNumber, lastFour, cvv, expMonth, expYear }
}
