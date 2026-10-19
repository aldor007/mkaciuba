'use strict';

const {
  getImage,
  getImageUrl,
  getImagesFromPreset,
  getOriginalUrl,
  presetList,
  allPresets,
} = require('../../lib/image');

// Deterministic slugify (lowercase, transliteration-free — same mock style
// as the product spec).
jest.mock('slugify', () => (text, options) => {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
});

const base64Url = (url) =>
  Buffer.from(url)
    .toString('base64')
    .replace('+', '-')
    .replace('/', '_')
    .replace(/=+$/, '');

const FILE = {
  path: 'files/sources/2024/abc123.jpg',
  ext: '.jpg',
  width: 4000,
  height: 3000,
  name: 'my-photo',
  caption: 'My Photo',
  alternativeText: null,
};

const findPreset = (name, list = presetList) => list.find((p) => p.name === name);

describe('lib/image', () => {
  describe('getImageUrl', () => {
    it('derives the mort transform URL from the storage path and preset', () => {
      const url = getImageUrl(FILE, 'big1000');
      expect(url).toBe(
        `https://mort.mkaciuba.com/images/transform/${base64Url(
          FILE.path
        )}/photo_my-photo_big1000.jpg`
      );
    });

    it('falls back to the file name when caption is missing', () => {
      const url = getImageUrl({ ...FILE, caption: null, name: 'fallback' }, 'small');
      expect(url).toContain('photo_fallback_small.jpg');
    });
  });

  describe('getOriginalUrl', () => {
    it('serves the original file from the mort images host', () => {
      expect(getOriginalUrl(FILE)).toBe(
        `https://mort.mkaciuba.com/images/${FILE.path}`
      );
    });
  });

  describe('getImage', () => {
    it('keeps fixed dimensions for presets with both width and height', () => {
      const image = getImage(FILE, findPreset('categorylist', allPresets));
      expect(image).toMatchObject({
        width: 600,
        height: 450,
        url: expect.stringContaining('photo_my-photo_categorylist.jpg'),
        type: 'jpeg',
        webp: false,
      });
    });

    it('scales the height proportionally for width-only presets', () => {
      const image = getImage(FILE, findPreset('big1000'));
      expect(image).toMatchObject({ width: 1000, height: 750 });
    });

    it('exposes the media query of the preset', () => {
      const image = getImage(FILE, findPreset('big1000'));
      expect(image.mediaQuery).toBe('(max-width: 1300px)');
    });
  });

  describe('getImagesFromPreset', () => {
    it('returns every preset whose name contains the given fragment', () => {
      const images = getImagesFromPreset(FILE, 'categorylist');
      const names = allPresets
        .filter((p) => p.name.includes('categorylist'))
        .map((p) => p.name);

      expect(images).toHaveLength(names.length);
      for (const image of images) {
        expect(image.url).toMatch(/photo_my-photo_categorylist/);
      }
    });
  });

  describe('presetList', () => {
    it('contains the core responsive presets with media queries', () => {
      const names = presetList.map((p) => p.name);
      expect(names).toContain('big1000');
      expect(names).toContain('mobile375webp');
      expect(findPreset('big1000').mediaQuery).toBe('(max-width: 1300px)');
    });
  });
});
