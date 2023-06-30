/// <reference types="node" />
import type * as http from 'node:http';
import type { FSWatcher, WatchOptions } from 'dep-types/chokidar';
import type { Connect } from 'dep-types/connect';
import type { SourceMap } from 'rollup';
import type { Matcher } from 'picomatch';
import type { CommonServerOptions } from '../http';
import type { InlineConfig, ResolvedConfig } from '../config';
import type { Logger } from '../logger';
import type { PluginContainer } from './pluginContainer';
import type { WebSocketServer } from './ws';
import type { ModuleNode } from './moduleGraph';
import { ModuleGraph } from './moduleGraph';
import type { HmrOptions } from './hmr';
import type { TransformOptions, TransformResult } from './transformRequest';
export interface ServerOptions extends CommonServerOptions {
    /**
     * Configure HMR-specific options (port, host, path & protocol)
     */
    hmr?: HmrOptions | boolean;
    /**
     * chokidar watch options
     * https://github.com/paulmillr/chokidar#api
     */
    watch?: WatchOptions;
    /**
     * Create Vite dev server to be used as a middleware in an existing server
     * @default false
     */
    middlewareMode?: boolean | 'html' | 'ssr';
    /**
     * Options for files served via '/\@fs/'.
     */
    fs?: FileSystemServeOptions;
    /**
     * Origin for the generated asset URLs.
     *
     * @example `http://127.0.0.1:8080`
     */
    origin?: string;
    /**
     * Pre-transform known direct imports
     * @default true
     */
    preTransformRequests?: boolean;
    /**
     * Whether or not to ignore-list source files in the dev server sourcemap, used to populate
     * the [`x_google_ignoreList` source map extension](https://developer.chrome.com/blog/devtools-better-angular-debugging/#the-x_google_ignorelist-source-map-extension).
     *
     * By default, it excludes all paths containing `node_modules`. You can pass `false` to
     * disable this behavior, or, for full control, a function that takes the source path and
     * sourcemap path and returns whether to ignore the source path.
     */
    sourcemapIgnoreList?: false | ((sourcePath: string, sourcemapPath: string) => boolean);
    /**
     * Force dep pre-optimization regardless of whether deps have changed.
     *
     * @deprecated Use optimizeDeps.force instead, this option may be removed
     * in a future minor version without following semver
     */
    force?: boolean;
}
export interface ResolvedServerOptions extends ServerOptions {
    fs: Required<FileSystemServeOptions>;
    middlewareMode: boolean;
    sourcemapIgnoreList: Exclude<ServerOptions['sourcemapIgnoreList'], false | undefined>;
}
export interface FileSystemServeOptions {
    /**
     * Strictly restrict file accessing outside of allowing paths.
     *
     * Set to `false` to disable the warning
     *
     * @default true
     */
    strict?: boolean;
    /**
     * Restrict accessing files outside the allowed directories.
     *
     * Accepts absolute path or a path relative to project root.
     * Will try to search up for workspace root by default.
     */
    allow?: string[];
    /**
     * Restrict accessing files that matches the patterns.
     *
     * This will have higher priority than `allow`.
     * picomatch patterns are supported.
     *
     * @default ['.env', '.env.*', '*.crt', '*.pem']
     */
    deny?: string[];
}
export type ServerHook = (this: void, server: ViteDevServer) => (() => void) | void | Promise<(() => void) | void>;
export interface ViteDevServer {
    /**
     * The resolved vite config object
     */
    config: ResolvedConfig;
    /**
     * A connect app instance.
     * - Can be used to attach custom middlewares to the dev server.
     * - Can also be used as the handler function of a custom http server
     *   or as a middleware in any connect-style Node.js frameworks
     *
     * https://github.com/senchalabs/connect#use-middleware
     */
    middlewares: Connect.Server;
    /**
     * native Node http server instance
     * will be null in middleware mode
     */
    httpServer: http.Server | null;
    /**
     * chokidar watcher instance
     * https://github.com/paulmillr/chokidar#api
     */
    watcher: FSWatcher;
    /**
     * web socket server with `send(payload)` method
     */
    ws: WebSocketServer;
    /**
     * Rollup plugin container that can run plugin hooks on a given file
     */
    pluginContainer: PluginContainer;
    /**
     * Module graph that tracks the import relationships, url to file mapping
     * and hmr state.
     */
    moduleGraph: ModuleGraph;
    /**
     * The resolved urls Vite prints on the CLI. null in middleware mode or
     * before `server.listen` is called.
     */
    resolvedUrls: ResolvedServerUrls | null;
    /**
     * Programmatically resolve, load and transform a URL and get the result
     * without going through the http request pipeline.
     */
    transformRequest(url: string, options?: TransformOptions): Promise<TransformResult | null>;
    /**
     * Apply vite built-in HTML transforms and any plugin HTML transforms.
     */
    transformIndexHtml(url: string, html: string, originalUrl?: string): Promise<string>;
    /**
     * Transform module code into SSR format.
     */
    ssrTransform(code: string, inMap: SourceMap | null, url: string, originalCode?: string): Promise<TransformResult | null>;
    /**
     * Load a given URL as an instantiated module for SSR.
     */
    ssrLoadModule(url: string, opts?: {
        fixStacktrace?: boolean;
    }): Promise<Record<string, any>>;
    /**
     * Returns a fixed version of the given stack
     */
    ssrRewriteStacktrace(stack: string): string;
    /**
     * Mutates the given SSR error by rewriting the stacktrace
     */
    ssrFixStacktrace(e: Error): void;
    /**
     * Triggers HMR for a module in the module graph. You can use the `server.moduleGraph`
     * API to retrieve the module to be reloaded. If `hmr` is false, this is a no-op.
     */
    reloadModule(module: ModuleNode): Promise<void>;
    /**
     * Start the server.
     */
    listen(port?: number, isRestart?: boolean): Promise<ViteDevServer>;
    /**
     * Stop the server.
     */
    close(): Promise<void>;
    /**
     * Print server urls
     */
    printUrls(): void;
    /**
     * Restart the server.
     *
     * @param forceOptimize - force the optimizer to re-bundle, same as --force cli flag
     */
    restart(forceOptimize?: boolean): Promise<void>;
    /**
     * Open browser
     */
    openBrowser(): void;
    /**
     * @internal
     */
    _importGlobMap: Map<string, string[][]>;
    /**
     * Deps that are externalized
     * @internal
     */
    _ssrExternals: string[] | null;
    /**
     * @internal
     */
    _restartPromise: Promise<void> | null;
    /**
     * @internal
     */
    _forceOptimizeOnRestart: boolean;
    /**
     * @internal
     */
    _pendingRequests: Map<string, {
        request: Promise<TransformResult | null>;
        timestamp: number;
        abort: () => void;
    }>;
    /**
     * @internal
     */
    _fsDenyGlob: Matcher;
    /**
     * @internal
     * Actually BindShortcutsOptions | undefined but api-extractor checks for
     * export before trimming internal types :(
     * And I don't want to add complexity to prePatchTypes for that
     */
    _shortcutsOptions: any | undefined;
}
export interface ResolvedServerUrls {
    local: string[];
    network: string[];
}
export declare function createServer(inlineConfig?: InlineConfig): Promise<ViteDevServer>;
export declare function _createServer(inlineConfig: InlineConfig | undefined, options: {
    ws: boolean;
}): Promise<ViteDevServer>;
export declare function resolveServerOptions(root: string, raw: ServerOptions | undefined, logger: Logger): ResolvedServerOptions;