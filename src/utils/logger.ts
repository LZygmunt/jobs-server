type LoggerColor = keyof typeof colorCodes

const colorCodes = {
  default: '\x1b[39m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
} as const

const reset = '\x1b[0m'


function logger(color: LoggerColor, ...args: unknown[]): void
function logger(...args: unknown[]): void
function logger(...args: unknown[]): void {
  let color: LoggerColor = 'default'
  let logArgs: unknown[] = args

  if (typeof args[0] === 'string' && args[0] in colorCodes) {
    color = args[0] as LoggerColor
    logArgs = args.slice(1)
  }

  const colorCode = colorCodes[color]
  process.stdout.write(colorCode)
  for (const arg of logArgs) {
    console.dir(arg, { depth: null, colors: !['string', 'number'].includes(typeof arg)})
  }
  process.stdout.write(reset + '')
}

export default logger