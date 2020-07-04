import React from 'react';
import { List, Datagrid, Edit, Create, SimpleForm, DateField, TextField, EditButton, TextInput, DateInput, BooleanField  } from 'react-admin';
export { default as CategoryIcon} from '@material-ui/icons/Category';


export const CategoryList = (props) =>
  (
    <List {...props}>
      <Datagrid>
        <TextField source="id"/>
        <TextField source="name"/>
        <DateField source="publicationDate"/>
        <BooleanField source="public"/>
        <EditButton basePath="/category"/>
      </Datagrid>
    </List>
  );

const CategoryTitle = ({ record }) => {
    return <span>Category {record ? `"${record.name}"` : ''}</span>;
};

export const CategoryEdit = (props) => (
    <Edit title={<CategoryTitle {...props} />} {...props}>
        <SimpleForm>
            <TextInput disabled source="id" />
            <TextInput source="name" />
            <DateInput label="Publication date" source="publicationDate" />
            <BooleanField label="Public"  source="public" />
        </SimpleForm>
    </Edit>
);

export const CategoryCreate = (props) => (
    <Create title="Create a Category" {...props}>
        <SimpleForm>
            <TextInput source="name" />
            <DateInput label="Publication date" source="publicationDate" />
            <BooleanField label="Public"  source="public" />
        </SimpleForm>
    </Create>
);
