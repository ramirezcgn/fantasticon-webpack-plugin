/* eslint-disable no-empty */
const { join } = require('path');
const { statSync, readFileSync } = require('fs');

const DEFAULT_FILEPATHS = [
  '.fantasticonrc',
  'fantasticonrc',
  '.fantasticonrc.json',
  'fantasticonrc.json',
  '.fantasticonrc.js',
  'fantasticonrc.js',
];

const checkPath = (filepath, type) => {
  try {
    const result = statSync(join(process.cwd(), filepath));

    if (type) {
      return type === 'directory' ? result.isDirectory() : result.isFile();
    }

    return true;
  } catch (err) {
    return false;
  }
};

const attemptLoading = async (filepath) => {
  const errStack = [];
  if (checkPath(filepath, 'file')) {
    const fullpath = join(process.cwd(), filepath);

    try {
      return require(fullpath);
    } catch (error) {
      errStack.push(error);
    }

    try {
      return import(fullpath);
    } catch (error) {
      errStack.push(error);
    }

    try {
      return JSON.parse(readFileSync(fullpath, 'utf8'));
    } catch (error) {
      errStack.push(error);
    }

    console.error(errStack);
    throw new Error(`Failed parsing configuration at '${filepath}'`);
  }
};

const loadConfig = (filepath) => {
  let loadedConfig = null;

  if (filepath) {
    loadedConfig = attemptLoading(filepath);
  } else {
    for (const path of DEFAULT_FILEPATHS) {
      loadedConfig = attemptLoading(path);
      if (loadedConfig) {
        break;
      }
    }
  }

  return loadedConfig;
};

module.exports = loadConfig;
