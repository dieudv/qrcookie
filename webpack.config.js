const devMode = process.env.NODE_ENV !== "prod";
const path = require('path');

let package = require('./package.json');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const HtmlMinimizerPlugin = require("html-minimizer-webpack-plugin");
const JsonMinimizerPlugin = require("json-minimizer-webpack-plugin");
const ZipPlugin = require('zip-webpack-plugin');
const TerserPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");


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
    mode: devMode ? 'development' : 'production',
    resolve: {
        extensions: ['.js']
    },
    context: __dirname + "/src",
    devtool: devMode ? 'source-map' : false,
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
                    MiniCssExtractPlugin.loader,
                    'css-loader'
                ]
            },
        ],
    },
    plugins: devMode ? [
        new CleanWebpackPlugin(),
        new CopyPlugin({ patterns: copyPatterns }),
        new MiniCssExtractPlugin({
            filename: 'style.css'
        }),
    ] : [
        new CleanWebpackPlugin(),
        new CopyPlugin({ patterns: copyPatterns }),
        new MiniCssExtractPlugin({
            filename: 'style.css'
        }),
        new ZipPlugin({
            filename: `${package.name}-${package.version}`,
            exclude: [/\.map$/],
        })
    ],
    optimization: {
        minimize: devMode ? false : true,
        minimizer: [
            new HtmlMinimizerPlugin(),
            new JsonMinimizerPlugin(),
            new CssMinimizerPlugin(),
            new TerserPlugin(),
        ],
    },
};