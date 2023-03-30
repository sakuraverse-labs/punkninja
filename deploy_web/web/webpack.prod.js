const {merge} = require('webpack-merge');
const common = require('./webpack.common.js');
module.exports = merge(common, {
    mode: 'production',
    performance: {
        maxEntrypointSize: 10000000,
        maxAssetSize: 30000000
    },
    devtool: 'source-map'
});