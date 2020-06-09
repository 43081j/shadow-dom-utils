import commonJS from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import externalGlobals from 'rollup-plugin-external-globals';

export default [
  {
    input: 'lib/index.js',
    output: {
      dir: 'dist/',
      format: 'esm'
    },
    plugins: [
      nodeResolve(),
      commonJS(),
      externalGlobals({
        // major hackery to trick the postcss dep to drop its nasty
        // usage of 'util'
        util: '{deprecate: (fn, msg) => () => console.warn(msg)}'
      })
    ]
  },
  {
    input: 'lib/test/index.js',
    output: {
      file: 'dist/test.js',
      format: 'esm'
    },
    plugins: [
      nodeResolve(),
      commonJS(),
      externalGlobals({
        // major hackery to trick the postcss dep to drop its nasty
        // usage of 'util'
        util: '{deprecate: (fn, msg) => () => console.warn(msg)}'
      })
    ]
  }
];
