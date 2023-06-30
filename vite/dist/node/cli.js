import path from 'node:path';
import fs from 'node:fs';
import { performance } from 'node:perf_hooks';
import { cac } from 'cac';
import colors from 'picocolors';
import { C as bindShortcuts, x as createLogger, h as resolveConfig } from './chunks/dep-db559168.js';
import { VERSION } from './constants.js';
import 'node:fs/promises';
import 'node:url';
import 'node:util';
import 'node:module';
import '@rollup/plugin-alias';
import 'esbuild';
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
import 'rollup';
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

const cli = cac('vite');
let profileSession = global.__vite_profile_session;
let profileCount = 0;
const stopProfiler = (log) => {
    if (!profileSession)
        return;
    return new Promise((res, rej) => {
        profileSession.post('Profiler.stop', (err, { profile }) => {
            // Write profile to disk, upload, etc.
            if (!err) {
                const outPath = path.resolve(`./vite-profile-${profileCount++}.cpuprofile`);
                fs.writeFileSync(outPath, JSON.stringify(profile));
                log(colors.yellow(`CPU profile written to ${colors.white(colors.dim(outPath))}`));
                profileSession = undefined;
                res();
            }
            else {
                rej(err);
            }
        });
    });
};
const filterDuplicateOptions = (options) => {
    for (const [key, value] of Object.entries(options)) {
        if (Array.isArray(value)) {
            options[key] = value[value.length - 1];
        }
    }
};
/**
 * removing global flags before passing as command specific sub-configs
 */
function cleanOptions(options) {
    const ret = { ...options };
    delete ret['--'];
    delete ret.c;
    delete ret.config;
    delete ret.base;
    delete ret.l;
    delete ret.logLevel;
    delete ret.clearScreen;
    delete ret.d;
    delete ret.debug;
    delete ret.f;
    delete ret.filter;
    delete ret.m;
    delete ret.mode;
    return ret;
}
cli
    .option('-c, --config <file>', `[string] use specified config file`)
    .option('--base <path>', `[string] public base path (default: /)`)
    .option('-l, --logLevel <level>', `[string] info | warn | error | silent`)
    .option('--clearScreen', `[boolean] allow/disable clear screen when logging`)
    .option('-d, --debug [feat]', `[string | boolean] show debug logs`)
    .option('-f, --filter <filter>', `[string] filter debug logs`)
    .option('-m, --mode <mode>', `[string] set env mode`);
