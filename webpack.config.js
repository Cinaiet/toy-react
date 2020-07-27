const path = require('path')

module.exports =  {
  entry: './main.js',
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [
              [
                "@babel/plugin-transform-react-jsx",
                {
                  pragma: "ToyReact.createElement"
                }
              ]
            ]
          }
        },

      },
    ]
  },
  mode: 'development',
  optimization: {
    minimize: false
  },
  devServer: {
    contentBase: './dist',
    hot: true,
  }
}