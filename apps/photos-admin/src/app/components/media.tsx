import React from 'react';
import { List, Datagrid, ImageField, Edit, Create, SimpleForm, DateField, TextField, EditButton, TextInput, DateInput, BooleanField, BooleanInput   } from 'react-admin';
export { default as MediaIcon} from '@material-ui/icons/Category';
import { S3FileInput } from '@fusionworks/ra-s3-input';


export const MediaList = (props) =>
  (
    <List {...props}>
      <Datagrid>
        <TextField source="id"/>
        <TextField source="name"/>
        <ImageField source="url" title="title" />
        <DateField source="createdAt"/>
        <BooleanField source="enabled"/>
        <EditButton basePath="/media"/>
      </Datagrid>
    </List>
  );

const MediaTitle = ({ record }) => {
    return <span>Media {record ? `"${record.name}"` : ''}</span>;
};

export const MediaEdit = (props) => (
    <Edit title={<MediaTitle {...props} />} {...props}>
        <SimpleForm>
            <TextInput disabled source="id" />
            <TextInput source="name" />
            <DateInput label="Created At" source="createdAt" />
            <BooleanInput  label="Public"  source="public" />
        </SimpleForm>
    </Edit>
);

export const MediaCreate = (props) => (
    <Create title="Create a Media" {...props}>
        <SimpleForm>
            <TextInput source="name" />
            <TextInput source="description" />
            <BooleanInput  label="Enabled"  source="enabled" />
            <S3FileInput
          source='photo'
          apiRoot='localhost:3000/' // your api server
          fileCoverImg="someImgURL" // cover img for non-img files
          multipleFiles // allaw to save multiple files for that source
          uploadOptions={{
            signingUrl: 'localhost:3000/s3/sign', // api point to your server for S3 signin,
            s3path: 'yourS3FolderOnBucket/subFolderId', // path to folder from S3 where wil be saved file
            multiple: true, // for selecting multiple files from file system
          }}/>
        </SimpleForm>
    </Create>
);
