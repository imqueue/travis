#!/usr/bin/env node
/*!
 * Travis CI Client Library: Command Line Interface
 *
 * Copyright (c) 2018, imqueue.com <support@imqueue.com>
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
 * REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
 * AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 * INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
 * LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
 * OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
 * PERFORMANCE OF THIS SOFTWARE.
 */
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
