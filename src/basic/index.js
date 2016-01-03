

export default function(config) {
  return config
    .loader('json')
    .loader('raw')
    .inTest(
      config => config.sourcemap('inline-source-map')))
    .inDevelopment(
      config => config.sourcemap('cheap-module-eval-source-map'))
    .inProduction(
      config => config.sourcemap('source-map'))

}
