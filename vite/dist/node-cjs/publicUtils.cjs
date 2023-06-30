'use strict';

var path = require('node:path');
var node_url = require('node:url');
var fs = require('node:fs');
var esbuild = require('esbuild');
var rollup = require('rollup');
var os = require('node:os');
var node_module = require('node:module');
var debug$1 = require('debug');
var pluginutils = require('@rollup/pluginutils');
var getEtag = require('etag');
var readline = require('node:readline');
var colors = require('picocolors');
var dotenv = require('dotenv');
var dotenvExpand = require('dotenv-expand');

const { version } = JSON.parse(fs.readFileSync(new URL('../../package.json', (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : (document.currentScript && document.currentScript.src || new URL('node-cjs/publicUtils.cjs', document.baseURI).href)))).toString());
const VERSION = version;
/**
 * Prefix for resolved fs paths, since windows paths may not be valid as URLs.
 */
const FS_PREFIX = `/@fs/`;
const VITE_PACKAGE_DIR = path.resolve(
// import.meta.url is `dist/node/constants.js` after bundle
node_url.fileURLToPath((typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : (document.currentScript && document.currentScript.src || new URL('node-cjs/publicUtils.cjs', document.baseURI).href))), '../../..');
const CLIENT_ENTRY = path.resolve(VITE_PACKAGE_DIR, 'dist/client/client.mjs');
path.resolve(VITE_PACKAGE_DIR, 'dist/client/env.mjs');
path.dirname(CLIENT_ENTRY);

if (process.versions.pnp) {
    try {
        node_module.createRequire((typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : (document.currentScript && document.currentScript.src || new URL('node-cjs/publicUtils.cjs', document.baseURI).href)))('pnpapi');
    }
    catch { }
}

const createFilter = pluginutils.createFilter;
const windowsSlashRE = /\\/g;
function slash(p) {
    return p.replace(windowsSlashRE, '/');
}
function isInNodeModules(id) {
    return id.includes('node_modules');
}
// TODO: use import()
const _require = node_module.createRequire((typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : (document.currentScript && document.currentScript.src || new URL('node-cjs/publicUtils.cjs', document.baseURI).href)));
// set in bin/vite.js
const filter = process.env.VITE_DEBUG_FILTER;
const DEBUG = process.env.DEBUG;
function createDebugger(namespace, options = {}) {
    const log = debug$1(namespace);
    const { onlyWhenFocused } = options;
    let enabled = log.enabled;
    if (enabled && onlyWhenFocused) {
        const ns = typeof onlyWhenFocused === 'string' ? onlyWhenFocused : namespace;
        enabled = !!DEBUG?.includes(ns);
    }
    if (enabled) {
        return (...args) => {
            if (!filter || args.some((a) => a?.includes?.(filter))) {
                log(...args);
            }
        };
    }
}
function testCaseInsensitiveFS() {
    if (!CLIENT_ENTRY.endsWith('client.mjs')) {
        throw new Error(`cannot test case insensitive FS, CLIENT_ENTRY const doesn't contain client.mjs`);
    }
    if (!fs.existsSync(CLIENT_ENTRY)) {
        throw new Error('cannot test case insensitive FS, CLIENT_ENTRY does not point to an existing file: ' +
            CLIENT_ENTRY);
    }
    return fs.existsSync(CLIENT_ENTRY.replace('client.mjs', 'cLiEnT.mjs'));
}
const isCaseInsensitiveFS = testCaseInsensitiveFS();
const isWindows = os.platform() === 'win32';
const VOLUME_RE = /^[A-Z]:/i;
function normalizePath(id) {
    return path.posix.normalize(isWindows ? slash(id) : id);
}
function fsPathFromId(id) {
    const fsPath = normalizePath(id.startsWith(FS_PREFIX) ? id.slice(FS_PREFIX.length) : id);
    return fsPath[0] === '/' || fsPath.match(VOLUME_RE) ? fsPath : `/${fsPath}`;
}
function fsPathFromUrl(url) {
    return fsPathFromId(cleanUrl(url));
}
/**
 * Check if dir is a parent of file
 *
 * Warning: parameters are not validated, only works with normalized absolute paths
 *
 * @param dir - normalized absolute path
 * @param file - normalized absolute path
 * @returns true if dir is a parent of file
 */
function isParentDirectory(dir, file) {
    if (dir[dir.length - 1] !== '/') {
        dir = `${dir}/`;
    }
    return (file.startsWith(dir) ||
        (isCaseInsensitiveFS && file.toLowerCase().startsWith(dir.toLowerCase())));
}
/**
 * Check if 2 file name are identical
 *
 * Warning: parameters are not validated, only works with normalized absolute paths
 *
 * @param file1 - normalized absolute path
 * @param file2 - normalized absolute path
 * @returns true if both files url are identical
 */
