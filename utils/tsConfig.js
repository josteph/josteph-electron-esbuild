const ts = require('typescript');

function getTSConfig(cwd, configPath = 'tsconfig.json') {
  const tsConfigFile = ts.findConfigFile(cwd, ts.sys.fileExists, configPath);

  if (!tsConfigFile) {
    throw new Error(`tsconfig.json does not exist in the current directory: ${cwd}`);
  }

  const configFile = ts.readConfigFile(tsConfigFile, ts.sys.readFile);

  if (configFile.error) {
    throw new Error(`Cannot read TS configuration file from ${cwd}: ${configFile.error}`);
  }

  const tsConfig = ts.parseJsonConfigFileContent(configFile.config, ts.sys, cwd);

  return { tsConfig, tsConfigFile };
}

module.exports = getTSConfig;
