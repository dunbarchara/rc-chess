export interface Config {
  port: number;
  isProd: boolean;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  return {
    port: Number(env.PORT ?? 3001),
    isProd: env.NODE_ENV === 'production',
  };
}
