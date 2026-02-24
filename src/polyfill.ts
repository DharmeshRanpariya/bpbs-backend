import { webcrypto } from 'crypto';

if (!(globalThis as any).crypto) {
    (globalThis as any).crypto = webcrypto;
}