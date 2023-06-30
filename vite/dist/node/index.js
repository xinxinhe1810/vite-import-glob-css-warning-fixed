import { i as isInNodeModules } from './chunks/dep-db559168.js';
export { b as build, e as buildErrorMessage, v as createFilter, x as createLogger, c as createServer, g as defineConfig, f as formatPostcssSourceMap, k as getDepOptimizationConfig, m as isDepsOptimizerEnabled, z as isFileServingAllowed, l as loadConfigFromFile, A as loadEnv, u as mergeAlias, q as mergeConfig, n as normalizePath, o as optimizeDeps, a as preprocessCSS, p as preview, j as resolveBaseUrl, h as resolveConfig, B as resolveEnvPrefix, d as resolvePackageData, r as resolvePackageEntry, y as searchForWorkspaceRoot, w as send, s as sortUserPlugins, t as transformWithEsbuild } from './chunks/dep-db559168.js';
export { VERSION as version } from './constants.js';
export { version as esbuildVersion } from 'esbuild';
export { VERSION as rollupVersion } from 'rollup';
import 'node:fs';
import 'node:fs/promises';
import 'node:path';
import 'node:url';
import 'node:util';
import 'node:perf_hooks';
import 'node:module';
import 'picocolors';
import '@rollup/plugin-alias';
import '@rollup/plugin-commonjs';
import 'connect';
import 'cors';
import 'chokidar';
import 'launch-editor-middleware';
import 'picomatch';
import 'node:os';
import 'node:child_process';
import 'node:crypto';
import 'node:dns';
import '@ampproject/remapping';
import 'debug';
import '@rollup/pluginutils';
import 'etag';
import 'convert-source-map';
import 'node:buffer';
import 'mrmime';
import 'magic-string';
import 'es-module-lexer';
import 'fast-glob';
import 'tsconfck';
import 'resolve.exports';
import 'mlly';
import 'acorn';
import 'postcss-load-config';
import 'strip-literal';
import 'dotenv';
import 'dotenv-expand';
import 'micromatch';
import 'acorn-walk';
import 'ufo';
import '@jridgewell/trace-mapping';
import '@rollup/plugin-dynamic-import-vars';
import 'strip-ansi';
import 'http-proxy';
import 'sirv';
import 'escape-html';
import 'periscopic';
import 'estree-walker';
import 'node:readline';
import 'node:http';
import 'node:https';
import 'ws';
import 'connect-history-api-fallback';
import 'open';
import 'cross-spawn';
import 'node:zlib';
import 'okie';
import 'json-stable-stringify';

// This file will be built for both ESM and CJS. Avoid relying on other modules as possible.
// copy from constants.ts
const CSS_LANGS_RE = 
// eslint-disable-next-line regexp/no-unused-capturing-group
/\.(css|less|sass|scss|styl|stylus|pcss|postcss|sss)(?:$|\?)/;
const isCSSRequest = (request) => CSS_LANGS_RE.test(request);
// Use splitVendorChunkPlugin() to get the same manualChunks strategy as Vite 2.7
// We don't recommend using this strategy as a general solution moving forward
// splitVendorChunk is a simple index/vendor strategy that was used in Vite
// until v2.8. It is exposed to let people continue to use it in case it was
// working well for their setups.
// The cache needs to be reset on buildStart for watch mode to work correctly
// Don't use this manualChunks strategy for ssr, lib mode, and 'umd' or 'iife'
class SplitVendorChunkCache {
    constructor() {
        this.cache = new Map();
    }
    reset() {
        this.cache = new Map();
    }
}
function splitVendorChunk(options = {}) {
    const cache = options.cache ?? new SplitVendorChunkCache();
    return (id, { getModuleInfo }) => {
        if (isInNodeModules(id) &&
            !isCSSRequest(id) &&
            staticImportedByEntry(id, getModuleInfo, cache.cache)) {
            return 'vendor';
        }
    };
}
function staticImportedByEntry(id, getModuleInfo, cache, importStack = []) {
    if (cache.has(id)) {
        return cache.get(id);
    }
    if (importStack.includes(id)) {
        // circular deps!
        cache.set(id, false);
        return false;
    }
    const mod = getModuleInfo(id);
    if (!mod) {
        cache.set(id, false);
        return false;
    }
    if (mod.isEntry) {
        cache.set(id, true);
        return true;
    }
    const someImporterIs = mod.importers.some((importer) => staticImportedByEntry(importer, getModuleInfo, cache, importStack.concat(id)));
    cache.set(id, someImporterIs);
    return someImporterIs;
}
function splitVendorChunkPlugin() {
    const caches = [];
    function createSplitVendorChunk(output, config) {
        const cache = new SplitVendorChunkCache();
        caches.push(cache);
        const build = config.build ?? {};
        const format = output?.format;
        if (!build.ssr && !build.lib && format !== 'umd' && format !== 'iife') {
            return splitVendorChunk({ cache });
        }
    }
    return {
        name: 'vite:split-vendor-chunk',
        config(config) {
            let outputs = config?.build?.rollupOptions?.output;
            if (outputs) {
                outputs = Array.isArray(outputs) ? outputs : [outputs];
                for (const output of outputs) {
                    const viteManualChunks = createSplitVendorChunk(output, config);
                    if (viteManualChunks) {
                        if (output.manualChunks) {
                            if (typeof output.manualChunks === 'function') {
                                const userManualChunks = output.manualChunks;
                                output.manualChunks = (id, api) => {
                                    return userManualChunks(id, api) ?? viteManualChunks(id, api);
                                };
                            }
                            // else, leave the object form of manualChunks untouched, as
                            // we can't safely replicate rollup handling.
                            // eslint-disable-next-line no-console
                            console.warn("(!) the `splitVendorChunk` plugin doesn't have any effect when using the object form of `build.rollupOptions.manualChunks`. Consider using the function form instead.");
                        }
                        else {
                            output.manualChunks = viteManualChunks;
                        }
                    }
                }
            }
            else {
                return {
                    build: {
                        rollupOptions: {
                            output: {
                                manualChunks: createSplitVendorChunk({}, config),
                            },
                        },
                    },
                };
            }
        },
        buildStart() {
            caches.forEach((cache) => cache.reset());
        },
    };
}

export { isCSSRequest, splitVendorChunk, splitVendorChunkPlugin };
//# sourceMappingURL=index.js.map
