/*!
 * Travis CI Client Library
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

        headers.Accept = 'application/vnd.travis-ci.2.1+json';

        if (this.getAccessToken()) {
            headers.Authorization = `token "${ this.getAccessToken() }"`;
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
