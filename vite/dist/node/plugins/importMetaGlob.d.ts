import type { CustomPluginOptions } from 'rollup';
import MagicString from 'magic-string';
import type { GeneralImportGlobOptions } from 'types/importGlob';
import type { Plugin } from '../plugin';
import type { ViteDevServer } from '../server';
import type { ModuleNode } from '../server/moduleGraph';
import type { ResolvedConfig } from '../config';
export interface ParsedImportGlob {
    match: RegExpMatchArray;
    index: number;
    globs: string[];
    globsResolved: string[];
    isRelative: boolean;
    options: GeneralImportGlobOptions;
    type: string;
    start: number;
    end: number;
}
export declare function getAffectedGlobModules(file: string, server: ViteDevServer): ModuleNode[];
export declare function importGlobPlugin(config: ResolvedConfig): Plugin;
export declare function parseImportGlob(code: string, importer: string | undefined, root: string, resolveId: IdResolver): Promise<ParsedImportGlob[]>;
export interface TransformGlobImportResult {
    s: MagicString;
    matches: ParsedImportGlob[];
    files: Set<string>;
}
/**
 * @param optimizeExport for dynamicImportVar plugin don't need to optimize export.
 */
export declare function transformGlobImport(code: string, id: string, root: string, resolveId: IdResolver, isProduction: boolean, restoreQueryExtension?: boolean): Promise<TransformGlobImportResult | null>;
type IdResolver = (id: string, importer?: string, options?: {
    assertions?: Record<string, string>;
    custom?: CustomPluginOptions;
    isEntry?: boolean;
    skipSelf?: boolean;
}) => Promise<string | undefined> | string | undefined;
export declare function toAbsoluteGlob(glob: string, root: string, importer: string | undefined, resolveId: IdResolver): Promise<string>;
export declare function getCommonBase(globsResolved: string[]): null | string;
export {};
