const mysql = require(`mysql-await`);
const axios = require('axios');
const axiosRetry = require('axios-retry')
const http = require('http');
const https = require('https');
const Agent = require('agentkeepalive');
const keepAliveAgent = new Agent.HttpsAgent({
  maxSockets: 100,
  maxFreeSockets: 10,
  timeout: 60000, // active socket keepalive for 60 seconds
  freeSocketTimeout: 30000, // free socket keepalive for 30 seconds
});

const instance = axios.create({
  baseURL: 'https://media-api.mkaciuba.com',
  timeout: 1000,
  headers: {'X-api-key': process.env.API_KEY},
  maxRedirects: 0,
    httpAgent: new http.Agent({ keepAlive: true }),
  httpsAgent: keepAliveAgent,
  validateStatus: sc => sc === 302

});
axiosRetry(instance, {
  retries: 50,
  retryDelay: (retryCount => retryCount * 1000),
  shouldResetTimeout: true,
  retryCondition: error => (axiosRetry.isNetworkOrIdempotentRequestError(error) || error.code === 'ECONNABORTED' || error.response && error.response.status > 303 )

});
let connection;

// DATABASE_HOST=mysql
// DATABASE_PORT=3306
// DATABASE_NAME=strapi
// DATABASE_USERNAME=strapi
// DATABASE_PASSWORD=strapi
// DATABASE_SSL=falsek
// Strapi
// Category
// | id | name | slug   | public | publicationDate     | gallery | created_by | updated_by | created_at       | updated_at          |
/*
mysql> select * from upload_file_morph;
+----+----------------+------------+--------------+--------+-------+
| id | upload_file_id | related_id | related_type | field  | order |
+----+----------------+------------+--------------+--------+-------+
|  9 |              4 |          1 | categories   | image  |     1 |
| 10 |              4 |          1 | categories   | medias |     1 |
+----+----------------+------------+--------------+--------+-------+

mysql> select * from upload_file;
+----+-------------------+-----------------+---------+-------+--------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+---------------------------+------+------------+---------+---------------------------------------------------------------------------------------------------------------------------+----------------------------------------------------------------------------------------------------------------------------+----------+-------------------+------------+------------+---------------------+---------------------+---------------------------------------------+
| id | name              | alternativeText | caption | width | height | formats                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | hash                      | ext  | mime       | size    | url                                                                                                                       | previewUrl                                                                                                                 | provider | provider_metadata | created_by | updated_by | created_at          | updated_at          | path                                        |
+----+-------------------+-----------------+---------+-------+--------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+---------------------------+------+------------+---------+---------------------------------------------------------------------------------------------------------------------------+----------------------------------------------------------------------------------------------------------------------------+----------+-------------------+------------+------------+---------------------+---------------------+---------------------------------------------+
|  4 | DSC02091-Edit.jpg |                 |         |  2987 |   4480 | {"thumbnail":{"name":"thumbnail_DSC02091-Edit.jpg","hash":"thumbnail_DSC_02091_Edit_28d1c94eed","ext":".jpg","mime":"image/jpeg","width":104,"height":156,"size":2.67,"path":"files/sources/thumbnail_DSC_02091_Edit_28d1c94eed.jpg","url":"https://mort.mkaciuba.com/images/transform/ZmlsZXMvc291cmNlcy90aHVtYm5haWxfRFNDXzAyMDkxX0VkaXRfMjhkMWM5NGVlZC5qcGc/photo_admin_big.jpg","previewUrl":"https://mort.mkaciuba.com/images/transform/ZmlsZXMvc291cmNlcy90aHVtYm5haWxfRFNDXzAyMDkxX0VkaXRfMjhkMWM5NGVlZC5qcGc/photo_opis_small.jpg"}} | DSC_02091_Edit_28d1c94eed | .jpg | image/jpeg | 2275.01 | https://mort.mkaciuba.com/images/transform/ZmlsZXMvc291cmNlcy9EU0NfMDIwOTFfRWRpdF8yOGQxYzk0ZWVkLmpwZw/photo_admin_big.jpg | https://mort.mkaciuba.com/images/transform/ZmlsZXMvc291cmNlcy9EU0NfMDIwOTFfRWRpdF8yOGQxYzk0ZWVkLmpwZw/photo_opis_small.jpg | mort     | NULL              |          1 |          1 | 2021-01-08 20:00:24 | 2021-01-08 20:00:24 | files/sources/DSC_02091_Edit_28d1c94eed.jpg |
+----+-------------------+-----------------+---------+-------+--------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+---------------------------+------+------------+---------+---------------------------------------------------------------------------------------------------------------------------+----------------------------------------------------------------------------------------------------------------------------+----------+-------------------+------------+------------+---------------------+---------------------+---------------------------------------------+

mkaciuba

mysql> show columns from media__media;
+----------------------+---------------+------+-----+---------+-------+
| Field                | Type          | Null | Key | Default | Extra |
+----------------------+---------------+------+-----+---------+-------+
| id                   | char(36)      | NO   | PRI | NULL    |       |
| category_id          | varchar(255)  | YES  | MUL | NULL    |       |
| name                 | varchar(255)  | NO   |     | NULL    |       |
| description          | text          | YES  |     | NULL    |       |
| enabled              | tinyint(1)    | NO   |     | NULL    |       |
| provider_name        | varchar(255)  | NO   |     | NULL    |       |
| provider_status      | int           | NO   |     | NULL    |       |
| provider_reference   | varchar(255)  | NO   |     | NULL    |       |
| provider_metadata    | longtext      | YES  |     | NULL    |       |
| width                | int           | YES  |     | NULL    |       |
| height               | int           | YES  |     | NULL    |       |
| length               | decimal(10,0) | YES  |     | NULL    |       |
| content_type         | varchar(255)  | YES  |     | NULL    |       |
| content_size         | int           | YES  |     | NULL    |       |
| copyright            | varchar(255)  | YES  |     | NULL    |       |
| author_name          | varchar(255)  | YES  |     | NULL    |       |
| context              | varchar(64)   | YES  |     | NULL    |       |
| cdn_is_flushable     | tinyint(1)    | YES  |     | NULL    |       |
| cdn_flush_identifier | varchar(64)   | YES  |     | NULL    |       |
| cdn_flush_at         | datetime      | YES  |     | NULL    |       |
| cdn_status           | int           | YES  |     | NULL    |       |
| updated_at           | datetime      | NO   |     | NULL    |       |
| created_at           | datetime      | NO   |     | NULL    |       |
| content_size_big     | bigint        | YES  |     | NULL    |       |
+----------------------+---------------+------+-----+---------+-------+

mysql> show columns from media__gallery;
+----------------+--------------+------+-----+---------+-------+
| Field          | Type         | Null | Key | Default | Extra |
+----------------+--------------+------+-----+---------+-------+
| id             | char(36)     | NO   | PRI | NULL    |       |
| name           | varchar(255) | NO   |     | NULL    |       |
| context        | varchar(64)  | NO   |     | NULL    |       |
| default_format | varchar(255) | NO   |     | NULL    |       |
| enabled        | tinyint(1)   | NO   |     | NULL    |       |
| updated_at     | datetime     | NO   |     | NULL    |       |
| created_at     | datetime     | NO   |     | NULL    |       |
| keywords       | varchar(255) | YES  |     | NULL    |       |
| description    | varchar(255) | YES  |     | NULL    |       |
| image_id       | char(36)     | YES  | UNI | NULL    |       |
| file_id        | char(36)     | YES  | UNI | NULL    |       |
| slug           | varchar(255) | YES  |     | NULL    |       |
| viewType       | varchar(255) | YES  |     | NULL    |       |
| public         | tinyint(1)   | YES  |     | NULL    |       |
| keywords_pl    | varchar(255) | YES  |     | NULL    |       |
| description_pl | varchar(255) | YES  |     | NULL    |       |
| image_presets  | varchar(255) | YES  |     | NULL    |       |
+----------------+--------------+------+-----+---------+-------+

mysql> show columns from  media__gallery_media;
+------------+------------+------+-----+---------+-------+
| Field      | Type       | Null | Key | Default | Extra |
+------------+------------+------+-----+---------+-------+
| id         | char(36)   | NO   | PRI | NULL    |       |
| gallery_id | char(36)   | YES  | MUL | NULL    |       |
| media_id   | char(36)   | YES  | MUL | NULL    |       |
| position   | int        | NO   |     | NULL    |       |
| enabled    | tinyint(1) | NO   |     | NULL    |       |
| updated_at | datetime   | NO   |     | NULL    |       |
| created_at | datetime   | NO   |     | NULL    |       |
+------------+------------+------+-----+---------+-------+
7 rows in set (0.00 sec)
*/

