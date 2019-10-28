const path = require('path');

const SandboxedModule = require('sandboxed-module');

// Shorthand for hasOwnProperty that also works with bare objects
const hasProp = (obj, prop) =>
  Object.prototype.hasOwnProperty.bind(obj)(prop);

const maybeCoverage = () =>
  Object.keys(require.cache).some(path => /node_modules\/nyc/.test(path));

// Supply a set of mock objects to a node js module in a sandbox.
// This means the module's functionality can't leak out onto the
//   filesystem or network whilst being tested.
module.exports.sandBox = (fileName, params, ...args) => {
  const resolvedFileName = path.resolve(__dirname, '../../', fileName);

  // Voodoo magic to support nyc.
  if (maybeCoverage()) {
    params.sourceTransformers = {
      nyc (source) {
        const Instrumenter = require('nyc/lib/instrumenters/istanbul');
        const instrumenter = Instrumenter(process.cwd(), {});
        const instrumentMethod = instrumenter.instrumentSync.bind(instrumenter);
        return instrumentMethod(source, resolvedFileName);
      }
    };
  }

  return SandboxedModule.require(resolvedFileName, params, ...args);
};

// Convieniece function to throw an error is an unmocked dependancy is used
module.exports.wrapRequire = modules =>
  new Proxy(require, {
    apply: (target, self, args) => {
      const moduleName = args[0];

      if (!hasProp(modules, moduleName)) {
        throw new Error(`Non mocked module required: ${moduleName}`);
      }

      return modules[moduleName];
    }
  });
