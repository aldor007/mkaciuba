import React, { Component, useState } from 'react';
import buildGraphQLProvider from 'ra-data-graphql';
import { __schema as schema } from './schema.json';
import { buildQuery } from './buildQuery'; // see Specify your queries and mutations section below
import authProvider from './auth';
import { Admin, Resource, Delete, Authenticated } from 'react-admin';

import { CategoryCreate, CategoryEdit, CategoryList } from './components/categories';
import { MediaCreate, MediaEdit, MediaList } from './components/media';

interface IProps {

}

interface IState {
    dataProvider: null | any;
}
class App extends Component<IProps, IState> {
    constructor(props?) {
        super(props);
        this.state = { dataProvider: null };
    }
    componentDidMount() {
        buildGraphQLProvider({
            introspection: { schema },
            buildQuery,
            clientOptions: { uri: 'http://localhost:4000/graphql' }
        })
        .then(dataProvider => this.setState({dataProvider}));
    }

    render() {
       const { dataProvider } = this.state;

        if (!dataProvider) {
            return <div>Loading</div>;
        }

        return (
            <Admin dataProvider={dataProvider} authProvider={authProvider} >
                <Resource name="Category" list={CategoryList} edit={CategoryEdit} create={CategoryCreate} />
                <Resource name="Media" list={MediaList} edit={MediaEdit} create={MediaCreate} />
            </Admin>
        );
    }
}

export default App;
