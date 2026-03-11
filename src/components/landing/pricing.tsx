'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'

const scenarios = [
  { name: 'Amazon', network: 'Mastercard' },
  { name: 'ChatGPT', network: 'Visa' },
  { name: 'Claude', network: 'Visa' },
]

export function Pricing() {
  const t = useTranslations('landing')

  return (
    <section className="py-24 bg-[#0a0e1a]">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center text-2xl sm:text-3xl font-bold text-white mb-12"
        >
          {t('pricingTitle')}
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
          className="max-w-lg mx-auto rounded-xl border border-amber-500/30 bg-[#111827] p-8"
        >
          {/* Pricing items */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">{t('cardFee')}</span>
              <span className="text-xl font-bold text-white">
                $5{' '}
                <span className="text-sm font-normal text-gray-500">
                  {t('perCard')}
                </span>
              </span>
            </div>

            <div className="h-px bg-gray-800" />

            <div className="flex items-center justify-between">
              <span className="text-gray-300">{t('customFee')}</span>
              <span className="text-xl font-bold text-amber-400">+$10</span>
            </div>

            <div className="h-px bg-gray-800" />

            {/* Scenario comparison */}
            <div className="pt-2">
              <p className="text-sm text-gray-500 mb-4 uppercase tracking-wide">
                Supported Scenarios
              </p>
              <div className="space-y-3">
                {scenarios.map((s) => (
                  <div
                    key={s.name}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-300">{s.name}</span>
                    <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
                      {s.network}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
