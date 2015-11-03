/* eslint-disable no-console */

import express from 'express';
import path from 'path';
import webpack from 'webpack';
import webpackMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

import config from '../config/webpack.development';

const app = express();
const compiler = webpack(config);
const port = 3000;

console.log('Starting development server...');

app.use(webpackMiddleware(compiler, {
  publicPath: config.output.publicPath,
  quiet: false,
  noInfo: false,
  stats: {
    assets: false,
    chunkModules: false,
    chunks: true,
    colors: true,
    hash: false,
    progress: false,
    timings: false,
    version: false,
  },
}));

app.use(webpackHotMiddleware(compiler));

app.get('*', function response(req, res) {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(port, 'localhost', function onStart(err) {
  if (err) {
    console.log(err);
  }
  console.log(`Listening at http://localhost:${port}`);
});
