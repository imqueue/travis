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
