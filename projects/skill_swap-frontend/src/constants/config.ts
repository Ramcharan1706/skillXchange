export const PAYMENT_CONFIG = {
  AMOUNT_ALGO: 0.1,
  RECEIVER_ADDRESS: '2ZTFJNDXPWDETGJQQN33HAATRHXZMBWESKO2AUFZUHERH2H3TG4XTNPL4Y',
}

export const SKILL_CONFIG = {
  CATEGORIES: [
    'Programming', 'Music', 'Languages', 'Art', 'Sports', 'Cooking',
    'Photography', 'Writing', 'Business', 'Science', 'Design', 'Other'
  ],
  LEVELS: ['Beginner', 'Intermediate', 'Advanced'] as const,
  MIN_RATE: 0.1,
  MAX_RATE: 1000,
}

export const VALIDATION_MESSAGES = {
  REQUIRED_FIELDS: 'All fields are required.',
  INVALID_RATE: 'Rate must be a positive number.',
  INVALID_SLOT: 'Each slot must have a valid time.',
  WALLET_NOT_CONNECTED: 'Please connect your wallet and ensure it is active.',
  INVALID_ADDRESS: 'Invalid receiver address.',
  MIN_ONE_SLOT: 'Add at least one time slot.',
}

export const TIME_CONFIG = {
  DEFAULT_SLOTS: [
    { time: '10:00 AM', meetLink: 'https://meet.google.com/new-1010-session' },
    { time: '12:00 PM', meetLink: 'https://meet.google.com/new-1200-session' },
    { time: '2:00 PM', meetLink: 'https://meet.google.com/new-1400-session' },
    { time: '4:00 PM', meetLink: 'https://meet.google.com/new-1600-session' },
  ],
}
