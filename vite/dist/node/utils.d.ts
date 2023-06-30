/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import fs from 'node:fs';
import type { Server } from 'node:net';
import type { FSWatcher } from 'chokidar';
import type { DecodedSourceMap, RawSourceMap } from '@ampproject/remapping';
import debug from 'debug';
import type { Alias, AliasOptions } from 'dep-types/alias';
import type MagicString from 'magic-string';
import type { TransformResult } from 'rollup';
import type { DepOptimizationConfig } from './optimizer';
import type { ResolvedConfig } from './config';
import type { ResolvedServerUrls, ViteDevServer } from './server';
import type { CommonServerOptions } from '.';
/**
 * Inlined to keep `@rollup/pluginutils` in devDependencies
 */
export type FilterPattern = ReadonlyArray<string | RegExp> | string | RegExp | null;
export declare const createFilter: (include?: FilterPattern, exclude?: FilterPattern, options?: {
    resolve?: string | false | null;
}) => (id: string | unknown) => boolean;
export declare function slash(p: string): string;
/**
 * Prepend `/@id/` and replace null byte so the id is URL-safe.
 * This is prepended to resolved ids that are not valid browser
 * import specifiers by the importAnalysis plugin.
 */
export declare function wrapId(id: string): string;
/**
 * Undo {@link wrapId}'s `/@id/` and null byte replacements.
 */
export declare function unwrapId(id: string): string;
export declare const flattenId: (id: string) => string;
export declare const normalizeId: (id: string) => string;
export declare function isBuiltin(id: string): boolean;
export declare function isInNodeModules(id: string): boolean;
export declare function moduleListContains(moduleList: string[] | undefined, id: string): boolean | undefined;
export declare function isOptimizable(id: string, optimizeDeps: DepOptimizationConfig): boolean;
export declare const bareImportRE: RegExp;
export declare const deepImportRE: RegExp;
interface DebuggerOptions {
    onlyWhenFocused?: boolean | string;
}
export type ViteDebugScope = `vite:${string}`;
export declare function createDebugger(namespace: ViteDebugScope, options?: DebuggerOptions): debug.Debugger['log'] | undefined;
export declare function isUrl(path: string): boolean;
export declare const isCaseInsensitiveFS: boolean;
export declare const isWindows: boolean;
export declare function normalizePath(id: string): string;
export declare function fsPathFromId(id: string): string;
export declare function fsPathFromUrl(url: string): string;
/**
 * Check if dir is a parent of file
 *
 * Warning: parameters are not validated, only works with normalized absolute paths
 *
 * @param dir - normalized absolute path
 * @param file - normalized absolute path
 * @returns true if dir is a parent of file
 */
export declare function isParentDirectory(dir: string, file: string): boolean;
/**
 * Check if 2 file name are identical
 *
 * Warning: parameters are not validated, only works with normalized absolute paths
 *
 * @param file1 - normalized absolute path
 * @param file2 - normalized absolute path
 * @returns true if both files url are identical
 */
export declare function isSameFileUri(file1: string, file2: string): boolean;
export declare const queryRE: RegExp;
export declare function cleanUrl(url: string): string;
export declare const externalRE: RegExp;
export declare const isExternalUrl: (url: string) => boolean;
export declare const dataUrlRE: RegExp;
export declare const isDataUrl: (url: string) => boolean;
export declare const virtualModuleRE: RegExp;
export declare const virtualModulePrefix = "virtual-module:";
export declare const isJSRequest: (url: string) => boolean;
export declare const isTsRequest: (url: string) => boolean;
export declare const isImportRequest: (url: string) => boolean;
export declare const isInternalRequest: (url: string) => boolean;
export declare function removeImportQuery(url: string): string;
export declare function removeDirectQuery(url: string): string;
export declare function injectQuery(url: string, queryToInject: string): string;
export declare function removeTimestampQuery(url: string): string;
export declare function asyncReplace(input: string, re: RegExp, replacer: (match: RegExpExecArray) => string | Promise<string>): Promise<string>;
export declare function timeFrom(start: number, subtract?: number): string;
/**
 * pretty url for logging.
 */
export declare function prettifyUrl(url: string, root: string): string;
export declare function isObject(value: unknown): value is Record<string, any>;
export declare function isDefined<T>(value: T | undefined | null): value is T;
export declare function tryStatSync(file: string): fs.Stats | undefined;
export declare function lookupFile(dir: string, fileNames: string[]): string | undefined;
export declare function pad(source: string, n?: number): string;
export declare function posToNumber(source: string, pos: number | {
    line: number;
    column: number;
}): number;
export declare function numberToPos(source: string, offset: number | {
    line: number;
    column: number;
}): {
    line: number;
    column: number;
};
export declare function generateCodeFrame(source: string, start?: number | {
    line: number;
    column: number;
}, end?: number): string;
export declare function isFileReadable(filename: string): boolean;
/**
 * Delete every file and subdirectory. **The given directory must exist.**
 * Pass an optional `skip` array to preserve files under the root directory.
 */
