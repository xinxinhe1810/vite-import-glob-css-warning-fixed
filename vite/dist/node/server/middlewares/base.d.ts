import type { Connect } from 'dep-types/connect';
import type { ViteDevServer } from '..';
export declare function baseMiddleware({ config, }: ViteDevServer): Connect.NextHandleFunction;
