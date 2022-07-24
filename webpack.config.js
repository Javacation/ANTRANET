const path = require('path') 
const { VueLoaderPlugin } = require('vue-loader');

module.exports = {
    mode: 'development',
    devtool: 'eval', 
    resolve:{ 
        extensions: ['.js', '.vue']
    },
    entry: { 
        V001: path.join(__dirname, 'front', 'vue_file', 'vue_conn', 'vueIndex.js'), 
    }, 
    module: {
        rules:[
            { 
                test: /\.vue$/, 
                use: 'vue-loader' 
            },
            { 
                test: /\.css$/, 
                use: ['vue-style-loader', 'css-loader']
            }
        ]
    }, 
    plugins: [
        new VueLoaderPlugin()
    ], 
    output: {
        filename: '[name].js', 
        path: path.join(__dirname, 'back', 'public', 'script')
    }
};