/*!
 * Travis CI Client Library Unit Tests: TravisHttp
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
import { expect } from 'chai';
import { TravisHttp, TravisHttpError } from '../..';

describe('TravisHttp', () => {
    it('should be a class', () => {
        expect(TravisHttp).to.be.a.constructor;
    });
});

describe('TravisHttpError', () => {
    it('should be a class', () => {
        expect(TravisHttpError).to.be.a.constructor;
    });
    describe('constructor()', () => {
        it('should not throw', () => {
            expect(() => new TravisHttpError()).not.to.throw;
        });
        it('should allow no arguments properly', () => {
            const err = new TravisHttpError();
            expect(err.message).not.to.be.ok;
            expect(err.code).equals(500);
            expect(err.headers).deep.equals({});
            expect(err.body).deep.equals({});
            expect(err.url).equals('');
        });
        it('should accept message argument properly', () => {
            const errMsg = 'Test error';
            const err = new TravisHttpError(errMsg);
            expect(err.message).equals(errMsg);
        });
        it('should accept code argument properly', () => {
            const err = new TravisHttpError('test', 300);
            expect(err.code).equals(300);
        });
        it('should accept headers argument properly', () => {
            const err = new TravisHttpError('test', 300, { a: 'b' });
            expect(err.headers).deep.equals({ a: 'b' });
        });
        it('should accept body argument properly', () => {
            const err = new TravisHttpError('test', 300, {}, { a: 'b' });
            expect(err.body).deep.equals({ a: 'b' });
        });
        it('should accept url argument properly', () => {
            const err = new TravisHttpError('test', 300, {}, {}, 'http://a');
            expect(err.url).equals('http://a');
        });
    });
});
