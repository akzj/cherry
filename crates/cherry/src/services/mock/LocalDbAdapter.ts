export class LocalDbAdapter<T> {
  private key: string;
  private serialize: (data: T) => string;
  private deserialize: (data: string) => T;

  constructor(
    key: string,
    serialize: (data: T) => string = JSON.stringify,
    deserialize: (data: string) => T = JSON.parse
  ) {
    this.key = key;
    this.serialize = serialize;
    this.deserialize = deserialize;
  }

  async read(): Promise<T | null> {
    const data = localStorage.getItem(this.key);
    return data ? this.deserialize(data) : null;
  }

  async write(data: T): Promise<void> {
    localStorage.setItem(this.key, this.serialize(data));
  }

  async reset(defaultValue: T) {
    await this.write(defaultValue);
  }
} 