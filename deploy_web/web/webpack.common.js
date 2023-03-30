const path = require('path');
const webpack = require('webpack');
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")

module.exports = {
    entry: './src/app.tsx',
    output: {
        filename: 'sakuraverse-bundle.js',
        path: path.resolve(__dirname, 'dist')
    },

    devServer: {
        static: {
          directory: path.join(__dirname, './'),
        },
        allowedHosts: 'all',
        compress: true,
        port: 9000
    },

    module: {
        rules: [{
            test: /\.tsx?$/,
            use: "ts-loader"
        }],
    },
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', 'json'],
    },

    plugins: [
        new NodePolyfillPlugin(),
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
        }),
        new webpack.ProvidePlugin({
            process: 'process/browser',
        })
    ]
};