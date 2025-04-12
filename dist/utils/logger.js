const colorCodes = {
    default: '\x1b[39m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
};
const reset = '\x1b[0m';
function logger(...args) {
    let color = 'default';
    let logArgs = args;
    if (typeof args[0] === 'string' && args[0] in colorCodes) {
        color = args[0];
        logArgs = args.slice(1);
    }
    const colorCode = colorCodes[color];
    process.stdout.write(colorCode);
    for (const arg of logArgs) {
        console.dir(arg, { depth: null, colors: !['string', 'number'].includes(typeof arg) });
    }
    process.stdout.write(reset + '');
}
export default logger;
//# sourceMappingURL=logger.js.map