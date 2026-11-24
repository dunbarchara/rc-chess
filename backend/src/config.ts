import { join } from 'node:path';

export interface Config {
  port: number;
  isProd: boolean;
  rustEngineBin: string;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  return {
    port: Number(env.PORT ?? 3001),
    isProd: env.NODE_ENV === 'production',
    // Build with: cargo build --release --manifest-path friendlymatthew/chess/Cargo.toml
    rustEngineBin:
      env.RUST_ENGINE_BIN ?? join(import.meta.dirname, '../../friendlymatthew/chess/target/release/chess'),
  };
}
