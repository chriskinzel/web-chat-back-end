import typescript from 'rollup-plugin-typescript2'
import pkg from './package.json'
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

export default {
    input: 'src/app.ts',
    output: [
        {
            file: pkg.main,
            format: 'cjs',
            banner: '#! /usr/bin/env node'
        }
    ],
    external: [
        ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
    'path'
],
plugins: [
    // This custom plugin is needed to fix crappy commonjs module imports
    {
        transform ( code, id ) {
            const replacement = 'import * as $1_ from \'$2\';const $1 = $1_;';
            return code.replace(
                /import[ \t]+\*[ \t]+as[ \t]+(.*)[ \t]+from[ \t]+['"](.*)['"]/g,
                replacement
            ).replace(
                /import[ \t]+(.*)[ \t]+=[ \t]+require\(['"](.*)['"]\)/g,
                replacement
            );
        }
    },
    typescript({
        typescript: require('typescript'),
        tsconfigOverride: {
            compilerOptions: {
                module: 'es6',
                sourceMap: false
            }
        }
    }),
    nodeResolve({
        jsnext: true,
        main: true
    }),
    commonjs({

    }),
    terser()
],
}
