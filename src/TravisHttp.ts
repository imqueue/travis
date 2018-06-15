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
import * as request from 'request';
import {
    TravisHttpError,
    HttpMethod,
    HttpHeaders,
    JsonPayload,
    promisify
} from '.';

/**
 * Class TravisHttp - basic HTTP connection driver for travis REST API calls
 */
export class TravisHttp {

    private accessToken: string;

    /**
     * @constructor
     * @param {string} endpoint
     * @param {HttpHeaders} headers
     */
    constructor(
        private endpoint: string,
        private headers?: HttpHeaders
    ) {
        this.headers = headers ? JSON.parse(JSON.stringify(headers)) : {};
    }

    /**
     * Returns current instance HTTP headers used within HTTP requests
     *
     * @returns {HttpRequest}
     */
    public getHeaders(): HttpHeaders {
        const headers: HttpHeaders = JSON.parse(JSON.stringify(this.headers));

        headers.Accept = 'application/vnd.travis-ci.2+json, */*; q=0.01';

        if (this.getAccessToken()) {
            headers.Authorization = `token ${this.getAccessToken()}`;
        }

        return headers;
    }

    /**
     * Sends request using given HTTP method, to a given endpoint path,
     * sending data payload if provided
     *
     * @param {HttpMethod} method
     * @param {string} path
     * @param {JsonPayload | Buffer} [data]
     * @returns {Promise<>}
     */
    public async request(
        method: HttpMethod,
        path: string,
        data?: JsonPayload | Buffer
    ): Promise<JsonPayload> {
        const url: string = this.endpoint + path;
        const headers: HttpHeaders = this.getHeaders();
        const options: request.Options = { method, url, headers };

        if (data instanceof Buffer) {
            options.body = data;
        }

        else {
            options.json = data || true;
        }

        const res = await promisify<request.Response>(request)(options);
        const isJSON = res.headers['content-type'] === 'application/json';

        if (isJSON && !options.json) {
            res.body = JSON.parse(res.body);
        }

        if (res.statusCode !== 200) {
            throw new TravisHttpError(res.body
                ? (typeof res.body === 'string'
                    ? res.body.trim()
                    : JSON.stringify(res.body))
                : res.statusMessage,
                res.statusCode, res.headers, res.body, url
            );
        }

        return res.body;
    }

    /**
     * Sets authorization access token for this instance
     *
     * @param {string} accessToken
     * @returns {TravisHttp}
     */
    public setAccessToken(accessToken: string): TravisHttp {
        this.accessToken = accessToken;
        return this;
    }

    /**
     * Returns current authorization access token associated with this instance.
     *
     * @returns {string}
     */
    public getAccessToken(): string {
        return this.accessToken;
    }

}
