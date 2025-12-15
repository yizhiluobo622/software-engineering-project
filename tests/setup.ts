import nodeCrypto from 'node:crypto'
import { indexedDB as FDBIndexedDB, IDBKeyRange as FDBIDBKeyRange } from 'fake-indexeddb'

const hasRootCrypto = typeof globalThis.crypto !== 'undefined'
const hasGetRandomValues = hasRootCrypto && typeof (globalThis.crypto as any).getRandomValues === 'function'

if (!hasGetRandomValues) {
  const webcrypto = (nodeCrypto as any).webcrypto
  if (webcrypto && typeof webcrypto.getRandomValues === 'function') {
    const grv = webcrypto.getRandomValues.bind(webcrypto)
    // attach to global crypto
    // create a minimal crypto object if missing
    // @ts-ignore
    globalThis.crypto = { ...(globalThis.crypto || {}), getRandomValues: grv }
  }
}

// provide IndexedDB in test env
// @ts-ignore
if (typeof globalThis.indexedDB === 'undefined') {
  // @ts-ignore
  globalThis.indexedDB = FDBIndexedDB
  // @ts-ignore
  globalThis.IDBKeyRange = FDBIDBKeyRange
}
