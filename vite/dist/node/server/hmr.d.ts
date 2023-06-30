/// <reference types="node" />
import type { Server } from 'node:http';
import type { ViteDevServer } from '..';
import type { ModuleNode } from './moduleGraph';
export declare const debugHmr: ((...args: any[]) => any) | undefined;
export interface HmrOptions {
    protocol?: string;
    host?: string;
    port?: number;
    clientPort?: number;
    path?: string;
    timeout?: number;
    overlay?: boolean;
    server?: Server;
}
export interface HmrContext {
    file: string;
    timestamp: number;
    modules: Array<ModuleNode>;
    read: () => string | Promise<string>;
    server: ViteDevServer;
}
export declare function getShortName(file: string, root: string): string;
export declare function handleHMRUpdate(file: string, server: ViteDevServer, configOnly: boolean): Promise<void>;
export declare function updateModules(file: string, modules: ModuleNode[], timestamp: number, { config, ws, moduleGraph }: ViteDevServer, afterInvalidation?: boolean): void;
export declare function handleFileAddUnlink(file: string, server: ViteDevServer): Promise<void>;
export declare function handlePrunedModules(mods: Set<ModuleNode>, { ws }: ViteDevServer): void;
/**
 * Lex import.meta.hot.accept() for accepted deps.
 * Since hot.accept() can only accept string literals or array of string
 * literals, we don't really need a heavy @babel/parse call on the entire source.
 *
 * @returns selfAccepts
 */
export declare function lexAcceptedHmrDeps(code: string, start: number, urls: Set<{
    url: string;
    start: number;
    end: number;
}>): boolean;
export declare function lexAcceptedHmrExports(code: string, start: number, exportNames: Set<string>): boolean;
export declare function normalizeHmrUrl(url: string): string;
