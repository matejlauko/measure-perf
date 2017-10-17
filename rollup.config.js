const replace = require('rollup-plugin-replace');
const uglify = require('rollup-plugin-uglify');
const meta = require('./package.json');

const banner = `/*!
 * ${meta.name} v${meta.version}
 *
 * @license
 * Copyright (c) 2017 ${meta.author}
 * Released under the MIT license
 */`;

const config = {
  input: 'lib/index.js',
  output: {
    name: 'Lib',
    banner,
  },
  plugins: [],
};

switch (process.env.BUILD) {
  case 'commonjs':
    config.output.file = `dist/${meta.name}.cjs.js`;
    config.output.format = 'cjs';
    break;
  case 'development':
    config.output.file = `dist/${meta.name}.js`;
    config.output.format = 'umd';
    config.plugins.push(
      replace({
        'process.env.NODE_ENV': JSON.stringify('development'),
      })
    );
    break;
  case 'production':
    config.output.format = 'umd';
    config.output.file = `dist/${meta.name}.min.js`;
    config.plugins.push(
      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
      }),
      uglify()
    );
    break;
  default:
    throw new Error('Unknown build environment');
}

module.exports = config;
