const MinifyPlugin = require("babel-minify-webpack-plugin");
const nodeExternals = require("webpack-node-externals");
const path = require("path");
const UnzipsfxPlugin = require("unzipsfx-webpack-plugin");
const ZipPlugin = require("zip-webpack-plugin");

module.exports = [
  {
    entry: "./src/index.js",
    target: "node",
    externals: [nodeExternals()],
    output: {
      path: path.join(__dirname, "build-armv7l", "display-control"),
      filename: "index.js"
    },
    plugins: [
      new MinifyPlugin(),
      new ZipPlugin({
        path: path.join(__dirname, "build-armv7l"),
        filename: "display-control-armv7l"
      }),
      new UnzipsfxPlugin({
        outputPath: path.join(__dirname, "build-armv7l"),
        outputFilename: "display-control",
        arch: "armv7l"
      })
    ]
  },
  {
    entry: "./src/index.js",
    target: "node",
    externals: [nodeExternals()],
    output: {
      path: path.join(__dirname, "build-x32", "display-control"),
      filename: "index.js"
    },
    plugins: [
      new MinifyPlugin(),
      new ZipPlugin({
        path: path.join(__dirname, "build-x32"),
        filename: "display-control-32"
      }),
      new UnzipsfxPlugin({
        outputPath: path.join(__dirname, "build-x32"),
        outputFilename: "display-control",
        arch: "32"
      })
    ]
  },
  {
    entry: "./src/index.js",
    target: "node",
    externals: [nodeExternals()],
    output: {
      path: path.join(__dirname, "build-x64", "display-control"),
      filename: "index.js"
    },
    plugins: [
      new MinifyPlugin(),
      new ZipPlugin({
        path: path.join(__dirname, "build-x64"),
        filename: "display-control-64"
      }),
      new UnzipsfxPlugin({
        outputPath: path.join(__dirname, "build-x64"),
        outputFilename: "display-control",
        arch: "64"
      })
    ]
  }
];
