import path from 'path';

export default {

  devtool: 'inline-source-map',

  entry: [
    path.resolve(__dirname, 'public/javascripts/angularApp')
  ],
  target: 'web',
  output: {
    path: path.resolve(__dirname, 'dist/'),
    publicPath: '/',
    filename: 'bundle.js'
  },
  plugins: [

  ],
  module: {
    loaders: [
      {test: /\.js$/, exclude: /node_modules/, loaders: ['babel-loader']},
      {test: /\.css$/, loaders: ['style','css']}
    ]
  }
}
