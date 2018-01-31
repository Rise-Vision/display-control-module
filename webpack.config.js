const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MinifyPlugin = require("babel-minify-webpack-plugin");
const path = require("path");
const UnzipsfxPlugin = require("unzipsfx-webpack-plugin");
const ZipPlugin = require("zip-webpack-plugin");

module.exports = {
  entry: "./src/index.js",
  target: "node",
  externals: {
    "electron": "electron",
    "original-fs": "original-fs"
  },
  output: {
    path: path.join(__dirname, "build", "display-control"),
    filename: "index.js"
  },
  plugins: [
    new webpack.IgnorePlugin(/vertx/),
    new CopyWebpackPlugin([{from: "package.json"}]),
    new MinifyPlugin(),
    new ZipPlugin({
      path: path.join(__dirname, "build"),
      filename: "display-control"
    }),
    new UnzipsfxPlugin({
      outputPath: path.join(__dirname, "build"),
      outputFilename: "display-control"
    })
  ],
  stats: {
    warningsFilter: /bq-controller[\s\S]*dependency is an expression.*/
  }
};
