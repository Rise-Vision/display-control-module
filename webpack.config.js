const MinifyPlugin = require("babel-minify-webpack-plugin");
const nodeExternals = require("webpack-node-externals");
const path = require("path");
const UnzipsfxPlugin = require("unzipsfx-webpack-plugin");
const ZipPlugin = require("zip-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

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
      new CopyWebpackPlugin([
        {from: "./build-temp/node_modules", to: "node_modules"},
        {from: "./build-temp/package.json"}
      ]),
      new MinifyPlugin(),
      new ZipPlugin({
        path: path.join(__dirname, "build-armv7l"),
        filename: "display-control-armv7l"
      }),
      new UnzipsfxPlugin({
        outputPath: path.join(__dirname, "build-armv7l"),
        outputFilename: "display-control",
        arch: "armv7l",
        platform: "lnx"
      })
    ]
  },
  {
    entry: "./src/index.js",
    target: "node",
    externals: [nodeExternals()],
    output: {
      path: path.join(__dirname, "build-win-32", "display-control"),
      filename: "index.js"
    },
    plugins: [
      new CopyWebpackPlugin([
        {from: "./build-win-x32/node_modules", to: "node_modules"},
        {from: "./package.json"}
      ]),
      new MinifyPlugin(),
      new ZipPlugin({
        path: path.join(__dirname, "build-win-32"),
        filename: "display-control-win-32"
      }),
      new UnzipsfxPlugin({
        outputPath: path.join(__dirname, "build-win-32"),
        outputFilename: "display-control",
        arch: "32",
        platform: "win"
      })
    ]
  },
  {
    entry: "./src/index.js",
    target: "node",
    externals: [nodeExternals()],
    output: {
      path: path.join(__dirname, "build-win-64", "display-control"),
      filename: "index.js"
    },
    plugins: [
      new CopyWebpackPlugin([
        {from: "./build-win-x64/node_modules", to: "node_modules"},
        {from: "./package.json"}
      ]),
      new MinifyPlugin(),
      new ZipPlugin({
        path: path.join(__dirname, "build-win-64"),
        filename: "display-control-win-64"
      }),
      new UnzipsfxPlugin({
        outputPath: path.join(__dirname, "build-win-64"),
        outputFilename: "display-control",
        arch: "64",
        platform: "win"
      })
    ]
  },
  {
    entry: "./src/index.js",
    target: "node",
    externals: [nodeExternals()],
    output: {
      path: path.join(__dirname, "build-lnx-32", "display-control"),
      filename: "index.js"
    },
    plugins: [
      new CopyWebpackPlugin([
        {from: "./build-lnx-x32/node_modules", to: "node_modules"},
        {from: "./package.json"}
      ]),
      new MinifyPlugin(),
      new ZipPlugin({
        path: path.join(__dirname, "build-lnx-32"),
        filename: "display-control-lnx-32"
      }),
      new UnzipsfxPlugin({
        outputPath: path.join(__dirname, "build-lnx-32"),
        outputFilename: "display-control",
        arch: "32",
        platform: "lnx"
      })
    ]
  },
  {
    entry: "./src/index.js",
    target: "node",
    externals: [nodeExternals()],
    output: {
      path: path.join(__dirname, "build-lnx-64", "display-control"),
      filename: "index.js"
    },
    plugins: [
      new CopyWebpackPlugin([
        {from: "./build-lnx-x64/node_modules", to: "node_modules"},
        {from: "./package.json"}
      ]),
      new MinifyPlugin(),
      new ZipPlugin({
        path: path.join(__dirname, "build-lnx-64"),
        filename: "display-control-lnx-64"
      }),
      new UnzipsfxPlugin({
        outputPath: path.join(__dirname, "build-lnx-64"),
        outputFilename: "display-control",
        arch: "64",
        platform: "lnx"
      })
    ]
  }
];
