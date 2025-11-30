export interface Feedback {
  id: number
  student: string
  rating: number
  comment: string
  date: string
}

export interface Skill {
  id: number
  name: string
  description: string
  teacher: string
  receiver: string
  rate: number
  category: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  sessionsCompleted: number
  rating: number
  availability: { slot: string; link: string }[]
  feedbacks: Feedback[]
}

export interface Mentor {
  id: number
  name: string
  email: string
  expertise: string[]
  experience: string
  bio: string
  rate: number
  availability: string[]
  walletAddress: string
}

export interface DashboardStats {
  totalSessions: number
  upcomingSessions: number
  completedSessions: number
  totalEarnings: number
  averageRating: number
}

export interface RecentActivity {
  id: number
  type: 'session_booked' | 'session_completed' | 'payment_received'
  title: string
  description: string
  timestamp: Date
}

export interface Notification {
  id: number
  type: 'session_request' | 'confirmation' | 'message'
  title: string
  message: string
  timestamp: Date
  read: boolean
}
