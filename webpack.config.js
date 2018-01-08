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
        {from: "./build-x-armv7l/node_modules", to: "node_modules"},
        {from: "./package.json"}
      ]),
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
      path: path.join(__dirname, "build-32", "display-control"),
      filename: "index.js"
    },
    plugins: [
      new CopyWebpackPlugin([
        {from: "./build-x32/node_modules", to: "node_modules"},
        {from: "./package.json"}
      ]),
      new MinifyPlugin(),
      new ZipPlugin({
        path: path.join(__dirname, "build-32"),
        filename: "display-control-32"
      }),
      new UnzipsfxPlugin({
        outputPath: path.join(__dirname, "build-32"),
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
      path: path.join(__dirname, "build-64", "display-control"),
      filename: "index.js"
    },
    plugins: [
      new CopyWebpackPlugin([
        {from: "./build-x64/node_modules", to: "node_modules"},
        {from: "./package.json"}
      ]),
      new MinifyPlugin(),
      new ZipPlugin({
        path: path.join(__dirname, "build-64"),
        filename: "display-control-64"
      }),
      new UnzipsfxPlugin({
        outputPath: path.join(__dirname, "build-64"),
        outputFilename: "display-control",
        arch: "64"
      })
    ]
  }
];
