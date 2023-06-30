import type { UserConfig } from './config';
export declare function loadEnv(mode: string, envDir: string, prefixes?: string | string[]): Record<string, string>;
export declare function resolveEnvPrefix({ envPrefix, }: UserConfig): string[];
