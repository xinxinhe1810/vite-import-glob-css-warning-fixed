/// <reference types="node" />
/// <reference types="node" />
import type { Server } from 'node:http';
import type { ServerOptions as HttpsServerOptions } from 'node:https';
import type { WebSocket as WebSocketTypes } from 'dep-types/ws';
import type { CustomPayload, HMRPayload } from 'types/hmrPayload';
import type { InferCustomEventPayload } from 'types/customEvent';
import type { ResolvedConfig } from '..';
export declare const HMR_HEADER = "vite-hmr";
export type WebSocketCustomListener<T> = (data: T, client: WebSocketClient) => void;
export interface WebSocketServer {
    /**
     * Listen on port and host
     */
    listen(): void;
    /**
     * Get all connected clients.
     */
    clients: Set<WebSocketClient>;
    /**
     * Broadcast events to all clients
     */
    send(payload: HMRPayload): void;
    /**
     * Send custom event
     */
    send<T extends string>(event: T, payload?: InferCustomEventPayload<T>): void;
    /**
     * Disconnect all clients and terminate the server.
     */
    close(): Promise<void>;
    /**
     * Handle custom event emitted by `import.meta.hot.send`
     */
    on: WebSocketTypes.Server['on'] & {
        <T extends string>(event: T, listener: WebSocketCustomListener<InferCustomEventPayload<T>>): void;
    };
    /**
     * Unregister event listener.
     */
    off: WebSocketTypes.Server['off'] & {
        (event: string, listener: Function): void;
    };
}
export interface WebSocketClient {
    /**
     * Send event to the client
     */
    send(payload: HMRPayload): void;
    /**
     * Send custom event
     */
    send(event: string, payload?: CustomPayload['data']): void;
    /**
     * The raw WebSocket instance
     * @advanced
     */
    socket: WebSocketTypes;
}
export declare function createWebSocketServer(server: Server | null, config: ResolvedConfig, httpsOptions?: HttpsServerOptions): WebSocketServer;