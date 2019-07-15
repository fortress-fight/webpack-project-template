const merge = require("webpack-merge");
const common = require("./webpack.common");
const webpack = require("webpack");
const MinifyPlugin = require("babel-minify-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
module.exports = (env, argv) => {
    return merge(common(env), {
        mode: "production",
        // devtool: "source-map",
        module: {
            rules: [
                {
                    test: /\.css$/,
                    use: [
                        {
                            loader: MiniCssExtractPlugin.loader,
                            options: {
                                publicPath: "../"
                            }
                        },
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
                            loader: MiniCssExtractPlugin.loader,
                            options: {
                                publicPath: "../"
                            }
                        },
                        {
                            loader: "css-loader",
                            options: {
                                importLoaders: 1,
                                sourceMap: true
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
                            loader: "sass-loader", // 将 Sass 编译成 CSS
                            options: {
                                sourceMap: true
                            }
                        }
                    ]
                }
            ]
        },

        plugins: [
            /**
             * css 压缩
             * 介绍: https://webpack.docschina.org/plugins/mini-css-extract-plugin/#src/components/Sidebar/Sidebar.jsx
             **/
            new MiniCssExtractPlugin({
                filename: "style/[name].css"
            }),
            /** 
            * js 压缩
            * 介绍: https://github.com/webpack-contrib/babel-minify-webpack-plugin
            **/
            new MinifyPlugin(),
            /**
             * 创建一个在编译时可以配置的全局常量
             * 介绍: https://webpack.docschina.org/plugins/define-plugin/#src/components/Sidebar/Sidebar.jsx
             **/
            new webpack.DefinePlugin({
                "process.env.NODE_ENV": JSON.stringify("production")
            })
        ]
    });
};
