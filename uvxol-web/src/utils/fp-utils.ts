import { Monad1 } from 'fp-ts/lib/Monad';
import { HKT, URIS, Kind } from 'fp-ts/lib/HKT';

// UNSAFE
export const logid: <F extends URIS>(M: Monad1<F>) => <A>(fa: Kind<F, A>) => Kind<F, A> = M => fa => M.map(fa, v => { console.log(v); return v });
export const logval: <F extends URIS>(M: Monad1<F>) => <B>(b: B) => <A>(fa: Kind<F, A>) => Kind<F, A> = M => b => fa => M.map(fa, v => { console.log(b); return v });