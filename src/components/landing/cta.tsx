'use client'

import { signIn } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

export function CTA() {
  const t = useTranslations('landing')

  return (
    <section className="relative py-24 bg-[#0a0e1a] overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[600px] rounded-full bg-blue-600/10 blur-[150px]" />

      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-8"
        >
          Ready to unlock the AI era?
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
        >
          <Button
            onClick={() => signIn('google')}
            size="lg"
            className="h-12 px-8 text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white border-0 shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-blue-500/40"
          >
            {t('getStarted')}
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
