const { generateFonts } = require('@ramirezcgn/fantasticon');
const { cosmiconfigSync } = require('cosmiconfig');
const { validate } = require('schema-utils');

const importDefault = function (mod) {
  return mod && mod.__esModule ? mod.default : mod;
};

const searchPlaces = function (moduleName) {
  return [
    'package.json',
    `.${moduleName}rc`,
    `.${moduleName}rc.json`,
    `.${moduleName}rc.yaml`,
    `.${moduleName}rc.yml`,
    `.${moduleName}rc.js`,
    `.${moduleName}rc.cjs`,
    `${moduleName}rc`,
    `${moduleName}rc.json`,
    `${moduleName}rc.yaml`,
    `${moduleName}rc.yml`,
    `${moduleName}rc.js`,
    `${moduleName}rc.cjs`,
    `${moduleName}.config.js`,
    `${moduleName}.config.cjs`,
  ];
};

const schema = {
  type: 'object',
  properties: {
    runOnComplete: {
      type: 'boolean',
    },
    configPath: {
      type: 'string',
    },
    config: {
      type: 'object',
    },
    onComplete: {
      instanceof: 'Function',
    },
  },
};

class FantasticonPlugin {
  constructor(options = {}) {
    this.pluginName = 'Fantasticon Plugin';
    this.firstRun = true;
    this.options = options;
    validate(schema, options, {
      name: this.pluginName,
      baseDataPath: 'options',
    });
  }

  apply(compiler) {
    const {
      runOnComplete = false,
      configPath = null,
      config = null,
    } = this.options;

    let loadedConfig = null;
    const explorerSync = cosmiconfigSync('fantasticon', {
      searchPlaces: searchPlaces('fantasticon'),
    });
    if (configPath) {
      loadedConfig = explorerSync.load(configPath);
    } else {
      loadedConfig = explorerSync.search();
    }

    if (!loadedConfig && !config) {
      console.log('> Error compiling icon font, invalid config!');
      return;
    }

    const fileConfig = importDefault(loadedConfig.config);
    const { onComplete = null, ...rawOptions } = fileConfig;
    const fontConfig = Object.assign({}, config || {}, rawOptions);

    const hookFn = (callback) => {
      console.log('> Compiling icon font!');
      return generateFonts(fontConfig)
        .then(() => {
          if (runOnComplete && onComplete) {
            onComplete(fontConfig);
          }
          console.log('> Icon font compiled!');
          callback();
        })
        .catch((err) => callback(err));
    };

    const beforeRunFn = (_compilation, callback) => hookFn(callback);
    const watchRunFn = (_watching, callback) => {
      if (this.firstRun) {
        return hookFn(() => {
          this.firstRun = false;
          return callback();
        });
      }
      return callback();
    };

    compiler.hooks.beforeRun.tapAsync(this.pluginName, beforeRunFn);
    compiler.hooks.watchRun.tapAsync(this.pluginName, watchRunFn);
  }
}

module.exports = FantasticonPlugin;
