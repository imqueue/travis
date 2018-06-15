/*!
 * Travis CI Client Library Unit Tests: TravisHttp
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
