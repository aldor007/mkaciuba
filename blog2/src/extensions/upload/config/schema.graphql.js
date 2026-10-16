module.exports = {
    type: {
      UploadFile: false
    },
    resolver: {
      Query: {
        files: false,
        filesConnection: false
      },
      Mutation: {
        createFile: false,
        updateFile: false,
        upload: false,
        multipleUpload: false,
        updateFileInfo: false,
        deleteFile: false
      }
    }
  };