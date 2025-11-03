module.exports = {
  presets: [
    [
      'next/babel',
      {
        'preset-env': {
          targets: {
            browsers: ['>0.25%', 'not dead'],
          },
        },
      },
    ],
  ],
  plugins: [
    // 额外的插件
    ['module-resolver', {
      alias: {
        '@': './',
        '@/components': './components',
        '@/lib': './lib',
        '@/utils': './lib',
      },
    }],
  ],
}