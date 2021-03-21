'use strict';
const { exception } = require('console');
const fs = require('fs');
const flagsPath = 'flags';

const loadConfig = function (event) {
  const feature = event.pathParameters.feature;
  const featurePath = `${flagsPath}/${feature}.json`;
  if (fs.existsSync(featurePath)) {
    const config = JSON.parse(fs.readFileSync(featurePath));
    const user_id = (event.queryStringParameters)? event.queryStringParameters.user_id : null;
    if (user_id) {
      if (config.users[user_id]) {
        return config.users[user_id];
      }
    }
    if (config.countries[event.headers['CloudFront-Viewer-Country']]) {
      return config.countries[event.headers['CloudFront-Viewer-Country']];
    } else {
      return config.default;
    }
  } else {
    throw "FEATURE_NOT_FOUND";
  }
}
module.exports.index = async function (event) {
  try {
    const config = loadConfig(event)
    return {
      statusCode: 200,
      body: JSON.stringify({value: config})
    };
  } catch (error) {
    console.log(error)
    if (error == "FEATURE_NOT_FOUND") {
      return {
        statusCode: 404,
        body: JSON.stringify(
          {
            message: "Feature not found."
          },
          null,
          2
        ),
      };
    } else {
      console.log(error)
      return {
        statusCode: 503,
        body: JSON.stringify(
          {
            message: "unknown error"
          },
          null,
          2
        )
      };
    }
  }
}