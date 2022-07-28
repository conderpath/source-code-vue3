const minimist = require('minimist')
const { build } = require('esbuild')
const { resolve } = require('path')

// 获取参数
const args = minimist(process.argv.slice(2))

// { _: [ 'reactivity' ], f: 'global', s: true }
// 打包的模块
const target = args._.length?args._[0] : 'reactivity'
// 打包格式
const format = args.f || 'global'
// 获取对应模块的package.json
const pkg = require(resolve(__dirname, `../packages/${target}/package.json`))


// 打包输出格式判断
const outputFormat = format.startsWith('global')
  ? 'iife'
  : format === 'cjs'
  ? 'cjs'
  : 'esm'

const postfix = format.endsWith('-runtime')
? `runtime.${format.replace(/-runtime$/, '')}`
: format
// 输出文件
const outfile = resolve(
  __dirname,
  `../packages/${target}/dist/${target}.${postfix}.js`
)
build({
  // 入口文件
  entryPoints: [resolve(__dirname,`../packages/${target}/src/index.ts`)],
  format: outputFormat, // 打包输出格式
  outfile, // 打包生成的文件
  globalName: pkg.buildOptions?.name, // 暴露全局的名字
  bundle: true, // 打包成一个文件
  sourcemap: true, // 使用sourcemap
  platform: format === 'cjs'? 'node': 'browser',
  watch: {
    onRebuild(error) {
      if (!error) console.log(`rebuilt: ok`)
    }
  }
}).then(() => {
  console.log(`watching: build`)
})