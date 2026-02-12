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
  badgeText: 'Limited Spots Available',
  ctaText: 'Claim Your Spot — $49/mo',
  navCtaText: '$49/mo — Claim Now',
  guaranteeText: 'Limited spots. Cancel anytime.',
} as const

export type LaunchConfig = typeof LAUNCH_CONFIG
