exports.getStoragePath = (file) => (
  `files/sources/${file.hash}${file.ext}`
)

exports.base64Url = (url) => (
  Buffer.from(url).toString('base64').replace('+', '-').replace('/', '_').replace(/=+$/, '')
)
