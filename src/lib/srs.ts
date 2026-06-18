export interface SRSCard {
  interval_days: number
  ease_factor: number
  next_review: string
}

export function calcNextReview(card: SRSCard, understood: boolean): SRSCard {
  if (!understood) {
    return {
      interval_days: 1,
      ease_factor: Math.max(1.3, card.ease_factor - 0.2),
      next_review: daysFromNow(1),
    }
  }
  const newInterval = Math.ceil(card.interval_days * card.ease_factor)
  return {
    interval_days: newInterval,
    ease_factor: Math.min(2.5, card.ease_factor + 0.05),
    next_review: daysFromNow(newInterval),
  }
}

function daysFromNow(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

export function isDue(nextReview: string): boolean {
  return new Date(nextReview) <= new Date()
}
