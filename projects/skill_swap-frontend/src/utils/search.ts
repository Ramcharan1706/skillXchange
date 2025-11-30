/**
 * Search utilities for filtering skills, mentors, and other content
 */

import { Skill } from '../types'
import { Mentor } from '../pages/MentorsPage'

/**
 * Filters skills based on search query and multiple criteria
 */
export const searchSkills = (
  skills: Skill[],
  query: string,
  filters?: {
    category?: string
    level?: string
    minRate?: number
    maxRate?: number
  }
): Skill[] => {
  if (!query.trim() && !filters) return skills

  return skills.filter((skill) => {
    const queryLower = query.toLowerCase().trim()

    // Apply text search
    const matchesQuery =
      !queryLower ||
      skill.name.toLowerCase().includes(queryLower) ||
      skill.description.toLowerCase().includes(queryLower) ||
      skill.category.toLowerCase().includes(queryLower) ||
      skill.level.toLowerCase().includes(queryLower)

    // Apply filters
    const matchesCategory = !filters?.category || skill.category === filters.category
    const matchesLevel = !filters?.level || skill.level === filters.level
    const matchesMinRate = !filters?.minRate || skill.rate >= filters.minRate
    const matchesMaxRate = !filters?.maxRate || skill.rate <= filters.maxRate

    return matchesQuery && matchesCategory && matchesLevel && matchesMinRate && matchesMaxRate
  })
}

/**
 * Filters mentors based on search query
 */
export const searchMentors = (mentors: Mentor[], query: string): Mentor[] => {
  if (!query.trim()) return mentors

  const queryLower = query.toLowerCase().trim()

  return mentors.filter((mentor) =>
    mentor.name.toLowerCase().includes(queryLower) ||
    mentor.expertise.some((skill) => skill.toLowerCase().includes(queryLower)) ||
    mentor.bio.toLowerCase().includes(queryLower) ||
    mentor.email.toLowerCase().includes(queryLower)
  )
}

/**
 * Highlights search query in text
 */
export const highlightQuery = (text: string, query: string): string => {
  if (!query.trim()) return text

  const regex = new RegExp(`(${query})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

/**
 * Debounce search input
 */
export const debounceSearch = (callback: (query: string) => void, delay: number = 300) => {
  let timeoutId: NodeJS.Timeout

  return (query: string) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      callback(query)
    }, delay)
  }
}