function isSameFileUri(file1, file2) {
    return (file1 === file2 ||
        (isCaseInsensitiveFS && file1.toLowerCase() === file2.toLowerCase()));
}
const postfixRE = /[?#].*$/s;
function cleanUrl(url) {
    return url.replace(postfixRE, '');
}
function isObject(value) {
    return Object.prototype.toString.call(value) === '[object Object]';
}
function tryStatSync(file) {
    try {
        return fs.statSync(file, { throwIfNoEntry: false });
    }
    catch {
        // Ignore errors
    }
}
function isFileReadable(filename) {
    try {
        // The "throwIfNoEntry" is a performance optimization for cases where the file does not exist
        if (!fs.statSync(filename, { throwIfNoEntry: false })) {
            return false;
        }
        // Check if current process has read permission to the file
        fs.accessSync(filename, fs.constants.R_OK);
        return true;
    }
    catch {
        return false;
    }
}
function arraify(target) {
    return Array.isArray(target) ? target : [target];
}
// @ts-expect-error jest only exists when running Jest
const usingDynamicImport = typeof jest === 'undefined';
/**
 * Dynamically import files. It will make sure it's not being compiled away by TS/Rollup.
 *
 * As a temporary workaround for Jest's lack of stable ESM support, we fallback to require
 * if we're in a Jest environment.
 * See https://github.com/vitejs/vite/pull/5197#issuecomment-938054077
 *
 * @param file File path to import.
 */
usingDynamicImport
    ? new Function('file', 'return import(file)')
    : _require;
path.dirname(node_url.fileURLToPath((typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : (document.currentScript && document.currentScript.src || new URL('node-cjs/publicUtils.cjs', document.baseURI).href))));
function mergeConfigRecursively(defaults, overrides, rootPath) {
    const merged = { ...defaults };
    for (const key in overrides) {
        const value = overrides[key];
        if (value == null) {
            continue;
        }
        const existing = merged[key];
        if (existing == null) {
            merged[key] = value;
            continue;
        }
        // fields that require special handling
        if (key === 'alias' && (rootPath === 'resolve' || rootPath === '')) {
            merged[key] = mergeAlias(existing, value);
            continue;
        }
        else if (key === 'assetsInclude' && rootPath === '') {
            merged[key] = [].concat(existing, value);
            continue;
        }
        else if (key === 'noExternal' &&
            rootPath === 'ssr' &&
            (existing === true || value === true)) {
            merged[key] = true;
            continue;
        }
        if (Array.isArray(existing) || Array.isArray(value)) {
            merged[key] = [...arraify(existing ?? []), ...arraify(value ?? [])];
            continue;
        }
        if (isObject(existing) && isObject(value)) {
            merged[key] = mergeConfigRecursively(existing, value, rootPath ? `${rootPath}.${key}` : key);
            continue;
        }
        merged[key] = value;
    }
    return merged;
}
function mergeConfig(defaults, overrides, isRoot = true) {
    if (typeof defaults === 'function' || typeof overrides === 'function') {
        throw new Error(`Cannot merge config in form of callback`);
    }
    return mergeConfigRecursively(defaults, overrides, isRoot ? '' : '.');
}
function mergeAlias(a, b) {
    if (!a)
        return b;
    if (!b)
        return a;
    if (isObject(a) && isObject(b)) {
        return { ...a, ...b };
    }
    // the order is flipped because the alias is resolved from top-down,
    // where the later should have higher priority
    return [...normalizeAlias(b), ...normalizeAlias(a)];
}
function normalizeAlias(o = []) {
    return Array.isArray(o)
        ? o.map(normalizeSingleAlias)
        : Object.keys(o).map((find) => normalizeSingleAlias({
            find,
            replacement: o[find],
        }));
}
// https://github.com/vitejs/vite/issues/1363
// work around https://github.com/rollup/plugins/issues/759
function normalizeSingleAlias({ find, replacement, customResolver, }) {
    if (typeof find === 'string' &&
        find[find.length - 1] === '/' &&
        replacement[replacement.length - 1] === '/') {
        find = find.slice(0, find.length - 1);
        replacement = replacement.slice(0, replacement.length - 1);
    }
    const alias = {
        find,
        replacement,
    };
    if (customResolver) {
        alias.customResolver = customResolver;
    }
    return alias;
}

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

const debug = createDebugger('vite:sourcemap', {
    onlyWhenFocused: true,
});
function genSourceMapUrl(map) {
    if (typeof map !== 'string') {
        map = JSON.stringify(map);
    }
    return `data:application/json;base64,${Buffer.from(map).toString('base64')}`;
}
function getCodeWithSourcemap(type, code, map) {
    if (debug) {
        code += `\n/*${JSON.stringify(map, null, 2).replace(/\*\//g, '*\\/')}*/\n`;
    }
    if (type === 'js') {
        code += `\n//# sourceMappingURL=${genSourceMapUrl(map)}`;
    }
    else if (type === 'css') {
        code += `\n/*# sourceMappingURL=${genSourceMapUrl(map)} */`;
    }
    return code;
}

const alias = {
    js: 'application/javascript',
    css: 'text/css',
    html: 'text/html',
    json: 'application/json',
};
function send(req, res, content, type, options) {
    const { etag = getEtag(content, { weak: true }), cacheControl = 'no-cache', headers, map, } = options;
    if (res.writableEnded) {
        return;
    }
    if (req.headers['if-none-match'] === etag) {
        res.statusCode = 304;
        res.end();
        return;
    }
    res.setHeader('Content-Type', alias[type] || type);
    res.setHeader('Cache-Control', cacheControl);
    res.setHeader('Etag', etag);
    if (headers) {
        for (const name in headers) {
            res.setHeader(name, headers[name]);
        }
    }
    // inject source map reference
    if (map && map.mappings) {
        if (type === 'js' || type === 'css') {
            content = getCodeWithSourcemap(type, content.toString(), map);
        }
    }
    res.statusCode = 200;
    res.end(content);
    return;
}

/* eslint no-console: 0 */
const LogLevels = {
    silent: 0,
    error: 1,
    warn: 2,
    info: 3,
};
let lastType;
let lastMsg;
let sameCount = 0;
function clearScreen() {
    const repeatCount = process.stdout.rows - 2;
    const blank = repeatCount > 0 ? '\n'.repeat(repeatCount) : '';
    console.log(blank);
    readline.cursorTo(process.stdout, 0, 0);
    readline.clearScreenDown(process.stdout);
}
function createLogger(level = 'info', options = {}) {
    if (options.customLogger) {
        return options.customLogger;
    }
    const loggedErrors = new WeakSet();
    const { prefix = '[vite]', allowClearScreen = true } = options;
    const thresh = LogLevels[level];
    const canClearScreen = allowClearScreen && process.stdout.isTTY && !process.env.CI;
    const clear = canClearScreen ? clearScreen : () => { };
    function output(type, msg, options = {}) {
        if (thresh >= LogLevels[type]) {
            const method = type === 'info' ? 'log' : type;
            const format = () => {
                if (options.timestamp) {
                    const tag = type === 'info'
                        ? colors.cyan(colors.bold(prefix))
                        : type === 'warn'
                            ? colors.yellow(colors.bold(prefix))
                            : colors.red(colors.bold(prefix));
                    return `${colors.dim(new Date().toLocaleTimeString())} ${tag} ${msg}`;
                }
                else {
                    return msg;
                }
            };
            if (options.error) {
                loggedErrors.add(options.error);
            }
            if (canClearScreen) {
                if (type === lastType && msg === lastMsg) {
                    sameCount++;
                    clear();
                    console[method](format(), colors.yellow(`(x${sameCount + 1})`));
                }
                else {
                    sameCount = 0;
                    lastMsg = msg;
                    lastType = type;
                    if (options.clear) {
                        clear();
                    }
                    console[method](format());
                }
            }
            else {
                console[method](format());
            }
        }
    }
    const warnedMessages = new Set();
    const logger = {
        hasWarned: false,
        info(msg, opts) {
            output('info', msg, opts);
        },
        warn(msg, opts) {
            logger.hasWarned = true;
            output('warn', msg, opts);
        },
        warnOnce(msg, opts) {
            if (warnedMessages.has(msg))
                return;
            logger.hasWarned = true;
            output('warn', msg, opts);
            warnedMessages.add(msg);
        },
        error(msg, opts) {
            logger.hasWarned = true;
            output('error', msg, opts);
        },
        clearScreen(type) {
            if (thresh >= LogLevels[type]) {
                clear();
            }
        },
        hasErrorLogged(error) {
            return loggedErrors.has(error);
        },
    };
    return logger;
}

// https://github.com/vitejs/vite/issues/2820#issuecomment-812495079
const ROOT_FILES = [
    // '.git',
    // https://pnpm.io/workspaces/
    'pnpm-workspace.yaml',
    // https://rushjs.io/pages/advanced/config_files/
    // 'rush.json',
    // https://nx.dev/latest/react/getting-started/nx-setup
    // 'workspace.json',
    // 'nx.json',
    // https://github.com/lerna/lerna#lernajson
    'lerna.json',
];
// npm: https://docs.npmjs.com/cli/v7/using-npm/workspaces#installing-workspaces
// yarn: https://classic.yarnpkg.com/en/docs/workspaces/#toc-how-to-use-it
function hasWorkspacePackageJSON(root) {
    const path$1 = path.join(root, 'package.json');
    if (!isFileReadable(path$1)) {
        return false;
    }
    const content = JSON.parse(fs.readFileSync(path$1, 'utf-8')) || {};
    return !!content.workspaces;
}
function hasRootFile(root) {
    return ROOT_FILES.some((file) => fs.existsSync(path.join(root, file)));
}
function hasPackageJSON(root) {
    const path$1 = path.join(root, 'package.json');
    return fs.existsSync(path$1);
}
/**
 * Search up for the nearest `package.json`
 */
function searchForPackageRoot(current, root = current) {
    if (hasPackageJSON(current))
        return current;
    const dir = path.dirname(current);
    // reach the fs root
    if (!dir || dir === current)
        return root;
    return searchForPackageRoot(dir, root);
}
/**
 * Search up for the nearest workspace root
 */
function searchForWorkspaceRoot(current, root = searchForPackageRoot(current)) {
    if (hasRootFile(current))
        return current;
    if (hasWorkspacePackageJSON(current))
        return current;
    const dir = path.dirname(current);
    // reach the fs root
    if (!dir || dir === current)
        return root;
    return searchForWorkspaceRoot(dir, root);
}

/**
 * Check if the url is allowed to be served, via the `server.fs` config.
 */
function isFileServingAllowed(url, server) {
    if (!server.config.server.fs.strict)
        return true;
    const file = fsPathFromUrl(url);
    if (server._fsDenyGlob(file))
        return false;
    if (server.moduleGraph.safeModulesPath.has(file))
        return true;
    if (server.config.server.fs.allow.some((uri) => isSameFileUri(uri, file) || isParentDirectory(uri, file)))
        return true;
    return false;
}

function loadEnv(mode, envDir, prefixes = 'VITE_') {
    if (mode === 'local') {
        throw new Error(`"local" cannot be used as a mode name because it conflicts with ` +
            `the .local postfix for .env files.`);
    }
    prefixes = arraify(prefixes);
    const env = {};
    const envFiles = [
        /** default file */ `.env`,
        /** local file */ `.env.local`,
        /** mode file */ `.env.${mode}`,
        /** mode local file */ `.env.${mode}.local`,
    ];
    const parsed = Object.fromEntries(envFiles.flatMap((file) => {
        const filePath = path.join(envDir, file);
        if (!tryStatSync(filePath)?.isFile())
            return [];
        return Object.entries(dotenv.parse(fs.readFileSync(filePath)));
    }));
    // test NODE_ENV override before expand as otherwise process.env.NODE_ENV would override this
    if (parsed.NODE_ENV && process.env.VITE_USER_NODE_ENV === undefined) {
        process.env.VITE_USER_NODE_ENV = parsed.NODE_ENV;
    }
    // support BROWSER and BROWSER_ARGS env variables
    if (parsed.BROWSER && process.env.BROWSER === undefined) {
        process.env.BROWSER = parsed.BROWSER;
    }
    if (parsed.BROWSER_ARGS && process.env.BROWSER_ARGS === undefined) {
        process.env.BROWSER_ARGS = parsed.BROWSER_ARGS;
    }
    // let environment variables use each other
    // `expand` patched in patches/dotenv-expand@9.0.0.patch
    dotenvExpand.expand({ parsed });
    // only keys that start with prefix are exposed to client
    for (const [key, value] of Object.entries(parsed)) {
        if (prefixes.some((prefix) => key.startsWith(prefix))) {
            env[key] = value;
        }
    }
    // check if there are actual env variables starting with VITE_*
    // these are typically provided inline and should be prioritized
    for (const key in process.env) {
        if (prefixes.some((prefix) => key.startsWith(prefix))) {
            env[key] = process.env[key];
        }
    }
    return env;
}
function resolveEnvPrefix({ envPrefix = 'VITE_', }) {
    envPrefix = arraify(envPrefix);
    if (envPrefix.some((prefix) => prefix === '')) {
        throw new Error(`envPrefix option contains value '', which could lead unexpected exposure of sensitive information.`);
    }
    return envPrefix;
}

exports.esbuildVersion = esbuild.version;
exports.rollupVersion = rollup.VERSION;
exports.createFilter = createFilter;
exports.createLogger = createLogger;
exports.isCSSRequest = isCSSRequest;
exports.isFileServingAllowed = isFileServingAllowed;
exports.loadEnv = loadEnv;
exports.mergeAlias = mergeAlias;
exports.mergeConfig = mergeConfig;
exports.normalizePath = normalizePath;
exports.resolveEnvPrefix = resolveEnvPrefix;
exports.searchForWorkspaceRoot = searchForWorkspaceRoot;
exports.send = send;
exports.splitVendorChunk = splitVendorChunk;
exports.splitVendorChunkPlugin = splitVendorChunkPlugin;
exports.version = VERSION;
//# sourceMappingURL=publicUtils.cjs.map
