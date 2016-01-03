import assert from 'assert';
import path from 'path';
import includes from 'lodash/collection/includes';

function report(condition, problem, solution, link) {
  assert.ok(!condition, problem + '\n\ntry: \n\n' + solution + (!link ? '' : '\n\nreference: ' + link))
}

function validateOutput(config) {
  let entry = config.entry
    , output = config.output;

  if (!output) return;
  
  let filename = output.filename
    , ext = path.extname(filename);

  report(
    !(includes(filename, '[name]') || includes(filename, '[chunkhash]')) &&
    (!Array.isArray(entry) && typeof entry !== 'string') &&
    Object.keys(entry).length > 1,
    `You have specified multiple entry points, but used a hardcoded output filname ("${filename}"). ` +
    `This will result in each entry file having the same file name and accidently replace the previous one. `,

    `Use a substition ("[name]", "[chunkhash]") in your file name to make each unique, such as: ` +
    `"${path.basename(filename, ext)}.[name]${ext ? ext : ''}" instead.`,

    'https://webpack.github.io/docs/configuration.html#output-filename'
  )
}

export default function validate(config) {
  validateOutput(config)
}
