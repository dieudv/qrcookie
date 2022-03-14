var debug = process.env.NODE_ENV !== "prod";

const path = require('path');

let package = require('./package.json');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const WebpackObfuscator = require('webpack-obfuscator');
const HtmlMinimizerPlugin = require("html-minimizer-webpack-plugin");
const JsonMinimizerPlugin = require("json-minimizer-webpack-plugin");
const ZipPlugin = require('zip-webpack-plugin');

String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

function modifyManifest(buffer) {
    var manifest = JSON.parse(buffer.toString());
    manifest.version = package.version;
    manifest.author = package.author;

    let manifest_JSON = JSON.stringify(manifest, null, 2);
    return manifest_JSON;
}

var copyPatterns = [
    {
        from: "./manifest.json",
        to: "./manifest.json",
        transform(content, path) {
            return modifyManifest(content);
        }
    },
    { from: "./_locales", to: "./_locales" },
    {
        from: "./popup.html",
        to: "./popup.html",
    },
    {
        from: "./ic", to: "./ic", globOptions: {
            ignore: [
                '**/ic512.png',
            ]
        }
    },
];

module.exports = {
    mode: debug ? 'development' : 'production',
    resolve: {
        extensions: ['.js']
    },
    context: __dirname + "/src",
    devtool: 'source-map',
    entry: {
        background: "./js/background.js",
        popup: "./js/popup.js",
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: "[name].js",
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: { import: true },
                    }
                ],
            },
        ],
    },
    plugins: debug ? [
        new CleanWebpackPlugin(),
        new CopyPlugin({ patterns: copyPatterns }),
    ] : [
        new CleanWebpackPlugin(),
        new CopyPlugin({ patterns: copyPatterns }),
        new WebpackObfuscator({
            identifierNamesGenerator: 'mangled-shuffled',
            target: "browser-no-eval",
            stringArray: false,
            splitStrings: false,
            stringArrayEncoding: ['rc4']
        }),
        new ZipPlugin({
            filename: `${package.name}-${package.version}`,
        })
    ],
    optimization: {
        minimize: debug ? false : true,
        minimizer: [
            new HtmlMinimizerPlugin(),
            new JsonMinimizerPlugin(),
        ]
    },
};