import {getPublicKeyFromKeyringPair} from '../misc';

/** TODO: A better approach is to declare objects for each key and sig type in custom_crypto.js and avoid passing
 * private keys since its better to avoid dealing with private keys and they might not be always available. However,
 * to save time now, its avoided.
 * Helper to get the key doc in a format needed for vc.js.
 * @param {string} did - DID in fully qualified form
 * @param {object} keypair - Either the keypair is part of the key doc or if the keys are extractable, they are extracted
 * and keypair is not made part of the key doc.
 * @param {string} typ - the type of key, Sr25519VerificationKey2020 or Ed25519VerificationKey2018 or EcdsaSecp256k1VerificationKey2019
 * @returns {{publicKeyBase58: *, controller: *, id: string, type: *, privateKeyBase58: (string|KeyObject|T2|Buffer|CryptoKey)}}
 */
export function getKeyDoc(did, keypair, typ) {
  return {
    id: `${did}#keys-1`,
    controller: did,
    type: typ,
    keypair: keypair,
    publicKey: getPublicKeyFromKeyringPair(keypair)
  };
}