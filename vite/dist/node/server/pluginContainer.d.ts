/**
 * This file is refactored into TypeScript based on
 * https://github.com/preactjs/wmr/blob/main/packages/wmr/src/lib/rollup-plugin-container.js
 */
import type { CustomPluginOptions, InputOptions, LoadResult, ModuleInfo, OutputOptions, PartialResolvedId, SourceDescription, SourceMap } from 'rollup';
import * as acorn from 'acorn';
import type { FSWatcher } from 'chokidar';
import type { Plugin } from '../plugin';
import type { ResolvedConfig } from '../config';
import type { ModuleGraph } from './moduleGraph';
export declare const ERR_CLOSED_SERVER = "ERR_CLOSED_SERVER";
export declare function throwClosedServerError(): never;
export interface PluginContainerOptions {
    cwd?: string;
    output?: OutputOptions;
    modules?: Map<string, {
        info: ModuleInfo;
    }>;
    writeFile?: (name: string, source: string | Uint8Array) => void;
}
export interface PluginContainer {
    options: InputOptions;
    getModuleInfo(id: string): ModuleInfo | null;
    buildStart(options: InputOptions): Promise<void>;
    resolveId(id: string, importer?: string, options?: {
        assertions?: Record<string, string>;
        custom?: CustomPluginOptions;
        skip?: Set<Plugin>;
        ssr?: boolean;
        /**
         * @internal
         */
        scan?: boolean;
        isEntry?: boolean;
    }): Promise<PartialResolvedId | null>;
    transform(code: string, id: string, options?: {
        inMap?: SourceDescription['map'];
        ssr?: boolean;
    }): Promise<{
        code: string;
        map: SourceMap | null;
    }>;
    load(id: string, options?: {
        ssr?: boolean;
    }): Promise<LoadResult | null>;
    close(): Promise<void>;
}
export declare let parser: typeof acorn.Parser;
export declare function createPluginContainer(config: ResolvedConfig, moduleGraph?: ModuleGraph, watcher?: FSWatcher): Promise<PluginContainer>;
