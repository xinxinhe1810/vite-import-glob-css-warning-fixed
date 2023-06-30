import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path, { dirname as dirname$1, join as join$1, isAbsolute, posix, relative as relative$1, basename as basename$1, extname } from 'node:path';
import { fileURLToPath, URL as URL$1, URLSearchParams, parse as parse$1, pathToFileURL } from 'node:url';
import { promisify } from 'node:util';
import { performance } from 'node:perf_hooks';
import { createRequire, builtinModules } from 'node:module';
import colors from 'picocolors';
import aliasPlugin from '@rollup/plugin-alias';
import esbuild, { transform, formatMessages, build as build$2 } from 'esbuild';
import commonjsPlugin from '@rollup/plugin-commonjs';
import connect from 'connect';
import corsMiddleware from 'cors';
import chokidar from 'chokidar';
import launchEditorMiddleware from 'launch-editor-middleware';
import picomatch from 'picomatch';
import os from 'node:os';
import { exec } from 'node:child_process';
import { createHash } from 'node:crypto';
import { promises } from 'node:dns';
import remapping from '@ampproject/remapping';
import debug$b from 'debug';
import { createFilter as createFilter$1, dataToEsm, makeLegalIdentifier } from '@rollup/pluginutils';
import { CLIENT_ENTRY, OPTIMIZABLE_ENTRY_RE, wildcardHosts, loopbackHosts, VALID_ID_PREFIX, NULL_BYTE_PLACEHOLDER, FS_PREFIX, CLIENT_PUBLIC_PATH, ENV_PUBLIC_PATH, ENV_ENTRY, DEP_VERSION_RE, DEFAULT_MAIN_FIELDS, DEFAULT_EXTENSIONS, SPECIAL_QUERY_RE, CSS_LANGS_RE, ESBUILD_MODULES_TARGET, KNOWN_ASSET_TYPES, CLIENT_DIR, JS_TYPES_RE, VERSION as VERSION$1, VITE_PACKAGE_DIR, DEFAULT_DEV_PORT, DEFAULT_PREVIEW_PORT, DEFAULT_ASSETS_RE, DEFAULT_CONFIG_FILES } from '../constants.js';
import getEtag from 'etag';
import convertSourceMap from 'convert-source-map';
import { Buffer as Buffer$1 } from 'node:buffer';
import * as mrmime from 'mrmime';
import MagicString from 'magic-string';
import { init, parse as parse$3 } from 'es-module-lexer';
import glob from 'fast-glob';
import { parse, findAll, TSConfckParseError } from 'tsconfck';
import { imports, exports } from 'resolve.exports';
import { hasESMSyntax, findStaticImports, parseStaticImport } from 'mlly';
import * as acorn from 'acorn';
import { parseExpressionAt, parse as parse$4 } from 'acorn';
import postcssrc from 'postcss-load-config';
import { stripLiteral } from 'strip-literal';
import { parse as parse$2 } from 'dotenv';
import { expand } from 'dotenv-expand';
import micromatch from 'micromatch';
import { findNodeAt } from 'acorn-walk';
import { stringifyQuery } from 'ufo';
import { VERSION } from 'rollup';
import { TraceMap, originalPositionFor } from '@jridgewell/trace-mapping';
import { dynamicImportToGlob } from '@rollup/plugin-dynamic-import-vars';
import strip from 'strip-ansi';
import httpProxy from 'http-proxy';
import sirv from 'sirv';
import escapeHtml from 'escape-html';
import { extract_names } from 'periscopic';
import { walk as walk$1 } from 'estree-walker';
import readline from 'node:readline';
import { createServer as createServer$2, STATUS_CODES } from 'node:http';
import { createServer as createServer$1 } from 'node:https';
import { WebSocketServer } from 'ws';
import history from 'connect-history-api-fallback';
import open from 'open';
import spawn from 'cross-spawn';
import zlib, { gzip } from 'node:zlib';
import { Worker } from 'okie';
import jsonStableStringify from 'json-stable-stringify';

import { fileURLToPath as __cjs_fileURLToPath } from 'node:url';
import { dirname as __cjs_dirname } from 'node:path';
import { createRequire as __cjs_createRequire } from 'node:module';

const __filename = __cjs_fileURLToPath(import.meta.url);
const __dirname = __cjs_dirname(__filename);
const require = __cjs_createRequire(import.meta.url);
const __require = require;
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
let pnp;
if (process.versions.pnp) {
    try {
        pnp = createRequire(import.meta.url)('pnpapi');
    }
    catch { }
}
function invalidatePackageData(packageCache, pkgPath) {
    const pkgDir = path.dirname(pkgPath);
    packageCache.forEach((pkg, cacheKey) => {
        if (pkg.dir === pkgDir) {
            packageCache.delete(cacheKey);
        }
    });
}
function resolvePackageData(pkgName, basedir, preserveSymlinks = false, packageCache) {
    if (pnp) {
        const cacheKey = getRpdCacheKey(pkgName, basedir, preserveSymlinks);
        if (packageCache?.has(cacheKey))
            return packageCache.get(cacheKey);
        try {
            const pkg = pnp.resolveToUnqualified(pkgName, basedir, {
                considerBuiltins: false,
            });
            if (!pkg)
                return null;
            const pkgData = loadPackageData(path.join(pkg, 'package.json'));
            packageCache?.set(cacheKey, pkgData);
            return pkgData;
        }
        catch {
            return null;
        }
    }
    const originalBasedir = basedir;
    while (basedir) {
        if (packageCache) {
            const cached = getRpdCache(packageCache, pkgName, basedir, originalBasedir, preserveSymlinks);
            if (cached)
                return cached;
        }
        const pkg = path.join(basedir, 'node_modules', pkgName, 'package.json');
        try {
            if (fs.existsSync(pkg)) {
                const pkgPath = preserveSymlinks ? pkg : safeRealpathSync(pkg);
                const pkgData = loadPackageData(pkgPath);
                if (packageCache) {
                    setRpdCache(packageCache, pkgData, pkgName, basedir, originalBasedir, preserveSymlinks);
                }
                return pkgData;
            }
        }
        catch { }
        const nextBasedir = path.dirname(basedir);
        if (nextBasedir === basedir)
            break;
        basedir = nextBasedir;
    }
    return null;
}
function findNearestPackageData(basedir, packageCache) {
    const originalBasedir = basedir;
    while (basedir) {
        if (packageCache) {
            const cached = getFnpdCache(packageCache, basedir, originalBasedir);
            if (cached)
                return cached;
        }
        const pkgPath = path.join(basedir, 'package.json');
        try {
            if (fs.statSync(pkgPath, { throwIfNoEntry: false })?.isFile()) {
                const pkgData = loadPackageData(pkgPath);
                if (packageCache) {
                    setFnpdCache(packageCache, pkgData, basedir, originalBasedir);
                }
                return pkgData;
            }
        }
        catch { }
        const nextBasedir = path.dirname(basedir);
        if (nextBasedir === basedir)
            break;
        basedir = nextBasedir;
    }
    return null;
}
// Finds the nearest package.json with a `name` field
function findNearestMainPackageData(basedir, packageCache) {
    const nearestPackage = findNearestPackageData(basedir, packageCache);
    return (nearestPackage &&
        (nearestPackage.data.name
            ? nearestPackage
            : findNearestMainPackageData(path.dirname(nearestPackage.dir), packageCache)));
}
function loadPackageData(pkgPath) {
    const data = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    const pkgDir = path.dirname(pkgPath);
    const { sideEffects } = data;
    let hasSideEffects;
    if (typeof sideEffects === 'boolean') {
        hasSideEffects = () => sideEffects;
    }
    else if (Array.isArray(sideEffects)) {
        const finalPackageSideEffects = sideEffects.map((sideEffect) => {
            /*
             * The array accepts simple glob patterns to the relevant files... Patterns like *.css, which do not include a /, will be treated like **\/*.css.
             * https://webpack.js.org/guides/tree-shaking/
             * https://github.com/vitejs/vite/pull/11807
             */
            if (sideEffect.includes('/')) {
                return sideEffect;
            }
            return `**/${sideEffect}`;
        });
        hasSideEffects = createFilter(finalPackageSideEffects, null, {
            resolve: pkgDir,
        });
    }
    else {
        hasSideEffects = () => true;
    }
    const pkg = {
        dir: pkgDir,
        data,
        hasSideEffects,
        webResolvedImports: {},
        nodeResolvedImports: {},
        setResolvedCache(key, entry, targetWeb) {
            if (targetWeb) {
                pkg.webResolvedImports[key] = entry;
            }
            else {
                pkg.nodeResolvedImports[key] = entry;
            }
        },
        getResolvedCache(key, targetWeb) {
            if (targetWeb) {
                return pkg.webResolvedImports[key];
            }
            else {
                return pkg.nodeResolvedImports[key];
            }
        },
    };
    return pkg;
}
function watchPackageDataPlugin(packageCache) {
    // a list of files to watch before the plugin is ready
    const watchQueue = new Set();
    const watchedDirs = new Set();
    const watchFileStub = (id) => {
        watchQueue.add(id);
    };
    let watchFile = watchFileStub;
    const setPackageData = packageCache.set.bind(packageCache);
    packageCache.set = (id, pkg) => {
        if (!isInNodeModules(pkg.dir) && !watchedDirs.has(pkg.dir)) {
            watchedDirs.add(pkg.dir);
            watchFile(path.join(pkg.dir, 'package.json'));
        }
        return setPackageData(id, pkg);
    };
    return {
        name: 'vite:watch-package-data',
        buildStart() {
            watchFile = this.addWatchFile.bind(this);
            watchQueue.forEach(watchFile);
            watchQueue.clear();
        },
        buildEnd() {
            watchFile = watchFileStub;
        },
        watchChange(id) {
            if (id.endsWith('/package.json')) {
                invalidatePackageData(packageCache, path.normalize(id));
            }
        },
        handleHotUpdate({ file }) {
            if (file.endsWith('/package.json')) {
                invalidatePackageData(packageCache, path.normalize(file));
            }
        },
    };
}
/**
 * Get cached `resolvePackageData` value based on `basedir`. When one is found,
 * and we've already traversed some directories between `basedir` and `originalBasedir`,
 * we cache the value for those in-between directories as well.
 *
 * This makes it so the fs is only read once for a shared `basedir`.
 */
function getRpdCache(packageCache, pkgName, basedir, originalBasedir, preserveSymlinks) {
    const cacheKey = getRpdCacheKey(pkgName, basedir, preserveSymlinks);
    const pkgData = packageCache.get(cacheKey);
    if (pkgData) {
        traverseBetweenDirs(originalBasedir, basedir, (dir) => {
            packageCache.set(getRpdCacheKey(pkgName, dir, preserveSymlinks), pkgData);
        });
        return pkgData;
    }
}
function setRpdCache(packageCache, pkgData, pkgName, basedir, originalBasedir, preserveSymlinks) {
    packageCache.set(getRpdCacheKey(pkgName, basedir, preserveSymlinks), pkgData);
    traverseBetweenDirs(originalBasedir, basedir, (dir) => {
        packageCache.set(getRpdCacheKey(pkgName, dir, preserveSymlinks), pkgData);
    });
}
// package cache key for `resolvePackageData`
function getRpdCacheKey(pkgName, basedir, preserveSymlinks) {
    return `rpd_${pkgName}_${basedir}_${preserveSymlinks}`;
}
/**
 * Get cached `findNearestPackageData` value based on `basedir`. When one is found,
 * and we've already traversed some directories between `basedir` and `originalBasedir`,
 * we cache the value for those in-between directories as well.
 *
 * This makes it so the fs is only read once for a shared `basedir`.
 */
function getFnpdCache(packageCache, basedir, originalBasedir) {
    const cacheKey = getFnpdCacheKey(basedir);
    const pkgData = packageCache.get(cacheKey);
    if (pkgData) {
        traverseBetweenDirs(originalBasedir, basedir, (dir) => {
            packageCache.set(getFnpdCacheKey(dir), pkgData);
        });
        return pkgData;
    }
}
function setFnpdCache(packageCache, pkgData, basedir, originalBasedir) {
    packageCache.set(getFnpdCacheKey(basedir), pkgData);
    traverseBetweenDirs(originalBasedir, basedir, (dir) => {
        packageCache.set(getFnpdCacheKey(dir), pkgData);
    });
}
// package cache key for `findNearestPackageData`
function getFnpdCacheKey(basedir) {
    return `fnpd_${basedir}`;
}
/**
 * Traverse between `longerDir` (inclusive) and `shorterDir` (exclusive) and call `cb` for each dir.
 * @param longerDir Longer dir path, e.g. `/User/foo/bar/baz`
 * @param shorterDir Shorter dir path, e.g. `/User/foo`
 */
function traverseBetweenDirs(longerDir, shorterDir, cb) {
    while (longerDir !== shorterDir) {
        cb(longerDir);
        longerDir = path.dirname(longerDir);
    }
}

const createFilter = createFilter$1;
const windowsSlashRE = /\\/g;
function slash(p) {
    return p.replace(windowsSlashRE, '/');
}
/**
 * Prepend `/@id/` and replace null byte so the id is URL-safe.
 * This is prepended to resolved ids that are not valid browser
 * import specifiers by the importAnalysis plugin.
 */
function wrapId(id) {
    return id.startsWith(VALID_ID_PREFIX)
        ? id
        : VALID_ID_PREFIX + id.replace('\0', NULL_BYTE_PLACEHOLDER);
}
/**
 * Undo {@link wrapId}'s `/@id/` and null byte replacements.
 */
function unwrapId(id) {
    return id.startsWith(VALID_ID_PREFIX)
        ? id.slice(VALID_ID_PREFIX.length).replace(NULL_BYTE_PLACEHOLDER, '\0')
        : id;
}
const replaceSlashOrColonRE = /[/:]/g;
const replaceDotRE = /\./g;
const replaceNestedIdRE = /(\s*>\s*)/g;
const replaceHashRE = /#/g;
const flattenId = (id) => id
    .replace(replaceSlashOrColonRE, '_')
    .replace(replaceDotRE, '__')
    .replace(replaceNestedIdRE, '___')
    .replace(replaceHashRE, '____');
const normalizeId = (id) => id.replace(replaceNestedIdRE, ' > ');
//TODO: revisit later to see if the edge case that "compiling using node v12 code to be run in node v16 in the server" is what we intend to support.
const builtins = new Set([
    ...builtinModules,
    'assert/strict',
    'diagnostics_channel',
    'dns/promises',
    'fs/promises',
    'path/posix',
    'path/win32',
    'readline/promises',
    'stream/consumers',
    'stream/promises',
    'stream/web',
    'timers/promises',
    'util/types',
    'wasi',
]);
const NODE_BUILTIN_NAMESPACE = 'node:';
function isBuiltin(id) {
    return builtins.has(id.startsWith(NODE_BUILTIN_NAMESPACE)
        ? id.slice(NODE_BUILTIN_NAMESPACE.length)
        : id);
}
function isInNodeModules(id) {
    return id.includes('node_modules');
}
function moduleListContains(moduleList, id) {
    return moduleList?.some((m) => m === id || id.startsWith(m + '/'));
}
function isOptimizable(id, optimizeDeps) {
    const { extensions } = optimizeDeps;
    return (OPTIMIZABLE_ENTRY_RE.test(id) ||
        (extensions?.some((ext) => id.endsWith(ext)) ?? false));
}
const bareImportRE = /^(?![a-zA-Z]:)[\w@](?!.*:\/\/)/;
const deepImportRE = /^([^@][^/]*)\/|^(@[^/]+\/[^/]+)\//;
// TODO: use import()
const _require$3 = createRequire(import.meta.url);
// set in bin/vite.js
const filter = process.env.VITE_DEBUG_FILTER;
const DEBUG = process.env.DEBUG;
function createDebugger(namespace, options = {}) {
    const log = debug$b(namespace);
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
function isUrl(path) {
    try {
        new URL$1(path);
        return true;
    }
    catch {
        return false;
    }
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
const queryRE = /\?.*$/s;
const postfixRE = /[?#].*$/s;
function cleanUrl(url) {
    return url.replace(postfixRE, '');
}
const externalRE = /^(https?:)?\/\//;
const isExternalUrl = (url) => externalRE.test(url);
const dataUrlRE = /^\s*data:/i;
const isDataUrl = (url) => dataUrlRE.test(url);
const virtualModuleRE = /^virtual-module:.*/;
const virtualModulePrefix = 'virtual-module:';
const knownJsSrcRE = /\.(?:[jt]sx?|m[jt]s|vue|marko|svelte|astro|imba)(?:$|\?)/;
const isJSRequest = (url) => {
    url = cleanUrl(url);
    if (knownJsSrcRE.test(url)) {
        return true;
    }
    if (!path.extname(url) && url[url.length - 1] !== '/') {
        return true;
    }
    return false;
};
const knownTsRE = /\.(?:ts|mts|cts|tsx)(?:$|\?)/;
const isTsRequest = (url) => knownTsRE.test(url);
const importQueryRE = /(\?|&)import=?(?:&|$)/;
const directRequestRE$1 = /(\?|&)direct=?(?:&|$)/;
const internalPrefixes = [
    FS_PREFIX,
    VALID_ID_PREFIX,
    CLIENT_PUBLIC_PATH,
    ENV_PUBLIC_PATH,
];
const InternalPrefixRE = new RegExp(`^(?:${internalPrefixes.join('|')})`);
const trailingSeparatorRE = /[?&]$/;
const isImportRequest = (url) => importQueryRE.test(url);
const isInternalRequest = (url) => InternalPrefixRE.test(url);
function removeImportQuery(url) {
    return url.replace(importQueryRE, '$1').replace(trailingSeparatorRE, '');
}
function removeDirectQuery(url) {
    return url.replace(directRequestRE$1, '$1').replace(trailingSeparatorRE, '');
}
const replacePercentageRE = /%/g;
function injectQuery(url, queryToInject) {
    // encode percents for consistent behavior with pathToFileURL
    // see #2614 for details
    const resolvedUrl = new URL$1(url.replace(replacePercentageRE, '%25'), 'relative:///');
    const { search, hash } = resolvedUrl;
    let pathname = cleanUrl(url);
    pathname = isWindows ? slash(pathname) : pathname;
    return `${pathname}?${queryToInject}${search ? `&` + search.slice(1) : ''}${hash ?? ''}`;
}
const timestampRE = /\bt=\d{13}&?\b/;
function removeTimestampQuery(url) {
    return url.replace(timestampRE, '').replace(trailingSeparatorRE, '');
}
async function asyncReplace(input, re, replacer) {
    let match;
    let remaining = input;
    let rewritten = '';
    while ((match = re.exec(remaining))) {
        rewritten += remaining.slice(0, match.index);
        rewritten += await replacer(match);
        remaining = remaining.slice(match.index + match[0].length);
    }
    rewritten += remaining;
    return rewritten;
}
function timeFrom(start, subtract = 0) {
    const time = performance.now() - start - subtract;
    const timeString = (time.toFixed(2) + `ms`).padEnd(5, ' ');
    if (time < 10) {
        return colors.green(timeString);
    }
    else if (time < 50) {
        return colors.yellow(timeString);
    }
    else {
        return colors.red(timeString);
    }
}
/**
 * pretty url for logging.
 */
function prettifyUrl(url, root) {
    url = removeTimestampQuery(url);
    const isAbsoluteFile = url.startsWith(root);
    if (isAbsoluteFile || url.startsWith(FS_PREFIX)) {
        const file = path.relative(root, isAbsoluteFile ? url : fsPathFromId(url));
        return colors.dim(file);
    }
    else {
        return colors.dim(url);
    }
}
function isObject(value) {
    return Object.prototype.toString.call(value) === '[object Object]';
}
function isDefined(value) {
    return value != null;
}
function tryStatSync(file) {
    try {
        return fs.statSync(file, { throwIfNoEntry: false });
    }
    catch {
        // Ignore errors
    }
}
function lookupFile(dir, fileNames) {
    while (dir) {
        for (const fileName of fileNames) {
            const fullPath = path.join(dir, fileName);
            if (tryStatSync(fullPath)?.isFile())
                return fullPath;
        }
        const parentDir = path.dirname(dir);
        if (parentDir === dir)
            return;
        dir = parentDir;
    }
}
const splitRE = /\r?\n/;
const range = 2;
function pad(source, n = 2) {
    const lines = source.split(splitRE);
    return lines.map((l) => ` `.repeat(n) + l).join(`\n`);
}
function posToNumber(source, pos) {
    if (typeof pos === 'number')
        return pos;
    const lines = source.split(splitRE);
    const { line, column } = pos;
    let start = 0;
    for (let i = 0; i < line - 1 && i < lines.length; i++) {
        start += lines[i].length + 1;
    }
    return start + column;
}
function numberToPos(source, offset) {
    if (typeof offset !== 'number')
        return offset;
    if (offset > source.length) {
        throw new Error(`offset is longer than source length! offset ${offset} > length ${source.length}`);
    }
    const lines = source.split(splitRE);
    let counted = 0;
    let line = 0;
    let column = 0;
    for (; line < lines.length; line++) {
        const lineLength = lines[line].length + 1;
        if (counted + lineLength >= offset) {
            column = offset - counted + 1;
            break;
        }
        counted += lineLength;
    }
    return { line: line + 1, column };
}
function generateCodeFrame(source, start = 0, end) {
    start = posToNumber(source, start);
    end = end || start;
    const lines = source.split(splitRE);
    let count = 0;
    const res = [];
    for (let i = 0; i < lines.length; i++) {
        count += lines[i].length + 1;
        if (count >= start) {
            for (let j = i - range; j <= i + range || end > count; j++) {
                if (j < 0 || j >= lines.length)
                    continue;
                const line = j + 1;
                res.push(`${line}${' '.repeat(Math.max(3 - String(line).length, 0))}|  ${lines[j]}`);
                const lineLength = lines[j].length;
                if (j === i) {
                    // push underline
                    const pad = Math.max(start - (count - lineLength) + 1, 0);
                    const length = Math.max(1, end > count ? lineLength - pad : end - start);
                    res.push(`   |  ` + ' '.repeat(pad) + '^'.repeat(length));
                }
                else if (j > i) {
                    if (end > count) {
                        const length = Math.max(Math.min(end - count, lineLength), 1);
                        res.push(`   |  ` + '^'.repeat(length));
                    }
                    count += lineLength + 1;
                }
            }
            break;
        }
    }
    return res.join('\n');
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
const splitFirstDirRE = /(.+?)[\\/](.+)/;
/**
 * Delete every file and subdirectory. **The given directory must exist.**
 * Pass an optional `skip` array to preserve files under the root directory.
 */
function emptyDir(dir, skip) {
    const skipInDir = [];
    let nested = null;
    if (skip?.length) {
        for (const file of skip) {
            if (path.dirname(file) !== '.') {
                const matched = file.match(splitFirstDirRE);
                if (matched) {
                    nested ?? (nested = new Map());
                    const [, nestedDir, skipPath] = matched;
                    let nestedSkip = nested.get(nestedDir);
                    if (!nestedSkip) {
                        nestedSkip = [];
                        nested.set(nestedDir, nestedSkip);
                    }
                    if (!nestedSkip.includes(skipPath)) {
                        nestedSkip.push(skipPath);
                    }
                }
            }
            else {
                skipInDir.push(file);
            }
        }
    }
    for (const file of fs.readdirSync(dir)) {
        if (skipInDir.includes(file)) {
            continue;
        }
        if (nested?.has(file)) {
            emptyDir(path.resolve(dir, file), nested.get(file));
        }
        else {
            fs.rmSync(path.resolve(dir, file), { recursive: true, force: true });
        }
    }
}
function copyDir(srcDir, destDir) {
    fs.mkdirSync(destDir, { recursive: true });
    for (const file of fs.readdirSync(srcDir)) {
        const srcFile = path.resolve(srcDir, file);
        if (srcFile === destDir) {
            continue;
        }
        const destFile = path.resolve(destDir, file);
        const stat = fs.statSync(srcFile);
        if (stat.isDirectory()) {
            copyDir(srcFile, destFile);
        }
        else {
            fs.copyFileSync(srcFile, destFile);
        }
    }
}
// `fs.realpathSync.native` resolves differently in Windows network drive,
// causing file read errors. skip for now.
// https://github.com/nodejs/node/issues/37737
let safeRealpathSync = isWindows
    ? windowsSafeRealPathSync
    : fs.realpathSync.native;
// Based on https://github.com/larrybahr/windows-network-drive
// MIT License, Copyright (c) 2017 Larry Bahr
const windowsNetworkMap = new Map();
function windowsMappedRealpathSync(path) {
    const realPath = fs.realpathSync.native(path);
    if (realPath.startsWith('\\\\')) {
        for (const [network, volume] of windowsNetworkMap) {
            if (realPath.startsWith(network))
                return realPath.replace(network, volume);
        }
    }
    return realPath;
}
const parseNetUseRE = /^(\w+)? +(\w:) +([^ ]+)\s/;
let firstSafeRealPathSyncRun = false;
function windowsSafeRealPathSync(path) {
    if (!firstSafeRealPathSyncRun) {
        optimizeSafeRealPathSync();
        firstSafeRealPathSyncRun = true;
    }
    return fs.realpathSync(path);
}
function optimizeSafeRealPathSync() {
    // Skip if using Node <16.18 due to MAX_PATH issue: https://github.com/vitejs/vite/issues/12931
    const nodeVersion = process.versions.node.split('.').map(Number);
    if (nodeVersion[0] < 16 || (nodeVersion[0] === 16 && nodeVersion[1] < 18)) {
        safeRealpathSync = fs.realpathSync;
        return;
    }
    exec('net use', (error, stdout) => {
        if (error)
            return;
        const lines = stdout.split('\n');
        // OK           Y:        \\NETWORKA\Foo         Microsoft Windows Network
        // OK           Z:        \\NETWORKA\Bar         Microsoft Windows Network
        for (const line of lines) {
            const m = line.match(parseNetUseRE);
            if (m)
                windowsNetworkMap.set(m[3], m[2]);
        }
        if (windowsNetworkMap.size === 0) {
            safeRealpathSync = fs.realpathSync.native;
        }
        else {
            safeRealpathSync = windowsMappedRealpathSync;
        }
    });
}
function ensureWatchedFile(watcher, file, root) {
    if (file &&
        // only need to watch if out of root
        !file.startsWith(root + '/') &&
        // some rollup plugins use null bytes for private resolved Ids
        !file.includes('\0') &&
        fs.existsSync(file)) {
        // resolve file to normalized system path
        watcher.add(path.resolve(file));
    }
}
const escapedSpaceCharacters = /( |\\t|\\n|\\f|\\r)+/g;
const imageSetUrlRE = /^(?:[\w\-]+\(.*?\)|'.*?'|".*?"|\S*)/;
function reduceSrcset(ret) {
    return ret.reduce((prev, { url, descriptor }, index) => {
        descriptor ?? (descriptor = '');
        return (prev +=
            url + ` ${descriptor}${index === ret.length - 1 ? '' : ', '}`);
    }, '');
}
function splitSrcSetDescriptor(srcs) {
    return splitSrcSet(srcs)
        .map((s) => {
        const src = s.replace(escapedSpaceCharacters, ' ').trim();
        const [url] = imageSetUrlRE.exec(src) || [''];
        return {
            url,
            descriptor: src?.slice(url.length).trim(),
        };
    })
        .filter(({ url }) => !!url);
}
function processSrcSet(srcs, replacer) {
    return Promise.all(splitSrcSetDescriptor(srcs).map(async ({ url, descriptor }) => ({
        url: await replacer({ url, descriptor }),
        descriptor,
    }))).then((ret) => reduceSrcset(ret));
}
function processSrcSetSync(srcs, replacer) {
    return reduceSrcset(splitSrcSetDescriptor(srcs).map(({ url, descriptor }) => ({
        url: replacer({ url, descriptor }),
        descriptor,
    })));
}
const cleanSrcSetRE = /(?:url|image|gradient|cross-fade)\([^)]*\)|"([^"]|(?<=\\)")*"|'([^']|(?<=\\)')*'/g;
function splitSrcSet(srcs) {
    const parts = [];
    // There could be a ',' inside of url(data:...), linear-gradient(...) or "data:..."
    const cleanedSrcs = srcs.replace(cleanSrcSetRE, blankReplacer);
    let startIndex = 0;
    let splitIndex;
    do {
        splitIndex = cleanedSrcs.indexOf(',', startIndex);
        parts.push(srcs.slice(startIndex, splitIndex !== -1 ? splitIndex : undefined));
        startIndex = splitIndex + 1;
    } while (splitIndex !== -1);
    return parts;
}
const windowsDriveRE = /^[A-Z]:/;
const replaceWindowsDriveRE = /^([A-Z]):\//;
const linuxAbsolutePathRE = /^\/[^/]/;
function escapeToLinuxLikePath(path) {
    if (windowsDriveRE.test(path)) {
        return path.replace(replaceWindowsDriveRE, '/windows/$1/');
    }
    if (linuxAbsolutePathRE.test(path)) {
        return `/linux${path}`;
    }
    return path;
}
const revertWindowsDriveRE = /^\/windows\/([A-Z])\//;
function unescapeToLinuxLikePath(path) {
    if (path.startsWith('/linux/')) {
        return path.slice('/linux'.length);
    }
    if (path.startsWith('/windows/')) {
        return path.replace(revertWindowsDriveRE, '$1:/');
    }
    return path;
}
// based on https://github.com/sveltejs/svelte/blob/abf11bb02b2afbd3e4cac509a0f70e318c306364/src/compiler/utils/mapped_code.ts#L221
const nullSourceMap = {
    names: [],
    sources: [],
    mappings: '',
    version: 3,
};
function combineSourcemaps(filename, sourcemapList, excludeContent = true) {
    if (sourcemapList.length === 0 ||
        sourcemapList.every((m) => m.sources.length === 0)) {
        return { ...nullSourceMap };
    }
    // hack for parse broken with normalized absolute paths on windows (C:/path/to/something).
    // escape them to linux like paths
    // also avoid mutation here to prevent breaking plugin's using cache to generate sourcemaps like vue (see #7442)
    sourcemapList = sourcemapList.map((sourcemap) => {
        const newSourcemaps = { ...sourcemap };
        newSourcemaps.sources = sourcemap.sources.map((source) => source ? escapeToLinuxLikePath(source) : null);
        if (sourcemap.sourceRoot) {
            newSourcemaps.sourceRoot = escapeToLinuxLikePath(sourcemap.sourceRoot);
        }
        return newSourcemaps;
    });
    const escapedFilename = escapeToLinuxLikePath(filename);
    // We don't declare type here so we can convert/fake/map as RawSourceMap
    let map; //: SourceMap
    let mapIndex = 1;
    const useArrayInterface = sourcemapList.slice(0, -1).find((m) => m.sources.length !== 1) === undefined;
    if (useArrayInterface) {
        map = remapping(sourcemapList, () => null, excludeContent);
    }
    else {
        map = remapping(sourcemapList[0], function loader(sourcefile) {
            if (sourcefile === escapedFilename && sourcemapList[mapIndex]) {
                return sourcemapList[mapIndex++];
            }
            else {
                return null;
            }
        }, excludeContent);
    }
    if (!map.file) {
        delete map.file;
    }
    // unescape the previous hack
    map.sources = map.sources.map((source) => source ? unescapeToLinuxLikePath(source) : source);
    map.file = filename;
    return map;
}
function unique(arr) {
    return Array.from(new Set(arr));
}
/**
 * Returns resolved localhost address when `dns.lookup` result differs from DNS
 *
 * `dns.lookup` result is same when defaultResultOrder is `verbatim`.
 * Even if defaultResultOrder is `ipv4first`, `dns.lookup` result maybe same.
 * For example, when IPv6 is not supported on that machine/network.
 */
async function getLocalhostAddressIfDiffersFromDNS() {
    const [nodeResult, dnsResult] = await Promise.all([
        promises.lookup('localhost'),
        promises.lookup('localhost', { verbatim: true }),
    ]);
    const isSame = nodeResult.family === dnsResult.family &&
        nodeResult.address === dnsResult.address;
    return isSame ? undefined : nodeResult.address;
}
function diffDnsOrderChange(oldUrls, newUrls) {
    return !(oldUrls === newUrls ||
        (oldUrls &&
            newUrls &&
            arrayEqual(oldUrls.local, newUrls.local) &&
            arrayEqual(oldUrls.network, newUrls.network)));
}
async function resolveHostname(optionsHost) {
    let host;
    if (optionsHost === undefined || optionsHost === false) {
        // Use a secure default
        host = 'localhost';
    }
    else if (optionsHost === true) {
        // If passed --host in the CLI without arguments
        host = undefined; // undefined typically means 0.0.0.0 or :: (listen on all IPs)
    }
    else {
        host = optionsHost;
    }
    // Set host name to localhost when possible
    let name = host === undefined || wildcardHosts.has(host) ? 'localhost' : host;
    if (host === 'localhost') {
        // See #8647 for more details.
        const localhostAddr = await getLocalhostAddressIfDiffersFromDNS();
        if (localhostAddr) {
            name = localhostAddr;
        }
    }
    return { host, name };
}
async function resolveServerUrls(server, options, config) {
    const address = server.address();
    const isAddressInfo = (x) => x?.address;
    if (!isAddressInfo(address)) {
        return { local: [], network: [] };
    }
    const local = [];
    const network = [];
    const hostname = await resolveHostname(options.host);
    const protocol = options.https ? 'https' : 'http';
    const port = address.port;
    const base = config.rawBase === './' || config.rawBase === '' ? '/' : config.rawBase;
    if (hostname.host !== undefined && !wildcardHosts.has(hostname.host)) {
        let hostnameName = hostname.name;
        // ipv6 host
        if (hostnameName.includes(':')) {
            hostnameName = `[${hostnameName}]`;
        }
        const address = `${protocol}://${hostnameName}:${port}${base}`;
        if (loopbackHosts.has(hostname.host)) {
            local.push(address);
        }
        else {
            network.push(address);
        }
    }
    else {
        Object.values(os.networkInterfaces())
            .flatMap((nInterface) => nInterface ?? [])
            .filter((detail) => detail &&
            detail.address &&
            (detail.family === 'IPv4' ||
                // @ts-expect-error Node 18.0 - 18.3 returns number
                detail.family === 4))
            .forEach((detail) => {
            let host = detail.address.replace('127.0.0.1', hostname.name);
            // ipv6 host
            if (host.includes(':')) {
                host = `[${host}]`;
            }
            const url = `${protocol}://${host}:${port}${base}`;
            if (detail.address.includes('127.0.0.1')) {
                local.push(url);
            }
            else {
                network.push(url);
            }
        });
    }
    return { local, network };
}
function arraify(target) {
    return Array.isArray(target) ? target : [target];
}
// Taken from https://stackoverflow.com/a/36328890
const multilineCommentsRE = /\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\//g;
const singlelineCommentsRE = /\/\/.*/g;
const requestQuerySplitRE = /\?(?!.*[/|}])/;
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
const dynamicImport = usingDynamicImport
    ? new Function('file', 'return import(file)')
    : _require$3;
function parseRequest(id) {
    const [_, search] = id.split(requestQuerySplitRE, 2);
    if (!search) {
        return null;
    }
    return Object.fromEntries(new URLSearchParams(search));
}
const blankReplacer = (match) => ' '.repeat(match.length);
function getHash(text) {
    return createHash('sha256').update(text).digest('hex').substring(0, 8);
}
const _dirname = path.dirname(fileURLToPath(import.meta.url));
const requireResolveFromRootWithFallback = (root, id) => {
    // check existence first, so if the package is not found,
    // it won't be cached by nodejs, since there isn't a way to invalidate them:
    // https://github.com/nodejs/node/issues/44663
    const found = resolvePackageData(id, root) || resolvePackageData(id, _dirname);
    if (!found) {
        const error = new Error(`${JSON.stringify(id)} not found.`);
        error.code = 'MODULE_NOT_FOUND';
        throw error;
    }
    // actually resolve
    // Search in the root directory first, and fallback to the default require paths.
    return _require$3.resolve(id, { paths: [root, _dirname] });
};
function emptyCssComments(raw) {
    return raw.replace(multilineCommentsRE, (s) => ' '.repeat(s.length));
}
function removeComments(raw) {
    return raw.replace(multilineCommentsRE, '').replace(singlelineCommentsRE, '');
}
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
/**
 * Transforms transpiled code result where line numbers aren't altered,
 * so we can skip sourcemap generation during dev
 */
function transformStableResult(s, id, config) {
    return {
        code: s.toString(),
        map: config.command === 'build' && config.build.sourcemap
            ? s.generateMap({ hires: true, source: id })
            : null,
    };
}
async function asyncFlatten(arr) {
    do {
        arr = (await Promise.all(arr)).flat(Infinity);
    } while (arr.some((v) => v?.then));
    return arr;
}
// strip UTF-8 BOM
function stripBomTag(content) {
    if (content.charCodeAt(0) === 0xfeff) {
        return content.slice(1);
    }
    return content;
}
const windowsDrivePathPrefixRE = /^[A-Za-z]:[/\\]/;
/**
 * path.isAbsolute also returns true for drive relative paths on windows (e.g. /something)
 * this function returns false for them but true for absolute paths (e.g. C:/something)
 */
const isNonDriveRelativeAbsolutePath = (p) => {
    if (!isWindows)
        return p[0] === '/';
    return windowsDrivePathPrefixRE.test(p);
};
/**
 * Determine if a file is being requested with the correct case, to ensure
 * consistent behaviour between dev and prod and across operating systems.
 */
function shouldServeFile(filePath, root) {
    // can skip case check on Linux
    if (!isCaseInsensitiveFS)
        return true;
    return hasCorrectCase(filePath, root);
}
/**
 * Note that we can't use realpath here, because we don't want to follow
 * symlinks.
 */
function hasCorrectCase(file, assets) {
    if (file === assets)
        return true;
    const parent = path.dirname(file);
    if (fs.readdirSync(parent).includes(path.basename(file))) {
        return hasCorrectCase(parent, assets);
    }
    return false;
}
function joinUrlSegments(a, b) {
    if (!a || !b) {
        return a || b || '';
    }
    if (a[a.length - 1] === '/') {
        a = a.substring(0, a.length - 1);
    }
    if (b[0] !== '/') {
        b = '/' + b;
    }
    return a + b;
}
function removeLeadingSlash(str) {
    return str[0] === '/' ? str.slice(1) : str;
}
function stripBase(path, base) {
    if (path === base) {
        return '/';
    }
    const devBase = base[base.length - 1] === '/' ? base : base + '/';
    return path.startsWith(devBase) ? path.slice(devBase.length - 1) : path;
}
function arrayEqual(a, b) {
    if (a === b)
        return true;
    if (a.length !== b.length)
        return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i])
            return false;
    }
    return true;
}
function evalValue(rawValue) {
    const fn = new Function(`
    var console, exports, global, module, process, require
    return (\n${rawValue}\n)
  `);
    return fn();
}
function getNpmPackageName(importPath) {
    const parts = importPath.split('/');
    if (parts[0][0] === '@') {
        if (!parts[1])
            return null;
        return `${parts[0]}/${parts[1]}`;
    }
    else {
        return parts[0];
    }
}
const escapeRegexRE = /[-/\\^$*+?.()|[\]{}]/g;
function escapeRegex(str) {
    return str.replace(escapeRegexRE, '\\$&');
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
function printServerUrls(urls, optionsHost, info) {
    const colorUrl = (url) => colors.cyan(url.replace(/:(\d+)\//, (_, port) => `:${colors.bold(port)}/`));
    for (const url of urls.local) {
        info(`  ${colors.green('➜')}  ${colors.bold('Local')}:   ${colorUrl(url)}`);
    }
    for (const url of urls.network) {
        info(`  ${colors.green('➜')}  ${colors.bold('Network')}: ${colorUrl(url)}`);
    }
    if (urls.network.length === 0 && optionsHost === undefined) {
        info(colors.dim(`  ${colors.green('➜')}  ${colors.bold('Network')}: use `) +
            colors.bold('--host') +
            colors.dim(' to expose'));
    }
}

const groups = [
    { name: 'Assets', color: colors.green },
    { name: 'CSS', color: colors.magenta },
    { name: 'JS', color: colors.cyan },
];
const COMPRESSIBLE_ASSETS_RE = /\.(?:html|json|svg|txt|xml|xhtml)$/;
function buildReporterPlugin(config) {
    const compress = promisify(gzip);
    const chunkLimit = config.build.chunkSizeWarningLimit;
    const tty = process.stdout.isTTY && !process.env.CI;
    const shouldLogInfo = LogLevels[config.logLevel || 'info'] >= LogLevels.info;
    let hasTransformed = false;
    let hasRenderedChunk = false;
    let hasCompressChunk = false;
    let transformedCount = 0;
    let chunkCount = 0;
    let compressedCount = 0;
    let startTime = Date.now();
    async function getCompressedSize(code) {
        if (config.build.ssr || !config.build.reportCompressedSize) {
            return null;
        }
        if (shouldLogInfo && !hasCompressChunk) {
            if (!tty) {
                config.logger.info('computing gzip size...');
            }
            else {
                writeLine('computing gzip size (0)...');
            }
            hasCompressChunk = true;
        }
        const compressed = await compress(typeof code === 'string' ? code : Buffer.from(code));
        compressedCount++;
        if (shouldLogInfo && tty) {
            writeLine(`computing gzip size (${compressedCount})...`);
        }
        return compressed.length;
    }
    const logTransform = throttle((id) => {
        writeLine(`transforming (${transformedCount}) ${colors.dim(path.relative(config.root, id))}`);
    });
    return {
        name: 'vite:reporter',
        transform(_, id) {
            transformedCount++;
            if (shouldLogInfo) {
                if (!tty) {
                    if (!hasTransformed) {
                        config.logger.info(`transforming...`);
                    }
                }
                else {
                    if (id.includes(`?`))
                        return;
                    logTransform(id);
                }
                hasTransformed = true;
            }
            return null;
        },
        options() {
            startTime = Date.now();
        },
        buildStart() {
            transformedCount = 0;
        },
        buildEnd() {
            if (shouldLogInfo) {
                if (tty) {
                    clearLine();
                }
                config.logger.info(`${colors.green(`✓`)} ${transformedCount} modules transformed.`);
            }
        },
        renderStart() {
            chunkCount = 0;
            compressedCount = 0;
        },
        renderChunk(code, chunk) {
            for (const id of chunk.moduleIds) {
                const module = this.getModuleInfo(id);
                if (!module)
                    continue;
                // When a dynamic importer shares a chunk with the imported module,
                // warn that the dynamic imported module will not be moved to another chunk (#12850).
                if (module.importers.length && module.dynamicImporters.length) {
                    // Filter out the intersection of dynamic importers and sibling modules in
                    // the same chunk. The intersecting dynamic importers' dynamic import is not
                    // expected to work. Note we're only detecting the direct ineffective
                    // dynamic import here.
                    if (module.dynamicImporters.some((m) => chunk.moduleIds.includes(m))) {
                        this.warn(`\n(!) ${module.id} is dynamically imported by ${module.dynamicImporters
                            .map((m) => m)
                            .join(', ')} but also statically imported by ${module.importers
                            .map((m) => m)
                            .join(', ')}, dynamic import will not move module into another chunk.\n`);
                    }
                }
            }
            chunkCount++;
            if (shouldLogInfo) {
                if (!tty) {
                    if (!hasRenderedChunk) {
                        config.logger.info('rendering chunks...');
                    }
                }
                else {
                    writeLine(`rendering chunks (${chunkCount})...`);
                }
                hasRenderedChunk = true;
            }
            return null;
        },
        generateBundle() {
            if (shouldLogInfo && tty)
                clearLine();
        },
        async writeBundle({ dir: outDir }, output) {
            let hasLargeChunks = false;
            if (shouldLogInfo) {
                const entries = (await Promise.all(Object.values(output).map(async (chunk) => {
                    if (chunk.type === 'chunk') {
                        return {
                            name: chunk.fileName,
                            group: 'JS',
                            size: chunk.code.length,
                            compressedSize: await getCompressedSize(chunk.code),
                            mapSize: chunk.map ? chunk.map.toString().length : null,
                        };
                    }
                    else {
                        if (chunk.fileName.endsWith('.map'))
                            return null;
                        const isCSS = chunk.fileName.endsWith('.css');
                        const isCompressible = isCSS || COMPRESSIBLE_ASSETS_RE.test(chunk.fileName);
                        return {
                            name: chunk.fileName,
                            group: isCSS ? 'CSS' : 'Assets',
                            size: chunk.source.length,
                            mapSize: null,
                            compressedSize: isCompressible
                                ? await getCompressedSize(chunk.source)
                                : null,
                        };
                    }
                }))).filter(isDefined);
                if (tty)
                    clearLine();
                let longest = 0;
                let biggestSize = 0;
                let biggestMap = 0;
                let biggestCompressSize = 0;
                for (const entry of entries) {
                    if (entry.name.length > longest)
                        longest = entry.name.length;
                    if (entry.size > biggestSize)
                        biggestSize = entry.size;
                    if (entry.mapSize && entry.mapSize > biggestMap) {
                        biggestMap = entry.mapSize;
                    }
                    if (entry.compressedSize &&
                        entry.compressedSize > biggestCompressSize) {
                        biggestCompressSize = entry.compressedSize;
                    }
                }
                const sizePad = displaySize(biggestSize).length;
                const mapPad = displaySize(biggestMap).length;
                const compressPad = displaySize(biggestCompressSize).length;
                const relativeOutDir = normalizePath(path.relative(config.root, path.resolve(config.root, outDir ?? config.build.outDir)));
                const assetsDir = path.join(config.build.assetsDir, '/');
                for (const group of groups) {
                    const filtered = entries.filter((e) => e.group === group.name);
                    if (!filtered.length)
                        continue;
                    for (const entry of filtered.sort((a, z) => a.size - z.size)) {
                        const isLarge = group.name === 'JS' && entry.size / 1000 > chunkLimit;
                        if (isLarge)
                            hasLargeChunks = true;
                        const sizeColor = isLarge ? colors.yellow : colors.dim;
                        let log = colors.dim(relativeOutDir + '/');
                        log +=
                            !config.build.lib && entry.name.startsWith(assetsDir)
                                ? colors.dim(assetsDir) +
                                    group.color(entry.name
                                        .slice(assetsDir.length)
                                        .padEnd(longest + 2 - assetsDir.length))
                                : group.color(entry.name.padEnd(longest + 2));
                        log += colors.bold(sizeColor(displaySize(entry.size).padStart(sizePad)));
                        if (entry.compressedSize) {
                            log += colors.dim(` │ gzip: ${displaySize(entry.compressedSize).padStart(compressPad)}`);
                        }
                        if (entry.mapSize) {
                            log += colors.dim(` │ map: ${displaySize(entry.mapSize).padStart(mapPad)}`);
                        }
                        config.logger.info(log);
                    }
                }
            }
            else {
                hasLargeChunks = Object.values(output).some((chunk) => {
                    return chunk.type === 'chunk' && chunk.code.length / 1000 > chunkLimit;
                });
            }
            if (hasLargeChunks &&
                config.build.minify &&
                !config.build.lib &&
                !config.build.ssr) {
                config.logger.warn(colors.yellow(`\n(!) Some chunks are larger than ${chunkLimit} kBs after minification. Consider:\n` +
                    `- Using dynamic import() to code-split the application\n` +
                    `- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks\n` +
                    `- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.`));
            }
        },
        closeBundle() {
            if (shouldLogInfo && !config.build.watch) {
                config.logger.info(`${colors.green(`✓ built in ${displayTime(Date.now() - startTime)}`)}`);
            }
        },
    };
}
function writeLine(output) {
    clearLine();
    if (output.length < process.stdout.columns) {
        process.stdout.write(output);
    }
    else {
        process.stdout.write(output.substring(0, process.stdout.columns - 1));
    }
}
function clearLine() {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
}
function throttle(fn) {
    let timerHandle = null;
    return (...args) => {
        if (timerHandle)
            return;
        fn(...args);
        timerHandle = setTimeout(() => {
            timerHandle = null;
        }, 100);
    };
}
function displaySize(bytes) {
    return `${(bytes / 1000).toLocaleString('en', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
    })} kB`;
}
function displayTime(time) {
    // display: {X}ms
    if (time < 1000) {
        return `${time}ms`;
    }
    time = time / 1000;
    // display: {X}s
    if (time < 60) {
        return `${time.toFixed(2)}s`;
    }
    const mins = parseInt((time / 60).toString());
    const seconds = time % 60;
    // display: {X}m {Y}s
    return `${mins}m${seconds < 1 ? '' : ` ${seconds.toFixed(0)}s`}`;
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
    const path = join$1(root, 'package.json');
    if (!isFileReadable(path)) {
        return false;
    }
    const content = JSON.parse(fs.readFileSync(path, 'utf-8')) || {};
    return !!content.workspaces;
}
function hasRootFile(root) {
    return ROOT_FILES.some((file) => fs.existsSync(join$1(root, file)));
}
function hasPackageJSON(root) {
    const path = join$1(root, 'package.json');
    return fs.existsSync(path);
}
/**
 * Search up for the nearest `package.json`
 */
function searchForPackageRoot(current, root = current) {
    if (hasPackageJSON(current))
        return current;
    const dir = dirname$1(current);
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
    const dir = dirname$1(current);
    // reach the fs root
    if (!dir || dir === current)
        return root;
    return searchForWorkspaceRoot(dir, root);
}

const debug$a = createDebugger('vite:esbuild');
const INJECT_HELPERS_IIFE_RE = /^(.*?)((?:const|var)\s+\S+\s*=\s*function\s*\([^)]*\)\s*\{.*?"use strict";)/s;
const INJECT_HELPERS_UMD_RE = /^(.*?)(\(function\([^)]*\)\s*\{.+?amd.+?function\([^)]*\)\s*\{.*?"use strict";)/s;
const validExtensionRE = /\.\w+$/;
const jsxExtensionsRE = /\.(?:j|t)sx\b/;
let server;
async function transformWithEsbuild(code, filename, options, inMap) {
    let loader = options?.loader;
    if (!loader) {
        // if the id ends with a valid ext, use it (e.g. vue blocks)
        // otherwise, cleanup the query before checking the ext
        const ext = path
            .extname(validExtensionRE.test(filename) ? filename : cleanUrl(filename))
            .slice(1);
        if (ext === 'cjs' || ext === 'mjs') {
            loader = 'js';
        }
        else if (ext === 'cts' || ext === 'mts') {
            loader = 'ts';
        }
        else {
            loader = ext;
        }
    }
    let tsconfigRaw = options?.tsconfigRaw;
    // if options provide tsconfigRaw in string, it takes highest precedence
    if (typeof tsconfigRaw !== 'string') {
        // these fields would affect the compilation result
        // https://esbuild.github.io/content-types/#tsconfig-json
        const meaningfulFields = [
            'alwaysStrict',
            'experimentalDecorators',
            'importsNotUsedAsValues',
            'jsx',
            'jsxFactory',
            'jsxFragmentFactory',
            'jsxImportSource',
            'preserveValueImports',
            'target',
            'useDefineForClassFields',
            'verbatimModuleSyntax',
        ];
        const compilerOptionsForFile = {};
        if (loader === 'ts' || loader === 'tsx') {
            const loadedTsconfig = await loadTsconfigJsonForFile(filename);
            const loadedCompilerOptions = loadedTsconfig.compilerOptions ?? {};
            for (const field of meaningfulFields) {
                if (field in loadedCompilerOptions) {
                    // @ts-expect-error TypeScript can't tell they are of the same type
                    compilerOptionsForFile[field] = loadedCompilerOptions[field];
                }
            }
        }
        const compilerOptions = {
            ...compilerOptionsForFile,
            ...tsconfigRaw?.compilerOptions,
        };
        // esbuild uses tsconfig fields when both the normal options and tsconfig was set
        // but we want to prioritize the normal options
        if (options) {
            options.jsx && (compilerOptions.jsx = undefined);
            options.jsxFactory && (compilerOptions.jsxFactory = undefined);
            options.jsxFragment && (compilerOptions.jsxFragmentFactory = undefined);
            options.jsxImportSource && (compilerOptions.jsxImportSource = undefined);
        }
        tsconfigRaw = {
            ...tsconfigRaw,
            compilerOptions,
        };
    }
    const resolvedOptions = {
        sourcemap: true,
        // ensure source file name contains full query
        sourcefile: filename,
        ...options,
        loader,
        tsconfigRaw,
    };
    // Some projects in the ecosystem are calling this function with an ESBuildOptions
    // object and esbuild throws an error for extra fields
    // @ts-expect-error include exists in ESBuildOptions
    delete resolvedOptions.include;
    // @ts-expect-error exclude exists in ESBuildOptions
    delete resolvedOptions.exclude;
    // @ts-expect-error jsxInject exists in ESBuildOptions
    delete resolvedOptions.jsxInject;
    try {
        const result = await transform(code, resolvedOptions);
        let map;
        if (inMap && resolvedOptions.sourcemap) {
            const nextMap = JSON.parse(result.map);
            nextMap.sourcesContent = [];
            map = combineSourcemaps(filename, [
                nextMap,
                inMap,
            ]);
        }
        else {
            map =
                resolvedOptions.sourcemap && resolvedOptions.sourcemap !== 'inline'
                    ? JSON.parse(result.map)
                    : { mappings: '' };
        }
        return {
            ...result,
            map,
        };
    }
    catch (e) {
        debug$a?.(`esbuild error with options used: `, resolvedOptions);
        // patch error information
        if (e.errors) {
            e.frame = '';
            e.errors.forEach((m) => {
                if (m.text === 'Experimental decorators are not currently enabled') {
                    m.text +=
                        '. Vite 4.4+ now uses esbuild 0.18 and you need to enable them by adding "experimentalDecorators": true in your "tsconfig.json" file.';
                }
                e.frame += `\n` + prettifyMessage(m, code);
            });
            e.loc = e.errors[0].location;
        }
        throw e;
    }
}
function esbuildPlugin(config) {
    const options = config.esbuild;
    const { jsxInject, include, exclude, ...esbuildTransformOptions } = options;
    const filter = createFilter(include || /\.(m?ts|[jt]sx)$/, exclude || /\.js$/);
    // Remove optimization options for dev as we only need to transpile them,
    // and for build as the final optimization is in `buildEsbuildPlugin`
    const transformOptions = {
        target: 'esnext',
        charset: 'utf8',
        ...esbuildTransformOptions,
        minify: false,
        minifyIdentifiers: false,
        minifySyntax: false,
        minifyWhitespace: false,
        treeShaking: false,
        // keepNames is not needed when minify is disabled.
        // Also transforming multiple times with keepNames enabled breaks
        // tree-shaking. (#9164)
        keepNames: false,
    };
    initTSConfck(config.root);
    return {
        name: 'vite:esbuild',
        configureServer(_server) {
            server = _server;
            server.watcher
                .on('add', reloadOnTsconfigChange)
                .on('change', reloadOnTsconfigChange)
                .on('unlink', reloadOnTsconfigChange);
        },
        buildEnd() {
            // recycle serve to avoid preventing Node self-exit (#6815)
            server = null;
        },
        async transform(code, id) {
            if (filter(id) || filter(cleanUrl(id))) {
                const result = await transformWithEsbuild(code, id, transformOptions);
                if (result.warnings.length) {
                    result.warnings.forEach((m) => {
                        this.warn(prettifyMessage(m, code));
                    });
                }
                if (jsxInject && jsxExtensionsRE.test(id)) {
                    result.code = jsxInject + ';' + result.code;
                }
                return {
                    code: result.code,
                    map: result.map,
                };
            }
        },
    };
}
const rollupToEsbuildFormatMap = {
    es: 'esm',
    cjs: 'cjs',
    // passing `var Lib = (() => {})()` to esbuild with format = "iife"
    // will turn it to `(() => { var Lib = (() => {})() })()`,
    // so we remove the format config to tell esbuild not doing this
    //
    // although esbuild doesn't change format, there is still possibility
    // that `{ treeShaking: true }` removes a top-level no-side-effect variable
    // like: `var Lib = 1`, which becomes `` after esbuild transforming,
    // but thankfully rollup does not do this optimization now
    iife: undefined,
};
const buildEsbuildPlugin = (config) => {
    initTSConfck(config.root);
    return {
        name: 'vite:esbuild-transpile',
        async renderChunk(code, chunk, opts) {
            // @ts-expect-error injected by @vitejs/plugin-legacy
            if (opts.__vite_skip_esbuild__) {
                return null;
            }
            const options = resolveEsbuildTranspileOptions(config, opts.format);
            if (!options) {
                return null;
            }
            const res = await transformWithEsbuild(code, chunk.fileName, options);
            if (config.build.lib) {
                // #7188, esbuild adds helpers out of the UMD and IIFE wrappers, and the
                // names are minified potentially causing collision with other globals.
                // We use a regex to inject the helpers inside the wrappers.
                // We don't need to create a MagicString here because both the helpers and
                // the headers don't modify the sourcemap
                const injectHelpers = opts.format === 'umd'
                    ? INJECT_HELPERS_UMD_RE
                    : opts.format === 'iife'
                        ? INJECT_HELPERS_IIFE_RE
                        : undefined;
                if (injectHelpers) {
                    res.code = res.code.replace(injectHelpers, (_, helpers, header) => header + helpers);
                }
            }
            return res;
        },
    };
};
function resolveEsbuildTranspileOptions(config, format) {
    const target = config.build.target;
    const minify = config.build.minify === 'esbuild';
    if ((!target || target === 'esnext') && !minify) {
        return null;
    }
    // Do not minify whitespace for ES lib output since that would remove
    // pure annotations and break tree-shaking
    // https://github.com/vuejs/core/issues/2860#issuecomment-926882793
    const isEsLibBuild = config.build.lib && format === 'es';
    const esbuildOptions = config.esbuild || {};
    const options = {
        charset: 'utf8',
        ...esbuildOptions,
        target: target || undefined,
        format: rollupToEsbuildFormatMap[format],
        // the final build should always support dynamic import and import.meta.
        // if they need to be polyfilled, plugin-legacy should be used.
        // plugin-legacy detects these two features when checking for modern code.
        supported: {
            'dynamic-import': true,
            'import-meta': true,
            ...esbuildOptions.supported,
        },
    };
    // If no minify, disable all minify options
    if (!minify) {
        return {
            ...options,
            minify: false,
            minifyIdentifiers: false,
            minifySyntax: false,
            minifyWhitespace: false,
            treeShaking: false,
        };
    }
    // If user enable fine-grain minify options, minify with their options instead
    if (options.minifyIdentifiers != null ||
        options.minifySyntax != null ||
        options.minifyWhitespace != null) {
        if (isEsLibBuild) {
            // Disable minify whitespace as it breaks tree-shaking
            return {
                ...options,
                minify: false,
                minifyIdentifiers: options.minifyIdentifiers ?? true,
                minifySyntax: options.minifySyntax ?? true,
                minifyWhitespace: false,
                treeShaking: true,
            };
        }
        else {
            return {
                ...options,
                minify: false,
                minifyIdentifiers: options.minifyIdentifiers ?? true,
                minifySyntax: options.minifySyntax ?? true,
                minifyWhitespace: options.minifyWhitespace ?? true,
                treeShaking: true,
            };
        }
    }
    // Else apply default minify options
    if (isEsLibBuild) {
        // Minify all except whitespace as it breaks tree-shaking
        return {
            ...options,
            minify: false,
            minifyIdentifiers: true,
            minifySyntax: true,
            minifyWhitespace: false,
            treeShaking: true,
        };
    }
    else {
        return {
            ...options,
            minify: true,
            treeShaking: true,
        };
    }
}
function prettifyMessage(m, code) {
    let res = colors.yellow(m.text);
    if (m.location) {
        const lines = code.split(/\r?\n/g);
        const line = Number(m.location.line);
        const column = Number(m.location.column);
        const offset = lines
            .slice(0, line - 1)
            .map((l) => l.length)
            .reduce((total, l) => total + l + 1, 0) + column;
        res += `\n` + generateCodeFrame(code, offset, offset + 1);
    }
    return res + `\n`;
}
let tsconfckRoot;
let tsconfckParseOptions = { resolveWithEmptyIfConfigNotFound: true };
function initTSConfck(root, force = false) {
    // bail if already cached
    if (!force && root === tsconfckRoot)
        return;
    const workspaceRoot = searchForWorkspaceRoot(root);
    tsconfckRoot = root;
    tsconfckParseOptions = initTSConfckParseOptions(workspaceRoot);
    // cached as the options value itself when promise is resolved
    tsconfckParseOptions.then((options) => {
        if (root === tsconfckRoot) {
            tsconfckParseOptions = options;
        }
    });
}
async function initTSConfckParseOptions(workspaceRoot) {
    const start = debug$a ? performance.now() : 0;
    const options = {
        cache: new Map(),
        root: workspaceRoot,
        tsConfigPaths: new Set(await findAll(workspaceRoot, {
            skip: (dir) => dir === 'node_modules' || dir === '.git',
        })),
        resolveWithEmptyIfConfigNotFound: true,
    };
    debug$a?.(timeFrom(start), 'tsconfck init', colors.dim(workspaceRoot));
    return options;
}
async function loadTsconfigJsonForFile(filename) {
    try {
        const result = await parse(filename, await tsconfckParseOptions);
        // tsconfig could be out of root, make sure it is watched on dev
        if (server && result.tsconfigFile !== 'no_tsconfig_file_found') {
            ensureWatchedFile(server.watcher, result.tsconfigFile, server.config.root);
        }
        return result.tsconfig;
    }
    catch (e) {
        if (e instanceof TSConfckParseError) {
            // tsconfig could be out of root, make sure it is watched on dev
            if (server && e.tsconfigFile) {
                ensureWatchedFile(server.watcher, e.tsconfigFile, server.config.root);
            }
        }
        throw e;
    }
}
async function reloadOnTsconfigChange(changedFile) {
    // server could be closed externally after a file change is detected
    if (!server)
        return;
    // any tsconfig.json that's added in the workspace could be closer to a code file than a previously cached one
    // any json file in the tsconfig cache could have been used to compile ts
    if (path.basename(changedFile) === 'tsconfig.json' ||
        (changedFile.endsWith('.json') &&
            (await tsconfckParseOptions)?.cache?.has(changedFile))) {
        server.config.logger.info(`changed tsconfig file detected: ${changedFile} - Clearing cache and forcing full-reload to ensure TypeScript is compiled with updated config values.`, { clear: server.config.clearScreen, timestamp: true });
        // clear module graph to remove code compiled with outdated config
        server.moduleGraph.invalidateAll();
        // reset tsconfck so that recompile works with up2date configs
        initTSConfck(server.config.root, true);
        // server may not be available if vite config is updated at the same time
        if (server) {
            // force full reload
            server.ws.send({
                type: 'full-reload',
                path: '*',
            });
        }
    }
}

let terserPath;
const loadTerserPath = (root) => {
    if (terserPath)
        return terserPath;
    try {
        terserPath = requireResolveFromRootWithFallback(root, 'terser');
    }
    catch (e) {
        if (e.code === 'MODULE_NOT_FOUND') {
            throw new Error('terser not found. Since Vite v3, terser has become an optional dependency. You need to install it.');
        }
        else {
            const message = new Error(`terser failed to load:\n${e.message}`);
            message.stack = e.stack + '\n' + message.stack;
            throw message;
        }
    }
    return terserPath;
};
function terserPlugin(config) {
    const makeWorker = () => new Worker(async (terserPath, code, options) => {
        // test fails when using `import`. maybe related: https://github.com/nodejs/node/issues/43205
        // eslint-disable-next-line no-restricted-globals -- this function runs inside cjs
        const terser = require(terserPath);
        return terser.minify(code, options);
    });
    let worker;
    return {
        name: 'vite:terser',
        async renderChunk(code, _chunk, outputOptions) {
            // This plugin is included for any non-false value of config.build.minify,
            // so that normal chunks can use the preferred minifier, and legacy chunks
            // can use terser.
            if (config.build.minify !== 'terser' &&
                // @ts-expect-error injected by @vitejs/plugin-legacy
                !outputOptions.__vite_force_terser__) {
                return null;
            }
            // Do not minify ES lib output since that would remove pure annotations
            // and break tree-shaking.
            if (config.build.lib && outputOptions.format === 'es') {
                return null;
            }
            // Lazy load worker.
            worker || (worker = makeWorker());
            const terserPath = loadTerserPath(config.root);
            const res = await worker.run(terserPath, code, {
                safari10: true,
                ...config.build.terserOptions,
                sourceMap: !!outputOptions.sourcemap,
                module: outputOptions.format.startsWith('es'),
                toplevel: outputOptions.format === 'cjs',
            });
            return {
                code: res.code,
                map: res.map,
            };
        },
        closeBundle() {
            worker?.stop();
        },
    };
}

const assetUrlRE = /__VITE_ASSET__([a-z\d]+)__(?:\$_(.*?)__)?/g;
const rawRE = /(?:\?|&)raw(?:&|$)/;
const urlRE = /(\?|&)url(?:&|$)/;
const jsSourceMapRE = /\.[cm]?js\.map$/;
const unnededFinalQueryCharRE = /[?&]$/;
const assetCache = new WeakMap();
const generatedAssets = new WeakMap();
// add own dictionary entry by directly assigning mrmime
function registerCustomMime() {
    // https://github.com/lukeed/mrmime/issues/3
    mrmime.mimes['ico'] = 'image/x-icon';
    // https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Containers#flac
    mrmime.mimes['flac'] = 'audio/flac';
    // mrmime and mime-db is not released yet: https://github.com/jshttp/mime-db/commit/c9242a9b7d4bb25d7a0c9244adec74aeef08d8a1
    mrmime.mimes['aac'] = 'audio/aac';
    // https://wiki.xiph.org/MIME_Types_and_File_Extensions#.opus_-_audio/ogg
    mrmime.mimes['opus'] = 'audio/ogg';
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
    mrmime.mimes['eot'] = 'application/vnd.ms-fontobject';
}
function renderAssetUrlInJS(ctx, config, chunk, opts, code) {
    const toRelativeRuntime = createToImportMetaURLBasedRelativeRuntime(opts.format, config.isWorker);
    let match;
    let s;
    // Urls added with JS using e.g.
    // imgElement.src = "__VITE_ASSET__5aa0ddc0__" are using quotes
    // Urls added in CSS that is imported in JS end up like
    // var inlined = ".inlined{color:green;background:url(__VITE_ASSET__5aa0ddc0__)}\n";
    // In both cases, the wrapping should already be fine
    assetUrlRE.lastIndex = 0;
    while ((match = assetUrlRE.exec(code))) {
        s || (s = new MagicString(code));
        const [full, referenceId, postfix = ''] = match;
        const file = ctx.getFileName(referenceId);
        chunk.viteMetadata.importedAssets.add(cleanUrl(file));
        const filename = file + postfix;
        const replacement = toOutputFilePathInJS(filename, 'asset', chunk.fileName, 'js', config, toRelativeRuntime);
        const replacementString = typeof replacement === 'string'
            ? JSON.stringify(replacement).slice(1, -1)
            : `"+${replacement.runtime}+"`;
        s.update(match.index, match.index + full.length, replacementString);
    }
    // Replace __VITE_PUBLIC_ASSET__5aa0ddc0__ with absolute paths
    const publicAssetUrlMap = publicAssetUrlCache.get(config);
    publicAssetUrlRE.lastIndex = 0;
    while ((match = publicAssetUrlRE.exec(code))) {
        s || (s = new MagicString(code));
        const [full, hash] = match;
        const publicUrl = publicAssetUrlMap.get(hash).slice(1);
        const replacement = toOutputFilePathInJS(publicUrl, 'public', chunk.fileName, 'js', config, toRelativeRuntime);
        const replacementString = typeof replacement === 'string'
            ? JSON.stringify(replacement).slice(1, -1)
            : `"+${replacement.runtime}+"`;
        s.update(match.index, match.index + full.length, replacementString);
    }
    return s;
}
/**
 * Also supports loading plain strings with import text from './foo.txt?raw'
 */
function assetPlugin(config) {
    registerCustomMime();
    return {
        name: 'vite:asset',
        buildStart() {
            assetCache.set(config, new Map());
            generatedAssets.set(config, new Map());
        },
        resolveId(id) {
            if (!config.assetsInclude(cleanUrl(id)) && !urlRE.test(id)) {
                return;
            }
            // imports to absolute urls pointing to files in /public
            // will fail to resolve in the main resolver. handle them here.
            const publicFile = checkPublicFile(id, config);
            if (publicFile) {
                return id;
            }
        },
        async load(id) {
            if (id[0] === '\0') {
                // Rollup convention, this id should be handled by the
                // plugin that marked it with \0
                return;
            }
            // raw requests, read from disk
            if (rawRE.test(id)) {
                const file = checkPublicFile(id, config) || cleanUrl(id);
                // raw query, read file and return as string
                return `export default ${JSON.stringify(await fsp.readFile(file, 'utf-8'))}`;
            }
            if (!config.assetsInclude(cleanUrl(id)) && !urlRE.test(id)) {
                return;
            }
            id = id.replace(urlRE, '$1').replace(unnededFinalQueryCharRE, '');
            const url = await fileToUrl(id, config, this);
            return `export default ${JSON.stringify(url)}`;
        },
        renderChunk(code, chunk, opts) {
            const s = renderAssetUrlInJS(this, config, chunk, opts, code);
            if (s) {
                return {
                    code: s.toString(),
                    map: config.build.sourcemap ? s.generateMap({ hires: true }) : null,
                };
            }
            else {
                return null;
            }
        },
        generateBundle(_, bundle) {
            // do not emit assets for SSR build
            if (config.command === 'build' &&
                config.build.ssr &&
                !config.build.ssrEmitAssets) {
                for (const file in bundle) {
                    if (bundle[file].type === 'asset' &&
                        !file.endsWith('ssr-manifest.json') &&
                        !jsSourceMapRE.test(file)) {
                        delete bundle[file];
                    }
                }
            }
        },
    };
}
function checkPublicFile(url, { publicDir }) {
    // note if the file is in /public, the resolver would have returned it
    // as-is so it's not going to be a fully resolved path.
    if (!publicDir || url[0] !== '/') {
        return;
    }
    const publicFile = path.join(publicDir, cleanUrl(url));
    if (!publicFile.startsWith(publicDir)) {
        // can happen if URL starts with '../'
        return;
    }
    if (fs.existsSync(publicFile)) {
        return publicFile;
    }
    else {
        return;
    }
}
async function fileToUrl(id, config, ctx) {
    if (config.command === 'serve') {
        return fileToDevUrl(id, config);
    }
    else {
        return fileToBuiltUrl(id, config, ctx);
    }
}
function fileToDevUrl(id, config) {
    let rtn;
    if (checkPublicFile(id, config)) {
        // in public dir, keep the url as-is
        rtn = id;
    }
    else if (id.startsWith(config.root)) {
        // in project root, infer short public path
        rtn = '/' + path.posix.relative(config.root, id);
    }
    else {
        // outside of project root, use absolute fs path
        // (this is special handled by the serve static middleware
        rtn = path.posix.join(FS_PREFIX, id);
    }
    const base = joinUrlSegments(config.server?.origin ?? '', config.base);
    return joinUrlSegments(base, removeLeadingSlash(rtn));
}
function getPublicAssetFilename(hash, config) {
    return publicAssetUrlCache.get(config)?.get(hash);
}
const publicAssetUrlCache = new WeakMap();
const publicAssetUrlRE = /__VITE_PUBLIC_ASSET__([a-z\d]{8})__/g;
function publicFileToBuiltUrl(url, config) {
    if (config.command !== 'build') {
        // We don't need relative base or renderBuiltUrl support during dev
        return joinUrlSegments(config.base, url);
    }
    const hash = getHash(url);
    let cache = publicAssetUrlCache.get(config);
    if (!cache) {
        cache = new Map();
        publicAssetUrlCache.set(config, cache);
    }
    if (!cache.get(hash)) {
        cache.set(hash, url);
    }
    return `__VITE_PUBLIC_ASSET__${hash}__`;
}
const GIT_LFS_PREFIX = Buffer$1.from('version https://git-lfs.github.com');
function isGitLfsPlaceholder(content) {
    if (content.length < GIT_LFS_PREFIX.length)
        return false;
    // Check whether the content begins with the characteristic string of Git LFS placeholders
    return GIT_LFS_PREFIX.compare(content, 0, GIT_LFS_PREFIX.length) === 0;
}
/**
 * Register an asset to be emitted as part of the bundle (if necessary)
 * and returns the resolved public URL
 */
async function fileToBuiltUrl(id, config, pluginContext, skipPublicCheck = false) {
    if (!skipPublicCheck && checkPublicFile(id, config)) {
        return publicFileToBuiltUrl(id, config);
    }
    const cache = assetCache.get(config);
    const cached = cache.get(id);
    if (cached) {
        return cached;
    }
    const file = cleanUrl(id);
    const content = await fsp.readFile(file);
    let url;
    if (config.build.lib ||
        (!file.endsWith('.svg') &&
            !file.endsWith('.html') &&
            content.length < Number(config.build.assetsInlineLimit) &&
            !isGitLfsPlaceholder(content))) {
        if (config.build.lib && isGitLfsPlaceholder(content)) {
            config.logger.warn(colors.yellow(`Inlined file ${id} was not downloaded via Git LFS`));
        }
        const mimeType = mrmime.lookup(file) ?? 'application/octet-stream';
        // base64 inlined as a string
        url = `data:${mimeType};base64,${content.toString('base64')}`;
    }
    else {
        // emit as asset
        const { search, hash } = parse$1(id);
        const postfix = (search || '') + (hash || '');
        const referenceId = pluginContext.emitFile({
            // Ignore directory structure for asset file names
            name: path.basename(file),
            type: 'asset',
            source: content,
        });
        const originalName = normalizePath(path.relative(config.root, file));
        generatedAssets.get(config).set(referenceId, { originalName });
        url = `__VITE_ASSET__${referenceId}__${postfix ? `$_${postfix}__` : ``}`; // TODO_BASE
    }
    cache.set(id, url);
    return url;
}
async function urlToBuiltUrl(url, importer, config, pluginContext) {
    if (checkPublicFile(url, config)) {
        return publicFileToBuiltUrl(url, config);
    }
    const file = url[0] === '/'
        ? path.join(config.root, url)
        : path.join(path.dirname(importer), url);
    return fileToBuiltUrl(file, config, pluginContext, 
    // skip public check since we just did it above
    true);
}

function manifestPlugin(config) {
    const manifest = {};
    let outputCount;
    return {
        name: 'vite:manifest',
        buildStart() {
            outputCount = 0;
        },
        generateBundle({ format }, bundle) {
            function getChunkName(chunk) {
                if (chunk.facadeModuleId) {
                    let name = normalizePath(path.relative(config.root, chunk.facadeModuleId));
                    if (format === 'system' && !chunk.name.includes('-legacy')) {
                        const ext = path.extname(name);
                        const endPos = ext.length !== 0 ? -ext.length : undefined;
                        name = name.slice(0, endPos) + `-legacy` + ext;
                    }
                    return name.replace(/\0/g, '');
                }
                else {
                    return `_` + path.basename(chunk.fileName);
                }
            }
            function getInternalImports(imports) {
                const filteredImports = [];
                for (const file of imports) {
                    if (bundle[file] === undefined) {
                        continue;
                    }
                    filteredImports.push(getChunkName(bundle[file]));
                }
                return filteredImports;
            }
            function createChunk(chunk) {
                const manifestChunk = {
                    file: chunk.fileName,
                };
                if (chunk.facadeModuleId) {
                    manifestChunk.src = getChunkName(chunk);
                }
                if (chunk.isEntry) {
                    manifestChunk.isEntry = true;
                }
                if (chunk.isDynamicEntry) {
                    manifestChunk.isDynamicEntry = true;
                }
                if (chunk.imports.length) {
                    const internalImports = getInternalImports(chunk.imports);
                    if (internalImports.length > 0) {
                        manifestChunk.imports = internalImports;
                    }
                }
                if (chunk.dynamicImports.length) {
                    const internalImports = getInternalImports(chunk.dynamicImports);
                    if (internalImports.length > 0) {
                        manifestChunk.dynamicImports = internalImports;
                    }
                }
                if (chunk.viteMetadata?.importedCss.size) {
                    manifestChunk.css = [...chunk.viteMetadata.importedCss];
                }
                if (chunk.viteMetadata?.importedAssets.size) {
                    manifestChunk.assets = [...chunk.viteMetadata.importedAssets];
                }
                return manifestChunk;
            }
            function createAsset(asset, src, isEntry) {
                const manifestChunk = {
                    file: asset.fileName,
                    src,
                };
                if (isEntry)
                    manifestChunk.isEntry = true;
                return manifestChunk;
            }
            const fileNameToAssetMeta = new Map();
            const assets = generatedAssets.get(config);
            assets.forEach((asset, referenceId) => {
                const fileName = this.getFileName(referenceId);
                fileNameToAssetMeta.set(fileName, asset);
            });
            const fileNameToAsset = new Map();
            for (const file in bundle) {
                const chunk = bundle[file];
                if (chunk.type === 'chunk') {
                    manifest[getChunkName(chunk)] = createChunk(chunk);
                }
                else if (chunk.type === 'asset' && typeof chunk.name === 'string') {
                    // Add every unique asset to the manifest, keyed by its original name
                    const assetMeta = fileNameToAssetMeta.get(chunk.fileName);
                    const src = assetMeta?.originalName ?? chunk.name;
                    const asset = createAsset(chunk, src, assetMeta?.isEntry);
                    manifest[src] = asset;
                    fileNameToAsset.set(chunk.fileName, asset);
                }
            }
            // Add deduplicated assets to the manifest
            assets.forEach(({ originalName }, referenceId) => {
                if (!manifest[originalName]) {
                    const fileName = this.getFileName(referenceId);
                    const asset = fileNameToAsset.get(fileName);
                    if (asset) {
                        manifest[originalName] = asset;
                    }
                }
            });
            outputCount++;
            const output = config.build.rollupOptions?.output;
            const outputLength = Array.isArray(output) ? output.length : 1;
            if (outputCount >= outputLength) {
                this.emitFile({
                    fileName: typeof config.build.manifest === 'string'
                        ? config.build.manifest
                        : 'manifest.json',
                    type: 'asset',
                    source: jsonStableStringify(manifest, { space: 2 }),
                });
            }
        },
    };
}

// This is based on @rollup/plugin-data-uri
const dataUriRE = /^([^/]+\/[^;,]+)(;base64)?,([\s\S]*)$/;
const base64RE = /base64/i;
const dataUriPrefix = `\0/@data-uri/`;
/**
 * Build only, since importing from a data URI works natively.
 */
function dataURIPlugin() {
    let resolved;
    return {
        name: 'vite:data-uri',
        buildStart() {
            resolved = new Map();
        },
        resolveId(id) {
            if (!dataUriRE.test(id)) {
                return;
            }
            const uri = new URL$1(id);
            if (uri.protocol !== 'data:') {
                return;
            }
            const match = uri.pathname.match(dataUriRE);
            if (!match) {
                return;
            }
            const [, mime, format, data] = match;
            if (mime !== 'text/javascript') {
                throw new Error(`data URI with non-JavaScript mime type is not supported. If you're using legacy JavaScript MIME types (such as 'application/javascript'), please use 'text/javascript' instead.`);
            }
            // decode data
            const base64 = format && base64RE.test(format.substring(1));
            const content = base64
                ? Buffer.from(data, 'base64').toString('utf-8')
                : data;
            resolved.set(id, content);
            return dataUriPrefix + id;
        },
        load(id) {
            if (id.startsWith(dataUriPrefix)) {
                return resolved.get(id.slice(dataUriPrefix.length));
            }
        },
    };
}

const debug$9 = createDebugger('vite:sourcemap', {
    onlyWhenFocused: true,
});
// Virtual modules should be prefixed with a null byte to avoid a
// false positive "missing source" warning. We also check for certain
// prefixes used for special handling in esbuildDepPlugin.
const virtualSourceRE = /^(?:dep:|browser-external:|virtual:)|\0/;
async function injectSourcesContent(map, file, logger) {
    let sourceRoot;
    try {
        // The source root is undefined for virtual modules and permission errors.
        sourceRoot = await fsp.realpath(path.resolve(path.dirname(file), map.sourceRoot || ''));
    }
    catch { }
    const missingSources = [];
    map.sourcesContent = await Promise.all(map.sources.map((sourcePath) => {
        if (sourcePath && !virtualSourceRE.test(sourcePath)) {
            sourcePath = decodeURI(sourcePath);
            if (sourceRoot) {
                sourcePath = path.resolve(sourceRoot, sourcePath);
            }
            return fsp.readFile(sourcePath, 'utf-8').catch(() => {
                missingSources.push(sourcePath);
                return null;
            });
        }
        return null;
    }));
    // Use this command…
    //    DEBUG="vite:sourcemap" vite build
    // …to log the missing sources.
    if (missingSources.length) {
        logger.warnOnce(`Sourcemap for "${file}" points to missing source files`);
        debug$9?.(`Missing sources:\n  ` + missingSources.join(`\n  `));
    }
}
function genSourceMapUrl(map) {
    if (typeof map !== 'string') {
        map = JSON.stringify(map);
    }
    return `data:application/json;base64,${Buffer.from(map).toString('base64')}`;
}
function getCodeWithSourcemap(type, code, map) {
    if (debug$9) {
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
function applySourcemapIgnoreList(map, sourcemapPath, sourcemapIgnoreList, logger) {
    let { x_google_ignoreList } = map;
    if (x_google_ignoreList === undefined) {
        x_google_ignoreList = [];
    }
    for (let sourcesIndex = 0; sourcesIndex < map.sources.length; ++sourcesIndex) {
        const sourcePath = map.sources[sourcesIndex];
        if (!sourcePath)
            continue;
        const ignoreList = sourcemapIgnoreList(path.isAbsolute(sourcePath)
            ? sourcePath
            : path.resolve(path.dirname(sourcemapPath), sourcePath), sourcemapPath);
        if (logger && typeof ignoreList !== 'boolean') {
            logger.warn('sourcemapIgnoreList function must return a boolean.');
        }
        if (ignoreList && !x_google_ignoreList.includes(sourcesIndex)) {
            x_google_ignoreList.push(sourcesIndex);
        }
    }
    if (x_google_ignoreList.length > 0) {
        if (!map.x_google_ignoreList)
            map.x_google_ignoreList = x_google_ignoreList;
    }
}

const normalizedClientEntry$1 = normalizePath(CLIENT_ENTRY);
const normalizedEnvEntry$1 = normalizePath(ENV_ENTRY);
// special id for paths marked with browser: false
// https://github.com/defunctzombie/package-browser-field-spec#ignore-a-module
const browserExternalId = '__vite-browser-external';
// special id for packages that are optional peer deps
const optionalPeerDepId = '__vite-optional-peer-dep';
const subpathImportsPrefix = '#';
const startsWithWordCharRE = /^\w/;
const debug$8 = createDebugger('vite:resolve-details', {
    onlyWhenFocused: true,
});
function resolvePlugin(resolveOptions) {
    const { root, isProduction, asSrc, ssrConfig, preferRelative = false, } = resolveOptions;
    const { target: ssrTarget, noExternal: ssrNoExternal } = ssrConfig ?? {};
    // In unix systems, absolute paths inside root first needs to be checked as an
    // absolute URL (/root/root/path-to-file) resulting in failed checks before falling
    // back to checking the path as absolute. If /root/root isn't a valid path, we can
    // avoid these checks. Absolute paths inside root are common in user code as many
    // paths are resolved by the user. For example for an alias.
    const rootInRoot = tryStatSync(path.join(root, root))?.isDirectory() ?? false;
    return {
        name: 'vite:resolve',
        async resolveId(id, importer, resolveOpts) {
            if (id[0] === '\0' ||
                id.startsWith('virtual:') ||
                // When injected directly in html/client code
                id.startsWith('/virtual:')) {
                return;
            }
            const ssr = resolveOpts?.ssr === true;
            // We need to delay depsOptimizer until here instead of passing it as an option
            // the resolvePlugin because the optimizer is created on server listen during dev
            const depsOptimizer = resolveOptions.getDepsOptimizer?.(ssr);
            if (id.startsWith(browserExternalId)) {
                return id;
            }
            const targetWeb = !ssr || ssrTarget === 'webworker';
            // this is passed by @rollup/plugin-commonjs
            const isRequire = resolveOpts?.custom?.['node-resolve']?.isRequire ?? false;
            const options = {
                isRequire,
                ...resolveOptions,
                scan: resolveOpts?.scan ?? resolveOptions.scan,
            };
            const resolvedImports = resolveSubpathImports(id, importer, options, targetWeb);
            if (resolvedImports) {
                id = resolvedImports;
                if (resolveOpts.custom?.['vite:import-glob']?.isSubImportsPattern) {
                    return id;
                }
            }
            if (importer) {
                if (isTsRequest(importer) ||
                    resolveOpts.custom?.depScan?.loader?.startsWith('ts')) {
                    options.isFromTsImporter = true;
                }
                else {
                    const moduleLang = this.getModuleInfo(importer)?.meta?.vite?.lang;
                    options.isFromTsImporter = moduleLang && isTsRequest(`.${moduleLang}`);
                }
            }
            let res;
            // resolve pre-bundled deps requests, these could be resolved by
            // tryFileResolve or /fs/ resolution but these files may not yet
            // exists if we are in the middle of a deps re-processing
            if (asSrc && depsOptimizer?.isOptimizedDepUrl(id)) {
                const optimizedPath = id.startsWith(FS_PREFIX)
                    ? fsPathFromId(id)
                    : normalizePath(path.resolve(root, id.slice(1)));
                return optimizedPath;
            }
            // explicit fs paths that starts with /@fs/*
            if (asSrc && id.startsWith(FS_PREFIX)) {
                res = fsPathFromId(id);
                // We don't need to resolve these paths since they are already resolved
                // always return here even if res doesn't exist since /@fs/ is explicit
                // if the file doesn't exist it should be a 404.
                debug$8?.(`[@fs] ${colors.cyan(id)} -> ${colors.dim(res)}`);
                return ensureVersionQuery(res, id, options, depsOptimizer);
            }
            // URL
            // /foo -> /fs-root/foo
            if (asSrc && id[0] === '/' && (rootInRoot || !id.startsWith(root))) {
                const fsPath = path.resolve(root, id.slice(1));
                if ((res = tryFsResolve(fsPath, options))) {
                    debug$8?.(`[url] ${colors.cyan(id)} -> ${colors.dim(res)}`);
                    return ensureVersionQuery(res, id, options, depsOptimizer);
                }
            }
            // relative
            if (id[0] === '.' ||
                ((preferRelative || importer?.endsWith('.html')) &&
                    startsWithWordCharRE.test(id))) {
                const basedir = importer ? path.dirname(importer) : process.cwd();
                const fsPath = path.resolve(basedir, id);
                // handle browser field mapping for relative imports
                const normalizedFsPath = normalizePath(fsPath);
                if (depsOptimizer?.isOptimizedDepFile(normalizedFsPath)) {
                    // Optimized files could not yet exist in disk, resolve to the full path
                    // Inject the current browserHash version if the path doesn't have one
                    if (!normalizedFsPath.match(DEP_VERSION_RE)) {
                        const browserHash = optimizedDepInfoFromFile(depsOptimizer.metadata, normalizedFsPath)?.browserHash;
                        if (browserHash) {
                            return injectQuery(normalizedFsPath, `v=${browserHash}`);
                        }
                    }
                    return normalizedFsPath;
                }
                if (targetWeb &&
                    options.browserField &&
                    (res = tryResolveBrowserMapping(fsPath, importer, options, true))) {
                    return res;
                }
                if ((res = tryFsResolve(fsPath, options))) {
                    res = ensureVersionQuery(res, id, options, depsOptimizer);
                    debug$8?.(`[relative] ${colors.cyan(id)} -> ${colors.dim(res)}`);
                    // If this isn't a script imported from a .html file, include side effects
                    // hints so the non-used code is properly tree-shaken during build time.
                    if (!options.idOnly &&
                        !options.scan &&
                        options.isBuild &&
                        !importer?.endsWith('.html')) {
                        const resPkg = findNearestPackageData(path.dirname(res), options.packageCache);
                        if (resPkg) {
                            return {
                                id: res,
                                moduleSideEffects: resPkg.hasSideEffects(res),
                            };
                        }
                    }
                    return res;
                }
            }
            // drive relative fs paths (only windows)
            if (isWindows && id[0] === '/') {
                const basedir = importer ? path.dirname(importer) : process.cwd();
                const fsPath = path.resolve(basedir, id);
                if ((res = tryFsResolve(fsPath, options))) {
                    debug$8?.(`[drive-relative] ${colors.cyan(id)} -> ${colors.dim(res)}`);
                    return ensureVersionQuery(res, id, options, depsOptimizer);
                }
            }
            // absolute fs paths
            if (isNonDriveRelativeAbsolutePath(id) &&
                (res = tryFsResolve(id, options))) {
                debug$8?.(`[fs] ${colors.cyan(id)} -> ${colors.dim(res)}`);
                return ensureVersionQuery(res, id, options, depsOptimizer);
            }
            // external
            if (isExternalUrl(id)) {
                return options.idOnly ? id : { id, external: true };
            }
            // data uri: pass through (this only happens during build and will be
            // handled by dedicated plugin)
            if (isDataUrl(id)) {
                return null;
            }
            // bare package imports, perform node resolve
            if (bareImportRE.test(id)) {
                const external = options.shouldExternalize?.(id, importer);
                if (!external &&
                    asSrc &&
                    depsOptimizer &&
                    !options.scan &&
                    (res = await tryOptimizedResolve(depsOptimizer, id, importer, options.preserveSymlinks, options.packageCache))) {
                    return res;
                }
                if (targetWeb &&
                    options.browserField &&
                    (res = tryResolveBrowserMapping(id, importer, options, false, external))) {
                    return res;
                }
                if ((res = tryNodeResolve(id, importer, options, targetWeb, depsOptimizer, ssr, external))) {
                    return res;
                }
                // node built-ins.
                // externalize if building for SSR, otherwise redirect to empty module
                if (isBuiltin(id)) {
                    if (ssr) {
                        if (ssrNoExternal === true) {
                            let message = `Cannot bundle Node.js built-in "${id}"`;
                            if (importer) {
                                message += ` imported from "${path.relative(process.cwd(), importer)}"`;
                            }
                            message += `. Consider disabling ssr.noExternal or remove the built-in dependency.`;
                            this.error(message);
                        }
                        return options.idOnly ? id : { id, external: true };
                    }
                    else {
                        if (!asSrc) {
                            debug$8?.(`externalized node built-in "${id}" to empty module. ` +
                                `(imported by: ${colors.white(colors.dim(importer))})`);
                        }
                        else if (isProduction) {
                            this.warn(`Module "${id}" has been externalized for browser compatibility, imported by "${importer}". ` +
                                `See http://vitejs.dev/guide/troubleshooting.html#module-externalized-for-browser-compatibility for more details.`);
                        }
                        return isProduction
                            ? browserExternalId
                            : `${browserExternalId}:${id}`;
                    }
                }
            }
            debug$8?.(`[fallthrough] ${colors.dim(id)}`);
        },
        load(id) {
            if (id.startsWith(browserExternalId)) {
                if (isProduction) {
                    return `export default {}`;
                }
                else {
                    id = id.slice(browserExternalId.length + 1);
                    return `\
export default new Proxy({}, {
  get(_, key) {
    throw new Error(\`Module "${id}" has been externalized for browser compatibility. Cannot access "${id}.\${key}" in client code.  See http://vitejs.dev/guide/troubleshooting.html#module-externalized-for-browser-compatibility for more details.\`)
  }
})`;
                }
            }
            if (id.startsWith(optionalPeerDepId)) {
                if (isProduction) {
                    return `export default {}`;
                }
                else {
                    const [, peerDep, parentDep] = id.split(':');
                    return `throw new Error(\`Could not resolve "${peerDep}" imported by "${parentDep}". Is it installed?\`)`;
                }
            }
        },
    };
}
function resolveSubpathImports(id, importer, options, targetWeb) {
    if (!importer || !id.startsWith(subpathImportsPrefix))
        return;
    const basedir = path.dirname(importer);
    const pkgData = findNearestPackageData(basedir, options.packageCache);
    if (!pkgData)
        return;
    let importsPath = resolveExportsOrImports(pkgData.data, id, options, targetWeb, 'imports');
    if (importsPath?.[0] === '.') {
        importsPath = path.relative(basedir, path.join(pkgData.dir, importsPath));
        if (importsPath[0] !== '.') {
            importsPath = `./${importsPath}`;
        }
    }
    return importsPath;
}
function ensureVersionQuery(resolved, id, options, depsOptimizer) {
    if (!options.isBuild &&
        !options.scan &&
        depsOptimizer &&
        !(resolved === normalizedClientEntry$1 || resolved === normalizedEnvEntry$1)) {
        // Ensure that direct imports of node_modules have the same version query
        // as if they would have been imported through a bare import
        // Use the original id to do the check as the resolved id may be the real
        // file path after symlinks resolution
        const isNodeModule = isInNodeModules(id) || isInNodeModules(resolved);
        if (isNodeModule && !resolved.match(DEP_VERSION_RE)) {
            const versionHash = depsOptimizer.metadata.browserHash;
            if (versionHash && isOptimizable(resolved, depsOptimizer.options)) {
                resolved = injectQuery(resolved, `v=${versionHash}`);
            }
        }
    }
    return resolved;
}
function splitFileAndPostfix(path) {
    const file = cleanUrl(path);
    return { file, postfix: path.slice(file.length) };
}
function tryFsResolve(fsPath, options, tryIndex = true, targetWeb = true, skipPackageJson = false) {
    // Dependencies like es5-ext use `#` in their paths. We don't support `#` in user
    // source code so we only need to perform the check for dependencies.
    // We don't support `?` in node_modules paths, so we only need to check in this branch.
    const hashIndex = fsPath.indexOf('#');
    if (hashIndex >= 0 && isInNodeModules(fsPath)) {
        const queryIndex = fsPath.indexOf('?');
        // We only need to check foo#bar?baz and foo#bar, ignore foo?bar#baz
        if (queryIndex < 0 || queryIndex > hashIndex) {
            const file = queryIndex > hashIndex ? fsPath.slice(0, queryIndex) : fsPath;
            const res = tryCleanFsResolve(file, options, tryIndex, targetWeb, skipPackageJson);
            if (res)
                return res + fsPath.slice(file.length);
        }
    }
    const { file, postfix } = splitFileAndPostfix(fsPath);
    const res = tryCleanFsResolve(file, options, tryIndex, targetWeb, skipPackageJson);
    if (res)
        return res + postfix;
}
const knownTsOutputRE = /\.(?:js|mjs|cjs|jsx)$/;
const isPossibleTsOutput = (url) => knownTsOutputRE.test(url);
function tryCleanFsResolve(file, options, tryIndex = true, targetWeb = true, skipPackageJson = false) {
    const { tryPrefix, extensions, preserveSymlinks } = options;
    const fileStat = tryStatSync(file);
    // Try direct match first
    if (fileStat?.isFile())
        return getRealPath(file, options.preserveSymlinks);
    let res;
    // If path.dirname is a valid directory, try extensions and ts resolution logic
    const possibleJsToTs = options.isFromTsImporter && isPossibleTsOutput(file);
    if (possibleJsToTs || extensions.length || tryPrefix) {
        const dirPath = path.dirname(file);
        const dirStat = tryStatSync(dirPath);
        if (dirStat?.isDirectory()) {
            if (possibleJsToTs) {
                // try resolve .js, .mjs, .cjs or .jsx import to typescript file
                const fileExt = path.extname(file);
                const fileName = file.slice(0, -fileExt.length);
                if ((res = tryResolveRealFile(fileName + fileExt.replace('js', 'ts'), preserveSymlinks)))
                    return res;
                // for .js, also try .tsx
                if (fileExt === '.js' &&
                    (res = tryResolveRealFile(fileName + '.tsx', preserveSymlinks)))
                    return res;
            }
            if ((res = tryResolveRealFileWithExtensions(file, extensions, preserveSymlinks)))
                return res;
            if (tryPrefix) {
                const prefixed = `${dirPath}/${options.tryPrefix}${path.basename(file)}`;
                if ((res = tryResolveRealFile(prefixed, preserveSymlinks)))
                    return res;
                if ((res = tryResolveRealFileWithExtensions(prefixed, extensions, preserveSymlinks)))
                    return res;
            }
        }
    }
    if (tryIndex && fileStat) {
        // Path points to a directory, check for package.json and entry and /index file
        const dirPath = file;
        if (!skipPackageJson) {
            let pkgPath = `${dirPath}/package.json`;
            try {
                if (fs.existsSync(pkgPath)) {
                    if (!options.preserveSymlinks) {
                        pkgPath = safeRealpathSync(pkgPath);
                    }
                    // path points to a node package
                    const pkg = loadPackageData(pkgPath);
                    return resolvePackageEntry(dirPath, pkg, targetWeb, options);
                }
            }
            catch (e) {
                if (e.code !== 'ENOENT')
                    throw e;
            }
        }
        if ((res = tryResolveRealFileWithExtensions(`${dirPath}/index`, extensions, preserveSymlinks)))
            return res;
        if (tryPrefix) {
            if ((res = tryResolveRealFileWithExtensions(`${dirPath}/${options.tryPrefix}index`, extensions, preserveSymlinks)))
                return res;
        }
    }
}
function tryResolveRealFile(file, preserveSymlinks) {
    const stat = tryStatSync(file);
    if (stat?.isFile())
        return getRealPath(file, preserveSymlinks);
}
function tryResolveRealFileWithExtensions(filePath, extensions, preserveSymlinks) {
    for (const ext of extensions) {
        const res = tryResolveRealFile(filePath + ext, preserveSymlinks);
        if (res)
            return res;
    }
}
function tryNodeResolve(id, importer, options, targetWeb, depsOptimizer, ssr = false, externalize, allowLinkedExternal = true) {
    const { root, dedupe, isBuild, preserveSymlinks, packageCache } = options;
    // check for deep import, e.g. "my-lib/foo"
    const deepMatch = id.match(deepImportRE);
    const pkgId = deepMatch ? deepMatch[1] || deepMatch[2] : id;
    let basedir;
    if (dedupe?.includes(pkgId)) {
        basedir = root;
    }
    else if (importer &&
        path.isAbsolute(importer) &&
        // css processing appends `*` for importer
        (importer[importer.length - 1] === '*' || fs.existsSync(cleanUrl(importer)))) {
        basedir = path.dirname(importer);
    }
    else {
        basedir = root;
    }
    const pkg = resolvePackageData(pkgId, basedir, preserveSymlinks, packageCache);
    if (!pkg) {
        // if import can't be found, check if it's an optional peer dep.
        // if so, we can resolve to a special id that errors only when imported.
        if (basedir !== root && // root has no peer dep
            !isBuiltin(id) &&
            !id.includes('\0') &&
            bareImportRE.test(id)) {
            const mainPkg = findNearestMainPackageData(basedir, packageCache)?.data;
            if (mainPkg) {
                if (mainPkg.peerDependencies?.[id] &&
                    mainPkg.peerDependenciesMeta?.[id]?.optional) {
                    return {
                        id: `${optionalPeerDepId}:${id}:${mainPkg.name}`,
                    };
                }
            }
        }
        return;
    }
    const resolveId = deepMatch ? resolveDeepImport : resolvePackageEntry;
    const unresolvedId = deepMatch ? '.' + id.slice(pkgId.length) : pkgId;
    let resolved;
    try {
        resolved = resolveId(unresolvedId, pkg, targetWeb, options);
    }
    catch (err) {
        if (!options.tryEsmOnly) {
            throw err;
        }
    }
    if (!resolved && options.tryEsmOnly) {
        resolved = resolveId(unresolvedId, pkg, targetWeb, {
            ...options,
            isRequire: false,
            mainFields: DEFAULT_MAIN_FIELDS,
            extensions: DEFAULT_EXTENSIONS,
        });
    }
    if (!resolved) {
        return;
    }
    const processResult = (resolved) => {
        if (!externalize) {
            return resolved;
        }
        // don't external symlink packages
        if (!allowLinkedExternal && !isInNodeModules(resolved.id)) {
            return resolved;
        }
        const resolvedExt = path.extname(resolved.id);
        // don't external non-js imports
        if (resolvedExt &&
            resolvedExt !== '.js' &&
            resolvedExt !== '.mjs' &&
            resolvedExt !== '.cjs') {
            return resolved;
        }
        let resolvedId = id;
        if (deepMatch && !pkg?.data.exports && path.extname(id) !== resolvedExt) {
            // id date-fns/locale
            // resolve.id ...date-fns/esm/locale/index.js
            const index = resolved.id.indexOf(id);
            if (index > -1) {
                resolvedId = resolved.id.slice(index);
                debug$8?.(`[processResult] ${colors.cyan(id)} -> ${colors.dim(resolvedId)}`);
            }
        }
        return { ...resolved, id: resolvedId, external: true };
    };
    if (!options.idOnly &&
        ((!options.scan && isBuild && !depsOptimizer) || externalize)) {
        // Resolve package side effects for build so that rollup can better
        // perform tree-shaking
        return processResult({
            id: resolved,
            moduleSideEffects: pkg.hasSideEffects(resolved),
        });
    }
    const ext = path.extname(resolved);
    if (!options.ssrOptimizeCheck &&
        (!isInNodeModules(resolved) || // linked
            !depsOptimizer || // resolving before listening to the server
            options.scan) // initial esbuild scan phase
    ) {
        return { id: resolved };
    }
    // if we reach here, it's a valid dep import that hasn't been optimized.
    const isJsType = depsOptimizer
        ? isOptimizable(resolved, depsOptimizer.options)
        : OPTIMIZABLE_ENTRY_RE.test(resolved);
    let exclude = depsOptimizer?.options.exclude;
    let include = depsOptimizer?.options.include;
    if (options.ssrOptimizeCheck) {
        // we don't have the depsOptimizer
        exclude = options.ssrConfig?.optimizeDeps?.exclude;
        include = options.ssrConfig?.optimizeDeps?.include;
    }
    const skipOptimization = depsOptimizer?.options.noDiscovery ||
        !isJsType ||
        (importer && isInNodeModules(importer)) ||
        exclude?.includes(pkgId) ||
        exclude?.includes(id) ||
        SPECIAL_QUERY_RE.test(resolved) ||
        // During dev SSR, we don't have a way to reload the module graph if
        // a non-optimized dep is found. So we need to skip optimization here.
        // The only optimized deps are the ones explicitly listed in the config.
        (!options.ssrOptimizeCheck && !isBuild && ssr) ||
        // Only optimize non-external CJS deps during SSR by default
        (ssr &&
            !(ext === '.cjs' ||
                (ext === '.js' &&
                    findNearestPackageData(path.dirname(resolved), options.packageCache)
                        ?.data.type !== 'module')) &&
            !(include?.includes(pkgId) || include?.includes(id)));
    if (options.ssrOptimizeCheck) {
        return {
            id: skipOptimization
                ? injectQuery(resolved, `__vite_skip_optimization`)
                : resolved,
        };
    }
    if (skipOptimization) {
        // excluded from optimization
        // Inject a version query to npm deps so that the browser
        // can cache it without re-validation, but only do so for known js types.
        // otherwise we may introduce duplicated modules for externalized files
        // from pre-bundled deps.
        if (!isBuild) {
            const versionHash = depsOptimizer.metadata.browserHash;
            if (versionHash && isJsType) {
                resolved = injectQuery(resolved, `v=${versionHash}`);
            }
        }
    }
    else {
        // this is a missing import, queue optimize-deps re-run and
        // get a resolved its optimized info
        const optimizedInfo = depsOptimizer.registerMissingImport(id, resolved);
        resolved = depsOptimizer.getOptimizedDepId(optimizedInfo);
    }
    if (!options.idOnly && !options.scan && isBuild) {
        // Resolve package side effects for build so that rollup can better
        // perform tree-shaking
        return {
            id: resolved,
            moduleSideEffects: pkg.hasSideEffects(resolved),
        };
    }
    else {
        return { id: resolved };
    }
}
async function tryOptimizedResolve(depsOptimizer, id, importer, preserveSymlinks, packageCache) {
    // TODO: we need to wait until scanning is done here as this function
    // is used in the preAliasPlugin to decide if an aliased dep is optimized,
    // and avoid replacing the bare import with the resolved path.
    // We should be able to remove this in the future
    await depsOptimizer.scanProcessing;
    const metadata = depsOptimizer.metadata;
    const depInfo = optimizedDepInfoFromId(metadata, id);
    if (depInfo) {
        return depsOptimizer.getOptimizedDepId(depInfo);
    }
    if (!importer)
        return;
    // further check if id is imported by nested dependency
    let idPkgDir;
    const nestedIdMatch = `> ${id}`;
    for (const optimizedData of metadata.depInfoList) {
        if (!optimizedData.src)
            continue; // Ignore chunks
        // check where "foo" is nested in "my-lib > foo"
        if (!optimizedData.id.endsWith(nestedIdMatch))
            continue;
        // lazily initialize idPkgDir
        if (idPkgDir == null) {
            idPkgDir = resolvePackageData(id, importer, preserveSymlinks, packageCache)?.dir;
            // if still null, it likely means that this id isn't a dep for importer.
            // break to bail early
            if (idPkgDir == null)
                break;
            idPkgDir = normalizePath(idPkgDir);
        }
        // match by src to correctly identify if id belongs to nested dependency
        if (optimizedData.src.startsWith(idPkgDir)) {
            return depsOptimizer.getOptimizedDepId(optimizedData);
        }
    }
}
function resolvePackageEntry(id, { dir, data, setResolvedCache, getResolvedCache }, targetWeb, options) {
    const cached = getResolvedCache('.', targetWeb);
    if (cached) {
        return cached;
    }
    try {
        let entryPoint;
        // resolve exports field with highest priority
        // using https://github.com/lukeed/resolve.exports
        if (data.exports) {
            entryPoint = resolveExportsOrImports(data, '.', options, targetWeb, 'exports');
        }
        const resolvedFromExports = !!entryPoint;
        // if exports resolved to .mjs, still resolve other fields.
        // This is because .mjs files can technically import .cjs files which would
        // make them invalid for pure ESM environments - so if other module/browser
        // fields are present, prioritize those instead.
        if (targetWeb &&
            options.browserField &&
            (!entryPoint || entryPoint.endsWith('.mjs'))) {
            // check browser field
            // https://github.com/defunctzombie/package-browser-field-spec
            const browserEntry = typeof data.browser === 'string'
                ? data.browser
                : isObject(data.browser) && data.browser['.'];
            if (browserEntry) {
                // check if the package also has a "module" field.
                if (!options.isRequire &&
                    options.mainFields.includes('module') &&
                    typeof data.module === 'string' &&
                    data.module !== browserEntry) {
                    // if both are present, we may have a problem: some package points both
                    // to ESM, with "module" targeting Node.js, while some packages points
                    // "module" to browser ESM and "browser" to UMD/IIFE.
                    // the heuristics here is to actually read the browser entry when
                    // possible and check for hints of ESM. If it is not ESM, prefer "module"
                    // instead; Otherwise, assume it's ESM and use it.
                    const resolvedBrowserEntry = tryFsResolve(path.join(dir, browserEntry), options);
                    if (resolvedBrowserEntry) {
                        const content = fs.readFileSync(resolvedBrowserEntry, 'utf-8');
                        if (hasESMSyntax(content)) {
                            // likely ESM, prefer browser
                            entryPoint = browserEntry;
                        }
                        else {
                            // non-ESM, UMD or IIFE or CJS(!!! e.g. firebase 7.x), prefer module
                            entryPoint = data.module;
                        }
                    }
                }
                else {
                    entryPoint = browserEntry;
                }
            }
        }
        // fallback to mainFields if still not resolved
        // TODO: review if `.mjs` check is still needed
        if (!resolvedFromExports && (!entryPoint || entryPoint.endsWith('.mjs'))) {
            for (const field of options.mainFields) {
                if (field === 'browser')
                    continue; // already checked above
                if (typeof data[field] === 'string') {
                    entryPoint = data[field];
                    break;
                }
            }
        }
        entryPoint || (entryPoint = data.main);
        // try default entry when entry is not define
        // https://nodejs.org/api/modules.html#all-together
        const entryPoints = entryPoint
            ? [entryPoint]
            : ['index.js', 'index.json', 'index.node'];
        for (let entry of entryPoints) {
            // make sure we don't get scripts when looking for sass
            let skipPackageJson = false;
            if (options.mainFields[0] === 'sass' &&
                !options.extensions.includes(path.extname(entry))) {
                entry = '';
                skipPackageJson = true;
            }
            else {
                // resolve object browser field in package.json
                const { browser: browserField } = data;
                if (targetWeb && options.browserField && isObject(browserField)) {
                    entry = mapWithBrowserField(entry, browserField) || entry;
                }
            }
            const entryPointPath = path.join(dir, entry);
            const resolvedEntryPoint = tryFsResolve(entryPointPath, options, true, true, skipPackageJson);
            if (resolvedEntryPoint) {
                debug$8?.(`[package entry] ${colors.cyan(id)} -> ${colors.dim(resolvedEntryPoint)}`);
                setResolvedCache('.', resolvedEntryPoint, targetWeb);
                return resolvedEntryPoint;
            }
        }
    }
    catch (e) {
        packageEntryFailure(id, e.message);
    }
    packageEntryFailure(id);
}
function packageEntryFailure(id, details) {
    throw new Error(`Failed to resolve entry for package "${id}". ` +
        `The package may have incorrect main/module/exports specified in its package.json` +
        (details ? ': ' + details : '.'));
}
function resolveExportsOrImports(pkg, key, options, targetWeb, type) {
    const additionalConditions = new Set(options.overrideConditions || [
        'production',
        'development',
        'module',
        ...options.conditions,
    ]);
    const conditions = [...additionalConditions].filter((condition) => {
        switch (condition) {
            case 'production':
                return options.isProduction;
            case 'development':
                return !options.isProduction;
        }
        return true;
    });
    const fn = type === 'imports' ? imports : exports;
    const result = fn(pkg, key, {
        browser: targetWeb && !additionalConditions.has('node'),
        require: options.isRequire && !additionalConditions.has('import'),
        conditions,
    });
    return result ? result[0] : undefined;
}
function resolveDeepImport(id, { webResolvedImports, setResolvedCache, getResolvedCache, dir, data, }, targetWeb, options) {
    const cache = getResolvedCache(id, targetWeb);
    if (cache) {
        return cache;
    }
    let relativeId = id;
    const { exports: exportsField, browser: browserField } = data;
    // map relative based on exports data
    if (exportsField) {
        if (isObject(exportsField) && !Array.isArray(exportsField)) {
            // resolve without postfix (see #7098)
            const { file, postfix } = splitFileAndPostfix(relativeId);
            const exportsId = resolveExportsOrImports(data, file, options, targetWeb, 'exports');
            if (exportsId !== undefined) {
                relativeId = exportsId + postfix;
            }
            else {
                relativeId = undefined;
            }
        }
        else {
            // not exposed
            relativeId = undefined;
        }
        if (!relativeId) {
            throw new Error(`Package subpath '${relativeId}' is not defined by "exports" in ` +
                `${path.join(dir, 'package.json')}.`);
        }
    }
    else if (targetWeb && options.browserField && isObject(browserField)) {
        // resolve without postfix (see #7098)
        const { file, postfix } = splitFileAndPostfix(relativeId);
        const mapped = mapWithBrowserField(file, browserField);
        if (mapped) {
            relativeId = mapped + postfix;
        }
        else if (mapped === false) {
            return (webResolvedImports[id] = browserExternalId);
        }
    }
    if (relativeId) {
        const resolved = tryFsResolve(path.join(dir, relativeId), options, !exportsField, // try index only if no exports field
        targetWeb);
        if (resolved) {
            debug$8?.(`[node/deep-import] ${colors.cyan(id)} -> ${colors.dim(resolved)}`);
            setResolvedCache(id, resolved, targetWeb);
            return resolved;
        }
    }
}
function tryResolveBrowserMapping(id, importer, options, isFilePath, externalize) {
    let res;
    const pkg = importer &&
        findNearestPackageData(path.dirname(importer), options.packageCache);
    if (pkg && isObject(pkg.data.browser)) {
        const mapId = isFilePath ? './' + slash(path.relative(pkg.dir, id)) : id;
        const browserMappedPath = mapWithBrowserField(mapId, pkg.data.browser);
        if (browserMappedPath) {
            if ((res = bareImportRE.test(browserMappedPath)
                ? tryNodeResolve(browserMappedPath, importer, options, true)?.id
                : tryFsResolve(path.join(pkg.dir, browserMappedPath), options))) {
                debug$8?.(`[browser mapped] ${colors.cyan(id)} -> ${colors.dim(res)}`);
                let result = { id: res };
                if (options.idOnly) {
                    return result;
                }
                if (!options.scan && options.isBuild) {
                    const resPkg = findNearestPackageData(path.dirname(res), options.packageCache);
                    if (resPkg) {
                        result = {
                            id: res,
                            moduleSideEffects: resPkg.hasSideEffects(res),
                        };
                    }
                }
                return externalize ? { ...result, external: true } : result;
            }
        }
        else if (browserMappedPath === false) {
            return browserExternalId;
        }
    }
}
/**
 * given a relative path in pkg dir,
 * return a relative path in pkg dir,
 * mapped with the "map" object
 *
 * - Returning `undefined` means there is no browser mapping for this id
 * - Returning `false` means this id is explicitly externalized for browser
 */
function mapWithBrowserField(relativePathInPkgDir, map) {
    const normalizedPath = path.posix.normalize(relativePathInPkgDir);
    for (const key in map) {
        const normalizedKey = path.posix.normalize(key);
        if (normalizedPath === normalizedKey ||
            equalWithoutSuffix(normalizedPath, normalizedKey, '.js') ||
            equalWithoutSuffix(normalizedPath, normalizedKey, '/index.js')) {
            return map[key];
        }
    }
}
function equalWithoutSuffix(path, key, suffix) {
    return key.endsWith(suffix) && key.slice(0, -suffix.length) === path;
}
function getRealPath(resolved, preserveSymlinks) {
    if (!preserveSymlinks && browserExternalId !== resolved) {
        resolved = safeRealpathSync(resolved);
    }
    return normalizePath(resolved);
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
        return Object.entries(parse$2(fs.readFileSync(filePath)));
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
    expand({ parsed });
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

const modulePreloadPolyfillId = 'vite/modulepreload-polyfill';
const resolvedModulePreloadPolyfillId = '\0' + modulePreloadPolyfillId;
function modulePreloadPolyfillPlugin(config) {
    // `isModernFlag` is only available during build since it is resolved by `vite:build-import-analysis`
    const skip = config.command !== 'build' || config.build.ssr;
    let polyfillString;
    return {
        name: 'vite:modulepreload-polyfill',
        resolveId(id) {
            if (id === modulePreloadPolyfillId) {
                return resolvedModulePreloadPolyfillId;
            }
        },
        load(id) {
            if (id === resolvedModulePreloadPolyfillId) {
                if (skip) {
                    return '';
                }
                if (!polyfillString) {
                    polyfillString = `${isModernFlag}&&(${polyfill.toString()}());`;
                }
                return { code: polyfillString, moduleSideEffects: true };
            }
        },
    };
}
function polyfill() {
    const relList = document.createElement('link').relList;
    if (relList && relList.supports && relList.supports('modulepreload')) {
        return;
    }
    for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
        processPreload(link);
    }
    new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.type !== 'childList') {
                continue;
            }
            for (const node of mutation.addedNodes) {
                if (node.tagName === 'LINK' && node.rel === 'modulepreload')
                    processPreload(node);
            }
        }
    }).observe(document, { childList: true, subtree: true });
    function getFetchOpts(link) {
        const fetchOpts = {};
        if (link.integrity)
            fetchOpts.integrity = link.integrity;
        if (link.referrerPolicy)
            fetchOpts.referrerPolicy = link.referrerPolicy;
        if (link.crossOrigin === 'use-credentials')
            fetchOpts.credentials = 'include';
        else if (link.crossOrigin === 'anonymous')
            fetchOpts.credentials = 'omit';
        else
            fetchOpts.credentials = 'same-origin';
        return fetchOpts;
    }
    function processPreload(link) {
        if (link.ep)
            // ep marker = processed
            return;
        link.ep = true;
        // prepopulate the load record
        const fetchOpts = getFetchOpts(link);
        fetch(link.href, fetchOpts);
    }
}

const htmlProxyRE$1 = /\?html-proxy=?(?:&inline-css)?(?:&style-attr)?&index=(\d+)\.(js|css)$/;
const inlineCSSRE$1 = /__VITE_INLINE_CSS__([a-z\d]{8}_\d+)__/g;
// Do not allow preceding '.', but do allow preceding '...' for spread operations
const inlineImportRE = /(?<!(?<!\.\.)\.)\bimport\s*\(("(?:[^"]|(?<=\\)")*"|'(?:[^']|(?<=\\)')*')\)/g;
const htmlLangRE = /\.(?:html|htm)$/;
const importMapRE = /[ \t]*<script[^>]*type\s*=\s*(?:"importmap"|'importmap'|importmap)[^>]*>.*?<\/script>/is;
const moduleScriptRE = /[ \t]*<script[^>]*type\s*=\s*(?:"module"|'module'|module)[^>]*>/i;
const modulePreloadLinkRE = /[ \t]*<link[^>]*rel\s*=\s*(?:"modulepreload"|'modulepreload'|modulepreload)[\s\S]*?\/>/i;
const importMapAppendRE = new RegExp([moduleScriptRE, modulePreloadLinkRE].map((r) => r.source).join('|'), 'i');
const isHTMLProxy = (id) => htmlProxyRE$1.test(id);
const isHTMLRequest = (request) => htmlLangRE.test(request);
// HTML Proxy Caches are stored by config -> filePath -> index
const htmlProxyMap = new WeakMap();
// HTML Proxy Transform result are stored by config
// `${hash(importer)}_${query.index}` -> transformed css code
// PS: key like `hash(/vite/playground/assets/index.html)_1`)
const htmlProxyResult = new Map();
function htmlInlineProxyPlugin(config) {
    // Should do this when `constructor` rather than when `buildStart`,
    // `buildStart` will be triggered multiple times then the cached result will be emptied.
    // https://github.com/vitejs/vite/issues/6372
    htmlProxyMap.set(config, new Map());
    return {
        name: 'vite:html-inline-proxy',
        resolveId(id) {
            if (htmlProxyRE$1.test(id)) {
                return id;
            }
        },
        load(id) {
            const proxyMatch = id.match(htmlProxyRE$1);
            if (proxyMatch) {
                const index = Number(proxyMatch[1]);
                const file = cleanUrl(id);
                const url = file.replace(normalizePath(config.root), '');
                const result = htmlProxyMap.get(config).get(url)[index];
                if (result) {
                    return result;
                }
                else {
                    throw new Error(`No matching HTML proxy module found from ${id}`);
                }
            }
        },
    };
}
function addToHTMLProxyCache(config, filePath, index, result) {
    if (!htmlProxyMap.get(config)) {
        htmlProxyMap.set(config, new Map());
    }
    if (!htmlProxyMap.get(config).get(filePath)) {
        htmlProxyMap.get(config).set(filePath, []);
    }
    htmlProxyMap.get(config).get(filePath)[index] = result;
}
function addToHTMLProxyTransformResult(hash, code) {
    htmlProxyResult.set(hash, code);
}
// this extends the config in @vue/compiler-sfc with <link href>
const assetAttrsConfig = {
    link: ['href'],
    video: ['src', 'poster'],
    source: ['src', 'srcset'],
    img: ['src', 'srcset'],
    image: ['xlink:href', 'href'],
    use: ['xlink:href', 'href'],
};
const isAsyncScriptMap = new WeakMap();
function nodeIsElement(node) {
    return node.nodeName[0] !== '#';
}
function traverseNodes(node, visitor) {
    visitor(node);
    if (nodeIsElement(node) ||
        node.nodeName === '#document' ||
        node.nodeName === '#document-fragment') {
        node.childNodes.forEach((childNode) => traverseNodes(childNode, visitor));
    }
}
async function traverseHtml(html, filePath, visitor) {
    // lazy load compiler
    const { parse } = await import('parse5');
    const ast = parse(html, {
        scriptingEnabled: false,
        sourceCodeLocationInfo: true,
        onParseError: (e) => {
            handleParseError(e, html, filePath);
        },
    });
    traverseNodes(ast, visitor);
}
function getScriptInfo(node) {
    let src;
    let sourceCodeLocation;
    let isModule = false;
    let isAsync = false;
    for (const p of node.attrs) {
        if (p.prefix !== undefined)
            continue;
        if (p.name === 'src') {
            if (!src) {
                src = p;
                sourceCodeLocation = node.sourceCodeLocation?.attrs['src'];
            }
        }
        else if (p.name === 'type' && p.value && p.value === 'module') {
            isModule = true;
        }
        else if (p.name === 'async') {
            isAsync = true;
        }
    }
    return { src, sourceCodeLocation, isModule, isAsync };
}
const attrValueStartRE = /=\s*(.)/;
function overwriteAttrValue(s, sourceCodeLocation, newValue) {
    const srcString = s.slice(sourceCodeLocation.startOffset, sourceCodeLocation.endOffset);
    const valueStart = srcString.match(attrValueStartRE);
    if (!valueStart) {
        // overwrite attr value can only be called for a well-defined value
        throw new Error(`[vite:html] internal error, failed to overwrite attribute value`);
    }
    const wrapOffset = valueStart[1] === '"' || valueStart[1] === "'" ? 1 : 0;
    const valueOffset = valueStart.index + valueStart[0].length - 1;
    s.update(sourceCodeLocation.startOffset + valueOffset + wrapOffset, sourceCodeLocation.endOffset - wrapOffset, newValue);
    return s;
}
/**
 * Format parse5 @type {ParserError} to @type {RollupError}
 */
function formatParseError(parserError, id, html) {
    const formattedError = {
        code: parserError.code,
        message: `parse5 error code ${parserError.code}`,
        frame: generateCodeFrame(html, parserError.startOffset),
        loc: {
            file: id,
            line: parserError.startLine,
            column: parserError.startCol,
        },
    };
    return formattedError;
}
function handleParseError(parserError, html, filePath) {
    switch (parserError.code) {
        case 'missing-doctype':
            // ignore missing DOCTYPE
            return;
        case 'abandoned-head-element-child':
            // Accept elements without closing tag in <head>
            return;
        case 'duplicate-attribute':
            // Accept duplicate attributes #9566
            // The first attribute is used, browsers silently ignore duplicates
            return;
        case 'non-void-html-element-start-tag-with-trailing-solidus':
            // Allow self closing on non-void elements #10439
            return;
    }
    const parseError = formatParseError(parserError, filePath, html);
    throw new Error(`Unable to parse HTML; ${parseError.message}\n` +
        ` at ${parseError.loc.file}:${parseError.loc.line}:${parseError.loc.column}\n` +
        `${parseError.frame}`);
}
/**
 * Compiles index.html into an entry js module
 */
function buildHtmlPlugin(config) {
    const [preHooks, normalHooks, postHooks] = resolveHtmlTransforms(config.plugins);
    preHooks.unshift(preImportMapHook(config));
    preHooks.push(htmlEnvHook(config));
    postHooks.push(postImportMapHook());
    const processedHtml = new Map();
    const isExcludedUrl = (url) => url[0] === '#' ||
        isExternalUrl(url) ||
        isDataUrl(url) ||
        checkPublicFile(url, config);
    // Same reason with `htmlInlineProxyPlugin`
    isAsyncScriptMap.set(config, new Map());
    return {
        name: 'vite:build-html',
        async transform(html, id) {
            if (id.endsWith('.html')) {
                const relativeUrlPath = path.posix.relative(config.root, normalizePath(id));
                const publicPath = `/${relativeUrlPath}`;
                const publicBase = getBaseInHTML(relativeUrlPath, config);
                const publicToRelative = (filename, importer) => publicBase + filename;
                const toOutputPublicFilePath = (url) => toOutputFilePathInHtml(url.slice(1), 'public', relativeUrlPath, 'html', config, publicToRelative);
                // pre-transform
                html = await applyHtmlTransforms(html, preHooks, {
                    path: publicPath,
                    filename: id,
                });
                let js = '';
                const s = new MagicString(html);
                const assetUrls = [];
                const scriptUrls = [];
                const styleUrls = [];
                let inlineModuleIndex = -1;
                let everyScriptIsAsync = true;
                let someScriptsAreAsync = false;
                let someScriptsAreDefer = false;
                await traverseHtml(html, id, (node) => {
                    if (!nodeIsElement(node)) {
                        return;
                    }
                    let shouldRemove = false;
                    // script tags
                    if (node.nodeName === 'script') {
                        const { src, sourceCodeLocation, isModule, isAsync } = getScriptInfo(node);
                        const url = src && src.value;
                        const isPublicFile = !!(url && checkPublicFile(url, config));
                        if (isPublicFile) {
                            // referencing public dir url, prefix with base
                            overwriteAttrValue(s, sourceCodeLocation, toOutputPublicFilePath(url));
                        }
                        if (isModule) {
                            inlineModuleIndex++;
                            if (url && !isExcludedUrl(url)) {
                                // <script type="module" src="..."/>
                                // add it as an import
                                js += `\nimport ${JSON.stringify(url)}`;
                                shouldRemove = true;
                            }
                            else if (node.childNodes.length) {
                                const scriptNode = node.childNodes.pop();
                                const contents = scriptNode.value;
                                // <script type="module">...</script>
                                const filePath = id.replace(normalizePath(config.root), '');
                                addToHTMLProxyCache(config, filePath, inlineModuleIndex, {
                                    code: contents,
                                });
                                js += `\nimport "${id}?html-proxy&index=${inlineModuleIndex}.js"`;
                                shouldRemove = true;
                            }
                            everyScriptIsAsync && (everyScriptIsAsync = isAsync);
                            someScriptsAreAsync || (someScriptsAreAsync = isAsync);
                            someScriptsAreDefer || (someScriptsAreDefer = !isAsync);
                        }
                        else if (url && !isPublicFile) {
                            if (!isExcludedUrl(url)) {
                                config.logger.warn(`<script src="${url}"> in "${publicPath}" can't be bundled without type="module" attribute`);
                            }
                        }
                        else if (node.childNodes.length) {
                            const scriptNode = node.childNodes.pop();
                            const cleanCode = stripLiteral(scriptNode.value);
                            let match;
                            inlineImportRE.lastIndex = 0;
                            while ((match = inlineImportRE.exec(cleanCode))) {
                                const { 1: url, index } = match;
                                const startUrl = cleanCode.indexOf(url, index);
                                const start = startUrl + 1;
                                const end = start + url.length - 2;
                                const startOffset = scriptNode.sourceCodeLocation.startOffset;
                                scriptUrls.push({
                                    start: start + startOffset,
                                    end: end + startOffset,
                                    url: scriptNode.value.slice(start, end),
                                });
                            }
                        }
                    }
                    // For asset references in index.html, also generate an import
                    // statement for each - this will be handled by the asset plugin
                    const assetAttrs = assetAttrsConfig[node.nodeName];
                    if (assetAttrs) {
                        for (const p of node.attrs) {
                            const attrKey = getAttrKey(p);
                            if (p.value && assetAttrs.includes(attrKey)) {
                                const attrSourceCodeLocation = node.sourceCodeLocation.attrs[attrKey];
                                // assetsUrl may be encodeURI
                                const url = decodeURI(p.value);
                                if (!isExcludedUrl(url)) {
                                    if (node.nodeName === 'link' &&
                                        isCSSRequest(url) &&
                                        // should not be converted if following attributes are present (#6748)
                                        !node.attrs.some((p) => p.prefix === undefined &&
                                            (p.name === 'media' || p.name === 'disabled'))) {
                                        // CSS references, convert to import
                                        const importExpression = `\nimport ${JSON.stringify(url)}`;
                                        styleUrls.push({
                                            url,
                                            start: node.sourceCodeLocation.startOffset,
                                            end: node.sourceCodeLocation.endOffset,
                                        });
                                        js += importExpression;
                                    }
                                    else {
                                        assetUrls.push({
                                            attr: p,
                                            sourceCodeLocation: attrSourceCodeLocation,
                                        });
                                    }
                                }
                                else if (checkPublicFile(url, config)) {
                                    overwriteAttrValue(s, attrSourceCodeLocation, toOutputPublicFilePath(url));
                                }
                            }
                        }
                    }
                    // <tag style="... url(...) or image-set(...) ..."></tag>
                    // extract inline styles as virtual css and add class attribute to tag for selecting
                    const inlineStyle = node.attrs.find((prop) => prop.prefix === undefined &&
                        prop.name === 'style' &&
                        // only url(...) or image-set(...) in css need to emit file
                        (prop.value.includes('url(') ||
                            prop.value.includes('image-set(')));
                    if (inlineStyle) {
                        inlineModuleIndex++;
                        // replace `inline style` to class
                        // and import css in js code
                        const code = inlineStyle.value;
                        const filePath = id.replace(normalizePath(config.root), '');
                        addToHTMLProxyCache(config, filePath, inlineModuleIndex, { code });
                        // will transform with css plugin and cache result with css-post plugin
                        js += `\nimport "${id}?html-proxy&inline-css&style-attr&index=${inlineModuleIndex}.css"`;
                        const hash = getHash(cleanUrl(id));
                        // will transform in `applyHtmlTransforms`
                        const sourceCodeLocation = node.sourceCodeLocation.attrs['style'];
                        overwriteAttrValue(s, sourceCodeLocation, `__VITE_INLINE_CSS__${hash}_${inlineModuleIndex}__`);
                    }
                    // <style>...</style>
                    if (node.nodeName === 'style' && node.childNodes.length) {
                        const styleNode = node.childNodes.pop();
                        const filePath = id.replace(normalizePath(config.root), '');
                        inlineModuleIndex++;
                        addToHTMLProxyCache(config, filePath, inlineModuleIndex, {
                            code: styleNode.value,
                        });
                        js += `\nimport "${id}?html-proxy&inline-css&index=${inlineModuleIndex}.css"`;
                        const hash = getHash(cleanUrl(id));
                        // will transform in `applyHtmlTransforms`
                        s.update(styleNode.sourceCodeLocation.startOffset, styleNode.sourceCodeLocation.endOffset, `__VITE_INLINE_CSS__${hash}_${inlineModuleIndex}__`);
                    }
                    if (shouldRemove) {
                        // remove the script tag from the html. we are going to inject new
                        // ones in the end.
                        s.remove(node.sourceCodeLocation.startOffset, node.sourceCodeLocation.endOffset);
                    }
                });
                isAsyncScriptMap.get(config).set(id, everyScriptIsAsync);
                if (someScriptsAreAsync && someScriptsAreDefer) {
                    config.logger.warn(`\nMixed async and defer script modules in ${id}, output script will fallback to defer. Every script, including inline ones, need to be marked as async for your output script to be async.`);
                }
                // for each encountered asset url, rewrite original html so that it
                // references the post-build location, ignoring empty attributes and
                // attributes that directly reference named output.
                const namedOutput = Object.keys(config?.build?.rollupOptions?.input || {});
                for (const { attr, sourceCodeLocation } of assetUrls) {
                    // assetsUrl may be encodeURI
                    const content = decodeURI(attr.value);
                    if (content !== '' && // Empty attribute
                        !namedOutput.includes(content) && // Direct reference to named output
                        !namedOutput.includes(removeLeadingSlash(content)) // Allow for absolute references as named output can't be an absolute path
                    ) {
                        try {
                            const url = attr.prefix === undefined && attr.name === 'srcset'
                                ? await processSrcSet(content, ({ url }) => urlToBuiltUrl(url, id, config, this))
                                : await urlToBuiltUrl(content, id, config, this);
                            overwriteAttrValue(s, sourceCodeLocation, url);
                        }
                        catch (e) {
                            if (e.code !== 'ENOENT') {
                                throw e;
                            }
                        }
                    }
                }
                // emit <script>import("./aaa")</script> asset
                for (const { start, end, url } of scriptUrls) {
                    if (!isExcludedUrl(url)) {
                        s.update(start, end, await urlToBuiltUrl(url, id, config, this));
                    }
                    else if (checkPublicFile(url, config)) {
                        s.update(start, end, toOutputPublicFilePath(url));
                    }
                }
                // ignore <link rel="stylesheet"> if its url can't be resolved
                const resolvedStyleUrls = await Promise.all(styleUrls.map(async (styleUrl) => ({
                    ...styleUrl,
                    resolved: await this.resolve(styleUrl.url, id),
                })));
                for (const { start, end, url, resolved } of resolvedStyleUrls) {
                    if (resolved == null) {
                        config.logger.warnOnce(`\n${url} doesn't exist at build time, it will remain unchanged to be resolved at runtime`);
                        const importExpression = `\nimport ${JSON.stringify(url)}`;
                        js = js.replace(importExpression, '');
                    }
                    else {
                        s.remove(start, end);
                    }
                }
                processedHtml.set(id, s.toString());
                // inject module preload polyfill only when configured and needed
                const { modulePreload } = config.build;
                if ((modulePreload === true ||
                    (typeof modulePreload === 'object' && modulePreload.polyfill)) &&
                    (someScriptsAreAsync || someScriptsAreDefer)) {
                    js = `import "${modulePreloadPolyfillId}";\n${js}`;
                }
                return js;
            }
        },
        async generateBundle(options, bundle) {
            const analyzedChunk = new Map();
            const getImportedChunks = (chunk, seen = new Set()) => {
                const chunks = [];
                chunk.imports.forEach((file) => {
                    const importee = bundle[file];
                    if (importee?.type === 'chunk' && !seen.has(file)) {
                        seen.add(file);
                        // post-order traversal
                        chunks.push(...getImportedChunks(importee, seen));
                        chunks.push(importee);
                    }
                });
                return chunks;
            };
            const toScriptTag = (chunk, toOutputPath, isAsync) => ({
                tag: 'script',
                attrs: {
                    ...(isAsync ? { async: true } : {}),
                    type: 'module',
                    crossorigin: true,
                    src: toOutputPath(chunk.fileName),
                },
            });
            const toPreloadTag = (filename, toOutputPath) => ({
                tag: 'link',
                attrs: {
                    rel: 'modulepreload',
                    crossorigin: true,
                    href: toOutputPath(filename),
                },
            });
            const getCssTagsForChunk = (chunk, toOutputPath, seen = new Set()) => {
                const tags = [];
                if (!analyzedChunk.has(chunk)) {
                    analyzedChunk.set(chunk, 1);
                    chunk.imports.forEach((file) => {
                        const importee = bundle[file];
                        if (importee?.type === 'chunk') {
                            tags.push(...getCssTagsForChunk(importee, toOutputPath, seen));
                        }
                    });
                }
                chunk.viteMetadata.importedCss.forEach((file) => {
                    if (!seen.has(file)) {
                        seen.add(file);
                        tags.push({
                            tag: 'link',
                            attrs: {
                                rel: 'stylesheet',
                                href: toOutputPath(file),
                            },
                        });
                    }
                });
                return tags;
            };
            for (const [id, html] of processedHtml) {
                const relativeUrlPath = path.posix.relative(config.root, normalizePath(id));
                const assetsBase = getBaseInHTML(relativeUrlPath, config);
                const toOutputFilePath = (filename, type) => {
                    if (isExternalUrl(filename)) {
                        return filename;
                    }
                    else {
                        return toOutputFilePathInHtml(filename, type, relativeUrlPath, 'html', config, (filename, importer) => assetsBase + filename);
                    }
                };
                const toOutputAssetFilePath = (filename) => toOutputFilePath(filename, 'asset');
                const toOutputPublicAssetFilePath = (filename) => toOutputFilePath(filename, 'public');
                const isAsync = isAsyncScriptMap.get(config).get(id);
                let result = html;
                // find corresponding entry chunk
                const chunk = Object.values(bundle).find((chunk) => chunk.type === 'chunk' &&
                    chunk.isEntry &&
                    chunk.facadeModuleId === id);
                let canInlineEntry = false;
                // inject chunk asset links
                if (chunk) {
                    // an entry chunk can be inlined if
                    //  - it's an ES module (e.g. not generated by the legacy plugin)
                    //  - it contains no meaningful code other than import statements
                    if (options.format === 'es' && isEntirelyImport(chunk.code)) {
                        canInlineEntry = true;
                    }
                    // when not inlined, inject <script> for entry and modulepreload its dependencies
                    // when inlined, discard entry chunk and inject <script> for everything in post-order
                    const imports = getImportedChunks(chunk);
                    let assetTags;
                    if (canInlineEntry) {
                        assetTags = imports.map((chunk) => toScriptTag(chunk, toOutputAssetFilePath, isAsync));
                    }
                    else {
                        assetTags = [toScriptTag(chunk, toOutputAssetFilePath, isAsync)];
                        const { modulePreload } = config.build;
                        if (modulePreload !== false) {
                            const resolveDependencies = typeof modulePreload === 'object' &&
                                modulePreload.resolveDependencies;
                            const importsFileNames = imports.map((chunk) => chunk.fileName);
                            const resolvedDeps = resolveDependencies
                                ? resolveDependencies(chunk.fileName, importsFileNames, {
                                    hostId: relativeUrlPath,
                                    hostType: 'html',
                                })
                                : importsFileNames;
                            assetTags.push(...resolvedDeps.map((i) => toPreloadTag(i, toOutputAssetFilePath)));
                        }
                    }
                    assetTags.push(...getCssTagsForChunk(chunk, toOutputAssetFilePath));
                    result = injectToHead(result, assetTags);
                }
                // inject css link when cssCodeSplit is false
                if (!config.build.cssCodeSplit) {
                    const cssChunk = Object.values(bundle).find((chunk) => chunk.type === 'asset' && chunk.name === 'style.css');
                    if (cssChunk) {
                        result = injectToHead(result, [
                            {
                                tag: 'link',
                                attrs: {
                                    rel: 'stylesheet',
                                    href: toOutputAssetFilePath(cssChunk.fileName),
                                },
                            },
                        ]);
                    }
                }
                // no use assets plugin because it will emit file
                let match;
                let s;
                inlineCSSRE$1.lastIndex = 0;
                while ((match = inlineCSSRE$1.exec(result))) {
                    s || (s = new MagicString(result));
                    const { 0: full, 1: scopedName } = match;
                    const cssTransformedCode = htmlProxyResult.get(scopedName);
                    s.update(match.index, match.index + full.length, cssTransformedCode);
                }
                if (s) {
                    result = s.toString();
                }
                result = await applyHtmlTransforms(result, [...normalHooks, ...postHooks], {
                    path: '/' + relativeUrlPath,
                    filename: id,
                    bundle,
                    chunk,
                });
                // resolve asset url references
                result = result.replace(assetUrlRE, (_, fileHash, postfix = '') => {
                    return toOutputAssetFilePath(this.getFileName(fileHash)) + postfix;
                });
                result = result.replace(publicAssetUrlRE, (_, fileHash) => {
                    const publicAssetPath = toOutputPublicAssetFilePath(getPublicAssetFilename(fileHash, config));
                    return isUrl(publicAssetPath)
                        ? publicAssetPath
                        : normalizePath(publicAssetPath);
                });
                if (chunk && canInlineEntry) {
                    // all imports from entry have been inlined to html, prevent rollup from outputting it
                    delete bundle[chunk.fileName];
                }
                const shortEmitName = normalizePath(path.relative(config.root, id));
                this.emitFile({
                    type: 'asset',
                    fileName: shortEmitName,
                    source: result,
                });
            }
        },
    };
}
function preImportMapHook(config) {
    return (html, ctx) => {
        const importMapIndex = html.match(importMapRE)?.index;
        if (importMapIndex === undefined)
            return;
        const importMapAppendIndex = html.match(importMapAppendRE)?.index;
        if (importMapAppendIndex === undefined)
            return;
        if (importMapAppendIndex < importMapIndex) {
            const relativeHtml = normalizePath(path.relative(config.root, ctx.filename));
            config.logger.warnOnce(colors.yellow(colors.bold(`(!) <script type="importmap"> should come before <script type="module"> and <link rel="modulepreload"> in /${relativeHtml}`)));
        }
    };
}
/**
 * Move importmap before the first module script and modulepreload link
 */
function postImportMapHook() {
    return (html) => {
        if (!importMapAppendRE.test(html))
            return;
        let importMap;
        html = html.replace(importMapRE, (match) => {
            importMap = match;
            return '';
        });
        if (importMap) {
            html = html.replace(importMapAppendRE, (match) => `${importMap}\n${match}`);
        }
        return html;
    };
}
/**
 * Support `%ENV_NAME%` syntax in html files
 */
function htmlEnvHook(config) {
    const pattern = /%(\S+?)%/g;
    const envPrefix = resolveEnvPrefix({ envPrefix: config.envPrefix });
    const env = { ...config.env };
    // account for user env defines
    for (const key in config.define) {
        if (key.startsWith(`import.meta.env.`)) {
            const val = config.define[key];
            env[key.slice(16)] = typeof val === 'string' ? val : JSON.stringify(val);
        }
    }
    return (html, ctx) => {
        return html.replace(pattern, (text, key) => {
            if (key in env) {
                return env[key];
            }
            else {
                if (envPrefix.some((prefix) => key.startsWith(prefix))) {
                    const relativeHtml = normalizePath(path.relative(config.root, ctx.filename));
                    config.logger.warn(colors.yellow(colors.bold(`(!) ${text} is not defined in env variables found in /${relativeHtml}. ` +
                        `Is the variable mistyped?`)));
                }
                return text;
            }
        });
    };
}
function resolveHtmlTransforms(plugins) {
    const preHooks = [];
    const normalHooks = [];
    const postHooks = [];
    for (const plugin of plugins) {
        const hook = plugin.transformIndexHtml;
        if (!hook)
            continue;
        if (typeof hook === 'function') {
            normalHooks.push(hook);
        }
        else {
            // `enforce` had only two possible values for the `transformIndexHtml` hook
            // `'pre'` and `'post'` (the default). `order` now works with three values
            // to align with other hooks (`'pre'`, normal, and `'post'`). We map
            // both `enforce: 'post'` to `order: undefined` to avoid a breaking change
            const order = hook.order ?? (hook.enforce === 'pre' ? 'pre' : undefined);
            // @ts-expect-error union type
            const handler = hook.handler ?? hook.transform;
            if (order === 'pre') {
                preHooks.push(handler);
            }
            else if (order === 'post') {
                postHooks.push(handler);
            }
            else {
                normalHooks.push(handler);
            }
        }
    }
    return [preHooks, normalHooks, postHooks];
}
async function applyHtmlTransforms(html, hooks, ctx) {
    for (const hook of hooks) {
        const res = await hook(html, ctx);
        if (!res) {
            continue;
        }
        if (typeof res === 'string') {
            html = res;
        }
        else {
            let tags;
            if (Array.isArray(res)) {
                tags = res;
            }
            else {
                html = res.html || html;
                tags = res.tags;
            }
            const headTags = [];
            const headPrependTags = [];
            const bodyTags = [];
            const bodyPrependTags = [];
            for (const tag of tags) {
                if (tag.injectTo === 'body') {
                    bodyTags.push(tag);
                }
                else if (tag.injectTo === 'body-prepend') {
                    bodyPrependTags.push(tag);
                }
                else if (tag.injectTo === 'head') {
                    headTags.push(tag);
                }
                else {
                    headPrependTags.push(tag);
                }
            }
            html = injectToHead(html, headPrependTags, true);
            html = injectToHead(html, headTags);
            html = injectToBody(html, bodyPrependTags, true);
            html = injectToBody(html, bodyTags);
        }
    }
    return html;
}
const importRE = /\bimport\s*("[^"]*[^\\]"|'[^']*[^\\]');*/g;
const commentRE$1 = /\/\*[\s\S]*?\*\/|\/\/.*$/gm;
function isEntirelyImport(code) {
    // only consider "side-effect" imports, which match <script type=module> semantics exactly
    // the regexes will remove too little in some exotic cases, but false-negatives are alright
    return !code.replace(importRE, '').replace(commentRE$1, '').trim().length;
}
function getBaseInHTML(urlRelativePath, config) {
    // Prefer explicit URL if defined for linking to assets and public files from HTML,
    // even when base relative is specified
    return config.base === './' || config.base === ''
        ? path.posix.join(path.posix.relative(urlRelativePath, '').slice(0, -2), './')
        : config.base;
}
const headInjectRE = /([ \t]*)<\/head>/i;
const headPrependInjectRE = /([ \t]*)<head[^>]*>/i;
const htmlInjectRE = /<\/html>/i;
const htmlPrependInjectRE = /([ \t]*)<html[^>]*>/i;
const bodyInjectRE = /([ \t]*)<\/body>/i;
const bodyPrependInjectRE = /([ \t]*)<body[^>]*>/i;
const doctypePrependInjectRE = /<!doctype html>/i;
function injectToHead(html, tags, prepend = false) {
    if (tags.length === 0)
        return html;
    if (prepend) {
        // inject as the first element of head
        if (headPrependInjectRE.test(html)) {
            return html.replace(headPrependInjectRE, (match, p1) => `${match}\n${serializeTags(tags, incrementIndent(p1))}`);
        }
    }
    else {
        // inject before head close
        if (headInjectRE.test(html)) {
            // respect indentation of head tag
            return html.replace(headInjectRE, (match, p1) => `${serializeTags(tags, incrementIndent(p1))}${match}`);
        }
        // try to inject before the body tag
        if (bodyPrependInjectRE.test(html)) {
            return html.replace(bodyPrependInjectRE, (match, p1) => `${serializeTags(tags, p1)}\n${match}`);
        }
    }
    // if no head tag is present, we prepend the tag for both prepend and append
    return prependInjectFallback(html, tags);
}
function injectToBody(html, tags, prepend = false) {
    if (tags.length === 0)
        return html;
    if (prepend) {
        // inject after body open
        if (bodyPrependInjectRE.test(html)) {
            return html.replace(bodyPrependInjectRE, (match, p1) => `${match}\n${serializeTags(tags, incrementIndent(p1))}`);
        }
        // if no there is no body tag, inject after head or fallback to prepend in html
        if (headInjectRE.test(html)) {
            return html.replace(headInjectRE, (match, p1) => `${match}\n${serializeTags(tags, p1)}`);
        }
        return prependInjectFallback(html, tags);
    }
    else {
        // inject before body close
        if (bodyInjectRE.test(html)) {
            return html.replace(bodyInjectRE, (match, p1) => `${serializeTags(tags, incrementIndent(p1))}${match}`);
        }
        // if no body tag is present, append to the html tag, or at the end of the file
        if (htmlInjectRE.test(html)) {
            return html.replace(htmlInjectRE, `${serializeTags(tags)}\n$&`);
        }
        return html + `\n` + serializeTags(tags);
    }
}
function prependInjectFallback(html, tags) {
    // prepend to the html tag, append after doctype, or the document start
    if (htmlPrependInjectRE.test(html)) {
        return html.replace(htmlPrependInjectRE, `$&\n${serializeTags(tags)}`);
    }
    if (doctypePrependInjectRE.test(html)) {
        return html.replace(doctypePrependInjectRE, `$&\n${serializeTags(tags)}`);
    }
    return serializeTags(tags) + html;
}
const unaryTags = new Set(['link', 'meta', 'base']);
function serializeTag({ tag, attrs, children }, indent = '') {
    if (unaryTags.has(tag)) {
        return `<${tag}${serializeAttrs(attrs)}>`;
    }
    else {
        return `<${tag}${serializeAttrs(attrs)}>${serializeTags(children, incrementIndent(indent))}</${tag}>`;
    }
}
function serializeTags(tags, indent = '') {
    if (typeof tags === 'string') {
        return tags;
    }
    else if (tags && tags.length) {
        return tags.map((tag) => `${indent}${serializeTag(tag, indent)}\n`).join('');
    }
    return '';
}
function serializeAttrs(attrs) {
    let res = '';
    for (const key in attrs) {
        if (typeof attrs[key] === 'boolean') {
            res += attrs[key] ? ` ${key}` : ``;
        }
        else {
            res += ` ${key}=${JSON.stringify(attrs[key])}`;
        }
    }
    return res;
}
function incrementIndent(indent = '') {
    return `${indent}${indent[0] === '\t' ? '\t' : '  '}`;
}
function getAttrKey(attr) {
    return attr.prefix === undefined ? attr.name : `${attr.prefix}:${attr.name}`;
}

function resolveCSSOptions(options) {
    if (options?.lightningcss) {
        return {
            ...options,
            lightningcss: {
                ...options.lightningcss,
                targets: options.lightningcss.targets ??
                    convertTargets(ESBUILD_MODULES_TARGET),
            },
        };
    }
    // TS doesn't narrow the type with the previous if :/
    return options;
}
const cssModuleRE = new RegExp(`\\.module${CSS_LANGS_RE.source}`);
const directRequestRE = /[?&]direct\b/;
const htmlProxyRE = /[?&]html-proxy\b/;
const commonjsProxyRE = /\?commonjs-proxy/;
const inlineRE = /[?&]inline\b/;
const inlineCSSRE = /[?&]inline-css\b/;
const styleAttrRE = /[?&]style-attr\b/;
const usedRE = /[?&]used\b/;
const varRE = /^var\(/i;
const cssBundleName = 'style.css';
const isCSSRequest = (request) => CSS_LANGS_RE.test(request);
const isModuleCSSRequest = (request) => cssModuleRE.test(request);
const isDirectCSSRequest = (request) => CSS_LANGS_RE.test(request) && directRequestRE.test(request);
const isDirectRequest = (request) => directRequestRE.test(request);
const cssModulesCache = new WeakMap();
const removedPureCssFilesCache = new WeakMap();
const postcssConfigCache = new WeakMap();
function encodePublicUrlsInCSS(config) {
    return config.command === 'build';
}
/**
 * Plugin applied before user plugins
 */
function cssPlugin(config) {
    let server;
    let moduleCache;
    const resolveUrl = config.createResolver({
        preferRelative: true,
        tryIndex: false,
        extensions: [],
    });
    // warm up cache for resolved postcss config
    if (config.css?.transformer !== 'lightningcss') {
        resolvePostcssConfig(config);
    }
    return {
        name: 'vite:css',
        configureServer(_server) {
            server = _server;
        },
        buildStart() {
            // Ensure a new cache for every build (i.e. rebuilding in watch mode)
            moduleCache = new Map();
            cssModulesCache.set(config, moduleCache);
            removedPureCssFilesCache.set(config, new Map());
        },
        async transform(raw, id, options) {
            if (!isCSSRequest(id) ||
                commonjsProxyRE.test(id) ||
                SPECIAL_QUERY_RE.test(id)) {
                return;
            }
            const ssr = options?.ssr === true;
            const urlReplacer = async (url, importer) => {
                if (checkPublicFile(url, config)) {
                    if (encodePublicUrlsInCSS(config)) {
                        return publicFileToBuiltUrl(url, config);
                    }
                    else {
                        return joinUrlSegments(config.base, url);
                    }
                }
                const resolved = await resolveUrl(url, importer);
                if (resolved) {
                    return fileToUrl(resolved, config, this);
                }
                if (config.command === 'build') {
                    const isExternal = config.build.rollupOptions.external
                        ? resolveUserExternal(config.build.rollupOptions.external, url, // use URL as id since id could not be resolved
                        id, false)
                        : false;
                    if (!isExternal) {
                        // #9800 If we cannot resolve the css url, leave a warning.
                        config.logger.warnOnce(`\n${url} referenced in ${id} didn't resolve at build time, it will remain unchanged to be resolved at runtime`);
                    }
                }
                return url;
            };
            const { code: css, modules, deps, map, } = await compileCSS(id, raw, config, urlReplacer);
            if (modules) {
                moduleCache.set(id, modules);
            }
            // track deps for build watch mode
            if (config.command === 'build' && config.build.watch && deps) {
                for (const file of deps) {
                    this.addWatchFile(file);
                }
            }
            // dev
            if (server) {
                // server only logic for handling CSS @import dependency hmr
                const { moduleGraph } = server;
                const thisModule = moduleGraph.getModuleById(id);
                if (thisModule) {
                    // CSS modules cannot self-accept since it exports values
                    const isSelfAccepting = !modules && !inlineRE.test(id) && !htmlProxyRE.test(id);
                    if (deps) {
                        // record deps in the module graph so edits to @import css can trigger
                        // main import to hot update
                        const depModules = new Set();
                        const devBase = config.base;
                        for (const file of deps) {
                            depModules.add(isCSSRequest(file)
                                ? moduleGraph.createFileOnlyEntry(file)
                                : await moduleGraph.ensureEntryFromUrl(stripBase(await fileToUrl(file, config, this), (config.server?.origin ?? '') + devBase), ssr));
                        }
                        moduleGraph.updateModuleInfo(thisModule, depModules, null, 
                        // The root CSS proxy module is self-accepting and should not
                        // have an explicit accept list
                        new Set(), null, isSelfAccepting, ssr);
                        for (const file of deps) {
                            this.addWatchFile(file);
                        }
                    }
                    else {
                        thisModule.isSelfAccepting = isSelfAccepting;
                    }
                }
            }
            return {
                code: css,
                map,
            };
        },
    };
}
/**
 * Plugin applied after user plugins
 */
function cssPostPlugin(config) {
    // styles initialization in buildStart causes a styling loss in watch
    const styles = new Map();
    // list of css emit tasks to guarantee the files are emitted in a deterministic order
    let emitTasks = [];
    let pureCssChunks;
    // when there are multiple rollup outputs and extracting CSS, only emit once,
    // since output formats have no effect on the generated CSS.
    let outputToExtractedCSSMap;
    let hasEmitted = false;
    const rollupOptionsOutput = config.build.rollupOptions.output;
    const assetFileNames = (Array.isArray(rollupOptionsOutput)
        ? rollupOptionsOutput[0]
        : rollupOptionsOutput)?.assetFileNames;
    const getCssAssetDirname = (cssAssetName) => {
        if (!assetFileNames) {
            return config.build.assetsDir;
        }
        else if (typeof assetFileNames === 'string') {
            return path.dirname(assetFileNames);
        }
        else {
            return path.dirname(assetFileNames({
                name: cssAssetName,
                type: 'asset',
                source: '/* vite internal call, ignore */',
            }));
        }
    };
    return {
        name: 'vite:css-post',
        buildStart() {
            // Ensure new caches for every build (i.e. rebuilding in watch mode)
            pureCssChunks = new Set();
            outputToExtractedCSSMap = new Map();
            hasEmitted = false;
            emitTasks = [];
        },
        async transform(css, id, options) {
            if (!isCSSRequest(id) ||
                commonjsProxyRE.test(id) ||
                SPECIAL_QUERY_RE.test(id)) {
                return;
            }
            css = stripBomTag(css);
            const inlined = inlineRE.test(id);
            const modules = cssModulesCache.get(config).get(id);
            // #6984, #7552
            // `foo.module.css` => modulesCode
            // `foo.module.css?inline` => cssContent
            const modulesCode = modules &&
                !inlined &&
                dataToEsm(modules, { namedExports: true, preferConst: true });
            if (config.command === 'serve') {
                const getContentWithSourcemap = async (content) => {
                    if (config.css?.devSourcemap) {
                        const sourcemap = this.getCombinedSourcemap();
                        if (sourcemap.mappings && !sourcemap.sourcesContent) {
                            await injectSourcesContent(sourcemap, cleanUrl(id), config.logger);
                        }
                        return getCodeWithSourcemap('css', content, sourcemap);
                    }
                    return content;
                };
                if (isDirectCSSRequest(id)) {
                    return null;
                }
                // server only
                if (options?.ssr) {
                    return modulesCode || `export default ${JSON.stringify(css)}`;
                }
                if (inlined) {
                    return `export default ${JSON.stringify(css)}`;
                }
                const cssContent = await getContentWithSourcemap(css);
                const code = [
                    `import { updateStyle as __vite__updateStyle, removeStyle as __vite__removeStyle } from ${JSON.stringify(path.posix.join(config.base, CLIENT_PUBLIC_PATH))}`,
                    `const __vite__id = ${JSON.stringify(id)}`,
                    `const __vite__css = ${JSON.stringify(cssContent)}`,
                    `__vite__updateStyle(__vite__id, __vite__css)`,
                    // css modules exports change on edit so it can't self accept
                    `${modulesCode ||
                        `import.meta.hot.accept()\nexport default __vite__css`}`,
                    `import.meta.hot.prune(() => __vite__removeStyle(__vite__id))`,
                ].join('\n');
                return { code, map: { mappings: '' } };
            }
            // build CSS handling ----------------------------------------------------
            // record css
            // cache css compile result to map
            // and then use the cache replace inline-style-flag when `generateBundle` in vite:build-html plugin
            const inlineCSS = inlineCSSRE.test(id);
            const isHTMLProxy = htmlProxyRE.test(id);
            const query = parseRequest(id);
            if (inlineCSS && isHTMLProxy) {
                if (styleAttrRE.test(id)) {
                    css = css.replace(/"/g, '&quot;');
                }
                addToHTMLProxyTransformResult(`${getHash(cleanUrl(id))}_${Number.parseInt(query.index)}`, css);
                return `export default ''`;
            }
            if (!inlined) {
                styles.set(id, css);
            }
            let code;
            if (usedRE.test(id)) {
                if (modulesCode) {
                    code = modulesCode;
                }
                else {
                    let content = css;
                    if (config.build.cssMinify) {
                        content = await minifyCSS(content, config);
                    }
                    code = `export default ${JSON.stringify(content)}`;
                }
            }
            else {
                // if moduleCode exists return it **even if** it does not have `?used`
                // this will disable tree-shake to work with `import './foo.module.css'` but this usually does not happen
                // this is a limitation of the current approach by `?used` to make tree-shake work
                // See #8936 for more details
                code = modulesCode || `export default ''`;
            }
            return {
                code,
                map: { mappings: '' },
                // avoid the css module from being tree-shaken so that we can retrieve
                // it in renderChunk()
                moduleSideEffects: inlined ? false : 'no-treeshake',
            };
        },
        async renderChunk(code, chunk, opts) {
            let chunkCSS = '';
            let isPureCssChunk = true;
            const ids = Object.keys(chunk.modules);
            for (const id of ids) {
                if (styles.has(id)) {
                    chunkCSS += styles.get(id);
                    // a css module contains JS, so it makes this not a pure css chunk
                    if (cssModuleRE.test(id)) {
                        isPureCssChunk = false;
                    }
                }
                else {
                    // if the module does not have a style, then it's not a pure css chunk.
                    // this is true because in the `transform` hook above, only modules
                    // that are css gets added to the `styles` map.
                    isPureCssChunk = false;
                }
            }
            if (!chunkCSS) {
                return null;
            }
            const publicAssetUrlMap = publicAssetUrlCache.get(config);
            // resolve asset URL placeholders to their built file URLs
            const resolveAssetUrlsInCss = (chunkCSS, cssAssetName) => {
                const encodedPublicUrls = encodePublicUrlsInCSS(config);
                const relative = config.base === './' || config.base === '';
                const cssAssetDirname = encodedPublicUrls || relative
                    ? getCssAssetDirname(cssAssetName)
                    : undefined;
                const toRelative = (filename) => {
                    // relative base + extracted CSS
                    const relativePath = path.posix.relative(cssAssetDirname, filename);
                    return relativePath[0] === '.' ? relativePath : './' + relativePath;
                };
                // replace asset url references with resolved url.
                chunkCSS = chunkCSS.replace(assetUrlRE, (_, fileHash, postfix = '') => {
                    const filename = this.getFileName(fileHash) + postfix;
                    chunk.viteMetadata.importedAssets.add(cleanUrl(filename));
                    return toOutputFilePathInCss(filename, 'asset', cssAssetName, 'css', config, toRelative);
                });
                // resolve public URL from CSS paths
                if (encodedPublicUrls) {
                    const relativePathToPublicFromCSS = path.posix.relative(cssAssetDirname, '');
                    chunkCSS = chunkCSS.replace(publicAssetUrlRE, (_, hash) => {
                        const publicUrl = publicAssetUrlMap.get(hash).slice(1);
                        return toOutputFilePathInCss(publicUrl, 'public', cssAssetName, 'css', config, () => `${relativePathToPublicFromCSS}/${publicUrl}`);
                    });
                }
                return chunkCSS;
            };
            function ensureFileExt(name, ext) {
                return normalizePath(path.format({ ...path.parse(name), base: undefined, ext }));
            }
            if (config.build.cssCodeSplit) {
                if (isPureCssChunk) {
                    // this is a shared CSS-only chunk that is empty.
                    pureCssChunks.add(chunk);
                }
                if (opts.format === 'es' || opts.format === 'cjs') {
                    const cssAssetName = chunk.facadeModuleId
                        ? normalizePath(path.relative(config.root, chunk.facadeModuleId))
                        : chunk.name;
                    const lang = path.extname(cssAssetName).slice(1);
                    const cssFileName = ensureFileExt(cssAssetName, '.css');
                    chunkCSS = resolveAssetUrlsInCss(chunkCSS, cssAssetName);
                    const previousTask = emitTasks[emitTasks.length - 1];
                    // finalizeCss is async which makes `emitFile` non-deterministic, so
                    // we use a `.then` to wait for previous tasks before finishing this
                    const thisTask = finalizeCss(chunkCSS, true, config).then((css) => {
                        chunkCSS = css;
                        // make sure the previous task is also finished, this works recursively
                        return previousTask;
                    });
                    // push this task so the next task can wait for this one
                    emitTasks.push(thisTask);
                    const emitTasksLength = emitTasks.length;
                    // wait for this and previous tasks to finish
                    await thisTask;
                    // emit corresponding css file
                    const referenceId = this.emitFile({
                        name: path.basename(cssFileName),
                        type: 'asset',
                        source: chunkCSS,
                    });
                    const originalName = isPreProcessor(lang) ? cssAssetName : cssFileName;
                    const isEntry = chunk.isEntry && isPureCssChunk;
                    generatedAssets
                        .get(config)
                        .set(referenceId, { originalName, isEntry });
                    chunk.viteMetadata.importedCss.add(this.getFileName(referenceId));
                    if (emitTasksLength === emitTasks.length) {
                        // this is the last task, clear `emitTasks` to free up memory
                        emitTasks = [];
                    }
                }
                else if (!config.build.ssr) {
                    // legacy build and inline css
                    // Entry chunk CSS will be collected into `chunk.viteMetadata.importedCss`
                    // and injected later by the `'vite:build-html'` plugin into the `index.html`
                    // so it will be duplicated. (https://github.com/vitejs/vite/issues/2062#issuecomment-782388010)
                    // But because entry chunk can be imported by dynamic import,
                    // we shouldn't remove the inlined CSS. (#10285)
                    chunkCSS = await finalizeCss(chunkCSS, true, config);
                    let cssString = JSON.stringify(chunkCSS);
                    cssString =
                        renderAssetUrlInJS(this, config, chunk, opts, cssString)?.toString() || cssString;
                    const style = `__vite_style__`;
                    const injectCode = `var ${style} = document.createElement('style');` +
                        `${style}.textContent = ${cssString};` +
                        `document.head.appendChild(${style});`;
                    const wrapIdx = code.indexOf('System.register');
                    const executeFnStart = code.indexOf('{', code.indexOf('execute:', wrapIdx)) + 1;
                    const s = new MagicString(code);
                    s.appendRight(executeFnStart, injectCode);
                    if (config.build.sourcemap) {
                        // resolve public URL from CSS paths, we need to use absolute paths
                        return {
                            code: s.toString(),
                            map: s.generateMap({ hires: true }),
                        };
                    }
                    else {
                        return { code: s.toString() };
                    }
                }
            }
            else {
                chunkCSS = resolveAssetUrlsInCss(chunkCSS, cssBundleName);
                // finalizeCss is called for the aggregated chunk in generateBundle
                outputToExtractedCSSMap.set(opts, (outputToExtractedCSSMap.get(opts) || '') + chunkCSS);
            }
            return null;
        },
        augmentChunkHash(chunk) {
            if (chunk.viteMetadata?.importedCss.size) {
                let hash = '';
                for (const id of chunk.viteMetadata.importedCss) {
                    hash += id;
                }
                return hash;
            }
        },
        async generateBundle(opts, bundle) {
            // @ts-expect-error asset emits are skipped in legacy bundle
            if (opts.__vite_skip_asset_emit__) {
                return;
            }
            // remove empty css chunks and their imports
            if (pureCssChunks.size) {
                // map each pure css chunk (rendered chunk) to it's corresponding bundle
                // chunk. we check that by comparing the `moduleIds` as they have different
                // filenames (rendered chunk has the !~{XXX}~ placeholder)
                const pureCssChunkNames = [];
                for (const pureCssChunk of pureCssChunks) {
                    for (const key in bundle) {
                        const bundleChunk = bundle[key];
                        if (bundleChunk.type === 'chunk' &&
                            arrayEqual(bundleChunk.moduleIds, pureCssChunk.moduleIds)) {
                            pureCssChunkNames.push(key);
                            break;
                        }
                    }
                }
                const emptyChunkFiles = pureCssChunkNames
                    .map((file) => path.basename(file))
                    .join('|')
                    .replace(/\./g, '\\.');
                const emptyChunkRE = new RegExp(opts.format === 'es'
                    ? `\\bimport\\s*["'][^"']*(?:${emptyChunkFiles})["'];\n?`
                    : `\\brequire\\(\\s*["'][^"']*(?:${emptyChunkFiles})["']\\);\n?`, 'g');
                for (const file in bundle) {
                    const chunk = bundle[file];
                    if (chunk.type === 'chunk') {
                        // remove pure css chunk from other chunk's imports,
                        // and also register the emitted CSS files under the importer
                        // chunks instead.
                        chunk.imports = chunk.imports.filter((file) => {
                            if (pureCssChunkNames.includes(file)) {
                                const { importedCss } = bundle[file]
                                    .viteMetadata;
                                importedCss.forEach((file) => chunk.viteMetadata.importedCss.add(file));
                                return false;
                            }
                            return true;
                        });
                        chunk.code = chunk.code.replace(emptyChunkRE, 
                        // remove css import while preserving source map location
                        (m) => `/* empty css ${''.padEnd(m.length - 15)}*/`);
                    }
                }
                const removedPureCssFiles = removedPureCssFilesCache.get(config);
                pureCssChunkNames.forEach((fileName) => {
                    removedPureCssFiles.set(fileName, bundle[fileName]);
                    delete bundle[fileName];
                });
            }
            let extractedCss = outputToExtractedCSSMap.get(opts);
            if (extractedCss && !hasEmitted) {
                hasEmitted = true;
                extractedCss = await finalizeCss(extractedCss, true, config);
                this.emitFile({
                    name: cssBundleName,
                    type: 'asset',
                    source: extractedCss,
                });
            }
        },
    };
}
function createCSSResolvers(config) {
    let cssResolve;
    let sassResolve;
    let lessResolve;
    return {
        get css() {
            return (cssResolve ||
                (cssResolve = config.createResolver({
                    extensions: ['.css'],
                    mainFields: ['style'],
                    conditions: ['style'],
                    tryIndex: false,
                    preferRelative: true,
                })));
        },
        get sass() {
            return (sassResolve ||
                (sassResolve = config.createResolver({
                    extensions: ['.scss', '.sass', '.css'],
                    mainFields: ['sass', 'style'],
                    conditions: ['sass', 'style'],
                    tryIndex: true,
                    tryPrefix: '_',
                    preferRelative: true,
                })));
        },
        get less() {
            return (lessResolve ||
                (lessResolve = config.createResolver({
                    extensions: ['.less', '.css'],
                    mainFields: ['less', 'style'],
                    conditions: ['less', 'style'],
                    tryIndex: false,
                    preferRelative: true,
                })));
        },
    };
}
function getCssResolversKeys(resolvers) {
    return Object.keys(resolvers);
}
const configToAtImportResolvers = new WeakMap();
function getAtImportResolvers(config) {
    let atImportResolvers = configToAtImportResolvers.get(config);
    if (!atImportResolvers) {
        atImportResolvers = createCSSResolvers(config);
        configToAtImportResolvers.set(config, atImportResolvers);
    }
    return atImportResolvers;
}
async function compileCSS(id, code, config, urlReplacer) {
    if (config.css?.transformer === 'lightningcss') {
        return compileLightningCSS(id, code, config, urlReplacer);
    }
    const { modules: modulesOptions, preprocessorOptions, devSourcemap, } = config.css || {};
    const isModule = modulesOptions !== false && cssModuleRE.test(id);
    // although at serve time it can work without processing, we do need to
    // crawl them in order to register watch dependencies.
    const needInlineImport = code.includes('@import');
    const hasUrl = cssUrlRE.test(code) || cssImageSetRE.test(code);
    const lang = id.match(CSS_LANGS_RE)?.[1];
    const postcssConfig = await resolvePostcssConfig(config);
    // 1. plain css that needs no processing
    if (lang === 'css' &&
        !postcssConfig &&
        !isModule &&
        !needInlineImport &&
        !hasUrl) {
        return { code, map: null };
    }
    let preprocessorMap;
    let modules;
    const deps = new Set();
    const atImportResolvers = getAtImportResolvers(config);
    // 2. pre-processors: sass etc.
    if (isPreProcessor(lang)) {
        const preProcessor = preProcessors[lang];
        let opts = (preprocessorOptions && preprocessorOptions[lang]) || {};
        // support @import from node dependencies by default
        switch (lang) {
            case "scss" /* PreprocessLang.scss */:
            case "sass" /* PreprocessLang.sass */:
                opts = {
                    includePaths: ['node_modules'],
                    alias: config.resolve.alias,
                    ...opts,
                };
                break;
            case "less" /* PreprocessLang.less */:
            case "styl" /* PreprocessLang.styl */:
            case "stylus" /* PreprocessLang.stylus */:
                opts = {
                    paths: ['node_modules'],
                    alias: config.resolve.alias,
                    ...opts,
                };
        }
        // important: set this for relative import resolving
        opts.filename = cleanUrl(id);
        opts.enableSourcemap = devSourcemap ?? false;
        const preprocessResult = await preProcessor(code, config.root, opts, atImportResolvers);
        if (preprocessResult.error) {
            throw preprocessResult.error;
        }
        code = preprocessResult.code;
        preprocessorMap = combineSourcemapsIfExists(opts.filename, preprocessResult.map, preprocessResult.additionalMap);
        if (preprocessResult.deps) {
            preprocessResult.deps.forEach((dep) => {
                // sometimes sass registers the file itself as a dep
                if (normalizePath(dep) !== normalizePath(opts.filename)) {
                    deps.add(dep);
                }
            });
        }
    }
    // 3. postcss
    const postcssOptions = (postcssConfig && postcssConfig.options) || {};
    const postcssPlugins = postcssConfig && postcssConfig.plugins ? postcssConfig.plugins.slice() : [];
    if (needInlineImport) {
        postcssPlugins.unshift((await importPostcssImport()).default({
            async resolve(id, basedir) {
                const publicFile = checkPublicFile(id, config);
                if (publicFile) {
                    return publicFile;
                }
                const resolved = await atImportResolvers.css(id, path.join(basedir, '*'));
                if (resolved) {
                    return path.resolve(resolved);
                }
                // postcss-import falls back to `resolve` dep if this is unresolved,
                // but we've shimmed to remove the `resolve` dep to cut on bundle size.
                // warn here to provide a better error message.
                if (!path.isAbsolute(id)) {
                    config.logger.error(colors.red(`Unable to resolve \`@import "${id}"\` from ${basedir}`));
                }
                return id;
            },
            async load(id) {
                const code = fs.readFileSync(id, 'utf-8');
                const result = await compileCSS(id, code, config);
                result.deps?.forEach((dep) => deps.add(dep));
                return result.code;
            },
            nameLayer(index) {
                return `vite--anon-layer-${getHash(id)}-${index}`;
            },
        }));
    }
    if (urlReplacer) {
        postcssPlugins.push(UrlRewritePostcssPlugin({
            replacer: urlReplacer,
            logger: config.logger,
        }));
    }
    if (isModule) {
        postcssPlugins.unshift((await importPostcssModules()).default({
            ...modulesOptions,
            localsConvention: modulesOptions?.localsConvention,
            getJSON(cssFileName, _modules, outputFileName) {
                modules = _modules;
                if (modulesOptions && typeof modulesOptions.getJSON === 'function') {
                    modulesOptions.getJSON(cssFileName, _modules, outputFileName);
                }
            },
            async resolve(id, importer) {
                for (const key of getCssResolversKeys(atImportResolvers)) {
                    const resolved = await atImportResolvers[key](id, importer);
                    if (resolved) {
                        return path.resolve(resolved);
                    }
                }
                return id;
            },
        }));
    }
    if (!postcssPlugins.length) {
        return {
            code,
            map: preprocessorMap,
            deps,
        };
    }
    let postcssResult;
    try {
        const source = removeDirectQuery(id);
        const postcss = await importPostcss();
        // postcss is an unbundled dep and should be lazy imported
        postcssResult = await postcss.default(postcssPlugins).process(code, {
            ...postcssOptions,
            parser: lang === 'sss'
                ? loadPreprocessor("sugarss" /* PostCssDialectLang.sss */, config.root)
                : postcssOptions.parser,
            to: source,
            from: source,
            ...(devSourcemap
                ? {
                    map: {
                        inline: false,
                        annotation: false,
                        // postcss may return virtual files
                        // we cannot obtain content of them, so this needs to be enabled
                        sourcesContent: true,
                        // when "prev: preprocessorMap", the result map may include duplicate filename in `postcssResult.map.sources`
                        // prev: preprocessorMap,
                    },
                }
                : {}),
        });
        // record CSS dependencies from @imports
        for (const message of postcssResult.messages) {
            if (message.type === 'dependency') {
                deps.add(normalizePath(message.file));
            }
            else if (message.type === 'dir-dependency') {
                // https://github.com/postcss/postcss/blob/main/docs/guidelines/plugin.md#3-dependencies
                const { dir, glob: globPattern = '**' } = message;
                const pattern = glob.escapePath(normalizePath(path.resolve(path.dirname(id), dir))) +
                    `/` +
                    globPattern;
                const files = glob.sync(pattern, {
                    ignore: ['**/node_modules/**'],
                });
                for (let i = 0; i < files.length; i++) {
                    deps.add(files[i]);
                }
            }
            else if (message.type === 'warning') {
                let msg = `[vite:css] ${message.text}`;
                if (message.line && message.column) {
                    msg += `\n${generateCodeFrame(code, {
                        line: message.line,
                        column: message.column,
                    })}`;
                }
                config.logger.warn(colors.yellow(msg));
            }
        }
    }
    catch (e) {
        e.message = `[postcss] ${e.message}`;
        e.code = code;
        e.loc = {
            column: e.column,
            line: e.line,
        };
        throw e;
    }
    if (!devSourcemap) {
        return {
            ast: postcssResult,
            code: postcssResult.css,
            map: { mappings: '' },
            modules,
            deps,
        };
    }
    const rawPostcssMap = postcssResult.map.toJSON();
    const postcssMap = await formatPostcssSourceMap(
    // version property of rawPostcssMap is declared as string
    // but actually it is a number
    rawPostcssMap, cleanUrl(id));
    return {
        ast: postcssResult,
        code: postcssResult.css,
        map: combineSourcemapsIfExists(cleanUrl(id), postcssMap, preprocessorMap),
        modules,
        deps,
    };
}
function createCachedImport(imp) {
    let cached;
    return () => {
        if (!cached) {
            cached = imp().then((module) => {
                cached = module;
                return module;
            });
        }
        return cached;
    };
}
const importPostcssImport = createCachedImport(() => import('postcss-import'));
const importPostcssModules = createCachedImport(() => import('postcss-modules'));
const importPostcss = createCachedImport(() => import('postcss'));
/**
 * @experimental
 */
async function preprocessCSS(code, filename, config) {
    return await compileCSS(filename, code, config);
}
const postcssReturnsVirtualFilesRE = /^<.+>$/;
async function formatPostcssSourceMap(rawMap, file) {
    const inputFileDir = path.dirname(file);
    const sources = rawMap.sources.map((source) => {
        const cleanSource = cleanUrl(decodeURIComponent(source));
        if (postcssReturnsVirtualFilesRE.test(cleanSource)) {
            return `\0${cleanSource}`;
        }
        return normalizePath(path.resolve(inputFileDir, cleanSource));
    });
    return {
        file,
        mappings: rawMap.mappings,
        names: rawMap.names,
        sources,
        sourcesContent: rawMap.sourcesContent,
        version: rawMap.version,
    };
}
function combineSourcemapsIfExists(filename, map1, map2) {
    return map1 && map2
        ? combineSourcemaps(filename, [
            // type of version property of ExistingRawSourceMap is number
            // but it is always 3
            map1,
            map2,
        ])
        : map1;
}
async function finalizeCss(css, minify, config) {
    // hoist external @imports and @charset to the top of the CSS chunk per spec (#1845 and #6333)
    if (css.includes('@import') || css.includes('@charset')) {
        css = await hoistAtRules(css);
    }
    if (minify && config.build.cssMinify) {
        css = await minifyCSS(css, config);
    }
    return css;
}
async function resolvePostcssConfig(config) {
    let result = postcssConfigCache.get(config);
    if (result !== undefined) {
        return await result;
    }
    // inline postcss config via vite config
    const inlineOptions = config.css?.postcss;
    if (isObject(inlineOptions)) {
        const options = { ...inlineOptions };
        delete options.plugins;
        result = {
            options,
            plugins: inlineOptions.plugins || [],
        };
    }
    else {
        const searchPath = typeof inlineOptions === 'string' ? inlineOptions : config.root;
        result = postcssrc({}, searchPath).catch((e) => {
            if (!/No PostCSS Config found/.test(e.message)) {
                if (e instanceof Error) {
                    const { name, message, stack } = e;
                    e.name = 'Failed to load PostCSS config';
                    e.message = `Failed to load PostCSS config (searchPath: ${searchPath}): [${name}] ${message}\n${stack}`;
                    e.stack = ''; // add stack to message to retain stack
                    throw e;
                }
                else {
                    throw new Error(`Failed to load PostCSS config: ${e}`);
                }
            }
            return null;
        });
        // replace cached promise to result object when finished
        result.then((resolved) => {
            postcssConfigCache.set(config, resolved);
        });
    }
    postcssConfigCache.set(config, result);
    return result;
}
// https://drafts.csswg.org/css-syntax-3/#identifier-code-point
const cssUrlRE = /(?<=^|[^\w\-\u0080-\uffff])url\((\s*('[^']+'|"[^"]+")\s*|[^'")]+)\)/;
const cssDataUriRE = /(?<=^|[^\w\-\u0080-\uffff])data-uri\((\s*('[^']+'|"[^"]+")\s*|[^'")]+)\)/;
const importCssRE = /@import ('[^']+\.css'|"[^"]+\.css"|[^'")]+\.css)/;
// Assuming a function name won't be longer than 256 chars
// eslint-disable-next-line regexp/no-unused-capturing-group -- doesn't detect asyncReplace usage
const cssImageSetRE = /(?<=image-set\()((?:[\w\-]{1,256}\([^)]*\)|[^)])*)(?=\))/;
const UrlRewritePostcssPlugin = (opts) => {
    if (!opts) {
        throw new Error('base or replace is required');
    }
    return {
        postcssPlugin: 'vite-url-rewrite',
        Once(root) {
            const promises = [];
            root.walkDecls((declaration) => {
                const importer = declaration.source?.input.file;
                if (!importer) {
                    opts.logger.warnOnce('\nA PostCSS plugin did not pass the `from` option to `postcss.parse`. ' +
                        'This may cause imported assets to be incorrectly transformed. ' +
                        "If you've recently added a PostCSS plugin that raised this warning, " +
                        'please contact the package author to fix the issue.');
                }
                const isCssUrl = cssUrlRE.test(declaration.value);
                const isCssImageSet = cssImageSetRE.test(declaration.value);
                if (isCssUrl || isCssImageSet) {
                    const replacerForDeclaration = (rawUrl) => {
                        return opts.replacer(rawUrl, importer);
                    };
                    const rewriterToUse = isCssImageSet
                        ? rewriteCssImageSet
                        : rewriteCssUrls;
                    promises.push(rewriterToUse(declaration.value, replacerForDeclaration).then((url) => {
                        declaration.value = url;
                    }));
                }
            });
            if (promises.length) {
                return Promise.all(promises);
            }
        },
    };
};
UrlRewritePostcssPlugin.postcss = true;
function rewriteCssUrls(css, replacer) {
    return asyncReplace(css, cssUrlRE, async (match) => {
        const [matched, rawUrl] = match;
        return await doUrlReplace(rawUrl.trim(), matched, replacer);
    });
}
function rewriteCssDataUris(css, replacer) {
    return asyncReplace(css, cssDataUriRE, async (match) => {
        const [matched, rawUrl] = match;
        return await doUrlReplace(rawUrl.trim(), matched, replacer, 'data-uri');
    });
}
function rewriteImportCss(css, replacer) {
    return asyncReplace(css, importCssRE, async (match) => {
        const [matched, rawUrl] = match;
        return await doImportCSSReplace(rawUrl, matched, replacer);
    });
}
// TODO: image and cross-fade could contain a "url" that needs to be processed
// https://drafts.csswg.org/css-images-4/#image-notation
// https://drafts.csswg.org/css-images-4/#cross-fade-function
const cssNotProcessedRE = /(?:gradient|element|cross-fade|image)\(/;
async function rewriteCssImageSet(css, replacer) {
    return await asyncReplace(css, cssImageSetRE, async (match) => {
        const [, rawUrl] = match;
        const url = await processSrcSet(rawUrl, async ({ url }) => {
            // the url maybe url(...)
            if (cssUrlRE.test(url)) {
                return await rewriteCssUrls(url, replacer);
            }
            if (!cssNotProcessedRE.test(url)) {
                return await doUrlReplace(url, url, replacer);
            }
            return url;
        });
        return url;
    });
}
async function doUrlReplace(rawUrl, matched, replacer, funcName = 'url') {
    let wrap = '';
    const first = rawUrl[0];
    if (first === `"` || first === `'`) {
        wrap = first;
        rawUrl = rawUrl.slice(1, -1);
    }
    if (isExternalUrl(rawUrl) ||
        isDataUrl(rawUrl) ||
        rawUrl[0] === '#' ||
        varRE.test(rawUrl)) {
        return matched;
    }
    const newUrl = await replacer(rawUrl);
    if (wrap === '' && newUrl !== encodeURI(newUrl)) {
        // The new url might need wrapping even if the original did not have it, e.g. if a space was added during replacement
        wrap = "'";
    }
    return `${funcName}(${wrap}${newUrl}${wrap})`;
}
async function doImportCSSReplace(rawUrl, matched, replacer) {
    let wrap = '';
    const first = rawUrl[0];
    if (first === `"` || first === `'`) {
        wrap = first;
        rawUrl = rawUrl.slice(1, -1);
    }
    if (isExternalUrl(rawUrl) || isDataUrl(rawUrl) || rawUrl[0] === '#') {
        return matched;
    }
    return `@import ${wrap}${await replacer(rawUrl)}${wrap}`;
}
async function minifyCSS(css, config) {
    if (config.build.cssMinify === 'lightningcss') {
        const { code, warnings } = (await importLightningCSS()).transform({
            ...config.css?.lightningcss,
            targets: convertTargets(config.build.cssTarget),
            cssModules: undefined,
            filename: cssBundleName,
            code: Buffer.from(css),
            minify: true,
        });
        if (warnings.length) {
            config.logger.warn(colors.yellow(`warnings when minifying css:\n${warnings
                .map((w) => w.message)
                .join('\n')}`));
        }
        return code.toString();
    }
    try {
        const { code, warnings } = await transform(css, {
            loader: 'css',
            target: config.build.cssTarget || undefined,
            ...resolveMinifyCssEsbuildOptions(config.esbuild || {}),
        });
        if (warnings.length) {
            const msgs = await formatMessages(warnings, { kind: 'warning' });
            config.logger.warn(colors.yellow(`warnings when minifying css:\n${msgs.join('\n')}`));
        }
        return code;
    }
    catch (e) {
        if (e.errors) {
            e.message = '[esbuild css minify] ' + e.message;
            const msgs = await formatMessages(e.errors, { kind: 'error' });
            e.frame = '\n' + msgs.join('\n');
            e.loc = e.errors[0].location;
        }
        throw e;
    }
}
function resolveMinifyCssEsbuildOptions(options) {
    const base = {
        charset: options.charset ?? 'utf8',
        logLevel: options.logLevel,
        logLimit: options.logLimit,
        logOverride: options.logOverride,
    };
    if (options.minifyIdentifiers != null ||
        options.minifySyntax != null ||
        options.minifyWhitespace != null) {
        return {
            ...base,
            minifyIdentifiers: options.minifyIdentifiers ?? true,
            minifySyntax: options.minifySyntax ?? true,
            minifyWhitespace: options.minifyWhitespace ?? true,
        };
    }
    else {
        return { ...base, minify: true };
    }
}
async function hoistAtRules(css) {
    const s = new MagicString(css);
    const cleanCss = emptyCssComments(css);
    let match;
    // #1845
    // CSS @import can only appear at top of the file. We need to hoist all @import
    // to top when multiple files are concatenated.
    // match until semicolon that's not in quotes
    const atImportRE = /@import(?:\s*(?:url\([^)]*\)|"(?:[^"]|(?<=\\)")*"|'(?:[^']|(?<=\\)')*').*?|[^;]*);/g;
    while ((match = atImportRE.exec(cleanCss))) {
        s.remove(match.index, match.index + match[0].length);
        // Use `appendLeft` instead of `prepend` to preserve original @import order
        s.appendLeft(0, match[0]);
    }
    // #6333
    // CSS @charset must be the top-first in the file, hoist the first to top
    const atCharsetRE = /@charset(?:\s*(?:"(?:[^"]|(?<=\\)")*"|'(?:[^']|(?<=\\)')*').*?|[^;]*);/g;
    let foundCharset = false;
    while ((match = atCharsetRE.exec(cleanCss))) {
        s.remove(match.index, match.index + match[0].length);
        if (!foundCharset) {
            s.prepend(match[0]);
            foundCharset = true;
        }
    }
    return s.toString();
}
const loadedPreprocessors = {};
// TODO: use dynamic import
const _require$2 = createRequire(import.meta.url);
function loadPreprocessor(lang, root) {
    if (lang in loadedPreprocessors) {
        return loadedPreprocessors[lang];
    }
    try {
        const resolved = requireResolveFromRootWithFallback(root, lang);
        return (loadedPreprocessors[lang] = _require$2(resolved));
    }
    catch (e) {
        if (e.code === 'MODULE_NOT_FOUND') {
            throw new Error(`Preprocessor dependency "${lang}" not found. Did you install it?`);
        }
        else {
            const message = new Error(`Preprocessor dependency "${lang}" failed to load:\n${e.message}`);
            message.stack = e.stack + '\n' + message.stack;
            throw message;
        }
    }
}
// in unix, scss might append `location.href` in environments that shim `location`
// see https://github.com/sass/dart-sass/issues/710
function cleanScssBugUrl(url) {
    if (
    // check bug via `window` and `location` global
    typeof window !== 'undefined' &&
        typeof location !== 'undefined' &&
        typeof location?.href === 'string') {
        const prefix = location.href.replace(/\/$/, '');
        return url.replace(prefix, '');
    }
    else {
        return url;
    }
}
function fixScssBugImportValue(data) {
    // the scss bug doesn't load files properly so we have to load it ourselves
    // to prevent internal error when it loads itself
    if (
    // check bug via `window` and `location` global
    typeof window !== 'undefined' &&
        typeof location !== 'undefined' &&
        data &&
        'file' in data &&
        (!('contents' in data) || data.contents == null)) {
        // @ts-expect-error we need to preserve file property for HMR
        data.contents = fs.readFileSync(data.file, 'utf-8');
    }
    return data;
}
// .scss/.sass processor
const scss = async (source, root, options, resolvers) => {
    const render = loadPreprocessor("sass" /* PreprocessLang.sass */, root).render;
    // NOTE: `sass` always runs it's own importer first, and only falls back to
    // the `importer` option when it can't resolve a path
    const internalImporter = (url, importer, done) => {
        importer = cleanScssBugUrl(importer);
        resolvers.sass(url, importer).then((resolved) => {
            if (resolved) {
                rebaseUrls(resolved, options.filename, options.alias, '$')
                    .then((data) => done?.(fixScssBugImportValue(data)))
                    .catch((data) => done?.(data));
            }
            else {
                done?.(null);
            }
        });
    };
    const importer = [internalImporter];
    if (options.importer) {
        Array.isArray(options.importer)
            ? importer.unshift(...options.importer)
            : importer.unshift(options.importer);
    }
    const { content: data, map: additionalMap } = await getSource(source, options.filename, options.additionalData, options.enableSourcemap);
    const finalOptions = {
        ...options,
        data,
        file: options.filename,
        outFile: options.filename,
        importer,
        ...(options.enableSourcemap
            ? {
                sourceMap: true,
                omitSourceMapUrl: true,
                sourceMapRoot: path.dirname(options.filename),
            }
            : {}),
    };
    try {
        const result = await new Promise((resolve, reject) => {
            render(finalOptions, (err, res) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(res);
                }
            });
        });
        const deps = result.stats.includedFiles.map((f) => cleanScssBugUrl(f));
        const map = result.map
            ? JSON.parse(result.map.toString())
            : undefined;
        return {
            code: result.css.toString(),
            map,
            additionalMap,
            deps,
        };
    }
    catch (e) {
        // normalize SASS error
        e.message = `[sass] ${e.message}`;
        e.id = e.file;
        e.frame = e.formatted;
        return { code: '', error: e, deps: [] };
    }
};
const sass = (source, root, options, aliasResolver) => scss(source, root, {
    ...options,
    indentedSyntax: true,
}, aliasResolver);
/**
 * relative url() inside \@imported sass and less files must be rebased to use
 * root file as base.
 */
async function rebaseUrls(file, rootFile, alias, variablePrefix) {
    file = path.resolve(file); // ensure os-specific flashes
    // in the same dir, no need to rebase
    const fileDir = path.dirname(file);
    const rootDir = path.dirname(rootFile);
    if (fileDir === rootDir) {
        return { file };
    }
    const content = await fsp.readFile(file, 'utf-8');
    // no url()
    const hasUrls = cssUrlRE.test(content);
    // data-uri() calls
    const hasDataUris = cssDataUriRE.test(content);
    // no @import xxx.css
    const hasImportCss = importCssRE.test(content);
    if (!hasUrls && !hasDataUris && !hasImportCss) {
        return { file };
    }
    let rebased;
    const rebaseFn = (url) => {
        if (url[0] === '/')
            return url;
        // ignore url's starting with variable
        if (url.startsWith(variablePrefix))
            return url;
        // match alias, no need to rewrite
        for (const { find } of alias) {
            const matches = typeof find === 'string' ? url.startsWith(find) : find.test(url);
            if (matches) {
                return url;
            }
        }
        const absolute = path.resolve(fileDir, url);
        const relative = path.relative(rootDir, absolute);
        return normalizePath(relative);
    };
    // fix css imports in less such as `@import "foo.css"`
    if (hasImportCss) {
        rebased = await rewriteImportCss(content, rebaseFn);
    }
    if (hasUrls) {
        rebased = await rewriteCssUrls(rebased || content, rebaseFn);
    }
    if (hasDataUris) {
        rebased = await rewriteCssDataUris(rebased || content, rebaseFn);
    }
    return {
        file,
        contents: rebased,
    };
}
// .less
const less = async (source, root, options, resolvers) => {
    const nodeLess = loadPreprocessor("less" /* PreprocessLang.less */, root);
    const viteResolverPlugin = createViteLessPlugin(nodeLess, options.filename, options.alias, resolvers);
    const { content, map: additionalMap } = await getSource(source, options.filename, options.additionalData, options.enableSourcemap);
    let result;
    try {
        result = await nodeLess.render(content, {
            ...options,
            plugins: [viteResolverPlugin, ...(options.plugins || [])],
            ...(options.enableSourcemap
                ? {
                    sourceMap: {
                        outputSourceFiles: true,
                        sourceMapFileInline: false,
                    },
                }
                : {}),
        });
    }
    catch (e) {
        const error = e;
        // normalize error info
        const normalizedError = new Error(`[less] ${error.message || error.type}`);
        normalizedError.loc = {
            file: error.filename || options.filename,
            line: error.line,
            column: error.column,
        };
        return { code: '', error: normalizedError, deps: [] };
    }
    const map = result.map && JSON.parse(result.map);
    if (map) {
        delete map.sourcesContent;
    }
    return {
        code: result.css.toString(),
        map,
        additionalMap,
        deps: result.imports,
    };
};
/**
 * Less manager, lazy initialized
 */
let ViteLessManager;
function createViteLessPlugin(less, rootFile, alias, resolvers) {
    if (!ViteLessManager) {
        ViteLessManager = class ViteManager extends less.FileManager {
            constructor(rootFile, resolvers, alias) {
                super();
                this.rootFile = rootFile;
                this.resolvers = resolvers;
                this.alias = alias;
            }
            supports(filename) {
                return !isExternalUrl(filename);
            }
            supportsSync() {
                return false;
            }
            async loadFile(filename, dir, opts, env) {
                const resolved = await this.resolvers.less(filename, path.join(dir, '*'));
                if (resolved) {
                    const result = await rebaseUrls(resolved, this.rootFile, this.alias, '@');
                    let contents;
                    if (result && 'contents' in result) {
                        contents = result.contents;
                    }
                    else {
                        contents = await fsp.readFile(resolved, 'utf-8');
                    }
                    return {
                        filename: path.resolve(resolved),
                        contents,
                    };
                }
                else {
                    return super.loadFile(filename, dir, opts, env);
                }
            }
        };
    }
    return {
        install(_, pluginManager) {
            pluginManager.addFileManager(new ViteLessManager(rootFile, resolvers, alias));
        },
        minVersion: [3, 0, 0],
    };
}
// .styl
const styl = async (source, root, options) => {
    const nodeStylus = loadPreprocessor("stylus" /* PreprocessLang.stylus */, root);
    // Get source with preprocessor options.additionalData. Make sure a new line separator
    // is added to avoid any render error, as added stylus content may not have semi-colon separators
    const { content, map: additionalMap } = await getSource(source, options.filename, options.additionalData, options.enableSourcemap, '\n');
    // Get preprocessor options.imports dependencies as stylus
    // does not return them with its builtin `.deps()` method
    const importsDeps = (options.imports ?? []).map((dep) => path.resolve(dep));
    try {
        const ref = nodeStylus(content, options);
        if (options.define) {
            for (const key in options.define) {
                ref.define(key, options.define[key]);
            }
        }
        if (options.enableSourcemap) {
            ref.set('sourcemap', {
                comment: false,
                inline: false,
                basePath: root,
            });
        }
        const result = ref.render();
        // Concat imports deps with computed deps
        const deps = [...ref.deps(), ...importsDeps];
        // @ts-expect-error sourcemap exists
        const map = ref.sourcemap;
        return {
            code: result,
            map: formatStylusSourceMap(map, root),
            additionalMap,
            deps,
        };
    }
    catch (e) {
        e.message = `[stylus] ${e.message}`;
        return { code: '', error: e, deps: [] };
    }
};
function formatStylusSourceMap(mapBefore, root) {
    if (!mapBefore)
        return undefined;
    const map = { ...mapBefore };
    const resolveFromRoot = (p) => normalizePath(path.resolve(root, p));
    if (map.file) {
        map.file = resolveFromRoot(map.file);
    }
    map.sources = map.sources.map(resolveFromRoot);
    return map;
}
async function getSource(source, filename, additionalData, enableSourcemap, sep = '') {
    if (!additionalData)
        return { content: source };
    if (typeof additionalData === 'function') {
        const newContent = await additionalData(source, filename);
        if (typeof newContent === 'string') {
            return { content: newContent };
        }
        return newContent;
    }
    if (!enableSourcemap) {
        return { content: additionalData + sep + source };
    }
    const ms = new MagicString(source);
    ms.appendLeft(0, sep);
    ms.appendLeft(0, additionalData);
    const map = ms.generateMap({ hires: true });
    map.file = filename;
    map.sources = [filename];
    return {
        content: ms.toString(),
        map,
    };
}
const preProcessors = Object.freeze({
    ["less" /* PreprocessLang.less */]: less,
    ["sass" /* PreprocessLang.sass */]: sass,
    ["scss" /* PreprocessLang.scss */]: scss,
    ["styl" /* PreprocessLang.styl */]: styl,
    ["stylus" /* PreprocessLang.stylus */]: styl,
});
function isPreProcessor(lang) {
    return lang && lang in preProcessors;
}
const importLightningCSS = createCachedImport(() => import('lightningcss'));
async function compileLightningCSS(id, src, config, urlReplacer) {
    const deps = new Set();
    // Relative path is needed to get stable hash when using CSS modules
    const filename = cleanUrl(path.relative(config.root, id));
    const toAbsolute = (filePath) => path.isAbsolute(filePath) ? filePath : path.join(config.root, filePath);
    const res = styleAttrRE.test(id)
        ? (await importLightningCSS()).transformStyleAttribute({
            filename,
            code: Buffer.from(src),
            targets: config.css?.lightningcss?.targets,
            minify: config.isProduction && !!config.build.cssMinify,
            analyzeDependencies: true,
        })
        : await (await importLightningCSS()).bundleAsync({
            filename,
            resolver: {
                read(filePath) {
                    if (filePath === filename) {
                        return src;
                    }
                    return fs.readFileSync(toAbsolute(filePath), 'utf-8');
                },
                async resolve(id, from) {
                    const publicFile = checkPublicFile(id, config);
                    if (publicFile) {
                        return publicFile;
                    }
                    const resolved = await getAtImportResolvers(config).css(id, toAbsolute(from));
                    if (resolved) {
                        deps.add(resolved);
                        return resolved;
                    }
                    return id;
                },
            },
            targets: config.css?.lightningcss?.targets,
            minify: config.isProduction && !!config.build.cssMinify,
            sourceMap: config.css?.devSourcemap,
            analyzeDependencies: true,
            cssModules: cssModuleRE.test(id)
                ? config.css?.lightningcss?.cssModules ?? true
                : undefined,
            drafts: config.css?.lightningcss?.drafts,
        });
    let css = res.code.toString();
    for (const dep of res.dependencies) {
        switch (dep.type) {
            case 'url':
                deps.add(dep.url);
                if (urlReplacer) {
                    css = css.replace(dep.placeholder, await urlReplacer(dep.url, id));
                }
                break;
            default:
                throw new Error(`Unsupported dependency type: ${dep.type}`);
        }
    }
    let modules;
    if ('exports' in res && res.exports) {
        modules = {};
        // https://github.com/parcel-bundler/lightningcss/issues/291
        const sortedEntries = Object.entries(res.exports).sort((a, b) => a[0].localeCompare(b[0]));
        for (const [key, value] of sortedEntries) {
            modules[key] = value.name;
            // https://lightningcss.dev/css-modules.html#class-composition
            for (const c of value.composes) {
                modules[key] += ' ' + c.name;
            }
        }
    }
    return {
        code: css,
        map: 'map' in res ? res.map?.toString() : undefined,
        deps,
        modules,
    };
}
// Convert https://esbuild.github.io/api/#target
// To https://github.com/parcel-bundler/lightningcss/blob/master/node/targets.d.ts
const map = {
    chrome: 'chrome',
    edge: 'edge',
    firefox: 'firefox',
    hermes: false,
    ie: 'ie',
    ios: 'ios_saf',
    node: false,
    opera: 'opera',
    rhino: false,
    safari: 'safari',
};
const esMap = {
    // https://caniuse.com/?search=es2015
    2015: ['chrome49', 'edge13', 'safari10', 'firefox44', 'opera36'],
    // https://caniuse.com/?search=es2016
    2016: ['chrome50', 'edge13', 'safari10', 'firefox43', 'opera37'],
    // https://caniuse.com/?search=es2017
    2017: ['chrome58', 'edge15', 'safari11', 'firefox52', 'opera45'],
    // https://caniuse.com/?search=es2018
    2018: ['chrome63', 'edge79', 'safari12', 'firefox58', 'opera50'],
    // https://caniuse.com/?search=es2019
    2019: ['chrome73', 'edge79', 'safari12.1', 'firefox64', 'opera60'],
    // https://caniuse.com/?search=es2020
    2020: ['chrome80', 'edge80', 'safari14.1', 'firefox80', 'opera67'],
    // https://caniuse.com/?search=es2021
    2021: ['chrome85', 'edge85', 'safari14.1', 'firefox80', 'opera71'],
    // https://caniuse.com/?search=es2022
    2022: ['chrome94', 'edge94', 'safari16.4', 'firefox93', 'opera80'],
};
const esRE = /es(\d{4})/;
const versionRE = /\d/;
const convertTargetsCache = new Map();
const convertTargets = (esbuildTarget) => {
    if (!esbuildTarget)
        return {};
    const cached = convertTargetsCache.get(esbuildTarget);
    if (cached)
        return cached;
    const targets = {};
    const entriesWithoutES = arraify(esbuildTarget).flatMap((e) => {
        const match = e.match(esRE);
        if (!match)
            return e;
        const year = Number(match[1]);
        if (!esMap[year])
            throw new Error(`Unsupported target "${e}"`);
        return esMap[year];
    });
    for (const entry of entriesWithoutES) {
        if (entry === 'esnext')
            continue;
        const index = entry.match(versionRE)?.index;
        if (index) {
            const browser = map[entry.slice(0, index)];
            if (browser === false)
                continue; // No mapping available
            if (browser) {
                const [major, minor = 0] = entry
                    .slice(index)
                    .split('.')
                    .map((v) => parseInt(v, 10));
                if (!isNaN(major) && !isNaN(minor)) {
                    const version = (major << 16) | (minor << 8);
                    if (!targets[browser] || version < targets[browser]) {
                        targets[browser] = version;
                    }
                    continue;
                }
            }
        }
        throw new Error(`Unsupported target "${entry}"`);
    }
    convertTargetsCache.set(esbuildTarget, targets);
    return targets;
};

const externalWithConversionNamespace = 'vite:dep-pre-bundle:external-conversion';
const convertedExternalPrefix = 'vite-dep-pre-bundle-external:';
const cjsExternalFacadeNamespace = 'vite:cjs-external-facade';
const nonFacadePrefix = 'vite-cjs-external-facade:';
const externalTypes = [
    'css',
    // supported pre-processor types
    'less',
    'sass',
    'scss',
    'styl',
    'stylus',
    'pcss',
    'postcss',
    // wasm
    'wasm',
    // known SFC types
    'vue',
    'svelte',
    'marko',
    'astro',
    'imba',
    // JSX/TSX may be configured to be compiled differently from how esbuild
    // handles it by default, so exclude them as well
    'jsx',
    'tsx',
    ...KNOWN_ASSET_TYPES,
];
function esbuildDepPlugin(qualified, external, config, ssr) {
    const { extensions } = getDepOptimizationConfig(config, ssr);
    // remove optimizable extensions from `externalTypes` list
    const allExternalTypes = extensions
        ? externalTypes.filter((type) => !extensions?.includes('.' + type))
        : externalTypes;
    // use separate package cache for optimizer as it caches paths around node_modules
    // and it's unlikely for the core Vite process to traverse into node_modules again
    const esmPackageCache = new Map();
    const cjsPackageCache = new Map();
    // default resolver which prefers ESM
    const _resolve = config.createResolver({
        asSrc: false,
        scan: true,
        packageCache: esmPackageCache,
    });
    // cjs resolver that prefers Node
    const _resolveRequire = config.createResolver({
        asSrc: false,
        isRequire: true,
        scan: true,
        packageCache: cjsPackageCache,
    });
    const resolve = (id, importer, kind, resolveDir) => {
        let _importer;
        // explicit resolveDir - this is passed only during yarn pnp resolve for
        // entries
        if (resolveDir) {
            _importer = normalizePath(path.join(resolveDir, '*'));
        }
        else {
            // map importer ids to file paths for correct resolution
            _importer = importer in qualified ? qualified[importer] : importer;
        }
        const resolver = kind.startsWith('require') ? _resolveRequire : _resolve;
        return resolver(id, _importer, undefined, ssr);
    };
    const resolveResult = (id, resolved) => {
        if (resolved.startsWith(browserExternalId)) {
            return {
                path: id,
                namespace: 'browser-external',
            };
        }
        if (resolved.startsWith(optionalPeerDepId)) {
            return {
                path: resolved,
                namespace: 'optional-peer-dep',
            };
        }
        if (ssr && isBuiltin(resolved)) {
            return;
        }
        if (isExternalUrl(resolved)) {
            return {
                path: resolved,
                external: true,
            };
        }
        return {
            path: path.resolve(resolved),
        };
    };
    return {
        name: 'vite:dep-pre-bundle',
        setup(build) {
            // clear package cache when esbuild is finished
            build.onEnd(() => {
                esmPackageCache.clear();
                cjsPackageCache.clear();
            });
            // externalize assets and commonly known non-js file types
            // See #8459 for more details about this require-import conversion
            build.onResolve({
                filter: new RegExp(`\\.(` + allExternalTypes.join('|') + `)(\\?.*)?$`),
            }, async ({ path: id, importer, kind }) => {
                // if the prefix exist, it is already converted to `import`, so set `external: true`
                if (id.startsWith(convertedExternalPrefix)) {
                    return {
                        path: id.slice(convertedExternalPrefix.length),
                        external: true,
                    };
                }
                const resolved = await resolve(id, importer, kind);
                if (resolved) {
                    if (kind === 'require-call') {
                        // here it is not set to `external: true` to convert `require` to `import`
                        return {
                            path: resolved,
                            namespace: externalWithConversionNamespace,
                        };
                    }
                    return {
                        path: resolved,
                        external: true,
                    };
                }
            });
            build.onLoad({ filter: /./, namespace: externalWithConversionNamespace }, (args) => {
                // import itself with prefix (this is the actual part of require-import conversion)
                const modulePath = `"${convertedExternalPrefix}${args.path}"`;
                return {
                    contents: isCSSRequest(args.path) && !isModuleCSSRequest(args.path)
                        ? `import ${modulePath};`
                        : `export { default } from ${modulePath};` +
                            `export * from ${modulePath};`,
                    loader: 'js',
                };
            });
            function resolveEntry(id) {
                const flatId = flattenId(id);
                if (flatId in qualified) {
                    return {
                        path: qualified[flatId],
                    };
                }
            }
            build.onResolve({ filter: /^[\w@][^:]/ }, async ({ path: id, importer, kind }) => {
                if (moduleListContains(external, id)) {
                    return {
                        path: id,
                        external: true,
                    };
                }
                // ensure esbuild uses our resolved entries
                let entry;
                // if this is an entry, return entry namespace resolve result
                if (!importer) {
                    if ((entry = resolveEntry(id)))
                        return entry;
                    // check if this is aliased to an entry - also return entry namespace
                    const aliased = await _resolve(id, undefined, true);
                    if (aliased && (entry = resolveEntry(aliased))) {
                        return entry;
                    }
                }
                // use vite's own resolver
                const resolved = await resolve(id, importer, kind);
                if (resolved) {
                    return resolveResult(id, resolved);
                }
            });
            build.onLoad({ filter: /.*/, namespace: 'browser-external' }, ({ path }) => {
                if (config.isProduction) {
                    return {
                        contents: 'module.exports = {}',
                    };
                }
                else {
                    return {
                        // Return in CJS to intercept named imports. Use `Object.create` to
                        // create the Proxy in the prototype to workaround esbuild issue. Why?
                        //
                        // In short, esbuild cjs->esm flow:
                        // 1. Create empty object using `Object.create(Object.getPrototypeOf(module.exports))`.
                        // 2. Assign props of `module.exports` to the object.
                        // 3. Return object for ESM use.
                        //
                        // If we do `module.exports = new Proxy({}, {})`, step 1 returns empty object,
                        // step 2 does nothing as there's no props for `module.exports`. The final object
                        // is just an empty object.
                        //
                        // Creating the Proxy in the prototype satisfies step 1 immediately, which means
                        // the returned object is a Proxy that we can intercept.
                        //
                        // Note: Skip keys that are accessed by esbuild and browser devtools.
                        contents: `\
module.exports = Object.create(new Proxy({}, {
  get(_, key) {
    if (
      key !== '__esModule' &&
      key !== '__proto__' &&
      key !== 'constructor' &&
      key !== 'splice'
    ) {
      console.warn(\`Module "${path}" has been externalized for browser compatibility. Cannot access "${path}.\${key}" in client code. See http://vitejs.dev/guide/troubleshooting.html#module-externalized-for-browser-compatibility for more details.\`)
    }
  }
}))`,
                    };
                }
            });
            build.onLoad({ filter: /.*/, namespace: 'optional-peer-dep' }, ({ path }) => {
                if (config.isProduction) {
                    return {
                        contents: 'module.exports = {}',
                    };
                }
                else {
                    const [, peerDep, parentDep] = path.split(':');
                    return {
                        contents: `throw new Error(\`Could not resolve "${peerDep}" imported by "${parentDep}". Is it installed?\`)`,
                    };
                }
            });
        },
    };
}
const matchesEntireLine = (text) => `^${escapeRegex(text)}$`;
// esbuild doesn't transpile `require('foo')` into `import` statements if 'foo' is externalized
// https://github.com/evanw/esbuild/issues/566#issuecomment-735551834
function esbuildCjsExternalPlugin(externals, platform) {
    return {
        name: 'cjs-external',
        setup(build) {
            const filter = new RegExp(externals.map(matchesEntireLine).join('|'));
            build.onResolve({ filter: new RegExp(`^${nonFacadePrefix}`) }, (args) => {
                return {
                    path: args.path.slice(nonFacadePrefix.length),
                    external: true,
                };
            });
            build.onResolve({ filter }, (args) => {
                // preserve `require` for node because it's more accurate than converting it to import
                if (args.kind === 'require-call' && platform !== 'node') {
                    return {
                        path: args.path,
                        namespace: cjsExternalFacadeNamespace,
                    };
                }
                return {
                    path: args.path,
                    external: true,
                };
            });
            build.onLoad({ filter: /.*/, namespace: cjsExternalFacadeNamespace }, (args) => ({
                contents: `import * as m from ${JSON.stringify(nonFacadePrefix + args.path)};` + `module.exports = m;`,
            }));
        },
    };
}

const debug$7 = createDebugger('vite:ssr-external');
/**
 * Converts "parent > child" syntax to just "child"
 */
function stripNesting(packages) {
    return packages.map((s) => {
        const arr = s.split('>');
        return arr[arr.length - 1].trim();
    });
}
/**
 * Heuristics for determining whether a dependency should be externalized for
 * server-side rendering.
 */
function cjsSsrResolveExternals(config, knownImports) {
    // strip nesting since knownImports may be passed in from optimizeDeps which
    // supports a "parent > child" syntax
    knownImports = stripNesting(knownImports);
    const ssrConfig = config.ssr;
    if (ssrConfig?.noExternal === true) {
        return [];
    }
    const ssrExternals = new Set();
    const seen = new Set();
    ssrConfig?.external?.forEach((id) => {
        ssrExternals.add(id);
        seen.add(id);
    });
    cjsSsrCollectExternals(config.root, config.resolve, ssrExternals, seen, config.logger);
    const importedDeps = knownImports.map(getNpmPackageName).filter(isDefined);
    for (const dep of importedDeps) {
        // Assume external if not yet seen
        // At this point, the project root and any linked packages have had their dependencies checked,
        // so we can safely mark any knownImports not yet seen as external. They are guaranteed to be
        // dependencies of packages in node_modules.
        if (!seen.has(dep)) {
            ssrExternals.add(dep);
        }
    }
    // ensure `vite/dynamic-import-polyfill` is bundled (issue #1865)
    ssrExternals.delete('vite');
    let externals = [...ssrExternals];
    if (ssrConfig?.noExternal) {
        externals = externals.filter(createFilter(undefined, ssrConfig.noExternal, { resolve: false }));
    }
    return externals;
}
const CJS_CONTENT_RE = /\bmodule\.exports\b|\bexports[.[]|\brequire\s*\(|\bObject\.(?:defineProperty|defineProperties|assign)\s*\(\s*exports\b/;
// TODO: use import()
const _require$1 = createRequire(import.meta.url);
const isSsrExternalCache = new WeakMap();
function shouldExternalizeForSSR(id, importer, config) {
    let isSsrExternal = isSsrExternalCache.get(config);
    if (!isSsrExternal) {
        isSsrExternal = createIsSsrExternal(config);
        isSsrExternalCache.set(config, isSsrExternal);
    }
    return isSsrExternal(id, importer);
}
function createIsConfiguredAsSsrExternal(config) {
    const { ssr, root } = config;
    const noExternal = ssr?.noExternal;
    const noExternalFilter = noExternal !== 'undefined' &&
        typeof noExternal !== 'boolean' &&
        createFilter(undefined, noExternal, { resolve: false });
    const resolveOptions = {
        ...config.resolve,
        root,
        isProduction: false,
        isBuild: true,
    };
    const isExternalizable = (id, importer, configuredAsExternal) => {
        if (!bareImportRE.test(id) || id.includes('\0')) {
            return false;
        }
        try {
            return !!tryNodeResolve(id, 
            // Skip passing importer in build to avoid externalizing non-hoisted dependencies
            // unresolveable from root (which would be unresolvable from output bundles also)
            config.command === 'build' ? undefined : importer, resolveOptions, ssr?.target === 'webworker', undefined, true, 
            // try to externalize, will return undefined or an object without
            // a external flag if it isn't externalizable
            true, 
            // Allow linked packages to be externalized if they are explicitly
            // configured as external
            !!configuredAsExternal)?.external;
        }
        catch (e) {
            debug$7?.(`Failed to node resolve "${id}". Skipping externalizing it by default.`);
            // may be an invalid import that's resolved by a plugin
            return false;
        }
    };
    // Returns true if it is configured as external, false if it is filtered
    // by noExternal and undefined if it isn't affected by the explicit config
    return (id, importer) => {
        const { ssr } = config;
        if (ssr) {
            if (
            // If this id is defined as external, force it as external
            // Note that individual package entries are allowed in ssr.external
            ssr.external?.includes(id)) {
                return true;
            }
            const pkgName = getNpmPackageName(id);
            if (!pkgName) {
                return isExternalizable(id, importer);
            }
            if (
            // A package name in ssr.external externalizes every
            // externalizable package entry
            ssr.external?.includes(pkgName)) {
                return isExternalizable(id, importer, true);
            }
            if (typeof noExternal === 'boolean') {
                return !noExternal;
            }
            if (noExternalFilter && !noExternalFilter(pkgName)) {
                return false;
            }
        }
        return isExternalizable(id, importer);
    };
}
function createIsSsrExternal(config) {
    const processedIds = new Map();
    const isConfiguredAsExternal = createIsConfiguredAsSsrExternal(config);
    return (id, importer) => {
        if (processedIds.has(id)) {
            return processedIds.get(id);
        }
        let external = false;
        if (id[0] !== '.' && !path.isAbsolute(id)) {
            external = isBuiltin(id) || isConfiguredAsExternal(id, importer);
        }
        processedIds.set(id, external);
        return external;
    };
}
// When config.experimental.buildSsrCjsExternalHeuristics is enabled, this function
// is used reverting to the Vite 2.9 SSR externalization heuristics
function cjsSsrCollectExternals(root, resolveOptions, ssrExternals, seen, logger) {
    const rootPkgPath = lookupFile(root, ['package.json']);
    if (!rootPkgPath) {
        return;
    }
    const rootPkgContent = fs.readFileSync(rootPkgPath, 'utf-8');
    if (!rootPkgContent) {
        return;
    }
    const rootPkg = JSON.parse(rootPkgContent);
    const deps = {
        ...rootPkg.devDependencies,
        ...rootPkg.dependencies,
    };
    const internalResolveOptions = {
        ...resolveOptions,
        root,
        isProduction: false,
        isBuild: true,
    };
    const depsToTrace = new Set();
    for (const id in deps) {
        if (seen.has(id))
            continue;
        seen.add(id);
        let esmEntry;
        let requireEntry;
        try {
            esmEntry = tryNodeResolve(id, undefined, internalResolveOptions, true, // we set `targetWeb` to `true` to get the ESM entry
            undefined, true)?.id;
            // normalizePath required for windows. tryNodeResolve uses normalizePath
            // which returns with '/', require.resolve returns with '\\'
            requireEntry = normalizePath(_require$1.resolve(id, { paths: [root] }));
        }
        catch (e) {
            // no main entry, but deep imports may be allowed
            const pkgDir = resolvePackageData(id, root)?.dir;
            if (pkgDir) {
                if (isInNodeModules(pkgDir)) {
                    ssrExternals.add(id);
                }
                else {
                    depsToTrace.add(path.dirname(pkgDir));
                }
                continue;
            }
            // resolve failed, assume include
            debug$7?.(`Failed to resolve entries for package "${id}"\n`, e);
            continue;
        }
        // no esm entry but has require entry
        if (!esmEntry) {
            ssrExternals.add(id);
        }
        // trace the dependencies of linked packages
        else if (!isInNodeModules(esmEntry)) {
            const pkgDir = resolvePackageData(id, root)?.dir;
            if (pkgDir) {
                depsToTrace.add(pkgDir);
            }
        }
        // has separate esm/require entry, assume require entry is cjs
        else if (esmEntry !== requireEntry) {
            ssrExternals.add(id);
        }
        // if we're externalizing ESM and CJS should basically just always do it?
        // or are there others like SystemJS / AMD that we'd need to handle?
        // for now, we'll just leave this as is
        else if (/\.m?js$/.test(esmEntry)) {
            const pkg = resolvePackageData(id, root)?.data;
            if (!pkg) {
                continue;
            }
            if (pkg.type === 'module' || esmEntry.endsWith('.mjs')) {
                ssrExternals.add(id);
                continue;
            }
            // check if the entry is cjs
            const content = fs.readFileSync(esmEntry, 'utf-8');
            if (CJS_CONTENT_RE.test(content)) {
                ssrExternals.add(id);
                continue;
            }
            logger.warn(`${id} doesn't appear to be written in CJS, but also doesn't appear to be a valid ES module (i.e. it doesn't have "type": "module" or an .mjs extension for the entry point). Please contact the package author to fix.`);
        }
    }
    for (const depRoot of depsToTrace) {
        cjsSsrCollectExternals(depRoot, resolveOptions, ssrExternals, seen, logger);
    }
}
function cjsShouldExternalizeForSSR(id, externals) {
    if (!externals) {
        return false;
    }
    const should = externals.some((e) => {
        if (id === e) {
            return true;
        }
        // deep imports, check ext before externalizing - only externalize
        // extension-less imports and explicit .js imports
        if (id.startsWith(e + '/') && (!path.extname(id) || id.endsWith('.js'))) {
            return true;
        }
    });
    return should;
}

/**
 * https://github.com/rollup/plugins/blob/master/packages/json/src/index.js
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file at
 * https://github.com/rollup/plugins/blob/master/LICENSE
 */
// Custom json filter for vite
const jsonExtRE = /\.json(?:$|\?)(?!commonjs-(?:proxy|external))/;
const jsonLangs = `\\.(?:json|json5)(?:$|\\?)`;
const jsonLangRE = new RegExp(jsonLangs);
const isJSONRequest = (request) => jsonLangRE.test(request);
function jsonPlugin(options = {}, isBuild) {
    return {
        name: 'vite:json',
        transform(json, id) {
            if (!jsonExtRE.test(id))
                return null;
            if (SPECIAL_QUERY_RE.test(id))
                return null;
            json = stripBomTag(json);
            try {
                if (options.stringify) {
                    if (isBuild) {
                        return {
                            // during build, parse then double-stringify to remove all
                            // unnecessary whitespaces to reduce bundle size.
                            code: `export default JSON.parse(${JSON.stringify(JSON.stringify(JSON.parse(json)))})`,
                            map: { mappings: '' },
                        };
                    }
                    else {
                        return `export default JSON.parse(${JSON.stringify(json)})`;
                    }
                }
                const parsed = JSON.parse(json);
                return {
                    code: dataToEsm(parsed, {
                        preferConst: true,
                        namedExports: options.namedExports,
                    }),
                    map: { mappings: '' },
                };
            }
            catch (e) {
                const errorMessageList = /\d+/.exec(e.message);
                const position = errorMessageList && parseInt(errorMessageList[0], 10);
                const msg = position
                    ? `, invalid JSON syntax found at line ${position}`
                    : `.`;
                this.error(`Failed to parse JSON file` + msg, e.idx);
            }
        },
    };
}

const ERR_OPTIMIZE_DEPS_PROCESSING_ERROR = 'ERR_OPTIMIZE_DEPS_PROCESSING_ERROR';
const ERR_OUTDATED_OPTIMIZED_DEP = 'ERR_OUTDATED_OPTIMIZED_DEP';
const debug$6 = createDebugger('vite:optimize-deps');
function optimizedDepsPlugin(config) {
    return {
        name: 'vite:optimized-deps',
        resolveId(id, source, { ssr }) {
            if (getDepsOptimizer(config, ssr)?.isOptimizedDepFile(id)) {
                return id;
            }
        },
        // this.load({ id }) isn't implemented in PluginContainer
        // The logic to register an id to wait until it is processed
        // is in importAnalysis, see call to delayDepsOptimizerUntil
        async load(id, options) {
            const ssr = options?.ssr === true;
            const depsOptimizer = getDepsOptimizer(config, ssr);
            if (depsOptimizer?.isOptimizedDepFile(id)) {
                const metadata = depsOptimizer.metadata;
                const file = cleanUrl(id);
                const versionMatch = id.match(DEP_VERSION_RE);
                const browserHash = versionMatch
                    ? versionMatch[1].split('=')[1]
                    : undefined;
                // Search in both the currently optimized and newly discovered deps
                const info = optimizedDepInfoFromFile(metadata, file);
                if (info) {
                    if (browserHash && info.browserHash !== browserHash) {
                        throwOutdatedRequest(id);
                    }
                    try {
                        // This is an entry point, it may still not be bundled
                        await info.processing;
                    }
                    catch {
                        // If the refresh has not happened after timeout, Vite considers
                        // something unexpected has happened. In this case, Vite
                        // returns an empty response that will error.
                        throwProcessingError(id);
                        return;
                    }
                    const newMetadata = depsOptimizer.metadata;
                    if (metadata !== newMetadata) {
                        const currentInfo = optimizedDepInfoFromFile(newMetadata, file);
                        if (info.browserHash !== currentInfo?.browserHash) {
                            throwOutdatedRequest(id);
                        }
                    }
                }
                debug$6?.(`load ${colors.cyan(file)}`);
                // Load the file from the cache instead of waiting for other plugin
                // load hooks to avoid race conditions, once processing is resolved,
                // we are sure that the file has been properly save to disk
                try {
                    return await fsp.readFile(file, 'utf-8');
                }
                catch (e) {
                    // Outdated non-entry points (CHUNK), loaded after a rerun
                    throwOutdatedRequest(id);
                }
            }
        },
    };
}
function optimizedDepsBuildPlugin(config) {
    let buildStartCalled = false;
    return {
        name: 'vite:optimized-deps-build',
        buildStart() {
            // Only reset the registered ids after a rebuild during build --watch
            if (!config.isWorker && buildStartCalled) {
                getDepsOptimizer(config)?.resetRegisteredIds();
            }
            buildStartCalled = true;
        },
        async resolveId(id, importer, options) {
            const depsOptimizer = getDepsOptimizer(config);
            if (!depsOptimizer)
                return;
            if (depsOptimizer.isOptimizedDepFile(id)) {
                return id;
            }
            else {
                if (options?.custom?.['vite:pre-alias']) {
                    // Skip registering the id if it is being resolved from the pre-alias plugin
                    // When a optimized dep is aliased, we need to avoid waiting for it before optimizing
                    return;
                }
                const resolved = await this.resolve(id, importer, {
                    ...options,
                    skipSelf: true,
                });
                if (resolved && !resolved.external) {
                    depsOptimizer.delayDepsOptimizerUntil(resolved.id, async () => {
                        await this.load(resolved);
                    });
                }
                return resolved;
            }
        },
        async load(id) {
            const depsOptimizer = getDepsOptimizer(config);
            if (!depsOptimizer?.isOptimizedDepFile(id)) {
                return;
            }
            depsOptimizer?.ensureFirstRun();
            const file = cleanUrl(id);
            // Search in both the currently optimized and newly discovered deps
            // If all the inputs are dependencies, we aren't going to get any
            const info = optimizedDepInfoFromFile(depsOptimizer.metadata, file);
            if (info) {
                await info.processing;
                debug$6?.(`load ${colors.cyan(file)}`);
            }
            else {
                throw new Error(`Something unexpected happened while optimizing "${id}".`);
            }
            // Load the file from the cache instead of waiting for other plugin
            // load hooks to avoid race conditions, once processing is resolved,
            // we are sure that the file has been properly save to disk
            return fsp.readFile(file, 'utf-8');
        },
    };
}
function throwProcessingError(id) {
    const err = new Error(`Something unexpected happened while optimizing "${id}". ` +
        `The current page should have reloaded by now`);
    err.code = ERR_OPTIMIZE_DEPS_PROCESSING_ERROR;
    // This error will be caught by the transform middleware that will
    // send a 504 status code request timeout
    throw err;
}
function throwOutdatedRequest(id) {
    const err = new Error(`There is a new version of the pre-bundle for "${id}", ` +
        `a page reload is going to ask for it.`);
    err.code = ERR_OUTDATED_OPTIMIZED_DEP;
    // This error will be caught by the transform middleware that will
    // send a 504 status code request timeout
    throw err;
}

const { isMatch, scan } = micromatch;
function getAffectedGlobModules(file, server) {
    const modules = [];
    for (const [id, allGlobs] of server._importGlobMap) {
        if (allGlobs.some((glob) => isMatch(file, glob)))
            modules.push(...(server.moduleGraph.getModulesByFile(id) || []));
    }
    modules.forEach((i) => {
        if (i?.file)
            server.moduleGraph.onFileChange(i.file);
    });
    return modules;
}
function importGlobPlugin(config) {
    let server;
    return {
        name: 'vite:import-glob',
        configureServer(_server) {
            server = _server;
            server._importGlobMap.clear();
        },
        async transform(code, id) {
            if (!code.includes('import.meta.glob'))
                return;
            const result = await transformGlobImport(code, id, config.root, (im, _, options) => this.resolve(im, id, options).then((i) => i?.id || im), config.isProduction, config.experimental.importGlobRestoreExtension);
            if (result) {
                if (server) {
                    const allGlobs = result.matches.map((i) => i.globsResolved);
                    server._importGlobMap.set(id, allGlobs);
                }
                return transformStableResult(result.s, id, config);
            }
        },
    };
}
const importGlobRE = /\bimport\.meta\.(glob|globEager|globEagerDefault)(?:<\w+>)?\s*\(/g;
const knownOptions = {
    as: ['string'],
    eager: ['boolean'],
    import: ['string'],
    exhaustive: ['boolean'],
    query: ['object', 'string'],
};
const forceDefaultAs = ['raw', 'url'];
function err$1(e, pos) {
    const error = new Error(e);
    error.pos = pos;
    return error;
}
function parseGlobOptions(rawOpts, optsStartIndex) {
    let opts = {};
    try {
        opts = evalValue(rawOpts);
    }
    catch {
        throw err$1('Vite is unable to parse the glob options as the value is not static', optsStartIndex);
    }
    if (opts == null) {
        return {};
    }
    for (const key in opts) {
        if (!(key in knownOptions)) {
            throw err$1(`Unknown glob option "${key}"`, optsStartIndex);
        }
        const allowedTypes = knownOptions[key];
        const valueType = typeof opts[key];
        if (!allowedTypes.includes(valueType)) {
            throw err$1(`Expected glob option "${key}" to be of type ${allowedTypes.join(' or ')}, but got ${valueType}`, optsStartIndex);
        }
    }
    if (typeof opts.query === 'object') {
        for (const key in opts.query) {
            const value = opts.query[key];
            if (!['string', 'number', 'boolean'].includes(typeof value)) {
                throw err$1(`Expected glob option "query.${key}" to be of type string, number, or boolean, but got ${typeof value}`, optsStartIndex);
            }
        }
    }
    if (opts.as && forceDefaultAs.includes(opts.as)) {
        if (opts.import && opts.import !== 'default' && opts.import !== '*')
            throw err$1(`Option "import" can only be "default" or "*" when "as" is "${opts.as}", but got "${opts.import}"`, optsStartIndex);
        opts.import = opts.import || 'default';
    }
    if (opts.as && opts.query)
        throw err$1('Options "as" and "query" cannot be used together', optsStartIndex);
    if (opts.as)
        opts.query = opts.as;
    return opts;
}
async function parseImportGlob(code, importer, root, resolveId) {
    let cleanCode;
    try {
        cleanCode = stripLiteral(code);
    }
    catch (e) {
        // skip invalid js code
        return [];
    }
    const matches = Array.from(cleanCode.matchAll(importGlobRE));
    const tasks = matches.map(async (match, index) => {
        const type = match[1];
        const start = match.index;
        const err = (msg) => {
            const e = new Error(`Invalid glob import syntax: ${msg}`);
            e.pos = start;
            return e;
        };
        let ast;
        let lastTokenPos;
        try {
            ast = parseExpressionAt(code, start, {
                ecmaVersion: 'latest',
                sourceType: 'module',
                ranges: true,
                onToken: (token) => {
                    lastTokenPos = token.end;
                },
            });
        }
        catch (e) {
            const _e = e;
            if (_e.message && _e.message.startsWith('Unterminated string constant'))
                return undefined;
            if (lastTokenPos == null || lastTokenPos <= start)
                throw _e;
            // tailing comma in object or array will make the parser think it's a comma operation
            // we try to parse again removing the comma
            try {
                const statement = code.slice(start, lastTokenPos).replace(/[,\s]*$/, '');
                ast = parseExpressionAt(' '.repeat(start) + statement, // to keep the ast position
                start, {
                    ecmaVersion: 'latest',
                    sourceType: 'module',
                    ranges: true,
                });
            }
            catch {
                throw _e;
            }
        }
        const found = findNodeAt(ast, start, undefined, 'CallExpression');
        if (!found)
            throw err(`Expect CallExpression, got ${ast.type}`);
        ast = found.node;
        if (ast.arguments.length < 1 || ast.arguments.length > 2)
            throw err(`Expected 1-2 arguments, but got ${ast.arguments.length}`);
        const arg1 = ast.arguments[0];
        const arg2 = ast.arguments[1];
        const globs = [];
        const validateLiteral = (element) => {
            if (!element)
                return;
            if (element.type === 'Literal') {
                if (typeof element.value !== 'string')
                    throw err(`Expected glob to be a string, but got "${typeof element.value}"`);
                globs.push(element.value);
            }
            else if (element.type === 'TemplateLiteral') {
                if (element.expressions.length !== 0) {
                    throw err(`Expected glob to be a string, but got dynamic template literal`);
                }
                globs.push(element.quasis[0].value.raw);
            }
            else {
                throw err('Could only use literals');
            }
        };
        if (arg1.type === 'ArrayExpression') {
            for (const element of arg1.elements) {
                validateLiteral(element);
            }
        }
        else {
            validateLiteral(arg1);
        }
        // arg2
        let options = {};
        if (arg2) {
            if (arg2.type !== 'ObjectExpression')
                throw err(`Expected the second argument to be an object literal, but got "${arg2.type}"`);
            options = parseGlobOptions(code.slice(arg2.range[0], arg2.range[1]), arg2.range[0]);
        }
        const end = ast.range[1];
        const globsResolved = await Promise.all(globs.map((glob) => toAbsoluteGlob(glob, root, importer, resolveId)));
        const isRelative = globs.every((i) => '.!'.includes(i[0]));
        return {
            match,
            index,
            globs,
            globsResolved,
            isRelative,
            options,
            type,
            start,
            end,
        };
    });
    return (await Promise.all(tasks)).filter(Boolean);
}
const importPrefix = '__vite_glob_';
const { basename, dirname, relative, join } = posix;
const warnedCSSDefaultImportVarName = '__vite_warned_css_default_import';
const jsonStringifyInOneline = (input) => JSON.stringify(input).replace(/[{,:]/g, '$& ').replace(/\}/g, ' }');
const createCssDefaultImportWarning = (globs, options) => `if (!${warnedCSSDefaultImportVarName}) {` +
    `${warnedCSSDefaultImportVarName} = true;` +
    `console.warn(${JSON.stringify('Default import of CSS without `?inline` is deprecated. ' +
        "Add the `{ query: '?inline' }` glob option to fix this.\n" +
        `For example: \`import.meta.glob(${jsonStringifyInOneline(globs.length === 1 ? globs[0] : globs)}, ${jsonStringifyInOneline({ ...options, query: '?inline' })})\``)});` +
    `}`;
/**
 * @param optimizeExport for dynamicImportVar plugin don't need to optimize export.
 */
async function transformGlobImport(code, id, root, resolveId, isProduction, restoreQueryExtension = false) {
    id = slash(id);
    root = slash(root);
    const isVirtual = !isAbsolute(id);
    const dir = isVirtual ? undefined : dirname(id);
    const matches = await parseImportGlob(code, isVirtual ? undefined : id, root, resolveId);
    const matchedFiles = new Set();
    // TODO: backwards compatibility
    matches.forEach((i) => {
        if (i.type === 'globEager')
            i.options.eager = true;
        if (i.type === 'globEagerDefault') {
            i.options.eager = true;
            i.options.import = 'default';
        }
    });
    if (!matches.length)
        return null;
    const s = new MagicString(code);
    const staticImports = (await Promise.all(matches.map(async ({ globs, globsResolved, isRelative, options, index, start, end, }) => {
        const cwd = getCommonBase(globsResolved) ?? root;
        const files = (await glob(globsResolved, {
            cwd,
            absolute: true,
            dot: !!options.exhaustive,
            ignore: options.exhaustive
                ? []
                : [join(cwd, '**/node_modules/**')],
        }))
            .filter((file) => file !== id)
            .sort();
        const objectProps = [];
        const staticImports = [];
        let query = !options.query
            ? ''
            : typeof options.query === 'string'
                ? options.query
                : stringifyQuery(options.query);
        if (query && query[0] !== '?')
            query = `?${query}`;
        const resolvePaths = (file) => {
            if (!dir) {
                if (isRelative)
                    throw new Error("In virtual modules, all globs must start with '/'");
                const filePath = `/${relative(root, file)}`;
                return { filePath, importPath: filePath };
            }
            let importPath = relative(dir, file);
            if (importPath[0] !== '.')
                importPath = `./${importPath}`;
            let filePath;
            if (isRelative) {
                filePath = importPath;
            }
            else {
                filePath = relative(root, file);
                if (filePath[0] !== '.')
                    filePath = `/${filePath}`;
            }
            return { filePath, importPath };
        };
        let includesCSS = false;
        files.forEach((file, i) => {
            const paths = resolvePaths(file);
            const filePath = paths.filePath;
            let importPath = paths.importPath;
            let importQuery = query;
            if (importQuery && importQuery !== '?raw') {
                const fileExtension = basename(file).split('.').slice(-1)[0];
                if (fileExtension && restoreQueryExtension)
                    importQuery = `${importQuery}&lang.${fileExtension}`;
            }
            importPath = `${importPath}${importQuery}`;
            const isCSS = !query && isCSSRequest(file) && !isModuleCSSRequest(file);
            includesCSS || (includesCSS = isCSS);
            const importKey = options.import && options.import !== '*'
                ? options.import
                : undefined;
            if (options.eager) {
                const variableName = `${importPrefix}${index}_${i}`;
                const expression = importKey
                    ? `{ ${importKey} as ${variableName} }`
                    : `* as ${variableName}`;
                staticImports.push(`import ${expression} from ${JSON.stringify(importPath)}`);
                if (!isProduction && isCSS) {
                    objectProps.push(`get ${JSON.stringify(filePath)}() { ${createCssDefaultImportWarning(globs, options)} return ${variableName} }`);
                    // console.log('importStatement end', JSON.stringify(globs, null, 2))
                }
                else {
                    objectProps.push(`${JSON.stringify(filePath)}: ${variableName}`);
                }
            }
            else {
                let importStatement = `import(${JSON.stringify(importPath)})`;
                if (importKey)
                    importStatement += `.then(m => m[${JSON.stringify(importKey)}])`;
                if (!isProduction && isCSS) {
                    // console.log('importStatement start', JSON.stringify(objectProps, null, 2), importStatement)
                    const handler = `{
                  apply: async function(target, thisArg, argumentsList) {
                    const res = await target.apply(thisArg, argumentsList)
                    if (res && typeof res === 'object' && res.hasOwnProperty('default')) {
                      let defaultValue = res.default;

                      Object.defineProperty(res, 'default', {
                        get() {
                          createCssDefaultImportWarning(
                            globs,
                            options,
                          )
                          return defaultValue;
                        },
                        configurable: true
                      });
                    }
                    return res
                  }
                }`;
                    function wrapProxyRes(str) {
                        return `new Proxy(${str}, ${handler})`;
                    }
                    objectProps.push(`${JSON.stringify(filePath)}: return ${wrapProxyRes(importStatement)})`);
                    // console.log('importStatement end', JSON.stringify(globs, null, 2))
                }
                else {
                    objectProps.push(`${JSON.stringify(filePath)}: () => ${importStatement}`);
                }
            }
        });
        files.forEach((i) => matchedFiles.add(i));
        const originalLineBreakCount = code.slice(start, end).match(/\n/g)?.length ?? 0;
        const lineBreaks = originalLineBreakCount > 0
            ? '\n'.repeat(originalLineBreakCount)
            : '';
        let replacement;
        if (!isProduction && includesCSS) {
            replacement =
                '/* #__PURE__ */ Object.assign(' +
                    '(() => {' +
                    `let ${warnedCSSDefaultImportVarName} = false;` +
                    `return {${objectProps.join(',')}${lineBreaks}};` +
                    '})()' +
                    ')';
        }
        else {
            replacement = `/* #__PURE__ */ Object.assign({${objectProps.join(',')}${lineBreaks}})`;
        }
        s.overwrite(start, end, replacement);
        return staticImports;
    }))).flat();
    if (staticImports.length)
        s.prepend(`${staticImports.join(';')};`);
    return {
        s,
        matches,
        files: matchedFiles,
    };
}
function globSafePath(path) {
    // slash path to ensure \ is converted to / as \ could lead to a double escape scenario
    // see https://github.com/mrmlnc/fast-glob#advanced-syntax
    return glob.escapePath(normalizePath(path));
}
function lastNthChar(str, n) {
    return str.charAt(str.length - 1 - n);
}
function globSafeResolvedPath(resolved, glob) {
    // we have to escape special glob characters in the resolved path, but keep the user specified globby suffix
    // walk back both strings until a character difference is found
    // then slice up the resolved path at that pos and escape the first part
    let numEqual = 0;
    const maxEqual = Math.min(resolved.length, glob.length);
    while (numEqual < maxEqual &&
        lastNthChar(resolved, numEqual) === lastNthChar(glob, numEqual)) {
        numEqual += 1;
    }
    const staticPartEnd = resolved.length - numEqual;
    const staticPart = resolved.slice(0, staticPartEnd);
    const dynamicPart = resolved.slice(staticPartEnd);
    return globSafePath(staticPart) + dynamicPart;
}
async function toAbsoluteGlob(glob, root, importer, resolveId) {
    let pre = '';
    if (glob[0] === '!') {
        pre = '!';
        glob = glob.slice(1);
    }
    root = globSafePath(root);
    const dir = importer ? globSafePath(dirname(importer)) : root;
    if (glob[0] === '/')
        return pre + posix.join(root, glob.slice(1));
    if (glob.startsWith('./'))
        return pre + posix.join(dir, glob.slice(2));
    if (glob.startsWith('../'))
        return pre + posix.join(dir, glob);
    if (glob.startsWith('**'))
        return pre + glob;
    const isSubImportsPattern = glob.startsWith('#') && glob.includes('*');
    const resolved = normalizePath((await resolveId(glob, importer, {
        custom: { 'vite:import-glob': { isSubImportsPattern } },
    })) || glob);
    if (isSubImportsPattern) {
        return join(root, resolved);
    }
    if (isAbsolute(resolved)) {
        return pre + globSafeResolvedPath(resolved, glob);
    }
    throw new Error(`Invalid glob: "${glob}" (resolved: "${resolved}"). It must start with '/' or './'`);
}
function getCommonBase(globsResolved) {
    const bases = globsResolved
        .filter((g) => g[0] !== '!')
        .map((glob) => {
        let { base } = scan(glob);
        // `scan('a/foo.js')` returns `base: 'a/foo.js'`
        if (posix.basename(base).includes('.'))
            base = posix.dirname(base);
        return base;
    });
    if (!bases.length)
        return null;
    let commonAncestor = '';
    const dirS = bases[0].split('/');
    for (let i = 0; i < dirS.length; i++) {
        const candidate = dirS.slice(0, i + 1).join('/');
        if (bases.every((base) => base.startsWith(candidate)))
            commonAncestor = candidate;
        else
            break;
    }
    if (!commonAncestor)
        commonAncestor = '/';
    return commonAncestor;
}

const debugHmr = createDebugger('vite:hmr');
const whitespaceRE = /\s/;
const normalizedClientDir = normalizePath(CLIENT_DIR);
function getShortName(file, root) {
    return file.startsWith(root + '/') ? path.posix.relative(root, file) : file;
}
async function handleHMRUpdate(file, server, configOnly) {
    const { ws, config, moduleGraph } = server;
    const shortFile = getShortName(file, config.root);
    const fileName = path.basename(file);
    const isConfig = file === config.configFile;
    const isConfigDependency = config.configFileDependencies.some((name) => file === name);
    const isEnv = config.inlineConfig.envFile !== false &&
        (fileName === '.env' || fileName.startsWith('.env.'));
    if (isConfig || isConfigDependency || isEnv) {
        // auto restart server
        debugHmr?.(`[config change] ${colors.dim(shortFile)}`);
        config.logger.info(colors.green(`${path.relative(process.cwd(), file)} changed, restarting server...`), { clear: true, timestamp: true });
        try {
            await server.restart();
        }
        catch (e) {
            config.logger.error(colors.red(e));
        }
        return;
    }
    if (configOnly) {
        return;
    }
    debugHmr?.(`[file change] ${colors.dim(shortFile)}`);
    // (dev only) the client itself cannot be hot updated.
    if (file.startsWith(normalizedClientDir)) {
        ws.send({
            type: 'full-reload',
            path: '*',
        });
        return;
    }
    const mods = moduleGraph.getModulesByFile(file);
    // check if any plugin wants to perform custom HMR handling
    const timestamp = Date.now();
    const hmrContext = {
        file,
        timestamp,
        modules: mods ? [...mods] : [],
        read: () => readModifiedFile(file),
        server,
    };
    for (const hook of config.getSortedPluginHooks('handleHotUpdate')) {
        const filteredModules = await hook(hmrContext);
        if (filteredModules) {
            hmrContext.modules = filteredModules;
        }
    }
    if (!hmrContext.modules.length) {
        // html file cannot be hot updated
        if (file.endsWith('.html')) {
            config.logger.info(colors.green(`page reload `) + colors.dim(shortFile), {
                clear: true,
                timestamp: true,
            });
            ws.send({
                type: 'full-reload',
                path: config.server.middlewareMode
                    ? '*'
                    : '/' + normalizePath(path.relative(config.root, file)),
            });
        }
        else {
            // loaded but not in the module graph, probably not js
            debugHmr?.(`[no modules matched] ${colors.dim(shortFile)}`);
        }
        return;
    }
    updateModules(shortFile, hmrContext.modules, timestamp, server);
}
function updateModules(file, modules, timestamp, { config, ws, moduleGraph }, afterInvalidation) {
    const updates = [];
    const invalidatedModules = new Set();
    const traversedModules = new Set();
    let needFullReload = false;
    for (const mod of modules) {
        moduleGraph.invalidateModule(mod, invalidatedModules, timestamp, true);
        if (needFullReload) {
            continue;
        }
        const boundaries = [];
        const hasDeadEnd = propagateUpdate(mod, traversedModules, boundaries);
        if (hasDeadEnd) {
            needFullReload = true;
            continue;
        }
        updates.push(...boundaries.map(({ boundary, acceptedVia }) => ({
            type: `${boundary.type}-update`,
            timestamp,
            path: normalizeHmrUrl(boundary.url),
            explicitImportRequired: boundary.type === 'js'
                ? isExplicitImportRequired(acceptedVia.url)
                : undefined,
            acceptedPath: normalizeHmrUrl(acceptedVia.url),
        })));
    }
    if (needFullReload) {
        config.logger.info(colors.green(`page reload `) + colors.dim(file), {
            clear: !afterInvalidation,
            timestamp: true,
        });
        ws.send({
            type: 'full-reload',
        });
        return;
    }
    if (updates.length === 0) {
        debugHmr?.(colors.yellow(`no update happened `) + colors.dim(file));
        return;
    }
    config.logger.info(colors.green(`hmr update `) +
        colors.dim([...new Set(updates.map((u) => u.path))].join(', ')), { clear: !afterInvalidation, timestamp: true });
    ws.send({
        type: 'update',
        updates,
    });
}
async function handleFileAddUnlink(file, server) {
    const modules = [...(server.moduleGraph.getModulesByFile(file) || [])];
    modules.push(...getAffectedGlobModules(file, server));
    if (modules.length > 0) {
        updateModules(getShortName(file, server.config.root), unique(modules), Date.now(), server);
    }
}
function areAllImportsAccepted(importedBindings, acceptedExports) {
    for (const binding of importedBindings) {
        if (!acceptedExports.has(binding)) {
            return false;
        }
    }
    return true;
}
function propagateUpdate(node, traversedModules, boundaries, currentChain = [node]) {
    if (traversedModules.has(node)) {
        return false;
    }
    traversedModules.add(node);
    // #7561
    // if the imports of `node` have not been analyzed, then `node` has not
    // been loaded in the browser and we should stop propagation.
    if (node.id && node.isSelfAccepting === undefined) {
        debugHmr?.(`[propagate update] stop propagation because not analyzed: ${colors.dim(node.id)}`);
        return false;
    }
    if (node.isSelfAccepting) {
        boundaries.push({ boundary: node, acceptedVia: node });
        // additionally check for CSS importers, since a PostCSS plugin like
        // Tailwind JIT may register any file as a dependency to a CSS file.
        for (const importer of node.importers) {
            if (isCSSRequest(importer.url) && !currentChain.includes(importer)) {
                propagateUpdate(importer, traversedModules, boundaries, currentChain.concat(importer));
            }
        }
        return false;
    }
    // A partially accepted module with no importers is considered self accepting,
    // because the deal is "there are parts of myself I can't self accept if they
    // are used outside of me".
    // Also, the imported module (this one) must be updated before the importers,
    // so that they do get the fresh imported module when/if they are reloaded.
    if (node.acceptedHmrExports) {
        boundaries.push({ boundary: node, acceptedVia: node });
    }
    else {
        if (!node.importers.size) {
            return true;
        }
        // #3716, #3913
        // For a non-CSS file, if all of its importers are CSS files (registered via
        // PostCSS plugins) it should be considered a dead end and force full reload.
        if (!isCSSRequest(node.url) &&
            [...node.importers].every((i) => isCSSRequest(i.url))) {
            return true;
        }
    }
    for (const importer of node.importers) {
        const subChain = currentChain.concat(importer);
        if (importer.acceptedHmrDeps.has(node)) {
            boundaries.push({ boundary: importer, acceptedVia: node });
            continue;
        }
        if (node.id && node.acceptedHmrExports && importer.importedBindings) {
            const importedBindingsFromNode = importer.importedBindings.get(node.id);
            if (importedBindingsFromNode &&
                areAllImportsAccepted(importedBindingsFromNode, node.acceptedHmrExports)) {
                continue;
            }
        }
        if (currentChain.includes(importer)) {
            // circular deps is considered dead end
            return true;
        }
        if (propagateUpdate(importer, traversedModules, boundaries, subChain)) {
            return true;
        }
    }
    return false;
}
function handlePrunedModules(mods, { ws }) {
    // update the disposed modules' hmr timestamp
    // since if it's re-imported, it should re-apply side effects
    // and without the timestamp the browser will not re-import it!
    const t = Date.now();
    mods.forEach((mod) => {
        mod.lastHMRTimestamp = t;
        debugHmr?.(`[dispose] ${colors.dim(mod.file)}`);
    });
    ws.send({
        type: 'prune',
        paths: [...mods].map((m) => m.url),
    });
}
/**
 * Lex import.meta.hot.accept() for accepted deps.
 * Since hot.accept() can only accept string literals or array of string
 * literals, we don't really need a heavy @babel/parse call on the entire source.
 *
 * @returns selfAccepts
 */
function lexAcceptedHmrDeps(code, start, urls) {
    let state = 0 /* LexerState.inCall */;
    // the state can only be 2 levels deep so no need for a stack
    let prevState = 0 /* LexerState.inCall */;
    let currentDep = '';
    function addDep(index) {
        urls.add({
            url: currentDep,
            start: index - currentDep.length - 1,
            end: index + 1,
        });
        currentDep = '';
    }
    for (let i = start; i < code.length; i++) {
        const char = code.charAt(i);
        switch (state) {
            case 0 /* LexerState.inCall */:
            case 4 /* LexerState.inArray */:
                if (char === `'`) {
                    prevState = state;
                    state = 1 /* LexerState.inSingleQuoteString */;
                }
                else if (char === `"`) {
                    prevState = state;
                    state = 2 /* LexerState.inDoubleQuoteString */;
                }
                else if (char === '`') {
                    prevState = state;
                    state = 3 /* LexerState.inTemplateString */;
                }
                else if (whitespaceRE.test(char)) {
                    continue;
                }
                else {
                    if (state === 0 /* LexerState.inCall */) {
                        if (char === `[`) {
                            state = 4 /* LexerState.inArray */;
                        }
                        else {
                            // reaching here means the first arg is neither a string literal
                            // nor an Array literal (direct callback) or there is no arg
                            // in both case this indicates a self-accepting module
                            return true; // done
                        }
                    }
                    else if (state === 4 /* LexerState.inArray */) {
                        if (char === `]`) {
                            return false; // done
                        }
                        else if (char === ',') {
                            continue;
                        }
                        else {
                            error(i);
                        }
                    }
                }
                break;
            case 1 /* LexerState.inSingleQuoteString */:
                if (char === `'`) {
                    addDep(i);
                    if (prevState === 0 /* LexerState.inCall */) {
                        // accept('foo', ...)
                        return false;
                    }
                    else {
                        state = prevState;
                    }
                }
                else {
                    currentDep += char;
                }
                break;
            case 2 /* LexerState.inDoubleQuoteString */:
                if (char === `"`) {
                    addDep(i);
                    if (prevState === 0 /* LexerState.inCall */) {
                        // accept('foo', ...)
                        return false;
                    }
                    else {
                        state = prevState;
                    }
                }
                else {
                    currentDep += char;
                }
                break;
            case 3 /* LexerState.inTemplateString */:
                if (char === '`') {
                    addDep(i);
                    if (prevState === 0 /* LexerState.inCall */) {
                        // accept('foo', ...)
                        return false;
                    }
                    else {
                        state = prevState;
                    }
                }
                else if (char === '$' && code.charAt(i + 1) === '{') {
                    error(i);
                }
                else {
                    currentDep += char;
                }
                break;
            default:
                throw new Error('unknown import.meta.hot lexer state');
        }
    }
    return false;
}
function lexAcceptedHmrExports(code, start, exportNames) {
    const urls = new Set();
    lexAcceptedHmrDeps(code, start, urls);
    for (const { url } of urls) {
        exportNames.add(url);
    }
    return urls.size > 0;
}
function normalizeHmrUrl(url) {
    if (url[0] !== '.' && url[0] !== '/') {
        url = wrapId(url);
    }
    return url;
}
function error(pos) {
    const err = new Error(`import.meta.hot.accept() can only accept string literals or an ` +
        `Array of string literals.`);
    err.pos = pos;
    throw err;
}
// vitejs/vite#610 when hot-reloading Vue files, we read immediately on file
// change event and sometimes this can be too early and get an empty buffer.
// Poll until the file's modified time has changed before reading again.
async function readModifiedFile(file) {
    const content = await fsp.readFile(file, 'utf-8');
    if (!content) {
        const mtime = (await fsp.stat(file)).mtimeMs;
        await new Promise((r) => {
            let n = 0;
            const poll = async () => {
                n++;
                const newMtime = (await fsp.stat(file)).mtimeMs;
                if (newMtime !== mtime || n > 10) {
                    r(0);
                }
                else {
                    setTimeout(poll, 10);
                }
            };
            setTimeout(poll, 10);
        });
        return await fsp.readFile(file, 'utf-8');
    }
    else {
        return content;
    }
}

const debug$5 = createDebugger('vite:import-analysis');
const clientDir = normalizePath(CLIENT_DIR);
const skipRE = /\.(?:map|json)(?:$|\?)/;
const canSkipImportAnalysis = (id) => skipRE.test(id) || isDirectCSSRequest(id);
const optimizedDepChunkRE$1 = /\/chunk-[A-Z\d]{8}\.js/;
const optimizedDepDynamicRE$1 = /-[A-Z\d]{8}\.js/;
const hasImportInQueryParamsRE = /[?&]import=?\b/;
const hasViteIgnoreRE = /\/\*\s*@vite-ignore\s*\*\//;
const cleanUpRawUrlRE = /\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm;
const urlIsStringRE = /^(?:'.*'|".*"|`.*`)$/;
function isExplicitImportRequired(url) {
    return !isJSRequest(cleanUrl(url)) && !isCSSRequest(url);
}
function markExplicitImport(url) {
    if (isExplicitImportRequired(url)) {
        return injectQuery(url, 'import');
    }
    return url;
}
function extractImportedBindings(id, source, importSpec, importedBindings) {
    let bindings = importedBindings.get(id);
    if (!bindings) {
        bindings = new Set();
        importedBindings.set(id, bindings);
    }
    const isDynamic = importSpec.d > -1;
    const isMeta = importSpec.d === -2;
    if (isDynamic || isMeta) {
        // this basically means the module will be impacted by any change in its dep
        bindings.add('*');
        return;
    }
    const exp = source.slice(importSpec.ss, importSpec.se);
    const [match0] = findStaticImports(exp);
    if (!match0) {
        return;
    }
    const parsed = parseStaticImport(match0);
    if (!parsed) {
        return;
    }
    if (parsed.namespacedImport) {
        bindings.add('*');
    }
    if (parsed.defaultImport) {
        bindings.add('default');
    }
    if (parsed.namedImports) {
        for (const name of Object.keys(parsed.namedImports)) {
            bindings.add(name);
        }
    }
}
/**
 * Server-only plugin that lexes, resolves, rewrites and analyzes url imports.
 *
 * - Imports are resolved to ensure they exist on disk
 *
 * - Lexes HMR accept calls and updates import relationships in the module graph
 *
 * - Bare module imports are resolved (by @rollup-plugin/node-resolve) to
 * absolute file paths, e.g.
 *
 *     ```js
 *     import 'foo'
 *     ```
 *     is rewritten to
 *     ```js
 *     import '/@fs//project/node_modules/foo/dist/foo.js'
 *     ```
 *
 * - CSS imports are appended with `.js` since both the js module and the actual
 * css (referenced via `<link>`) may go through the transform pipeline:
 *
 *     ```js
 *     import './style.css'
 *     ```
 *     is rewritten to
 *     ```js
 *     import './style.css.js'
 *     ```
 */
function importAnalysisPlugin(config) {
    const { root, base } = config;
    const clientPublicPath = path.posix.join(base, CLIENT_PUBLIC_PATH);
    const enablePartialAccept = config.experimental?.hmrPartialAccept;
    let server;
    let _env;
    function getEnv(ssr) {
        if (!_env) {
            _env = `import.meta.env = ${JSON.stringify({
                ...config.env,
                SSR: '__vite__ssr__',
            })};`;
            // account for user env defines
            for (const key in config.define) {
                if (key.startsWith(`import.meta.env.`)) {
                    const val = config.define[key];
                    _env += `${key} = ${typeof val === 'string' ? val : JSON.stringify(val)};`;
                }
            }
        }
        return _env.replace('"__vite__ssr__"', ssr + '');
    }
    return {
        name: 'vite:import-analysis',
        configureServer(_server) {
            server = _server;
        },
        async transform(source, importer, options) {
            // In a real app `server` is always defined, but it is undefined when
            // running src/node/server/__tests__/pluginContainer.spec.ts
            if (!server) {
                return null;
            }
            const ssr = options?.ssr === true;
            const prettyImporter = prettifyUrl(importer, root);
            if (canSkipImportAnalysis(importer)) {
                debug$5?.(colors.dim(`[skipped] ${prettyImporter}`));
                return null;
            }
            const start = performance.now();
            await init;
            let imports;
            let exports;
            source = stripBomTag(source);
            try {
                [imports, exports] = parse$3(source);
            }
            catch (e) {
                const isVue = importer.endsWith('.vue');
                const isJsx = importer.endsWith('.jsx') || importer.endsWith('.tsx');
                const maybeJSX = !isVue && isJSRequest(importer);
                const msg = isVue
                    ? `Install @vitejs/plugin-vue to handle .vue files.`
                    : maybeJSX
                        ? isJsx
                            ? `If you use tsconfig.json, make sure to not set jsx to preserve.`
                            : `If you are using JSX, make sure to name the file with the .jsx or .tsx extension.`
                        : `You may need to install appropriate plugins to handle the ${path.extname(importer)} file format, or if it's an asset, add "**/*${path.extname(importer)}" to \`assetsInclude\` in your configuration.`;
                this.error(`Failed to parse source for import analysis because the content ` +
                    `contains invalid JS syntax. ` +
                    msg, e.idx);
            }
            const depsOptimizer = getDepsOptimizer(config, ssr);
            const { moduleGraph } = server;
            // since we are already in the transform phase of the importer, it must
            // have been loaded so its entry is guaranteed in the module graph.
            const importerModule = moduleGraph.getModuleById(importer);
            if (!importerModule) {
                // This request is no longer valid. It could happen for optimized deps
                // requests. A full reload is going to request this id again.
                // Throwing an outdated error so we properly finish the request with a
                // 504 sent to the browser.
                throwOutdatedRequest(importer);
            }
            if (!imports.length && !this._addedImports) {
                importerModule.isSelfAccepting = false;
                debug$5?.(`${timeFrom(start)} ${colors.dim(`[no imports] ${prettyImporter}`)}`);
                return source;
            }
            let hasHMR = false;
            let isSelfAccepting = false;
            let hasEnv = false;
            let needQueryInjectHelper = false;
            let s;
            const str = () => s || (s = new MagicString(source));
            const importedUrls = new Set();
            let isPartiallySelfAccepting = false;
            const importedBindings = enablePartialAccept
                ? new Map()
                : null;
            const toAbsoluteUrl = (url) => path.posix.resolve(path.posix.dirname(importerModule.url), url);
            const normalizeUrl = async (url, pos, forceSkipImportAnalysis = false) => {
                url = stripBase(url, base);
                let importerFile = importer;
                const optimizeDeps = getDepOptimizationConfig(config, ssr);
                if (moduleListContains(optimizeDeps?.exclude, url)) {
                    if (depsOptimizer) {
                        await depsOptimizer.scanProcessing;
                        // if the dependency encountered in the optimized file was excluded from the optimization
                        // the dependency needs to be resolved starting from the original source location of the optimized file
                        // because starting from node_modules/.vite will not find the dependency if it was not hoisted
                        // (that is, if it is under node_modules directory in the package source of the optimized file)
                        for (const optimizedModule of depsOptimizer.metadata.depInfoList) {
                            if (!optimizedModule.src)
                                continue; // Ignore chunks
                            if (optimizedModule.file === importerModule.file) {
                                importerFile = optimizedModule.src;
                            }
                        }
                    }
                }
                const resolved = await this.resolve(url, importerFile);
                if (!resolved) {
                    // in ssr, we should let node handle the missing modules
                    if (ssr) {
                        return [url, url];
                    }
                    // fix#9534, prevent the importerModuleNode being stopped from propagating updates
                    importerModule.isSelfAccepting = false;
                    return this.error(`Failed to resolve import "${url}" from "${path.relative(process.cwd(), importerFile)}". Does the file exist?`, pos);
                }
                const isRelative = url[0] === '.';
                const isSelfImport = !isRelative && cleanUrl(url) === cleanUrl(importer);
                // normalize all imports into resolved URLs
                // e.g. `import 'foo'` -> `import '/@fs/.../node_modules/foo/index.js'`
                if (resolved.id.startsWith(root + '/')) {
                    // in root: infer short absolute path from root
                    url = resolved.id.slice(root.length);
                }
                else if (depsOptimizer?.isOptimizedDepFile(resolved.id) ||
                    fs.existsSync(cleanUrl(resolved.id))) {
                    // an optimized deps may not yet exists in the filesystem, or
                    // a regular file exists but is out of root: rewrite to absolute /@fs/ paths
                    url = path.posix.join(FS_PREFIX, resolved.id);
                }
                else {
                    url = resolved.id;
                }
                if (isExternalUrl(url)) {
                    return [url, url];
                }
                // if the resolved id is not a valid browser import specifier,
                // prefix it to make it valid. We will strip this before feeding it
                // back into the transform pipeline
                if (url[0] !== '.' && url[0] !== '/') {
                    url = wrapId(resolved.id);
                }
                // make the URL browser-valid if not SSR
                if (!ssr) {
                    // mark non-js/css imports with `?import`
                    url = markExplicitImport(url);
                    // If the url isn't a request for a pre-bundled common chunk,
                    // for relative js/css imports, or self-module virtual imports
                    // (e.g. vue blocks), inherit importer's version query
                    // do not do this for unknown type imports, otherwise the appended
                    // query can break 3rd party plugin's extension checks.
                    if ((isRelative || isSelfImport) &&
                        !hasImportInQueryParamsRE.test(url) &&
                        !url.match(DEP_VERSION_RE)) {
                        const versionMatch = importer.match(DEP_VERSION_RE);
                        if (versionMatch) {
                            url = injectQuery(url, versionMatch[1]);
                        }
                    }
                    // check if the dep has been hmr updated. If yes, we need to attach
                    // its last updated timestamp to force the browser to fetch the most
                    // up-to-date version of this module.
                    try {
                        // delay setting `isSelfAccepting` until the file is actually used (#7870)
                        // We use an internal function to avoid resolving the url again
                        const depModule = await moduleGraph._ensureEntryFromUrl(unwrapId(url), ssr, canSkipImportAnalysis(url) || forceSkipImportAnalysis, resolved);
                        if (depModule.lastHMRTimestamp > 0) {
                            url = injectQuery(url, `t=${depModule.lastHMRTimestamp}`);
                        }
                    }
                    catch (e) {
                        // it's possible that the dep fails to resolve (non-existent import)
                        // attach location to the missing import
                        e.pos = pos;
                        throw e;
                    }
                    // prepend base
                    url = joinUrlSegments(base, url);
                }
                return [url, resolved.id];
            };
            const orderedAcceptedUrls = new Array(imports.length);
            const orderedAcceptedExports = new Array(imports.length);
            await Promise.all(imports.map(async (importSpecifier, index) => {
                const { s: start, e: end, ss: expStart, se: expEnd, d: dynamicIndex, 
                // #2083 User may use escape path,
                // so use imports[index].n to get the unescaped string
                n: specifier, a: assertIndex, } = importSpecifier;
                const rawUrl = source.slice(start, end);
                // check import.meta usage
                if (rawUrl === 'import.meta') {
                    const prop = source.slice(end, end + 4);
                    if (prop === '.hot') {
                        hasHMR = true;
                        const endHot = end + 4 + (source[end + 4] === '?' ? 1 : 0);
                        if (source.slice(endHot, endHot + 7) === '.accept') {
                            // further analyze accepted modules
                            if (source.slice(endHot, endHot + 14) === '.acceptExports') {
                                const importAcceptedExports = (orderedAcceptedExports[index] =
                                    new Set());
                                lexAcceptedHmrExports(source, source.indexOf('(', endHot + 14) + 1, importAcceptedExports);
                                isPartiallySelfAccepting = true;
                            }
                            else {
                                const importAcceptedUrls = (orderedAcceptedUrls[index] =
                                    new Set());
                                if (lexAcceptedHmrDeps(source, source.indexOf('(', endHot + 7) + 1, importAcceptedUrls)) {
                                    isSelfAccepting = true;
                                }
                            }
                        }
                    }
                    else if (prop === '.env') {
                        hasEnv = true;
                    }
                    return;
                }
                const isDynamicImport = dynamicIndex > -1;
                // strip import assertions as we can process them ourselves
                if (!isDynamicImport && assertIndex > -1) {
                    str().remove(end + 1, expEnd);
                }
                // static import or valid string in dynamic import
                // If resolvable, let's resolve it
                if (specifier) {
                    // skip external / data uri
                    if (isExternalUrl(specifier) || isDataUrl(specifier)) {
                        return;
                    }
                    // skip ssr external
                    if (ssr) {
                        if (config.legacy?.buildSsrCjsExternalHeuristics) {
                            if (cjsShouldExternalizeForSSR(specifier, server._ssrExternals)) {
                                return;
                            }
                        }
                        else if (shouldExternalizeForSSR(specifier, importer, config)) {
                            return;
                        }
                        if (isBuiltin(specifier)) {
                            return;
                        }
                    }
                    // skip client
                    if (specifier === clientPublicPath) {
                        return;
                    }
                    // warn imports to non-asset /public files
                    if (specifier[0] === '/' &&
                        !(config.assetsInclude(cleanUrl(specifier)) ||
                            urlRE.test(specifier)) &&
                        checkPublicFile(specifier, config)) {
                        throw new Error(`Cannot import non-asset file ${specifier} which is inside /public. ` +
                            `JS/CSS files inside /public are copied as-is on build and ` +
                            `can only be referenced via <script src> or <link href> in html. ` +
                            `If you want to get the URL of that file, use ${injectQuery(specifier, 'url')} instead.`);
                    }
                    // normalize
                    const [url, resolvedId] = await normalizeUrl(specifier, start);
                    if (!isDynamicImport &&
                        specifier &&
                        !specifier.includes('?') && // ignore custom queries
                        isCSSRequest(resolvedId) &&
                        !isModuleCSSRequest(resolvedId)) {
                        const sourceExp = source.slice(expStart, start);
                        if (sourceExp.includes('from') && // check default and named imports
                            !sourceExp.includes('__vite_glob_') // glob handles deprecation message itself
                        ) {
                            const newImport = sourceExp + specifier + `?inline` + source.slice(end, expEnd);
                            this.warn(`\n` +
                                colors.cyan(importerModule.file) +
                                `\n` +
                                colors.reset(generateCodeFrame(source, start)) +
                                `\n` +
                                colors.yellow(`Default and named imports from CSS files are deprecated. ` +
                                    `Use the ?inline query instead. ` +
                                    `For example: ${newImport}`));
                        }
                    }
                    // record as safe modules
                    server?.moduleGraph.safeModulesPath.add(fsPathFromUrl(url));
                    if (url !== specifier) {
                        let rewriteDone = false;
                        if (depsOptimizer?.isOptimizedDepFile(resolvedId) &&
                            !resolvedId.match(optimizedDepChunkRE$1)) {
                            // for optimized cjs deps, support named imports by rewriting named imports to const assignments.
                            // internal optimized chunks don't need es interop and are excluded
                            // The browserHash in resolvedId could be stale in which case there will be a full
                            // page reload. We could return a 404 in that case but it is safe to return the request
                            const file = cleanUrl(resolvedId); // Remove ?v={hash}
                            const needsInterop = await optimizedDepNeedsInterop(depsOptimizer.metadata, file, config, ssr);
                            if (needsInterop === undefined) {
                                // Non-entry dynamic imports from dependencies will reach here as there isn't
                                // optimize info for them, but they don't need es interop. If the request isn't
                                // a dynamic import, then it is an internal Vite error
                                if (!file.match(optimizedDepDynamicRE$1)) {
                                    config.logger.error(colors.red(`Vite Error, ${url} optimized info should be defined`));
                                }
                            }
                            else if (needsInterop) {
                                debug$5?.(`${url} needs interop`);
                                interopNamedImports(str(), importSpecifier, url, index, importer, config);
                                rewriteDone = true;
                            }
                        }
                        // If source code imports builtin modules via named imports, the stub proxy export
                        // would fail as it's `export default` only. Apply interop for builtin modules to
                        // correctly throw the error message.
                        else if (url.includes(browserExternalId) &&
                            source.slice(expStart, start).includes('{')) {
                            interopNamedImports(str(), importSpecifier, url, index, importer, config);
                            rewriteDone = true;
                        }
                        if (!rewriteDone) {
                            const rewrittenUrl = JSON.stringify(url);
                            const s = isDynamicImport ? start : start - 1;
                            const e = isDynamicImport ? end : end + 1;
                            str().overwrite(s, e, rewrittenUrl, {
                                contentOnly: true,
                            });
                        }
                    }
                    // record for HMR import chain analysis
                    // make sure to unwrap and normalize away base
                    const hmrUrl = unwrapId(stripBase(url, base));
                    const isLocalImport = !isExternalUrl(hmrUrl) && !isDataUrl(hmrUrl);
                    if (isLocalImport) {
                        importedUrls.add(hmrUrl);
                    }
                    if (enablePartialAccept && importedBindings) {
                        extractImportedBindings(resolvedId, source, importSpecifier, importedBindings);
                    }
                    if (!isDynamicImport &&
                        isLocalImport &&
                        config.server.preTransformRequests) {
                        // pre-transform known direct imports
                        // These requests will also be registered in transformRequest to be awaited
                        // by the deps optimizer
                        const url = removeImportQuery(hmrUrl);
                        server.transformRequest(url, { ssr }).catch((e) => {
                            if (e?.code === ERR_OUTDATED_OPTIMIZED_DEP ||
                                e?.code === ERR_CLOSED_SERVER) {
                                // these are expected errors
                                return;
                            }
                            // Unexpected error, log the issue but avoid an unhandled exception
                            config.logger.error(e.message, { error: e });
                        });
                    }
                }
                else if (!importer.startsWith(clientDir)) {
                    if (!isInNodeModules(importer)) {
                        // check @vite-ignore which suppresses dynamic import warning
                        const hasViteIgnore = hasViteIgnoreRE.test(
                        // complete expression inside parens
                        source.slice(dynamicIndex + 1, end));
                        if (!hasViteIgnore) {
                            this.warn(`\n` +
                                colors.cyan(importerModule.file) +
                                `\n` +
                                colors.reset(generateCodeFrame(source, start)) +
                                colors.yellow(`\nThe above dynamic import cannot be analyzed by Vite.\n` +
                                    `See ${colors.blue(`https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars#limitations`)} ` +
                                    `for supported dynamic import formats. ` +
                                    `If this is intended to be left as-is, you can use the ` +
                                    `/* @vite-ignore */ comment inside the import() call to suppress this warning.\n`));
                        }
                    }
                    if (!ssr) {
                        const url = rawUrl.replace(cleanUpRawUrlRE, '').trim();
                        if (!urlIsStringRE.test(url) ||
                            isExplicitImportRequired(url.slice(1, -1))) {
                            needQueryInjectHelper = true;
                            str().overwrite(start, end, `__vite__injectQuery(${url}, 'import')`, { contentOnly: true });
                        }
                    }
                }
            }));
            const acceptedUrls = mergeAcceptedUrls(orderedAcceptedUrls);
            const acceptedExports = mergeAcceptedUrls(orderedAcceptedExports);
            if (hasEnv) {
                // inject import.meta.env
                str().prepend(getEnv(ssr));
            }
            if (hasHMR && !ssr) {
                debugHmr?.(`${isSelfAccepting
                    ? `[self-accepts]`
                    : isPartiallySelfAccepting
                        ? `[accepts-exports]`
                        : acceptedUrls.size
                            ? `[accepts-deps]`
                            : `[detected api usage]`} ${prettyImporter}`);
                // inject hot context
                str().prepend(`import { createHotContext as __vite__createHotContext } from "${clientPublicPath}";` +
                    `import.meta.hot = __vite__createHotContext(${JSON.stringify(normalizeHmrUrl(importerModule.url))});`);
            }
            if (needQueryInjectHelper) {
                str().prepend(`import { injectQuery as __vite__injectQuery } from "${clientPublicPath}";`);
            }
            // normalize and rewrite accepted urls
            const normalizedAcceptedUrls = new Set();
            for (const { url, start, end } of acceptedUrls) {
                const isRelative = url[0] === '.';
                const [normalized] = await moduleGraph.resolveUrl(isRelative ? toAbsoluteUrl(url) : url, ssr);
                normalizedAcceptedUrls.add(normalized);
                str().overwrite(start, end, JSON.stringify(normalized), {
                    contentOnly: true,
                });
            }
            // update the module graph for HMR analysis.
            // node CSS imports does its own graph update in the css plugin so we
            // only handle js graph updates here.
            if (!isCSSRequest(importer)) {
                // attached by pluginContainer.addWatchFile
                const pluginImports = this._addedImports;
                if (pluginImports) {
                    (await Promise.all([...pluginImports].map((id) => normalizeUrl(id, 0, true)))).forEach(([url]) => importedUrls.add(url));
                }
                // HMR transforms are no-ops in SSR, so an `accept` call will
                // never be injected. Avoid updating the `isSelfAccepting`
                // property for our module node in that case.
                if (ssr && importerModule.isSelfAccepting) {
                    isSelfAccepting = true;
                }
                // a partially accepted module that accepts all its exports
                // behaves like a self-accepted module in practice
                if (!isSelfAccepting &&
                    isPartiallySelfAccepting &&
                    acceptedExports.size >= exports.length &&
                    exports.every((e) => acceptedExports.has(e.n))) {
                    isSelfAccepting = true;
                }
                const prunedImports = await moduleGraph.updateModuleInfo(importerModule, importedUrls, importedBindings, normalizedAcceptedUrls, isPartiallySelfAccepting ? acceptedExports : null, isSelfAccepting, ssr);
                if (hasHMR && prunedImports) {
                    handlePrunedModules(prunedImports, server);
                }
            }
            debug$5?.(`${timeFrom(start)} ${colors.dim(`[${importedUrls.size} imports rewritten] ${prettyImporter}`)}`);
            if (s) {
                return transformStableResult(s, importer, config);
            }
            else {
                return source;
            }
        },
    };
}
function mergeAcceptedUrls(orderedUrls) {
    const acceptedUrls = new Set();
    for (const urls of orderedUrls) {
        if (!urls)
            continue;
        for (const url of urls)
            acceptedUrls.add(url);
    }
    return acceptedUrls;
}
function interopNamedImports(str, importSpecifier, rewrittenUrl, importIndex, importer, config) {
    const source = str.original;
    const { s: start, e: end, ss: expStart, se: expEnd, d: dynamicIndex, } = importSpecifier;
    if (dynamicIndex > -1) {
        // rewrite `import('package')` to expose the default directly
        str.overwrite(expStart, expEnd, `import('${rewrittenUrl}').then(m => m.default && m.default.__esModule ? m.default : ({ ...m.default, default: m.default }))`, { contentOnly: true });
    }
    else {
        const exp = source.slice(expStart, expEnd);
        const rawUrl = source.slice(start, end);
        const rewritten = transformCjsImport(exp, rewrittenUrl, rawUrl, importIndex, importer, config);
        if (rewritten) {
            str.overwrite(expStart, expEnd, rewritten, { contentOnly: true });
        }
        else {
            // #1439 export * from '...'
            str.overwrite(start, end, rewrittenUrl, { contentOnly: true });
        }
    }
}
/**
 * Detect import statements to a known optimized CJS dependency and provide
 * ES named imports interop. We do this by rewriting named imports to a variable
 * assignment to the corresponding property on the `module.exports` of the cjs
 * module. Note this doesn't support dynamic re-assignments from within the cjs
 * module.
 *
 * Note that es-module-lexer treats `export * from '...'` as an import as well,
 * so, we may encounter ExportAllDeclaration here, in which case `undefined`
 * will be returned.
 *
 * Credits \@csr632 via #837
 */
function transformCjsImport(importExp, url, rawUrl, importIndex, importer, config) {
    const node = parse$4(importExp, {
        ecmaVersion: 'latest',
        sourceType: 'module',
    }).body[0];
    // `export * from '...'` may cause unexpected problem, so give it a warning
    if (config.command === 'serve' &&
        node.type === 'ExportAllDeclaration' &&
        !node.exported) {
        config.logger.warn(colors.yellow(`\nUnable to interop \`${importExp}\` in ${importer}, this may lose module exports. Please export "${rawUrl}" as ESM or use named exports instead, e.g. \`export { A, B } from "${rawUrl}"\``));
    }
    else if (node.type === 'ImportDeclaration' ||
        node.type === 'ExportNamedDeclaration') {
        if (!node.specifiers.length) {
            return `import "${url}"`;
        }
        const importNames = [];
        const exportNames = [];
        let defaultExports = '';
        for (const spec of node.specifiers) {
            if (spec.type === 'ImportSpecifier' &&
                spec.imported.type === 'Identifier') {
                const importedName = spec.imported.name;
                const localName = spec.local.name;
                importNames.push({ importedName, localName });
            }
            else if (spec.type === 'ImportDefaultSpecifier') {
                importNames.push({
                    importedName: 'default',
                    localName: spec.local.name,
                });
            }
            else if (spec.type === 'ImportNamespaceSpecifier') {
                importNames.push({ importedName: '*', localName: spec.local.name });
            }
            else if (spec.type === 'ExportSpecifier' &&
                spec.exported.type === 'Identifier') {
                // for ExportSpecifier, local name is same as imported name
                // prefix the variable name to avoid clashing with other local variables
                const importedName = spec.local.name;
                // we want to specify exported name as variable and re-export it
                const exportedName = spec.exported.name;
                if (exportedName === 'default') {
                    defaultExports = makeLegalIdentifier(`__vite__cjsExportDefault_${importIndex}`);
                    importNames.push({ importedName, localName: defaultExports });
                }
                else {
                    const localName = makeLegalIdentifier(`__vite__cjsExport_${exportedName}`);
                    importNames.push({ importedName, localName });
                    exportNames.push(`${localName} as ${exportedName}`);
                }
            }
        }
        // If there is multiple import for same id in one file,
        // importIndex will prevent the cjsModuleName to be duplicate
        const cjsModuleName = makeLegalIdentifier(`__vite__cjsImport${importIndex}_${rawUrl}`);
        const lines = [`import ${cjsModuleName} from "${url}"`];
        importNames.forEach(({ importedName, localName }) => {
            if (importedName === '*') {
                lines.push(`const ${localName} = ${cjsModuleName}`);
            }
            else if (importedName === 'default') {
                lines.push(`const ${localName} = ${cjsModuleName}.__esModule ? ${cjsModuleName}.default : ${cjsModuleName}`);
            }
            else {
                lines.push(`const ${localName} = ${cjsModuleName}["${importedName}"]`);
            }
        });
        if (defaultExports) {
            lines.push(`export default ${defaultExports}`);
        }
        if (exportNames.length) {
            lines.push(`export { ${exportNames.join(', ')} }`);
        }
        return lines.join('; ');
    }
}

const process_env_NODE_ENV_RE = /(\bglobal(This)?\.)?\bprocess\.env\.NODE_ENV\b/g;
// ids in transform are normalized to unix style
const normalizedClientEntry = normalizePath(CLIENT_ENTRY);
const normalizedEnvEntry = normalizePath(ENV_ENTRY);
/**
 * some values used by the client needs to be dynamically injected by the server
 * @server-only
 */
function clientInjectionsPlugin(config) {
    let injectConfigValues;
    return {
        name: 'vite:client-inject',
        async buildStart() {
            const resolvedServerHostname = (await resolveHostname(config.server.host))
                .name;
            const resolvedServerPort = config.server.port;
            const devBase = config.base;
            const serverHost = `${resolvedServerHostname}:${resolvedServerPort}${devBase}`;
            let hmrConfig = config.server.hmr;
            hmrConfig = isObject(hmrConfig) ? hmrConfig : undefined;
            const host = hmrConfig?.host || null;
            const protocol = hmrConfig?.protocol || null;
            const timeout = hmrConfig?.timeout || 30000;
            const overlay = hmrConfig?.overlay !== false;
            const isHmrServerSpecified = !!hmrConfig?.server;
            // hmr.clientPort -> hmr.port
            // -> (24678 if middleware mode and HMR server is not specified) -> new URL(import.meta.url).port
            let port = hmrConfig?.clientPort || hmrConfig?.port || null;
            if (config.server.middlewareMode && !isHmrServerSpecified) {
                port || (port = 24678);
            }
            let directTarget = hmrConfig?.host || resolvedServerHostname;
            directTarget += `:${hmrConfig?.port || resolvedServerPort}`;
            directTarget += devBase;
            let hmrBase = devBase;
            if (hmrConfig?.path) {
                hmrBase = path.posix.join(hmrBase, hmrConfig.path);
            }
            const serializedDefines = serializeDefine(config.define || {});
            const modeReplacement = escapeReplacement(config.mode);
            const baseReplacement = escapeReplacement(devBase);
            const definesReplacement = () => serializedDefines;
            const serverHostReplacement = escapeReplacement(serverHost);
            const hmrProtocolReplacement = escapeReplacement(protocol);
            const hmrHostnameReplacement = escapeReplacement(host);
            const hmrPortReplacement = escapeReplacement(port);
            const hmrDirectTargetReplacement = escapeReplacement(directTarget);
            const hmrBaseReplacement = escapeReplacement(hmrBase);
            const hmrTimeoutReplacement = escapeReplacement(timeout);
            const hmrEnableOverlayReplacement = escapeReplacement(overlay);
            injectConfigValues = (code) => {
                return code
                    .replace(`__MODE__`, modeReplacement)
                    .replace(/__BASE__/g, baseReplacement)
                    .replace(`__DEFINES__`, definesReplacement)
                    .replace(`__SERVER_HOST__`, serverHostReplacement)
                    .replace(`__HMR_PROTOCOL__`, hmrProtocolReplacement)
                    .replace(`__HMR_HOSTNAME__`, hmrHostnameReplacement)
                    .replace(`__HMR_PORT__`, hmrPortReplacement)
                    .replace(`__HMR_DIRECT_TARGET__`, hmrDirectTargetReplacement)
                    .replace(`__HMR_BASE__`, hmrBaseReplacement)
                    .replace(`__HMR_TIMEOUT__`, hmrTimeoutReplacement)
                    .replace(`__HMR_ENABLE_OVERLAY__`, hmrEnableOverlayReplacement);
            };
        },
        transform(code, id, options) {
            if (id === normalizedClientEntry || id === normalizedEnvEntry) {
                return injectConfigValues(code);
            }
            else if (!options?.ssr && code.includes('process.env.NODE_ENV')) {
                // replace process.env.NODE_ENV instead of defining a global
                // for it to avoid shimming a `process` object during dev,
                // avoiding inconsistencies between dev and build
                return code.replace(process_env_NODE_ENV_RE, config.define?.['process.env.NODE_ENV'] ||
                    JSON.stringify(process.env.NODE_ENV || config.mode));
            }
        },
    };
}
function escapeReplacement(value) {
    const jsonValue = JSON.stringify(value);
    return () => jsonValue;
}
function serializeDefine(define) {
    let res = `{`;
    for (const key in define) {
        const val = define[key];
        res += `${JSON.stringify(key)}: ${typeof val === 'string' ? `(${val})` : JSON.stringify(val)}, `;
    }
    return res + `}`;
}

const wasmHelperId = '\0vite/wasm-helper';
const wasmHelper = async (opts = {}, url) => {
    let result;
    if (url.startsWith('data:')) {
        const urlContent = url.replace(/^data:.*?base64,/, '');
        let bytes;
        if (typeof Buffer === 'function' && typeof Buffer.from === 'function') {
            bytes = Buffer.from(urlContent, 'base64');
        }
        else if (typeof atob === 'function') {
            const binaryString = atob(urlContent);
            bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
        }
        else {
            throw new Error('Failed to decode base64-encoded data URL, Buffer and atob are not supported');
        }
        result = await WebAssembly.instantiate(bytes, opts);
    }
    else {
        // https://github.com/mdn/webassembly-examples/issues/5
        // WebAssembly.instantiateStreaming requires the server to provide the
        // correct MIME type for .wasm files, which unfortunately doesn't work for
        // a lot of static file servers, so we just work around it by getting the
        // raw buffer.
        const response = await fetch(url);
        const contentType = response.headers.get('Content-Type') || '';
        if ('instantiateStreaming' in WebAssembly &&
            contentType.startsWith('application/wasm')) {
            result = await WebAssembly.instantiateStreaming(response, opts);
        }
        else {
            const buffer = await response.arrayBuffer();
            result = await WebAssembly.instantiate(buffer, opts);
        }
    }
    return result.instance;
};
const wasmHelperCode = wasmHelper.toString();
const wasmHelperPlugin = (config) => {
    return {
        name: 'vite:wasm-helper',
        resolveId(id) {
            if (id === wasmHelperId) {
                return id;
            }
        },
        async load(id) {
            if (id === wasmHelperId) {
                return `export default ${wasmHelperCode}`;
            }
            if (!id.endsWith('.wasm?init')) {
                return;
            }
            const url = await fileToUrl(id, config, this);
            return `
import initWasm from "${wasmHelperId}"
export default opts => initWasm(opts, ${JSON.stringify(url)})
`;
        },
    };
};
const wasmFallbackPlugin = () => {
    return {
        name: 'vite:wasm-fallback',
        async load(id) {
            if (!id.endsWith('.wasm')) {
                return;
            }
            throw new Error('"ESM integration proposal for Wasm" is not supported currently. ' +
                'Use vite-plugin-wasm or other community plugins to handle this. ' +
                'Alternatively, you can use `.wasm?init` or `.wasm?url`. ' +
                'See https://vitejs.dev/guide/features.html#webassembly for more details.');
        },
    };
};

const WORKER_FILE_ID = 'worker_file';
const workerCache = new WeakMap();
function saveEmitWorkerAsset(config, asset) {
    const fileName = asset.fileName;
    const workerMap = workerCache.get(config.mainConfig || config);
    workerMap.assets.set(fileName, asset);
}
// Ensure that only one rollup build is called at the same time to avoid
// leaking state in plugins between worker builds.
// TODO: Review if we can parallelize the bundling of workers.
const workerConfigSemaphore = new WeakMap();
async function bundleWorkerEntry(config, id, query) {
    const processing = workerConfigSemaphore.get(config);
    if (processing) {
        await processing;
        return bundleWorkerEntry(config, id, query);
    }
    const promise = serialBundleWorkerEntry(config, id, query);
    workerConfigSemaphore.set(config, promise);
    promise.then(() => workerConfigSemaphore.delete(config));
    return promise;
}
async function serialBundleWorkerEntry(config, id, query) {
    // bundle the file as entry to support imports
    const { rollup } = await import('rollup');
    const { plugins, rollupOptions, format } = config.worker;
    const bundle = await rollup({
        ...rollupOptions,
        input: cleanUrl(id),
        plugins,
        onwarn(warning, warn) {
            onRollupWarning(warning, warn, config);
        },
        preserveEntrySignatures: false,
    });
    let chunk;
    try {
        const workerOutputConfig = config.worker.rollupOptions.output;
        const workerConfig = workerOutputConfig
            ? Array.isArray(workerOutputConfig)
                ? workerOutputConfig[0] || {}
                : workerOutputConfig
            : {};
        const { output: [outputChunk, ...outputChunks], } = await bundle.generate({
            entryFileNames: path.posix.join(config.build.assetsDir, '[name]-[hash].js'),
            chunkFileNames: path.posix.join(config.build.assetsDir, '[name]-[hash].js'),
            assetFileNames: path.posix.join(config.build.assetsDir, '[name]-[hash].[ext]'),
            ...workerConfig,
            format,
            sourcemap: config.build.sourcemap,
        });
        chunk = outputChunk;
        outputChunks.forEach((outputChunk) => {
            if (outputChunk.type === 'asset') {
                saveEmitWorkerAsset(config, outputChunk);
            }
            else if (outputChunk.type === 'chunk') {
                saveEmitWorkerAsset(config, {
                    fileName: outputChunk.fileName,
                    source: outputChunk.code,
                    type: 'asset',
                });
            }
        });
    }
    finally {
        await bundle.close();
    }
    return emitSourcemapForWorkerEntry(config, query, chunk);
}
function emitSourcemapForWorkerEntry(config, query, chunk) {
    const { map: sourcemap } = chunk;
    if (sourcemap) {
        if (config.build.sourcemap === 'hidden' ||
            config.build.sourcemap === true) {
            const data = sourcemap.toString();
            const mapFileName = chunk.fileName + '.map';
            saveEmitWorkerAsset(config, {
                fileName: mapFileName,
                type: 'asset',
                source: data,
            });
        }
    }
    return chunk;
}
const workerAssetUrlRE = /__VITE_WORKER_ASSET__([a-z\d]{8})__/g;
function encodeWorkerAssetFileName(fileName, workerCache) {
    const { fileNameHash } = workerCache;
    const hash = getHash(fileName);
    if (!fileNameHash.get(hash)) {
        fileNameHash.set(hash, fileName);
    }
    return `__VITE_WORKER_ASSET__${hash}__`;
}
async function workerFileToUrl(config, id, query) {
    const workerMap = workerCache.get(config.mainConfig || config);
    let fileName = workerMap.bundle.get(id);
    if (!fileName) {
        const outputChunk = await bundleWorkerEntry(config, id, query);
        fileName = outputChunk.fileName;
        saveEmitWorkerAsset(config, {
            fileName,
            source: outputChunk.code,
            type: 'asset',
        });
        workerMap.bundle.set(id, fileName);
    }
    return encodeWorkerAssetFileName(fileName, workerMap);
}
function webWorkerPostPlugin() {
    return {
        name: 'vite:worker-post',
        resolveImportMeta(property, { chunkId, format }) {
            // document is undefined in the worker, so we need to avoid it in iife
            if (property === 'url' && format === 'iife') {
                return 'self.location.href';
            }
            return null;
        },
    };
}
function webWorkerPlugin(config) {
    const isBuild = config.command === 'build';
    let server;
    const isWorker = config.isWorker;
    const isWorkerQueryId = (id) => {
        const parsedQuery = parseRequest(id);
        if (parsedQuery &&
            (parsedQuery.worker ?? parsedQuery.sharedworker) != null) {
            return true;
        }
        return false;
    };
    return {
        name: 'vite:worker',
        configureServer(_server) {
            server = _server;
        },
        buildStart() {
            if (isWorker) {
                return;
            }
            workerCache.set(config, {
                assets: new Map(),
                bundle: new Map(),
                fileNameHash: new Map(),
            });
        },
        load(id) {
            if (isBuild && isWorkerQueryId(id)) {
                return '';
            }
        },
        shouldTransformCachedModule({ id }) {
            if (isBuild && isWorkerQueryId(id) && config.build.watch) {
                return true;
            }
        },
        async transform(raw, id, options) {
            const ssr = options?.ssr === true;
            const query = parseRequest(id);
            if (query && query[WORKER_FILE_ID] != null) {
                // if import worker by worker constructor will have query.type
                // other type will be import worker by esm
                const workerType = query['type'];
                let injectEnv = '';
                if (workerType === 'classic') {
                    injectEnv = `importScripts('${ENV_PUBLIC_PATH}')\n`;
                }
                else if (workerType === 'module') {
                    injectEnv = `import '${ENV_PUBLIC_PATH}'\n`;
                }
                else if (workerType === 'ignore') {
                    if (isBuild) {
                        injectEnv = '';
                    }
                    else if (server) {
                        // dynamic worker type we can't know how import the env
                        // so we copy /@vite/env code of server transform result into file header
                        const { moduleGraph } = server;
                        const module = moduleGraph.getModuleById(ENV_ENTRY);
                        injectEnv = module?.transformResult?.code || '';
                    }
                }
                return {
                    code: injectEnv + raw,
                };
            }
            if (query == null ||
                (query && (query.worker ?? query.sharedworker) == null)) {
                return;
            }
            // stringified url or `new URL(...)`
            let url;
            const { format } = config.worker;
            const workerConstructor = query.sharedworker != null ? 'SharedWorker' : 'Worker';
            const workerType = isBuild
                ? format === 'es'
                    ? 'module'
                    : 'classic'
                : 'module';
            const workerOptions = workerType === 'classic' ? '' : ',{type: "module"}';
            if (isBuild) {
                getDepsOptimizer(config, ssr)?.registerWorkersSource(id);
                if (query.inline != null) {
                    const chunk = await bundleWorkerEntry(config, id, query);
                    const encodedJs = `const encodedJs = "${Buffer.from(chunk.code).toString('base64')}";`;
                    const code = 
                    // Using blob URL for SharedWorker results in multiple instances of a same worker
                    workerConstructor === 'Worker'
                        ? `${encodedJs}
          const blob = typeof window !== "undefined" && window.Blob && new Blob([atob(encodedJs)], { type: "text/javascript;charset=utf-8" });
          export default function WorkerWrapper() {
            let objURL;
            try {
              objURL = blob && (window.URL || window.webkitURL).createObjectURL(blob);
              if (!objURL) throw ''
              return new ${workerConstructor}(objURL)
            } catch(e) {
              return new ${workerConstructor}("data:application/javascript;base64," + encodedJs${workerOptions});
            } finally {
              objURL && (window.URL || window.webkitURL).revokeObjectURL(objURL);
            }
          }`
                        : `${encodedJs}
          export default function WorkerWrapper() {
            return new ${workerConstructor}("data:application/javascript;base64," + encodedJs${workerOptions});
          }
          `;
                    return {
                        code,
                        // Empty sourcemap to suppress Rollup warning
                        map: { mappings: '' },
                    };
                }
                else {
                    url = await workerFileToUrl(config, id, query);
                }
            }
            else {
                url = await fileToUrl(cleanUrl(id), config, this);
                url = injectQuery(url, WORKER_FILE_ID);
                url = injectQuery(url, `type=${workerType}`);
            }
            if (query.url != null) {
                return {
                    code: `export default ${JSON.stringify(url)}`,
                    map: { mappings: '' }, // Empty sourcemap to suppress Rollup warning
                };
            }
            return {
                code: `export default function WorkerWrapper() {
          return new ${workerConstructor}(${JSON.stringify(url)}${workerOptions})
        }`,
                map: { mappings: '' }, // Empty sourcemap to suppress Rollup warning
            };
        },
        renderChunk(code, chunk, outputOptions) {
            let s;
            const result = () => {
                return (s && {
                    code: s.toString(),
                    map: config.build.sourcemap ? s.generateMap({ hires: true }) : null,
                });
            };
            if (code.match(workerAssetUrlRE)) {
                const toRelativeRuntime = createToImportMetaURLBasedRelativeRuntime(outputOptions.format, config.isWorker);
                let match;
                s = new MagicString(code);
                workerAssetUrlRE.lastIndex = 0;
                // Replace "__VITE_WORKER_ASSET__5aa0ddc0__" using relative paths
                const workerMap = workerCache.get(config.mainConfig || config);
                const { fileNameHash } = workerMap;
                while ((match = workerAssetUrlRE.exec(code))) {
                    const [full, hash] = match;
                    const filename = fileNameHash.get(hash);
                    const replacement = toOutputFilePathInJS(filename, 'asset', chunk.fileName, 'js', config, toRelativeRuntime);
                    const replacementString = typeof replacement === 'string'
                        ? JSON.stringify(replacement).slice(1, -1)
                        : `"+${replacement.runtime}+"`;
                    s.update(match.index, match.index + full.length, replacementString);
                }
            }
            return result();
        },
        generateBundle(opts) {
            // @ts-expect-error asset emits are skipped in legacy bundle
            if (opts.__vite_skip_asset_emit__ || isWorker) {
                return;
            }
            const workerMap = workerCache.get(config);
            workerMap.assets.forEach((asset) => {
                this.emitFile(asset);
                workerMap.assets.delete(asset.fileName);
            });
        },
    };
}

/**
 * A plugin to avoid an aliased AND optimized dep from being aliased in src
 */
function preAliasPlugin(config) {
    const findPatterns = getAliasPatterns(config.resolve.alias);
    const isConfiguredAsExternal = createIsConfiguredAsSsrExternal(config);
    const isBuild = config.command === 'build';
    return {
        name: 'vite:pre-alias',
        async resolveId(id, importer, options) {
            const ssr = options?.ssr === true;
            const depsOptimizer = getDepsOptimizer(config, ssr);
            if (importer &&
                depsOptimizer &&
                bareImportRE.test(id) &&
                !options?.scan &&
                id !== '@vite/client' &&
                id !== '@vite/env') {
                if (findPatterns.find((pattern) => matches(pattern, id))) {
                    const optimizedId = await tryOptimizedResolve(depsOptimizer, id, importer, config.resolve.preserveSymlinks, config.packageCache);
                    if (optimizedId) {
                        return optimizedId; // aliased dep already optimized
                    }
                    if (depsOptimizer.options.noDiscovery) {
                        return;
                    }
                    const resolved = await this.resolve(id, importer, {
                        ...options,
                        custom: { ...options.custom, 'vite:pre-alias': true },
                        skipSelf: true,
                    });
                    if (resolved && !depsOptimizer.isOptimizedDepFile(resolved.id)) {
                        const optimizeDeps = depsOptimizer.options;
                        const resolvedId = cleanUrl(resolved.id);
                        const isVirtual = resolvedId === id || resolvedId.includes('\0');
                        if (!isVirtual &&
                            fs.existsSync(resolvedId) &&
                            !moduleListContains(optimizeDeps.exclude, id) &&
                            path.isAbsolute(resolvedId) &&
                            (isInNodeModules(resolvedId) ||
                                optimizeDeps.include?.includes(id)) &&
                            isOptimizable(resolvedId, optimizeDeps) &&
                            !(isBuild && ssr && isConfiguredAsExternal(id, importer)) &&
                            (!ssr || optimizeAliasReplacementForSSR(resolvedId, optimizeDeps))) {
                            // aliased dep has not yet been optimized
                            const optimizedInfo = depsOptimizer.registerMissingImport(id, resolvedId);
                            return { id: depsOptimizer.getOptimizedDepId(optimizedInfo) };
                        }
                    }
                    return resolved;
                }
            }
        },
    };
}
function optimizeAliasReplacementForSSR(id, optimizeDeps) {
    if (optimizeDeps.include?.includes(id)) {
        return true;
    }
    // In the regular resolution, the default for non-external modules is to
    // be optimized if they are CJS. Here, we don't have the package id but
    // only the replacement file path. We could find the package.json from
    // the id and respect the same default in the future.
    // Default to not optimize an aliased replacement for now, forcing the
    // user to explicitly add it to the ssr.optimizeDeps.include list.
    return false;
}
// In sync with rollup plugin alias logic
function matches(pattern, importee) {
    if (pattern instanceof RegExp) {
        return pattern.test(importee);
    }
    if (importee.length < pattern.length) {
        return false;
    }
    if (importee === pattern) {
        return true;
    }
    return importee.startsWith(pattern + '/');
}
function getAliasPatterns(entries) {
    if (!entries) {
        return [];
    }
    if (Array.isArray(entries)) {
        return entries.map((entry) => entry.find);
    }
    return Object.entries(entries).map(([find]) => find);
}

const nonJsRe = /\.json(?:$|\?)/;
const metaEnvRe = /import\.meta\.env\.(.+)/;
const isNonJsRequest = (request) => nonJsRe.test(request);
function definePlugin(config) {
    const isBuild = config.command === 'build';
    const isBuildLib = isBuild && config.build.lib;
    // ignore replace process.env in lib build
    const processEnv = {};
    const processNodeEnv = {};
    if (!isBuildLib) {
        const nodeEnv = process.env.NODE_ENV || config.mode;
        Object.assign(processEnv, {
            'process.env.': `({}).`,
            'global.process.env.': `({}).`,
            'globalThis.process.env.': `({}).`,
        });
        Object.assign(processNodeEnv, {
            'process.env.NODE_ENV': JSON.stringify(nodeEnv),
            'global.process.env.NODE_ENV': JSON.stringify(nodeEnv),
            'globalThis.process.env.NODE_ENV': JSON.stringify(nodeEnv),
            __vite_process_env_NODE_ENV: JSON.stringify(nodeEnv),
        });
    }
    const userDefine = {};
    const userDefineEnv = {};
    for (const key in config.define) {
        const val = config.define[key];
        userDefine[key] = typeof val === 'string' ? val : JSON.stringify(val);
        // make sure `import.meta.env` object has user define properties
        if (isBuild) {
            const match = key.match(metaEnvRe);
            if (match) {
                userDefineEnv[match[1]] = `__vite__define__${userDefine[key]}`;
            }
        }
    }
    // during dev, import.meta properties are handled by importAnalysis plugin.
    const importMetaKeys = {};
    const importMetaFallbackKeys = {};
    if (isBuild) {
        // set here to allow override with config.define
        importMetaKeys['import.meta.hot'] = `undefined`;
        for (const key in config.env) {
            importMetaKeys[`import.meta.env.${key}`] = JSON.stringify(config.env[key]);
        }
        Object.assign(importMetaFallbackKeys, {
            'import.meta.env.': `({}).`,
            'import.meta.env': JSON.stringify({
                ...config.env,
                SSR: '__vite__ssr__',
                ...userDefineEnv,
            }).replace(/"__vite__define__(.+?)"([,}])/g, (_, val, suffix) => `${val.replace(/(^\\")|(\\"$)/g, '"')}${suffix}`),
        });
    }
    function getImportMetaKeys(ssr) {
        if (!isBuild)
            return {};
        return {
            ...importMetaKeys,
            'import.meta.env.SSR': ssr + '',
        };
    }
    function getImportMetaFallbackKeys(ssr) {
        if (!isBuild)
            return {};
        return {
            ...importMetaFallbackKeys,
            'import.meta.env': importMetaFallbackKeys['import.meta.env'].replace('"__vite__ssr__"', ssr + ''),
        };
    }
    function generatePattern(ssr) {
        const replaceProcessEnv = !ssr || config.ssr?.target === 'webworker';
        const replacements = {
            ...(replaceProcessEnv ? processNodeEnv : {}),
            ...getImportMetaKeys(ssr),
            ...userDefine,
            ...getImportMetaFallbackKeys(ssr),
            ...(replaceProcessEnv ? processEnv : {}),
        };
        if (isBuild && !replaceProcessEnv) {
            replacements['__vite_process_env_NODE_ENV'] = 'process.env.NODE_ENV';
        }
        const replacementsKeys = Object.keys(replacements);
        const pattern = replacementsKeys.length
            ? new RegExp(
            // Mustn't be preceded by a char that can be part of an identifier
            // or a '.' that isn't part of a spread operator
            '(?<![\\p{L}\\p{N}_$]|(?<!\\.\\.)\\.)(' +
                replacementsKeys.map(escapeRegex).join('|') +
                // Mustn't be followed by a char that can be part of an identifier
                // or an assignment (but allow equality operators)
                ')(?:(?<=\\.)|(?![\\p{L}\\p{N}_$]|\\s*?=[^=]))', 'gu')
            : null;
        return [replacements, pattern];
    }
    const defaultPattern = generatePattern(false);
    const ssrPattern = generatePattern(true);
    return {
        name: 'vite:define',
        transform(code, id, options) {
            const ssr = options?.ssr === true;
            if (!ssr && !isBuild) {
                // for dev we inject actual global defines in the vite client to
                // avoid the transform cost.
                return;
            }
            if (
            // exclude html, css and static assets for performance
            isHTMLRequest(id) ||
                isCSSRequest(id) ||
                isNonJsRequest(id) ||
                config.assetsInclude(id)) {
                return;
            }
            const [replacements, pattern] = ssr ? ssrPattern : defaultPattern;
            if (!pattern) {
                return null;
            }
            if (ssr && !isBuild) {
                // ssr + dev, simple replace
                return code.replace(pattern, (_, match) => {
                    return '' + replacements[match];
                });
            }
            const s = new MagicString(code);
            let hasReplaced = false;
            let match;
            while ((match = pattern.exec(code))) {
                hasReplaced = true;
                const start = match.index;
                const end = start + match[0].length;
                const replacement = '' + replacements[match[1]];
                s.update(start, end, replacement);
            }
            if (!hasReplaced) {
                return null;
            }
            return transformStableResult(s, id, config);
        },
    };
}

const ignoreFlagRE = /\/\*\s*@vite-ignore\s*\*\//;
function err(e, pos) {
    const error = new Error(e);
    error.pos = pos;
    return error;
}
function parseWorkerOptions(rawOpts, optsStartIndex) {
    let opts = {};
    try {
        opts = evalValue(rawOpts);
    }
    catch {
        throw err('Vite is unable to parse the worker options as the value is not static.' +
            'To ignore this error, please use /* @vite-ignore */ in the worker options.', optsStartIndex);
    }
    if (opts == null) {
        return {};
    }
    if (typeof opts !== 'object') {
        throw err(`Expected worker options to be an object, got ${typeof opts}`, optsStartIndex);
    }
    return opts;
}
function getWorkerType(raw, clean, i) {
    const commaIndex = clean.indexOf(',', i);
    if (commaIndex === -1) {
        return 'classic';
    }
    const endIndex = clean.indexOf(')', i);
    // case: ') ... ,' mean no worker options params
    if (commaIndex > endIndex) {
        return 'classic';
    }
    // need to find in comment code
    const workerOptString = raw
        .substring(commaIndex + 1, endIndex)
        .replace(/\}[\s\S]*,/g, '}'); // strip trailing comma for parsing
    const hasViteIgnore = ignoreFlagRE.test(workerOptString);
    if (hasViteIgnore) {
        return 'ignore';
    }
    // need to find in no comment code
    const cleanWorkerOptString = clean.substring(commaIndex + 1, endIndex).trim();
    if (!cleanWorkerOptString.length) {
        return 'classic';
    }
    const workerOpts = parseWorkerOptions(workerOptString, commaIndex + 1);
    if (workerOpts.type && ['classic', 'module'].includes(workerOpts.type)) {
        return workerOpts.type;
    }
    return 'classic';
}
function workerImportMetaUrlPlugin(config) {
    const isBuild = config.command === 'build';
    let workerResolver;
    const fsResolveOptions = {
        ...config.resolve,
        root: config.root,
        isProduction: config.isProduction,
        isBuild: config.command === 'build',
        packageCache: config.packageCache,
        ssrConfig: config.ssr,
        asSrc: true,
    };
    return {
        name: 'vite:worker-import-meta-url',
        async transform(code, id, options) {
            const ssr = options?.ssr === true;
            if (!options?.ssr &&
                (code.includes('new Worker') || code.includes('new SharedWorker')) &&
                code.includes('new URL') &&
                code.includes(`import.meta.url`)) {
                const query = parseRequest(id);
                let s;
                const cleanString = stripLiteral(code);
                const workerImportMetaUrlRE = /\bnew\s+(?:Worker|SharedWorker)\s*\(\s*(new\s+URL\s*\(\s*('[^']+'|"[^"]+"|`[^`]+`)\s*,\s*import\.meta\.url\s*\))/g;
                let match;
                while ((match = workerImportMetaUrlRE.exec(cleanString))) {
                    const { 0: allExp, 1: exp, 2: emptyUrl, index } = match;
                    const urlIndex = allExp.indexOf(exp) + index;
                    const urlStart = cleanString.indexOf(emptyUrl, index);
                    const urlEnd = urlStart + emptyUrl.length;
                    const rawUrl = code.slice(urlStart, urlEnd);
                    // potential dynamic template string
                    if (rawUrl[0] === '`' && rawUrl.includes('${')) {
                        this.error(`\`new URL(url, import.meta.url)\` is not supported in dynamic template string.`, urlIndex);
                    }
                    s || (s = new MagicString(code));
                    const workerType = getWorkerType(code, cleanString, index + allExp.length);
                    const url = rawUrl.slice(1, -1);
                    let file;
                    if (url[0] === '.') {
                        file = path.resolve(path.dirname(id), url);
                        file = tryFsResolve(file, fsResolveOptions) ?? file;
                    }
                    else {
                        workerResolver ?? (workerResolver = config.createResolver({
                            extensions: [],
                            tryIndex: false,
                            preferRelative: true,
                        }));
                        file = await workerResolver(url, id);
                        file ?? (file = url[0] === '/'
                            ? slash(path.join(config.publicDir, url))
                            : slash(path.resolve(path.dirname(id), url)));
                    }
                    let builtUrl;
                    if (isBuild) {
                        getDepsOptimizer(config, ssr)?.registerWorkersSource(id);
                        builtUrl = await workerFileToUrl(config, file, query);
                    }
                    else {
                        builtUrl = await fileToUrl(cleanUrl(file), config, this);
                        builtUrl = injectQuery(builtUrl, WORKER_FILE_ID);
                        builtUrl = injectQuery(builtUrl, `type=${workerType}`);
                    }
                    s.update(urlIndex, urlIndex + exp.length, `new URL(${JSON.stringify(builtUrl)}, self.location)`);
                }
                if (s) {
                    return transformStableResult(s, id, config);
                }
                return null;
            }
        },
    };
}

/**
 * Convert `new URL('./foo.png', import.meta.url)` to its resolved built URL
 *
 * Supports template string with dynamic segments:
 * ```
 * new URL(`./dir/${name}.png`, import.meta.url)
 * // transformed to
 * import.meta.glob('./dir/**.png', { eager: true, import: 'default' })[`./dir/${name}.png`]
 * ```
 */
function assetImportMetaUrlPlugin(config) {
    const normalizedPublicDir = normalizePath(config.publicDir);
    let assetResolver;
    const fsResolveOptions = {
        ...config.resolve,
        root: config.root,
        isProduction: config.isProduction,
        isBuild: config.command === 'build',
        packageCache: config.packageCache,
        ssrConfig: config.ssr,
        asSrc: true,
    };
    return {
        name: 'vite:asset-import-meta-url',
        async transform(code, id, options) {
            if (!options?.ssr &&
                id !== preloadHelperId &&
                id !== CLIENT_ENTRY &&
                code.includes('new URL') &&
                code.includes(`import.meta.url`)) {
                let s;
                const assetImportMetaUrlRE = /\bnew\s+URL\s*\(\s*('[^']+'|"[^"]+"|`[^`]+`)\s*,\s*import\.meta\.url\s*(?:,\s*)?\)/g;
                const cleanString = stripLiteral(code);
                let match;
                while ((match = assetImportMetaUrlRE.exec(cleanString))) {
                    const { 0: exp, 1: emptyUrl, index } = match;
                    const urlStart = cleanString.indexOf(emptyUrl, index);
                    const urlEnd = urlStart + emptyUrl.length;
                    const rawUrl = code.slice(urlStart, urlEnd);
                    if (!s)
                        s = new MagicString(code);
                    // potential dynamic template string
                    if (rawUrl[0] === '`' && rawUrl.includes('${')) {
                        const queryDelimiterIndex = getQueryDelimiterIndex(rawUrl);
                        const hasQueryDelimiter = queryDelimiterIndex !== -1;
                        const pureUrl = hasQueryDelimiter
                            ? rawUrl.slice(0, queryDelimiterIndex) + '`'
                            : rawUrl;
                        const queryString = hasQueryDelimiter
                            ? rawUrl.slice(queryDelimiterIndex, -1)
                            : '';
                        const ast = this.parse(pureUrl);
                        const templateLiteral = ast.body[0].expression;
                        if (templateLiteral.expressions.length) {
                            const pattern = buildGlobPattern(templateLiteral);
                            if (pattern.startsWith('**')) {
                                // don't transform for patterns like this
                                // because users won't intend to do that in most cases
                                continue;
                            }
                            const globOptions = {
                                eager: true,
                                import: 'default',
                                // A hack to allow 'as' & 'query' exist at the same time
                                query: injectQuery(queryString, 'url'),
                            };
                            // Note: native import.meta.url is not supported in the baseline
                            // target so we use the global location here. It can be
                            // window.location or self.location in case it is used in a Web Worker.
                            // @see https://developer.mozilla.org/en-US/docs/Web/API/Window/self
                            s.update(index, index + exp.length, `new URL((import.meta.glob(${JSON.stringify(pattern)}, ${JSON.stringify(globOptions)}))[${pureUrl}], self.location)`);
                            continue;
                        }
                    }
                    const url = rawUrl.slice(1, -1);
                    let file;
                    if (url[0] === '.') {
                        file = slash(path.resolve(path.dirname(id), url));
                        file = tryFsResolve(file, fsResolveOptions) ?? file;
                    }
                    else {
                        assetResolver ?? (assetResolver = config.createResolver({
                            extensions: [],
                            mainFields: [],
                            tryIndex: false,
                            preferRelative: true,
                        }));
                        file = await assetResolver(url, id);
                        file ?? (file = url.startsWith('/')
                            ? slash(path.join(config.publicDir, url))
                            : slash(path.resolve(path.dirname(id), url)));
                    }
                    // Get final asset URL. If the file does not exist,
                    // we fall back to the initial URL and let it resolve in runtime
                    let builtUrl;
                    if (file) {
                        try {
                            if (isParentDirectory(normalizedPublicDir, file)) {
                                const publicPath = '/' + path.posix.relative(normalizedPublicDir, file);
                                builtUrl = await fileToUrl(publicPath, config, this);
                            }
                            else {
                                builtUrl = await fileToUrl(file, config, this);
                            }
                        }
                        catch {
                            // do nothing, we'll log a warning after this
                        }
                    }
                    if (!builtUrl) {
                        const rawExp = code.slice(index, index + exp.length);
                        config.logger.warnOnce(`\n${rawExp} doesn't exist at build time, it will remain unchanged to be resolved at runtime`);
                        builtUrl = url;
                    }
                    s.update(index, index + exp.length, `new URL(${JSON.stringify(builtUrl)}, self.location)`);
                }
                if (s) {
                    return transformStableResult(s, id, config);
                }
            }
            return null;
        },
    };
}
function buildGlobPattern(ast) {
    let pattern = '';
    let lastElementIndex = -1;
    for (const exp of ast.expressions) {
        for (let i = lastElementIndex + 1; i < ast.quasis.length; i++) {
            const el = ast.quasis[i];
            if (el.end < exp.start) {
                pattern += el.value.raw;
                lastElementIndex = i;
            }
        }
        pattern += '**';
    }
    for (let i = lastElementIndex + 1; i < ast.quasis.length; i++) {
        pattern += ast.quasis[i].value.raw;
    }
    return pattern;
}
function getQueryDelimiterIndex(rawUrl) {
    let bracketsStack = 0;
    for (let i = 0; i < rawUrl.length; i++) {
        if (rawUrl[i] === '{') {
            bracketsStack++;
        }
        else if (rawUrl[i] === '}') {
            bracketsStack--;
        }
        else if (rawUrl[i] === '?' && bracketsStack === 0) {
            return i;
        }
    }
    return -1;
}

/**
 * plugin to ensure rollup can watch correctly.
 */
function ensureWatchPlugin() {
    return {
        name: 'vite:ensure-watch',
        load(id) {
            if (queryRE.test(id)) {
                this.addWatchFile(cleanUrl(id));
            }
            return null;
        },
    };
}

/**
 * Prepares the rendered chunks to contain additional metadata during build.
 */
function metadataPlugin() {
    return {
        name: 'vite:build-metadata',
        async renderChunk(_code, chunk) {
            chunk.viteMetadata = {
                importedAssets: new Set(),
                importedCss: new Set(),
            };
            return null;
        },
    };
}

const dynamicImportHelperId = '\0vite/dynamic-import-helper';
const relativePathRE = /^\.{1,2}\//;
// fast path to check if source contains a dynamic import. we check for a
// trailing slash too as a dynamic import statement can have comments between
// the `import` and the `(`.
const hasDynamicImportRE = /\bimport\s*[(/]/;
const dynamicImportHelper = (glob, path) => {
    const v = glob[path];
    if (v) {
        return typeof v === 'function' ? v() : Promise.resolve(v);
    }
    return new Promise((_, reject) => {
        (typeof queueMicrotask === 'function' ? queueMicrotask : setTimeout)(reject.bind(null, new Error('Unknown variable dynamic import: ' + path)));
    });
};
function parseDynamicImportPattern(strings) {
    const filename = strings.slice(1, -1);
    const rawQuery = parseRequest(filename);
    let globParams = null;
    const ast = parse$4(strings, {
        ecmaVersion: 'latest',
        sourceType: 'module',
    }).body[0].expression;
    const userPatternQuery = dynamicImportToGlob(ast, filename);
    if (!userPatternQuery) {
        return null;
    }
    const [userPattern] = userPatternQuery.split(requestQuerySplitRE, 2);
    const [rawPattern] = filename.split(requestQuerySplitRE, 2);
    if (rawQuery?.raw !== undefined) {
        globParams = { as: 'raw' };
    }
    if (rawQuery?.url !== undefined) {
        globParams = { as: 'url' };
    }
    if (rawQuery?.worker !== undefined) {
        globParams = { as: 'worker' };
    }
    return {
        globParams,
        userPattern,
        rawPattern,
    };
}
async function transformDynamicImport(importSource, importer, resolve, root) {
    if (importSource[1] !== '.' && importSource[1] !== '/') {
        const resolvedFileName = await resolve(importSource.slice(1, -1), importer);
        if (!resolvedFileName) {
            return null;
        }
        const relativeFileName = posix.relative(posix.dirname(normalizePath(importer)), normalizePath(resolvedFileName));
        importSource = normalizePath('`' + (relativeFileName[0] === '.' ? '' : './') + relativeFileName + '`');
    }
    const dynamicImportPattern = parseDynamicImportPattern(importSource);
    if (!dynamicImportPattern) {
        return null;
    }
    const { globParams, rawPattern, userPattern } = dynamicImportPattern;
    const params = globParams
        ? `, ${JSON.stringify({ ...globParams, import: '*' })}`
        : '';
    let newRawPattern = posix.relative(posix.dirname(importer), await toAbsoluteGlob(rawPattern, root, importer, resolve));
    if (!relativePathRE.test(newRawPattern)) {
        newRawPattern = `./${newRawPattern}`;
    }
    const exp = `(import.meta.glob(${JSON.stringify(userPattern)}${params}))`;
    return {
        rawPattern: newRawPattern,
        pattern: userPattern,
        glob: exp,
    };
}
function dynamicImportVarsPlugin(config) {
    const resolve = config.createResolver({
        preferRelative: true,
        tryIndex: false,
        extensions: [],
    });
    const { include, exclude, warnOnError } = config.build.dynamicImportVarsOptions;
    const filter = createFilter(include, exclude);
    return {
        name: 'vite:dynamic-import-vars',
        resolveId(id) {
            if (id === dynamicImportHelperId) {
                return id;
            }
        },
        load(id) {
            if (id === dynamicImportHelperId) {
                return 'export default ' + dynamicImportHelper.toString();
            }
        },
        async transform(source, importer) {
            if (!filter(importer) ||
                importer === CLIENT_ENTRY ||
                !hasDynamicImportRE.test(source)) {
                return;
            }
            await init;
            let imports = [];
            try {
                imports = parse$3(source)[0];
            }
            catch (e) {
                // ignore as it might not be a JS file, the subsequent plugins will catch the error
                return null;
            }
            if (!imports.length) {
                return null;
            }
            let s;
            let needDynamicImportHelper = false;
            for (let index = 0; index < imports.length; index++) {
                const { s: start, e: end, ss: expStart, se: expEnd, d: dynamicIndex, } = imports[index];
                if (dynamicIndex === -1 || source[start] !== '`') {
                    continue;
                }
                s || (s = new MagicString(source));
                let result;
                try {
                    // When import string is using backticks, es-module-lexer `end` captures
                    // until the closing parenthesis, instead of the closing backtick.
                    // There may be inline comments between the backtick and the closing
                    // parenthesis, so we manually remove them for now.
                    // See https://github.com/guybedford/es-module-lexer/issues/118
                    const importSource = removeComments(source.slice(start, end)).trim();
                    result = await transformDynamicImport(importSource, importer, resolve, config.root);
                }
                catch (error) {
                    if (warnOnError) {
                        this.warn(error);
                    }
                    else {
                        this.error(error);
                    }
                }
                if (!result) {
                    continue;
                }
                const { rawPattern, glob } = result;
                needDynamicImportHelper = true;
                s.overwrite(expStart, expEnd, `__variableDynamicImportRuntimeHelper(${glob}, \`${rawPattern}\`)`);
            }
            if (s) {
                if (needDynamicImportHelper) {
                    s.prepend(`import __variableDynamicImportRuntimeHelper from "${dynamicImportHelperId}";`);
                }
                return transformStableResult(s, importer, config);
            }
        },
    };
}

async function resolvePlugins(config, prePlugins, normalPlugins, postPlugins) {
    const isBuild = config.command === 'build';
    const isWatch = isBuild && !!config.build.watch;
    const buildPlugins = isBuild
        ? await (await Promise.resolve().then(function () { return build$1; })).resolveBuildPlugins(config)
        : { pre: [], post: [] };
    const { modulePreload } = config.build;
    return [
        ...(isDepsOptimizerEnabled(config, false) ||
            isDepsOptimizerEnabled(config, true)
            ? [
                isBuild
                    ? optimizedDepsBuildPlugin(config)
                    : optimizedDepsPlugin(config),
            ]
            : []),
        isWatch ? ensureWatchPlugin() : null,
        isBuild ? metadataPlugin() : null,
        watchPackageDataPlugin(config.packageCache),
        preAliasPlugin(config),
        aliasPlugin({ entries: config.resolve.alias }),
        ...prePlugins,
        modulePreload === true ||
            (typeof modulePreload === 'object' && modulePreload.polyfill)
            ? modulePreloadPolyfillPlugin(config)
            : null,
        resolvePlugin({
            ...config.resolve,
            root: config.root,
            isProduction: config.isProduction,
            isBuild,
            packageCache: config.packageCache,
            ssrConfig: config.ssr,
            asSrc: true,
            getDepsOptimizer: (ssr) => getDepsOptimizer(config, ssr),
            shouldExternalize: isBuild && config.build.ssr && config.ssr?.format !== 'cjs'
                ? (id, importer) => shouldExternalizeForSSR(id, importer, config)
                : undefined,
        }),
        htmlInlineProxyPlugin(config),
        cssPlugin(config),
        config.esbuild !== false ? esbuildPlugin(config) : null,
        jsonPlugin({
            namedExports: true,
            ...config.json,
        }, isBuild),
        wasmHelperPlugin(config),
        webWorkerPlugin(config),
        assetPlugin(config),
        ...normalPlugins,
        wasmFallbackPlugin(),
        definePlugin(config),
        cssPostPlugin(config),
        isBuild && buildHtmlPlugin(config),
        workerImportMetaUrlPlugin(config),
        assetImportMetaUrlPlugin(config),
        ...buildPlugins.pre,
        dynamicImportVarsPlugin(config),
        importGlobPlugin(config),
        ...postPlugins,
        ...buildPlugins.post,
        // internal server-only plugins are always applied after everything else
        ...(isBuild
            ? []
            : [clientInjectionsPlugin(config), importAnalysisPlugin(config)]),
    ].filter(Boolean);
}
function createPluginHookUtils(plugins) {
    // sort plugins per hook
    const sortedPluginsCache = new Map();
    function getSortedPlugins(hookName) {
        if (sortedPluginsCache.has(hookName))
            return sortedPluginsCache.get(hookName);
        const sorted = getSortedPluginsByHook(hookName, plugins);
        sortedPluginsCache.set(hookName, sorted);
        return sorted;
    }
    function getSortedPluginHooks(hookName) {
        const plugins = getSortedPlugins(hookName);
        return plugins
            .map((p) => {
            const hook = p[hookName];
            return typeof hook === 'object' && 'handler' in hook
                ? hook.handler
                : hook;
        })
            .filter(Boolean);
    }
    return {
        getSortedPlugins,
        getSortedPluginHooks,
    };
}
function getSortedPluginsByHook(hookName, plugins) {
    const pre = [];
    const normal = [];
    const post = [];
    for (const plugin of plugins) {
        const hook = plugin[hookName];
        if (hook) {
            if (typeof hook === 'object') {
                if (hook.order === 'pre') {
                    pre.push(plugin);
                    continue;
                }
                if (hook.order === 'post') {
                    post.push(plugin);
                    continue;
                }
            }
            normal.push(plugin);
        }
    }
    return [...pre, ...normal, ...post];
}

function prepareError(err) {
    // only copy the information we need and avoid serializing unnecessary
    // properties, since some errors may attach full objects (e.g. PostCSS)
    return {
        message: strip(err.message),
        stack: strip(cleanStack(err.stack || '')),
        id: err.id,
        frame: strip(err.frame || ''),
        plugin: err.plugin,
        pluginCode: err.pluginCode,
        loc: err.loc,
    };
}
function buildErrorMessage(err, args = [], includeStack = true) {
    if (err.plugin)
        args.push(`  Plugin: ${colors.magenta(err.plugin)}`);
    const loc = err.loc ? `:${err.loc.line}:${err.loc.column}` : '';
    if (err.id)
        args.push(`  File: ${colors.cyan(err.id)}${loc}`);
    if (err.frame)
        args.push(colors.yellow(pad(err.frame)));
    if (includeStack && err.stack)
        args.push(pad(cleanStack(err.stack)));
    return args.join('\n');
}
function cleanStack(stack) {
    return stack
        .split(/\n/g)
        .filter((l) => /^\s*at/.test(l))
        .join('\n');
}
function logError(server, err) {
    const msg = buildErrorMessage(err, [
        colors.red(`Internal server error: ${err.message}`),
    ]);
    server.config.logger.error(msg, {
        clear: true,
        timestamp: true,
        error: err,
    });
    server.ws.send({
        type: 'error',
        err: prepareError(err),
    });
}
function errorMiddleware(server, allowNext = false) {
    // note the 4 args must be kept for connect to treat this as error middleware
    // Keep the named function. The name is visible in debug logs via `DEBUG=connect:dispatcher ...`
    return function viteErrorMiddleware(err, _req, res, next) {
        logError(server, err);
        if (allowNext) {
            next();
        }
        else {
            res.statusCode = 500;
            res.end(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <title>Error</title>
            <script type="module">
              import { ErrorOverlay } from '/@vite/client'
              document.body.appendChild(new ErrorOverlay(${JSON.stringify(prepareError(err)).replace(/</g, '\\u003c')}))
            </script>
          </head>
          <body>
          </body>
        </html>
      `);
        }
    };
}

/**
 * This file is refactored into TypeScript based on
 * https://github.com/preactjs/wmr/blob/main/packages/wmr/src/lib/rollup-plugin-container.js
 */
const ERR_CLOSED_SERVER = 'ERR_CLOSED_SERVER';
function throwClosedServerError() {
    const err = new Error('The server is being restarted or closed. Request is outdated');
    err.code = ERR_CLOSED_SERVER;
    // This error will be caught by the transform middleware that will
    // send a 504 status code request timeout
    throw err;
}
let parser = acorn.Parser;
async function createPluginContainer(config, moduleGraph, watcher) {
    const { plugins, logger, root, build: { rollupOptions }, } = config;
    const { getSortedPluginHooks, getSortedPlugins } = createPluginHookUtils(plugins);
    const seenResolves = {};
    const debugResolve = createDebugger('vite:resolve');
    const debugPluginResolve = createDebugger('vite:plugin-resolve', {
        onlyWhenFocused: 'vite:plugin',
    });
    const debugPluginTransform = createDebugger('vite:plugin-transform', {
        onlyWhenFocused: 'vite:plugin',
    });
    const debugSourcemapCombineFilter = process.env.DEBUG_VITE_SOURCEMAP_COMBINE_FILTER;
    const debugSourcemapCombine = createDebugger('vite:sourcemap-combine', {
        onlyWhenFocused: true,
    });
    // ---------------------------------------------------------------------------
    const watchFiles = new Set();
    const minimalContext = {
        meta: {
            rollupVersion: VERSION,
            watchMode: true,
        },
    };
    function warnIncompatibleMethod(method, plugin) {
        logger.warn(colors.cyan(`[plugin:${plugin}] `) +
            colors.yellow(`context method ${colors.bold(`${method}()`)} is not supported in serve mode. This plugin is likely not vite-compatible.`));
    }
    // parallel, ignores returns
    async function hookParallel(hookName, context, args) {
        const parallelPromises = [];
        for (const plugin of getSortedPlugins(hookName)) {
            // Don't throw here if closed, so buildEnd and closeBundle hooks can finish running
            const hook = plugin[hookName];
            if (!hook)
                continue;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore hook is not a primitive
            const handler = 'handler' in hook ? hook.handler : hook;
            if (hook.sequential) {
                await Promise.all(parallelPromises);
                parallelPromises.length = 0;
                await handler.apply(context(plugin), args(plugin));
            }
            else {
                parallelPromises.push(handler.apply(context(plugin), args(plugin)));
            }
        }
        await Promise.all(parallelPromises);
    }
    // throw when an unsupported ModuleInfo property is accessed,
    // so that incompatible plugins fail in a non-cryptic way.
    const ModuleInfoProxy = {
        get(info, key) {
            if (key in info) {
                return info[key];
            }
            // Don't throw an error when returning from an async function
            if (key === 'then') {
                return undefined;
            }
            throw Error(`[vite] The "${key}" property of ModuleInfo is not supported.`);
        },
    };
    // same default value of "moduleInfo.meta" as in Rollup
    const EMPTY_OBJECT = Object.freeze({});
    function getModuleInfo(id) {
        const module = moduleGraph?.getModuleById(id);
        if (!module) {
            return null;
        }
        if (!module.info) {
            module.info = new Proxy({ id, meta: module.meta || EMPTY_OBJECT }, ModuleInfoProxy);
        }
        return module.info;
    }
    function updateModuleInfo(id, { meta }) {
        if (meta) {
            const moduleInfo = getModuleInfo(id);
            if (moduleInfo) {
                moduleInfo.meta = { ...moduleInfo.meta, ...meta };
            }
        }
    }
    // we should create a new context for each async hook pipeline so that the
    // active plugin in that pipeline can be tracked in a concurrency-safe manner.
    // using a class to make creating new contexts more efficient
    class Context {
        constructor(initialPlugin) {
            this.meta = minimalContext.meta;
            this.ssr = false;
            this._scan = false;
            this._activeId = null;
            this._activeCode = null;
            this._addedImports = null;
            this._activePlugin = initialPlugin || null;
        }
        parse(code, opts = {}) {
            return parser.parse(code, {
                sourceType: 'module',
                ecmaVersion: 'latest',
                locations: true,
                ...opts,
            });
        }
        async resolve(id, importer, options) {
            let skip;
            if (options?.skipSelf && this._activePlugin) {
                skip = new Set(this._resolveSkips);
                skip.add(this._activePlugin);
            }
            let out = await container.resolveId(id, importer, {
                assertions: options?.assertions,
                custom: options?.custom,
                isEntry: !!options?.isEntry,
                skip,
                ssr: this.ssr,
                scan: this._scan,
            });
            if (typeof out === 'string')
                out = { id: out };
            return out;
        }
        async load(options) {
            // We may not have added this to our module graph yet, so ensure it exists
            await moduleGraph?.ensureEntryFromUrl(unwrapId(options.id), this.ssr);
            // Not all options passed to this function make sense in the context of loading individual files,
            // but we can at least update the module info properties we support
            updateModuleInfo(options.id, options);
            await container.load(options.id, { ssr: this.ssr });
            const moduleInfo = this.getModuleInfo(options.id);
            // This shouldn't happen due to calling ensureEntryFromUrl, but 1) our types can't ensure that
            // and 2) moduleGraph may not have been provided (though in the situations where that happens,
            // we should never have plugins calling this.load)
            if (!moduleInfo)
                throw Error(`Failed to load module with id ${options.id}`);
            return moduleInfo;
        }
        getModuleInfo(id) {
            return getModuleInfo(id);
        }
        getModuleIds() {
            return moduleGraph
                ? moduleGraph.idToModuleMap.keys()
                : Array.prototype[Symbol.iterator]();
        }
        addWatchFile(id) {
            watchFiles.add(id);
            (this._addedImports || (this._addedImports = new Set())).add(id);
            if (watcher)
                ensureWatchedFile(watcher, id, root);
        }
        getWatchFiles() {
            return [...watchFiles];
        }
        emitFile(assetOrFile) {
            warnIncompatibleMethod(`emitFile`, this._activePlugin.name);
            return '';
        }
        setAssetSource() {
            warnIncompatibleMethod(`setAssetSource`, this._activePlugin.name);
        }
        getFileName() {
            warnIncompatibleMethod(`getFileName`, this._activePlugin.name);
            return '';
        }
        warn(e, position) {
            const err = formatError(e, position, this);
            const msg = buildErrorMessage(err, [colors.yellow(`warning: ${err.message}`)], false);
            logger.warn(msg, {
                clear: true,
                timestamp: true,
            });
        }
        error(e, position) {
            // error thrown here is caught by the transform middleware and passed on
            // the the error middleware.
            throw formatError(e, position, this);
        }
    }
    function formatError(e, position, ctx) {
        const err = (typeof e === 'string' ? new Error(e) : e);
        if (err.pluginCode) {
            return err; // The plugin likely called `this.error`
        }
        if (err.file && err.name === 'CssSyntaxError') {
            err.id = normalizePath(err.file);
        }
        if (ctx._activePlugin)
            err.plugin = ctx._activePlugin.name;
        if (ctx._activeId && !err.id)
            err.id = ctx._activeId;
        if (ctx._activeCode) {
            err.pluginCode = ctx._activeCode;
            // some rollup plugins, e.g. json, sets err.position instead of err.pos
            const pos = position ?? err.pos ?? err.position;
            if (pos != null) {
                let errLocation;
                try {
                    errLocation = numberToPos(ctx._activeCode, pos);
                }
                catch (err2) {
                    logger.error(colors.red(`Error in error handler:\n${err2.stack || err2.message}\n`), 
                    // print extra newline to separate the two errors
                    { error: err2 });
                    throw err;
                }
                err.loc = err.loc || {
                    file: err.id,
                    ...errLocation,
                };
                err.frame = err.frame || generateCodeFrame(ctx._activeCode, pos);
            }
            else if (err.loc) {
                // css preprocessors may report errors in an included file
                if (!err.frame) {
                    let code = ctx._activeCode;
                    if (err.loc.file) {
                        err.id = normalizePath(err.loc.file);
                        try {
                            code = fs.readFileSync(err.loc.file, 'utf-8');
                        }
                        catch { }
                    }
                    err.frame = generateCodeFrame(code, err.loc);
                }
            }
            else if (err.line && err.column) {
                err.loc = {
                    file: err.id,
                    line: err.line,
                    column: err.column,
                };
                err.frame = err.frame || generateCodeFrame(err.id, err.loc);
            }
            if (ctx instanceof TransformContext &&
                typeof err.loc?.line === 'number' &&
                typeof err.loc?.column === 'number') {
                const rawSourceMap = ctx._getCombinedSourcemap();
                if (rawSourceMap) {
                    const traced = new TraceMap(rawSourceMap);
                    const { source, line, column } = originalPositionFor(traced, {
                        line: Number(err.loc.line),
                        column: Number(err.loc.column),
                    });
                    if (source && line != null && column != null) {
                        err.loc = { file: source, line, column };
                    }
                }
            }
        }
        else if (err.loc) {
            if (!err.frame) {
                let code = err.pluginCode;
                if (err.loc.file) {
                    err.id = normalizePath(err.loc.file);
                    if (!code) {
                        try {
                            code = fs.readFileSync(err.loc.file, 'utf-8');
                        }
                        catch { }
                    }
                }
                if (code) {
                    err.frame = generateCodeFrame(code, err.loc);
                }
            }
        }
        if (typeof err.loc?.column !== 'number' &&
            typeof err.loc?.line !== 'number' &&
            !err.loc?.file) {
            delete err.loc;
        }
        return err;
    }
    class TransformContext extends Context {
        constructor(filename, code, inMap) {
            super();
            this.originalSourcemap = null;
            this.sourcemapChain = [];
            this.combinedMap = null;
            this.filename = filename;
            this.originalCode = code;
            if (inMap) {
                if (debugSourcemapCombine) {
                    // @ts-expect-error inject name for debug purpose
                    inMap.name = '$inMap';
                }
                this.sourcemapChain.push(inMap);
            }
        }
        _getCombinedSourcemap(createIfNull = false) {
            if (debugSourcemapCombine &&
                debugSourcemapCombineFilter &&
                this.filename.includes(debugSourcemapCombineFilter)) {
                debugSourcemapCombine('----------', this.filename);
                debugSourcemapCombine(this.combinedMap);
                debugSourcemapCombine(this.sourcemapChain);
                debugSourcemapCombine('----------');
            }
            let combinedMap = this.combinedMap;
            for (let m of this.sourcemapChain) {
                if (typeof m === 'string')
                    m = JSON.parse(m);
                if (!('version' in m)) {
                    // empty, nullified source map
                    combinedMap = this.combinedMap = null;
                    this.sourcemapChain.length = 0;
                    break;
                }
                if (!combinedMap) {
                    combinedMap = m;
                }
                else {
                    combinedMap = combineSourcemaps(cleanUrl(this.filename), [
                        {
                            ...m,
                            sourcesContent: combinedMap.sourcesContent,
                        },
                        combinedMap,
                    ]);
                }
            }
            if (!combinedMap) {
                return createIfNull
                    ? new MagicString(this.originalCode).generateMap({
                        includeContent: true,
                        hires: true,
                        source: cleanUrl(this.filename),
                    })
                    : null;
            }
            if (combinedMap !== this.combinedMap) {
                this.combinedMap = combinedMap;
                this.sourcemapChain.length = 0;
            }
            return this.combinedMap;
        }
        getCombinedSourcemap() {
            return this._getCombinedSourcemap(true);
        }
    }
    let closed = false;
    const processesing = new Set();
    // keeps track of hook promises so that we can wait for them all to finish upon closing the server
    function handleHookPromise(maybePromise) {
        if (!maybePromise?.then) {
            return maybePromise;
        }
        const promise = maybePromise;
        processesing.add(promise);
        return promise.finally(() => processesing.delete(promise));
    }
    const container = {
        options: await (async () => {
            let options = rollupOptions;
            for (const optionsHook of getSortedPluginHooks('options')) {
                if (closed)
                    throwClosedServerError();
                options =
                    (await handleHookPromise(optionsHook.call(minimalContext, options))) || options;
            }
            if (options.acornInjectPlugins) {
                parser = acorn.Parser.extend(...arraify(options.acornInjectPlugins));
            }
            return {
                acorn,
                acornInjectPlugins: [],
                ...options,
            };
        })(),
        getModuleInfo,
        async buildStart() {
            await handleHookPromise(hookParallel('buildStart', (plugin) => new Context(plugin), () => [container.options]));
        },
        async resolveId(rawId, importer = join$1(root, 'index.html'), options) {
            const skip = options?.skip;
            const ssr = options?.ssr;
            const scan = !!options?.scan;
            const ctx = new Context();
            ctx.ssr = !!ssr;
            ctx._scan = scan;
            ctx._resolveSkips = skip;
            const resolveStart = debugResolve ? performance.now() : 0;
            let id = null;
            const partial = {};
            for (const plugin of getSortedPlugins('resolveId')) {
                if (closed)
                    throwClosedServerError();
                if (!plugin.resolveId)
                    continue;
                if (skip?.has(plugin))
                    continue;
                ctx._activePlugin = plugin;
                const pluginResolveStart = debugPluginResolve ? performance.now() : 0;
                const handler = 'handler' in plugin.resolveId
                    ? plugin.resolveId.handler
                    : plugin.resolveId;
                const result = await handleHookPromise(handler.call(ctx, rawId, importer, {
                    assertions: options?.assertions ?? {},
                    custom: options?.custom,
                    isEntry: !!options?.isEntry,
                    ssr,
                    scan,
                }));
                if (!result)
                    continue;
                if (typeof result === 'string') {
                    id = result;
                }
                else {
                    id = result.id;
                    Object.assign(partial, result);
                }
                debugPluginResolve?.(timeFrom(pluginResolveStart), plugin.name, prettifyUrl(id, root));
                // resolveId() is hookFirst - first non-null result is returned.
                break;
            }
            if (debugResolve && rawId !== id && !rawId.startsWith(FS_PREFIX)) {
                const key = rawId + id;
                // avoid spamming
                if (!seenResolves[key]) {
                    seenResolves[key] = true;
                    debugResolve(`${timeFrom(resolveStart)} ${colors.cyan(rawId)} -> ${colors.dim(id)}`);
                }
            }
            if (id) {
                partial.id = isExternalUrl(id) ? id : normalizePath(id);
                return partial;
            }
            else {
                return null;
            }
        },
        async load(id, options) {
            const ssr = options?.ssr;
            const ctx = new Context();
            ctx.ssr = !!ssr;
            for (const plugin of getSortedPlugins('load')) {
                if (closed)
                    throwClosedServerError();
                if (!plugin.load)
                    continue;
                ctx._activePlugin = plugin;
                const handler = 'handler' in plugin.load ? plugin.load.handler : plugin.load;
                const result = await handleHookPromise(handler.call(ctx, id, { ssr }));
                if (result != null) {
                    if (isObject(result)) {
                        updateModuleInfo(id, result);
                    }
                    return result;
                }
            }
            return null;
        },
        async transform(code, id, options) {
            const inMap = options?.inMap;
            const ssr = options?.ssr;
            const ctx = new TransformContext(id, code, inMap);
            ctx.ssr = !!ssr;
            for (const plugin of getSortedPlugins('transform')) {
                if (closed)
                    throwClosedServerError();
                if (!plugin.transform)
                    continue;
                ctx._activePlugin = plugin;
                ctx._activeId = id;
                ctx._activeCode = code;
                const start = debugPluginTransform ? performance.now() : 0;
                let result;
                const handler = 'handler' in plugin.transform
                    ? plugin.transform.handler
                    : plugin.transform;
                try {
                    result = await handleHookPromise(handler.call(ctx, code, id, { ssr }));
                }
                catch (e) {
                    ctx.error(e);
                }
                if (!result)
                    continue;
                debugPluginTransform?.(timeFrom(start), plugin.name, prettifyUrl(id, root));
                if (isObject(result)) {
                    if (result.code !== undefined) {
                        code = result.code;
                        if (result.map) {
                            if (debugSourcemapCombine) {
                                // @ts-expect-error inject plugin name for debug purpose
                                result.map.name = plugin.name;
                            }
                            ctx.sourcemapChain.push(result.map);
                        }
                    }
                    updateModuleInfo(id, result);
                }
                else {
                    code = result;
                }
            }
            return {
                code,
                map: ctx._getCombinedSourcemap(),
            };
        },
        async close() {
            if (closed)
                return;
            closed = true;
            await Promise.allSettled(Array.from(processesing));
            const ctx = new Context();
            await hookParallel('buildEnd', () => ctx, () => []);
            await hookParallel('closeBundle', () => ctx, () => []);
        },
    };
    return container;
}

const debug$4 = createDebugger('vite:deps');
const htmlTypesRE = /\.(html|vue|svelte|astro|imba)$/;
// A simple regex to detect import sources. This is only used on
// <script lang="ts"> blocks in vue (setup only) or svelte files, since
// seemingly unused imports are dropped by esbuild when transpiling TS which
// prevents it from crawling further.
// We can't use es-module-lexer because it can't handle TS, and don't want to
// use Acorn because it's slow. Luckily this doesn't have to be bullet proof
// since even missed imports can be caught at runtime, and false positives will
// simply be ignored.
const importsRE = /(?<!\/\/.*)(?<=^|;|\*\/)\s*import(?!\s+type)(?:[\w*{}\n\r\t, ]+from)?\s*("[^"]+"|'[^']+')\s*(?=$|;|\/\/|\/\*)/gm;
function scanImports(config) {
    // Only used to scan non-ssr code
    const start = performance.now();
    const deps = {};
    const missing = {};
    let entries;
    const scanContext = { cancelled: false };
    const esbuildContext = computeEntries(config).then((computedEntries) => {
        entries = computedEntries;
        if (!entries.length) {
            if (!config.optimizeDeps.entries && !config.optimizeDeps.include) {
                config.logger.warn(colors.yellow('(!) Could not auto-determine entry point from rollupOptions or html files ' +
                    'and there are no explicit optimizeDeps.include patterns. ' +
                    'Skipping dependency pre-bundling.'));
            }
            return;
        }
        if (scanContext.cancelled)
            return;
        debug$4?.(`Crawling dependencies using entries: ${entries
            .map((entry) => `\n  ${colors.dim(entry)}`)
            .join('')}`);
        return prepareEsbuildScanner(config, entries, deps, missing, scanContext);
    });
    const result = esbuildContext
        .then((context) => {
        function disposeContext() {
            return context?.dispose().catch((e) => {
                config.logger.error('Failed to dispose esbuild context', { error: e });
            });
        }
        if (!context || scanContext?.cancelled) {
            disposeContext();
            return { deps: {}, missing: {} };
        }
        return context
            .rebuild()
            .then(() => {
            return {
                // Ensure a fixed order so hashes are stable and improve logs
                deps: orderedDependencies(deps),
                missing,
            };
        })
            .finally(() => {
            return disposeContext();
        });
    })
        .catch(async (e) => {
        if (e.errors && e.message.includes('The build was canceled')) {
            // esbuild logs an error when cancelling, but this is expected so
            // return an empty result instead
            return { deps: {}, missing: {} };
        }
        const prependMessage = colors.red(`\
  Failed to scan for dependencies from entries:
  ${entries.join('\n')}

  `);
        if (e.errors) {
            const msgs = await formatMessages(e.errors, {
                kind: 'error',
                color: true,
            });
            e.message = prependMessage + msgs.join('\n');
        }
        else {
            e.message = prependMessage + e.message;
        }
        throw e;
    })
        .finally(() => {
        if (debug$4) {
            const duration = (performance.now() - start).toFixed(2);
            const depsStr = Object.keys(orderedDependencies(deps))
                .sort()
                .map((id) => `\n  ${colors.cyan(id)} -> ${colors.dim(deps[id])}`)
                .join('') || colors.dim('no dependencies found');
            debug$4(`Scan completed in ${duration}ms: ${depsStr}`);
        }
    });
    return {
        cancel: async () => {
            scanContext.cancelled = true;
            return esbuildContext.then((context) => context?.cancel());
        },
        result,
    };
}
async function computeEntries(config) {
    let entries = [];
    const explicitEntryPatterns = config.optimizeDeps.entries;
    const buildInput = config.build.rollupOptions?.input;
    if (explicitEntryPatterns) {
        entries = await globEntries(explicitEntryPatterns, config);
    }
    else if (buildInput) {
        const resolvePath = (p) => path.resolve(config.root, p);
        if (typeof buildInput === 'string') {
            entries = [resolvePath(buildInput)];
        }
        else if (Array.isArray(buildInput)) {
            entries = buildInput.map(resolvePath);
        }
        else if (isObject(buildInput)) {
            entries = Object.values(buildInput).map(resolvePath);
        }
        else {
            throw new Error('invalid rollupOptions.input value.');
        }
    }
    else {
        entries = await globEntries('**/*.html', config);
    }
    // Non-supported entry file types and virtual files should not be scanned for
    // dependencies.
    entries = entries.filter((entry) => isScannable(entry) && fs.existsSync(entry));
    return entries;
}
async function prepareEsbuildScanner(config, entries, deps, missing, scanContext) {
    const container = await createPluginContainer(config);
    if (scanContext?.cancelled)
        return;
    const plugin = esbuildScanPlugin(config, container, deps, missing, entries);
    const { plugins = [], ...esbuildOptions } = config.optimizeDeps?.esbuildOptions ?? {};
    return await esbuild.context({
        absWorkingDir: process.cwd(),
        write: false,
        stdin: {
            contents: entries.map((e) => `import ${JSON.stringify(e)}`).join('\n'),
            loader: 'js',
        },
        bundle: true,
        format: 'esm',
        logLevel: 'silent',
        plugins: [...plugins, plugin],
        ...esbuildOptions,
    });
}
function orderedDependencies(deps) {
    const depsList = Object.entries(deps);
    // Ensure the same browserHash for the same set of dependencies
    depsList.sort((a, b) => a[0].localeCompare(b[0]));
    return Object.fromEntries(depsList);
}
function globEntries(pattern, config) {
    return glob(pattern, {
        cwd: config.root,
        ignore: [
            '**/node_modules/**',
            `**/${config.build.outDir}/**`,
            // if there aren't explicit entries, also ignore other common folders
            ...(config.optimizeDeps.entries
                ? []
                : [`**/__tests__/**`, `**/coverage/**`]),
        ],
        absolute: true,
        suppressErrors: true, // suppress EACCES errors
    });
}
const scriptRE = /(<script(?:\s+[a-z_:][-\w:]*(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^"'<>=\s]+))?)*\s*>)(.*?)<\/script>/gis;
const commentRE = /<!--.*?-->/gs;
const srcRE = /\bsrc\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s'">]+))/i;
const typeRE = /\btype\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s'">]+))/i;
const langRE = /\blang\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s'">]+))/i;
const contextRE = /\bcontext\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s'">]+))/i;
function esbuildScanPlugin(config, container, depImports, missing, entries) {
    const seen = new Map();
    const resolve = async (id, importer, options) => {
        const key = id + (importer && path.dirname(importer));
        if (seen.has(key)) {
            return seen.get(key);
        }
        const resolved = await container.resolveId(id, importer && normalizePath(importer), {
            ...options,
            scan: true,
        });
        const res = resolved?.id;
        seen.set(key, res);
        return res;
    };
    const include = config.optimizeDeps?.include;
    const exclude = [
        ...(config.optimizeDeps?.exclude || []),
        '@vite/client',
        '@vite/env',
    ];
    const externalUnlessEntry = ({ path }) => ({
        path,
        external: !entries.includes(path),
    });
    const doTransformGlobImport = async (contents, id, loader) => {
        let transpiledContents;
        // transpile because `transformGlobImport` only expects js
        if (loader !== 'js') {
            transpiledContents = (await transform(contents, { loader })).code;
        }
        else {
            transpiledContents = contents;
        }
        const result = await transformGlobImport(transpiledContents, id, config.root, resolve, config.isProduction);
        return result?.s.toString() || transpiledContents;
    };
    return {
        name: 'vite:dep-scan',
        setup(build) {
            const scripts = {};
            // external urls
            build.onResolve({ filter: externalRE }, ({ path }) => ({
                path,
                external: true,
            }));
            // data urls
            build.onResolve({ filter: dataUrlRE }, ({ path }) => ({
                path,
                external: true,
            }));
            // local scripts (`<script>` in Svelte and `<script setup>` in Vue)
            build.onResolve({ filter: virtualModuleRE }, ({ path }) => {
                return {
                    // strip prefix to get valid filesystem path so esbuild can resolve imports in the file
                    path: path.replace(virtualModulePrefix, ''),
                    namespace: 'script',
                };
            });
            build.onLoad({ filter: /.*/, namespace: 'script' }, ({ path }) => {
                return scripts[path];
            });
            // html types: extract script contents -----------------------------------
            build.onResolve({ filter: htmlTypesRE }, async ({ path, importer }) => {
                const resolved = await resolve(path, importer);
                if (!resolved)
                    return;
                // It is possible for the scanner to scan html types in node_modules.
                // If we can optimize this html type, skip it so it's handled by the
                // bare import resolve, and recorded as optimization dep.
                if (isInNodeModules(resolved) &&
                    isOptimizable(resolved, config.optimizeDeps))
                    return;
                return {
                    path: resolved,
                    namespace: 'html',
                };
            });
            // extract scripts inside HTML-like files and treat it as a js module
            build.onLoad({ filter: htmlTypesRE, namespace: 'html' }, async ({ path }) => {
                let raw = await fsp.readFile(path, 'utf-8');
                // Avoid matching the content of the comment
                raw = raw.replace(commentRE, '<!---->');
                const isHtml = path.endsWith('.html');
                scriptRE.lastIndex = 0;
                let js = '';
                let scriptId = 0;
                let match;
                while ((match = scriptRE.exec(raw))) {
                    const [, openTag, content] = match;
                    const typeMatch = openTag.match(typeRE);
                    const type = typeMatch && (typeMatch[1] || typeMatch[2] || typeMatch[3]);
                    const langMatch = openTag.match(langRE);
                    const lang = langMatch && (langMatch[1] || langMatch[2] || langMatch[3]);
                    // skip non type module script
                    if (isHtml && type !== 'module') {
                        continue;
                    }
                    // skip type="application/ld+json" and other non-JS types
                    if (type &&
                        !(type.includes('javascript') ||
                            type.includes('ecmascript') ||
                            type === 'module')) {
                        continue;
                    }
                    let loader = 'js';
                    if (lang === 'ts' || lang === 'tsx' || lang === 'jsx') {
                        loader = lang;
                    }
                    else if (path.endsWith('.astro')) {
                        loader = 'ts';
                    }
                    const srcMatch = openTag.match(srcRE);
                    if (srcMatch) {
                        const src = srcMatch[1] || srcMatch[2] || srcMatch[3];
                        js += `import ${JSON.stringify(src)}\n`;
                    }
                    else if (content.trim()) {
                        // The reason why virtual modules are needed:
                        // 1. There can be module scripts (`<script context="module">` in Svelte and `<script>` in Vue)
                        // or local scripts (`<script>` in Svelte and `<script setup>` in Vue)
                        // 2. There can be multiple module scripts in html
                        // We need to handle these separately in case variable names are reused between them
                        // append imports in TS to prevent esbuild from removing them
                        // since they may be used in the template
                        const contents = content +
                            (loader.startsWith('ts') ? extractImportPaths(content) : '');
                        const key = `${path}?id=${scriptId++}`;
                        if (contents.includes('import.meta.glob')) {
                            scripts[key] = {
                                loader: 'js',
                                contents: await doTransformGlobImport(contents, path, loader),
                                pluginData: {
                                    htmlType: { loader },
                                },
                            };
                        }
                        else {
                            scripts[key] = {
                                loader,
                                contents,
                                pluginData: {
                                    htmlType: { loader },
                                },
                            };
                        }
                        const virtualModulePath = JSON.stringify(virtualModulePrefix + key);
                        const contextMatch = openTag.match(contextRE);
                        const context = contextMatch &&
                            (contextMatch[1] || contextMatch[2] || contextMatch[3]);
                        // Especially for Svelte files, exports in <script context="module"> means module exports,
                        // exports in <script> means component props. To avoid having two same export name from the
                        // star exports, we need to ignore exports in <script>
                        if (path.endsWith('.svelte') && context !== 'module') {
                            js += `import ${virtualModulePath}\n`;
                        }
                        else {
                            js += `export * from ${virtualModulePath}\n`;
                        }
                    }
                }
                // This will trigger incorrectly if `export default` is contained
                // anywhere in a string. Svelte and Astro files can't have
                // `export default` as code so we know if it's encountered it's a
                // false positive (e.g. contained in a string)
                if (!path.endsWith('.vue') || !js.includes('export default')) {
                    js += '\nexport default {}';
                }
                return {
                    loader: 'js',
                    contents: js,
                };
            });
            // bare imports: record and externalize ----------------------------------
            build.onResolve({
                // avoid matching windows volume
                filter: /^[\w@][^:]/,
            }, async ({ path: id, importer, pluginData }) => {
                if (moduleListContains(exclude, id)) {
                    return externalUnlessEntry({ path: id });
                }
                if (depImports[id]) {
                    return externalUnlessEntry({ path: id });
                }
                const resolved = await resolve(id, importer, {
                    custom: {
                        depScan: { loader: pluginData?.htmlType?.loader },
                    },
                });
                if (resolved) {
                    if (shouldExternalizeDep(resolved, id)) {
                        return externalUnlessEntry({ path: id });
                    }
                    if (isInNodeModules(resolved) || include?.includes(id)) {
                        // dependency or forced included, externalize and stop crawling
                        if (isOptimizable(resolved, config.optimizeDeps)) {
                            depImports[id] = resolved;
                        }
                        return externalUnlessEntry({ path: id });
                    }
                    else if (isScannable(resolved)) {
                        const namespace = htmlTypesRE.test(resolved) ? 'html' : undefined;
                        // linked package, keep crawling
                        return {
                            path: path.resolve(resolved),
                            namespace,
                        };
                    }
                    else {
                        return externalUnlessEntry({ path: id });
                    }
                }
                else {
                    missing[id] = normalizePath(importer);
                }
            });
            // Externalized file types -----------------------------------------------
            // these are done on raw ids using esbuild's native regex filter so it
            // should be faster than doing it in the catch-all via js
            // they are done after the bare import resolve because a package name
            // may end with these extensions
            // css
            build.onResolve({ filter: CSS_LANGS_RE }, externalUnlessEntry);
            // json & wasm
            build.onResolve({ filter: /\.(json|json5|wasm)$/ }, externalUnlessEntry);
            // known asset types
            build.onResolve({
                filter: new RegExp(`\\.(${KNOWN_ASSET_TYPES.join('|')})$`),
            }, externalUnlessEntry);
            // known vite query types: ?worker, ?raw
            build.onResolve({ filter: SPECIAL_QUERY_RE }, ({ path }) => ({
                path,
                external: true,
            }));
            // catch all -------------------------------------------------------------
            build.onResolve({
                filter: /.*/,
            }, async ({ path: id, importer, pluginData }) => {
                // use vite resolver to support urls and omitted extensions
                const resolved = await resolve(id, importer, {
                    custom: {
                        depScan: { loader: pluginData?.htmlType?.loader },
                    },
                });
                if (resolved) {
                    if (shouldExternalizeDep(resolved, id) || !isScannable(resolved)) {
                        return externalUnlessEntry({ path: id });
                    }
                    const namespace = htmlTypesRE.test(resolved) ? 'html' : undefined;
                    return {
                        path: path.resolve(cleanUrl(resolved)),
                        namespace,
                    };
                }
                else {
                    // resolve failed... probably unsupported type
                    return externalUnlessEntry({ path: id });
                }
            });
            // for jsx/tsx, we need to access the content and check for
            // presence of import.meta.glob, since it results in import relationships
            // but isn't crawled by esbuild.
            build.onLoad({ filter: JS_TYPES_RE }, async ({ path: id }) => {
                let ext = path.extname(id).slice(1);
                if (ext === 'mjs')
                    ext = 'js';
                let contents = await fsp.readFile(id, 'utf-8');
                if (ext.endsWith('x') && config.esbuild && config.esbuild.jsxInject) {
                    contents = config.esbuild.jsxInject + `\n` + contents;
                }
                const loader = config.optimizeDeps?.esbuildOptions?.loader?.[`.${ext}`] ||
                    ext;
                if (contents.includes('import.meta.glob')) {
                    return {
                        loader: 'js',
                        contents: await doTransformGlobImport(contents, id, loader),
                    };
                }
                return {
                    loader,
                    contents,
                };
            });
        },
    };
}
/**
 * when using TS + (Vue + `<script setup>`) or Svelte, imports may seem
 * unused to esbuild and dropped in the build output, which prevents
 * esbuild from crawling further.
 * the solution is to add `import 'x'` for every source to force
 * esbuild to keep crawling due to potential side effects.
 */
function extractImportPaths(code) {
    // empty singleline & multiline comments to avoid matching comments
    code = code
        .replace(multilineCommentsRE, '/* */')
        .replace(singlelineCommentsRE, '');
    let js = '';
    let m;
    importsRE.lastIndex = 0;
    while ((m = importsRE.exec(code)) != null) {
        js += `\nimport ${m[1]}`;
    }
    return js;
}
function shouldExternalizeDep(resolvedId, rawId) {
    // not a valid file path
    if (!path.isAbsolute(resolvedId)) {
        return true;
    }
    // virtual id
    if (resolvedId === rawId || resolvedId.includes('\0')) {
        return true;
    }
    return false;
}
function isScannable(id) {
    return JS_TYPES_RE.test(id) || htmlTypesRE.test(id);
}

function createOptimizeDepsIncludeResolver(config, ssr) {
    const resolve = config.createResolver({
        asSrc: false,
        scan: true,
        ssrOptimizeCheck: ssr,
        ssrConfig: config.ssr,
        packageCache: new Map(),
    });
    return async (id) => {
        const lastArrowIndex = id.lastIndexOf('>');
        if (lastArrowIndex === -1) {
            return await resolve(id, undefined, undefined, ssr);
        }
        // split nested selected id by last '>', for example:
        // 'foo > bar > baz' => 'foo > bar' & 'baz'
        const nestedRoot = id.substring(0, lastArrowIndex).trim();
        const nestedPath = id.substring(lastArrowIndex + 1).trim();
        const basedir = nestedResolveBasedir(nestedRoot, config.root, config.resolve.preserveSymlinks);
        return await resolve(nestedPath, path.resolve(basedir, 'package.json'), undefined, ssr);
    };
}
/**
 * Expand the glob syntax in `optimizeDeps.include` to proper import paths
 */
function expandGlobIds(id, config) {
    const pkgName = getNpmPackageName(id);
    if (!pkgName)
        return [];
    const pkgData = resolvePackageData(pkgName, config.root, config.resolve.preserveSymlinks, config.packageCache);
    if (!pkgData)
        return [];
    const pattern = '.' + id.slice(pkgName.length);
    const exports = pkgData.data.exports;
    // if package has exports field, get all possible export paths and apply
    // glob on them with micromatch
    if (exports) {
        if (typeof exports === 'string' || Array.isArray(exports)) {
            return [pkgName];
        }
        const possibleExportPaths = [];
        for (const key in exports) {
            if (key.startsWith('.')) {
                if (key.includes('*')) {
                    // "./glob/*": {
                    //   "browser": "./dist/glob/*-browser/*.js", <-- get this one
                    //   "default": "./dist/glob/*/*.js"
                    // }
                    // NOTE: theoretically the "default" condition could map to a different
                    // set of files, but that complicates the resolve logic, so we assume
                    // all conditions map to the same set of files, and get the first one.
                    const exportsValue = getFirstExportStringValue(exports[key]);
                    if (!exportsValue)
                        continue;
                    // "./dist/glob/*-browser/*.js" => "./dist/glob/**/*-browser/**/*.js"
                    // NOTE: in some cases, this could expand to consecutive /**/*/**/* etc
                    // but it's fine since fast-glob handles it the same.
                    const exportValuePattern = exportsValue.replace(/\*/g, '**/*');
                    // "./dist/glob/*-browser/*.js" => /dist\/glob\/(.*)-browser\/(.*)\.js/
                    const exportsValueGlobRe = new RegExp(exportsValue.split('*').map(escapeRegex).join('(.*)'));
                    possibleExportPaths.push(...glob
                        .sync(exportValuePattern, {
                        cwd: pkgData.dir,
                        ignore: ['node_modules'],
                    })
                        .map((filePath) => {
                        // "./glob/*": "./dist/glob/*-browser/*.js"
                        // `filePath`: "./dist/glob/foo-browser/foo.js"
                        // we need to revert the file path back to the export key by
                        // matching value regex and replacing the capture groups to the key
                        const matched = slash(filePath).match(exportsValueGlobRe);
                        // `matched`: [..., 'foo', 'foo']
                        if (matched) {
                            let allGlobSame = matched.length === 2;
                            // exports key can only have one *, so for >=2 matched groups,
                            // make sure they have the same value
                            if (!allGlobSame) {
                                // assume true, if one group is different, set false and break
                                allGlobSame = true;
                                for (let i = 2; i < matched.length; i++) {
                                    if (matched[i] !== matched[i - 1]) {
                                        allGlobSame = false;
                                        break;
                                    }
                                }
                            }
                            if (allGlobSame) {
                                return key.replace('*', matched[1]).slice(2);
                            }
                        }
                        return '';
                    })
                        .filter(Boolean));
                }
                else {
                    possibleExportPaths.push(key.slice(2));
                }
            }
        }
        const matched = micromatch(possibleExportPaths, pattern).map((match) => path.posix.join(pkgName, match));
        matched.unshift(pkgName);
        return matched;
    }
    else {
        // for packages without exports, we can do a simple glob
        const matched = glob
            .sync(pattern, { cwd: pkgData.dir, ignore: ['node_modules'] })
            .map((match) => path.posix.join(pkgName, slash(match)));
        matched.unshift(pkgName);
        return matched;
    }
}
function getFirstExportStringValue(obj) {
    if (typeof obj === 'string') {
        return obj;
    }
    else if (Array.isArray(obj)) {
        return obj[0];
    }
    else {
        for (const key in obj) {
            return getFirstExportStringValue(obj[key]);
        }
    }
}
/**
 * Continuously resolve the basedir of packages separated by '>'
 */
function nestedResolveBasedir(id, basedir, preserveSymlinks = false) {
    const pkgs = id.split('>').map((pkg) => pkg.trim());
    for (const pkg of pkgs) {
        basedir = resolvePackageData(pkg, basedir, preserveSymlinks)?.dir || basedir;
    }
    return basedir;
}

const debug$3 = createDebugger('vite:deps');
/**
 * The amount to wait for requests to register newly found dependencies before triggering
 * a re-bundle + page reload
 */
const debounceMs = 100;
const depsOptimizerMap = new WeakMap();
const devSsrDepsOptimizerMap = new WeakMap();
function getDepsOptimizer(config, ssr) {
    // Workers compilation shares the DepsOptimizer from the main build
    const isDevSsr = ssr && config.command !== 'build';
    return (isDevSsr ? devSsrDepsOptimizerMap : depsOptimizerMap).get(config.mainConfig || config);
}
async function initDepsOptimizer(config, server) {
    // Non Dev SSR Optimizer
    const ssr = config.command === 'build' && !!config.build.ssr;
    if (!getDepsOptimizer(config, ssr)) {
        await createDepsOptimizer(config, server);
    }
}
let creatingDevSsrOptimizer;
async function initDevSsrDepsOptimizer(config, server) {
    if (getDepsOptimizer(config, true)) {
        // ssr
        return;
    }
    if (creatingDevSsrOptimizer) {
        return creatingDevSsrOptimizer;
    }
    creatingDevSsrOptimizer = (async function () {
        // Important: scanning needs to be done before starting the SSR dev optimizer
        // If ssrLoadModule is called before server.listen(), the main deps optimizer
        // will not be yet created
        const ssr = false;
        if (!getDepsOptimizer(config, ssr)) {
            await initDepsOptimizer(config, server);
        }
        await getDepsOptimizer(config, ssr).scanProcessing;
        await createDevSsrDepsOptimizer(config);
        creatingDevSsrOptimizer = undefined;
    })();
    return await creatingDevSsrOptimizer;
}
async function createDepsOptimizer(config, server) {
    const { logger } = config;
    const isBuild = config.command === 'build';
    const ssr = isBuild && !!config.build.ssr; // safe as Dev SSR don't use this optimizer
    const sessionTimestamp = Date.now().toString();
    const cachedMetadata = await loadCachedDepOptimizationMetadata(config, ssr);
    let debounceProcessingHandle;
    let closed = false;
    let metadata = cachedMetadata || initDepsOptimizerMetadata(config, ssr, sessionTimestamp);
    const depsOptimizer = {
        metadata,
        registerMissingImport,
        run: () => debouncedProcessing(0),
        isOptimizedDepFile: createIsOptimizedDepFile(config),
        isOptimizedDepUrl: createIsOptimizedDepUrl(config),
        getOptimizedDepId: (depInfo) => isBuild ? depInfo.file : `${depInfo.file}?v=${depInfo.browserHash}`,
        registerWorkersSource,
        delayDepsOptimizerUntil,
        resetRegisteredIds,
        ensureFirstRun,
        close,
        options: getDepOptimizationConfig(config, ssr),
    };
    depsOptimizerMap.set(config, depsOptimizer);
    let newDepsDiscovered = false;
    let newDepsToLog = [];
    let newDepsToLogHandle;
    const logNewlyDiscoveredDeps = () => {
        if (newDepsToLog.length) {
            config.logger.info(colors.green(`✨ new dependencies optimized: ${depsLogString(newDepsToLog)}`), {
                timestamp: true,
            });
            newDepsToLog = [];
        }
    };
    let depOptimizationProcessing = newDepOptimizationProcessing();
    let depOptimizationProcessingQueue = [];
    const resolveEnqueuedProcessingPromises = () => {
        // Resolve all the processings (including the ones which were delayed)
        for (const processing of depOptimizationProcessingQueue) {
            processing.resolve();
        }
        depOptimizationProcessingQueue = [];
    };
    let enqueuedRerun;
    let currentlyProcessing = false;
    let firstRunCalled = !!cachedMetadata;
    // During build, we wait for every module to be scanned before resolving
    // optimized deps loading for rollup on each rebuild. It will be recreated
    // after each buildStart.
    // During dev, if this is a cold run, we wait for static imports discovered
    // from the first request before resolving to minimize full page reloads.
    // On warm start or after the first optimization is run, we use a simpler
    // debounce strategy each time a new dep is discovered.
    let crawlEndFinder;
    if (isBuild || !cachedMetadata) {
        crawlEndFinder = setupOnCrawlEnd(onCrawlEnd);
    }
    let optimizationResult;
    let discover;
    async function close() {
        closed = true;
        crawlEndFinder?.cancel();
        await Promise.allSettled([
            discover?.cancel(),
            depsOptimizer.scanProcessing,
            optimizationResult?.cancel(),
        ]);
    }
    if (!cachedMetadata) {
        // Enter processing state until crawl of static imports ends
        currentlyProcessing = true;
        // Initialize discovered deps with manually added optimizeDeps.include info
        const deps = {};
        await addManuallyIncludedOptimizeDeps(deps, config, ssr);
        const discovered = toDiscoveredDependencies(config, deps, ssr, sessionTimestamp);
        for (const depInfo of Object.values(discovered)) {
            addOptimizedDepInfo(metadata, 'discovered', {
                ...depInfo,
                processing: depOptimizationProcessing.promise,
            });
            newDepsDiscovered = true;
        }
        if (config.optimizeDeps.noDiscovery) {
            // We don't need to scan for dependencies or wait for the static crawl to end
            // Run the first optimization run immediately
            runOptimizer();
        }
        else if (!isBuild) {
            // Important, the scanner is dev only
            depsOptimizer.scanProcessing = new Promise((resolve) => {
                (async () => {
                    try {
                        debug$3?.(colors.green(`scanning for dependencies...`));
                        discover = discoverProjectDependencies(config);
                        const deps = await discover.result;
                        discover = undefined;
                        // Add these dependencies to the discovered list, as these are currently
                        // used by the preAliasPlugin to support aliased and optimized deps.
                        // This is also used by the CJS externalization heuristics in legacy mode
                        for (const id of Object.keys(deps)) {
                            if (!metadata.discovered[id]) {
                                addMissingDep(id, deps[id]);
                            }
                        }
                        const knownDeps = prepareKnownDeps();
                        // For dev, we run the scanner and the first optimization
                        // run on the background, but we wait until crawling has ended
                        // to decide if we send this result to the browser or we need to
                        // do another optimize step
                        optimizationResult = runOptimizeDeps(config, knownDeps);
                    }
                    catch (e) {
                        logger.error(e.stack || e.message);
                    }
                    finally {
                        resolve();
                        depsOptimizer.scanProcessing = undefined;
                    }
                })();
            });
        }
    }
    function startNextDiscoveredBatch() {
        newDepsDiscovered = false;
        // Add the current depOptimizationProcessing to the queue, these
        // promises are going to be resolved once a rerun is committed
        depOptimizationProcessingQueue.push(depOptimizationProcessing);
        // Create a new promise for the next rerun, discovered missing
        // dependencies will be assigned this promise from this point
        depOptimizationProcessing = newDepOptimizationProcessing();
    }
    function prepareKnownDeps() {
        const knownDeps = {};
        // Clone optimized info objects, fileHash, browserHash may be changed for them
        for (const dep of Object.keys(metadata.optimized)) {
            knownDeps[dep] = { ...metadata.optimized[dep] };
        }
        for (const dep of Object.keys(metadata.discovered)) {
            // Clone the discovered info discarding its processing promise
            const { processing, ...info } = metadata.discovered[dep];
            knownDeps[dep] = info;
        }
        return knownDeps;
    }
    async function runOptimizer(preRunResult) {
        // a successful completion of the optimizeDeps rerun will end up
        // creating new bundled version of all current and discovered deps
        // in the cache dir and a new metadata info object assigned
        // to _metadata. A fullReload is only issued if the previous bundled
        // dependencies have changed.
        // if the rerun fails, _metadata remains untouched, current discovered
        // deps are cleaned, and a fullReload is issued
        // All deps, previous known and newly discovered are rebundled,
        // respect insertion order to keep the metadata file stable
        const isRerun = firstRunCalled;
        firstRunCalled = true;
        // Ensure that rerun is called sequentially
        enqueuedRerun = undefined;
        // Ensure that a rerun will not be issued for current discovered deps
        if (debounceProcessingHandle)
            clearTimeout(debounceProcessingHandle);
        if (closed || Object.keys(metadata.discovered).length === 0) {
            currentlyProcessing = false;
            return;
        }
        currentlyProcessing = true;
        try {
            let processingResult;
            if (preRunResult) {
                processingResult = preRunResult;
            }
            else {
                const knownDeps = prepareKnownDeps();
                startNextDiscoveredBatch();
                optimizationResult = runOptimizeDeps(config, knownDeps);
                processingResult = await optimizationResult.result;
                optimizationResult = undefined;
            }
            if (closed) {
                currentlyProcessing = false;
                processingResult.cancel();
                resolveEnqueuedProcessingPromises();
                return;
            }
            const newData = processingResult.metadata;
            const needsInteropMismatch = findInteropMismatches(metadata.discovered, newData.optimized);
            // After a re-optimization, if the internal bundled chunks change a full page reload
            // is required. If the files are stable, we can avoid the reload that is expensive
            // for large applications. Comparing their fileHash we can find out if it is safe to
            // keep the current browser state.
            const needsReload = needsInteropMismatch.length > 0 ||
                metadata.hash !== newData.hash ||
                Object.keys(metadata.optimized).some((dep) => {
                    return (metadata.optimized[dep].fileHash !== newData.optimized[dep].fileHash);
                });
            const commitProcessing = async () => {
                await processingResult.commit();
                // While optimizeDeps is running, new missing deps may be discovered,
                // in which case they will keep being added to metadata.discovered
                for (const id in metadata.discovered) {
                    if (!newData.optimized[id]) {
                        addOptimizedDepInfo(newData, 'discovered', metadata.discovered[id]);
                    }
                }
                // If we don't reload the page, we need to keep browserHash stable
                if (!needsReload) {
                    newData.browserHash = metadata.browserHash;
                    for (const dep in newData.chunks) {
                        newData.chunks[dep].browserHash = metadata.browserHash;
                    }
                    for (const dep in newData.optimized) {
                        newData.optimized[dep].browserHash = (metadata.optimized[dep] || metadata.discovered[dep]).browserHash;
                    }
                }
                // Commit hash and needsInterop changes to the discovered deps info
                // object. Allow for code to await for the discovered processing promise
                // and use the information in the same object
                for (const o in newData.optimized) {
                    const discovered = metadata.discovered[o];
                    if (discovered) {
                        const optimized = newData.optimized[o];
                        discovered.browserHash = optimized.browserHash;
                        discovered.fileHash = optimized.fileHash;
                        discovered.needsInterop = optimized.needsInterop;
                        discovered.processing = undefined;
                    }
                }
                if (isRerun) {
                    newDepsToLog.push(...Object.keys(newData.optimized).filter((dep) => !metadata.optimized[dep]));
                }
                metadata = depsOptimizer.metadata = newData;
                resolveEnqueuedProcessingPromises();
            };
            if (!needsReload) {
                await commitProcessing();
                if (!debug$3) {
                    if (newDepsToLogHandle)
                        clearTimeout(newDepsToLogHandle);
                    newDepsToLogHandle = setTimeout(() => {
                        newDepsToLogHandle = undefined;
                        logNewlyDiscoveredDeps();
                    }, 2 * debounceMs);
                }
                else {
                    debug$3(colors.green(`✨ ${!isRerun
                        ? `dependencies optimized`
                        : `optimized dependencies unchanged`}`));
                }
            }
            else {
                if (newDepsDiscovered) {
                    // There are newly discovered deps, and another rerun is about to be
                    // executed. Avoid the current full reload discarding this rerun result
                    // We don't resolve the processing promise, as they will be resolved
                    // once a rerun is committed
                    processingResult.cancel();
                    debug$3?.(colors.green(`✨ delaying reload as new dependencies have been found...`));
                }
                else {
                    await commitProcessing();
                    if (!debug$3) {
                        if (newDepsToLogHandle)
                            clearTimeout(newDepsToLogHandle);
                        newDepsToLogHandle = undefined;
                        logNewlyDiscoveredDeps();
                    }
                    logger.info(colors.green(`✨ optimized dependencies changed. reloading`), {
                        timestamp: true,
                    });
                    if (needsInteropMismatch.length > 0) {
                        config.logger.warn(`Mixed ESM and CJS detected in ${colors.yellow(needsInteropMismatch.join(', '))}, add ${needsInteropMismatch.length === 1 ? 'it' : 'them'} to optimizeDeps.needsInterop to speed up cold start`, {
                            timestamp: true,
                        });
                    }
                    fullReload();
                }
            }
        }
        catch (e) {
            logger.error(colors.red(`error while updating dependencies:\n${e.stack}`), { timestamp: true, error: e });
            resolveEnqueuedProcessingPromises();
            // Reset missing deps, let the server rediscover the dependencies
            metadata.discovered = {};
        }
        currentlyProcessing = false;
        // @ts-expect-error `enqueuedRerun` could exist because `debouncedProcessing` may run while awaited
        enqueuedRerun?.();
    }
    function fullReload() {
        if (server) {
            // Cached transform results have stale imports (resolved to
            // old locations) so they need to be invalidated before the page is
            // reloaded.
            server.moduleGraph.invalidateAll();
            server.ws.send({
                type: 'full-reload',
                path: '*',
            });
        }
    }
    async function rerun() {
        // debounce time to wait for new missing deps finished, issue a new
        // optimization of deps (both old and newly found) once the previous
        // optimizeDeps processing is finished
        const deps = Object.keys(metadata.discovered);
        const depsString = depsLogString(deps);
        debug$3?.(colors.green(`new dependencies found: ${depsString}`));
        runOptimizer();
    }
    function getDiscoveredBrowserHash(hash, deps, missing) {
        return getHash(hash + JSON.stringify(deps) + JSON.stringify(missing) + sessionTimestamp);
    }
    function registerMissingImport(id, resolved) {
        const optimized = metadata.optimized[id];
        if (optimized) {
            return optimized;
        }
        const chunk = metadata.chunks[id];
        if (chunk) {
            return chunk;
        }
        let missing = metadata.discovered[id];
        if (missing) {
            // We are already discover this dependency
            // It will be processed in the next rerun call
            return missing;
        }
        missing = addMissingDep(id, resolved);
        // Until the first optimize run is called, avoid triggering processing
        // We'll wait until the user codebase is eagerly processed by Vite so
        // we can get a list of every missing dependency before giving to the
        // browser a dependency that may be outdated, thus avoiding full page reloads
        if (!crawlEndFinder) {
            if (isBuild) {
                logger.error('Vite Internal Error: Missing dependency found after crawling ended');
            }
            // Debounced rerun, let other missing dependencies be discovered before
            // the running next optimizeDeps
            debouncedProcessing();
        }
        // Return the path for the optimized bundle, this path is known before
        // esbuild is run to generate the pre-bundle
        return missing;
    }
    function addMissingDep(id, resolved) {
        newDepsDiscovered = true;
        return addOptimizedDepInfo(metadata, 'discovered', {
            id,
            file: getOptimizedDepPath(id, config, ssr),
            src: resolved,
            // Adding a browserHash to this missing dependency that is unique to
            // the current state of known + missing deps. If its optimizeDeps run
            // doesn't alter the bundled files of previous known dependencies,
            // we don't need a full reload and this browserHash will be kept
            browserHash: getDiscoveredBrowserHash(metadata.hash, depsFromOptimizedDepInfo(metadata.optimized), depsFromOptimizedDepInfo(metadata.discovered)),
            // loading of this pre-bundled dep needs to await for its processing
            // promise to be resolved
            processing: depOptimizationProcessing.promise,
            exportsData: extractExportsData(resolved, config, ssr),
        });
    }
    function debouncedProcessing(timeout = debounceMs) {
        if (!newDepsDiscovered) {
            return;
        }
        // Debounced rerun, let other missing dependencies be discovered before
        // the running next optimizeDeps
        enqueuedRerun = undefined;
        if (debounceProcessingHandle)
            clearTimeout(debounceProcessingHandle);
        if (newDepsToLogHandle)
            clearTimeout(newDepsToLogHandle);
        newDepsToLogHandle = undefined;
        debounceProcessingHandle = setTimeout(() => {
            debounceProcessingHandle = undefined;
            enqueuedRerun = rerun;
            if (!currentlyProcessing) {
                enqueuedRerun();
            }
        }, timeout);
    }
    // During dev, onCrawlEnd is called once when the server starts and all static
    // imports after the first request have been crawled (dynamic imports may also
    // be crawled if the browser requests them right away).
    // During build, onCrawlEnd will be called once after each buildStart (so in
    // watch mode it will be called after each rebuild has processed every module).
    // All modules are transformed first in this case (both static and dynamic).
    async function onCrawlEnd() {
        // On build time, a missing dep appearing after onCrawlEnd is an internal error
        // On dev, switch after this point to a simple debounce strategy
        crawlEndFinder = undefined;
        debug$3?.(colors.green(`✨ static imports crawl ended`));
        if (closed) {
            return;
        }
        const crawlDeps = Object.keys(metadata.discovered);
        // Await for the scan+optimize step running in the background
        // It normally should be over by the time crawling of user code ended
        await depsOptimizer.scanProcessing;
        if (!isBuild && optimizationResult) {
            const result = await optimizationResult.result;
            optimizationResult = undefined;
            currentlyProcessing = false;
            const scanDeps = Object.keys(result.metadata.optimized);
            if (scanDeps.length === 0 && crawlDeps.length === 0) {
                debug$3?.(colors.green(`✨ no dependencies found by the scanner or crawling static imports`));
                result.cancel();
                firstRunCalled = true;
                return;
            }
            const needsInteropMismatch = findInteropMismatches(metadata.discovered, result.metadata.optimized);
            const scannerMissedDeps = crawlDeps.some((dep) => !scanDeps.includes(dep));
            const outdatedResult = needsInteropMismatch.length > 0 || scannerMissedDeps;
            if (outdatedResult) {
                // Drop this scan result, and perform a new optimization to avoid a full reload
                result.cancel();
                // Add deps found by the scanner to the discovered deps while crawling
                for (const dep of scanDeps) {
                    if (!crawlDeps.includes(dep)) {
                        addMissingDep(dep, result.metadata.optimized[dep].src);
                    }
                }
                if (scannerMissedDeps) {
                    debug$3?.(colors.yellow(`✨ new dependencies were found while crawling that weren't detected by the scanner`));
                }
                debug$3?.(colors.green(`✨ re-running optimizer`));
                debouncedProcessing(0);
            }
            else {
                debug$3?.(colors.green(`✨ using post-scan optimizer result, the scanner found every used dependency`));
                startNextDiscoveredBatch();
                runOptimizer(result);
            }
        }
        else {
            currentlyProcessing = false;
            if (crawlDeps.length === 0) {
                debug$3?.(colors.green(`✨ no dependencies found while crawling the static imports`));
                firstRunCalled = true;
            }
            else {
                // queue the first optimizer run
                debouncedProcessing(0);
            }
        }
    }
    // Called during buildStart at build time, when build --watch is used.
    function resetRegisteredIds() {
        crawlEndFinder?.cancel();
        crawlEndFinder = setupOnCrawlEnd(onCrawlEnd);
    }
    function registerWorkersSource(id) {
        crawlEndFinder?.registerWorkersSource(id);
    }
    function delayDepsOptimizerUntil(id, done) {
        if (crawlEndFinder && !depsOptimizer.isOptimizedDepFile(id)) {
            crawlEndFinder.delayDepsOptimizerUntil(id, done);
        }
    }
    function ensureFirstRun() {
        crawlEndFinder?.ensureFirstRun();
    }
}
const callCrawlEndIfIdleAfterMs = 50;
function setupOnCrawlEnd(onCrawlEnd) {
    const registeredIds = new Set();
    const seenIds = new Set();
    const workersSources = new Set();
    let timeoutHandle;
    let cancelled = false;
    function cancel() {
        cancelled = true;
    }
    let crawlEndCalled = false;
    function callOnCrawlEnd() {
        if (!cancelled && !crawlEndCalled) {
            crawlEndCalled = true;
            onCrawlEnd();
        }
    }
    // If all the inputs are dependencies, we aren't going to get any
    // delayDepsOptimizerUntil(id) calls. We need to guard against this
    // by forcing a rerun if no deps have been registered
    let firstRunEnsured = false;
    function ensureFirstRun() {
        if (!firstRunEnsured && seenIds.size === 0) {
            setTimeout(() => {
                if (seenIds.size === 0) {
                    callOnCrawlEnd();
                }
            }, 200);
        }
        firstRunEnsured = true;
    }
    function registerWorkersSource(id) {
        workersSources.add(id);
        // Avoid waiting for this id, as it may be blocked by the rollup
        // bundling process of the worker that also depends on the optimizer
        registeredIds.delete(id);
        checkIfCrawlEndAfterTimeout();
    }
    function delayDepsOptimizerUntil(id, done) {
        if (!seenIds.has(id)) {
            seenIds.add(id);
            if (!workersSources.has(id)) {
                registeredIds.add(id);
                done()
                    .catch(() => { })
                    .finally(() => markIdAsDone(id));
            }
        }
    }
    function markIdAsDone(id) {
        registeredIds.delete(id);
        checkIfCrawlEndAfterTimeout();
    }
    function checkIfCrawlEndAfterTimeout() {
        if (cancelled || registeredIds.size > 0)
            return;
        if (timeoutHandle)
            clearTimeout(timeoutHandle);
        timeoutHandle = setTimeout(callOnCrawlEndWhenIdle, callCrawlEndIfIdleAfterMs);
    }
    async function callOnCrawlEndWhenIdle() {
        if (cancelled || registeredIds.size > 0)
            return;
        callOnCrawlEnd();
    }
    return {
        ensureFirstRun,
        registerWorkersSource,
        delayDepsOptimizerUntil,
        cancel,
    };
}
async function createDevSsrDepsOptimizer(config) {
    const metadata = await optimizeServerSsrDeps(config);
    const depsOptimizer = {
        metadata,
        isOptimizedDepFile: createIsOptimizedDepFile(config),
        isOptimizedDepUrl: createIsOptimizedDepUrl(config),
        getOptimizedDepId: (depInfo) => `${depInfo.file}?v=${depInfo.browserHash}`,
        registerMissingImport: () => {
            throw new Error('Vite Internal Error: registerMissingImport is not supported in dev SSR');
        },
        // noop, there is no scanning during dev SSR
        // the optimizer blocks the server start
        run: () => { },
        registerWorkersSource: (id) => { },
        delayDepsOptimizerUntil: (id, done) => { },
        resetRegisteredIds: () => { },
        ensureFirstRun: () => { },
        close: async () => { },
        options: config.ssr.optimizeDeps,
    };
    devSsrDepsOptimizerMap.set(config, depsOptimizer);
}
function findInteropMismatches(discovered, optimized) {
    const needsInteropMismatch = [];
    for (const dep in discovered) {
        const discoveredDepInfo = discovered[dep];
        const depInfo = optimized[dep];
        if (depInfo) {
            if (discoveredDepInfo.needsInterop !== undefined &&
                depInfo.needsInterop !== discoveredDepInfo.needsInterop) {
                // This only happens when a discovered dependency has mixed ESM and CJS syntax
                // and it hasn't been manually added to optimizeDeps.needsInterop
                needsInteropMismatch.push(dep);
                debug$3?.(colors.cyan(`✨ needsInterop mismatch detected for ${dep}`));
            }
        }
    }
    return needsInteropMismatch;
}

const debug$2 = createDebugger('vite:deps');
const jsExtensionRE = /\.js$/i;
const jsMapExtensionRE = /\.js\.map$/i;
/**
 * Scan and optimize dependencies within a project.
 * Used by Vite CLI when running `vite optimize`.
 */
async function optimizeDeps(config, force = config.optimizeDeps.force, asCommand = false) {
    const log = asCommand ? config.logger.info : debug$2;
    const ssr = config.command === 'build' && !!config.build.ssr;
    const cachedMetadata = await loadCachedDepOptimizationMetadata(config, ssr, force, asCommand);
    if (cachedMetadata) {
        return cachedMetadata;
    }
    const deps = await discoverProjectDependencies(config).result;
    const depsString = depsLogString(Object.keys(deps));
    log?.(colors.green(`Optimizing dependencies:\n  ${depsString}`));
    await addManuallyIncludedOptimizeDeps(deps, config, ssr);
    const depsInfo = toDiscoveredDependencies(config, deps, ssr);
    const result = await runOptimizeDeps(config, depsInfo).result;
    await result.commit();
    return result.metadata;
}
async function optimizeServerSsrDeps(config) {
    const ssr = true;
    const cachedMetadata = await loadCachedDepOptimizationMetadata(config, ssr, config.optimizeDeps.force, false);
    if (cachedMetadata) {
        return cachedMetadata;
    }
    let alsoInclude;
    let noExternalFilter;
    const { exclude } = getDepOptimizationConfig(config, ssr);
    const noExternal = config.ssr?.noExternal;
    if (noExternal) {
        alsoInclude = arraify(noExternal).filter((ne) => typeof ne === 'string');
        noExternalFilter =
            noExternal === true
                ? (dep) => true
                : createFilter$1(undefined, exclude, {
                    resolve: false,
                });
    }
    const deps = {};
    await addManuallyIncludedOptimizeDeps(deps, config, ssr, alsoInclude, noExternalFilter);
    const depsInfo = toDiscoveredDependencies(config, deps, true);
    const result = await runOptimizeDeps(config, depsInfo, true).result;
    await result.commit();
    return result.metadata;
}
function initDepsOptimizerMetadata(config, ssr, timestamp) {
    const hash = getDepHash(config, ssr);
    return {
        hash,
        browserHash: getOptimizedBrowserHash(hash, {}, timestamp),
        optimized: {},
        chunks: {},
        discovered: {},
        depInfoList: [],
    };
}
function addOptimizedDepInfo(metadata, type, depInfo) {
    metadata[type][depInfo.id] = depInfo;
    metadata.depInfoList.push(depInfo);
    return depInfo;
}
let firstLoadCachedDepOptimizationMetadata = true;
/**
 * Creates the initial dep optimization metadata, loading it from the deps cache
 * if it exists and pre-bundling isn't forced
 */
async function loadCachedDepOptimizationMetadata(config, ssr, force = config.optimizeDeps.force, asCommand = false) {
    const log = asCommand ? config.logger.info : debug$2;
    if (firstLoadCachedDepOptimizationMetadata) {
        firstLoadCachedDepOptimizationMetadata = false;
        // Fire up a clean up of stale processing deps dirs if older process exited early
        setTimeout(() => cleanupDepsCacheStaleDirs(config), 0);
    }
    const depsCacheDir = getDepsCacheDir(config, ssr);
    if (!force) {
        let cachedMetadata;
        try {
            const cachedMetadataPath = path.join(depsCacheDir, '_metadata.json');
            cachedMetadata = parseDepsOptimizerMetadata(await fsp.readFile(cachedMetadataPath, 'utf-8'), depsCacheDir);
        }
        catch (e) { }
        // hash is consistent, no need to re-bundle
        if (cachedMetadata && cachedMetadata.hash === getDepHash(config, ssr)) {
            log?.('Hash is consistent. Skipping. Use --force to override.');
            // Nothing to commit or cancel as we are using the cache, we only
            // need to resolve the processing promise so requests can move on
            return cachedMetadata;
        }
    }
    else {
        config.logger.info('Forced re-optimization of dependencies');
    }
    // Start with a fresh cache
    await fsp.rm(depsCacheDir, { recursive: true, force: true });
}
/**
 * Initial optimizeDeps at server start. Perform a fast scan using esbuild to
 * find deps to pre-bundle and include user hard-coded dependencies
 */
function discoverProjectDependencies(config) {
    const { cancel, result } = scanImports(config);
    return {
        cancel,
        result: result.then(({ deps, missing }) => {
            const missingIds = Object.keys(missing);
            if (missingIds.length) {
                throw new Error(`The following dependencies are imported but could not be resolved:\n\n  ${missingIds
                    .map((id) => `${colors.cyan(id)} ${colors.white(colors.dim(`(imported by ${missing[id]})`))}`)
                    .join(`\n  `)}\n\nAre they installed?`);
            }
            return deps;
        }),
    };
}
function toDiscoveredDependencies(config, deps, ssr, timestamp) {
    const browserHash = getOptimizedBrowserHash(getDepHash(config, ssr), deps, timestamp);
    const discovered = {};
    for (const id in deps) {
        const src = deps[id];
        discovered[id] = {
            id,
            file: getOptimizedDepPath(id, config, ssr),
            src,
            browserHash: browserHash,
            exportsData: extractExportsData(src, config, ssr),
        };
    }
    return discovered;
}
function depsLogString(qualifiedIds) {
    return colors.yellow(qualifiedIds.join(`, `));
}
/**
 * Internally, Vite uses this function to prepare a optimizeDeps run. When Vite starts, we can get
 * the metadata and start the server without waiting for the optimizeDeps processing to be completed
 */
function runOptimizeDeps(resolvedConfig, depsInfo, ssr = resolvedConfig.command === 'build' &&
    !!resolvedConfig.build.ssr) {
    const optimizerContext = { cancelled: false };
    const config = {
        ...resolvedConfig,
        command: 'build',
    };
    const depsCacheDir = getDepsCacheDir(resolvedConfig, ssr);
    const processingCacheDir = getProcessingDepsCacheDir(resolvedConfig, ssr);
    // Create a temporal directory so we don't need to delete optimized deps
    // until they have been processed. This also avoids leaving the deps cache
    // directory in a corrupted state if there is an error
    fs.mkdirSync(processingCacheDir, { recursive: true });
    // a hint for Node.js
    // all files in the cache directory should be recognized as ES modules
    fs.writeFileSync(path.resolve(processingCacheDir, 'package.json'), `{\n  "type": "module"\n}\n`);
    const metadata = initDepsOptimizerMetadata(config, ssr);
    metadata.browserHash = getOptimizedBrowserHash(metadata.hash, depsFromOptimizedDepInfo(depsInfo));
    // We prebundle dependencies with esbuild and cache them, but there is no need
    // to wait here. Code that needs to access the cached deps needs to await
    // the optimizedDepInfo.processing promise for each dep
    const qualifiedIds = Object.keys(depsInfo);
    let cleaned = false;
    let committed = false;
    const cleanUp = () => {
        // If commit was already called, ignore the clean up even if a cancel was requested
        // This minimizes the chances of leaving the deps cache in a corrupted state
        if (!cleaned && !committed) {
            cleaned = true;
            // No need to wait, we can clean up in the background because temp folders
            // are unique per run
            fsp.rm(processingCacheDir, { recursive: true, force: true }).catch(() => {
                // Ignore errors
            });
        }
    };
    const succesfulResult = {
        metadata,
        cancel: cleanUp,
        commit: async () => {
            if (cleaned) {
                throw new Error('Can not commit a Deps Optimization run as it was cancelled');
            }
            // Ignore clean up requests after this point so the temp folder isn't deleted before
            // we finish commiting the new deps cache files to the deps folder
            committed = true;
            // Write metadata file, then commit the processing folder to the global deps cache
            // Rewire the file paths from the temporal processing dir to the final deps cache dir
            const dataPath = path.join(processingCacheDir, '_metadata.json');
            fs.writeFileSync(dataPath, stringifyDepsOptimizerMetadata(metadata, depsCacheDir));
            // In order to minimize the time where the deps folder isn't in a consistent state,
            // we first rename the old depsCacheDir to a temporal path, then we rename the
            // new processing cache dir to the depsCacheDir. In systems where doing so in sync
            // is safe, we do an atomic operation (at least for this thread). For Windows, we
            // found there are cases where the rename operation may finish before it's done
            // so we do a graceful rename checking that the folder has been properly renamed.
            // We found that the rename-rename (then delete the old folder in the background)
            // is safer than a delete-rename operation.
            const temporalPath = depsCacheDir + getTempSuffix();
            const depsCacheDirPresent = fs.existsSync(depsCacheDir);
            if (isWindows) {
                if (depsCacheDirPresent)
                    await safeRename(depsCacheDir, temporalPath);
                await safeRename(processingCacheDir, depsCacheDir);
            }
            else {
                if (depsCacheDirPresent)
                    fs.renameSync(depsCacheDir, temporalPath);
                fs.renameSync(processingCacheDir, depsCacheDir);
            }
            // Delete temporal path in the background
            if (depsCacheDirPresent)
                fsp.rm(temporalPath, { recursive: true, force: true });
        },
    };
    if (!qualifiedIds.length) {
        // No deps to optimize, we still commit the processing cache dir to remove
        // the previous optimized deps if they exist, and let the next server start
        // skip the scanner step if the lockfile hasn't changed
        return {
            cancel: async () => cleanUp(),
            result: Promise.resolve(succesfulResult),
        };
    }
    const cancelledResult = {
        metadata,
        commit: async () => cleanUp(),
        cancel: cleanUp,
    };
    const start = performance.now();
    const preparedRun = prepareEsbuildOptimizerRun(resolvedConfig, depsInfo, ssr, processingCacheDir, optimizerContext);
    const runResult = preparedRun.then(({ context, idToExports }) => {
        function disposeContext() {
            return context?.dispose().catch((e) => {
                config.logger.error('Failed to dispose esbuild context', { error: e });
            });
        }
        if (!context || optimizerContext.cancelled) {
            disposeContext();
            return cancelledResult;
        }
        return context
            .rebuild()
            .then((result) => {
            const meta = result.metafile;
            // the paths in `meta.outputs` are relative to `process.cwd()`
            const processingCacheDirOutputPath = path.relative(process.cwd(), processingCacheDir);
            for (const id in depsInfo) {
                const output = esbuildOutputFromId(meta.outputs, id, processingCacheDir);
                const { exportsData, ...info } = depsInfo[id];
                addOptimizedDepInfo(metadata, 'optimized', {
                    ...info,
                    // We only need to hash the output.imports in to check for stability, but adding the hash
                    // and file path gives us a unique hash that may be useful for other things in the future
                    fileHash: getHash(metadata.hash +
                        depsInfo[id].file +
                        JSON.stringify(output.imports)),
                    browserHash: metadata.browserHash,
                    // After bundling we have more information and can warn the user about legacy packages
                    // that require manual configuration
                    needsInterop: needsInterop(config, ssr, id, idToExports[id], output),
                });
            }
            for (const o of Object.keys(meta.outputs)) {
                if (!o.match(jsMapExtensionRE)) {
                    const id = path
                        .relative(processingCacheDirOutputPath, o)
                        .replace(jsExtensionRE, '');
                    const file = getOptimizedDepPath(id, resolvedConfig, ssr);
                    if (!findOptimizedDepInfoInRecord(metadata.optimized, (depInfo) => depInfo.file === file)) {
                        addOptimizedDepInfo(metadata, 'chunks', {
                            id,
                            file,
                            needsInterop: false,
                            browserHash: metadata.browserHash,
                        });
                    }
                }
            }
            debug$2?.(`Dependencies bundled in ${(performance.now() - start).toFixed(2)}ms`);
            return succesfulResult;
        })
            .catch((e) => {
            if (e.errors && e.message.includes('The build was canceled')) {
                // esbuild logs an error when cancelling, but this is expected so
                // return an empty result instead
                return cancelledResult;
            }
            throw e;
        })
            .finally(() => {
            return disposeContext();
        });
    });
    runResult.catch(() => {
        cleanUp();
    });
    return {
        async cancel() {
            optimizerContext.cancelled = true;
            const { context } = await preparedRun;
            await context?.cancel();
            cleanUp();
        },
        result: runResult,
    };
}
async function prepareEsbuildOptimizerRun(resolvedConfig, depsInfo, ssr, processingCacheDir, optimizerContext) {
    const isBuild = resolvedConfig.command === 'build';
    const config = {
        ...resolvedConfig,
        command: 'build',
    };
    // esbuild generates nested directory output with lowest common ancestor base
    // this is unpredictable and makes it difficult to analyze entry / output
    // mapping. So what we do here is:
    // 1. flatten all ids to eliminate slash
    // 2. in the plugin, read the entry ourselves as virtual files to retain the
    //    path.
    const flatIdDeps = {};
    const idToExports = {};
    const optimizeDeps = getDepOptimizationConfig(config, ssr);
    const { plugins: pluginsFromConfig = [], ...esbuildOptions } = optimizeDeps?.esbuildOptions ?? {};
    await Promise.all(Object.keys(depsInfo).map(async (id) => {
        const src = depsInfo[id].src;
        const exportsData = await (depsInfo[id].exportsData ??
            extractExportsData(src, config, ssr));
        if (exportsData.jsxLoader && !esbuildOptions.loader?.['.js']) {
            // Ensure that optimization won't fail by defaulting '.js' to the JSX parser.
            // This is useful for packages such as Gatsby.
            esbuildOptions.loader = {
                '.js': 'jsx',
                ...esbuildOptions.loader,
            };
        }
        const flatId = flattenId(id);
        flatIdDeps[flatId] = src;
        idToExports[id] = exportsData;
    }));
    if (optimizerContext.cancelled)
        return { context: undefined, idToExports };
    // esbuild automatically replaces process.env.NODE_ENV for platform 'browser'
    // In lib mode, we need to keep process.env.NODE_ENV untouched, so to at build
    // time we replace it by __vite_process_env_NODE_ENV. This placeholder will be
    // later replaced by the define plugin
    const define = {
        'process.env.NODE_ENV': isBuild
            ? '__vite_process_env_NODE_ENV'
            : JSON.stringify(process.env.NODE_ENV || config.mode),
    };
    const platform = ssr && config.ssr?.target !== 'webworker' ? 'node' : 'browser';
    const external = [...(optimizeDeps?.exclude ?? [])];
    if (isBuild) {
        let rollupOptionsExternal = config?.build?.rollupOptions?.external;
        if (rollupOptionsExternal) {
            if (typeof rollupOptionsExternal === 'string') {
                rollupOptionsExternal = [rollupOptionsExternal];
            }
            // TODO: decide whether to support RegExp and function options
            // They're not supported yet because `optimizeDeps.exclude` currently only accepts strings
            if (!Array.isArray(rollupOptionsExternal) ||
                rollupOptionsExternal.some((ext) => typeof ext !== 'string')) {
                throw new Error(`[vite] 'build.rollupOptions.external' can only be an array of strings or a string when using esbuild optimization at build time.`);
            }
            external.push(...rollupOptionsExternal);
        }
    }
    const plugins = [...pluginsFromConfig];
    if (external.length) {
        plugins.push(esbuildCjsExternalPlugin(external, platform));
    }
    plugins.push(esbuildDepPlugin(flatIdDeps, external, config, ssr));
    const context = await esbuild.context({
        absWorkingDir: process.cwd(),
        entryPoints: Object.keys(flatIdDeps),
        bundle: true,
        // We can't use platform 'neutral', as esbuild has custom handling
        // when the platform is 'node' or 'browser' that can't be emulated
        // by using mainFields and conditions
        platform,
        define,
        format: 'esm',
        // See https://github.com/evanw/esbuild/issues/1921#issuecomment-1152991694
        banner: platform === 'node'
            ? {
                js: `import { createRequire } from 'module';const require = createRequire(import.meta.url);`,
            }
            : undefined,
        target: isBuild ? config.build.target || undefined : ESBUILD_MODULES_TARGET,
        external,
        logLevel: 'error',
        splitting: true,
        sourcemap: true,
        outdir: processingCacheDir,
        ignoreAnnotations: !isBuild,
        metafile: true,
        plugins,
        charset: 'utf8',
        ...esbuildOptions,
        supported: {
            'dynamic-import': true,
            'import-meta': true,
            ...esbuildOptions.supported,
        },
    });
    return { context, idToExports };
}
async function findKnownImports(config, ssr) {
    const { deps } = await scanImports(config).result;
    await addManuallyIncludedOptimizeDeps(deps, config, ssr);
    return Object.keys(deps);
}
async function addManuallyIncludedOptimizeDeps(deps, config, ssr, extra = [], filter) {
    const { logger } = config;
    const optimizeDeps = getDepOptimizationConfig(config, ssr);
    const optimizeDepsInclude = optimizeDeps?.include ?? [];
    if (optimizeDepsInclude.length || extra.length) {
        const unableToOptimize = (id, msg) => {
            if (optimizeDepsInclude.includes(id)) {
                logger.warn(`${msg}: ${colors.cyan(id)}, present in '${ssr ? 'ssr.' : ''}optimizeDeps.include'`);
            }
        };
        const includes = [...optimizeDepsInclude, ...extra];
        for (let i = 0; i < includes.length; i++) {
            const id = includes[i];
            if (glob.isDynamicPattern(id)) {
                const globIds = expandGlobIds(id, config);
                includes.splice(i, 1, ...globIds);
                i += globIds.length - 1;
            }
        }
        const resolve = createOptimizeDepsIncludeResolver(config, ssr);
        for (const id of includes) {
            // normalize 'foo   >bar` as 'foo > bar' to prevent same id being added
            // and for pretty printing
            const normalizedId = normalizeId(id);
            if (!deps[normalizedId] && filter?.(normalizedId) !== false) {
                const entry = await resolve(id);
                if (entry) {
                    if (isOptimizable(entry, optimizeDeps)) {
                        if (!entry.endsWith('?__vite_skip_optimization')) {
                            deps[normalizedId] = entry;
                        }
                    }
                    else {
                        unableToOptimize(id, 'Cannot optimize dependency');
                    }
                }
                else {
                    unableToOptimize(id, 'Failed to resolve dependency');
                }
            }
        }
    }
}
function newDepOptimizationProcessing() {
    let resolve;
    const promise = new Promise((_resolve) => {
        resolve = _resolve;
    });
    return { promise, resolve: resolve };
}
// Convert to { id: src }
function depsFromOptimizedDepInfo(depsInfo) {
    return Object.fromEntries(Object.entries(depsInfo).map((d) => [d[0], d[1].src]));
}
function getOptimizedDepPath(id, config, ssr) {
    return normalizePath(path.resolve(getDepsCacheDir(config, ssr), flattenId(id) + '.js'));
}
function getDepsCacheSuffix(config, ssr) {
    let suffix = '';
    if (config.command === 'build') {
        // Differentiate build caches depending on outDir to allow parallel builds
        const { outDir } = config.build;
        const buildId = outDir.length > 8 || outDir.includes('/') ? getHash(outDir) : outDir;
        suffix += `_build-${buildId}`;
    }
    if (ssr) {
        suffix += '_ssr';
    }
    return suffix;
}
function getDepsCacheDir(config, ssr) {
    return getDepsCacheDirPrefix(config) + getDepsCacheSuffix(config, ssr);
}
function getProcessingDepsCacheDir(config, ssr) {
    return (getDepsCacheDirPrefix(config) +
        getDepsCacheSuffix(config, ssr) +
        getTempSuffix());
}
function getTempSuffix() {
    return ('_temp_' +
        getHash(`${process.pid}:${Date.now().toString()}:${Math.random()
            .toString(16)
            .slice(2)}`));
}
function getDepsCacheDirPrefix(config) {
    return normalizePath(path.resolve(config.cacheDir, 'deps'));
}
function createIsOptimizedDepFile(config) {
    const depsCacheDirPrefix = getDepsCacheDirPrefix(config);
    return (id) => id.startsWith(depsCacheDirPrefix);
}
function createIsOptimizedDepUrl(config) {
    const { root } = config;
    const depsCacheDir = getDepsCacheDirPrefix(config);
    // determine the url prefix of files inside cache directory
    const depsCacheDirRelative = normalizePath(path.relative(root, depsCacheDir));
    const depsCacheDirPrefix = depsCacheDirRelative.startsWith('../')
        ? // if the cache directory is outside root, the url prefix would be something
            // like '/@fs/absolute/path/to/node_modules/.vite'
            `/@fs/${removeLeadingSlash(normalizePath(depsCacheDir))}`
        : // if the cache directory is inside root, the url prefix would be something
            // like '/node_modules/.vite'
            `/${depsCacheDirRelative}`;
    return function isOptimizedDepUrl(url) {
        return url.startsWith(depsCacheDirPrefix);
    };
}
function parseDepsOptimizerMetadata(jsonMetadata, depsCacheDir) {
    const { hash, browserHash, optimized, chunks } = JSON.parse(jsonMetadata, (key, value) => {
        // Paths can be absolute or relative to the deps cache dir where
        // the _metadata.json is located
        if (key === 'file' || key === 'src') {
            return normalizePath(path.resolve(depsCacheDir, value));
        }
        return value;
    });
    if (!chunks ||
        Object.values(optimized).some((depInfo) => !depInfo.fileHash)) {
        // outdated _metadata.json version, ignore
        return;
    }
    const metadata = {
        hash,
        browserHash,
        optimized: {},
        discovered: {},
        chunks: {},
        depInfoList: [],
    };
    for (const id of Object.keys(optimized)) {
        addOptimizedDepInfo(metadata, 'optimized', {
            ...optimized[id],
            id,
            browserHash,
        });
    }
    for (const id of Object.keys(chunks)) {
        addOptimizedDepInfo(metadata, 'chunks', {
            ...chunks[id],
            id,
            browserHash,
            needsInterop: false,
        });
    }
    return metadata;
}
/**
 * Stringify metadata for deps cache. Remove processing promises
 * and individual dep info browserHash. Once the cache is reload
 * the next time the server start we need to use the global
 * browserHash to allow long term caching
 */
function stringifyDepsOptimizerMetadata(metadata, depsCacheDir) {
    const { hash, browserHash, optimized, chunks } = metadata;
    return JSON.stringify({
        hash,
        browserHash,
        optimized: Object.fromEntries(Object.values(optimized).map(({ id, src, file, fileHash, needsInterop }) => [
            id,
            {
                src,
                file,
                fileHash,
                needsInterop,
            },
        ])),
        chunks: Object.fromEntries(Object.values(chunks).map(({ id, file }) => [id, { file }])),
    }, (key, value) => {
        // Paths can be absolute or relative to the deps cache dir where
        // the _metadata.json is located
        if (key === 'file' || key === 'src') {
            return normalizePath(path.relative(depsCacheDir, value));
        }
        return value;
    }, 2);
}
function esbuildOutputFromId(outputs, id, cacheDirOutputPath) {
    const cwd = process.cwd();
    const flatId = flattenId(id) + '.js';
    const normalizedOutputPath = normalizePath(path.relative(cwd, path.join(cacheDirOutputPath, flatId)));
    const output = outputs[normalizedOutputPath];
    if (output) {
        return output;
    }
    // If the root dir was symlinked, esbuild could return output keys as `../cwd/`
    // Normalize keys to support this case too
    for (const [key, value] of Object.entries(outputs)) {
        if (normalizePath(path.relative(cwd, key)) === normalizedOutputPath) {
            return value;
        }
    }
}
async function extractExportsData(filePath, config, ssr) {
    await init;
    const optimizeDeps = getDepOptimizationConfig(config, ssr);
    const esbuildOptions = optimizeDeps?.esbuildOptions ?? {};
    if (optimizeDeps.extensions?.some((ext) => filePath.endsWith(ext))) {
        // For custom supported extensions, build the entry file to transform it into JS,
        // and then parse with es-module-lexer. Note that the `bundle` option is not `true`,
        // so only the entry file is being transformed.
        const result = await build$2({
            ...esbuildOptions,
            entryPoints: [filePath],
            write: false,
            format: 'esm',
        });
        const [imports, exports] = parse$3(result.outputFiles[0].text);
        return {
            hasImports: imports.length > 0,
            exports: exports.map((e) => e.n),
        };
    }
    let parseResult;
    let usedJsxLoader = false;
    const entryContent = await fsp.readFile(filePath, 'utf-8');
    try {
        parseResult = parse$3(entryContent);
    }
    catch {
        const loader = esbuildOptions.loader?.[path.extname(filePath)] || 'jsx';
        debug$2?.(`Unable to parse: ${filePath}.\n Trying again with a ${loader} transform.`);
        const transformed = await transformWithEsbuild(entryContent, filePath, {
            loader,
        });
        parseResult = parse$3(transformed.code);
        usedJsxLoader = true;
    }
    const [imports, exports] = parseResult;
    const exportsData = {
        hasImports: imports.length > 0,
        exports: exports.map((e) => e.n),
        jsxLoader: usedJsxLoader,
    };
    return exportsData;
}
function needsInterop(config, ssr, id, exportsData, output) {
    if (getDepOptimizationConfig(config, ssr)?.needsInterop?.includes(id)) {
        return true;
    }
    const { hasImports, exports } = exportsData;
    // entry has no ESM syntax - likely CJS or UMD
    if (!exports.length && !hasImports) {
        return true;
    }
    if (output) {
        // if a peer dependency used require() on an ESM dependency, esbuild turns the
        // ESM dependency's entry chunk into a single default export... detect
        // such cases by checking exports mismatch, and force interop.
        const generatedExports = output.exports;
        if (!generatedExports ||
            (isSingleDefaultExport(generatedExports) &&
                !isSingleDefaultExport(exports))) {
            return true;
        }
    }
    return false;
}
function isSingleDefaultExport(exports) {
    return exports.length === 1 && exports[0] === 'default';
}
const lockfileFormats = [
    { name: 'package-lock.json', checkPatches: true, manager: 'npm' },
    { name: 'yarn.lock', checkPatches: true, manager: 'yarn' },
    { name: 'pnpm-lock.yaml', checkPatches: false, manager: 'pnpm' },
    { name: 'bun.lockb', checkPatches: true, manager: 'bun' },
].sort((_, { manager }) => {
    return process.env.npm_config_user_agent?.startsWith(manager) ? 1 : -1;
});
const lockfileNames = lockfileFormats.map((l) => l.name);
function getDepHash(config, ssr) {
    const lockfilePath = lookupFile(config.root, lockfileNames);
    let content = lockfilePath ? fs.readFileSync(lockfilePath, 'utf-8') : '';
    if (lockfilePath) {
        const lockfileName = path.basename(lockfilePath);
        const { checkPatches } = lockfileFormats.find((f) => f.name === lockfileName);
        if (checkPatches) {
            // Default of https://github.com/ds300/patch-package
            const fullPath = path.join(path.dirname(lockfilePath), 'patches');
            const stat = tryStatSync(fullPath);
            if (stat?.isDirectory()) {
                content += stat.mtimeMs.toString();
            }
        }
    }
    // also take config into account
    // only a subset of config options that can affect dep optimization
    const optimizeDeps = getDepOptimizationConfig(config, ssr);
    content += JSON.stringify({
        mode: process.env.NODE_ENV || config.mode,
        root: config.root,
        resolve: config.resolve,
        buildTarget: config.build.target,
        assetsInclude: config.assetsInclude,
        plugins: config.plugins.map((p) => p.name),
        optimizeDeps: {
            include: optimizeDeps?.include,
            exclude: optimizeDeps?.exclude,
            esbuildOptions: {
                ...optimizeDeps?.esbuildOptions,
                plugins: optimizeDeps?.esbuildOptions?.plugins?.map((p) => p.name),
            },
        },
    }, (_, value) => {
        if (typeof value === 'function' || value instanceof RegExp) {
            return value.toString();
        }
        return value;
    });
    return getHash(content);
}
function getOptimizedBrowserHash(hash, deps, timestamp = '') {
    return getHash(hash + JSON.stringify(deps) + timestamp);
}
function optimizedDepInfoFromId(metadata, id) {
    return (metadata.optimized[id] || metadata.discovered[id] || metadata.chunks[id]);
}
function optimizedDepInfoFromFile(metadata, file) {
    return metadata.depInfoList.find((depInfo) => depInfo.file === file);
}
function findOptimizedDepInfoInRecord(dependenciesInfo, callbackFn) {
    for (const o of Object.keys(dependenciesInfo)) {
        const info = dependenciesInfo[o];
        if (callbackFn(info, o)) {
            return info;
        }
    }
}
async function optimizedDepNeedsInterop(metadata, file, config, ssr) {
    const depInfo = optimizedDepInfoFromFile(metadata, file);
    if (depInfo?.src && depInfo.needsInterop === undefined) {
        depInfo.exportsData ?? (depInfo.exportsData = extractExportsData(depInfo.src, config, ssr));
        depInfo.needsInterop = needsInterop(config, ssr, depInfo.id, await depInfo.exportsData);
    }
    return depInfo?.needsInterop;
}
const MAX_TEMP_DIR_AGE_MS = 24 * 60 * 60 * 1000;
async function cleanupDepsCacheStaleDirs(config) {
    try {
        const cacheDir = path.resolve(config.cacheDir);
        if (fs.existsSync(cacheDir)) {
            const dirents = await fsp.readdir(cacheDir, { withFileTypes: true });
            for (const dirent of dirents) {
                if (dirent.isDirectory() && dirent.name.includes('_temp_')) {
                    const tempDirPath = path.resolve(config.cacheDir, dirent.name);
                    const stats = await fsp.stat(tempDirPath).catch((_) => null);
                    if (stats?.mtime &&
                        Date.now() - stats.mtime.getTime() > MAX_TEMP_DIR_AGE_MS) {
                        await fsp.rm(tempDirPath, { recursive: true, force: true });
                    }
                }
            }
        }
    }
    catch (err) {
        config.logger.error(err);
    }
}
// We found issues with renaming folders in some systems. This is a custom
// implementation for the optimizer. It isn't intended to be a general utility
// Based on node-graceful-fs
// The ISC License
// Copyright (c) 2011-2022 Isaac Z. Schlueter, Ben Noordhuis, and Contributors
// https://github.com/isaacs/node-graceful-fs/blob/main/LICENSE
// On Windows, A/V software can lock the directory, causing this
// to fail with an EACCES or EPERM if the directory contains newly
// created files. The original tried for up to 60 seconds, we only
// wait for 5 seconds, as a longer time would be seen as an error
const GRACEFUL_RENAME_TIMEOUT = 5000;
const safeRename = promisify(function gracefulRename(from, to, cb) {
    const start = Date.now();
    let backoff = 0;
    fs.rename(from, to, function CB(er) {
        if (er &&
            (er.code === 'EACCES' || er.code === 'EPERM') &&
            Date.now() - start < GRACEFUL_RENAME_TIMEOUT) {
            setTimeout(function () {
                fs.stat(to, function (stater, st) {
                    if (stater && stater.code === 'ENOENT')
                        fs.rename(from, to, CB);
                    else
                        CB(er);
                });
            }, backoff);
            if (backoff < 100)
                backoff += 10;
            return;
        }
        if (cb)
            cb(er);
    });
});

var index$1 = {
    __proto__: null,
    addManuallyIncludedOptimizeDeps: addManuallyIncludedOptimizeDeps,
    addOptimizedDepInfo: addOptimizedDepInfo,
    cleanupDepsCacheStaleDirs: cleanupDepsCacheStaleDirs,
    createIsOptimizedDepFile: createIsOptimizedDepFile,
    createIsOptimizedDepUrl: createIsOptimizedDepUrl,
    depsFromOptimizedDepInfo: depsFromOptimizedDepInfo,
    depsLogString: depsLogString,
    discoverProjectDependencies: discoverProjectDependencies,
    extractExportsData: extractExportsData,
    findKnownImports: findKnownImports,
    getDepHash: getDepHash,
    getDepsCacheDir: getDepsCacheDir,
    getDepsOptimizer: getDepsOptimizer,
    getOptimizedDepPath: getOptimizedDepPath,
    initDepsOptimizer: initDepsOptimizer,
    initDepsOptimizerMetadata: initDepsOptimizerMetadata,
    initDevSsrDepsOptimizer: initDevSsrDepsOptimizer,
    loadCachedDepOptimizationMetadata: loadCachedDepOptimizationMetadata,
    newDepOptimizationProcessing: newDepOptimizationProcessing,
    optimizeDeps: optimizeDeps,
    optimizeServerSsrDeps: optimizeServerSsrDeps,
    optimizedDepInfoFromFile: optimizedDepInfoFromFile,
    optimizedDepInfoFromId: optimizedDepInfoFromId,
    optimizedDepNeedsInterop: optimizedDepNeedsInterop,
    runOptimizeDeps: runOptimizeDeps,
    toDiscoveredDependencies: toDiscoveredDependencies
};

/**
 * A flag for injected helpers. This flag will be set to `false` if the output
 * target is not native es - so that injected helper logic can be conditionally
 * dropped.
 */
const isModernFlag = `__VITE_IS_MODERN__`;
const preloadMethod = `__vitePreload`;
const preloadMarker = `__VITE_PRELOAD__`;
const preloadHelperId = '\0vite/preload-helper';
const preloadMarkerWithQuote = new RegExp(`['"]${preloadMarker}['"]`);
const dynamicImportPrefixRE = /import\s*\(/;
// TODO: abstract
const optimizedDepChunkRE = /\/chunk-[A-Z\d]{8}\.js/;
const optimizedDepDynamicRE = /-[A-Z\d]{8}\.js/;
function toRelativePath(filename, importer) {
    const relPath = path.relative(path.dirname(importer), filename);
    return relPath[0] === '.' ? relPath : `./${relPath}`;
}
function indexOfMatchInSlice(str, reg, pos = 0) {
    if (pos !== 0) {
        str = str.slice(pos);
    }
    const matcher = str.match(reg);
    return matcher?.index !== undefined ? matcher.index + pos : -1;
}
/**
 * Helper for preloading CSS and direct imports of async chunks in parallel to
 * the async chunk itself.
 */
function detectScriptRel() {
    const relList = document.createElement('link').relList;
    return relList && relList.supports && relList.supports('modulepreload')
        ? 'modulepreload'
        : 'preload';
}
function preload(baseModule, deps, importerUrl) {
    // @ts-expect-error __VITE_IS_MODERN__ will be replaced with boolean later
    if (!__VITE_IS_MODERN__ || !deps || deps.length === 0) {
        return baseModule();
    }
    const links = document.getElementsByTagName('link');
    return Promise.all(deps.map((dep) => {
        // @ts-expect-error assetsURL is declared before preload.toString()
        dep = assetsURL(dep, importerUrl);
        if (dep in seen)
            return;
        seen[dep] = true;
        const isCss = dep.endsWith('.css');
        const cssSelector = isCss ? '[rel="stylesheet"]' : '';
        const isBaseRelative = !!importerUrl;
        // check if the file is already preloaded by SSR markup
        if (isBaseRelative) {
            // When isBaseRelative is true then we have `importerUrl` and `dep` is
            // already converted to an absolute URL by the `assetsURL` function
            for (let i = links.length - 1; i >= 0; i--) {
                const link = links[i];
                // The `links[i].href` is an absolute URL thanks to browser doing the work
                // for us. See https://html.spec.whatwg.org/multipage/common-dom-interfaces.html#reflecting-content-attributes-in-idl-attributes:idl-domstring-5
                if (link.href === dep && (!isCss || link.rel === 'stylesheet')) {
                    return;
                }
            }
        }
        else if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) {
            return;
        }
        const link = document.createElement('link');
        link.rel = isCss ? 'stylesheet' : scriptRel;
        if (!isCss) {
            link.as = 'script';
            link.crossOrigin = '';
        }
        link.href = dep;
        document.head.appendChild(link);
        if (isCss) {
            return new Promise((res, rej) => {
                link.addEventListener('load', res);
                link.addEventListener('error', () => rej(new Error(`Unable to preload CSS for ${dep}`)));
            });
        }
    }))
        .then(() => baseModule())
        .catch((err) => {
        const e = new Event('vite:preloadError', { cancelable: true });
        // @ts-expect-error custom payload
        e.payload = err;
        window.dispatchEvent(e);
        if (!e.defaultPrevented) {
            throw err;
        }
    });
}
/**
 * Build only. During serve this is performed as part of ./importAnalysis.
 */
function buildImportAnalysisPlugin(config) {
    const ssr = !!config.build.ssr;
    const isWorker = config.isWorker;
    const insertPreload = !(ssr ||
        !!config.build.lib ||
        isWorker ||
        config.build.modulePreload === false);
    const resolveModulePreloadDependencies = config.build.modulePreload && config.build.modulePreload.resolveDependencies;
    const renderBuiltUrl = config.experimental.renderBuiltUrl;
    const customModulePreloadPaths = !!(resolveModulePreloadDependencies || renderBuiltUrl);
    const isRelativeBase = config.base === './' || config.base === '';
    const optimizeModulePreloadRelativePaths = isRelativeBase && !customModulePreloadPaths;
    const { modulePreload } = config.build;
    const scriptRel = modulePreload && modulePreload.polyfill
        ? `'modulepreload'`
        : `(${detectScriptRel.toString()})()`;
    // There are three different cases for the preload list format in __vitePreload
    //
    // __vitePreload(() => import(asyncChunk), [ ...deps... ])
    //
    // This is maintained to keep backwards compatibility as some users developed plugins
    // using regex over this list to workaround the fact that module preload wasn't
    // configurable.
    const assetsURL = customModulePreloadPaths
        ? // If `experimental.renderBuiltUrl` or `build.modulePreload.resolveDependencies` are used
            // the dependencies are already resolved. To avoid the need for `new URL(dep, import.meta.url)`
            // a helper `__vitePreloadRelativeDep` is used to resolve from relative paths which can be minimized.
            `function(dep, importerUrl) { return dep.startsWith('.') ? new URL(dep, importerUrl).href : dep }`
        : optimizeModulePreloadRelativePaths
            ? // If there isn't custom resolvers affecting the deps list, deps in the list are relative
                // to the current chunk and are resolved to absolute URL by the __vitePreload helper itself.
                // The importerUrl is passed as third parameter to __vitePreload in this case
                `function(dep, importerUrl) { return new URL(dep, importerUrl).href }`
            : // If the base isn't relative, then the deps are relative to the projects `outDir` and the base
                // is appended inside __vitePreload too.
                `function(dep) { return ${JSON.stringify(config.base)}+dep }`;
    const preloadCode = `const scriptRel = ${scriptRel};const assetsURL = ${assetsURL};const seen = {};export const ${preloadMethod} = ${preload.toString()}`;
    return {
        name: 'vite:build-import-analysis',
        resolveId(id) {
            if (id === preloadHelperId) {
                return id;
            }
        },
        load(id) {
            if (id === preloadHelperId) {
                return preloadCode;
            }
        },
        async transform(source, importer) {
            if (isInNodeModules(importer) && !dynamicImportPrefixRE.test(source)) {
                return;
            }
            await init;
            let imports = [];
            try {
                imports = parse$3(source)[0];
            }
            catch (e) {
                this.error(e, e.idx);
            }
            if (!imports.length) {
                return null;
            }
            const { root } = config;
            const depsOptimizer = getDepsOptimizer(config, ssr);
            const normalizeUrl = async (url, pos) => {
                let importerFile = importer;
                const optimizeDeps = getDepOptimizationConfig(config, ssr);
                if (moduleListContains(optimizeDeps?.exclude, url)) {
                    if (depsOptimizer) {
                        await depsOptimizer.scanProcessing;
                        // if the dependency encountered in the optimized file was excluded from the optimization
                        // the dependency needs to be resolved starting from the original source location of the optimized file
                        // because starting from node_modules/.vite will not find the dependency if it was not hoisted
                        // (that is, if it is under node_modules directory in the package source of the optimized file)
                        for (const optimizedModule of depsOptimizer.metadata.depInfoList) {
                            if (!optimizedModule.src)
                                continue; // Ignore chunks
                            if (optimizedModule.file === importer) {
                                importerFile = optimizedModule.src;
                            }
                        }
                    }
                }
                const resolved = await this.resolve(url, importerFile);
                if (!resolved) {
                    // in ssr, we should let node handle the missing modules
                    if (ssr) {
                        return [url, url];
                    }
                    return this.error(`Failed to resolve import "${url}" from "${path.relative(process.cwd(), importerFile)}". Does the file exist?`, pos);
                }
                // normalize all imports into resolved URLs
                // e.g. `import 'foo'` -> `import '/@fs/.../node_modules/foo/index.js'`
                if (resolved.id.startsWith(root + '/')) {
                    // in root: infer short absolute path from root
                    url = resolved.id.slice(root.length);
                }
                else {
                    url = resolved.id;
                }
                if (isExternalUrl(url)) {
                    return [url, url];
                }
                return [url, resolved.id];
            };
            let s;
            const str = () => s || (s = new MagicString(source));
            let needPreloadHelper = false;
            for (let index = 0; index < imports.length; index++) {
                const { s: start, e: end, ss: expStart, se: expEnd, n: specifier, d: dynamicIndex, a: assertIndex, } = imports[index];
                const isDynamicImport = dynamicIndex > -1;
                // strip import assertions as we can process them ourselves
                if (!isDynamicImport && assertIndex > -1) {
                    str().remove(end + 1, expEnd);
                }
                if (isDynamicImport && insertPreload) {
                    needPreloadHelper = true;
                    str().prependLeft(expStart, `${preloadMethod}(() => `);
                    str().appendRight(expEnd, `,${isModernFlag}?"${preloadMarker}":void 0${optimizeModulePreloadRelativePaths || customModulePreloadPaths
                        ? ',import.meta.url'
                        : ''})`);
                }
                // static import or valid string in dynamic import
                // If resolvable, let's resolve it
                if (depsOptimizer && specifier) {
                    // skip external / data uri
                    if (isExternalUrl(specifier) || isDataUrl(specifier)) {
                        continue;
                    }
                    // normalize
                    const [url, resolvedId] = await normalizeUrl(specifier, start);
                    if (url !== specifier) {
                        if (depsOptimizer.isOptimizedDepFile(resolvedId) &&
                            !resolvedId.match(optimizedDepChunkRE)) {
                            const file = cleanUrl(resolvedId); // Remove ?v={hash}
                            const needsInterop = await optimizedDepNeedsInterop(depsOptimizer.metadata, file, config, ssr);
                            let rewriteDone = false;
                            if (needsInterop === undefined) {
                                // Non-entry dynamic imports from dependencies will reach here as there isn't
                                // optimize info for them, but they don't need es interop. If the request isn't
                                // a dynamic import, then it is an internal Vite error
                                if (!file.match(optimizedDepDynamicRE)) {
                                    config.logger.error(colors.red(`Vite Error, ${url} optimized info should be defined`));
                                }
                            }
                            else if (needsInterop) {
                                // config.logger.info(`${url} needs interop`)
                                interopNamedImports(str(), imports[index], url, index, importer, config);
                                rewriteDone = true;
                            }
                            if (!rewriteDone) {
                                const rewrittenUrl = JSON.stringify(file);
                                const s = isDynamicImport ? start : start - 1;
                                const e = isDynamicImport ? end : end + 1;
                                str().update(s, e, rewrittenUrl);
                            }
                        }
                    }
                }
                // Differentiate CSS imports that use the default export from those that
                // do not by injecting a ?used query - this allows us to avoid including
                // the CSS string when unnecessary (esbuild has trouble tree-shaking
                // them)
                if (specifier &&
                    isCSSRequest(specifier) &&
                    // always inject ?used query when it is a dynamic import
                    // because there is no way to check whether the default export is used
                    (source.slice(expStart, start).includes('from') || isDynamicImport) &&
                    // already has ?used query (by import.meta.glob)
                    !specifier.match(/\?used(&|$)/) &&
                    // don't append ?used when SPECIAL_QUERY_RE exists
                    !specifier.match(SPECIAL_QUERY_RE) &&
                    // edge case for package names ending with .css (e.g normalize.css)
                    !(bareImportRE.test(specifier) && !specifier.includes('/'))) {
                    const url = specifier.replace(/\?|$/, (m) => `?used${m ? '&' : ''}`);
                    str().update(start, end, isDynamicImport ? `'${url}'` : url);
                }
            }
            if (needPreloadHelper &&
                insertPreload &&
                !source.includes(`const ${preloadMethod} =`)) {
                str().prepend(`import { ${preloadMethod} } from "${preloadHelperId}";`);
            }
            if (s) {
                return {
                    code: s.toString(),
                    map: config.build.sourcemap ? s.generateMap({ hires: true }) : null,
                };
            }
        },
        renderChunk(code, _, { format }) {
            // make sure we only perform the preload logic in modern builds.
            if (code.indexOf(isModernFlag) > -1) {
                const re = new RegExp(isModernFlag, 'g');
                const isModern = String(format === 'es');
                if (config.build.sourcemap) {
                    const s = new MagicString(code);
                    let match;
                    while ((match = re.exec(code))) {
                        s.update(match.index, match.index + isModernFlag.length, isModern);
                    }
                    return {
                        code: s.toString(),
                        map: s.generateMap({ hires: true }),
                    };
                }
                else {
                    return code.replace(re, isModern);
                }
            }
            return null;
        },
        generateBundle({ format }, bundle) {
            if (format !== 'es' ||
                ssr ||
                isWorker ||
                config.build.modulePreload === false) {
                return;
            }
            for (const file in bundle) {
                const chunk = bundle[file];
                // can't use chunk.dynamicImports.length here since some modules e.g.
                // dynamic import to constant json may get inlined.
                if (chunk.type === 'chunk' && chunk.code.indexOf(preloadMarker) > -1) {
                    const code = chunk.code;
                    let imports;
                    try {
                        imports = parse$3(code)[0].filter((i) => i.d > -1);
                    }
                    catch (e) {
                        this.error(e, e.idx);
                    }
                    const s = new MagicString(code);
                    const rewroteMarkerStartPos = new Set(); // position of the leading double quote
                    if (imports.length) {
                        for (let index = 0; index < imports.length; index++) {
                            // To handle escape sequences in specifier strings, the .n field will be provided where possible.
                            const { n: name, s: start, e: end, ss: expStart, se: expEnd, } = imports[index];
                            // check the chunk being imported
                            let url = name;
                            if (!url) {
                                const rawUrl = code.slice(start, end);
                                if (rawUrl[0] === `"` && rawUrl[rawUrl.length - 1] === `"`)
                                    url = rawUrl.slice(1, -1);
                            }
                            const deps = new Set();
                            let hasRemovedPureCssChunk = false;
                            let normalizedFile = undefined;
                            if (url) {
                                normalizedFile = path.posix.join(path.posix.dirname(chunk.fileName), url);
                                const ownerFilename = chunk.fileName;
                                // literal import - trace direct imports and add to deps
                                const analyzed = new Set();
                                const addDeps = (filename) => {
                                    if (filename === ownerFilename)
                                        return;
                                    if (analyzed.has(filename))
                                        return;
                                    analyzed.add(filename);
                                    const chunk = bundle[filename];
                                    if (chunk) {
                                        deps.add(chunk.fileName);
                                        chunk.imports.forEach(addDeps);
                                        // Ensure that the css imported by current chunk is loaded after the dependencies.
                                        // So the style of current chunk won't be overwritten unexpectedly.
                                        chunk.viteMetadata.importedCss.forEach((file) => {
                                            deps.add(file);
                                        });
                                    }
                                    else {
                                        const removedPureCssFiles = removedPureCssFilesCache.get(config);
                                        const chunk = removedPureCssFiles.get(filename);
                                        if (chunk) {
                                            if (chunk.viteMetadata.importedCss.size) {
                                                chunk.viteMetadata.importedCss.forEach((file) => {
                                                    deps.add(file);
                                                });
                                                hasRemovedPureCssChunk = true;
                                            }
                                            s.update(expStart, expEnd, 'Promise.resolve({})');
                                        }
                                    }
                                };
                                addDeps(normalizedFile);
                            }
                            let markerStartPos = indexOfMatchInSlice(code, preloadMarkerWithQuote, end);
                            // fix issue #3051
                            if (markerStartPos === -1 && imports.length === 1) {
                                markerStartPos = indexOfMatchInSlice(code, preloadMarkerWithQuote);
                            }
                            if (markerStartPos > 0) {
                                // the dep list includes the main chunk, so only need to reload when there are actual other deps.
                                const depsArray = deps.size > 1 ||
                                    // main chunk is removed
                                    (hasRemovedPureCssChunk && deps.size > 0)
                                    ? [...deps]
                                    : [];
                                let renderedDeps;
                                if (normalizedFile && customModulePreloadPaths) {
                                    const { modulePreload } = config.build;
                                    const resolveDependencies = modulePreload && modulePreload.resolveDependencies;
                                    let resolvedDeps;
                                    if (resolveDependencies) {
                                        // We can't let the user remove css deps as these aren't really preloads, they are just using
                                        // the same mechanism as module preloads for this chunk
                                        const cssDeps = [];
                                        const otherDeps = [];
                                        for (const dep of depsArray) {
                                            (dep.endsWith('.css') ? cssDeps : otherDeps).push(dep);
                                        }
                                        resolvedDeps = [
                                            ...resolveDependencies(normalizedFile, otherDeps, {
                                                hostId: file,
                                                hostType: 'js',
                                            }),
                                            ...cssDeps,
                                        ];
                                    }
                                    else {
                                        resolvedDeps = depsArray;
                                    }
                                    renderedDeps = resolvedDeps.map((dep) => {
                                        const replacement = toOutputFilePathInJS(dep, 'asset', chunk.fileName, 'js', config, toRelativePath);
                                        const replacementString = typeof replacement === 'string'
                                            ? JSON.stringify(replacement)
                                            : replacement.runtime;
                                        return replacementString;
                                    });
                                }
                                else {
                                    renderedDeps = depsArray.map((d) => 
                                    // Don't include the assets dir if the default asset file names
                                    // are used, the path will be reconstructed by the import preload helper
                                    JSON.stringify(optimizeModulePreloadRelativePaths
                                        ? toRelativePath(d, file)
                                        : d));
                                }
                                s.update(markerStartPos, markerStartPos + preloadMarker.length + 2, `[${renderedDeps.join(',')}]`);
                                rewroteMarkerStartPos.add(markerStartPos);
                            }
                        }
                    }
                    // there may still be markers due to inlined dynamic imports, remove
                    // all the markers regardless
                    let markerStartPos = indexOfMatchInSlice(code, preloadMarkerWithQuote);
                    while (markerStartPos >= 0) {
                        if (!rewroteMarkerStartPos.has(markerStartPos)) {
                            s.update(markerStartPos, markerStartPos + preloadMarker.length + 2, 'void 0');
                        }
                        markerStartPos = indexOfMatchInSlice(code, preloadMarkerWithQuote, markerStartPos + preloadMarker.length + 2);
                    }
                    if (s.hasChanged()) {
                        chunk.code = s.toString();
                        if (config.build.sourcemap && chunk.map) {
                            const nextMap = s.generateMap({
                                source: chunk.fileName,
                                hires: true,
                            });
                            const map = combineSourcemaps(chunk.fileName, [nextMap, chunk.map], false);
                            map.toUrl = () => genSourceMapUrl(map);
                            chunk.map = map;
                            if (config.build.sourcemap === 'inline') {
                                chunk.code = chunk.code.replace(convertSourceMap.mapFileCommentRegex, '');
                                chunk.code += `\n//# sourceMappingURL=${genSourceMapUrl(map)}`;
                            }
                            else if (config.build.sourcemap) {
                                const mapAsset = bundle[chunk.fileName + '.map'];
                                if (mapAsset && mapAsset.type === 'asset') {
                                    mapAsset.source = map.toString();
                                }
                            }
                        }
                    }
                }
            }
        },
    };
}

function ssrManifestPlugin(config) {
    // module id => preload assets mapping
    const ssrManifest = {};
    const base = config.base; // TODO:base
    return {
        name: 'vite:ssr-manifest',
        generateBundle(_options, bundle) {
            for (const file in bundle) {
                const chunk = bundle[file];
                if (chunk.type === 'chunk') {
                    for (const id in chunk.modules) {
                        const normalizedId = normalizePath(relative$1(config.root, id));
                        const mappedChunks = ssrManifest[normalizedId] ?? (ssrManifest[normalizedId] = []);
                        if (!chunk.isEntry) {
                            mappedChunks.push(joinUrlSegments(base, chunk.fileName));
                            // <link> tags for entry chunks are already generated in static HTML,
                            // so we only need to record info for non-entry chunks.
                            chunk.viteMetadata.importedCss.forEach((file) => {
                                mappedChunks.push(joinUrlSegments(base, file));
                            });
                        }
                        chunk.viteMetadata.importedAssets.forEach((file) => {
                            mappedChunks.push(joinUrlSegments(base, file));
                        });
                    }
                    if (chunk.code.includes(preloadMethod)) {
                        // generate css deps map
                        const code = chunk.code;
                        let imports;
                        try {
                            imports = parse$3(code)[0].filter((i) => i.n && i.d > -1);
                        }
                        catch (e) {
                            this.error(e, e.idx);
                        }
                        if (imports.length) {
                            for (let index = 0; index < imports.length; index++) {
                                const { s: start, e: end, n: name } = imports[index];
                                // check the chunk being imported
                                const url = code.slice(start, end);
                                const deps = [];
                                const ownerFilename = chunk.fileName;
                                // literal import - trace direct imports and add to deps
                                const analyzed = new Set();
                                const addDeps = (filename) => {
                                    if (filename === ownerFilename)
                                        return;
                                    if (analyzed.has(filename))
                                        return;
                                    analyzed.add(filename);
                                    const chunk = bundle[filename];
                                    if (chunk) {
                                        chunk.viteMetadata.importedCss.forEach((file) => {
                                            deps.push(joinUrlSegments(base, file)); // TODO:base
                                        });
                                        chunk.imports.forEach(addDeps);
                                    }
                                };
                                const normalizedFile = normalizePath(join$1(dirname$1(chunk.fileName), url.slice(1, -1)));
                                addDeps(normalizedFile);
                                ssrManifest[basename$1(name)] = deps;
                            }
                        }
                    }
                }
            }
            this.emitFile({
                fileName: typeof config.build.ssrManifest === 'string'
                    ? config.build.ssrManifest
                    : 'ssr-manifest.json',
                type: 'asset',
                source: jsonStableStringify(ssrManifest, { space: 2 }),
            });
        },
    };
}

/**
 * A plugin to provide build load fallback for arbitrary request with queries.
 */
function loadFallbackPlugin() {
    return {
        name: 'vite:load-fallback',
        async load(id) {
            try {
                // if we don't add `await` here, we couldn't catch the error in readFile
                return await fsp.readFile(cleanUrl(id), 'utf-8');
            }
            catch (e) {
                return fsp.readFile(id, 'utf-8');
            }
        },
    };
}

function resolveChokidarOptions(config, options) {
    const { ignored = [], ...otherOptions } = options ?? {};
    const resolvedWatchOptions = {
        ignored: [
            '**/.git/**',
            '**/node_modules/**',
            '**/test-results/**',
            glob.escapePath(config.cacheDir) + '/**',
            ...(Array.isArray(ignored) ? ignored : [ignored]),
        ],
        ignoreInitial: true,
        ignorePermissionErrors: true,
        ...otherOptions,
    };
    return resolvedWatchOptions;
}

/**
 * make sure systemjs register wrap to had complete parameters in system format
 */
function completeSystemWrapPlugin() {
    const SystemJSWrapRE = /System.register\(.*(\(exports\)|\(\))/g;
    return {
        name: 'vite:force-systemjs-wrap-complete',
        renderChunk(code, chunk, opts) {
            if (opts.format === 'system') {
                return {
                    code: code.replace(SystemJSWrapRE, (s, s1) => s.replace(s1, '(exports, module)')),
                    map: null,
                };
            }
        },
    };
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

const knownJavascriptExtensionRE = /\.[tj]sx?$/;
const sirvOptions = ({ headers, shouldServe, }) => {
    return {
        dev: true,
        etag: true,
        extensions: [],
        setHeaders(res, pathname) {
            // Matches js, jsx, ts, tsx.
            // The reason this is done, is that the .ts file extension is reserved
            // for the MIME type video/mp2t. In almost all cases, we can expect
            // these files to be TypeScript files, and for Vite to serve them with
            // this Content-Type.
            if (knownJavascriptExtensionRE.test(pathname)) {
                res.setHeader('Content-Type', 'application/javascript');
            }
            if (headers) {
                for (const name in headers) {
                    res.setHeader(name, headers[name]);
                }
            }
        },
        shouldServe,
    };
};
function servePublicMiddleware(dir, headers) {
    const serve = sirv(dir, sirvOptions({
        headers,
        shouldServe: (filePath) => shouldServeFile(filePath, dir),
    }));
    // Keep the named function. The name is visible in debug logs via `DEBUG=connect:dispatcher ...`
    return function viteServePublicMiddleware(req, res, next) {
        // skip import request and internal requests `/@fs/ /@vite-client` etc...
        if (isImportRequest(req.url) || isInternalRequest(req.url)) {
            return next();
        }
        serve(req, res, next);
    };
}
function serveStaticMiddleware(dir, server) {
    const serve = sirv(dir, sirvOptions({
        headers: server.config.server.headers,
    }));
    // Keep the named function. The name is visible in debug logs via `DEBUG=connect:dispatcher ...`
    return function viteServeStaticMiddleware(req, res, next) {
        // only serve the file if it's not an html request or ends with `/`
        // so that html requests can fallthrough to our html middleware for
        // special processing
        // also skip internal requests `/@fs/ /@vite-client` etc...
        const cleanedUrl = cleanUrl(req.url);
        if (cleanedUrl[cleanedUrl.length - 1] === '/' ||
            path.extname(cleanedUrl) === '.html' ||
            isInternalRequest(req.url)) {
            return next();
        }
        const url = new URL(req.url.replace(/^\/+/, '/'), 'http://example.com');
        const pathname = decodeURI(url.pathname);
        // apply aliases to static requests as well
        let redirectedPathname;
        for (const { find, replacement } of server.config.resolve.alias) {
            const matches = typeof find === 'string'
                ? pathname.startsWith(find)
                : find.test(pathname);
            if (matches) {
                redirectedPathname = pathname.replace(find, replacement);
                break;
            }
        }
        if (redirectedPathname) {
            // dir is pre-normalized to posix style
            if (redirectedPathname.startsWith(dir)) {
                redirectedPathname = redirectedPathname.slice(dir.length);
            }
        }
        const resolvedPathname = redirectedPathname || pathname;
        let fileUrl = path.resolve(dir, removeLeadingSlash(resolvedPathname));
        if (resolvedPathname[resolvedPathname.length - 1] === '/' &&
            fileUrl[fileUrl.length - 1] !== '/') {
            fileUrl = fileUrl + '/';
        }
        if (!ensureServingAccess(fileUrl, server, res, next)) {
            return;
        }
        if (redirectedPathname) {
            url.pathname = encodeURI(redirectedPathname);
            req.url = url.href.slice(url.origin.length);
        }
        serve(req, res, next);
    };
}
function serveRawFsMiddleware(server) {
    const serveFromRoot = sirv('/', sirvOptions({ headers: server.config.server.headers }));
    // Keep the named function. The name is visible in debug logs via `DEBUG=connect:dispatcher ...`
    return function viteServeRawFsMiddleware(req, res, next) {
        const url = new URL(req.url.replace(/^\/+/, '/'), 'http://example.com');
        // In some cases (e.g. linked monorepos) files outside of root will
        // reference assets that are also out of served root. In such cases
        // the paths are rewritten to `/@fs/` prefixed paths and must be served by
        // searching based from fs root.
        if (url.pathname.startsWith(FS_PREFIX)) {
            const pathname = decodeURI(url.pathname);
            // restrict files outside of `fs.allow`
            if (!ensureServingAccess(slash(path.resolve(fsPathFromId(pathname))), server, res, next)) {
                return;
            }
            let newPathname = pathname.slice(FS_PREFIX.length);
            if (isWindows)
                newPathname = newPathname.replace(/^[A-Z]:/i, '');
            url.pathname = encodeURI(newPathname);
            req.url = url.href.slice(url.origin.length);
            serveFromRoot(req, res, next);
        }
        else {
            next();
        }
    };
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
function ensureServingAccess(url, server, res, next) {
    if (isFileServingAllowed(url, server)) {
        return true;
    }
    if (isFileReadable(cleanUrl(url))) {
        const urlMessage = `The request url "${url}" is outside of Vite serving allow list.`;
        const hintMessage = `
${server.config.server.fs.allow.map((i) => `- ${i}`).join('\n')}

Refer to docs https://vitejs.dev/config/server-options.html#server-fs-allow for configurations and more details.`;
        server.config.logger.error(urlMessage);
        server.config.logger.warnOnce(hintMessage + '\n');
        res.statusCode = 403;
        res.write(renderRestrictedErrorHTML(urlMessage + '\n' + hintMessage));
        res.end();
    }
    else {
        // if the file doesn't exist, we shouldn't restrict this path as it can
        // be an API call. Middlewares would issue a 404 if the file isn't handled
        next();
    }
    return false;
}
function renderRestrictedErrorHTML(msg) {
    // to have syntax highlighting and autocompletion in IDE
    const html = String.raw;
    return html `
    <body>
      <h1>403 Restricted</h1>
      <p>${escapeHtml(msg).replace(/\n/g, '<br/>')}</p>
      <style>
        body {
          padding: 1em 2em;
        }
      </style>
    </body>
  `;
}

function resolveBuildOptions(raw, logger, root) {
    const deprecatedPolyfillModulePreload = raw?.polyfillModulePreload;
    if (raw) {
        const { polyfillModulePreload, ...rest } = raw;
        raw = rest;
        if (deprecatedPolyfillModulePreload !== undefined) {
            logger.warn('polyfillModulePreload is deprecated. Use modulePreload.polyfill instead.');
        }
        if (deprecatedPolyfillModulePreload === false &&
            raw.modulePreload === undefined) {
            raw.modulePreload = { polyfill: false };
        }
    }
    const modulePreload = raw?.modulePreload;
    const defaultModulePreload = {
        polyfill: true,
    };
    const defaultBuildOptions = {
        outDir: 'dist',
        assetsDir: 'assets',
        assetsInlineLimit: 4096,
        cssCodeSplit: !raw?.lib,
        sourcemap: false,
        rollupOptions: {},
        minify: raw?.ssr ? false : 'esbuild',
        terserOptions: {},
        write: true,
        emptyOutDir: null,
        copyPublicDir: true,
        manifest: false,
        lib: false,
        ssr: false,
        ssrManifest: false,
        ssrEmitAssets: false,
        reportCompressedSize: true,
        chunkSizeWarningLimit: 500,
        watch: null,
    };
    const userBuildOptions = raw
        ? mergeConfig(defaultBuildOptions, raw)
        : defaultBuildOptions;
    // @ts-expect-error Fallback options instead of merging
    const resolved = {
        target: 'modules',
        cssTarget: false,
        ...userBuildOptions,
        commonjsOptions: {
            include: [/node_modules/],
            extensions: ['.js', '.cjs'],
            ...userBuildOptions.commonjsOptions,
        },
        dynamicImportVarsOptions: {
            warnOnError: true,
            exclude: [/node_modules/],
            ...userBuildOptions.dynamicImportVarsOptions,
        },
        // Resolve to false | object
        modulePreload: modulePreload === false
            ? false
            : typeof modulePreload === 'object'
                ? {
                    ...defaultModulePreload,
                    ...modulePreload,
                }
                : defaultModulePreload,
    };
    // handle special build targets
    if (resolved.target === 'modules') {
        resolved.target = ESBUILD_MODULES_TARGET;
    }
    else if (resolved.target === 'esnext' && resolved.minify === 'terser') {
        try {
            const terserPackageJsonPath = requireResolveFromRootWithFallback(root, 'terser/package.json');
            const terserPackageJson = JSON.parse(fs.readFileSync(terserPackageJsonPath, 'utf-8'));
            const v = terserPackageJson.version.split('.');
            if (v[0] === '5' && v[1] < 16) {
                // esnext + terser 5.16<: limit to es2021 so it can be minified by terser
                resolved.target = 'es2021';
            }
        }
        catch { }
    }
    if (!resolved.cssTarget) {
        resolved.cssTarget = resolved.target;
    }
    // normalize false string into actual false
    if (resolved.minify === 'false') {
        resolved.minify = false;
    }
    if (resolved.minify === true) {
        resolved.minify = 'esbuild';
    }
    if (resolved.cssMinify == null) {
        resolved.cssMinify = !!resolved.minify;
    }
    return resolved;
}
async function resolveBuildPlugins(config) {
    const options = config.build;
    const { commonjsOptions } = options;
    const usePluginCommonjs = !Array.isArray(commonjsOptions?.include) ||
        commonjsOptions?.include.length !== 0;
    const rollupOptionsPlugins = options.rollupOptions.plugins;
    return {
        pre: [
            completeSystemWrapPlugin(),
            ...(options.watch ? [ensureWatchPlugin()] : []),
            ...(usePluginCommonjs ? [commonjsPlugin(options.commonjsOptions)] : []),
            dataURIPlugin(),
            ...(await asyncFlatten(Array.isArray(rollupOptionsPlugins)
                ? rollupOptionsPlugins
                : [rollupOptionsPlugins])).filter(Boolean),
            ...(config.isWorker ? [webWorkerPostPlugin()] : []),
        ],
        post: [
            buildImportAnalysisPlugin(config),
            ...(config.esbuild !== false ? [buildEsbuildPlugin(config)] : []),
            ...(options.minify ? [terserPlugin(config)] : []),
            ...(!config.isWorker
                ? [
                    ...(options.manifest ? [manifestPlugin(config)] : []),
                    ...(options.ssrManifest ? [ssrManifestPlugin(config)] : []),
                    buildReporterPlugin(config),
                ]
                : []),
            loadFallbackPlugin(),
        ],
    };
}
/**
 * Bundles the app for production.
 * Returns a Promise containing the build result.
 */
async function build(inlineConfig = {}) {
    const config = await resolveConfig(inlineConfig, 'build', 'production', 'production');
    const options = config.build;
    const ssr = !!options.ssr;
    const libOptions = options.lib;
    config.logger.info(colors.cyan(`vite v${VERSION$1} ${colors.green(`building ${ssr ? `SSR bundle ` : ``}for ${config.mode}...`)}`));
    const resolve = (p) => path.resolve(config.root, p);
    const input = libOptions
        ? options.rollupOptions?.input ||
            (typeof libOptions.entry === 'string'
                ? resolve(libOptions.entry)
                : Array.isArray(libOptions.entry)
                    ? libOptions.entry.map(resolve)
                    : Object.fromEntries(Object.entries(libOptions.entry).map(([alias, file]) => [
                        alias,
                        resolve(file),
                    ])))
        : typeof options.ssr === 'string'
            ? resolve(options.ssr)
            : options.rollupOptions?.input || resolve('index.html');
    if (ssr && typeof input === 'string' && input.endsWith('.html')) {
        throw new Error(`rollupOptions.input should not be an html file when building for SSR. ` +
            `Please specify a dedicated SSR entry.`);
    }
    const outDir = resolve(options.outDir);
    // inject ssr arg to plugin load/transform hooks
    const plugins = (ssr ? config.plugins.map((p) => injectSsrFlagToHooks(p)) : config.plugins);
    const userExternal = options.rollupOptions?.external;
    let external = userExternal;
    // In CJS, we can pass the externals to rollup as is. In ESM, we need to
    // do it in the resolve plugin so we can add the resolved extension for
    // deep node_modules imports
    if (ssr && config.legacy?.buildSsrCjsExternalHeuristics) {
        external = await cjsSsrResolveExternal(config, userExternal);
    }
    if (isDepsOptimizerEnabled(config, ssr)) {
        await initDepsOptimizer(config);
    }
    const rollupOptions = {
        context: 'globalThis',
        preserveEntrySignatures: ssr
            ? 'allow-extension'
            : libOptions
                ? 'strict'
                : false,
        cache: config.build.watch ? undefined : false,
        ...options.rollupOptions,
        input,
        plugins,
        external,
        onwarn(warning, warn) {
            onRollupWarning(warning, warn, config);
        },
    };
    const outputBuildError = (e) => {
        let msg = colors.red((e.plugin ? `[${e.plugin}] ` : '') + e.message);
        if (e.id) {
            msg += `\nfile: ${colors.cyan(e.id + (e.loc ? `:${e.loc.line}:${e.loc.column}` : ''))}`;
        }
        if (e.frame) {
            msg += `\n` + colors.yellow(e.frame);
        }
        config.logger.error(msg, { error: e });
    };
    let bundle;
    try {
        const buildOutputOptions = (output = {}) => {
            // @ts-expect-error See https://github.com/vitejs/vite/issues/5812#issuecomment-984345618
            if (output.output) {
                config.logger.warn(`You've set "rollupOptions.output.output" in your config. ` +
                    `This is deprecated and will override all Vite.js default output options. ` +
                    `Please use "rollupOptions.output" instead.`);
            }
            const ssrNodeBuild = ssr && config.ssr.target === 'node';
            const ssrWorkerBuild = ssr && config.ssr.target === 'webworker';
            const cjsSsrBuild = ssr && config.ssr.format === 'cjs';
            const format = output.format || (cjsSsrBuild ? 'cjs' : 'es');
            const jsExt = ssrNodeBuild || libOptions
                ? resolveOutputJsExtension(format, findNearestPackageData(config.root, config.packageCache)?.data
                    .type)
                : 'js';
            return {
                dir: outDir,
                // Default format is 'es' for regular and for SSR builds
                format,
                exports: cjsSsrBuild ? 'named' : 'auto',
                sourcemap: options.sourcemap,
                name: libOptions ? libOptions.name : undefined,
                // es2015 enables `generatedCode.symbols`
                // - #764 add `Symbol.toStringTag` when build es module into cjs chunk
                // - #1048 add `Symbol.toStringTag` for module default export
                generatedCode: 'es2015',
                entryFileNames: ssr
                    ? `[name].${jsExt}`
                    : libOptions
                        ? ({ name }) => resolveLibFilename(libOptions, format, name, config.root, jsExt, config.packageCache)
                        : path.posix.join(options.assetsDir, `[name]-[hash].${jsExt}`),
                chunkFileNames: libOptions
                    ? `[name]-[hash].${jsExt}`
                    : path.posix.join(options.assetsDir, `[name]-[hash].${jsExt}`),
                assetFileNames: libOptions
                    ? `[name].[ext]`
                    : path.posix.join(options.assetsDir, `[name]-[hash].[ext]`),
                inlineDynamicImports: output.format === 'umd' ||
                    output.format === 'iife' ||
                    (ssrWorkerBuild &&
                        (typeof input === 'string' || Object.keys(input).length === 1)),
                ...output,
            };
        };
        // resolve lib mode outputs
        const outputs = resolveBuildOutputs(options.rollupOptions?.output, libOptions, config.logger);
        const normalizedOutputs = [];
        if (Array.isArray(outputs)) {
            for (const resolvedOutput of outputs) {
                normalizedOutputs.push(buildOutputOptions(resolvedOutput));
            }
        }
        else {
            normalizedOutputs.push(buildOutputOptions(outputs));
        }
        const outDirs = normalizedOutputs.map(({ dir }) => resolve(dir));
        // watch file changes with rollup
        if (config.build.watch) {
            config.logger.info(colors.cyan(`\nwatching for file changes...`));
            const resolvedChokidarOptions = resolveChokidarOptions(config, config.build.watch.chokidar);
            const { watch } = await import('rollup');
            const watcher = watch({
                ...rollupOptions,
                output: normalizedOutputs,
                watch: {
                    ...config.build.watch,
                    chokidar: resolvedChokidarOptions,
                },
            });
            watcher.on('event', (event) => {
                if (event.code === 'BUNDLE_START') {
                    config.logger.info(colors.cyan(`\nbuild started...`));
                    if (options.write) {
                        prepareOutDir(outDirs, options.emptyOutDir, config);
                    }
                }
                else if (event.code === 'BUNDLE_END') {
                    event.result.close();
                    config.logger.info(colors.cyan(`built in ${event.duration}ms.`));
                }
                else if (event.code === 'ERROR') {
                    outputBuildError(event.error);
                }
            });
            return watcher;
        }
        // write or generate files with rollup
        const { rollup } = await import('rollup');
        bundle = await rollup(rollupOptions);
        if (options.write) {
            prepareOutDir(outDirs, options.emptyOutDir, config);
        }
        const res = [];
        for (const output of normalizedOutputs) {
            res.push(await bundle[options.write ? 'write' : 'generate'](output));
        }
        return Array.isArray(outputs) ? res : res[0];
    }
    catch (e) {
        outputBuildError(e);
        throw e;
    }
    finally {
        if (bundle)
            await bundle.close();
    }
}
function prepareOutDir(outDirs, emptyOutDir, config) {
    const nonDuplicateDirs = new Set(outDirs);
    let outside = false;
    if (emptyOutDir == null) {
        for (const outDir of nonDuplicateDirs) {
            if (fs.existsSync(outDir) &&
                !normalizePath(outDir).startsWith(config.root + '/')) {
                // warn if outDir is outside of root
                config.logger.warn(colors.yellow(`\n${colors.bold(`(!)`)} outDir ${colors.white(colors.dim(outDir))} is not inside project root and will not be emptied.\n` +
                    `Use --emptyOutDir to override.\n`));
                outside = true;
                break;
            }
        }
    }
    for (const outDir of nonDuplicateDirs) {
        if (!outside && emptyOutDir !== false && fs.existsSync(outDir)) {
            // skip those other outDirs which are nested in current outDir
            const skipDirs = outDirs
                .map((dir) => {
                const relative = path.relative(outDir, dir);
                if (relative &&
                    !relative.startsWith('..') &&
                    !path.isAbsolute(relative)) {
                    return relative;
                }
                return '';
            })
                .filter(Boolean);
            emptyDir(outDir, [...skipDirs, '.git']);
        }
        if (config.build.copyPublicDir &&
            config.publicDir &&
            fs.existsSync(config.publicDir)) {
            copyDir(config.publicDir, outDir);
        }
    }
}
function getPkgName(name) {
    return name?.[0] === '@' ? name.split('/')[1] : name;
}
function resolveOutputJsExtension(format, type = 'commonjs') {
    if (type === 'module') {
        return format === 'cjs' || format === 'umd' ? 'cjs' : 'js';
    }
    else {
        return format === 'es' ? 'mjs' : 'js';
    }
}
function resolveLibFilename(libOptions, format, entryName, root, extension, packageCache) {
    if (typeof libOptions.fileName === 'function') {
        return libOptions.fileName(format, entryName);
    }
    const packageJson = findNearestPackageData(root, packageCache)?.data;
    const name = libOptions.fileName ||
        (packageJson && typeof libOptions.entry === 'string'
            ? getPkgName(packageJson.name)
            : entryName);
    if (!name)
        throw new Error('Name in package.json is required if option "build.lib.fileName" is not provided.');
    extension ?? (extension = resolveOutputJsExtension(format, packageJson?.type));
    if (format === 'cjs' || format === 'es') {
        return `${name}.${extension}`;
    }
    return `${name}.${format}.${extension}`;
}
function resolveBuildOutputs(outputs, libOptions, logger) {
    if (libOptions) {
        const libHasMultipleEntries = typeof libOptions.entry !== 'string' &&
            Object.values(libOptions.entry).length > 1;
        const libFormats = libOptions.formats ||
            (libHasMultipleEntries ? ['es', 'cjs'] : ['es', 'umd']);
        if (!Array.isArray(outputs)) {
            if (libFormats.includes('umd') || libFormats.includes('iife')) {
                if (libHasMultipleEntries) {
                    throw new Error('Multiple entry points are not supported when output formats include "umd" or "iife".');
                }
                if (!libOptions.name) {
                    throw new Error('Option "build.lib.name" is required when output formats include "umd" or "iife".');
                }
            }
            return libFormats.map((format) => ({ ...outputs, format }));
        }
        // By this point, we know "outputs" is an Array.
        if (libOptions.formats) {
            logger.warn(colors.yellow('"build.lib.formats" will be ignored because "build.rollupOptions.output" is already an array format.'));
        }
        outputs.forEach((output) => {
            if (['umd', 'iife'].includes(output.format) && !output.name) {
                throw new Error('Entries in "build.rollupOptions.output" must specify "name" when the format is "umd" or "iife".');
            }
        });
    }
    return outputs;
}
const warningIgnoreList = [`CIRCULAR_DEPENDENCY`, `THIS_IS_UNDEFINED`];
const dynamicImportWarningIgnoreList = [
    `Unsupported expression`,
    `statically analyzed`,
];
function onRollupWarning(warning, warn, config) {
    function viteWarn(warning) {
        if (warning.code === 'UNRESOLVED_IMPORT') {
            const id = warning.id;
            const exporter = warning.exporter;
            // throw unless it's commonjs external...
            if (!id || !/\?commonjs-external$/.test(id)) {
                throw new Error(`[vite]: Rollup failed to resolve import "${exporter}" from "${id}".\n` +
                    `This is most likely unintended because it can break your application at runtime.\n` +
                    `If you do want to externalize this module explicitly add it to\n` +
                    `\`build.rollupOptions.external\``);
            }
        }
        if (warning.plugin === 'rollup-plugin-dynamic-import-variables' &&
            dynamicImportWarningIgnoreList.some((msg) => warning.message.includes(msg))) {
            return;
        }
        if (warningIgnoreList.includes(warning.code)) {
            return;
        }
        if (warning.code === 'PLUGIN_WARNING') {
            config.logger.warn(`${colors.bold(colors.yellow(`[plugin:${warning.plugin}]`))} ${colors.yellow(warning.message)}`);
            return;
        }
        warn(warning);
    }
    const tty = process.stdout.isTTY && !process.env.CI;
    if (tty) {
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
    }
    const userOnWarn = config.build.rollupOptions?.onwarn;
    if (userOnWarn) {
        userOnWarn(warning, viteWarn);
    }
    else {
        viteWarn(warning);
    }
}
async function cjsSsrResolveExternal(config, user) {
    // see if we have cached deps data available
    let knownImports;
    const dataPath = path.join(getDepsCacheDir(config, false), '_metadata.json');
    try {
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
        knownImports = Object.keys(data.optimized);
    }
    catch (e) { }
    if (!knownImports) {
        // no dev deps optimization data, do a fresh scan
        knownImports = await findKnownImports(config, false); // needs to use non-ssr
    }
    const ssrExternals = cjsSsrResolveExternals(config, knownImports);
    return (id, parentId, isResolved) => {
        const isExternal = cjsShouldExternalizeForSSR(id, ssrExternals);
        if (isExternal) {
            return true;
        }
        if (user) {
            return resolveUserExternal(user, id, parentId, isResolved);
        }
    };
}
function resolveUserExternal(user, id, parentId, isResolved) {
    if (typeof user === 'function') {
        return user(id, parentId, isResolved);
    }
    else if (Array.isArray(user)) {
        return user.some((test) => isExternal(id, test));
    }
    else {
        return isExternal(id, user);
    }
}
function isExternal(id, test) {
    if (typeof test === 'string') {
        return id === test;
    }
    else {
        return test.test(id);
    }
}
function injectSsrFlagToHooks(plugin) {
    const { resolveId, load, transform } = plugin;
    return {
        ...plugin,
        resolveId: wrapSsrResolveId(resolveId),
        load: wrapSsrLoad(load),
        transform: wrapSsrTransform(transform),
    };
}
function wrapSsrResolveId(hook) {
    if (!hook)
        return;
    const fn = 'handler' in hook ? hook.handler : hook;
    const handler = function (id, importer, options) {
        return fn.call(this, id, importer, injectSsrFlag(options));
    };
    if ('handler' in hook) {
        return {
            ...hook,
            handler,
        };
    }
    else {
        return handler;
    }
}
function wrapSsrLoad(hook) {
    if (!hook)
        return;
    const fn = 'handler' in hook ? hook.handler : hook;
    const handler = function (id, ...args) {
        // @ts-expect-error: Receiving options param to be future-proof if Rollup adds it
        return fn.call(this, id, injectSsrFlag(args[0]));
    };
    if ('handler' in hook) {
        return {
            ...hook,
            handler,
        };
    }
    else {
        return handler;
    }
}
function wrapSsrTransform(hook) {
    if (!hook)
        return;
    const fn = 'handler' in hook ? hook.handler : hook;
    const handler = function (code, importer, ...args) {
        // @ts-expect-error: Receiving options param to be future-proof if Rollup adds it
        return fn.call(this, code, importer, injectSsrFlag(args[0]));
    };
    if ('handler' in hook) {
        return {
            ...hook,
            handler,
        };
    }
    else {
        return handler;
    }
}
function injectSsrFlag(options) {
    return { ...(options ?? {}), ssr: true };
}
/*
  The following functions are copied from rollup
  https://github.com/rollup/rollup/blob/0bcf0a672ac087ff2eb88fbba45ec62389a4f45f/src/ast/nodes/MetaProperty.ts#L145-L193

  https://github.com/rollup/rollup
  The MIT License (MIT)
  Copyright (c) 2017 [these people](https://github.com/rollup/rollup/graphs/contributors)
  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
const needsEscapeRegEx = /[\n\r'\\\u2028\u2029]/;
const quoteNewlineRegEx = /([\n\r'\u2028\u2029])/g;
const backSlashRegEx = /\\/g;
function escapeId(id) {
    if (!needsEscapeRegEx.test(id))
        return id;
    return id.replace(backSlashRegEx, '\\\\').replace(quoteNewlineRegEx, '\\$1');
}
const getResolveUrl = (path, URL = 'URL') => `new ${URL}(${path}).href`;
const getRelativeUrlFromDocument = (relativePath, umd = false) => getResolveUrl(`'${escapeId(relativePath)}', ${umd ? `typeof document === 'undefined' ? location.href : ` : ''}document.currentScript && document.currentScript.src || document.baseURI`);
const getFileUrlFromFullPath = (path) => `require('u' + 'rl').pathToFileURL(${path}).href`;
const getFileUrlFromRelativePath = (path) => getFileUrlFromFullPath(`__dirname + '/${path}'`);
const relativeUrlMechanisms = {
    amd: (relativePath) => {
        if (relativePath[0] !== '.')
            relativePath = './' + relativePath;
        return getResolveUrl(`require.toUrl('${relativePath}'), document.baseURI`);
    },
    cjs: (relativePath) => `(typeof document === 'undefined' ? ${getFileUrlFromRelativePath(relativePath)} : ${getRelativeUrlFromDocument(relativePath)})`,
    es: (relativePath) => getResolveUrl(`'${relativePath}', import.meta.url`),
    iife: (relativePath) => getRelativeUrlFromDocument(relativePath),
    // NOTE: make sure rollup generate `module` params
    system: (relativePath) => getResolveUrl(`'${relativePath}', module.meta.url`),
    umd: (relativePath) => `(typeof document === 'undefined' && typeof location === 'undefined' ? ${getFileUrlFromRelativePath(relativePath)} : ${getRelativeUrlFromDocument(relativePath, true)})`,
};
/* end of copy */
const customRelativeUrlMechanisms = {
    ...relativeUrlMechanisms,
    'worker-iife': (relativePath) => getResolveUrl(`'${relativePath}', self.location.href`),
};
function toOutputFilePathInJS(filename, type, hostId, hostType, config, toRelative) {
    const { renderBuiltUrl } = config.experimental;
    let relative = config.base === '' || config.base === './';
    if (renderBuiltUrl) {
        const result = renderBuiltUrl(filename, {
            hostId,
            hostType,
            type,
            ssr: !!config.build.ssr,
        });
        if (typeof result === 'object') {
            if (result.runtime) {
                return { runtime: result.runtime };
            }
            if (typeof result.relative === 'boolean') {
                relative = result.relative;
            }
        }
        else if (result) {
            return result;
        }
    }
    if (relative && !config.build.ssr) {
        return toRelative(filename, hostId);
    }
    return joinUrlSegments(config.base, filename);
}
function createToImportMetaURLBasedRelativeRuntime(format, isWorker) {
    const formatLong = isWorker && format === 'iife' ? 'worker-iife' : format;
    const toRelativePath = customRelativeUrlMechanisms[formatLong];
    return (filename, importer) => ({
        runtime: toRelativePath(path.posix.relative(path.dirname(importer), filename)),
    });
}
function toOutputFilePathWithoutRuntime(filename, type, hostId, hostType, config, toRelative) {
    const { renderBuiltUrl } = config.experimental;
    let relative = config.base === '' || config.base === './';
    if (renderBuiltUrl) {
        const result = renderBuiltUrl(filename, {
            hostId,
            hostType,
            type,
            ssr: !!config.build.ssr,
        });
        if (typeof result === 'object') {
            if (result.runtime) {
                throw new Error(`{ runtime: "${result.runtime}" } is not supported for assets in ${hostType} files: ${filename}`);
            }
            if (typeof result.relative === 'boolean') {
                relative = result.relative;
            }
        }
        else if (result) {
            return result;
        }
    }
    if (relative && !config.build.ssr) {
        return toRelative(filename, hostId);
    }
    else {
        return joinUrlSegments(config.base, filename);
    }
}
const toOutputFilePathInCss = toOutputFilePathWithoutRuntime;
const toOutputFilePathInHtml = toOutputFilePathWithoutRuntime;

var build$1 = {
    __proto__: null,
    build: build,
    createToImportMetaURLBasedRelativeRuntime: createToImportMetaURLBasedRelativeRuntime,
    onRollupWarning: onRollupWarning,
    resolveBuildOptions: resolveBuildOptions,
    resolveBuildOutputs: resolveBuildOutputs,
    resolveBuildPlugins: resolveBuildPlugins,
    resolveLibFilename: resolveLibFilename,
    resolveUserExternal: resolveUserExternal,
    toOutputFilePathInCss: toOutputFilePathInCss,
    toOutputFilePathInHtml: toOutputFilePathInHtml,
    toOutputFilePathInJS: toOutputFilePathInJS,
    toOutputFilePathWithoutRuntime: toOutputFilePathWithoutRuntime
};

async function resolveHttpServer({ proxy }, app, httpsOptions) {
    if (!httpsOptions) {
        const { createServer } = await import('node:http');
        return createServer(app);
    }
    // #484 fallback to http1 when proxy is needed.
    if (proxy) {
        const { createServer } = await import('node:https');
        return createServer(httpsOptions, app);
    }
    else {
        const { createSecureServer } = await import('node:http2');
        return createSecureServer({
            // Manually increase the session memory to prevent 502 ENHANCE_YOUR_CALM
            // errors on large numbers of requests
            maxSessionMemory: 1000,
            ...httpsOptions,
            allowHTTP1: true,
        }, 
        // @ts-expect-error TODO: is this correct?
        app);
    }
}
async function resolveHttpsConfig(https) {
    if (!https)
        return undefined;
    if (!isObject(https))
        return {};
    const [ca, cert, key, pfx] = await Promise.all([
        readFileIfExists(https.ca),
        readFileIfExists(https.cert),
        readFileIfExists(https.key),
        readFileIfExists(https.pfx),
    ]);
    return { ...https, ca, cert, key, pfx };
}
async function readFileIfExists(value) {
    if (typeof value === 'string') {
        return fsp.readFile(path.resolve(value)).catch(() => value);
    }
    return value;
}
async function httpServerStart(httpServer, serverOptions) {
    let { port, strictPort, host, logger } = serverOptions;
    return new Promise((resolve, reject) => {
        const onError = (e) => {
            if (e.code === 'EADDRINUSE') {
                if (strictPort) {
                    httpServer.removeListener('error', onError);
                    reject(new Error(`Port ${port} is already in use`));
                }
                else {
                    logger.info(`Port ${port} is in use, trying another one...`);
                    httpServer.listen(++port, host);
                }
            }
            else {
                httpServer.removeListener('error', onError);
                reject(e);
            }
        };
        httpServer.on('error', onError);
        httpServer.listen(port, host, () => {
            httpServer.removeListener('error', onError);
            resolve(port);
        });
    });
}
function setClientErrorHandler(server, logger) {
    server.on('clientError', (err, socket) => {
        let msg = '400 Bad Request';
        if (err.code === 'HPE_HEADER_OVERFLOW') {
            msg = '431 Request Header Fields Too Large';
            logger.warn(colors.yellow('Server responded with status code 431. ' +
                'See https://vitejs.dev/guide/troubleshooting.html#_431-request-header-fields-too-large.'));
        }
        if (err.code === 'ECONNRESET' || !socket.writable) {
            return;
        }
        socket.end(`HTTP/1.1 ${msg}\r\n\r\n`);
    });
}

const ERR_LOAD_URL = 'ERR_LOAD_URL';
const ERR_LOAD_PUBLIC_URL = 'ERR_LOAD_PUBLIC_URL';
const debugLoad = createDebugger('vite:load');
const debugTransform = createDebugger('vite:transform');
const debugCache$1 = createDebugger('vite:cache');
function transformRequest(url, server, options = {}) {
    if (server._restartPromise)
        throwClosedServerError();
    const cacheKey = (options.ssr ? 'ssr:' : options.html ? 'html:' : '') + url;
    // This module may get invalidated while we are processing it. For example
    // when a full page reload is needed after the re-processing of pre-bundled
    // dependencies when a missing dep is discovered. We save the current time
    // to compare it to the last invalidation performed to know if we should
    // cache the result of the transformation or we should discard it as stale.
    //
    // A module can be invalidated due to:
    // 1. A full reload because of pre-bundling newly discovered deps
    // 2. A full reload after a config change
    // 3. The file that generated the module changed
    // 4. Invalidation for a virtual module
    //
    // For 1 and 2, a new request for this module will be issued after
    // the invalidation as part of the browser reloading the page. For 3 and 4
    // there may not be a new request right away because of HMR handling.
    // In all cases, the next time this module is requested, it should be
    // re-processed.
    //
    // We save the timestamp when we start processing and compare it with the
    // last time this module is invalidated
    const timestamp = Date.now();
    const pending = server._pendingRequests.get(cacheKey);
    if (pending) {
        return server.moduleGraph
            .getModuleByUrl(removeTimestampQuery(url), options.ssr)
            .then((module) => {
            if (!module || pending.timestamp > module.lastInvalidationTimestamp) {
                // The pending request is still valid, we can safely reuse its result
                return pending.request;
            }
            else {
                // Request 1 for module A     (pending.timestamp)
                // Invalidate module A        (module.lastInvalidationTimestamp)
                // Request 2 for module A     (timestamp)
                // First request has been invalidated, abort it to clear the cache,
                // then perform a new doTransform.
                pending.abort();
                return transformRequest(url, server, options);
            }
        });
    }
    const request = doTransform(url, server, options, timestamp);
    // Avoid clearing the cache of future requests if aborted
    let cleared = false;
    const clearCache = () => {
        if (!cleared) {
            server._pendingRequests.delete(cacheKey);
            cleared = true;
        }
    };
    // Cache the request and clear it once processing is done
    server._pendingRequests.set(cacheKey, {
        request,
        timestamp,
        abort: clearCache,
    });
    return request.finally(clearCache);
}
async function doTransform(url, server, options, timestamp) {
    url = removeTimestampQuery(url);
    const { config, pluginContainer } = server;
    const prettyUrl = debugCache$1 ? prettifyUrl(url, config.root) : '';
    const ssr = !!options.ssr;
    const module = await server.moduleGraph.getModuleByUrl(url, ssr);
    // check if we have a fresh cache
    const cached = module && (ssr ? module.ssrTransformResult : module.transformResult);
    if (cached) {
        // TODO: check if the module is "partially invalidated" - i.e. an import
        // down the chain has been fully invalidated, but this current module's
        // content has not changed.
        // in this case, we can reuse its previous cached result and only update
        // its import timestamps.
        debugCache$1?.(`[memory] ${prettyUrl}`);
        return cached;
    }
    const resolved = module
        ? undefined
        : (await pluginContainer.resolveId(url, undefined, { ssr })) ?? undefined;
    // resolve
    const id = module?.id ?? resolved?.id ?? url;
    const result = loadAndTransform(id, url, server, options, timestamp, module, resolved);
    getDepsOptimizer(config, ssr)?.delayDepsOptimizerUntil(id, () => result);
    return result;
}
async function loadAndTransform(id, url, server, options, timestamp, mod, resolved) {
    const { config, pluginContainer, moduleGraph, watcher } = server;
    const { root, logger } = config;
    const prettyUrl = debugLoad || debugTransform ? prettifyUrl(url, config.root) : '';
    const ssr = !!options.ssr;
    const file = cleanUrl(id);
    let code = null;
    let map = null;
    // load
    const loadStart = debugLoad ? performance.now() : 0;
    const loadResult = await pluginContainer.load(id, { ssr });
    if (loadResult == null) {
        // if this is an html request and there is no load result, skip ahead to
        // SPA fallback.
        if (options.html && !id.endsWith('.html')) {
            return null;
        }
        // try fallback loading it from fs as string
        // if the file is a binary, there should be a plugin that already loaded it
        // as string
        // only try the fallback if access is allowed, skip for out of root url
        // like /service-worker.js or /api/users
        if (options.ssr || isFileServingAllowed(file, server)) {
            try {
                code = await fsp.readFile(file, 'utf-8');
                debugLoad?.(`${timeFrom(loadStart)} [fs] ${prettyUrl}`);
            }
            catch (e) {
                if (e.code !== 'ENOENT') {
                    throw e;
                }
            }
        }
        if (code) {
            try {
                map = (convertSourceMap.fromSource(code) ||
                    (await convertSourceMap.fromMapFileSource(code, createConvertSourceMapReadMap(file))))?.toObject();
                code = code.replace(convertSourceMap.mapFileCommentRegex, blankReplacer);
            }
            catch (e) {
                logger.warn(`Failed to load source map for ${url}.`, {
                    timestamp: true,
                });
            }
        }
    }
    else {
        debugLoad?.(`${timeFrom(loadStart)} [plugin] ${prettyUrl}`);
        if (isObject(loadResult)) {
            code = loadResult.code;
            map = loadResult.map;
        }
        else {
            code = loadResult;
        }
    }
    if (code == null) {
        const isPublicFile = checkPublicFile(url, config);
        const msg = isPublicFile
            ? `This file is in /public and will be copied as-is during build without ` +
                `going through the plugin transforms, and therefore should not be ` +
                `imported from source code. It can only be referenced via HTML tags.`
            : `Does the file exist?`;
        const importerMod = server.moduleGraph.idToModuleMap
            .get(id)
            ?.importers.values()
            .next().value;
        const importer = importerMod?.file || importerMod?.url;
        const err = new Error(`Failed to load url ${url} (resolved id: ${id})${importer ? ` in ${importer}` : ''}. ${msg}`);
        err.code = isPublicFile ? ERR_LOAD_PUBLIC_URL : ERR_LOAD_URL;
        throw err;
    }
    if (server._restartPromise)
        throwClosedServerError();
    // ensure module in graph after successful load
    mod ?? (mod = await moduleGraph._ensureEntryFromUrl(url, ssr, undefined, resolved));
    ensureWatchedFile(watcher, mod.file, root);
    // transform
    const transformStart = debugTransform ? performance.now() : 0;
    const transformResult = await pluginContainer.transform(code, id, {
        inMap: map,
        ssr,
    });
    const originalCode = code;
    if (transformResult == null ||
        (isObject(transformResult) && transformResult.code == null)) {
        // no transform applied, keep code as-is
        debugTransform?.(timeFrom(transformStart) + colors.dim(` [skipped] ${prettyUrl}`));
    }
    else {
        debugTransform?.(`${timeFrom(transformStart)} ${prettyUrl}`);
        code = transformResult.code;
        map = transformResult.map;
    }
    if (map && mod.file) {
        map = (typeof map === 'string' ? JSON.parse(map) : map);
        if (map.mappings && !map.sourcesContent) {
            await injectSourcesContent(map, mod.file, logger);
        }
        const sourcemapPath = `${mod.file}.map`;
        applySourcemapIgnoreList(map, sourcemapPath, config.server.sourcemapIgnoreList, logger);
        if (path.isAbsolute(mod.file)) {
            for (let sourcesIndex = 0; sourcesIndex < map.sources.length; ++sourcesIndex) {
                const sourcePath = map.sources[sourcesIndex];
                if (sourcePath) {
                    // Rewrite sources to relative paths to give debuggers the chance
                    // to resolve and display them in a meaningful way (rather than
                    // with absolute paths).
                    if (path.isAbsolute(sourcePath)) {
                        map.sources[sourcesIndex] = path.relative(path.dirname(mod.file), sourcePath);
                    }
                }
            }
        }
    }
    if (server._restartPromise)
        throwClosedServerError();
    const result = ssr && !server.config.experimental.skipSsrTransform
        ? await server.ssrTransform(code, map, url, originalCode)
        : {
            code,
            map,
            etag: getEtag(code, { weak: true }),
        };
    // Only cache the result if the module wasn't invalidated while it was
    // being processed, so it is re-processed next time if it is stale
    if (timestamp > mod.lastInvalidationTimestamp) {
        if (ssr)
            mod.ssrTransformResult = result;
        else
            mod.transformResult = result;
    }
    return result;
}
function createConvertSourceMapReadMap(originalFileName) {
    return (filename) => {
        return fsp.readFile(path.resolve(path.dirname(originalFileName), filename), 'utf-8');
    };
}

const ssrModuleExportsKey = `__vite_ssr_exports__`;
const ssrImportKey = `__vite_ssr_import__`;
const ssrDynamicImportKey = `__vite_ssr_dynamic_import__`;
const ssrExportAllKey = `__vite_ssr_exportAll__`;
const ssrImportMetaKey = `__vite_ssr_import_meta__`;
const hashbangRE = /^#!.*\n/;
async function ssrTransform(code, inMap, url, originalCode, options) {
    if (options?.json?.stringify && isJSONRequest(url)) {
        return ssrTransformJSON(code, inMap);
    }
    return ssrTransformScript(code, inMap, url, originalCode);
}
async function ssrTransformJSON(code, inMap) {
    return {
        code: code.replace('export default', `${ssrModuleExportsKey}.default =`),
        map: inMap,
        deps: [],
        dynamicDeps: [],
    };
}
async function ssrTransformScript(code, inMap, url, originalCode) {
    const s = new MagicString(code);
    let ast;
    try {
        ast = parser.parse(code, {
            sourceType: 'module',
            ecmaVersion: 'latest',
            locations: true,
            allowHashBang: true,
        });
    }
    catch (err) {
        if (!err.loc || !err.loc.line)
            throw err;
        const line = err.loc.line;
        throw new Error(`Parse failure: ${err.message}\nAt file: ${url}\nContents of line ${line}: ${code.split('\n')[line - 1]}`);
    }
    let uid = 0;
    const deps = new Set();
    const dynamicDeps = new Set();
    const idToImportMap = new Map();
    const declaredConst = new Set();
    // hoist at the start of the file, after the hashbang
    const hoistIndex = code.match(hashbangRE)?.[0].length ?? 0;
    function defineImport(source) {
        deps.add(source);
        const importId = `__vite_ssr_import_${uid++}__`;
        // There will be an error if the module is called before it is imported,
        // so the module import statement is hoisted to the top
        s.appendLeft(hoistIndex, `const ${importId} = await ${ssrImportKey}(${JSON.stringify(source)});\n`);
        return importId;
    }
    function defineExport(position, name, local = name) {
        s.appendLeft(position, `\nObject.defineProperty(${ssrModuleExportsKey}, "${name}", ` +
            `{ enumerable: true, configurable: true, get(){ return ${local} }});`);
    }
    // 1. check all import statements and record id -> importName map
    for (const node of ast.body) {
        // import foo from 'foo' --> foo -> __import_foo__.default
        // import { baz } from 'foo' --> baz -> __import_foo__.baz
        // import * as ok from 'foo' --> ok -> __import_foo__
        if (node.type === 'ImportDeclaration') {
            const importId = defineImport(node.source.value);
            s.remove(node.start, node.end);
            for (const spec of node.specifiers) {
                if (spec.type === 'ImportSpecifier') {
                    idToImportMap.set(spec.local.name, `${importId}.${spec.imported.name}`);
                }
                else if (spec.type === 'ImportDefaultSpecifier') {
                    idToImportMap.set(spec.local.name, `${importId}.default`);
                }
                else {
                    // namespace specifier
                    idToImportMap.set(spec.local.name, importId);
                }
            }
        }
    }
    // 2. check all export statements and define exports
    for (const node of ast.body) {
        // named exports
        if (node.type === 'ExportNamedDeclaration') {
            if (node.declaration) {
                if (node.declaration.type === 'FunctionDeclaration' ||
                    node.declaration.type === 'ClassDeclaration') {
                    // export function foo() {}
                    defineExport(node.end, node.declaration.id.name);
                }
                else {
                    // export const foo = 1, bar = 2
                    for (const declaration of node.declaration.declarations) {
                        const names = extract_names(declaration.id);
                        for (const name of names) {
                            defineExport(node.end, name);
                        }
                    }
                }
                s.remove(node.start, node.declaration.start);
            }
            else {
                s.remove(node.start, node.end);
                if (node.source) {
                    // export { foo, bar } from './foo'
                    const importId = defineImport(node.source.value);
                    // hoist re-exports near the defined import so they are immediately exported
                    for (const spec of node.specifiers) {
                        defineExport(hoistIndex, spec.exported.name, `${importId}.${spec.local.name}`);
                    }
                }
                else {
                    // export { foo, bar }
                    for (const spec of node.specifiers) {
                        const local = spec.local.name;
                        const binding = idToImportMap.get(local);
                        defineExport(node.end, spec.exported.name, binding || local);
                    }
                }
            }
        }
        // default export
        if (node.type === 'ExportDefaultDeclaration') {
            const expressionTypes = ['FunctionExpression', 'ClassExpression'];
            if ('id' in node.declaration &&
                node.declaration.id &&
                !expressionTypes.includes(node.declaration.type)) {
                // named hoistable/class exports
                // export default function foo() {}
                // export default class A {}
                const { name } = node.declaration.id;
                s.remove(node.start, node.start + 15 /* 'export default '.length */);
                s.append(`\nObject.defineProperty(${ssrModuleExportsKey}, "default", ` +
                    `{ enumerable: true, configurable: true, value: ${name} });`);
            }
            else {
                // anonymous default exports
                s.update(node.start, node.start + 14 /* 'export default'.length */, `${ssrModuleExportsKey}.default =`);
            }
        }
        // export * from './foo'
        if (node.type === 'ExportAllDeclaration') {
            s.remove(node.start, node.end);
            const importId = defineImport(node.source.value);
            // hoist re-exports near the defined import so they are immediately exported
            if (node.exported) {
                defineExport(hoistIndex, node.exported.name, `${importId}`);
            }
            else {
                s.appendLeft(hoistIndex, `${ssrExportAllKey}(${importId});\n`);
            }
        }
    }
    // 3. convert references to import bindings & import.meta references
    walk(ast, {
        onIdentifier(id, parent, parentStack) {
            const grandparent = parentStack[1];
            const binding = idToImportMap.get(id.name);
            if (!binding) {
                return;
            }
            if (isStaticProperty(parent) && parent.shorthand) {
                // let binding used in a property shorthand
                // { foo } -> { foo: __import_x__.foo }
                // skip for destructuring patterns
                if (!isNodeInPattern(parent) ||
                    isInDestructuringAssignment(parent, parentStack)) {
                    s.appendLeft(id.end, `: ${binding}`);
                }
            }
            else if ((parent.type === 'PropertyDefinition' &&
                grandparent?.type === 'ClassBody') ||
                (parent.type === 'ClassDeclaration' && id === parent.superClass)) {
                if (!declaredConst.has(id.name)) {
                    declaredConst.add(id.name);
                    // locate the top-most node containing the class declaration
                    const topNode = parentStack[parentStack.length - 2];
                    s.prependRight(topNode.start, `const ${id.name} = ${binding};\n`);
                }
            }
            else if (parent.type !== 'ClassExpression') {
                s.update(id.start, id.end, binding);
            }
        },
        onImportMeta(node) {
            s.update(node.start, node.end, ssrImportMetaKey);
        },
        onDynamicImport(node) {
            s.update(node.start, node.start + 6, ssrDynamicImportKey);
            if (node.type === 'ImportExpression' && node.source.type === 'Literal') {
                dynamicDeps.add(node.source.value);
            }
        },
    });
    let map = s.generateMap({ hires: true });
    if (inMap && inMap.mappings && inMap.sources.length > 0) {
        map = combineSourcemaps(url, [
            {
                ...map,
                sources: inMap.sources,
                sourcesContent: inMap.sourcesContent,
            },
            inMap,
        ], false);
    }
    else {
        map.sources = [path.basename(url)];
        // needs to use originalCode instead of code
        // because code might be already transformed even if map is null
        map.sourcesContent = [originalCode];
    }
    return {
        code: s.toString(),
        map,
        deps: [...deps],
        dynamicDeps: [...dynamicDeps],
    };
}
const isNodeInPatternWeakSet = new WeakSet();
const setIsNodeInPattern = (node) => isNodeInPatternWeakSet.add(node);
const isNodeInPattern = (node) => isNodeInPatternWeakSet.has(node);
/**
 * Same logic from \@vue/compiler-core & \@vue/compiler-sfc
 * Except this is using acorn AST
 */
function walk(root, { onIdentifier, onImportMeta, onDynamicImport }) {
    const parentStack = [];
    const varKindStack = [];
    const scopeMap = new WeakMap();
    const identifiers = [];
    const setScope = (node, name) => {
        let scopeIds = scopeMap.get(node);
        if (scopeIds && scopeIds.has(name)) {
            return;
        }
        if (!scopeIds) {
            scopeIds = new Set();
            scopeMap.set(node, scopeIds);
        }
        scopeIds.add(name);
    };
    function isInScope(name, parents) {
        return parents.some((node) => node && scopeMap.get(node)?.has(name));
    }
    function handlePattern(p, parentScope) {
        if (p.type === 'Identifier') {
            setScope(parentScope, p.name);
        }
        else if (p.type === 'RestElement') {
            handlePattern(p.argument, parentScope);
        }
        else if (p.type === 'ObjectPattern') {
            p.properties.forEach((property) => {
                if (property.type === 'RestElement') {
                    setScope(parentScope, property.argument.name);
                }
                else {
                    handlePattern(property.value, parentScope);
                }
            });
        }
        else if (p.type === 'ArrayPattern') {
            p.elements.forEach((element) => {
                if (element) {
                    handlePattern(element, parentScope);
                }
            });
        }
        else if (p.type === 'AssignmentPattern') {
            handlePattern(p.left, parentScope);
        }
        else {
            setScope(parentScope, p.name);
        }
    }
    walk$1(root, {
        enter(node, parent) {
            if (node.type === 'ImportDeclaration') {
                return this.skip();
            }
            // track parent stack, skip for "else-if"/"else" branches as acorn nests
            // the ast within "if" nodes instead of flattening them
            if (parent &&
                !(parent.type === 'IfStatement' && node === parent.alternate)) {
                parentStack.unshift(parent);
            }
            // track variable declaration kind stack used by VariableDeclarator
            if (node.type === 'VariableDeclaration') {
                varKindStack.unshift(node.kind);
            }
            if (node.type === 'MetaProperty' && node.meta.name === 'import') {
                onImportMeta(node);
            }
            else if (node.type === 'ImportExpression') {
                onDynamicImport(node);
            }
            if (node.type === 'Identifier') {
                if (!isInScope(node.name, parentStack) &&
                    isRefIdentifier(node, parent, parentStack)) {
                    // record the identifier, for DFS -> BFS
                    identifiers.push([node, parentStack.slice(0)]);
                }
            }
            else if (isFunction(node)) {
                // If it is a function declaration, it could be shadowing an import
                // Add its name to the scope so it won't get replaced
                if (node.type === 'FunctionDeclaration') {
                    const parentScope = findParentScope(parentStack);
                    if (parentScope) {
                        setScope(parentScope, node.id.name);
                    }
                }
                // walk function expressions and add its arguments to known identifiers
                // so that we don't prefix them
                node.params.forEach((p) => {
                    if (p.type === 'ObjectPattern' || p.type === 'ArrayPattern') {
                        handlePattern(p, node);
                        return;
                    }
                    walk$1(p.type === 'AssignmentPattern' ? p.left : p, {
                        enter(child, parent) {
                            // skip params default value of destructure
                            if (parent?.type === 'AssignmentPattern' &&
                                parent?.right === child) {
                                return this.skip();
                            }
                            if (child.type !== 'Identifier')
                                return;
                            // do not record as scope variable if is a destructuring keyword
                            if (isStaticPropertyKey(child, parent))
                                return;
                            // do not record if this is a default value
                            // assignment of a destructuring variable
                            if ((parent?.type === 'TemplateLiteral' &&
                                parent?.expressions.includes(child)) ||
                                (parent?.type === 'CallExpression' && parent?.callee === child)) {
                                return;
                            }
                            setScope(node, child.name);
                        },
                    });
                });
            }
            else if (node.type === 'Property' && parent.type === 'ObjectPattern') {
                // mark property in destructuring pattern
                setIsNodeInPattern(node);
            }
            else if (node.type === 'VariableDeclarator') {
                const parentFunction = findParentScope(parentStack, varKindStack[0] === 'var');
                if (parentFunction) {
                    handlePattern(node.id, parentFunction);
                }
            }
            else if (node.type === 'CatchClause' && node.param) {
                handlePattern(node.param, node);
            }
        },
        leave(node, parent) {
            // untrack parent stack from above
            if (parent &&
                !(parent.type === 'IfStatement' && node === parent.alternate)) {
                parentStack.shift();
            }
            if (node.type === 'VariableDeclaration') {
                varKindStack.shift();
            }
        },
    });
    // emit the identifier events in BFS so the hoisted declarations
    // can be captured correctly
    identifiers.forEach(([node, stack]) => {
        if (!isInScope(node.name, stack))
            onIdentifier(node, stack[0], stack);
    });
}
function isRefIdentifier(id, parent, parentStack) {
    // declaration id
    if (parent.type === 'CatchClause' ||
        ((parent.type === 'VariableDeclarator' ||
            parent.type === 'ClassDeclaration') &&
            parent.id === id)) {
        return false;
    }
    if (isFunction(parent)) {
        // function declaration/expression id
        if (parent.id === id) {
            return false;
        }
        // params list
        if (parent.params.includes(id)) {
            return false;
        }
    }
    // class method name
    if (parent.type === 'MethodDefinition' && !parent.computed) {
        return false;
    }
    // property key
    if (isStaticPropertyKey(id, parent)) {
        return false;
    }
    // object destructuring pattern
    if (isNodeInPattern(parent) && parent.value === id) {
        return false;
    }
    // non-assignment array destructuring pattern
    if (parent.type === 'ArrayPattern' &&
        !isInDestructuringAssignment(parent, parentStack)) {
        return false;
    }
    // member expression property
    if (parent.type === 'MemberExpression' &&
        parent.property === id &&
        !parent.computed) {
        return false;
    }
    if (parent.type === 'ExportSpecifier') {
        return false;
    }
    // is a special keyword but parsed as identifier
    if (id.name === 'arguments') {
        return false;
    }
    return true;
}
const isStaticProperty = (node) => node && node.type === 'Property' && !node.computed;
const isStaticPropertyKey = (node, parent) => isStaticProperty(parent) && parent.key === node;
const functionNodeTypeRE = /Function(?:Expression|Declaration)$|Method$/;
function isFunction(node) {
    return functionNodeTypeRE.test(node.type);
}
const blockNodeTypeRE = /^BlockStatement$|^For(?:In|Of)?Statement$/;
function isBlock(node) {
    return blockNodeTypeRE.test(node.type);
}
function findParentScope(parentStack, isVar = false) {
    return parentStack.find(isVar ? isFunction : isBlock);
}
function isInDestructuringAssignment(parent, parentStack) {
    if (parent &&
        (parent.type === 'Property' || parent.type === 'ArrayPattern')) {
        return parentStack.some((i) => i.type === 'AssignmentExpression');
    }
    return false;
}

let offset;
function calculateOffsetOnce() {
    if (offset !== undefined) {
        return;
    }
    try {
        new Function('throw new Error(1)')();
    }
    catch (e) {
        // in Node 12, stack traces account for the function wrapper.
        // in Node 13 and later, the function wrapper adds two lines,
        // which must be subtracted to generate a valid mapping
        const match = /:(\d+):\d+\)$/.exec(e.stack.split('\n')[1]);
        offset = match ? +match[1] - 1 : 0;
    }
}
function ssrRewriteStacktrace(stack, moduleGraph) {
    calculateOffsetOnce();
    return stack
        .split('\n')
        .map((line) => {
        return line.replace(/^ {4}at (?:(\S.*?)\s\()?(.+?):(\d+)(?::(\d+))?\)?/, (input, varName, id, line, column) => {
            if (!id)
                return input;
            const mod = moduleGraph.idToModuleMap.get(id);
            const rawSourceMap = mod?.ssrTransformResult?.map;
            if (!rawSourceMap) {
                return input;
            }
            const traced = new TraceMap(rawSourceMap);
            const pos = originalPositionFor(traced, {
                line: Number(line) - offset,
                // stacktrace's column is 1-indexed, but sourcemap's one is 0-indexed
                column: Number(column) - 1,
            });
            if (!pos.source || pos.line == null || pos.column == null) {
                return input;
            }
            const trimmedVarName = varName.trim();
            const sourceFile = path.resolve(path.dirname(id), pos.source);
            // stacktrace's column is 1-indexed, but sourcemap's one is 0-indexed
            const source = `${sourceFile}:${pos.line}:${pos.column + 1}`;
            if (!trimmedVarName || trimmedVarName === 'eval') {
                return `    at ${source}`;
            }
            else {
                return `    at ${trimmedVarName} (${source})`;
            }
        });
    })
        .join('\n');
}
function rebindErrorStacktrace(e, stacktrace) {
    const { configurable, writable } = Object.getOwnPropertyDescriptor(e, 'stack');
    if (configurable) {
        Object.defineProperty(e, 'stack', {
            value: stacktrace,
            enumerable: true,
            configurable: true,
            writable: true,
        });
    }
    else if (writable) {
        e.stack = stacktrace;
    }
}
const rewroteStacktraces = new WeakSet();
function ssrFixStacktrace(e, moduleGraph) {
    if (!e.stack)
        return;
    // stacktrace shouldn't be rewritten more than once
    if (rewroteStacktraces.has(e))
        return;
    const stacktrace = ssrRewriteStacktrace(e.stack, moduleGraph);
    rebindErrorStacktrace(e, stacktrace);
    rewroteStacktraces.add(e);
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const AsyncFunction = async function () { }.constructor;
let fnDeclarationLineCount = 0;
{
    const body = '/*code*/';
    const source = new AsyncFunction('a', 'b', body).toString();
    fnDeclarationLineCount =
        source.slice(0, source.indexOf(body)).split('\n').length - 1;
}
const pendingModules = new Map();
const pendingImports = new Map();
const importErrors = new WeakMap();
async function ssrLoadModule(url, server, context = { global }, urlStack = [], fixStacktrace) {
    url = unwrapId(url);
    // when we instantiate multiple dependency modules in parallel, they may
    // point to shared modules. We need to avoid duplicate instantiation attempts
    // by register every module as pending synchronously so that all subsequent
    // request to that module are simply waiting on the same promise.
    const pending = pendingModules.get(url);
    if (pending) {
        return pending;
    }
    const modulePromise = instantiateModule(url, server, context, urlStack, fixStacktrace);
    pendingModules.set(url, modulePromise);
    modulePromise
        .catch(() => {
        pendingImports.delete(url);
    })
        .finally(() => {
        pendingModules.delete(url);
    });
    return modulePromise;
}
async function instantiateModule(url, server, context = { global }, urlStack = [], fixStacktrace) {
    const { moduleGraph } = server;
    const mod = await moduleGraph.ensureEntryFromUrl(url, true);
    if (mod.ssrError) {
        throw mod.ssrError;
    }
    if (mod.ssrModule) {
        return mod.ssrModule;
    }
    const result = mod.ssrTransformResult ||
        (await transformRequest(url, server, { ssr: true }));
    if (!result) {
        // TODO more info? is this even necessary?
        throw new Error(`failed to load module for ssr: ${url}`);
    }
    const ssrModule = {
        [Symbol.toStringTag]: 'Module',
    };
    Object.defineProperty(ssrModule, '__esModule', { value: true });
    // Tolerate circular imports by ensuring the module can be
    // referenced before it's been instantiated.
    mod.ssrModule = ssrModule;
    const ssrImportMeta = {
        // The filesystem URL, matching native Node.js modules
        url: pathToFileURL(mod.file).toString(),
    };
    urlStack = urlStack.concat(url);
    const isCircular = (url) => urlStack.includes(url);
    const { isProduction, resolve: { dedupe, preserveSymlinks }, root, } = server.config;
    const resolveOptions = {
        mainFields: ['main'],
        browserField: true,
        conditions: [],
        overrideConditions: ['production', 'development'],
        extensions: ['.js', '.cjs', '.json'],
        dedupe,
        preserveSymlinks,
        isBuild: false,
        isProduction,
        root,
    };
    // Since dynamic imports can happen in parallel, we need to
    // account for multiple pending deps and duplicate imports.
    const pendingDeps = [];
    const ssrImport = async (dep) => {
        try {
            if (dep[0] !== '.' && dep[0] !== '/') {
                return await nodeImport(dep, mod.file, resolveOptions);
            }
            // convert to rollup URL because `pendingImports`, `moduleGraph.urlToModuleMap` requires that
            dep = unwrapId(dep);
            if (!isCircular(dep) && !pendingImports.get(dep)?.some(isCircular)) {
                pendingDeps.push(dep);
                if (pendingDeps.length === 1) {
                    pendingImports.set(url, pendingDeps);
                }
                const mod = await ssrLoadModule(dep, server, context, urlStack, fixStacktrace);
                if (pendingDeps.length === 1) {
                    pendingImports.delete(url);
                }
                else {
                    pendingDeps.splice(pendingDeps.indexOf(dep), 1);
                }
                // return local module to avoid race condition #5470
                return mod;
            }
            return moduleGraph.urlToModuleMap.get(dep)?.ssrModule;
        }
        catch (err) {
            // tell external error handler which mod was imported with error
            importErrors.set(err, { importee: dep });
            throw err;
        }
    };
    const ssrDynamicImport = (dep) => {
        // #3087 dynamic import vars is ignored at rewrite import path,
        // so here need process relative path
        if (dep[0] === '.') {
            dep = path.posix.resolve(path.dirname(url), dep);
        }
        return ssrImport(dep);
    };
    function ssrExportAll(sourceModule) {
        for (const key in sourceModule) {
            if (key !== 'default' && key !== '__esModule') {
                Object.defineProperty(ssrModule, key, {
                    enumerable: true,
                    configurable: true,
                    get() {
                        return sourceModule[key];
                    },
                });
            }
        }
    }
    let sourceMapSuffix = '';
    if (result.map) {
        const moduleSourceMap = Object.assign({}, result.map, {
            // currently we need to offset the line
            // https://github.com/nodejs/node/issues/43047#issuecomment-1180632750
            mappings: ';'.repeat(fnDeclarationLineCount) + result.map.mappings,
        });
        sourceMapSuffix =
            '\n//# sourceMappingURL=' + genSourceMapUrl(moduleSourceMap);
    }
    try {
        const initModule = new AsyncFunction(`global`, ssrModuleExportsKey, ssrImportMetaKey, ssrImportKey, ssrDynamicImportKey, ssrExportAllKey, '"use strict";' +
            result.code +
            `\n//# sourceURL=${mod.id}${sourceMapSuffix}`);
        await initModule(context.global, ssrModule, ssrImportMeta, ssrImport, ssrDynamicImport, ssrExportAll);
    }
    catch (e) {
        mod.ssrError = e;
        const errorData = importErrors.get(e);
        if (e.stack && fixStacktrace) {
            ssrFixStacktrace(e, moduleGraph);
        }
        server.config.logger.error(colors.red(`Error when evaluating SSR module ${url}:` +
            (errorData?.importee
                ? ` failed to import "${errorData.importee}"`
                : '') +
            `\n|- ${e.stack}\n`), {
            timestamp: true,
            clear: server.config.clearScreen,
            error: e,
        });
        throw e;
    }
    return Object.freeze(ssrModule);
}
// In node@12+ we can use dynamic import to load CJS and ESM
async function nodeImport(id, importer, resolveOptions) {
    let url;
    if (id.startsWith('node:') || id.startsWith('data:') || isBuiltin(id)) {
        url = id;
    }
    else {
        const resolved = tryNodeResolve(id, importer, 
        // Non-external modules can import ESM-only modules, but only outside
        // of test runs, because we use Node `require` in Jest to avoid segfault.
        // @ts-expect-error jest only exists when running Jest
        typeof jest === 'undefined'
            ? { ...resolveOptions, tryEsmOnly: true }
            : resolveOptions, false);
        if (!resolved) {
            const err = new Error(`Cannot find module '${id}' imported from '${importer}'`);
            err.code = 'ERR_MODULE_NOT_FOUND';
            throw err;
        }
        url = resolved.id;
        if (usingDynamicImport) {
            url = pathToFileURL(url).toString();
        }
    }
    const mod = await dynamicImport(url);
    return proxyESM(mod);
}
// rollup-style default import interop for cjs
function proxyESM(mod) {
    // This is the only sensible option when the exports object is a primitive
    if (isPrimitive(mod))
        return { default: mod };
    let defaultExport = 'default' in mod ? mod.default : mod;
    if (!isPrimitive(defaultExport) && '__esModule' in defaultExport) {
        mod = defaultExport;
        if ('default' in defaultExport) {
            defaultExport = defaultExport.default;
        }
    }
    return new Proxy(mod, {
        get(mod, prop) {
            if (prop === 'default')
                return defaultExport;
            return mod[prop] ?? defaultExport?.[prop];
        },
    });
}
function isPrimitive(value) {
    return !value || (typeof value !== 'object' && typeof value !== 'function');
}

function bindShortcuts(server, opts) {
    if (!server.httpServer || !process.stdin.isTTY || process.env.CI) {
        return;
    }
    server._shortcutsOptions = opts;
    if (opts.print) {
        server.config.logger.info(colors.dim(colors.green('  ➜')) +
            colors.dim('  press ') +
            colors.bold('h') +
            colors.dim(' to show help'));
    }
    const shortcuts = (opts.customShortcuts ?? [])
        .filter(isDefined)
        .concat(BASE_SHORTCUTS);
    let actionRunning = false;
    const onInput = async (input) => {
        // ctrl+c or ctrl+d
        if (input === '\x03' || input === '\x04') {
            await server.close().finally(() => process.exit(1));
            return;
        }
        if (actionRunning)
            return;
        if (input === 'h') {
            server.config.logger.info([
                '',
                colors.bold('  Shortcuts'),
                ...shortcuts.map((shortcut) => colors.dim('  press ') +
                    colors.bold(shortcut.key) +
                    colors.dim(` to ${shortcut.description}`)),
            ].join('\n'));
        }
        const shortcut = shortcuts.find((shortcut) => shortcut.key === input);
        if (!shortcut)
            return;
        actionRunning = true;
        await shortcut.action(server);
        actionRunning = false;
    };
    process.stdin.setRawMode(true);
    process.stdin.on('data', onInput).setEncoding('utf8').resume();
    server.httpServer.on('close', () => {
        process.stdin.off('data', onInput).pause();
    });
}
const BASE_SHORTCUTS = [
    {
        key: 'r',
        description: 'restart the server',
        async action(server) {
            await server.restart();
        },
    },
    {
        key: 'u',
        description: 'show server url',
        action(server) {
            server.config.logger.info('');
            server.printUrls();
        },
    },
    {
        key: 'o',
        description: 'open in browser',
        action(server) {
            server.openBrowser();
        },
    },
    {
        key: 'c',
        description: 'clear console',
        action(server) {
            server.config.logger.clearScreen('error');
        },
    },
    {
        key: 'q',
        description: 'quit',
        async action(server) {
            await server.close().finally(() => process.exit());
        },
    },
];

const HMR_HEADER = 'vite-hmr';
const wsServerEvents = [
    'connection',
    'error',
    'headers',
    'listening',
    'message',
];
function createWebSocketServer(server, config, httpsOptions) {
    let wss;
    let wsHttpServer = undefined;
    const hmr = isObject(config.server.hmr) && config.server.hmr;
    const hmrServer = hmr && hmr.server;
    const hmrPort = hmr && hmr.port;
    // TODO: the main server port may not have been chosen yet as it may use the next available
    const portsAreCompatible = !hmrPort || hmrPort === config.server.port;
    const wsServer = hmrServer || (portsAreCompatible && server);
    const customListeners = new Map();
    const clientsMap = new WeakMap();
    const port = hmrPort || 24678;
    const host = (hmr && hmr.host) || undefined;
    if (wsServer) {
        let hmrBase = config.base;
        const hmrPath = hmr ? hmr.path : undefined;
        if (hmrPath) {
            hmrBase = path.posix.join(hmrBase, hmrPath);
        }
        wss = new WebSocketServer({ noServer: true });
        wsServer.on('upgrade', (req, socket, head) => {
            if (req.headers['sec-websocket-protocol'] === HMR_HEADER &&
                req.url === hmrBase) {
                wss.handleUpgrade(req, socket, head, (ws) => {
                    wss.emit('connection', ws, req);
                });
            }
        });
    }
    else {
        // http server request handler keeps the same with
        // https://github.com/websockets/ws/blob/45e17acea791d865df6b255a55182e9c42e5877a/lib/websocket-server.js#L88-L96
        const route = ((_, res) => {
            const statusCode = 426;
            const body = STATUS_CODES[statusCode];
            if (!body)
                throw new Error(`No body text found for the ${statusCode} status code`);
            res.writeHead(statusCode, {
                'Content-Length': body.length,
                'Content-Type': 'text/plain',
            });
            res.end(body);
        });
        if (httpsOptions) {
            wsHttpServer = createServer$1(httpsOptions, route);
        }
        else {
            wsHttpServer = createServer$2(route);
        }
        // vite dev server in middleware mode
        // need to call ws listen manually
        wss = new WebSocketServer({ server: wsHttpServer });
    }
    wss.on('connection', (socket) => {
        socket.on('message', (raw) => {
            if (!customListeners.size)
                return;
            let parsed;
            try {
                parsed = JSON.parse(String(raw));
            }
            catch { }
            if (!parsed || parsed.type !== 'custom' || !parsed.event)
                return;
            const listeners = customListeners.get(parsed.event);
            if (!listeners?.size)
                return;
            const client = getSocketClient(socket);
            listeners.forEach((listener) => listener(parsed.data, client));
        });
        socket.on('error', (err) => {
            config.logger.error(`${colors.red(`ws error:`)}\n${err.stack}`, {
                timestamp: true,
                error: err,
            });
        });
        socket.send(JSON.stringify({ type: 'connected' }));
        if (bufferedError) {
            socket.send(JSON.stringify(bufferedError));
            bufferedError = null;
        }
    });
    wss.on('error', (e) => {
        if (e.code === 'EADDRINUSE') {
            config.logger.error(colors.red(`WebSocket server error: Port is already in use`), { error: e });
        }
        else {
            config.logger.error(colors.red(`WebSocket server error:\n${e.stack || e.message}`), { error: e });
        }
    });
    // Provide a wrapper to the ws client so we can send messages in JSON format
    // To be consistent with server.ws.send
    function getSocketClient(socket) {
        if (!clientsMap.has(socket)) {
            clientsMap.set(socket, {
                send: (...args) => {
                    let payload;
                    if (typeof args[0] === 'string') {
                        payload = {
                            type: 'custom',
                            event: args[0],
                            data: args[1],
                        };
                    }
                    else {
                        payload = args[0];
                    }
                    socket.send(JSON.stringify(payload));
                },
                socket,
            });
        }
        return clientsMap.get(socket);
    }
    // On page reloads, if a file fails to compile and returns 500, the server
    // sends the error payload before the client connection is established.
    // If we have no open clients, buffer the error and send it to the next
    // connected client.
    let bufferedError = null;
    return {
        listen: () => {
            wsHttpServer?.listen(port, host);
        },
        on: ((event, fn) => {
            if (wsServerEvents.includes(event))
                wss.on(event, fn);
            else {
                if (!customListeners.has(event)) {
                    customListeners.set(event, new Set());
                }
                customListeners.get(event).add(fn);
            }
        }),
        off: ((event, fn) => {
            if (wsServerEvents.includes(event)) {
                wss.off(event, fn);
            }
            else {
                customListeners.get(event)?.delete(fn);
            }
        }),
        get clients() {
            return new Set(Array.from(wss.clients).map(getSocketClient));
        },
        send(...args) {
            let payload;
            if (typeof args[0] === 'string') {
                payload = {
                    type: 'custom',
                    event: args[0],
                    data: args[1],
                };
            }
            else {
                payload = args[0];
            }
            if (payload.type === 'error' && !wss.clients.size) {
                bufferedError = payload;
                return;
            }
            const stringified = JSON.stringify(payload);
            wss.clients.forEach((client) => {
                // readyState 1 means the connection is open
                if (client.readyState === 1) {
                    client.send(stringified);
                }
            });
        },
        close() {
            return new Promise((resolve, reject) => {
                wss.clients.forEach((client) => {
                    client.terminate();
                });
                wss.close((err) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        if (wsHttpServer) {
                            wsHttpServer.close((err) => {
                                if (err) {
                                    reject(err);
                                }
                                else {
                                    resolve();
                                }
                            });
                        }
                        else {
                            resolve();
                        }
                    }
                });
            });
        },
    };
}

// this middleware is only active when (base !== '/')
function baseMiddleware({ config, }) {
    // Keep the named function. The name is visible in debug logs via `DEBUG=connect:dispatcher ...`
    return function viteBaseMiddleware(req, res, next) {
        const url = req.url;
        const parsed = new URL(url, 'http://vitejs.dev');
        const path = parsed.pathname || '/';
        const base = config.rawBase;
        if (path.startsWith(base)) {
            // rewrite url to remove base. this ensures that other middleware does
            // not need to consider base being prepended or not
            req.url = stripBase(url, base);
            return next();
        }
        // skip redirect and error fallback on middleware mode, #4057
        if (config.server.middlewareMode) {
            return next();
        }
        if (path === '/' || path === '/index.html') {
            // redirect root visit to based url with search and hash
            res.writeHead(302, {
                Location: base + (parsed.search || '') + (parsed.hash || ''),
            });
            res.end();
            return;
        }
        else if (req.headers.accept?.includes('text/html')) {
            // non-based page visit
            const redirectPath = url + '/' !== base ? joinUrlSegments(base, url) : base;
            res.writeHead(404, {
                'Content-Type': 'text/html',
            });
            res.end(`The server is configured with a public base URL of ${base} - ` +
                `did you mean to visit <a href="${redirectPath}">${redirectPath}</a> instead?`);
            return;
        }
        next();
    };
}

const debug$1 = createDebugger('vite:proxy');
function proxyMiddleware(httpServer, options, config) {
    // lazy require only when proxy is used
    const proxies = {};
    Object.keys(options).forEach((context) => {
        let opts = options[context];
        if (!opts) {
            return;
        }
        if (typeof opts === 'string') {
            opts = { target: opts, changeOrigin: true };
        }
        const proxy = httpProxy.createProxyServer(opts);
        if (opts.configure) {
            opts.configure(proxy, opts);
        }
        proxy.on('error', (err, req, originalRes) => {
            // When it is ws proxy, res is net.Socket
            const res = originalRes;
            if ('req' in res) {
                config.logger.error(`${colors.red(`http proxy error at ${originalRes.req.url}:`)}\n${err.stack}`, {
                    timestamp: true,
                    error: err,
                });
                if (!res.headersSent && !res.writableEnded) {
                    res
                        .writeHead(500, {
                        'Content-Type': 'text/plain',
                    })
                        .end();
                }
            }
            else {
                config.logger.error(`${colors.red(`ws proxy error:`)}\n${err.stack}`, {
                    timestamp: true,
                    error: err,
                });
                res.end();
            }
        });
        proxy.on('proxyReqWs', (proxyReq, req, socket, options, head) => {
            socket.on('error', (err) => {
                config.logger.error(`${colors.red(`ws proxy socket error:`)}\n${err.stack}`, {
                    timestamp: true,
                    error: err,
                });
            });
        });
        // clone before saving because http-proxy mutates the options
        proxies[context] = [proxy, { ...opts }];
    });
    if (httpServer) {
        httpServer.on('upgrade', (req, socket, head) => {
            const url = req.url;
            for (const context in proxies) {
                if (doesProxyContextMatchUrl(context, url)) {
                    const [proxy, opts] = proxies[context];
                    if (opts.ws ||
                        opts.target?.toString().startsWith('ws:') ||
                        opts.target?.toString().startsWith('wss:')) {
                        if (opts.rewrite) {
                            req.url = opts.rewrite(url);
                        }
                        debug$1?.(`${req.url} -> ws ${opts.target}`);
                        proxy.ws(req, socket, head);
                        return;
                    }
                }
            }
        });
    }
    // Keep the named function. The name is visible in debug logs via `DEBUG=connect:dispatcher ...`
    return function viteProxyMiddleware(req, res, next) {
        const url = req.url;
        for (const context in proxies) {
            if (doesProxyContextMatchUrl(context, url)) {
                const [proxy, opts] = proxies[context];
                const options = {};
                if (opts.bypass) {
                    const bypassResult = opts.bypass(req, res, opts);
                    if (typeof bypassResult === 'string') {
                        req.url = bypassResult;
                        debug$1?.(`bypass: ${req.url} -> ${bypassResult}`);
                        return next();
                    }
                    else if (bypassResult === false) {
                        debug$1?.(`bypass: ${req.url} -> 404`);
                        return res.end(404);
                    }
                }
                debug$1?.(`${req.url} -> ${opts.target || opts.forward}`);
                if (opts.rewrite) {
                    req.url = opts.rewrite(req.url);
                }
                proxy.web(req, res, options);
                return;
            }
        }
        next();
    };
}
function doesProxyContextMatchUrl(context, url) {
    return ((context[0] === '^' && new RegExp(context).test(url)) ||
        url.startsWith(context));
}

function htmlFallbackMiddleware(root, spaFallback) {
    const historyHtmlFallbackMiddleware = history({
        logger: createDebugger('vite:html-fallback'),
        // support /dir/ without explicit index.html
        rewrites: [
            {
                from: /\/$/,
                to({ parsedUrl, request }) {
                    const rewritten = decodeURIComponent(parsedUrl.pathname) + 'index.html';
                    if (fs.existsSync(path.join(root, rewritten))) {
                        return rewritten;
                    }
                    return spaFallback ? `/index.html` : request.url;
                },
            },
        ],
    });
    // Keep the named function. The name is visible in debug logs via `DEBUG=connect:dispatcher ...`
    return function viteHtmlFallbackMiddleware(req, res, next) {
        return historyHtmlFallbackMiddleware(req, res, next);
    };
}

const debugCache = createDebugger('vite:cache');
const knownIgnoreList = new Set(['/', '/favicon.ico']);
function transformMiddleware(server) {
    const { config: { root, logger }, moduleGraph, } = server;
    // Keep the named function. The name is visible in debug logs via `DEBUG=connect:dispatcher ...`
    return async function viteTransformMiddleware(req, res, next) {
        if (req.method !== 'GET' || knownIgnoreList.has(req.url)) {
            return next();
        }
        let url;
        try {
            url = decodeURI(removeTimestampQuery(req.url)).replace(NULL_BYTE_PLACEHOLDER, '\0');
        }
        catch (e) {
            return next(e);
        }
        const withoutQuery = cleanUrl(url);
        try {
            const isSourceMap = withoutQuery.endsWith('.map');
            // since we generate source map references, handle those requests here
            if (isSourceMap) {
                const depsOptimizer = getDepsOptimizer(server.config, false); // non-ssr
                if (depsOptimizer?.isOptimizedDepUrl(url)) {
                    // If the browser is requesting a source map for an optimized dep, it
                    // means that the dependency has already been pre-bundled and loaded
                    const sourcemapPath = url.startsWith(FS_PREFIX)
                        ? fsPathFromId(url)
                        : normalizePath(path.resolve(root, url.slice(1)));
                    try {
                        const map = JSON.parse(await fsp.readFile(sourcemapPath, 'utf-8'));
                        applySourcemapIgnoreList(map, sourcemapPath, server.config.server.sourcemapIgnoreList, logger);
                        return send(req, res, JSON.stringify(map), 'json', {
                            headers: server.config.server.headers,
                        });
                    }
                    catch (e) {
                        // Outdated source map request for optimized deps, this isn't an error
                        // but part of the normal flow when re-optimizing after missing deps
                        // Send back an empty source map so the browser doesn't issue warnings
                        const dummySourceMap = {
                            version: 3,
                            file: sourcemapPath.replace(/\.map$/, ''),
                            sources: [],
                            sourcesContent: [],
                            names: [],
                            mappings: ';;;;;;;;;',
                        };
                        return send(req, res, JSON.stringify(dummySourceMap), 'json', {
                            cacheControl: 'no-cache',
                            headers: server.config.server.headers,
                        });
                    }
                }
                else {
                    const originalUrl = url.replace(/\.map($|\?)/, '$1');
                    const map = (await moduleGraph.getModuleByUrl(originalUrl, false))
                        ?.transformResult?.map;
                    if (map) {
                        return send(req, res, JSON.stringify(map), 'json', {
                            headers: server.config.server.headers,
                        });
                    }
                    else {
                        return next();
                    }
                }
            }
            // check if public dir is inside root dir
            const publicDir = normalizePath(server.config.publicDir);
            const rootDir = normalizePath(server.config.root);
            if (publicDir.startsWith(rootDir)) {
                const publicPath = `${publicDir.slice(rootDir.length)}/`;
                // warn explicit public paths
                if (url.startsWith(publicPath)) {
                    let warning;
                    if (isImportRequest(url)) {
                        const rawUrl = removeImportQuery(url);
                        if (urlRE.test(url)) {
                            warning =
                                `Assets in the public directory are served at the root path.\n` +
                                    `Instead of ${colors.cyan(rawUrl)}, use ${colors.cyan(rawUrl.replace(publicPath, '/'))}.`;
                        }
                        else {
                            warning =
                                'Assets in public directory cannot be imported from JavaScript.\n' +
                                    `If you intend to import that asset, put the file in the src directory, and use ${colors.cyan(rawUrl.replace(publicPath, '/src/'))} instead of ${colors.cyan(rawUrl)}.\n` +
                                    `If you intend to use the URL of that asset, use ${colors.cyan(injectQuery(rawUrl.replace(publicPath, '/'), 'url'))}.`;
                        }
                    }
                    else {
                        warning =
                            `files in the public directory are served at the root path.\n` +
                                `Instead of ${colors.cyan(url)}, use ${colors.cyan(url.replace(publicPath, '/'))}.`;
                    }
                    logger.warn(colors.yellow(warning));
                }
            }
            if (isJSRequest(url) ||
                isImportRequest(url) ||
                isCSSRequest(url) ||
                isHTMLProxy(url)) {
                // strip ?import
                url = removeImportQuery(url);
                // Strip valid id prefix. This is prepended to resolved Ids that are
                // not valid browser import specifiers by the importAnalysis plugin.
                url = unwrapId(url);
                // for CSS, we need to differentiate between normal CSS requests and
                // imports
                if (isCSSRequest(url) &&
                    !isDirectRequest(url) &&
                    req.headers.accept?.includes('text/css')) {
                    url = injectQuery(url, 'direct');
                }
                // check if we can return 304 early
                const ifNoneMatch = req.headers['if-none-match'];
                if (ifNoneMatch &&
                    (await moduleGraph.getModuleByUrl(url, false))?.transformResult
                        ?.etag === ifNoneMatch) {
                    debugCache?.(`[304] ${prettifyUrl(url, root)}`);
                    res.statusCode = 304;
                    return res.end();
                }
                // resolve, load and transform using the plugin container
                const result = await transformRequest(url, server, {
                    html: req.headers.accept?.includes('text/html'),
                });
                if (result) {
                    const depsOptimizer = getDepsOptimizer(server.config, false); // non-ssr
                    const type = isDirectCSSRequest(url) ? 'css' : 'js';
                    const isDep = DEP_VERSION_RE.test(url) || depsOptimizer?.isOptimizedDepUrl(url);
                    return send(req, res, result.code, type, {
                        etag: result.etag,
                        // allow browser to cache npm deps!
                        cacheControl: isDep ? 'max-age=31536000,immutable' : 'no-cache',
                        headers: server.config.server.headers,
                        map: result.map,
                    });
                }
            }
        }
        catch (e) {
            if (e?.code === ERR_OPTIMIZE_DEPS_PROCESSING_ERROR) {
                // Skip if response has already been sent
                if (!res.writableEnded) {
                    res.statusCode = 504; // status code request timeout
                    res.statusMessage = 'Optimize Deps Processing Error';
                    res.end();
                }
                // This timeout is unexpected
                logger.error(e.message);
                return;
            }
            if (e?.code === ERR_OUTDATED_OPTIMIZED_DEP) {
                // Skip if response has already been sent
                if (!res.writableEnded) {
                    res.statusCode = 504; // status code request timeout
                    res.statusMessage = 'Outdated Optimize Dep';
                    res.end();
                }
                // We don't need to log an error in this case, the request
                // is outdated because new dependencies were discovered and
                // the new pre-bundle dependencies have changed.
                // A full-page reload has been issued, and these old requests
                // can't be properly fulfilled. This isn't an unexpected
                // error but a normal part of the missing deps discovery flow
                return;
            }
            if (e?.code === ERR_CLOSED_SERVER) {
                // Skip if response has already been sent
                if (!res.writableEnded) {
                    res.statusCode = 504; // status code request timeout
                    res.statusMessage = 'Outdated Request';
                    res.end();
                }
                // We don't need to log an error in this case, the request
                // is outdated because new dependencies were discovered and
                // the new pre-bundle dependencies have changed.
                // A full-page reload has been issued, and these old requests
                // can't be properly fulfilled. This isn't an unexpected
                // error but a normal part of the missing deps discovery flow
                return;
            }
            if (e?.code === ERR_LOAD_URL) {
                // Let other middleware handle if we can't load the url via transformRequest
                return next();
            }
            return next(e);
        }
        next();
    };
}

function createDevHtmlTransformFn(server) {
    const [preHooks, normalHooks, postHooks] = resolveHtmlTransforms(server.config.plugins);
    return (url, html, originalUrl) => {
        return applyHtmlTransforms(html, [
            preImportMapHook(server.config),
            ...preHooks,
            htmlEnvHook(server.config),
            devHtmlHook,
            ...normalHooks,
            ...postHooks,
            postImportMapHook(),
        ], {
            path: url,
            filename: getHtmlFilename(url, server),
            server,
            originalUrl,
        });
    };
}
function getHtmlFilename(url, server) {
    if (url.startsWith(FS_PREFIX)) {
        return decodeURIComponent(fsPathFromId(url));
    }
    else {
        return decodeURIComponent(normalizePath(path.join(server.config.root, url.slice(1))));
    }
}
function shouldPreTransform(url, config) {
    return (!checkPublicFile(url, config) && (isJSRequest(url) || isCSSRequest(url)));
}
const processNodeUrl = (attr, sourceCodeLocation, s, config, htmlPath, originalUrl, server) => {
    let url = attr.value || '';
    if (server?.moduleGraph) {
        const mod = server.moduleGraph.urlToModuleMap.get(url);
        if (mod && mod.lastHMRTimestamp > 0) {
            url = injectQuery(url, `t=${mod.lastHMRTimestamp}`);
        }
    }
    const devBase = config.base;
    if (url[0] === '/' && url[1] !== '/') {
        // prefix with base (dev only, base is never relative)
        const fullUrl = path.posix.join(devBase, url);
        overwriteAttrValue(s, sourceCodeLocation, fullUrl);
        if (server && shouldPreTransform(url, config)) {
            preTransformRequest(server, fullUrl, devBase);
        }
    }
    else if (url[0] === '.' &&
        originalUrl &&
        originalUrl !== '/' &&
        htmlPath === '/index.html') {
        // prefix with base (dev only, base is never relative)
        const replacer = (url) => {
            const fullUrl = path.posix.join(devBase, url);
            if (server && shouldPreTransform(url, config)) {
                preTransformRequest(server, fullUrl, devBase);
            }
            return fullUrl;
        };
        // #3230 if some request url (localhost:3000/a/b) return to fallback html, the relative assets
        // path will add `/a/` prefix, it will caused 404.
        // rewrite before `./index.js` -> `localhost:5173/a/index.js`.
        // rewrite after `../index.js` -> `localhost:5173/index.js`.
        const processedUrl = attr.name === 'srcset' && attr.prefix === undefined
            ? processSrcSetSync(url, ({ url }) => replacer(url))
            : replacer(url);
        overwriteAttrValue(s, sourceCodeLocation, processedUrl);
    }
};
const devHtmlHook = async (html, { path: htmlPath, filename, server, originalUrl }) => {
    const { config, moduleGraph, watcher } = server;
    const base = config.base || '/';
    let proxyModulePath;
    let proxyModuleUrl;
    const trailingSlash = htmlPath.endsWith('/');
    if (!trailingSlash && fs.existsSync(filename)) {
        proxyModulePath = htmlPath;
        proxyModuleUrl = joinUrlSegments(base, htmlPath);
    }
    else {
        // There are users of vite.transformIndexHtml calling it with url '/'
        // for SSR integrations #7993, filename is root for this case
        // A user may also use a valid name for a virtual html file
        // Mark the path as virtual in both cases so sourcemaps aren't processed
        // and ids are properly handled
        const validPath = `${htmlPath}${trailingSlash ? 'index.html' : ''}`;
        proxyModulePath = `\0${validPath}`;
        proxyModuleUrl = wrapId(proxyModulePath);
    }
    const s = new MagicString(html);
    let inlineModuleIndex = -1;
    const proxyCacheUrl = cleanUrl(proxyModulePath).replace(normalizePath(config.root), '');
    const styleUrl = [];
    const addInlineModule = (node, ext) => {
        inlineModuleIndex++;
        const contentNode = node.childNodes[0];
        const code = contentNode.value;
        let map;
        if (proxyModulePath[0] !== '\0') {
            map = new MagicString(html)
                .snip(contentNode.sourceCodeLocation.startOffset, contentNode.sourceCodeLocation.endOffset)
                .generateMap({ hires: true });
            map.sources = [filename];
            map.file = filename;
        }
        // add HTML Proxy to Map
        addToHTMLProxyCache(config, proxyCacheUrl, inlineModuleIndex, { code, map });
        // inline js module. convert to src="proxy" (dev only, base is never relative)
        const modulePath = `${proxyModuleUrl}?html-proxy&index=${inlineModuleIndex}.${ext}`;
        // invalidate the module so the newly cached contents will be served
        const module = server?.moduleGraph.getModuleById(modulePath);
        if (module) {
            server?.moduleGraph.invalidateModule(module);
        }
        s.update(node.sourceCodeLocation.startOffset, node.sourceCodeLocation.endOffset, `<script type="module" src="${modulePath}"></script>`);
        preTransformRequest(server, modulePath, base);
    };
    await traverseHtml(html, filename, (node) => {
        if (!nodeIsElement(node)) {
            return;
        }
        // script tags
        if (node.nodeName === 'script') {
            const { src, sourceCodeLocation, isModule } = getScriptInfo(node);
            if (src) {
                processNodeUrl(src, sourceCodeLocation, s, config, htmlPath, originalUrl, server);
            }
            else if (isModule && node.childNodes.length) {
                addInlineModule(node, 'js');
            }
        }
        if (node.nodeName === 'style' && node.childNodes.length) {
            const children = node.childNodes[0];
            styleUrl.push({
                start: children.sourceCodeLocation.startOffset,
                end: children.sourceCodeLocation.endOffset,
                code: children.value,
            });
        }
        // elements with [href/src] attrs
        const assetAttrs = assetAttrsConfig[node.nodeName];
        if (assetAttrs) {
            for (const p of node.attrs) {
                const attrKey = getAttrKey(p);
                if (p.value && assetAttrs.includes(attrKey)) {
                    processNodeUrl(p, node.sourceCodeLocation.attrs[attrKey], s, config, htmlPath, originalUrl);
                }
            }
        }
    });
    await Promise.all(styleUrl.map(async ({ start, end, code }, index) => {
        const url = `${proxyModulePath}?html-proxy&direct&index=${index}.css`;
        // ensure module in graph after successful load
        const mod = await moduleGraph.ensureEntryFromUrl(url, false);
        ensureWatchedFile(watcher, mod.file, config.root);
        const result = await server.pluginContainer.transform(code, mod.id);
        let content = '';
        if (result) {
            if (result.map) {
                if (result.map.mappings && !result.map.sourcesContent) {
                    await injectSourcesContent(result.map, proxyModulePath, config.logger);
                }
                content = getCodeWithSourcemap('css', result.code, result.map);
            }
            else {
                content = result.code;
            }
        }
        s.overwrite(start, end, content);
    }));
    html = s.toString();
    return {
        html,
        tags: [
            {
                tag: 'script',
                attrs: {
                    type: 'module',
                    src: path.posix.join(base, CLIENT_PUBLIC_PATH),
                },
                injectTo: 'head-prepend',
            },
        ],
    };
};
function indexHtmlMiddleware(server) {
    // Keep the named function. The name is visible in debug logs via `DEBUG=connect:dispatcher ...`
    return async function viteIndexHtmlMiddleware(req, res, next) {
        if (res.writableEnded) {
            return next();
        }
        const url = req.url && cleanUrl(req.url);
        // htmlFallbackMiddleware appends '.html' to URLs
        if (url?.endsWith('.html') && req.headers['sec-fetch-dest'] !== 'script') {
            const filename = getHtmlFilename(url, server);
            if (fs.existsSync(filename)) {
                try {
                    let html = await fsp.readFile(filename, 'utf-8');
                    html = await server.transformIndexHtml(url, html, req.originalUrl);
                    return send(req, res, html, 'html', {
                        headers: server.config.server.headers,
                    });
                }
                catch (e) {
                    return next(e);
                }
            }
        }
        next();
    };
}
function preTransformRequest(server, url, base) {
    if (!server.config.server.preTransformRequests)
        return;
    url = unwrapId(stripBase(url, base));
    // transform all url as non-ssr as html includes client-side assets only
    server.transformRequest(url).catch((e) => {
        if (e?.code === ERR_OUTDATED_OPTIMIZED_DEP ||
            e?.code === ERR_CLOSED_SERVER) {
            // these are expected errors
            return;
        }
        // Unexpected error, log the issue but avoid an unhandled exception
        server.config.logger.error(e.message);
    });
}

const logTime = createDebugger('vite:time');
function timeMiddleware(root) {
    // Keep the named function. The name is visible in debug logs via `DEBUG=connect:dispatcher ...`
    return function viteTimeMiddleware(req, res, next) {
        const start = performance.now();
        const end = res.end;
        res.end = (...args) => {
            logTime?.(`${timeFrom(start)} ${prettifyUrl(req.url, root)}`);
            return end.call(res, ...args);
        };
        next();
    };
}

class ModuleNode {
    /**
     * @param setIsSelfAccepting - set `false` to set `isSelfAccepting` later. e.g. #7870
     */
    constructor(url, setIsSelfAccepting = true) {
        /**
         * Resolved file system path + query
         */
        this.id = null;
        this.file = null;
        this.importers = new Set();
        this.clientImportedModules = new Set();
        this.ssrImportedModules = new Set();
        this.acceptedHmrDeps = new Set();
        this.acceptedHmrExports = null;
        this.importedBindings = null;
        this.transformResult = null;
        this.ssrTransformResult = null;
        this.ssrModule = null;
        this.ssrError = null;
        this.lastHMRTimestamp = 0;
        this.lastInvalidationTimestamp = 0;
        this.url = url;
        this.type = isDirectCSSRequest(url) ? 'css' : 'js';
        if (setIsSelfAccepting) {
            this.isSelfAccepting = false;
        }
    }
    get importedModules() {
        const importedModules = new Set(this.clientImportedModules);
        for (const module of this.ssrImportedModules) {
            importedModules.add(module);
        }
        return importedModules;
    }
}
class ModuleGraph {
    constructor(resolveId) {
        this.resolveId = resolveId;
        this.urlToModuleMap = new Map();
        this.idToModuleMap = new Map();
        // a single file may corresponds to multiple modules with different queries
        this.fileToModulesMap = new Map();
        this.safeModulesPath = new Set();
        /**
         * @internal
         */
        this._unresolvedUrlToModuleMap = new Map();
        /**
         * @internal
         */
        this._ssrUnresolvedUrlToModuleMap = new Map();
    }
    async getModuleByUrl(rawUrl, ssr) {
        // Quick path, if we already have a module for this rawUrl (even without extension)
        rawUrl = removeImportQuery(removeTimestampQuery(rawUrl));
        const mod = this._getUnresolvedUrlToModule(rawUrl, ssr);
        if (mod) {
            return mod;
        }
        const [url] = await this._resolveUrl(rawUrl, ssr);
        return this.urlToModuleMap.get(url);
    }
    getModuleById(id) {
        return this.idToModuleMap.get(removeTimestampQuery(id));
    }
    getModulesByFile(file) {
        return this.fileToModulesMap.get(file);
    }
    onFileChange(file) {
        const mods = this.getModulesByFile(file);
        if (mods) {
            const seen = new Set();
            mods.forEach((mod) => {
                this.invalidateModule(mod, seen);
            });
        }
    }
    invalidateModule(mod, seen = new Set(), timestamp = Date.now(), isHmr = false) {
        if (seen.has(mod)) {
            return;
        }
        seen.add(mod);
        if (isHmr) {
            mod.lastHMRTimestamp = timestamp;
        }
        else {
            // Save the timestamp for this invalidation, so we can avoid caching the result of possible already started
            // processing being done for this module
            mod.lastInvalidationTimestamp = timestamp;
        }
        // Don't invalidate mod.info and mod.meta, as they are part of the processing pipeline
        // Invalidating the transform result is enough to ensure this module is re-processed next time it is requested
        mod.transformResult = null;
        mod.ssrTransformResult = null;
        mod.ssrModule = null;
        mod.ssrError = null;
        mod.importers.forEach((importer) => {
            if (!importer.acceptedHmrDeps.has(mod)) {
                this.invalidateModule(importer, seen, timestamp, isHmr);
            }
        });
    }
    invalidateAll() {
        const timestamp = Date.now();
        const seen = new Set();
        this.idToModuleMap.forEach((mod) => {
            this.invalidateModule(mod, seen, timestamp);
        });
    }
    /**
     * Update the module graph based on a module's updated imports information
     * If there are dependencies that no longer have any importers, they are
     * returned as a Set.
     */
    async updateModuleInfo(mod, importedModules, importedBindings, acceptedModules, acceptedExports, isSelfAccepting, ssr) {
        mod.isSelfAccepting = isSelfAccepting;
        const prevImports = ssr ? mod.ssrImportedModules : mod.clientImportedModules;
        let noLongerImported;
        let resolvePromises = [];
        let resolveResults = new Array(importedModules.size);
        let index = 0;
        // update import graph
        for (const imported of importedModules) {
            const nextIndex = index++;
            if (typeof imported === 'string') {
                resolvePromises.push(this.ensureEntryFromUrl(imported, ssr).then((dep) => {
                    dep.importers.add(mod);
                    resolveResults[nextIndex] = dep;
                }));
            }
            else {
                imported.importers.add(mod);
                resolveResults[nextIndex] = imported;
            }
        }
        if (resolvePromises.length) {
            await Promise.all(resolvePromises);
        }
        const nextImports = new Set(resolveResults);
        if (ssr) {
            mod.ssrImportedModules = nextImports;
        }
        else {
            mod.clientImportedModules = nextImports;
        }
        // remove the importer from deps that were imported but no longer are.
        prevImports.forEach((dep) => {
            if (!mod.clientImportedModules.has(dep) &&
                !mod.ssrImportedModules.has(dep)) {
                dep.importers.delete(mod);
                if (!dep.importers.size) {
                    (noLongerImported || (noLongerImported = new Set())).add(dep);
                }
            }
        });
        // update accepted hmr deps
        resolvePromises = [];
        resolveResults = new Array(acceptedModules.size);
        index = 0;
        for (const accepted of acceptedModules) {
            const nextIndex = index++;
            if (typeof accepted === 'string') {
                resolvePromises.push(this.ensureEntryFromUrl(accepted, ssr).then((dep) => {
                    resolveResults[nextIndex] = dep;
                }));
            }
            else {
                resolveResults[nextIndex] = accepted;
            }
        }
        if (resolvePromises.length) {
            await Promise.all(resolvePromises);
        }
        mod.acceptedHmrDeps = new Set(resolveResults);
        // update accepted hmr exports
        mod.acceptedHmrExports = acceptedExports;
        mod.importedBindings = importedBindings;
        return noLongerImported;
    }
    async ensureEntryFromUrl(rawUrl, ssr, setIsSelfAccepting = true) {
        return this._ensureEntryFromUrl(rawUrl, ssr, setIsSelfAccepting);
    }
    /**
     * @internal
     */
    async _ensureEntryFromUrl(rawUrl, ssr, setIsSelfAccepting = true, 
    // Optimization, avoid resolving the same url twice if the caller already did it
    resolved) {
        // Quick path, if we already have a module for this rawUrl (even without extension)
        rawUrl = removeImportQuery(removeTimestampQuery(rawUrl));
        let mod = this._getUnresolvedUrlToModule(rawUrl, ssr);
        if (mod) {
            return mod;
        }
        const modPromise = (async () => {
            const [url, resolvedId, meta] = await this._resolveUrl(rawUrl, ssr, resolved);
            mod = this.idToModuleMap.get(resolvedId);
            if (!mod) {
                mod = new ModuleNode(url, setIsSelfAccepting);
                if (meta)
                    mod.meta = meta;
                this.urlToModuleMap.set(url, mod);
                mod.id = resolvedId;
                this.idToModuleMap.set(resolvedId, mod);
                const file = (mod.file = cleanUrl(resolvedId));
                let fileMappedModules = this.fileToModulesMap.get(file);
                if (!fileMappedModules) {
                    fileMappedModules = new Set();
                    this.fileToModulesMap.set(file, fileMappedModules);
                }
                fileMappedModules.add(mod);
            }
            // multiple urls can map to the same module and id, make sure we register
            // the url to the existing module in that case
            else if (!this.urlToModuleMap.has(url)) {
                this.urlToModuleMap.set(url, mod);
            }
            this._setUnresolvedUrlToModule(rawUrl, mod, ssr);
            return mod;
        })();
        // Also register the clean url to the module, so that we can short-circuit
        // resolving the same url twice
        this._setUnresolvedUrlToModule(rawUrl, modPromise, ssr);
        return modPromise;
    }
    // some deps, like a css file referenced via @import, don't have its own
    // url because they are inlined into the main css import. But they still
    // need to be represented in the module graph so that they can trigger
    // hmr in the importing css file.
    createFileOnlyEntry(file) {
        file = normalizePath(file);
        let fileMappedModules = this.fileToModulesMap.get(file);
        if (!fileMappedModules) {
            fileMappedModules = new Set();
            this.fileToModulesMap.set(file, fileMappedModules);
        }
        const url = `${FS_PREFIX}${file}`;
        for (const m of fileMappedModules) {
            if (m.url === url || m.id === file) {
                return m;
            }
        }
        const mod = new ModuleNode(url);
        mod.file = file;
        fileMappedModules.add(mod);
        return mod;
    }
    // for incoming urls, it is important to:
    // 1. remove the HMR timestamp query (?t=xxxx) and the ?import query
    // 2. resolve its extension so that urls with or without extension all map to
    // the same module
    async resolveUrl(url, ssr) {
        url = removeImportQuery(removeTimestampQuery(url));
        const mod = await this._getUnresolvedUrlToModule(url, ssr);
        if (mod?.id) {
            return [mod.url, mod.id, mod.meta];
        }
        return this._resolveUrl(url, ssr);
    }
    /**
     * @internal
     */
    _getUnresolvedUrlToModule(url, ssr) {
        return (ssr ? this._ssrUnresolvedUrlToModuleMap : this._unresolvedUrlToModuleMap).get(url);
    }
    /**
     * @internal
     */
    _setUnresolvedUrlToModule(url, mod, ssr) {
        (ssr
            ? this._ssrUnresolvedUrlToModuleMap
            : this._unresolvedUrlToModuleMap).set(url, mod);
    }
    /**
     * @internal
     */
    async _resolveUrl(url, ssr, alreadyResolved) {
        const resolved = alreadyResolved ?? (await this.resolveId(url, !!ssr));
        const resolvedId = resolved?.id || url;
        if (url !== resolvedId &&
            !url.includes('\0') &&
            !url.startsWith(`virtual:`)) {
            const ext = extname(cleanUrl(resolvedId));
            if (ext) {
                const pathname = cleanUrl(url);
                if (!pathname.endsWith(ext)) {
                    url = pathname + ext + url.slice(pathname.length);
                }
            }
        }
        return [url, resolvedId, resolved?.meta];
    }
}

/**
 * The following is modified based on source found in
 * https://github.com/facebook/create-react-app
 *
 * MIT Licensed
 * Copyright (c) 2015-present, Facebook, Inc.
 * https://github.com/facebook/create-react-app/blob/master/LICENSE
 *
 */
/**
 * Reads the BROWSER environment variable and decides what to do with it.
 */
function openBrowser(url, opt, logger) {
    // The browser executable to open.
    // See https://github.com/sindresorhus/open#app for documentation.
    const browser = typeof opt === 'string' ? opt : process.env.BROWSER || '';
    if (browser.toLowerCase().endsWith('.js')) {
        executeNodeScript(browser, url, logger);
    }
    else if (browser.toLowerCase() !== 'none') {
        const browserArgs = process.env.BROWSER_ARGS
            ? process.env.BROWSER_ARGS.split(' ')
            : [];
        startBrowserProcess(browser, browserArgs, url);
    }
}
function executeNodeScript(scriptPath, url, logger) {
    const extraArgs = process.argv.slice(2);
    const child = spawn(process.execPath, [scriptPath, ...extraArgs, url], {
        stdio: 'inherit',
    });
    child.on('close', (code) => {
        if (code !== 0) {
            logger.error(colors.red(`\nThe script specified as BROWSER environment variable failed.\n\n${colors.cyan(scriptPath)} exited with code ${code}.`), { error: null });
        }
    });
}
const supportedChromiumBrowsers = [
    'Google Chrome Canary',
    'Google Chrome Dev',
    'Google Chrome Beta',
    'Google Chrome',
    'Microsoft Edge',
    'Brave Browser',
    'Vivaldi',
    'Chromium',
];
async function startBrowserProcess(browser, browserArgs, url) {
    // If we're on OS X, the user hasn't specifically
    // requested a different browser, we can try opening
    // a Chromium browser with AppleScript. This lets us reuse an
    // existing tab when possible instead of creating a new one.
    const preferredOSXBrowser = browser === 'google chrome' ? 'Google Chrome' : browser;
    const shouldTryOpenChromeWithAppleScript = process.platform === 'darwin' &&
        (!preferredOSXBrowser ||
            supportedChromiumBrowsers.includes(preferredOSXBrowser));
    if (shouldTryOpenChromeWithAppleScript) {
        try {
            const ps = await execAsync('ps cax');
            const openedBrowser = preferredOSXBrowser && ps.includes(preferredOSXBrowser)
                ? preferredOSXBrowser
                : supportedChromiumBrowsers.find((b) => ps.includes(b));
            if (openedBrowser) {
                // Try our best to reuse existing tab with AppleScript
                await execAsync(`osascript openChrome.applescript "${encodeURI(url)}" "${openedBrowser}"`, {
                    cwd: join$1(VITE_PACKAGE_DIR, 'bin'),
                });
                return true;
            }
        }
        catch (err) {
            // Ignore errors
        }
    }
    // Another special case: on OS X, check if BROWSER has been set to "open".
    // In this case, instead of passing the string `open` to `open` function (which won't work),
    // just ignore it (thus ensuring the intended behavior, i.e. opening the system browser):
    // https://github.com/facebook/create-react-app/pull/1690#issuecomment-283518768
    if (process.platform === 'darwin' && browser === 'open') {
        browser = undefined;
    }
    // Fallback to open
    // (It will always open new tab)
    try {
        const options = browser
            ? { app: { name: browser, arguments: browserArgs } }
            : {};
        open(url, options).catch(() => { }); // Prevent `unhandledRejection` error.
        return true;
    }
    catch (err) {
        return false;
    }
}
function execAsync(command, options) {
    return new Promise((resolve, reject) => {
        exec(command, options, (error, stdout) => {
            if (error) {
                reject(error);
            }
            else {
                resolve(stdout.toString());
            }
        });
    });
}

function createServer(inlineConfig = {}) {
    return _createServer(inlineConfig, { ws: true });
}
async function _createServer(inlineConfig = {}, options) {
    const config = await resolveConfig(inlineConfig, 'serve');
    const { root, server: serverConfig } = config;
    const httpsOptions = await resolveHttpsConfig(config.server.https);
    const { middlewareMode } = serverConfig;
    const resolvedWatchOptions = resolveChokidarOptions(config, {
        disableGlobbing: true,
        ...serverConfig.watch,
    });
    const middlewares = connect();
    const httpServer = middlewareMode
        ? null
        : await resolveHttpServer(serverConfig, middlewares, httpsOptions);
    const ws = createWebSocketServer(httpServer, config, httpsOptions);
    if (httpServer) {
        setClientErrorHandler(httpServer, config.logger);
    }
    const watcher = chokidar.watch(
    // config file dependencies and env file might be outside of root
    [root, ...config.configFileDependencies, config.envDir], resolvedWatchOptions);
    const moduleGraph = new ModuleGraph((url, ssr) => container.resolveId(url, undefined, { ssr }));
    const container = await createPluginContainer(config, moduleGraph, watcher);
    const closeHttpServer = createServerCloseFn(httpServer);
    let exitProcess;
    const server = {
        config,
        middlewares,
        httpServer,
        watcher,
        pluginContainer: container,
        ws,
        moduleGraph,
        resolvedUrls: null,
        ssrTransform(code, inMap, url, originalCode = code) {
            return ssrTransform(code, inMap, url, originalCode, server.config);
        },
        transformRequest(url, options) {
            return transformRequest(url, server, options);
        },
        transformIndexHtml: null,
        async ssrLoadModule(url, opts) {
            if (isDepsOptimizerEnabled(config, true)) {
                await initDevSsrDepsOptimizer(config, server);
            }
            if (config.legacy?.buildSsrCjsExternalHeuristics) {
                await updateCjsSsrExternals(server);
            }
            return ssrLoadModule(url, server, undefined, undefined, opts?.fixStacktrace);
        },
        ssrFixStacktrace(e) {
            ssrFixStacktrace(e, moduleGraph);
        },
        ssrRewriteStacktrace(stack) {
            return ssrRewriteStacktrace(stack, moduleGraph);
        },
        async reloadModule(module) {
            if (serverConfig.hmr !== false && module.file) {
                updateModules(module.file, [module], Date.now(), server);
            }
        },
        async listen(port, isRestart) {
            await startServer(server, port);
            if (httpServer) {
                server.resolvedUrls = await resolveServerUrls(httpServer, config.server, config);
                if (!isRestart && config.server.open)
                    server.openBrowser();
            }
            return server;
        },
        openBrowser() {
            const options = server.config.server;
            const url = server.resolvedUrls?.local[0];
            if (url) {
                const path = typeof options.open === 'string'
                    ? new URL(options.open, url).href
                    : url;
                openBrowser(path, true, server.config.logger);
            }
            else {
                server.config.logger.warn('No URL available to open in browser');
            }
        },
        async close() {
            if (!middlewareMode) {
                process.off('SIGTERM', exitProcess);
                if (process.env.CI !== 'true') {
                    process.stdin.off('end', exitProcess);
                }
            }
            await Promise.allSettled([
                watcher.close(),
                ws.close(),
                container.close(),
                getDepsOptimizer(server.config)?.close(),
                getDepsOptimizer(server.config, true)?.close(),
                closeHttpServer(),
            ]);
            // Await pending requests. We throw early in transformRequest
            // and in hooks if the server is closing, so the import analysis
            // plugin stops pre-transforming static imports and this block
            // is resolved sooner.
            while (server._pendingRequests.size > 0) {
                await Promise.allSettled([...server._pendingRequests.values()].map((pending) => pending.request));
            }
            server.resolvedUrls = null;
        },
        printUrls() {
            if (server.resolvedUrls) {
                printServerUrls(server.resolvedUrls, serverConfig.host, config.logger.info);
            }
            else if (middlewareMode) {
                throw new Error('cannot print server URLs in middleware mode.');
            }
            else {
                throw new Error('cannot print server URLs before server.listen is called.');
            }
        },
        async restart(forceOptimize) {
            if (!server._restartPromise) {
                server._forceOptimizeOnRestart = !!forceOptimize;
                server._restartPromise = restartServer(server).finally(() => {
                    server._restartPromise = null;
                    server._forceOptimizeOnRestart = false;
                });
            }
            return server._restartPromise;
        },
        _ssrExternals: null,
        _restartPromise: null,
        _importGlobMap: new Map(),
        _forceOptimizeOnRestart: false,
        _pendingRequests: new Map(),
        _fsDenyGlob: picomatch(config.server.fs.deny, { matchBase: true }),
        _shortcutsOptions: undefined,
    };
    server.transformIndexHtml = createDevHtmlTransformFn(server);
    if (!middlewareMode) {
        exitProcess = async () => {
            try {
                await server.close();
            }
            finally {
                process.exit();
            }
        };
        process.once('SIGTERM', exitProcess);
        if (process.env.CI !== 'true') {
            process.stdin.on('end', exitProcess);
        }
    }
    const onHMRUpdate = async (file, configOnly) => {
        if (serverConfig.hmr !== false) {
            try {
                await handleHMRUpdate(file, server, configOnly);
            }
            catch (err) {
                ws.send({
                    type: 'error',
                    err: prepareError(err),
                });
            }
        }
    };
    const onFileAddUnlink = async (file) => {
        file = normalizePath(file);
        await handleFileAddUnlink(file, server);
        await onHMRUpdate(file, true);
    };
    watcher.on('change', async (file) => {
        file = normalizePath(file);
        // invalidate module graph cache on file change
        moduleGraph.onFileChange(file);
        await onHMRUpdate(file, false);
    });
    watcher.on('add', onFileAddUnlink);
    watcher.on('unlink', onFileAddUnlink);
    ws.on('vite:invalidate', async ({ path, message }) => {
        const mod = moduleGraph.urlToModuleMap.get(path);
        if (mod && mod.isSelfAccepting && mod.lastHMRTimestamp > 0) {
            config.logger.info(colors.yellow(`hmr invalidate `) +
                colors.dim(path) +
                (message ? ` ${message}` : ''), { timestamp: true });
            const file = getShortName(mod.file, config.root);
            updateModules(file, [...mod.importers], mod.lastHMRTimestamp, server, true);
        }
    });
    if (!middlewareMode && httpServer) {
        httpServer.once('listening', () => {
            // update actual port since this may be different from initial value
            serverConfig.port = httpServer.address().port;
        });
    }
    // apply server configuration hooks from plugins
    const postHooks = [];
    for (const hook of config.getSortedPluginHooks('configureServer')) {
        postHooks.push(await hook(server));
    }
    // Internal middlewares ------------------------------------------------------
    // request timer
    if (process.env.DEBUG) {
        middlewares.use(timeMiddleware(root));
    }
    // cors (enabled by default)
    const { cors } = serverConfig;
    if (cors !== false) {
        middlewares.use(corsMiddleware(typeof cors === 'boolean' ? {} : cors));
    }
    // proxy
    const { proxy } = serverConfig;
    if (proxy) {
        middlewares.use(proxyMiddleware(httpServer, proxy, config));
    }
    // base
    if (config.base !== '/') {
        middlewares.use(baseMiddleware(server));
    }
    // open in editor support
    middlewares.use('/__open-in-editor', launchEditorMiddleware());
    // ping request handler
    // Keep the named function. The name is visible in debug logs via `DEBUG=connect:dispatcher ...`
    middlewares.use(function viteHMRPingMiddleware(req, res, next) {
        if (req.headers['accept'] === 'text/x-vite-ping') {
            res.writeHead(204).end();
        }
        else {
            next();
        }
    });
    // serve static files under /public
    // this applies before the transform middleware so that these files are served
    // as-is without transforms.
    if (config.publicDir) {
        middlewares.use(servePublicMiddleware(config.publicDir, config.server.headers));
    }
    // main transform middleware
    middlewares.use(transformMiddleware(server));
    // serve static files
    middlewares.use(serveRawFsMiddleware(server));
    middlewares.use(serveStaticMiddleware(root, server));
    // html fallback
    if (config.appType === 'spa' || config.appType === 'mpa') {
        middlewares.use(htmlFallbackMiddleware(root, config.appType === 'spa'));
    }
    // run post config hooks
    // This is applied before the html middleware so that user middleware can
    // serve custom content instead of index.html.
    postHooks.forEach((fn) => fn && fn());
    if (config.appType === 'spa' || config.appType === 'mpa') {
        // transform index.html
        middlewares.use(indexHtmlMiddleware(server));
        // handle 404s
        // Keep the named function. The name is visible in debug logs via `DEBUG=connect:dispatcher ...`
        middlewares.use(function vite404Middleware(_, res) {
            res.statusCode = 404;
            res.end();
        });
    }
    // error handler
    middlewares.use(errorMiddleware(server, middlewareMode));
    // httpServer.listen can be called multiple times
    // when port when using next port number
    // this code is to avoid calling buildStart multiple times
    let initingServer;
    let serverInited = false;
    const initServer = async () => {
        if (serverInited)
            return;
        if (initingServer)
            return initingServer;
        initingServer = (async function () {
            await container.buildStart({});
            // start deps optimizer after all container plugins are ready
            if (isDepsOptimizerEnabled(config, false)) {
                await initDepsOptimizer(config, server);
            }
            initingServer = undefined;
            serverInited = true;
        })();
        return initingServer;
    };
    if (!middlewareMode && httpServer) {
        // overwrite listen to init optimizer before server start
        const listen = httpServer.listen.bind(httpServer);
        httpServer.listen = (async (port, ...args) => {
            try {
                // ensure ws server started
                ws.listen();
                await initServer();
            }
            catch (e) {
                httpServer.emit('error', e);
                return;
            }
            return listen(port, ...args);
        });
    }
    else {
        if (options.ws) {
            ws.listen();
        }
        await initServer();
    }
    return server;
}
async function startServer(server, inlinePort) {
    const httpServer = server.httpServer;
    if (!httpServer) {
        throw new Error('Cannot call server.listen in middleware mode.');
    }
    const options = server.config.server;
    const port = inlinePort ?? options.port ?? DEFAULT_DEV_PORT;
    const hostname = await resolveHostname(options.host);
    await httpServerStart(httpServer, {
        port,
        strictPort: options.strictPort,
        host: hostname.host,
        logger: server.config.logger,
    });
}
function createServerCloseFn(server) {
    if (!server) {
        return () => { };
    }
    let hasListened = false;
    const openSockets = new Set();
    server.on('connection', (socket) => {
        openSockets.add(socket);
        socket.on('close', () => {
            openSockets.delete(socket);
        });
    });
    server.once('listening', () => {
        hasListened = true;
    });
    return () => new Promise((resolve, reject) => {
        openSockets.forEach((s) => s.destroy());
        if (hasListened) {
            server.close((err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        }
        else {
            resolve();
        }
    });
}
function resolvedAllowDir(root, dir) {
    return normalizePath(path.resolve(root, dir));
}
function resolveServerOptions(root, raw, logger) {
    const server = {
        preTransformRequests: true,
        ...raw,
        sourcemapIgnoreList: raw?.sourcemapIgnoreList === false
            ? () => false
            : raw?.sourcemapIgnoreList || isInNodeModules,
        middlewareMode: !!raw?.middlewareMode,
    };
    let allowDirs = server.fs?.allow;
    const deny = server.fs?.deny || ['.env', '.env.*', '*.{crt,pem}'];
    if (!allowDirs) {
        allowDirs = [searchForWorkspaceRoot(root)];
    }
    allowDirs = allowDirs.map((i) => resolvedAllowDir(root, i));
    // only push client dir when vite itself is outside-of-root
    const resolvedClientDir = resolvedAllowDir(root, CLIENT_DIR);
    if (!allowDirs.some((dir) => isParentDirectory(dir, resolvedClientDir))) {
        allowDirs.push(resolvedClientDir);
    }
    server.fs = {
        strict: server.fs?.strict ?? true,
        allow: allowDirs,
        deny,
    };
    if (server.origin?.endsWith('/')) {
        server.origin = server.origin.slice(0, -1);
        logger.warn(colors.yellow(`${colors.bold('(!)')} server.origin should not end with "/". Using "${server.origin}" instead.`));
    }
    return server;
}
async function restartServer(server) {
    global.__vite_start_time = performance.now();
    const { port: prevPort, host: prevHost } = server.config.server;
    const shortcutsOptions = server._shortcutsOptions;
    const oldUrls = server.resolvedUrls;
    let inlineConfig = server.config.inlineConfig;
    if (server._forceOptimizeOnRestart) {
        inlineConfig = mergeConfig(inlineConfig, {
            optimizeDeps: {
                force: true,
            },
        });
    }
    let newServer = null;
    try {
        // delay ws server listen
        newServer = await _createServer(inlineConfig, { ws: false });
    }
    catch (err) {
        server.config.logger.error(err.message, {
            timestamp: true,
        });
        server.config.logger.error('server restart failed', { timestamp: true });
        return;
    }
    await server.close();
    // prevent new server `restart` function from calling
    newServer._restartPromise = server._restartPromise;
    Object.assign(server, newServer);
    const { logger, server: { port, host, middlewareMode }, } = server.config;
    if (!middlewareMode) {
        await server.listen(port, true);
        logger.info('server restarted.', { timestamp: true });
        if ((port ?? DEFAULT_DEV_PORT) !== (prevPort ?? DEFAULT_DEV_PORT) ||
            host !== prevHost ||
            diffDnsOrderChange(oldUrls, newServer.resolvedUrls)) {
            logger.info('');
            server.printUrls();
        }
    }
    else {
        server.ws.listen();
        logger.info('server restarted.', { timestamp: true });
    }
    if (shortcutsOptions) {
        shortcutsOptions.print = false;
        bindShortcuts(newServer, shortcutsOptions);
    }
    // new server (the current server) can restart now
    newServer._restartPromise = null;
}
async function updateCjsSsrExternals(server) {
    if (!server._ssrExternals) {
        let knownImports = [];
        // Important! We use the non-ssr optimized deps to find known imports
        // Only the explicitly defined deps are optimized during dev SSR, so
        // we use the generated list from the scanned deps in regular dev.
        // This is part of the v2 externalization heuristics and it is kept
        // for backwards compatibility in case user needs to fallback to the
        // legacy scheme. It may be removed in a future v3 minor.
        const depsOptimizer = getDepsOptimizer(server.config, false); // non-ssr
        if (depsOptimizer) {
            await depsOptimizer.scanProcessing;
            knownImports = [
                ...Object.keys(depsOptimizer.metadata.optimized),
                ...Object.keys(depsOptimizer.metadata.discovered),
            ];
        }
        server._ssrExternals = cjsSsrResolveExternals(server.config, knownImports);
    }
}

var index = {
    __proto__: null,
    _createServer: _createServer,
    createServer: createServer,
    resolveServerOptions: resolveServerOptions
};

/* eslint-disable */
/* global Buffer */
const noop = () => { };
const mimes = /text|javascript|\/json|xml/i;
const threshold = 1024;
const level = -1;
let brotli = false;
const getChunkSize = (chunk, enc) => (chunk ? Buffer.byteLength(chunk, enc) : 0);
function compression() {
    const brotliOpts = (typeof brotli === 'object' && brotli) || {};
    const gzipOpts = {};
    // disable Brotli on Node<12.7 where it is unsupported:
    if (!zlib.createBrotliCompress)
        brotli = false;
    return function viteCompressionMiddleware(req, res, next = noop) {
        const accept = req.headers['accept-encoding'] + '';
        const encoding = ((brotli && accept.match(/\bbr\b/)) ||
            (accept.match(/\bgzip\b/)) ||
            [])[0];
        // skip if no response body or no supported encoding:
        if (req.method === 'HEAD' || !encoding)
            return next();
        /** @type {zlib.Gzip | zlib.BrotliCompress} */
        let compress;
        let pendingStatus;
        /** @type {[string, function][]?} */
        let pendingListeners = [];
        let started = false;
        let size = 0;
        function start() {
            started = true;
            size = res.getHeader('Content-Length') | 0 || size;
            const compressible = mimes.test(String(res.getHeader('Content-Type') || 'text/plain'));
            const cleartext = !res.getHeader('Content-Encoding');
            const listeners = pendingListeners || [];
            if (compressible && cleartext && size >= threshold) {
                res.setHeader('Content-Encoding', encoding);
                res.removeHeader('Content-Length');
                if (encoding === 'br') {
                    const params = {
                        [zlib.constants.BROTLI_PARAM_QUALITY]: level,
                        [zlib.constants.BROTLI_PARAM_SIZE_HINT]: size,
                    };
                    compress = zlib.createBrotliCompress({
                        params: Object.assign(params, brotliOpts),
                    });
                }
                else {
                    compress = zlib.createGzip(Object.assign({ level }, gzipOpts));
                }
                // backpressure
                compress.on('data', (chunk) => write.call(res, chunk) === false && compress.pause());
                on.call(res, 'drain', () => compress.resume());
                compress.on('end', () => end.call(res));
                listeners.forEach((p) => compress.on.apply(compress, p));
            }
            else {
                pendingListeners = null;
                listeners.forEach((p) => on.apply(res, p));
            }
            writeHead.call(res, pendingStatus || res.statusCode);
        }
        const { end, write, on, writeHead } = res;
        res.writeHead = function (status, reason, headers) {
            if (typeof reason !== 'string')
                [headers, reason] = [reason, headers];
            if (headers)
                for (let i in headers)
                    res.setHeader(i, headers[i]);
            pendingStatus = status;
            return this;
        };
        res.write = function (chunk, enc, cb) {
            size += getChunkSize(chunk, enc);
            if (!started)
                start();
            if (!compress)
                return write.apply(this, arguments);
            return compress.write.apply(compress, arguments);
        };
        res.end = function (chunk, enc, cb) {
            if (arguments.length > 0 && typeof chunk !== 'function') {
                size += getChunkSize(chunk, enc);
            }
            if (!started)
                start();
            if (!compress)
                return end.apply(this, arguments);
            return compress.end.apply(compress, arguments);
        };
        res.on = function (type, listener) {
            if (!pendingListeners || type !== 'drain')
                on.call(this, type, listener);
            else if (compress)
                compress.on(type, listener);
            else
                pendingListeners.push([type, listener]);
            return this;
        };
        next();
    };
}

function resolvePreviewOptions(preview, server) {
    // The preview server inherits every CommonServerOption from the `server` config
    // except for the port to enable having both the dev and preview servers running
    // at the same time without extra configuration
    return {
        port: preview?.port,
        strictPort: preview?.strictPort ?? server.strictPort,
        host: preview?.host ?? server.host,
        https: preview?.https ?? server.https,
        open: preview?.open ?? server.open,
        proxy: preview?.proxy ?? server.proxy,
        cors: preview?.cors ?? server.cors,
        headers: preview?.headers ?? server.headers,
    };
}
/**
 * Starts the Vite server in preview mode, to simulate a production deployment
 */
async function preview(inlineConfig = {}) {
    const config = await resolveConfig(inlineConfig, 'serve', 'production', 'production');
    const distDir = path.resolve(config.root, config.build.outDir);
    if (!fs.existsSync(distDir) &&
        // error if no plugins implement `configurePreviewServer`
        config.plugins.every((plugin) => !plugin.configurePreviewServer) &&
        // error if called in CLI only. programmatic usage could access `httpServer`
        // and affect file serving
        process.argv[1]?.endsWith(path.normalize('bin/vite.js')) &&
        process.argv[2] === 'preview') {
        throw new Error(`The directory "${config.build.outDir}" does not exist. Did you build your project?`);
    }
    const app = connect();
    const httpServer = await resolveHttpServer(config.preview, app, await resolveHttpsConfig(config.preview?.https));
    setClientErrorHandler(httpServer, config.logger);
    const options = config.preview;
    const logger = config.logger;
    const server = {
        config,
        middlewares: app,
        httpServer,
        resolvedUrls: null,
        printUrls() {
            if (server.resolvedUrls) {
                printServerUrls(server.resolvedUrls, options.host, logger.info);
            }
            else {
                throw new Error('cannot print server URLs before server is listening.');
            }
        },
    };
    // apply server hooks from plugins
    const postHooks = [];
    for (const hook of config.getSortedPluginHooks('configurePreviewServer')) {
        postHooks.push(await hook(server));
    }
    // cors
    const { cors } = config.preview;
    if (cors !== false) {
        app.use(corsMiddleware(typeof cors === 'boolean' ? {} : cors));
    }
    // proxy
    const { proxy } = config.preview;
    if (proxy) {
        app.use(proxyMiddleware(httpServer, proxy, config));
    }
    app.use(compression());
    const previewBase = config.base === './' || config.base === '' ? '/' : config.base;
    // static assets
    const headers = config.preview.headers;
    const viteAssetMiddleware = (...args) => sirv(distDir, {
        etag: true,
        dev: true,
        single: config.appType === 'spa',
        setHeaders(res) {
            if (headers) {
                for (const name in headers) {
                    res.setHeader(name, headers[name]);
                }
            }
        },
        shouldServe(filePath) {
            return shouldServeFile(filePath, distDir);
        },
    })(...args);
    app.use(previewBase, viteAssetMiddleware);
    // apply post server hooks from plugins
    postHooks.forEach((fn) => fn && fn());
    const hostname = await resolveHostname(options.host);
    const port = options.port ?? DEFAULT_PREVIEW_PORT;
    const protocol = options.https ? 'https' : 'http';
    const serverPort = await httpServerStart(httpServer, {
        port,
        strictPort: options.strictPort,
        host: hostname.host,
        logger,
    });
    server.resolvedUrls = await resolveServerUrls(httpServer, config.preview, config);
    if (options.open) {
        const path = typeof options.open === 'string' ? options.open : previewBase;
        openBrowser(path.startsWith('http')
            ? path
            : new URL(path, `${protocol}://${hostname.name}:${serverPort}`).href, true, logger);
    }
    return server;
}

var preview$1 = {
    __proto__: null,
    preview: preview,
    resolvePreviewOptions: resolvePreviewOptions
};

function resolveSSROptions(ssr, preserveSymlinks, buildSsrCjsExternalHeuristics) {
    ssr ?? (ssr = {});
    const optimizeDeps = ssr.optimizeDeps ?? {};
    const format = buildSsrCjsExternalHeuristics ? 'cjs' : 'esm';
    const target = 'node';
    return {
        format,
        target,
        ...ssr,
        optimizeDeps: {
            disabled: true,
            ...optimizeDeps,
            esbuildOptions: {
                preserveSymlinks,
                ...optimizeDeps.esbuildOptions,
            },
        },
    };
}

const debug = createDebugger('vite:config');
const promisifiedRealpath = promisify(fs.realpath);
/**
 * Type helper to make it easier to use vite.config.ts
 * accepts a direct {@link UserConfig} object, or a function that returns it.
 * The function receives a {@link ConfigEnv} object that exposes two properties:
 * `command` (either `'build'` or `'serve'`), and `mode`.
 */
function defineConfig(config) {
    return config;
}
async function resolveConfig(inlineConfig, command, defaultMode = 'development', defaultNodeEnv = 'development') {
    let config = inlineConfig;
    let configFileDependencies = [];
    let mode = inlineConfig.mode || defaultMode;
    const isNodeEnvSet = !!process.env.NODE_ENV;
    const packageCache = new Map();
    // some dependencies e.g. @vue/compiler-* relies on NODE_ENV for getting
    // production-specific behavior, so set it early on
    if (!isNodeEnvSet) {
        process.env.NODE_ENV = defaultNodeEnv;
    }
    const configEnv = {
        mode,
        command,
        ssrBuild: !!config.build?.ssr,
    };
    let { configFile } = config;
    if (configFile !== false) {
        const loadResult = await loadConfigFromFile(configEnv, configFile, config.root, config.logLevel);
        if (loadResult) {
            config = mergeConfig(loadResult.config, config);
            configFile = loadResult.path;
            configFileDependencies = loadResult.dependencies;
        }
    }
    // user config may provide an alternative mode. But --mode has a higher priority
    mode = inlineConfig.mode || config.mode || mode;
    configEnv.mode = mode;
    const filterPlugin = (p) => {
        if (!p) {
            return false;
        }
        else if (!p.apply) {
            return true;
        }
        else if (typeof p.apply === 'function') {
            return p.apply({ ...config, mode }, configEnv);
        }
        else {
            return p.apply === command;
        }
    };
    // Some plugins that aren't intended to work in the bundling of workers (doing post-processing at build time for example).
    // And Plugins may also have cached that could be corrupted by being used in these extra rollup calls.
    // So we need to separate the worker plugin from the plugin that vite needs to run.
    const rawWorkerUserPlugins = (await asyncFlatten(config.worker?.plugins || [])).filter(filterPlugin);
    // resolve plugins
    const rawUserPlugins = (await asyncFlatten(config.plugins || [])).filter(filterPlugin);
    const [prePlugins, normalPlugins, postPlugins] = sortUserPlugins(rawUserPlugins);
    // run config hooks
    const userPlugins = [...prePlugins, ...normalPlugins, ...postPlugins];
    config = await runConfigHook(config, userPlugins, configEnv);
    // If there are custom commonjsOptions, don't force optimized deps for this test
    // even if the env var is set as it would interfere with the playground specs.
    if (!config.build?.commonjsOptions &&
        process.env.VITE_TEST_WITHOUT_PLUGIN_COMMONJS) {
        config = mergeConfig(config, {
            optimizeDeps: { disabled: false },
            ssr: { optimizeDeps: { disabled: false } },
        });
        config.build ?? (config.build = {});
        config.build.commonjsOptions = { include: [] };
    }
    // Define logger
    const logger = createLogger(config.logLevel, {
        allowClearScreen: config.clearScreen,
        customLogger: config.customLogger,
    });
    // resolve root
    const resolvedRoot = normalizePath(config.root ? path.resolve(config.root) : process.cwd());
    const clientAlias = [
        {
            find: /^\/?@vite\/env/,
            replacement: path.posix.join(FS_PREFIX, normalizePath(ENV_ENTRY)),
        },
        {
            find: /^\/?@vite\/client/,
            replacement: path.posix.join(FS_PREFIX, normalizePath(CLIENT_ENTRY)),
        },
    ];
    // resolve alias with internal client alias
    const resolvedAlias = normalizeAlias(mergeAlias(clientAlias, config.resolve?.alias || []));
    const resolveOptions = {
        mainFields: config.resolve?.mainFields ?? DEFAULT_MAIN_FIELDS,
        browserField: config.resolve?.browserField ?? true,
        conditions: config.resolve?.conditions ?? [],
        extensions: config.resolve?.extensions ?? DEFAULT_EXTENSIONS,
        dedupe: config.resolve?.dedupe ?? [],
        preserveSymlinks: config.resolve?.preserveSymlinks ?? false,
        alias: resolvedAlias,
    };
    // load .env files
    const envDir = config.envDir
        ? normalizePath(path.resolve(resolvedRoot, config.envDir))
        : resolvedRoot;
    const userEnv = inlineConfig.envFile !== false &&
        loadEnv(mode, envDir, resolveEnvPrefix(config));
    // Note it is possible for user to have a custom mode, e.g. `staging` where
    // development-like behavior is expected. This is indicated by NODE_ENV=development
    // loaded from `.staging.env` and set by us as VITE_USER_NODE_ENV
    const userNodeEnv = process.env.VITE_USER_NODE_ENV;
    if (!isNodeEnvSet && userNodeEnv) {
        if (userNodeEnv === 'development') {
            process.env.NODE_ENV = 'development';
        }
        else {
            // NODE_ENV=production is not supported as it could break HMR in dev for frameworks like Vue
            logger.warn(`NODE_ENV=${userNodeEnv} is not supported in the .env file. ` +
                `Only NODE_ENV=development is supported to create a development build of your project. ` +
                `If you need to set process.env.NODE_ENV, you can set it in the Vite config instead.`);
        }
    }
    const isProduction = process.env.NODE_ENV === 'production';
    // resolve public base url
    const isBuild = command === 'build';
    const relativeBaseShortcut = config.base === '' || config.base === './';
    // During dev, we ignore relative base and fallback to '/'
    // For the SSR build, relative base isn't possible by means
    // of import.meta.url.
    const resolvedBase = relativeBaseShortcut
        ? !isBuild || config.build?.ssr
            ? '/'
            : './'
        : resolveBaseUrl(config.base, isBuild, logger) ?? '/';
    const resolvedBuildOptions = resolveBuildOptions(config.build, logger, resolvedRoot);
    // resolve cache directory
    const pkgDir = findNearestPackageData(resolvedRoot, packageCache)?.dir;
    const cacheDir = normalizePath(config.cacheDir
        ? path.resolve(resolvedRoot, config.cacheDir)
        : pkgDir
            ? path.join(pkgDir, `node_modules/.vite`)
            : path.join(resolvedRoot, `.vite`));
    const assetsFilter = config.assetsInclude &&
        (!Array.isArray(config.assetsInclude) || config.assetsInclude.length)
        ? createFilter(config.assetsInclude)
        : () => false;
    // create an internal resolver to be used in special scenarios, e.g.
    // optimizer & handling css @imports
    const createResolver = (options) => {
        let aliasContainer;
        let resolverContainer;
        return async (id, importer, aliasOnly, ssr) => {
            let container;
            if (aliasOnly) {
                container =
                    aliasContainer ||
                        (aliasContainer = await createPluginContainer({
                            ...resolved,
                            plugins: [aliasPlugin({ entries: resolved.resolve.alias })],
                        }));
            }
            else {
                container =
                    resolverContainer ||
                        (resolverContainer = await createPluginContainer({
                            ...resolved,
                            plugins: [
                                aliasPlugin({ entries: resolved.resolve.alias }),
                                resolvePlugin({
                                    ...resolved.resolve,
                                    root: resolvedRoot,
                                    isProduction,
                                    isBuild: command === 'build',
                                    ssrConfig: resolved.ssr,
                                    asSrc: true,
                                    preferRelative: false,
                                    tryIndex: true,
                                    ...options,
                                    idOnly: true,
                                }),
                            ],
                        }));
            }
            return (await container.resolveId(id, importer, {
                ssr,
                scan: options?.scan,
            }))?.id;
        };
    };
    const { publicDir } = config;
    const resolvedPublicDir = publicDir !== false && publicDir !== ''
        ? path.resolve(resolvedRoot, typeof publicDir === 'string' ? publicDir : 'public')
        : '';
    const server = resolveServerOptions(resolvedRoot, config.server, logger);
    const ssr = resolveSSROptions(config.ssr, resolveOptions.preserveSymlinks, config.legacy?.buildSsrCjsExternalHeuristics);
    const middlewareMode = config?.server?.middlewareMode;
    const optimizeDeps = config.optimizeDeps || {};
    const BASE_URL = resolvedBase;
    // resolve worker
    let workerConfig = mergeConfig({}, config);
    const [workerPrePlugins, workerNormalPlugins, workerPostPlugins] = sortUserPlugins(rawWorkerUserPlugins);
    // run config hooks
    const workerUserPlugins = [
        ...workerPrePlugins,
        ...workerNormalPlugins,
        ...workerPostPlugins,
    ];
    workerConfig = await runConfigHook(workerConfig, workerUserPlugins, configEnv);
    const resolvedWorkerOptions = {
        format: workerConfig.worker?.format || 'iife',
        plugins: [],
        rollupOptions: workerConfig.worker?.rollupOptions || {},
        getSortedPlugins: undefined,
        getSortedPluginHooks: undefined,
    };
    const resolvedConfig = {
        configFile: configFile ? normalizePath(configFile) : undefined,
        configFileDependencies: configFileDependencies.map((name) => normalizePath(path.resolve(name))),
        inlineConfig,
        root: resolvedRoot,
        base: resolvedBase.endsWith('/') ? resolvedBase : resolvedBase + '/',
        rawBase: resolvedBase,
        resolve: resolveOptions,
        publicDir: resolvedPublicDir,
        cacheDir,
        command,
        mode,
        ssr,
        isWorker: false,
        mainConfig: null,
        isProduction,
        plugins: userPlugins,
        css: resolveCSSOptions(config.css),
        esbuild: config.esbuild === false
            ? false
            : {
                jsxDev: !isProduction,
                ...config.esbuild,
            },
        server,
        build: resolvedBuildOptions,
        preview: resolvePreviewOptions(config.preview, server),
        envDir,
        env: {
            ...userEnv,
            BASE_URL,
            MODE: mode,
            DEV: !isProduction,
            PROD: isProduction,
        },
        assetsInclude(file) {
            return DEFAULT_ASSETS_RE.test(file) || assetsFilter(file);
        },
        logger,
        packageCache,
        createResolver,
        optimizeDeps: {
            disabled: 'build',
            ...optimizeDeps,
            esbuildOptions: {
                preserveSymlinks: resolveOptions.preserveSymlinks,
                ...optimizeDeps.esbuildOptions,
            },
        },
        worker: resolvedWorkerOptions,
        appType: config.appType ?? (middlewareMode === 'ssr' ? 'custom' : 'spa'),
        experimental: {
            importGlobRestoreExtension: false,
            hmrPartialAccept: false,
            ...config.experimental,
        },
        getSortedPlugins: undefined,
        getSortedPluginHooks: undefined,
    };
    const resolved = {
        ...config,
        ...resolvedConfig,
    };
    resolved.plugins = await resolvePlugins(resolved, prePlugins, normalPlugins, postPlugins);
    Object.assign(resolved, createPluginHookUtils(resolved.plugins));
    const workerResolved = {
        ...workerConfig,
        ...resolvedConfig,
        isWorker: true,
        mainConfig: resolved,
    };
    resolvedConfig.worker.plugins = await resolvePlugins(workerResolved, workerPrePlugins, workerNormalPlugins, workerPostPlugins);
    Object.assign(resolvedConfig.worker, createPluginHookUtils(resolvedConfig.worker.plugins));
    // call configResolved hooks
    await Promise.all([
        ...resolved
            .getSortedPluginHooks('configResolved')
            .map((hook) => hook(resolved)),
        ...resolvedConfig.worker
            .getSortedPluginHooks('configResolved')
            .map((hook) => hook(workerResolved)),
    ]);
    // validate config
    if (middlewareMode === 'ssr') {
        logger.warn(colors.yellow(`Setting server.middlewareMode to 'ssr' is deprecated, set server.middlewareMode to \`true\`${config.appType === 'custom' ? '' : ` and appType to 'custom'`} instead`));
    }
    if (middlewareMode === 'html') {
        logger.warn(colors.yellow(`Setting server.middlewareMode to 'html' is deprecated, set server.middlewareMode to \`true\` instead`));
    }
    if (config.server?.force &&
        !isBuild &&
        config.optimizeDeps?.force === undefined) {
        resolved.optimizeDeps.force = true;
        logger.warn(colors.yellow(`server.force is deprecated, use optimizeDeps.force instead`));
    }
    debug?.(`using resolved config: %O`, {
        ...resolved,
        plugins: resolved.plugins.map((p) => p.name),
        worker: {
            ...resolved.worker,
            plugins: resolved.worker.plugins.map((p) => p.name),
        },
    });
    if (config.build?.terserOptions && config.build.minify !== 'terser') {
        logger.warn(colors.yellow(`build.terserOptions is specified but build.minify is not set to use Terser. ` +
            `Note Vite now defaults to use esbuild for minification. If you still ` +
            `prefer Terser, set build.minify to "terser".`));
    }
    // Check if all assetFileNames have the same reference.
    // If not, display a warn for user.
    const outputOption = config.build?.rollupOptions?.output ?? [];
    // Use isArray to narrow its type to array
    if (Array.isArray(outputOption)) {
        const assetFileNamesList = outputOption.map((output) => output.assetFileNames);
        if (assetFileNamesList.length > 1) {
            const firstAssetFileNames = assetFileNamesList[0];
            const hasDifferentReference = assetFileNamesList.some((assetFileNames) => assetFileNames !== firstAssetFileNames);
            if (hasDifferentReference) {
                resolved.logger.warn(colors.yellow(`
assetFileNames isn't equal for every build.rollupOptions.output. A single pattern across all outputs is supported by Vite.
`));
            }
        }
    }
    return resolved;
}
/**
 * Resolve base url. Note that some users use Vite to build for non-web targets like
 * electron or expects to deploy
 */
function resolveBaseUrl(base = '/', isBuild, logger) {
    if (base[0] === '.') {
        logger.warn(colors.yellow(colors.bold(`(!) invalid "base" option: ${base}. The value can only be an absolute ` +
            `URL, ./, or an empty string.`)));
        return '/';
    }
    // external URL flag
    const isExternal = isExternalUrl(base);
    // no leading slash warn
    if (!isExternal && base[0] !== '/') {
        logger.warn(colors.yellow(colors.bold(`(!) "base" option should start with a slash.`)));
    }
    // parse base when command is serve or base is not External URL
    if (!isBuild || !isExternal) {
        base = new URL(base, 'http://vitejs.dev').pathname;
        // ensure leading slash
        if (base[0] !== '/') {
            base = '/' + base;
        }
    }
    return base;
}
function sortUserPlugins(plugins) {
    const prePlugins = [];
    const postPlugins = [];
    const normalPlugins = [];
    if (plugins) {
        plugins.flat().forEach((p) => {
            if (p.enforce === 'pre')
                prePlugins.push(p);
            else if (p.enforce === 'post')
                postPlugins.push(p);
            else
                normalPlugins.push(p);
        });
    }
    return [prePlugins, normalPlugins, postPlugins];
}
async function loadConfigFromFile(configEnv, configFile, configRoot = process.cwd(), logLevel) {
    const start = performance.now();
    const getTime = () => `${(performance.now() - start).toFixed(2)}ms`;
    let resolvedPath;
    if (configFile) {
        // explicit config path is always resolved from cwd
        resolvedPath = path.resolve(configFile);
    }
    else {
        // implicit config file loaded from inline root (if present)
        // otherwise from cwd
        for (const filename of DEFAULT_CONFIG_FILES) {
            const filePath = path.resolve(configRoot, filename);
            if (!fs.existsSync(filePath))
                continue;
            resolvedPath = filePath;
            break;
        }
    }
    if (!resolvedPath) {
        debug?.('no config file found.');
        return null;
    }
    let isESM = false;
    if (/\.m[jt]s$/.test(resolvedPath)) {
        isESM = true;
    }
    else if (/\.c[jt]s$/.test(resolvedPath)) {
        isESM = false;
    }
    else {
        // check package.json for type: "module" and set `isESM` to true
        try {
            const pkg = lookupFile(configRoot, ['package.json']);
            isESM =
                !!pkg && JSON.parse(fs.readFileSync(pkg, 'utf-8')).type === 'module';
        }
        catch (e) { }
    }
    try {
        const bundled = await bundleConfigFile(resolvedPath, isESM);
        const userConfig = await loadConfigFromBundledFile(resolvedPath, bundled.code, isESM);
        debug?.(`bundled config file loaded in ${getTime()}`);
        const config = await (typeof userConfig === 'function'
            ? userConfig(configEnv)
            : userConfig);
        if (!isObject(config)) {
            throw new Error(`config must export or return an object.`);
        }
        return {
            path: normalizePath(resolvedPath),
            config,
            dependencies: bundled.dependencies,
        };
    }
    catch (e) {
        createLogger(logLevel).error(colors.red(`failed to load config from ${resolvedPath}`), { error: e });
        throw e;
    }
}
async function bundleConfigFile(fileName, isESM) {
    const dirnameVarName = '__vite_injected_original_dirname';
    const filenameVarName = '__vite_injected_original_filename';
    const importMetaUrlVarName = '__vite_injected_original_import_meta_url';
    const result = await build$2({
        absWorkingDir: process.cwd(),
        entryPoints: [fileName],
        outfile: 'out.js',
        write: false,
        target: ['node14.18', 'node16'],
        platform: 'node',
        bundle: true,
        format: isESM ? 'esm' : 'cjs',
        mainFields: ['main'],
        sourcemap: 'inline',
        metafile: true,
        define: {
            __dirname: dirnameVarName,
            __filename: filenameVarName,
            'import.meta.url': importMetaUrlVarName,
        },
        plugins: [
            {
                name: 'externalize-deps',
                setup(build) {
                    const packageCache = new Map();
                    const resolveByViteResolver = (id, importer, isRequire) => {
                        return tryNodeResolve(id, importer, {
                            root: path.dirname(fileName),
                            isBuild: true,
                            isProduction: true,
                            preferRelative: false,
                            tryIndex: true,
                            mainFields: [],
                            browserField: false,
                            conditions: [],
                            overrideConditions: ['node'],
                            dedupe: [],
                            extensions: DEFAULT_EXTENSIONS,
                            preserveSymlinks: false,
                            packageCache,
                            isRequire,
                        }, false)?.id;
                    };
                    const isESMFile = (id) => {
                        if (id.endsWith('.mjs'))
                            return true;
                        if (id.endsWith('.cjs'))
                            return false;
                        const nearestPackageJson = findNearestPackageData(path.dirname(id), packageCache);
                        return (!!nearestPackageJson && nearestPackageJson.data.type === 'module');
                    };
                    // externalize bare imports
                    build.onResolve({ filter: /^[^.].*/ }, async ({ path: id, importer, kind }) => {
                        if (kind === 'entry-point' ||
                            path.isAbsolute(id) ||
                            isBuiltin(id)) {
                            return;
                        }
                        // partial deno support as `npm:` does not work with esbuild
                        if (id.startsWith('npm:')) {
                            return { external: true };
                        }
                        const isImport = isESM || kind === 'dynamic-import';
                        let idFsPath;
                        try {
                            idFsPath = resolveByViteResolver(id, importer, !isImport);
                        }
                        catch (e) {
                            if (!isImport) {
                                let canResolveWithImport = false;
                                try {
                                    canResolveWithImport = !!resolveByViteResolver(id, importer, false);
                                }
                                catch { }
                                if (canResolveWithImport) {
                                    throw new Error(`Failed to resolve ${JSON.stringify(id)}. This package is ESM only but it was tried to load by \`require\`. See http://vitejs.dev/guide/troubleshooting.html#this-package-is-esm-only for more details.`);
                                }
                            }
                            throw e;
                        }
                        if (idFsPath && isImport) {
                            idFsPath = pathToFileURL(idFsPath).href;
                        }
                        if (idFsPath && !isImport && isESMFile(idFsPath)) {
                            throw new Error(`${JSON.stringify(id)} resolved to an ESM file. ESM file cannot be loaded by \`require\`. See http://vitejs.dev/guide/troubleshooting.html#this-package-is-esm-only for more details.`);
                        }
                        return {
                            path: idFsPath,
                            external: true,
                        };
                    });
                },
            },
            {
                name: 'inject-file-scope-variables',
                setup(build) {
                    build.onLoad({ filter: /\.[cm]?[jt]s$/ }, async (args) => {
                        const contents = await fsp.readFile(args.path, 'utf8');
                        const injectValues = `const ${dirnameVarName} = ${JSON.stringify(path.dirname(args.path))};` +
                            `const ${filenameVarName} = ${JSON.stringify(args.path)};` +
                            `const ${importMetaUrlVarName} = ${JSON.stringify(pathToFileURL(args.path).href)};`;
                        return {
                            loader: args.path.endsWith('ts') ? 'ts' : 'js',
                            contents: injectValues + contents,
                        };
                    });
                },
            },
        ],
    });
    const { text } = result.outputFiles[0];
    return {
        code: text,
        dependencies: result.metafile ? Object.keys(result.metafile.inputs) : [],
    };
}
const _require = createRequire(import.meta.url);
async function loadConfigFromBundledFile(fileName, bundledCode, isESM) {
    // for esm, before we can register loaders without requiring users to run node
    // with --experimental-loader themselves, we have to do a hack here:
    // convert to base64, load it with native Node ESM.
    if (isESM) {
        try {
            // Postfix the bundled code with a timestamp to avoid Node's ESM loader cache
            const configTimestamp = `${fileName}.timestamp:${Date.now()}-${Math.random()
                .toString(16)
                .slice(2)}`;
            return (await dynamicImport('data:text/javascript;base64,' +
                Buffer.from(`${bundledCode}\n//${configTimestamp}`).toString('base64'))).default;
        }
        catch (e) {
            throw new Error(`${e.message} at ${fileName}`);
        }
    }
    // for cjs, we can register a custom loader via `_require.extensions`
    else {
        const extension = path.extname(fileName);
        // We don't use fsp.realpath() here because it has the same behaviour as
        // fs.realpath.native. On some Windows systems, it returns uppercase volume
        // letters (e.g. "C:\") while the Node.js loader uses lowercase volume letters.
        // See https://github.com/vitejs/vite/issues/12923
        const realFileName = await promisifiedRealpath(fileName);
        const loaderExt = extension in _require.extensions ? extension : '.js';
        const defaultLoader = _require.extensions[loaderExt];
        _require.extensions[loaderExt] = (module, filename) => {
            if (filename === realFileName) {
                module._compile(bundledCode, filename);
            }
            else {
                defaultLoader(module, filename);
            }
        };
        // clear cache in case of server restart
        delete _require.cache[_require.resolve(fileName)];
        const raw = _require(fileName);
        _require.extensions[loaderExt] = defaultLoader;
        return raw.__esModule ? raw.default : raw;
    }
}
async function runConfigHook(config, plugins, configEnv) {
    let conf = config;
    for (const p of getSortedPluginsByHook('config', plugins)) {
        const hook = p.config;
        const handler = hook && 'handler' in hook ? hook.handler : hook;
        if (handler) {
            const res = await handler(conf, configEnv);
            if (res) {
                conf = mergeConfig(conf, res);
            }
        }
    }
    return conf;
}
function getDepOptimizationConfig(config, ssr) {
    return ssr ? config.ssr.optimizeDeps : config.optimizeDeps;
}
function isDepsOptimizerEnabled(config, ssr) {
    const { command } = config;
    const { disabled } = getDepOptimizationConfig(config, ssr);
    return !(disabled === true ||
        (command === 'build' && disabled === 'build') ||
        (command === 'serve' && disabled === 'dev'));
}

export { loadEnv as A, resolveEnvPrefix as B, bindShortcuts as C, index$1 as D, build$1 as E, index as F, preview$1 as G, preprocessCSS as a, build as b, createServer as c, resolvePackageData as d, buildErrorMessage as e, formatPostcssSourceMap as f, defineConfig as g, resolveConfig as h, isInNodeModules as i, resolveBaseUrl as j, getDepOptimizationConfig as k, loadConfigFromFile as l, isDepsOptimizerEnabled as m, normalizePath as n, optimizeDeps as o, preview as p, mergeConfig as q, resolvePackageEntry as r, sortUserPlugins as s, transformWithEsbuild as t, mergeAlias as u, createFilter as v, send as w, createLogger as x, searchForWorkspaceRoot as y, isFileServingAllowed as z };
//# sourceMappingURL=dep-5f0d8efb.js.map
