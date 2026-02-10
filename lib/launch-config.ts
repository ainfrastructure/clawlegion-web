export const LAUNCH_CONFIG = {
  // Offer deadline — change this one date to extend/restart the countdown
  deadline: new Date('2026-03-01T00:00:00Z'),

  // Pricing
  originalPrice: 99,
  earlyBirdPrice: 49,
  discount: 50,

  // Scarcity
  totalSlots: 100,
  claimedSlots: 47,

  // Copy
  badgeText: 'Early Access — Reserve Free, Pay Later',
  ctaText: 'Reserve Your Spot — Free',
  navCtaText: 'Reserve Your Spot',
  guaranteeText: 'No payment required. Reserve now, pay later when we launch.',
} as const

export type LaunchConfig = typeof LAUNCH_CONFIG
