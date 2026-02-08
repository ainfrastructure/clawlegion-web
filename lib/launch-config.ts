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
  badgeText: 'Limited Early Bird — 50% Off',
  ctaText: 'Claim Your Spot — $49/mo',
  navCtaText: '$49/mo — Claim Now',
  guaranteeText: '30-day money-back guarantee. Cancel anytime.',
} as const

export type LaunchConfig = typeof LAUNCH_CONFIG
