const { generateFonts } = require('@ramirezcgn/fantasticon');
const { validate } = require('schema-utils');
const loadConfig = require('./config-loader');

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

    const loadedConfig = loadConfig(configPath);
    if (!loadedConfig && !config) {
      console.log('> Error compiling icon font, invalid config!');
      return;
    }

    const { onComplete = null, ...rawOptions } = loadedConfig;
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
