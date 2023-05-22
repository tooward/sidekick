const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: {
    app: './src/scripts/popup.js'
    },
    devtool: 'inline-source-map',
    devServer: {
        contentBase: './dist'
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            title: 'Output Management',
            template:'./src/index.html'
        }),
        new CopyPlugin({
            patterns: [
            { from: './src/manifest.json', to:'./' },
            { from: './src/assets/images/*', to:'./assets/images/' },
            { from: './src/scripts/background.js', to:'./scripts/' },
            { from: './src/scripts/content.js', to:'./scripts/' },
            { from: './src/assets/css/style.css', to:'./assets/css/' }
        ],
        }),
    ],
    output: {
        filename: 'sidekick.bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                include: path.resolve(__dirname, 'src'),
                use: ['file-loader']
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    }
};