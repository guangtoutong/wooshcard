'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { Progress } from '@/components/ui/progress'
import { StepNetwork } from './step-network'
import { StepScenario } from './step-scenario'
import { StepPreview, type BinConfig } from './step-preview'
import { StepCustomLastFour } from './step-custom-last-four'
import { StepPayment } from './step-payment'
import { StepSuccess } from './step-success'

type WizardState = {
  step: number
  network: 'VISA' | 'MASTERCARD' | null
  scenario: 'AMAZON' | 'CHATGPT' | 'CLAUDE' | null
  binConfig: BinConfig | null
  customLastFour: boolean
  customLastFourValue: string
}

const TOTAL_STEPS = 6

export function CardApplicationWizard() {
  const t = useTranslations('cards')

  const [state, setState] = useState<WizardState>({
    step: 1,
    network: null,
    scenario: null,
    binConfig: null,
    customLastFour: false,
    customLastFourValue: '',
  })

  const [direction, setDirection] = useState(1)

  function goTo(step: number) {
    setDirection(step > state.step ? 1 : -1)
    setState((s) => ({ ...s, step }))
  }

  function next() {
    goTo(state.step + 1)
  }

  function back() {
    goTo(state.step - 1)
  }

  const progressValue = (state.step / TOTAL_STEPS) * 100

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
    }),
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-center">{t('apply')}</h1>
        <div className="flex items-center gap-3">
          <Progress value={progressValue} className="h-2" />
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {state.step}/{TOTAL_STEPS}
          </span>
        </div>
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={state.step}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.25, ease: 'easeInOut' }}
        >
          {state.step === 1 && (
            <StepNetwork
              selected={state.network}
              onSelect={(network) => setState((s) => ({ ...s, network }))}
              onNext={next}
            />
          )}

          {state.step === 2 && (
            <StepScenario
              selected={state.scenario}
              onSelect={(scenario) => setState((s) => ({ ...s, scenario }))}
              onNext={next}
              onBack={back}
            />
          )}

          {state.step === 3 && state.network && state.scenario && (
            <StepPreview
              network={state.network}
              scenario={state.scenario}
              binConfig={state.binConfig}
              onBinConfigResolved={(config) =>
                setState((s) => ({ ...s, binConfig: config }))
              }
              onNext={next}
              onBack={back}
            />
          )}

          {state.step === 4 && state.binConfig && (
            <StepCustomLastFour
              binConfig={state.binConfig}
              customLastFour={state.customLastFour}
              customLastFourValue={state.customLastFourValue}
              onToggle={(enabled) =>
                setState((s) => ({ ...s, customLastFour: enabled }))
              }
              onValueChange={(value) =>
                setState((s) => ({ ...s, customLastFourValue: value }))
              }
              onNext={next}
              onBack={back}
            />
          )}

          {state.step === 5 && state.network && state.scenario && state.binConfig && (
            <StepPayment
              network={state.network}
              scenario={state.scenario}
              binConfig={state.binConfig}
              customLastFour={state.customLastFour}
              customLastFourValue={state.customLastFourValue}
              onNext={next}
              onBack={back}
            />
          )}

          {state.step === 6 && state.network && state.scenario && (
            <StepSuccess
              network={state.network}
              scenario={state.scenario}
              customLastFour={state.customLastFour}
              customLastFourValue={state.customLastFourValue}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
