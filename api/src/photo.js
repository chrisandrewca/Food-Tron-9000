const fs = require('fs');
const mkdirp = require('mkdirp');
const sharp = require('sharp');

module.exports.cleanTempFiles = async (files) => {
  for (const file of files) {
    await new Promise((res, rej) => {
      fs.unlink(file.path, res);
    });
  }
}

module.exports.savePhotos = async (handle, files) => {
  const photos = [];
  for (const file of files) {
    const Sharp = await sharp(file.path);

    const segments = file.path.split('/');
    segments.splice(1, 0, handle);
    await mkdirp(`${segments[0]}/${handle}`);

    const path = segments.join('/') + '.jpeg';

    await Sharp
      .rotate()
      .resize(1080, null, { fit: 'inside' })
      .jpeg()
      .toFile(path);

    await new Promise((res, rej) => {
      fs.unlink(file.path, res);
    });

    photos.push({
      originalName: file.originalname,
      src: `/api/${path}`
    });
  }

  return photos;
}

module.exports.deletePhoto = async (path) => {
  await new Promise((res, rej) => {
    fs.unlink(path, res);
  });
}