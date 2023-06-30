import type { ViteDevServer } from './server';
export type BindShortcutsOptions = {
    /**
     * Print a one line hint to the terminal.
     */
    print?: boolean;
    customShortcuts?: (CLIShortcut | undefined | null)[];
};
export type CLIShortcut = {
    key: string;
    description: string;
    action(server: ViteDevServer): void | Promise<void>;
};
export declare function bindShortcuts(server: ViteDevServer, opts: BindShortcutsOptions): void;