// dev
cli
    .command('[root]', 'start dev server') // default command
    .alias('serve') // the command is called 'serve' in Vite's API
    .alias('dev') // alias to align with the script name
    .option('--host [host]', `[string] specify hostname`)
    .option('--port <port>', `[number] specify port`)
    .option('--https', `[boolean] use TLS + HTTP/2`)
    .option('--open [path]', `[boolean | string] open browser on startup`)
    .option('--cors', `[boolean] enable CORS`)
    .option('--strictPort', `[boolean] exit if specified port is already in use`)
    .option('--force', `[boolean] force the optimizer to ignore the cache and re-bundle`)
    .action(async (root, options) => {
    filterDuplicateOptions(options);
    // output structure is preserved even after bundling so require()
    // is ok here
    const { createServer } = await import('./chunks/dep-db559168.js').then(function (n) { return n.F; });
    try {
        const server = await createServer({
            root,
            base: options.base,
            mode: options.mode,
            configFile: options.config,
            logLevel: options.logLevel,
            clearScreen: options.clearScreen,
            optimizeDeps: { force: options.force },
            server: cleanOptions(options),
        });
        if (!server.httpServer) {
            throw new Error('HTTP server not available');
        }
        await server.listen();
        const info = server.config.logger.info;
        const viteStartTime = global.__vite_start_time ?? false;
        const startupDurationString = viteStartTime
            ? colors.dim(`ready in ${colors.reset(colors.bold(Math.ceil(performance.now() - viteStartTime)))} ms`)
            : '';
        info(`\n  ${colors.green(`${colors.bold('VITE')} v${VERSION}`)}  ${startupDurationString}\n`, { clear: !server.config.logger.hasWarned });
        server.printUrls();
        bindShortcuts(server, {
            print: true,
            customShortcuts: [
                profileSession && {
                    key: 'p',
                    description: 'start/stop the profiler',
                    async action(server) {
                        if (profileSession) {
                            await stopProfiler(server.config.logger.info);
                        }
                        else {
                            const inspector = await import('node:inspector').then((r) => r.default);
                            await new Promise((res) => {
                                profileSession = new inspector.Session();
                                profileSession.connect();
                                profileSession.post('Profiler.enable', () => {
                                    profileSession.post('Profiler.start', () => {
                                        server.config.logger.info('Profiler started');
                                        res();
                                    });
                                });
                            });
                        }
                    },
                },
            ],
        });
    }
    catch (e) {
        const logger = createLogger(options.logLevel);
        logger.error(colors.red(`error when starting dev server:\n${e.stack}`), {
            error: e,
        });
        stopProfiler(logger.info);
        process.exit(1);
    }
});
// build
cli
    .command('build [root]', 'build for production')
    .option('--target <target>', `[string] transpile target (default: 'modules')`)
    .option('--outDir <dir>', `[string] output directory (default: dist)`)
    .option('--assetsDir <dir>', `[string] directory under outDir to place assets in (default: assets)`)
    .option('--assetsInlineLimit <number>', `[number] static asset base64 inline threshold in bytes (default: 4096)`)
    .option('--ssr [entry]', `[string] build specified entry for server-side rendering`)
    .option('--sourcemap [output]', `[boolean | "inline" | "hidden"] output source maps for build (default: false)`)
    .option('--minify [minifier]', `[boolean | "terser" | "esbuild"] enable/disable minification, ` +
    `or specify minifier to use (default: esbuild)`)
    .option('--manifest [name]', `[boolean | string] emit build manifest json`)
    .option('--ssrManifest [name]', `[boolean | string] emit ssr manifest json`)
    .option('--force', `[boolean] force the optimizer to ignore the cache and re-bundle (experimental)`)
    .option('--emptyOutDir', `[boolean] force empty outDir when it's outside of root`)
    .option('-w, --watch', `[boolean] rebuilds when modules have changed on disk`)
    .action(async (root, options) => {
    filterDuplicateOptions(options);
    const { build } = await import('./chunks/dep-db559168.js').then(function (n) { return n.E; });
    const buildOptions = cleanOptions(options);
    try {
        await build({
            root,
            base: options.base,
            mode: options.mode,
            configFile: options.config,
            logLevel: options.logLevel,
            clearScreen: options.clearScreen,
            optimizeDeps: { force: options.force },
            build: buildOptions,
        });
    }
    catch (e) {
        createLogger(options.logLevel).error(colors.red(`error during build:\n${e.stack}`), { error: e });
        process.exit(1);
    }
    finally {
        stopProfiler((message) => createLogger(options.logLevel).info(message));
    }
});
// optimize
cli
    .command('optimize [root]', 'pre-bundle dependencies')
    .option('--force', `[boolean] force the optimizer to ignore the cache and re-bundle`)
    .action(async (root, options) => {
    filterDuplicateOptions(options);
    const { optimizeDeps } = await import('./chunks/dep-db559168.js').then(function (n) { return n.D; });
    try {
        const config = await resolveConfig({
            root,
            base: options.base,
            configFile: options.config,
            logLevel: options.logLevel,
            mode: options.mode,
        }, 'serve');
        await optimizeDeps(config, options.force, true);
    }
    catch (e) {
        createLogger(options.logLevel).error(colors.red(`error when optimizing deps:\n${e.stack}`), { error: e });
        process.exit(1);
    }
});
cli
    .command('preview [root]', 'locally preview production build')
    .option('--host [host]', `[string] specify hostname`)
    .option('--port <port>', `[number] specify port`)
    .option('--strictPort', `[boolean] exit if specified port is already in use`)
    .option('--https', `[boolean] use TLS + HTTP/2`)
    .option('--open [path]', `[boolean | string] open browser on startup`)
    .option('--outDir <dir>', `[string] output directory (default: dist)`)
    .action(async (root, options) => {
    filterDuplicateOptions(options);
    const { preview } = await import('./chunks/dep-db559168.js').then(function (n) { return n.G; });
    try {
        const server = await preview({
            root,
            base: options.base,
            configFile: options.config,
            logLevel: options.logLevel,
            mode: options.mode,
            build: {
                outDir: options.outDir,
            },
            preview: {
                port: options.port,
                strictPort: options.strictPort,
                host: options.host,
                https: options.https,
                open: options.open,
            },
        });
        server.printUrls();
    }
    catch (e) {
        createLogger(options.logLevel).error(colors.red(`error when starting preview server:\n${e.stack}`), { error: e });
        process.exit(1);
    }
    finally {
        stopProfiler((message) => createLogger(options.logLevel).info(message));
    }
});
cli.help();
cli.version(VERSION);
cli.parse();

export { stopProfiler };
//# sourceMappingURL=cli.js.map
