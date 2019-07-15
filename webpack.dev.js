const merge = require("webpack-merge");
const common = require("./webpack.common");
const webpack = require("webpack");
const HtmlWebpackReloadPlugin = require("html-webpack-reload-plugin");
module.exports = (env, argv) => {
    return merge(common(env), {
        mode: "development",
        devtool: "eval-source-map",
        devServer: {
            contentBase: "./dist",
            hot: true
        },
        plugins: [
            new HtmlWebpackReloadPlugin(),
            new webpack.HotModuleReplacementPlugin(),
            new webpack.DefinePlugin({
                "process.env.NODE_ENV": JSON.stringify("development")
            })
        ],
        module: {
            rules: [
                {
                    test: /\.css$/,
                    use: [
                        "style-loader",
                        {
                            loader: "css-loader",
                            options: {
                                importLoaders: 1
                            }
                        }
                    ]
                },

                {
                    test: /\.scss$/,
                    use: [
                        {
                            loader: "style-loader"
                        },
                        {
                            loader: "css-loader",
                            options: {
                                importLoaders: 1
                            }
                        },
                        {
                            loader: "postcss-loader",
                            options: {
                                sourceMap: true,
                                config: {
                                    path: "postcss.config.js"
                                }
                            }
                        },
                        {
                            loader: "sass-loader" // 将 Sass 编译成 CSS
                        },
                        {
                            loader: "sass-resources-loader",
                            options: {
                                resources: "./src/style/mixins.scss"
                            }
                        }
                    ]
                }
            ]
        }
    });
};
