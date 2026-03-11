'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { CreditCard, Brain, Zap } from 'lucide-react'

const features = [
  { icon: CreditCard, titleKey: 'featureCards', descKey: 'featureCardsDesc' },
  { icon: Brain, titleKey: 'featureAI', descKey: 'featureAIDesc' },
  { icon: Zap, titleKey: 'featureInstant', descKey: 'featureInstantDesc' },
] as const

export function Features() {
  const t = useTranslations('landing')

  return (
    <section className="py-24 bg-[#0a0e1a]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.titleKey}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{
                  duration: 0.6,
                  ease: 'easeOut',
                  delay: index * 0.15,
                }}
                className="group rounded-xl border border-gray-800 bg-[#111827] p-8 transition-colors duration-300 hover:border-gray-700"
              >
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                  <Icon className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="mb-3 text-lg font-semibold text-white">
                  {t(feature.titleKey)}
                </h3>
                <p className="text-sm leading-relaxed text-gray-400">
                  {t(feature.descKey)}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
