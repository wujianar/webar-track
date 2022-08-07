import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';

const isProduction = process.env.NODE_ENV === 'production';

export default {
    input: 'src/app.ts',
    plugins: [
        typescript(),
        commonjs(),
        resolve(),
        isProduction && terser(),
        !isProduction && serve({ contentBase: './', port: 3000 }),
        // !isProduction && livereload({watch: 'assets/js/', delay: 300}),
    ],
    external: ['three'],
    output: {
        globals: { three: 'THREE' },
        file: 'assets/js/bundle.js',
        format: 'iife',
        name: 'jerry',
    },
};