async function insertUpload(connection, image, g, type, position) {

  await connection.awaitBeginTransaction();
  let ext ='.' + image.provider_reference.split('.')[1];
  let mediaUrl, url, previewUrl;
  try {
    const mediaUrlRes = await instance.head(`media/${image.id}`);
    console.info('Response', image.id, mediaUrlRes.statusCode, mediaUrlRes.headers.location)
    mediaUrl = mediaUrlRes.headers['location'].replace('https://mort.mkaciuba.com', '');
    const base64Parent = Buffer.from(mediaUrl).toString('base64').replace('+', '-').replace('/', '_').replace(/=+$/, '');
    url = `https://mort.mkaciuba.com/images/transform/${base64Parent}/photo_admin_big.jpg`;
    previewUrl = `https://mort.mkaciuba.com/images/transform/${base64Parent}/photo_opis_small.jpg`
    console.info(`About to insert media ${mediaUrl} ${image.idCounter}, ${image.name} ${url}`);
    await connection.awaitQuery(`INSERT INTO upload_file (name, id, alternativeText, caption, width, height, hash, ext, mime, size, url, previewUrl, provider, created_by, updated_by, path, created_at, updated_at)   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [image.name, image.idCounter, image.description, image.description, image.width, image.height, image.id + '', ext,  image.content_type, image.content_size / 1000, url, previewUrl, 'mort', 1, 1, mediaUrl, image.created_at, image.updated_at])
    await connection.awaitQuery('INSERT INTO upload_file_morph (upload_file_id, related_id, related_type, field, `order`) VALUES (?, ?, ?, ?, ?)', [
      image.idCounter, g.idCounter, 'categories', type, position
    ])
  } catch (e) {
    if (e.code == 'ER_DUP_ENTRY') {
      console.info('-----------probably mainImage',image.idCounter)
      await connection.awaitQuery('INSERT INTO upload_file_morph (upload_file_id, related_id, related_type, field, `order`) VALUES (?, ?, ?, ?, ?)', [
        image.idCounter, g.idCounter, 'categories', type, position
      ])

    } else {
      await connection.awaitRollback()
      console.log('------------------', image.name, image.idCounter, image.description, image.description, image.width, image.height, image.id, ext,  image.content_type, image.content_size / 1000, url, previewUrl, 'mort', 1, 1, mediaUrl, image.created_at, image.updated_at)
      console.log('Rollback',e.code, e.message, e.stack)
      process.exit(1)
    }
  }
  await connection.awaitCommit()
}

function makeid(length) {
   var result           = '';
   var characters       = 'abcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

const main = async () => {
  const mkaciuba = mysql.createConnection({
    host     : process.env.DATABASE_HOST,
    user     : 'root', // process.env.DATABASE_USERNAME,
    password : process.env.DATABASE_PASSWORD,
    database: 'mkaciuba',
    charset : 'utf8'
  });

  // let result = await connection.awaitQuery(`SELECT (id, name, description, width, height, length, content_type, content_size, updated_at, created_at) FROM media__media WHERE lastName = ?`, [`Doe`]);
  let media = await mkaciuba.awaitQuery(`SELECT id, name, description, width, height, length, content_type, provider_reference, content_size, updated_at, created_at FROM media__media`)
  let galleryCollection = await mkaciuba.awaitQuery(`select * from gallery_collection`);
  let galleryCollectionMap = await mkaciuba.awaitQuery(`select * from galleries_gallery_collection`);
  let galleries = await mkaciuba.awaitQuery(`SELECT id, name, public, description, keywords, slug, image_id, file_id, updated_at, created_at FROM media__gallery order by updated_at ASC`)
  let mediaGallery = await mkaciuba.awaitQuery('Select gallery_id, media_id, position from media__gallery_media')

  let counter = 1;
  const mediaById = media.reduce((acc, cur, i) => {
    cur.idCounter = counter++;
    acc[cur.id] = cur;
    return acc;
  }, {});

  const mediaGalleryByGalleryId = mediaGallery.reduce((acc, cur, i) => {
    if (acc[cur.gallery_id]) {
      acc[cur.gallery_id].push(cur);
    } else {
      acc[cur.gallery_id] = [cur]
    }
    return acc;
  }, {});


  connection = mysql.createConnection({
    host     : process.env.DATABASE_HOST,
    user     : 'root', // process.env.DATABASE_USERNAME,
    password : process.env.DATABASE_PASSWORD,
    database: 'strapi',
    charset : 'utf8'
  });
  counter = 1;
 galleries.map(async (g) => {
   g.idCounter = counter++;
   return g
 })
 counter = 1;
 galleryCollection.map(g => {
   g.idCounter = counter++;
 })
 const galleryCollectionById= galleryCollection.reduce((acc, cur, i) => {
   acc[cur.id] = cur
    return acc;
  }, {});

 const galleryCollectionToGallery = galleryCollectionMap.reduce((acc, cur, i) => {
   acc[cur.gallery_id] = cur
    return acc;
  }, {});



 process.on('unhandledRejection', async error => {
  // Will print "unhandledRejection err is not defined"
  console.log('unhandledRejection rollback', error.message, error);
  await connection.awaitRollback();
  process.exit(0)
});

 await connection.awaitBeginTransaction();
 try {
  await galleryCollection.map( async g => {
      await connection.awaitQuery(`INSERT INTO galleries (id, name, slug, public, keywords, description, created_by, updated_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [g.idCounter, g.name, g.slug +'-'+makeid(3), g.public, g.keywords, g.description, 1, 1, 1]);
  })
  await galleries.map(async (g) => {
      let galleryId = null;
      if (galleryCollectionToGallery[g.id]) {
          galleryId = galleryCollectionById[galleryCollectionToGallery[g.id].gallery_collection_id].idCounter
          console.info('gallery coll for', g.name,  galleryCollectionById[galleryCollectionToGallery[g.id].gallery_collection_id].name, galleryId);
      }
      if (galleryId) {
        await connection.awaitQuery(`INSERT INTO categories  (id, name, slug, public, keywords, description, publicationDate, created_by, updated_by, gallery ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [g.idCounter, g.name, g.slug +'-'+makeid(3), g.public, g.keywords, g.description, new Date(),  1, 1, galleryId]);
      } else {
        await connection.awaitQuery(`INSERT INTO categories  (id, name, slug, public, keywords, description, publicationDate, created_by, updated_by ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [g.idCounter, g.name, g.slug +'-'+makeid(3), g.public, g.keywords, g.description, new Date(),  1, 1]);
      }
      const file = mediaById[g.file_id];
      const mainImage = mediaById[g.image_id];
      (async gallery => {
        await mediaGalleryByGalleryId[gallery.id].map(async (gHm) => {
          const image = mediaById[gHm.media_id]
          if (!image.name) {
            console.log(image, gHm.media_id)
            throw 'empty image'
          }

          await insertUpload(connection, image, gallery, 'medias', gHm.position);
        })
      })(g)
      if (file) {
        await insertUpload(connection, file, g, 'file', 1)
      }
      if (mainImage) {
        await insertUpload(connection, mainImage, g, 'image', 1)
      }
  })
 } catch (e) {
  await connection.awaitRollback();
  process.exit(0)
 }



 await connection.awaitCommit();

  // connection.awaitEnd();

}

main()
