'use strict';

const AWS = require('aws-sdk');

module.exports = {
  init(config) {
    const S3 = new AWS.S3({
      apiVersion: '2006-03-01',
      ...config,
    });

    const getStoragePath = (file) =>
      `files/sources/${new Date().getFullYear()}/${file.hash}${file.ext}`;

    const setFileUrls = (file, storagePath) => {
      // Set the bucket file url (mort transform pattern)
      const base64Parent = Buffer.from(storagePath)
        .toString('base64')
        .replace('+', '-')
        .replace('/', '_')
        .replace(/=+$/, '');
      file.url = `https://mort.mkaciuba.com/images/transform/${base64Parent}/photo_admin_big.jpg`;
      file.previewUrl = `https://mort.mkaciuba.com/images/transform/${base64Parent}/photo_opis_small.jpg`;
      file.path = storagePath;
    };

    const uploadBuffer = (file, customParams = {}) =>
      new Promise((resolve, reject) => {
        // upload file on S3 bucket
        const storagePath = getStoragePath(file);
        S3.upload(
          {
            Key: storagePath,
            Body: Buffer.from(file.buffer, 'binary'),
            ACL: 'private',
            StorageClass: 'STANDARD_IA',
            ContentType: file.mime,
            ...customParams,
          },
          (err, data) => {
            if (err) {
              return reject(err);
            }

            setFileUrls(file, storagePath);

            resolve();
          },
        );
      });

    return {
      upload(file, customParams = {}) {
        return uploadBuffer(file, customParams);
      },
      uploadStream(file, customParams = {}) {
        return new Promise((resolve, reject) => {
          // Collect the stream into a buffer, then reuse the upload logic
          const chunks = [];
          file.stream.on('data', (chunk) => chunks.push(chunk));
          file.stream.on('error', reject);
          file.stream.on('end', () => {
            file.buffer = Buffer.concat(chunks);
            uploadBuffer(file, customParams).then(resolve, reject);
          });
        });
      },
      delete(file, customParams = {}) {
        return new Promise((resolve, reject) => {
          // delete file on S3 bucket
          S3.deleteObject(
            {
              Key: file.path,
              ...customParams,
            },
            (err, data) => {
              if (err) {
                return reject(err);
              }

              resolve();
            },
          );
        });
      },
    };
  },
};
