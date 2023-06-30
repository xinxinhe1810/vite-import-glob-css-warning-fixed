import type { ViteDevServer } from '../server';
interface SSRContext {
    global: typeof globalThis;
}
type SSRModule = Record<string, any>;
export declare function ssrLoadModule(url: string, server: ViteDevServer, context?: SSRContext, urlStack?: string[], fixStacktrace?: boolean): Promise<SSRModule>;
export {};
