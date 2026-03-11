'use client'

import { signIn } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

export function Hero() {
  const t = useTranslations('landing')

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#0a0e1a]">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(59,130,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.3) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        {/* Gradient orb 1 */}
        <div className="absolute top-1/4 -left-32 h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[120px] animate-[drift_8s_ease-in-out_infinite]" />
        {/* Gradient orb 2 */}
        <div className="absolute bottom-1/4 -right-32 h-[400px] w-[400px] rounded-full bg-amber-500/15 blur-[100px] animate-[drift_10s_ease-in-out_infinite_reverse]" />
        {/* Gradient orb 3 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-blue-500/10 blur-[140px] animate-[pulse_6s_ease-in-out_infinite]" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight"
        >
          <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-amber-400 bg-clip-text text-transparent">
            {t('heroTitle')}
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          className="mt-6 max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-gray-400 leading-relaxed"
        >
          {t('heroSubtitle')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 }}
          className="mt-10"
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

      {/* CSS animations */}
      <style jsx>{`
        @keyframes drift {
          0%,
          100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(30px, -20px);
          }
        }
      `}</style>
    </section>
  )
}
