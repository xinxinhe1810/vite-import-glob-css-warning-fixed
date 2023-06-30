import type { NormalizedOutputOptions, PluginContext, RenderedChunk } from 'rollup';
import MagicString from 'magic-string';
import type { Plugin } from '../plugin';
import type { ResolvedConfig } from '../config';
export declare const assetUrlRE: RegExp;
export declare const urlRE: RegExp;
export interface GeneratedAssetMeta {
    originalName: string;
    isEntry?: boolean;
}
export declare const generatedAssets: WeakMap<Readonly<Omit<import("../config").UserConfig, "plugins" | "css" | "assetsInclude" | "optimizeDeps" | "worker"> & {
    configFile: string | undefined;
    configFileDependencies: string[];
    inlineConfig: import("../config").InlineConfig;
    root: string;
    base: string;
    rawBase: string;
    publicDir: string;
    cacheDir: string;
    command: "build" | "serve";
    mode: string;
    isWorker: boolean;
    mainConfig: Readonly<Omit<import("../config").UserConfig, "plugins" | "css" | "assetsInclude" | "optimizeDeps" | "worker"> & any & import("../config").PluginHookUtils> | null;
    isProduction: boolean;
    envDir: string;
    env: Record<string, any>;
    resolve: Required<import("./resolve").ResolveOptions> & {
        alias: import("dep-types/alias").Alias[];
    };
    plugins: readonly Plugin[];
    css: import("./css").ResolvedCSSOptions | undefined;
    esbuild: false | import("./esbuild").ESBuildOptions;
    server: import("..").ResolvedServerOptions;
    build: import("../build").ResolvedBuildOptions;
    preview: import("..").ResolvedPreviewOptions;
    ssr: import("..").ResolvedSSROptions;
    assetsInclude: (file: string) => boolean;
    logger: import("..").Logger;
    createResolver: (options?: Partial<import("./resolve").InternalResolveOptions> | undefined) => import("../config").ResolveFn;
    optimizeDeps: import("..").DepOptimizationOptions;
    packageCache: import("..").PackageCache;
    worker: import("../config").ResolveWorkerOptions;
    appType: import("../config").AppType;
    experimental: import("../config").ExperimentalOptions;
} & import("../config").PluginHookUtils>, Map<string, GeneratedAssetMeta>>;
export declare function registerCustomMime(): void;
export declare function renderAssetUrlInJS(ctx: PluginContext, config: ResolvedConfig, chunk: RenderedChunk, opts: NormalizedOutputOptions, code: string): MagicString | undefined;
/**
 * Also supports loading plain strings with import text from './foo.txt?raw'
 */
export declare function assetPlugin(config: ResolvedConfig): Plugin;
export declare function checkPublicFile(url: string, { publicDir }: ResolvedConfig): string | undefined;
export declare function fileToUrl(id: string, config: ResolvedConfig, ctx: PluginContext): Promise<string>;
export declare function getPublicAssetFilename(hash: string, config: ResolvedConfig): string | undefined;
export declare const publicAssetUrlCache: WeakMap<Readonly<Omit<import("../config").UserConfig, "plugins" | "css" | "assetsInclude" | "optimizeDeps" | "worker"> & {
    configFile: string | undefined;
    configFileDependencies: string[];
    inlineConfig: import("../config").InlineConfig;
    root: string;
    base: string;
    rawBase: string;
    publicDir: string;
    cacheDir: string;
    command: "build" | "serve";
    mode: string;
    isWorker: boolean;
    mainConfig: Readonly<Omit<import("../config").UserConfig, "plugins" | "css" | "assetsInclude" | "optimizeDeps" | "worker"> & any & import("../config").PluginHookUtils> | null;
    isProduction: boolean;
    envDir: string;
    env: Record<string, any>;
    resolve: Required<import("./resolve").ResolveOptions> & {
        alias: import("dep-types/alias").Alias[];
    };
    plugins: readonly Plugin[];
    css: import("./css").ResolvedCSSOptions | undefined;
    esbuild: false | import("./esbuild").ESBuildOptions;
    server: import("..").ResolvedServerOptions;
    build: import("../build").ResolvedBuildOptions;
    preview: import("..").ResolvedPreviewOptions;
    ssr: import("..").ResolvedSSROptions;
    assetsInclude: (file: string) => boolean;
    logger: import("..").Logger;
    createResolver: (options?: Partial<import("./resolve").InternalResolveOptions> | undefined) => import("../config").ResolveFn;
    optimizeDeps: import("..").DepOptimizationOptions;
    packageCache: import("..").PackageCache;
    worker: import("../config").ResolveWorkerOptions;
    appType: import("../config").AppType;
    experimental: import("../config").ExperimentalOptions;
} & import("../config").PluginHookUtils>, Map<string, string>>;
export declare const publicAssetUrlRE: RegExp;
export declare function publicFileToBuiltUrl(url: string, config: ResolvedConfig): string;
export declare function urlToBuiltUrl(url: string, importer: string, config: ResolvedConfig, pluginContext: PluginContext): Promise<string>;
