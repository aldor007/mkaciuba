'use strict';

const { PassThrough } = require('stream');

// Mock names must start with "mock" — jest hoists jest.mock factories above
// variable declarations, and only mock*-prefixed bindings are allowed to
// be referenced inside the factory.
const mockS3 = {
  upload: jest.fn((params, callback) => callback(null, { Location: 's3://mock' })),
  deleteObject: jest.fn((params, callback) => callback(null, {})),
};

jest.mock('aws-sdk', () => ({
  S3: jest.fn(() => mockS3),
}));

const provider = require('../../providers/strapi-provider-upload-mort');

const base64Url = (url) =>
  Buffer.from(url)
    .toString('base64')
    .replace('+', '-')
    .replace('/', '_')
    .replace(/=+$/, '');

const storagePathFor = (file) =>
  `files/sources/${new Date().getFullYear()}/${file.hash}${file.ext}`;

const expectedTransformUrl = (file, preset) =>
  `https://mort.mkaciuba.com/images/transform/${base64Url(storagePathFor(file))}/photo_${preset}`;

describe('strapi-provider-upload-mort', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('upload', () => {
    it('uploads the buffer to S3 and sets the mort transform URLs and path', async () => {
      const instance = provider.init({
        accessKeyId: 'key',
        secretAccessKey: 'secret',
        region: 'eu-west-1',
        params: { Bucket: 'test-bucket' },
      });
      const file = {
        hash: 'abc123',
        ext: '.jpg',
        mime: 'image/jpeg',
        buffer: Buffer.from('fake-image-data'),
      };

      await instance.upload(file);

      const storagePath = storagePathFor(file);
      expect(mockS3.upload).toHaveBeenCalledTimes(1);
      const params = mockS3.upload.mock.calls[0][0];
      expect(params.Key).toBe(storagePath);
      expect(params.ACL).toBe('private');
      expect(params.StorageClass).toBe('STANDARD_IA');
      expect(params.ContentType).toBe('image/jpeg');
      expect(params.Body).toBeInstanceOf(Buffer);

      expect(file.path).toBe(storagePath);
      expect(file.url).toBe(expectedTransformUrl(file, 'admin_big.jpg'));
      expect(file.previewUrl).toBe(expectedTransformUrl(file, 'opis_small.jpg'));
    });

    it('rejects when S3 upload fails', async () => {
      mockS3.upload.mockImplementationOnce((params, callback) =>
        callback(new Error('S3 down'))
      );
      const instance = provider.init({});
      const file = { hash: 'x', ext: '.png', mime: 'image/png', buffer: Buffer.from('data') };

      await expect(instance.upload(file)).rejects.toThrow('S3 down');
    });
  });

  describe('uploadStream', () => {
    it('collects the stream into a buffer and reuses the upload logic', async () => {
      const instance = provider.init({});
      const stream = new PassThrough();
      const file = {
        hash: 'stream1',
        ext: '.jpg',
        mime: 'image/jpeg',
        stream,
      };

      const promise = instance.uploadStream(file);
      stream.write('chunk-one-');
      stream.write('chunk-two');
      stream.end();
      await promise;

      const storagePath = storagePathFor(file);
      const params = mockS3.upload.mock.calls[0][0];
      expect(params.Key).toBe(storagePath);
      expect(params.Body.toString()).toBe('chunk-one-chunk-two');
      expect(file.path).toBe(storagePath);
      expect(file.url).toBe(expectedTransformUrl(file, 'admin_big.jpg'));
      expect(file.previewUrl).toBe(expectedTransformUrl(file, 'opis_small.jpg'));
    });

    it('rejects when the stream errors', async () => {
      const instance = provider.init({});
      const stream = new PassThrough();
      const file = { hash: 'err', ext: '.jpg', mime: 'image/jpeg', stream };

      const promise = instance.uploadStream(file);
      stream.emit('error', new Error('stream broken'));
      await expect(promise).rejects.toThrow('stream broken');
    });
  });

  describe('delete', () => {
    it('deletes the object at the stored path', async () => {
      const instance = provider.init({});
      const file = { path: 'files/sources/2024/abc123.jpg' };

      await instance.delete(file);

      expect(mockS3.deleteObject).toHaveBeenCalledTimes(1);
      expect(mockS3.deleteObject.mock.calls[0][0].Key).toBe(
        'files/sources/2024/abc123.jpg'
      );
    });

    it('rejects when S3 delete fails', async () => {
      mockS3.deleteObject.mockImplementationOnce((params, callback) =>
        callback(new Error('denied'))
      );
      const instance = provider.init({});
      const file = { path: 'files/sources/2024/abc123.jpg' };

      await expect(instance.delete(file)).rejects.toThrow('denied');
    });
  });
});
