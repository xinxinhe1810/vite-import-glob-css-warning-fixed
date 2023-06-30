/// <reference types="node" />
import type { OutgoingHttpHeaders } from 'node:http';
import type { Connect } from 'dep-types/connect';
import type { ViteDevServer } from '../..';
export declare function servePublicMiddleware(dir: string, headers?: OutgoingHttpHeaders): Connect.NextHandleFunction;
export declare function serveStaticMiddleware(dir: string, server: ViteDevServer): Connect.NextHandleFunction;
export declare function serveRawFsMiddleware(server: ViteDevServer): Connect.NextHandleFunction;
/**
 * Check if the url is allowed to be served, via the `server.fs` config.
 */
export declare function isFileServingAllowed(url: string, server: ViteDevServer): boolean;
