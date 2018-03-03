var loaderUtils = require("loader-utils");
var path = require("path");

module.exports = function(content) {
  const defaultConfig = {
    name: "[name].[ext]",
    rewritePath: undefined
  };

  const config = Object.assign(defaultConfig, loaderUtils.getOptions(this));

  const context = config.context || this.rootContext || (this.config && this.config.context);
  const fileName = loaderUtils.interpolateName(this, config.name, {
    content: content,
    context: context,
  });

  if (this.emitFile) {
    this.emitFile(fileName, content, false);
    this.addDependency(this.resourcePath);
  } else {
    throw new Error('emitFile function is not available');
  }

  if (config.rewritePath) {
    const filePath = JSON.stringify(path.join(config.rewritePath, fileName));

    return "try { global.process.dlopen(module, " + filePath + "); } " +
      "catch(exception) { throw new Error('Cannot open ' + " + filePath + " + ': ' + exception); };";
  } else {
    return "const path = require('path');" +
      "const filePath = path.resolve(__dirname, " + JSON.stringify(fileName) + ");" +
      "try { global.process.dlopen(module, filePath); } " +
      "catch(exception) { throw new Error('Cannot open ' + filePath + ': ' + exception); };";
  }
};

module.exports.raw = true;
