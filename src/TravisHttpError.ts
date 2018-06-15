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
import { HttpHeaders } from '.';

/**
 * Class TravisHttpError - Handles HTTP Error responses from Travis REST API
 */
export class TravisHttpError extends Error {

    /**
     * @constructor
     * @param {string} message
     * @param {number} code
     * @param {HttpHeaders} headers
     * @param {any} body
     * @param {string} url
     */
    constructor(
        public message: string = '',
        public code: number = 500,
        public headers: HttpHeaders = {},
        public body: any = {},
        public url: string = ''
    ) {
        super(message);
        const stack: string = this.stack || '';
        this.stack = `${this.constructor.name} ${this.code}: ${this.message}\n${
            stack.split('\n').slice(1).join('\n')}`;
    }

}
