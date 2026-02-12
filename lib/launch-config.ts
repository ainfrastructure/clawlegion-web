export const LAUNCH_CONFIG = {
  // Offer deadline — change this one date to extend/restart the countdown
  deadline: new Date('2026-03-01T00:00:00Z'),

  // Pricing
  originalPrice: 49,
  earlyBirdPrice: 49,
  discount: 0,

  // Scarcity
  totalSlots: 100,
  claimedSlots: 47,

  // Copy
  badgeText: 'Free Beta — Limited Spots',
  ctaText: 'Join the Beta — Free',
  navCtaText: 'Join Beta — Free',
  guaranteeText: 'Sign up for early access. No payment required.',
} as const

export type LaunchConfig = typeof LAUNCH_CONFIG