export declare function emptyDir(dir: string, skip?: string[]): void;
export declare function copyDir(srcDir: string, destDir: string): void;
export declare let safeRealpathSync: typeof windowsSafeRealPathSync | typeof fs.realpathSync.native;
declare function windowsSafeRealPathSync(path: string): string;
export declare function ensureWatchedFile(watcher: FSWatcher, file: string | null, root: string): void;
interface ImageCandidate {
    url: string;
    descriptor: string;
}
export declare function processSrcSet(srcs: string, replacer: (arg: ImageCandidate) => Promise<string>): Promise<string>;
export declare function processSrcSetSync(srcs: string, replacer: (arg: ImageCandidate) => string): string;
export declare function combineSourcemaps(filename: string, sourcemapList: Array<DecodedSourceMap | RawSourceMap>, excludeContent?: boolean): RawSourceMap;
export declare function unique<T>(arr: T[]): T[];
/**
 * Returns resolved localhost address when `dns.lookup` result differs from DNS
 *
 * `dns.lookup` result is same when defaultResultOrder is `verbatim`.
 * Even if defaultResultOrder is `ipv4first`, `dns.lookup` result maybe same.
 * For example, when IPv6 is not supported on that machine/network.
 */
export declare function getLocalhostAddressIfDiffersFromDNS(): Promise<string | undefined>;
export declare function diffDnsOrderChange(oldUrls: ViteDevServer['resolvedUrls'], newUrls: ViteDevServer['resolvedUrls']): boolean;
export interface Hostname {
    /** undefined sets the default behaviour of server.listen */
    host: string | undefined;
    /** resolve to localhost when possible */
    name: string;
}
export declare function resolveHostname(optionsHost: string | boolean | undefined): Promise<Hostname>;
export declare function resolveServerUrls(server: Server, options: CommonServerOptions, config: ResolvedConfig): Promise<ResolvedServerUrls>;
export declare function arraify<T>(target: T | T[]): T[];
export declare const multilineCommentsRE: RegExp;
export declare const singlelineCommentsRE: RegExp;
export declare const requestQuerySplitRE: RegExp;
export declare const usingDynamicImport: boolean;
/**
 * Dynamically import files. It will make sure it's not being compiled away by TS/Rollup.
 *
 * As a temporary workaround for Jest's lack of stable ESM support, we fallback to require
 * if we're in a Jest environment.
 * See https://github.com/vitejs/vite/pull/5197#issuecomment-938054077
 *
 * @param file File path to import.
 */
export declare const dynamicImport: Function;
export declare function parseRequest(id: string): Record<string, string> | null;
export declare const blankReplacer: (match: string) => string;
export declare function getHash(text: Buffer | string): string;
export declare const requireResolveFromRootWithFallback: (root: string, id: string) => string;
export declare function emptyCssComments(raw: string): string;
export declare function removeComments(raw: string): string;
export declare function mergeConfig<D extends Record<string, any>, O extends Record<string, any>>(defaults: D extends Function ? never : D, overrides: O extends Function ? never : O, isRoot?: boolean): Record<string, any>;
export declare function mergeAlias(a?: AliasOptions, b?: AliasOptions): AliasOptions | undefined;
export declare function normalizeAlias(o?: AliasOptions): Alias[];
/**
 * Transforms transpiled code result where line numbers aren't altered,
 * so we can skip sourcemap generation during dev
 */
export declare function transformStableResult(s: MagicString, id: string, config: ResolvedConfig): TransformResult;
export declare function asyncFlatten<T>(arr: T[]): Promise<T[]>;
export declare function stripBomTag(content: string): string;
/**
 * path.isAbsolute also returns true for drive relative paths on windows (e.g. /something)
 * this function returns false for them but true for absolute paths (e.g. C:/something)
 */
export declare const isNonDriveRelativeAbsolutePath: (p: string) => boolean;
/**
 * Determine if a file is being requested with the correct case, to ensure
 * consistent behaviour between dev and prod and across operating systems.
 */
export declare function shouldServeFile(filePath: string, root: string): boolean;
export declare function joinUrlSegments(a: string, b: string): string;
export declare function removeLeadingSlash(str: string): string;
export declare function stripBase(path: string, base: string): string;
export declare function arrayEqual(a: any[], b: any[]): boolean;
export declare function evalValue<T = any>(rawValue: string): T;
export declare function getNpmPackageName(importPath: string): string | null;
export declare function escapeRegex(str: string): string;
export {};
