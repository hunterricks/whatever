import { Crypto } from '@peculiar/webcrypto';

declare global {
  var crypto: Crypto;
}

