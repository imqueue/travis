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
