/// <reference types="node" />
import type * as http from 'node:http';
import type { Connect } from 'dep-types/connect';
import type { ResolvedServerOptions, ResolvedServerUrls } from './server';
import type { CommonServerOptions } from './http';
import type { InlineConfig, ResolvedConfig } from '.';
export interface PreviewOptions extends CommonServerOptions {
}
export interface ResolvedPreviewOptions extends PreviewOptions {
}
export declare function resolvePreviewOptions(preview: PreviewOptions | undefined, server: ResolvedServerOptions): ResolvedPreviewOptions;
export interface PreviewServerForHook {
    /**
     * The resolved vite config object
     */
    config: ResolvedConfig;
    /**
     * A connect app instance.
     * - Can be used to attach custom middlewares to the preview server.
     * - Can also be used as the handler function of a custom http server
     *   or as a middleware in any connect-style Node.js frameworks
     *
     * https://github.com/senchalabs/connect#use-middleware
     */
    middlewares: Connect.Server;
    /**
     * native Node http server instance
     */
    httpServer: http.Server;
    /**
     * The resolved urls Vite prints on the CLI
     */
    resolvedUrls: ResolvedServerUrls | null;
    /**
     * Print server urls
     */
    printUrls(): void;
}
export interface PreviewServer extends PreviewServerForHook {
    resolvedUrls: ResolvedServerUrls;
}
export type PreviewServerHook = (this: void, server: PreviewServerForHook) => (() => void) | void | Promise<(() => void) | void>;
/**
 * Starts the Vite server in preview mode, to simulate a production deployment
 */
export declare function preview(inlineConfig?: InlineConfig): Promise<PreviewServer>;
