const { getStoragePath, base64Url } = require('./index');
const slugify = require('slugify');

class Preset {
  constructor(name, width, height, mediaQuery, type) {
    this.name = name;
    this.width = width;
    this.height = height;
    this.mediaQuery = mediaQuery;
    this.type = type;
    this.webp = type.includes('webp')
  }

  calculateSize(imageWidth, imageHeight) {
    if (this.width && this.height) {
      return {
        width: this.width,
        height: this.height,
      }
    } else if (this.width) {
      const ratio = this.width / imageWidth;
      const height = Math.floor(imageHeight * ratio);
      return {
        width: this.width,
        height,
      }
    } else {
      const ratio = this.height / imageHeight;
      const width = Math.floor(imageWidth * ratio);
      return {
        width,
        height: this.height
      }
    }

  }
}

const presetList = [
  new Preset('icon', 35, null, '(max-width: 75px)', 'jpeg'),
  new Preset('bigwebp', 700, null, '(max-width: 1000px)', 'webp'),
  new Preset('big1000webp', 1000, null, '(max-width: 1300px)', 'webp'),
  new Preset('big1300webp', 1300, null, '(max-width: 1600px)', 'webp'),
  new Preset('big', 700, null, '(max-width: 1000px)', 'jpeg'),
  new Preset('small', 80, null, '(max-width: 100px)', 'jpeg'),
  new Preset('smallwebp', 80, null, '(max-width: 100px)', 'webp'),
  new Preset('big300', 300, null, '(max-width: 300px)', 'jpeg'),
  new Preset('big300webp', 300, null, '(max-width: 300px)', 'webp'),
  new Preset('big1000', 1000, null, '(max-width: 1300px)', 'jpeg'),
  new Preset('big1300', 1300, null, '(max-width: 1600px)', 'jpeg'),
]
exports.presetList = presetList;

const allPresets = presetList.concat([
  new Preset('categorylistbigwebp', 1500, 1000, '(max-width: 1300px)', 'webp'),
  new Preset('categorylistbig', 1500, 1000, '(max-width: 1300px)', 'jpeg'),
  new Preset('categorylistwebp', 600, 450, '(max-width: 1000px)', 'webp'),
  new Preset('categorylist', 600, 450, '(max-width: 1000px)', 'jpeg'),
  new Preset('categorylistwebps', 300, 225, '(max-width: 600px)', 'webp'),
  new Preset('categorylists', 300, 225, '(max-width: 600px)', 'jpeg'),

  new Preset('postlistwebp', 1500, 1000, '(max-width: 1300px)', 'webp'),
  new Preset('postlist', 1500, 1000, '(max-width: 1300px)', 'jpeg'),
  new Preset('postlistwebps', 750, 750, '(max-width: 375px)', 'webp'),
  new Preset('postlists', 750, 750, '(max-width: 375px)', 'jpeg'),

  new Preset('postimg_ac_webp', 1500, 1000, '(max-width: 1300px)', 'webp'),
  new Preset('postimg_ac', 1500, 1000, '(max-width: 1300px)', 'jpeg'),
  new Preset('postimg_ac_webps', 750, 740, '(max-width: 600px)', 'webp'),
  new Preset('postimg_ac_s', 750, 750, '(max-width: 600px)', 'jpeg'),

  new Preset('featcatbig', 410, null, '(min-width: 600px)', 'jpeg'),
  new Preset('featcatbigwebps', 410, null, '(min-width: 600px)', 'webp'),
  new Preset('featcat', 410, null, '(max-width: 400px)', 'jpeg'),
  new Preset('featcatbigwebps', 410, null, '(max-width: 400px)', 'webp'),

  new Preset('coverimgswebp', 600, 300, '(max-width: 500px)', 'webp'),
  new Preset('coverimgs', 600, 300, '(max-width: 500px)', 'jpeg'),
  new Preset('coverimgmwebp', 1300, 300, '(max-width: 500px)', 'webp'),
  new Preset('coverimgm', 1300, 300, '(max-width: 1300px)', 'jpeg'),
  new Preset('coverimgwebp', 2900, 500,'(min-width: 1300px)', 'webp'),
  new Preset('coverimg', 2900, 500, '(min-width: 1300px)', 'jpeg'),

  new Preset('nextpostwebp', 80, 150,'(min-width: 100px)', 'webp'),
  new Preset('nextpost', 80, 150, '(min-width: 100px)', 'jpeg'),
]);
exports.allPresets = allPresets;


class Image {
  constructor(url, mediaQuery, width, height, type) {
    this.url = url;
    this.mediaQuery = mediaQuery;
    this.width = width;
    this.height = height;
    this.type = type;
    this.webp = type.includes('webp')

  }
}

const getImage = (obj, preset) => {
  const imageDim = preset.calculateSize(obj.width, obj.height);

  return new Image(getImageUrl(obj, preset.name), preset.mediaQuery, imageDim.width, imageDim.height, preset.type);
}

const getOriginalUrl = (obj) => {
  return `https://mort.mkaciuba.com/images/${obj.path}`
}

exports.getOriginalUrl = getOriginalUrl;
exports.getImage = getImage;

const getImageUrl = (obj, preset) => {
  const parent = base64Url(obj.path);
  let caption = obj.caption || obj.alternativeText || obj.name;
  caption = caption.replace(/_/g, '-').replace(/\./g, '-').replace(/ /g, '-').replace(':', '').replace(')', '').replace('(', '')
  caption = slugify(caption);
  return `https://mort.mkaciuba.com/images/transform/${parent}/photo_${caption}_${preset}${obj.ext}`
}
exports.getImageUrl = getImageUrl;

const getImagesFromPreset = (obj, preset) => {
  const result = [];
  for (const p of allPresets) {
    if(p.name.includes(preset)) {
      result.push(getImage(obj, p))
    }
  }
  return result;
}

exports.getImagesFromPreset = getImagesFromPreset;