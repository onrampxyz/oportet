import { type Chain, http, createClient } from 'viem'
import { getCapabilities } from 'viem/actions'
import { readFile, writeFile } from 'node:fs/promises'
import * as Chains from 'viem/chains'
import * as OportetChains from '../src/core/Chains.js'
import { relayUrls } from '../src/core/Transport.js'

// TODO: Update wagmi.config.ts
console.log('Fetching chains for environments.')

// Each environment reads the relay its dialog talks to (the `relay` transport
// in `apps/~internal/lib/PortoConfig.ts`).
const environments = [
  {
    name: 'prod',
    rpc: relayUrls.prod.http,
    transportOverrides: {},
  },
  {
    name: 'stg',
    rpc: relayUrls.stg.http,
    transportOverrides: {},
  },
] as const satisfies readonly {
  name: 'prod' | 'stg'
  rpc: string
  transportOverrides: Partial<Record<keyof typeof Chains, string>>
}[]

const configPath = './apps/~internal/lib/PortoConfig.ts'
// Chains kept out of the dialog's PortoConfig even when an environment's relay
// serves them. Rise's stg relay still serves Sepolia; our relay
// (relay.onramp.xyz) does not. Only PortoConfig is filtered: the SDK's
// generated chain exports and the docs table list what the prod relay serves.
const pausedInDialog = new Set<string>(['sepolia'])
const chainsSet = new Set<string>([])
// Chains viem does not define yet, resolved from `src/core/Chains.ts` instead.
const oportetSlugs = new Set<string>()
const chainNames = new Map<string, string>()
const viemChains = Object.entries(Chains)
// The namespace also exports `all` (an array) and `isAnvil`; keep chains only.
const oportetChains = Object.entries<unknown>(OportetChains).filter(
  (entry): entry is [string, Chain] =>
    typeof entry[1] === 'object' && entry[1] !== null && 'id' in entry[1],
)
for (const environment of environments) {
  console.log(`\n${environment.name} — ${environment.rpc}`)

  const client = createClient({
    transport: http(environment.rpc),
  })

  const capabilities = await getCapabilities(client)
  const supportedChainIds = Object.keys(capabilities).map(Number)

  let supportedChains: string[] = []
  for (const chainId of supportedChainIds) {
    const viemEntry = viemChains.find(([, chain]) => chain.id === chainId)
    const entry =
      viemEntry ?? oportetChains.find(([, chain]) => chain.id === chainId)
    if (!entry) {
      console.warn(
        `No chain found for id ${chainId}. Add it to viem or src/core/Chains.ts.`,
      )
      continue
    }
    const [slug, chain] = entry
    chainNames.set(slug, chain.name)
    if (!viemEntry) oportetSlugs.add(slug)
    supportedChains.push(slug)
    if (viemEntry && !pausedInDialog.has(slug)) chainsSet.add(slug)
  }
  supportedChains = supportedChains.toSorted()
  const dialogChains = supportedChains.filter(
    (slug) => !pausedInDialog.has(slug),
  )

  console.log(
    `Found ${supportedChains.length} chains\n${supportedChains.map((v, i) => `${i + 1}. ${v}`).join('\n')}`,
  )

  console.log(`Updating ${configPath}`)
  const file = await readFile(configPath, 'utf8')
  let content = replaceChainsByEnvironment(file, environment.name, dialogChains)
  content = replaceTransportsByEnvironment(
    content,
    environment.name,
    dialogChains,
    environment.transportOverrides,
  )
  await writeFile(configPath, content)

  if (environment.name === 'prod') {
    const chainsPath = './src/core/internal/_generated/chains.ts'
    console.log(`Updating ${chainsPath}`)
    // ponytail: oportet's own chains are exported by src/core/Chains.ts, so the
    // generated file (and with it `Chains.all`) leaves them out. Add them to
    // `Chains.all` by hand when the SDK should default to them.
    const content = exportChains(
      supportedChains.filter((slug) => !oportetSlugs.has(slug)),
    )
    await writeFile(chainsPath, content)

    const docsPath = './apps/docs/pages/sdk/api/chains.mdx'
    console.log(`Updating ${docsPath}`)
    const docsFile = await readFile(docsPath, 'utf8')
    const docsContent = replaceChainsSupportedTable(docsFile, supportedChains)
    await writeFile(docsPath, docsContent)
  }
}

