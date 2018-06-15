/*!
 * Travis CI Client Library
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
import * as Url from 'url';
import {
    TravisHttp,
    JsonPayload,
    TravisRequestArg,
    TravisRequestDescription,
    TravisRoutesDescription,
    TravisAuthMessage,
    TravisConfig,
    FunctionObject
} from '.';

const DEFAULT_API_VERSION: string = '2.0.0';
const ARG: string = ':arg';
const ARG_CHAIN: string = `${ARG},${ARG}`;
const RX_ARG: RegExp = /(:[^\/]+|\*+)/g;
const RX_ARG_CHAIN: RegExp = new RegExp(`${ARG}\/${ARG}`, 'g');
const RX_ARG_CLEAN: RegExp = /[:?]+/g;
const RX_ARG_OPTIONAL: RegExp = /(\?|^\*+)$/;
const LEAF: any = Symbol('@leaf');

/**
 * Checks if a given argument is plain object
 *
 * @param {any} obj
 * @returns {boolean}
 */
export function isObject(obj: any): boolean {
    return obj !== null &&
        obj !== undefined &&
        Object.prototype.toString.call(obj) === '[object Object]';
}

/**
 * Change method name to be camelCase representation
 *
 * @param {string} name
 * @returns {string}
 */
export function toCamelCase(name: string): string {
    return name.split('_').map((part, i) =>
        i ? part.charAt(0).toUpperCase() + part.substr(1) : part
    ).join('');
}

/**
 * Builds a url for a given request route replacing all urls args
 * with the collected values.
 *
 * @access private
 * @param {TravisRequestDescription} request
 * @param {TravisRequestArg[]} args
 * @returns {string}
 */
function buildUrl(
    request: TravisRequestDescription,
    args: TravisRequestArg[]
): string {
    let uri = request.sourceUri;
    const expected = (uri.match(RX_ARG) || []);

    if (expected.length > args.length) {
        const missing = expected.slice(args.length)
            .filter(arg => !RX_ARG_OPTIONAL.test(arg))
            .map(name => name.replace(RX_ARG_CLEAN, ''));
        throw new TypeError(
            `Argument${missing.length > 1 ? 's': ''} "${missing.join(', ')
                }" expected, but was not given!`
        );
    }

    for (let i = 0, s = expected.length; i < s; i++) {
        const type = typeof args[i];

        if (!~['string', 'number'].indexOf(type)) {
            throw new TypeError(
                `Argument "${expected[i]}" expected to be of type string, ` +
                `but ${type} given!`
            );
        }

        uri = uri.replace(`${expected[i]}`, String(args[i]));
    }

    return uri;
}

/**
 * Builds routes cache from given API
 *
 * @access private
 * @param {object} api
 * @returns {TravisRoutesDescription}
 */
function buildRoutes(api: any): TravisRoutesDescription {
    return api.map((section: any) => section.routes)
        .reduce((curr: any[], next: any[]) => curr.concat(next), [])
        .map((route: any) => {
            const { uri, verb, scope } = route;
            const matchUri = uri.replace(RX_ARG, ARG);
            const ret: any = { uri: matchUri, verb, scope, sourceUri: uri };
            ret[LEAF] = true;
            return ret;
        }).reduce((map: any, route: any) => {
            const method = route.verb.toLowerCase();
            map[route.uri] = map[route.uri] || {};
            map[route.uri][method] = route;
            return map;
        }, {});
}

/**
 * Builds execution tree from a given routes
 *
 * @access private
 * @param routes
 * @returns void
 */
function buildRoutesTree(routes: TravisRoutesDescription): void {
    const tree: any = {};

    Object.keys(routes).map((route): [string[], TravisRequestDescription] => [
        route.replace(RX_ARG_CHAIN, ARG_CHAIN)
            .split('/').filter(name => name),
        routes[route]
    ]).forEach((route: [string[], TravisRequestDescription]) => {
        const [ paths, exec ] = route;
        let branch = tree;
        paths.forEach(name => {
            name = toCamelCase(name);
            branch[name] = branch[name] || {};
            branch = branch[name];
        });
        Object.assign(branch, exec);
    });

    walk.call(this, this, tree);
}

/**
 * Sets given name non-enumerable attribute to a given object
 *
 * @param {T} obj
 * @param {string} name
 * @returns {T}
 */
function setName<T>(obj: T, name: string): T {
    Object.defineProperty(obj, 'name', {
        configurable: true,
        enumerable: false,
        value: name
    });
    return obj;
}

/**
 * Walks execution tree and creates execution contexts
 *
 * @param {FunctionObject} context - context to match a given tree
 * @param {any} tree - related to context subtree
 * @param {TravisRequestArg[]} [userInput] - collected user inputs during
 *                                           context execution
 * @returns {FunctionObject}
 */
