import { Hero } from '@/components/landing/hero'
import { Features } from '@/components/landing/features'
import { Pricing } from '@/components/landing/pricing'
import { CTA } from '@/components/landing/cta'

export default function HomePage() {
  return (
    <div>
      <Hero />
      <Features />
      <Pricing />
      <CTA />
    </div>
  )
}
