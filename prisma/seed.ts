import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const configs = [
    { network: 'VISA' as const, scenario: 'AMAZON' as const, bin: '431940', openFee: 5, customLastFourFee: 10, description: 'Visa card for Amazon purchases' },
    { network: 'VISA' as const, scenario: 'CHATGPT' as const, bin: '433210', openFee: 5, customLastFourFee: 10, description: 'Visa card for ChatGPT subscription' },
    { network: 'VISA' as const, scenario: 'CLAUDE' as const, bin: '435760', openFee: 5, customLastFourFee: 10, description: 'Visa card for Claude subscription' },
    { network: 'MASTERCARD' as const, scenario: 'AMAZON' as const, bin: '559666', openFee: 5, customLastFourFee: 10, description: 'Mastercard for Amazon purchases' },
    { network: 'MASTERCARD' as const, scenario: 'CHATGPT' as const, bin: '552830', openFee: 5, customLastFourFee: 10, description: 'Mastercard for ChatGPT subscription' },
    { network: 'MASTERCARD' as const, scenario: 'CLAUDE' as const, bin: '556120', openFee: 5, customLastFourFee: 10, description: 'Mastercard for Claude subscription' },
  ]

  for (const config of configs) {
    await prisma.cardBinConfig.upsert({
      where: { network_scenario: { network: config.network, scenario: config.scenario } },
      update: config,
      create: config,
    })
  }

  console.log('Seed data created')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
