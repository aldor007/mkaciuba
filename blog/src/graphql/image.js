'use strict';

const { getImage, presetList, allPresets } = require('../../lib/image');

/**
 * Image type + UploadFile field extensions (v3 port).
 */
module.exports = ({ nexus }) => {
  const Image = nexus.objectType({
    name: 'Image',
    definition(t) {
      t.nonNull.string('url');
      t.string('mediaQuery');
      t.nonNull.int('width');
      t.nonNull.int('height');
      t.string('type');
      t.nonNull.boolean('webp');
    },
  });

  const UploadFileExtensions = nexus.extendType({
    type: 'UploadFile',
    definition(t) {
      t.nonNull.id('id');
      t.list.field('thumbnails', {
        type: 'Image',
        resolve(obj) {
          const result = [];
          for (const p of presetList) {
            result.push(getImage(obj, p));
          }
          return result;
        },
      });

      t.field('thumbnail', {
        type: 'Image',
        args: {
          width: 'Int',
          webp: 'Boolean',
        },
        resolve(obj, args) {
          const webp = args.webp == null ? false : args.webp;
          const filterPresets = presetList.filter((p) => p.webp === webp);
          if (!filterPresets.length) {
            return null;
          }
          let minIndex = 0;
          let minValue = Math.abs(args.width - filterPresets[0].width);
          filterPresets.forEach((p, index) => {
            const tmpValue = Math.abs(args.width - p.width);
            if (tmpValue < minValue) {
              minIndex = index;
              minValue = tmpValue;
            }
          });
          return getImage(obj, filterPresets[minIndex]);
        },
      });

      t.list.field('matchingThumbnails', {
        type: 'Image',
        args: {
          preset: 'String',
        },
        resolve(obj, args) {
          const result = [];
          for (const p of allPresets) {
            if (p.name.includes(args.preset)) {
              result.push(getImage(obj, p));
            }
          }
          return result;
        },
      });
    },
  });

  return { types: [Image, UploadFileExtensions] };
};
