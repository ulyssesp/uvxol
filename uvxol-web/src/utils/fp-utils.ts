import { Monad1 } from 'fp-ts/lib/Monad';
import { HKT, URIS, Kind } from 'fp-ts/lib/HKT';

// UNSAFE
export const logid: <F extends URIS>(M: Monad1<F>, text: string) => <A>(fa: Kind<F, A>) => Kind<F, A> = (M, text) => fa => M.map(fa, v => { console.log(text + v); return v });
export const logval: <F extends URIS>(M: Monad1<F>, text: string) => <B>(b: B) => <A>(fa: Kind<F, A>) => Kind<F, A> = (M, text) => b => fa => M.map(fa, v => { console.log(text + b); return v });