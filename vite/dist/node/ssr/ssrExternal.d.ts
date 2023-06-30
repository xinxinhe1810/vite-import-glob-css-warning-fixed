import type { ResolvedConfig } from '..';
/**
 * Converts "parent > child" syntax to just "child"
 */
export declare function stripNesting(packages: string[]): string[];
/**
 * Heuristics for determining whether a dependency should be externalized for
 * server-side rendering.
 */
export declare function cjsSsrResolveExternals(config: ResolvedConfig, knownImports: string[]): string[];
export declare function shouldExternalizeForSSR(id: string, importer: string | undefined, config: ResolvedConfig): boolean | undefined;
export declare function createIsConfiguredAsSsrExternal(config: ResolvedConfig): (id: string, importer?: string) => boolean;
export declare function cjsShouldExternalizeForSSR(id: string, externals: string[] | null): boolean;
