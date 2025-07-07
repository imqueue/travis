/*!
 * Travis CI Client Library Unit Tests: TravisClient
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
import { config as setupEnvironment } from 'dotenv';

setupEnvironment();

import * as sinon from 'sinon';
import { TravisClient, TravisHttpError } from '../..';

const { expect } = require('chai').use(require('chai-as-promised'));

console.log('hello check:', process.env.HELLO_CHECK);

describe('TravisClient', function() {
    const version = '2.0.0';

    this.timeout(30000);

    it('should be a class', () => {
        expect(TravisClient).to.be.a.constructor;
    });

    describe('constructor()', () => {
        it('should not throw', () => {
            expect(() => new TravisClient()).not.to.throw;
        });
        it('should throw if wrong API version given', () => {
            expect(() => new TravisClient({ version: 'xxx' })).throws;
        });
        it('should be pro mode if enabled', () => {
            const travis = new TravisClient({ pro: true });
            expect(travis.pro).to.be.true;
            expect(travis.travisApiUrl).matches(/.com$/);
        });
        it('should throw if wrong enterprise URL given', () => {
            expect(() => new TravisClient({ enterprise: 'xxx' })).throws;
        });
        it('should enable enterprise mode if valid url given', () => {
            const enterprise = 'https://rest.example.com';
            const travis = new TravisClient({ enterprise });
            expect(travis.enterprise).to.be.true;
            expect(travis.travisApiUrl).contains(enterprise);
        });
    });

    describe('authenticate()', () => {
        it('should be exposed', () => {
            expect(typeof new TravisClient().authenticate).equals('function');
        });
        it('should throw if non-object argument given', () => {
            const travis: any = new TravisClient();
            // noinspection TypeScriptValidateJSTypes
            expect(travis.authenticate()).to.be.rejectedWith(TypeError);
            expect(travis.authenticate([])).to.be.rejectedWith(TypeError);
            expect(travis.authenticate('')).to.be.rejectedWith(TypeError);
            expect(travis.authenticate(()=>{})).to.be.rejectedWith(TypeError);
            // noinspection TypeScriptValidateJSTypes
            expect(travis.authenticate(null)).to.be.rejectedWith(TypeError);
            expect(travis.authenticate(true)).to.be.rejectedWith(TypeError);
            expect(travis.authenticate(false)).to.be.rejectedWith(TypeError);
            expect(travis.authenticate(666)).to.be.rejectedWith(TypeError);
        });
        it('should throw if wrong object provided', () => {
            const travis = new TravisClient();
            expect(travis.authenticate({})).to.be.rejectedWith(Error);
            expect(travis.authenticate({ a: 'b' })).to.be.rejectedWith(Error);
        });
        it('should authenticate using valid github oauth token', async () => {
            try {
                await new TravisClient().authenticate({
                    github_token: process.env.GITHUB_OAUTH_TOKEN
                });
            }

            catch (err) {
                console.error(err);
                throw err;
            }
        });
        it('should authenticate using valid access token', async () => {
            await delay(1000);
            const travis = new TravisClient();
            const { access_token } = await travis.authenticate({
                github_token: process.env.GITHUB_OAUTH_TOKEN
            });
            await delay(1000);
            await new TravisClient().authenticate({ access_token });
        });
    });

    describe('isAuthenticated()', () => {
        it('should be exposed', () => {
            expect(typeof new TravisClient().isAuthenticated)
                .equals('function');
        });
        it('should return false if not authenticated client', () => {
            expect(new TravisClient().isAuthenticated()).to.be.false;
        });
        it('should return true if client authenticated', async () => {
            await delay(1000);
            const travis = new TravisClient();
            await travis.authenticate({
                github_token: process.env.GITHUB_OAUTH_TOKEN
            });
            expect(travis.isAuthenticated()).to.be.true;
        });
    });



    getChains(version).forEach(({ uri, chain }) => {
        describe(`endpoint ${uri}`, () => {
            const travis = new TravisClient({version});

            it(`should expose props chain`, () => {
                let context = travis;
                Object.keys(chain).forEach((name: string) => {
                    expect(typeof context[name]).not.to.be.undefined;
                    context = context[name];
                });
            });

            it(`should expose calls chain`, () => {
                let context = travis;
                Object.keys(chain).forEach((name: string) => {
                    // noinspection JSIncompatibleTypesComparison
                    if (chain[name] === null) {
                        return;
                    }

                    const newContext = context[name].apply(
                        context[name], chain[name]
                    );

                    context = context[name];

                    expect(newContext.name).equals(context.name);
                });
            });

            it('should throw if invalid number of args given', () => {
                let context = travis;
                Object.keys(chain).forEach((name: string) => {
                    // noinspection JSIncompatibleTypesComparison
                    if (chain[name] === null) {
                        return;
                    }

                    expect(() => context[name].apply(
                        context[name], [chain[name]]
                    )).throws;

                    context = context[name];
                });
            });

            it(`should call remote properly`, async () => {
                const RX_ARG = /(:[^\/]+|\*+)/g;
                let context = travis;
                let names = Object.keys(chain);
                let i = 0;
                let name = names[i];

                const stub = sinon.stub(travis.agent, 'request')
                    .callsFake(async () => ({}));

                // fill chain
                while (context) {
                    // noinspection JSIncompatibleTypesComparison
                    if (chain[name] === null) {
                        break;
                    }

                    let args = chain[name].map(a => a.replace(RX_ARG, '-test'));

                    context = context[name].apply(context[name], args);
                    name = names[++i];
                }

                const callData = { fake: name };

                await (context[name] as any)(callData);

                const [ callMethod, callUri ] = [
                    name.toUpperCase(),
                    uri.replace(RX_ARG, '-test')
                ];

                expect(stub.lastCall.args).deep.equals([
                    callMethod, callUri, callData
                ]);

                stub.restore();
            });

            it('should call remote and handle', async () => {
                const RX_ARG = /(:[^\/]+|\*+)/g;
                let context = travis;
                let names = Object.keys(chain);
                let i = 0;
                let name = names[i];

                // fill chain
                while (context) {
                    // noinspection JSIncompatibleTypesComparison
                    if (chain[name] === null) {
                        break;
                    }

                    let args = chain[name].map(a => a.replace(RX_ARG, '-test'));

                    context = context[name].apply(context[name], args);
                    name = names[++i];
                }

                const callData = { fake: name };

                try {
                    // it should normally process
                    await (context[name] as any)(callData);
                }

                catch (err) {
                    // or fail with Travis http error response
                    expect(err).instanceOf(TravisHttpError);
                }
            });
        });
    });
});

// helpers:

function toCamelCase(name: string): string {
    return name.split('_').map((part, i) =>
        i ? part.charAt(0).toUpperCase() + part.substr(1) : part
    ).join('');
}

function getChains(
    version: string
): Array<{ uri: string, chain: { [name: string]: string[] }}> {
    // noinspection TypeScriptUnresolvedVariable
    return require(`../../api/v${version}/routes.json`)
        .filter((section: any) => section.prefix !== '/error')
        .map((section: any) => section.routes)
        .reduce((prev: any, next: any) => prev.concat(next), [])
        .map((route: { uri: string, verb: string }) => {
            const { uri, verb }: any = route;
            const chain: any = {};
            let last: any;
            uri.split('/').forEach((name: string) => {
                if (!name) return;
                name = toCamelCase(name);
                const isArg = ~[':', '*'].indexOf(name.charAt(0));
                if (isArg) {
                    chain[last] = chain[last] || [];
                    chain[last].push(name);
                } else {
                    last = name;
                    chain[name] = chain[name] || [];
                }
            });
            const method = verb.toLowerCase();
            chain[method] = chain[method] || null;
            return { uri, chain };
        });
}

async function delay(ms: number): Promise<void> {
    await new Promise<void>(resolve => setTimeout(resolve, ms));
}
