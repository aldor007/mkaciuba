exports.getStoragePath = (file) => (
  `files/sources/${file.hash}${file.ext}`
)

exports.base64Url = (url) => (
  Buffer.from(url).toString('base64').replace('+', '-').replace('/', '_').replace(/=+$/, '')
)

exports.makeid = (length) => {
    let result           = '';
    const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() *
 charactersLength));
   }
   return result;
}
