'use client'

import { useTranslations } from 'next-intl'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { Badge } from '@/components/ui/badge'

interface VirtualCardProps {
  card: {
    network: string
    scenario: string
    lastFour: string
    expMonth: number
    expYear: number
    status: string
    balance: number
  }
}

const scenarioGradients: Record<string, string> = {
  AMAZON: 'from-orange-500 to-black',
  CHATGPT: 'from-emerald-500 to-black',
  CLAUDE: 'from-amber-600 to-black',
}

const scenarioColors: Record<string, { from: string; to: string }> = {
  AMAZON: { from: '#f97316', to: '#000000' },
  CHATGPT: { from: '#10b981', to: '#000000' },
  CLAUDE: { from: '#d97706', to: '#000000' },
}

const statusConfig: Record<string, { color: string; dotClass: string }> = {
  ACTIVE: { color: 'bg-green-500', dotClass: 'bg-green-400' },
  FROZEN: { color: 'bg-blue-500', dotClass: 'bg-blue-400' },
  CANCELLED: { color: 'bg-red-500', dotClass: 'bg-red-400' },
}

export function VirtualCard({ card }: VirtualCardProps) {
  const t = useTranslations('cards')

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const rotateX = useTransform(y, [-100, 100], [10, -10])
  const rotateY = useTransform(x, [-100, 100], [-10, 10])

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    x.set(event.clientX - centerX)
    y.set(event.clientY - centerY)
  }

  function handleMouseLeave() {
    x.set(0)
    y.set(0)
  }

  const gradient = scenarioColors[card.scenario] || scenarioColors.CHATGPT
  const status = statusConfig[card.status] || statusConfig.ACTIVE
  const statusLabel = card.status === 'ACTIVE' ? t('active') : card.status === 'FROZEN' ? t('frozen') : t('cancelled')
  const scenarioLabel = card.scenario === 'AMAZON' ? t('amazon') : card.scenario === 'CHATGPT' ? t('chatgpt') : t('claude')
  const networkLabel = card.network === 'VISA' ? t('visa') : t('mastercard')

  return (
    <motion.div
      className="relative w-full max-w-sm mx-auto md:max-w-none cursor-pointer"
      style={{
        aspectRatio: '1.586',
        perspective: '1000px',
        rotateX,
        rotateY,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div
        className="relative w-full h-full rounded-xl overflow-hidden shadow-2xl"
        style={{
          background: `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
        }}
      >
        {/* Glossy/metallic sheen overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(105deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 40%, transparent 60%, rgba(255,255,255,0.08) 100%)',
          }}
        />

        {/* Card content */}
        <div className="relative z-10 flex flex-col justify-between h-full p-5">
          {/* Top row: network + scenario badge */}
          <div className="flex items-start justify-between">
            <span className="text-lg font-bold tracking-wider text-white/90">
              {networkLabel}
            </span>
            <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs">
              {scenarioLabel}
            </Badge>
          </div>

          {/* Card number */}
          <div className="flex items-center gap-3 text-white/90 font-mono text-base sm:text-lg tracking-[0.2em]">
            <span>••••</span>
            <span>••••</span>
            <span>••••</span>
            <span>{card.lastFour}</span>
          </div>

          {/* Bottom row: expiry, status, balance */}
          <div className="flex items-end justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-white/50 mb-0.5">
                {t('expiryDate')}
              </div>
              <div className="text-sm text-white/80 font-mono">
                {String(card.expMonth).padStart(2, '0')}/{String(card.expYear).slice(-2)}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Status indicator */}
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${status.dotClass}`} />
                <span className="text-xs text-white/60">{statusLabel}</span>
              </div>

              {/* Balance */}
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider text-white/50 mb-0.5">
                  {t('balance')}
                </div>
                <div className="text-sm font-semibold text-white/90">
                  ${card.balance.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