console.log(`\nUpdating imports ${configPath}`)
const file = await readFile(configPath, 'utf8')
const content = replaceChainsForViemChainsImport(
  file,
  [...chainsSet.values()].toSorted(),
)
await writeFile(configPath, content)

console.log('\nDone.')

////////////////////////////////////////////////////////////////////////////////////

// How PortoConfig names a chain: viem chains through its `viem/chains` import,
// oportet's own through its `Chains` import from `oportet`.
function ref(slug: string) {
  return oportetSlugs.has(slug) ? `Chains.${slug}` : slug
}

function replaceChainsByEnvironment(
  content: string,
  environment: 'prod' | 'stg',
  newChains: string[],
) {
  const pattern = new RegExp(
    `(\\b${environment}\\s*:\\s*\\{[^}]*?chains:\\s*\\[)[\\s\\S]*?(\\][^}]*?\\})`,
    'g',
  )

  return content.replace(pattern, (_match, start, end) => {
    const baseIndent = '    '
    const chainIndent = '      '
    const chainsList = newChains
      .map((chain) => `${chainIndent}${ref(chain)},`)
      .join('\n')
    return `${start}\n${chainsList}\n${baseIndent}${end}`
  })
}

function replaceTransportsByEnvironment(
  content: string,
  environment: 'prod' | 'stg',
  newChains: string[],
  transportOverrides: Record<string, string>,
): string {
  const pattern = new RegExp(
    `(${environment}:\\s*\\{[\\s\\S]*?transports:\\s*\\{)[\\s\\S]*?(\\}[\\s\\S]*?\\})`,
    'g',
  )

  return content.replace(pattern, (_match, start, end) => {
    const baseIndent = '      '
    const transportsList = newChains
      .map((chain) => {
        const chainId = `${ref(chain)}.id`
        const rpcUrl = transportOverrides[chain]
        const transport = rpcUrl
          ? rpcUrl.startsWith('http')
            ? `http('${rpcUrl}')`
            : `http(${rpcUrl})`
          : 'http()'
        return `${baseIndent}[${chainId}]: ${transport},`
      })
      .join('\n')
    return `${start}\n${transportsList}\n    ${end}`
  })
}

function replaceChainsForViemChainsImport(
  content: string,
  newChains: string[],
) {
  const pattern = /import\s*\{[^}]*\}\s*from\s+['"]viem\/chains['"]/g

  return content.replace(pattern, () => {
    const indent = '  '
    // One `name,` line per chain, so an empty list still leaves a valid import.
    const chainsList = newChains.map((chain) => `${indent}${chain},\n`).join('')
    return `import {\n${chainsList}} from 'viem/chains'`
  })
}

function exportChains(chains: string[]) {
  return [
    '// Generated by `pnpm gen:chains`',
    'export {',
    ...chains.map((chain) => `  ${chain},`),
    `} from 'viem/chains'`,
  ].join('\n')
}

function replaceChainsSupportedTable(content: string, newChains: string[]) {
  const pattern =
    /(\|\s*Chain\s*\|\s*Value\s*\|\s*\n\|\s*-+\s*\|\s*-+\s*\|\s*\n)([\s\S]*?)(?=\n\n|\n(?=##))/

  return content.replace(pattern, (_match, tableHeader) => {
    const rows = newChains
      .map((chain) => `| ${chainNames.get(chain)} | \`Chains.${chain}\` |`)
      .join('\n')

    return `${tableHeader}${rows}`
  })
}
