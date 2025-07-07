#!/usr/bin/env node
/*!
 * Travis CI Client Library: Command Line Interface
 *
 * I'm Queue Software Project
 * Copyright (C) 2025  imqueue.com <support@imqueue.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 * If you want to use this code in a closed source (commercial) project, you can
 * purchase a proprietary commercial license. Please contact us at
 * <support@imqueue.com> to get commercial licensing options.
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
