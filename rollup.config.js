import babel from 'rollup-plugin-babel';
import node from 'rollup-plugin-node-resolve';

const src = 'src/';
const dist = 'dist';

const plugins = [node(), babel()];

const onwarn = (warning, warn) => {
  if (warning.code === 'CIRCULAR_DEPENDENCY') return;
  warn(warning);
};

export default [{
  onwarn: onwarn,
  input: `${src}index.js`,
  output: {
    name: 'd3',
    dir: dist,
    format: 'umd',
    entryFileNames: 'd3.min.js'
  },
  plugins
}, {
  input: `${src}custom.js`,
  output: {
    name: 'Main',
    format: 'iife',
    dir: dist,
    entryFileNames: 'custom.min.js'
  },
  plugins
}];