function walk(
    context: FunctionObject,
    tree: any,
    userInput: TravisRequestArg[] = []
): FunctionObject {
    Object.keys(tree).forEach(method => {
        if (context[method]) {
            return ;
        }

        else if (tree[method][LEAF]) {
            context[method] = setName<FunctionObject>(async (
                data?: JsonPayload
            ) => {
                const url = buildUrl(tree[method], userInput);
                return await this.agent.request(tree[method].verb, url, data);
            }, method);
            return ;
        }

        else if (method.charAt(0) === ':') {
            walk.call(this, context, tree[method], userInput);
            return ;
        }

        context[method] = setName<FunctionObject>((
            ...args: TravisRequestArg[]
        ) => {
            const key = new Array(args.length).fill(ARG).join(',');
            const newContext = setName(() => {}, method);

            if (context === this) {
                userInput = [];
            }

            userInput.push.apply(userInput, args);

            if (!key) {
                return walk.call(this, newContext, tree[method], userInput);
            }

            if (!tree[method][key]) {
                throw new Error('Invalid number of arguments given!');
            }

            return walk.call(this, newContext, tree[method][key], userInput);
        }, method);

        walk.call(this, context[method], tree[method], userInput);
    });

    return context;
}

/**
 * Loads REST API from a given version file
 *
 * @param {string} [version]
 * @returns {any}
 */
function loadApi(version: string = DEFAULT_API_VERSION) {
    return require(`../api/v${version}/routes.json`);
}

/**
 * Checks if given message is valid object
 *
 * @param {TravisAuthMessage} msg
 */
function validateMessage(msg: TravisAuthMessage) {
    if (!isObject(msg)) {
        throw new TypeError('Given message is not object');
    }
}

/**
 * Checks if access token is valid in a given message
 *
 * @access private
 * @param {TravisAuthMessage} msg
 * @returns {Promise<object>}
 */
async function authenticateAccessToken(msg: TravisAuthMessage) {
    validateMessage(msg);

    if (!msg.access_token) {
        throw new TypeError('Invalid access_token');
    }

    await this.agent.request('GET', '/users', msg);
    this.agent.setAccessToken(msg.access_token);

    return msg;
}

/**
 * Authenticates github token from a given message
 *
 * @access private
 * @param {object} msg
 * @returns {Promise<object>}
 */
async function authenticateGithubToken(msg: TravisAuthMessage) {
    validateMessage(msg);

    if (!msg.github_token) {
        throw new TypeError('Invalid github_token');
    }

    return await authenticateAccessToken.call(this,
        await this.auth.github.post(msg)
    );
}

/**
 * Class TravisClient
 * Implements TravisCI REST API calls for node.
 */
export class TravisClient implements FunctionObject {

    [name: string]: FunctionObject | any;

    public pro: boolean = false;
    public enterprise?: string | boolean;
    public travisApiUrl: string;
    public agent: TravisHttp;

    /**
     * @constructor
     * @param {TravisConfig} [config]
     */
    constructor(config?: TravisConfig) {
        let { pro, enterprise, version, headers }: TravisConfig = config || {};

        // noinspection PointlessBooleanExpressionJS
        this.pro = !!pro;
        this.enterprise = false;
        this.travisApiUrl = `https://api.travis-ci.${pro ? 'com' : 'org'}`;

        if (enterprise) {
            const url = Url.parse(String(enterprise));

            if (!url.protocol && url.host) {
                throw new TypeError(`Expected a valid URL, got ${enterprise}`);
            }

            this.travisApiUrl = `${url.protocol}//${url.host}/api`;
            this.enterprise = true;
        }

        this.agent = new TravisHttp(this.travisApiUrl, headers);
        buildRoutesTree.call(this, buildRoutes(loadApi(version)));
    }

    /**
     * Performs authentication using any of known methods:
     *  - using travis access token
     *  - using github oauth token
     *
     * @access public
     * @param {TravisAuthMessage} msg - one of access or github tokens mandatory
     * @returns {Promise<object>}
     */
    async authenticate(msg: TravisAuthMessage): Promise<any> {
        if (!isObject(msg)) {
            throw new TypeError(`Expected an object, but ${typeof msg} given!`);
        }

        if (msg.access_token) {
            return await authenticateAccessToken.call(this, msg);
        }

        else if (msg.github_token) {
            return await authenticateGithubToken.call(this, msg);
        }

        throw new Error('Unexpected arguments!');
    }

    /**
     * Checks if current travis instance has been authenticated already
     *
     * @returns {Promise<boolean>}
     */
    isAuthenticated(): boolean {
        return !!this.agent.getAccessToken();
    }
}
