let _key: CryptoKey | null = null;

export function setKey(key: CryptoKey): void {
  _key = key;
}

export function getKey(): CryptoKey | null {
  return _key;
}

export function clearKey(): void {
  _key = null;
}
