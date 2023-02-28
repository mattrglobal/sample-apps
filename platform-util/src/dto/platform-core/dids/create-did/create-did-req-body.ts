export interface CreateDidReqBody {
  method: 'key' | 'web' | 'ion';
  options: {
    keyType?: 'ed25519' | 'bls12381g2' | string;
    url?: 'mattr.global' | string;
  };
}
