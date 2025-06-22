const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const { Logger } = require('../utils/Logger');
const errorHandler = require('./errorHandler');

const initializeMiddlewares = (app) => {
  // Basic security
  app.use(helmet());
  
  // CORS
  app.use(cors({
    origin: true,
    //origin: 'http://localhost:9000', // Use environment variable or default to '*'
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  
  // Parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  
  // Response compression
  app.use(compression());
  
  // Request logging
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan((tokens, req, res) => {
      return [
        `[${tokens.method(req, res)}]`,
        tokens.url(req, res),
        tokens.status(req, res),
        tokens['response-time'](req, res), 'ms'
      ].join(' ');
    }, {
      stream: {
        write: (message) => Logger.info(message.trim())
      }
    }));
  }
};

module.exports = {
  errorHandler,
  initializeMiddlewares
};