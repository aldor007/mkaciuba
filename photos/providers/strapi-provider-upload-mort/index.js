'use strict';

const AWS = require('aws-sdk');

module.exports = {
  init(config) {
    const S3 = new AWS.S3({
      apiVersion: '2006-03-01',
      ...config,
    });
    const getStoragePath = (file) => (
      `files/sources/${file.hash}${file.ext}`
    )


    return {
      upload(file, customParams = {}) {
        return new Promise((resolve, reject) => {
          // upload file on S3 bucket
          const storagePath =  getStoragePath(file);
          S3.upload(
            {
              Key: storagePath,
              Body: Buffer.from(file.buffer, 'binary'),
              ACL: 'private',
              ContentType: file.mime,
              ...customParams,
            },
            (err, data) => {
              if (err) {
                return reject(err);
              }

              // set the bucket file url
              const base64Parent = Buffer.from(storagePath).toString('base64').replace('+', '-').replace('/', '_').replace(/=+$/, '');
              file.url = `https://mort.mkaciuba.com/images/transform/${base64Parent}/photo_admin_big.jpg`;
              file.previewUrl = `https://mort.mkaciuba.com/images/transform/${base64Parent}/photo_opis_small.jpg`
              resolve();
            }
          );
        });
      },
      delete(file, customParams = {}) {
        return new Promise((resolve, reject) => {
          // delete file on S3 bucket
          S3.deleteObject(
            {
              Key: getStoragePath(file),
              ...customParams,
            },
            (err, data) => {
              if (err) {
                return reject(err);
              }

              resolve();
            }
          );
        });
      },
    };
  },
};
