#!/usr/bin/env node
import { TravisClient } from '..';

const version = '2.0.0';

function cast(arg: any) {
    const num = parseInt(arg, 10);

    if (isNaN(num) || String(Number(num)) !== arg) {
        return arg;
    }

    return num;
}

(async () => {
    const argv = process.argv.slice(2);
    const pro = !!~argv.indexOf('--pro');
    const subCommands = argv.filter(arg => arg.indexOf('--') !== 0);

    if (subCommands.length === 0) {
        throw new Error('No sub-command provided');
    }
    const args = argv.filter(arg => arg.indexOf('--') === 0 || arg === '--pro')
        .map(arg => {
            const [key, value] = arg.substr(2).split('=');
            return [key, cast(value)];
        })
        .reduce((prev: any, next: any) => {
            const [key, value] = next;
            prev[key] = value;
            return prev;
        }, {});

    const travis = new TravisClient({ version, pro });
    let func = travis;

    for (let subCommand of subCommands) {
        func = func[subCommand];

        if (func === undefined || func === null) {
            throw new Error(subCommand + ' not found');
        }
    }

    try {
        const res = await func.call(travis, args);
        console.log(JSON.stringify(res, null, 4));
    }

    catch (err) {
        console.error(`${err.constructor.name}: ${err.message}`);
    }
})();
