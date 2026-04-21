/** SSR-safe stub — real @cofhe/sdk loads in the browser bundle only. */

export const FheTypes = {
  Uint64: 0,
  Bool: 1,
};

export const Encryptable = {
  uint64: (value: bigint) => ({ value }),
};

export class CofheClient {}
