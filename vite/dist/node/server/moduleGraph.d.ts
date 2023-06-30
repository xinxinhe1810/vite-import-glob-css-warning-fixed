import type { ModuleInfo, PartialResolvedId } from 'rollup';
import type { TransformResult } from './transformRequest';
export declare class ModuleNode {
    /**
     * Public served url path, starts with /
     */
    url: string;
    /**
     * Resolved file system path + query
     */
    id: string | null;
    file: string | null;
    type: 'js' | 'css';
    info?: ModuleInfo;
    meta?: Record<string, any>;
    importers: Set<ModuleNode>;
    clientImportedModules: Set<ModuleNode>;
    ssrImportedModules: Set<ModuleNode>;
    acceptedHmrDeps: Set<ModuleNode>;
    acceptedHmrExports: Set<string> | null;
    importedBindings: Map<string, Set<string>> | null;
    isSelfAccepting?: boolean;
    transformResult: TransformResult | null;
    ssrTransformResult: TransformResult | null;
    ssrModule: Record<string, any> | null;
    ssrError: Error | null;
    lastHMRTimestamp: number;
    lastInvalidationTimestamp: number;
    /**
     * @param setIsSelfAccepting - set `false` to set `isSelfAccepting` later. e.g. #7870
     */
    constructor(url: string, setIsSelfAccepting?: boolean);
    get importedModules(): Set<ModuleNode>;
}
export type ResolvedUrl = [
    url: string,
    resolvedId: string,
    meta: object | null | undefined
];
export declare class ModuleGraph {
    private resolveId;
    urlToModuleMap: Map<string, ModuleNode>;
    idToModuleMap: Map<string, ModuleNode>;
    fileToModulesMap: Map<string, Set<ModuleNode>>;
    safeModulesPath: Set<string>;
    /**
     * @internal
     */
    _unresolvedUrlToModuleMap: Map<string, ModuleNode | Promise<ModuleNode>>;
    /**
     * @internal
     */
    _ssrUnresolvedUrlToModuleMap: Map<string, ModuleNode | Promise<ModuleNode>>;
    constructor(resolveId: (url: string, ssr: boolean) => Promise<PartialResolvedId | null>);
    getModuleByUrl(rawUrl: string, ssr?: boolean): Promise<ModuleNode | undefined>;
    getModuleById(id: string): ModuleNode | undefined;
    getModulesByFile(file: string): Set<ModuleNode> | undefined;
    onFileChange(file: string): void;
    invalidateModule(mod: ModuleNode, seen?: Set<ModuleNode>, timestamp?: number, isHmr?: boolean): void;
    invalidateAll(): void;
    /**
     * Update the module graph based on a module's updated imports information
     * If there are dependencies that no longer have any importers, they are
     * returned as a Set.
     */
    updateModuleInfo(mod: ModuleNode, importedModules: Set<string | ModuleNode>, importedBindings: Map<string, Set<string>> | null, acceptedModules: Set<string | ModuleNode>, acceptedExports: Set<string> | null, isSelfAccepting: boolean, ssr?: boolean): Promise<Set<ModuleNode> | undefined>;
    ensureEntryFromUrl(rawUrl: string, ssr?: boolean, setIsSelfAccepting?: boolean): Promise<ModuleNode>;
    /**
     * @internal
     */
    _ensureEntryFromUrl(rawUrl: string, ssr?: boolean, setIsSelfAccepting?: boolean, resolved?: PartialResolvedId): Promise<ModuleNode>;
    createFileOnlyEntry(file: string): ModuleNode;
    resolveUrl(url: string, ssr?: boolean): Promise<ResolvedUrl>;
    /**
     * @internal
     */
    _getUnresolvedUrlToModule(url: string, ssr?: boolean): Promise<ModuleNode> | ModuleNode | undefined;
    /**
     * @internal
     */
    _setUnresolvedUrlToModule(url: string, mod: Promise<ModuleNode> | ModuleNode, ssr?: boolean): void;
    /**
     * @internal
     */
    _resolveUrl(url: string, ssr?: boolean, alreadyResolved?: PartialResolvedId): Promise<ResolvedUrl>;
}