const path = require("path");
const glob = require("glob");
const webpack = require("webpack");

const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

module.exports = (env, argv) => {
    return setConfig(env, argv);
};

function setConfig(env, argv) {
    const ASSET_PATH = (env && env.ASSET_PATH) || "/";

    const webpack_config = {
        entry: {
            main: path.resolve(__dirname, "./src/app.js")
        },
        output: {
            filename: "js/[name].js",
            path: path.resolve(__dirname, "./dist"),
            publicPath: ASSET_PATH
        },
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "./src")
            }
        },
        module: {
            rules: [
                {
                    test: /\.html$/,
                    use: [
                        {
                            loader: "html-loader",
                            options: {
                                interpolate: true,
                                attrs: [
                                    "img:src",
                                    "video:src",
                                    "video:poster",
                                    ":data-src"
                                ]
                            }
                        }
                    ]
                },
                {
                    test: /\.ejs$/,
                    loader: "ejs-loader",
                    query: {
                        variable: "data",
                        interpolate: "\\{\\{(.+?)\\}\\}",
                        evaluate: "\\[\\[(.+?)\\]\\]",
                        title: "index"
                    }
                },
                {
                    test: /\.js$/,
                    include: "/src/",
                    exclude: "/node_modules/",
                    use: [
                        {
                            loader: "babel-loader"
                        }
                    ]
                },
                {
                    test: /\.(png|svg|jpg|gif)$/,
                    use: [
                        {
                            loader: "url-loader",
                            options: {
                                limit: 1,
                                fallback: {
                                    loader: "file-loader",
                                    options: {
                                        // name: "assets/imgs/[name].[ext]"
                                        name: "assets/imgs/[name].[ext]"
                                    }
                                }
                            }
                        }
                    ]
                },
                {
                    test: /\.(woff|woff2|eot|ttf|otf)$/,
                    use: [
                        {
                            loader: "file-loader",
                            options: {
                                name: "assets/fonts/[name].[ext]"
                            }
                        }
                    ]
                },
                {
                    test: /\.(mp3)(\?.*)?$/,
                    use: [
                        {
                            loader: "url-loader",
                            options: {
                                limit: 10,
                                //
                                name: "assets/music/[name].[ext]"
                            }
                        }
                    ]
                },
                {
                    test: /\.(mp4)(\?.*)?$/,
                    use: [
                        {
                            loader: "url-loader",
                            options: {
                                limit: 10,
                                //
                                name: "assets/video/[name].[ext]"
                            }
                        }
                    ]
                }
            ]
        },
        plugins: [
            new CleanWebpackPlugin(),
            new HtmlWebpackPlugin({
                template: path.join(__dirname, "./src/index.html"),
                filename: path.join(__dirname, "./dist/index.html"),
                inject: "head",
                alwaysWriteToDisk: true,
                chunks: "all",
                sdk: "/mylib.js"
            }),
            /**
             * 自动加载
             * 介绍: https://webpack.docschina.org/guides/shimming/
             **/
            new webpack.ProvidePlugin({
                $: "jquery",
                jQuery: "jquery"
            }),
            /**
             * 拷贝文件到指定位置
             * 介绍: https://webpack.docschina.org/plugins/copy-webpack-plugin
             **/

            new CopyWebpackPlugin([
                {
                    from: path.resolve(__dirname, "./src/public/"),
                    to: path.resolve(__dirname, "./dist/public/"),
                    toType: "dir",
                    ignore: [".DS_Store"]
                }
            ])
        ].concat(get_pages_config()),

        optimization: {
            /**
             * 定义压缩方式
             * 介绍:https://webpack.docschina.org/configuration/optimization/#optimization-minimizer
             **/
            minimizer: [
                /**
                 * 定义 css 压缩插件
                 * 介绍: https://github.com/NMFR/optimize-css-assets-webpack-plugin
                 **/
                new OptimizeCSSAssetsPlugin({})
            ],
            /**
             * 定义代码分包
             * 介绍: https://webpack.docschina.org/plugins/split-chunks-plugin/
             **/
            splitChunks: {
                chunks: "all",
                cacheGroups: {
                    reset: {
                        test: /(rest|normalize).css$/,
                        name: "reset",
                        priority: 20,
                        chunks: "all",
                        enforce: true
                    },
                    styles: {
                        test: /[\\/]node_modules[\\/].+\.css$/,
                        name: "lib",
                        priority: 10,
                        chunks: "all",
                        enforce: true
                    },
                    unit: {
                        test: /(unit).js$/,
                        name: "reset",
                        priority: 20,
                        chunks: "all",
                        enforce: true
                    },
                    lib: {
                        test: /[\\/]node_modules[\\/].+\.js$/,
                        name: "lib",
                        priority: 100,
                        chunks: "all",
                        enforce: true
                    }
                }
            }
        }
    };
    return webpack_config;
}

/**
 *
 * @param {string}  globPath  文件的路径
 * @returns entries
 */
function get_pages(glob_path) {
    let files = glob.sync(glob_path);
    let result = [];

    files.forEach(item => {
        let entries = {};
        let entry = item;
        let dirname = path.dirname(entry); //当前目录;
        let extname = path.extname(entry); //后缀
        let basename = path.basename(entry, extname); //文件名
        let pathname = path.join(dirname, basename); //文件路径

        entries = {
            entry,
            dirname,
            extname,
            pathname,
            basename
        };

        if (extname === ".html") {
            result.push(entries);
        }
    });

    return result;
}

function get_pages_config(
    glob_path = "./src/pages/",
    target_path = "./dist/pages/"
) {
    let result = [];
    get_pages(glob_path).forEach(v => {
        result.push(
            new HtmlWebpackPlugin({
                template: path.join(
                    __dirname,
                    glob_path + v.basename + ".html"
                ),
                filename: path.join(
                    __dirname,
                    target_path + v.basename + ".html"
                ),
                inject: "head",
                // minify: {
                //     removeComments: true,
                //     collapseWhitespace: true,
                //     removeAttributeQuotes: true,
                //     collapseBooleanAttributes: true,
                //     removeScriptTypeAttributes: true
                // },
                alwaysWriteToDisk: true,
                chunks: ["lib", "main"]
            })
        );
    });
    return result;
}
