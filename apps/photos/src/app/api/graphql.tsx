import { gql } from '@apollo/client';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** A date string, such as 2007-12-03, compliant with the `full-date` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  Date: any;
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  DateTime: any;
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: any;
  /** The `Long` scalar type represents 52-bit integers */
  Long: any;
  /** A time string with format: HH:mm:ss.SSS */
  Time: any;
  /** The `Upload` scalar type represents a file upload. */
  Upload: any;
};

export type AdminUser = {
  __typename?: 'AdminUser';
  id: Scalars['ID'];
  username?: Maybe<Scalars['String']>;
  firstname: Scalars['String'];
  lastname: Scalars['String'];
};

export type AudienceInput = {
  name: Scalars['String'];
  key?: Maybe<Scalars['String']>;
  created_by?: Maybe<Scalars['ID']>;
  updated_by?: Maybe<Scalars['ID']>;
};

export type Category = {
  __typename?: 'Category';
  id: Scalars['ID'];
  created_at: Scalars['DateTime'];
  updated_at: Scalars['DateTime'];
  name: Scalars['String'];
  slug?: Maybe<Scalars['String']>;
  slugOverride?: Maybe<Scalars['String']>;
  public?: Maybe<Scalars['Boolean']>;
  publicationDate: Scalars['DateTime'];
  file?: Maybe<UploadFile>;
  image?: Maybe<UploadFile>;
  gallery?: Maybe<Gallery>;
  keywords?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  navigation?: Maybe<NavigationNavigationitem>;
  medias?: Maybe<Array<Maybe<UploadFile>>>;
  users?: Maybe<Array<Maybe<UsersPermissionsUser>>>;
};


export type CategoryMediasArgs = {
  sort?: Maybe<Scalars['String']>;
  limit?: Maybe<Scalars['Int']>;
  start?: Maybe<Scalars['Int']>;
  where?: Maybe<Scalars['JSON']>;
};


export type CategoryUsersArgs = {
  sort?: Maybe<Scalars['String']>;
  limit?: Maybe<Scalars['Int']>;
  start?: Maybe<Scalars['Int']>;
  where?: Maybe<Scalars['JSON']>;
};

export type CategoryAggregator = {
  __typename?: 'CategoryAggregator';
  count?: Maybe<Scalars['Int']>;
  totalCount?: Maybe<Scalars['Int']>;
};

export type CategoryConnection = {
  __typename?: 'CategoryConnection';
  values?: Maybe<Array<Maybe<Category>>>;
  groupBy?: Maybe<CategoryGroupBy>;
  aggregate?: Maybe<CategoryAggregator>;
};

export type CategoryConnectionCreated_At = {
  __typename?: 'CategoryConnectionCreated_at';
  key?: Maybe<Scalars['DateTime']>;
  connection?: Maybe<CategoryConnection>;
};

export type CategoryConnectionDescription = {
  __typename?: 'CategoryConnectionDescription';
  key?: Maybe<Scalars['String']>;
  connection?: Maybe<CategoryConnection>;
};

export type CategoryConnectionFile = {
  __typename?: 'CategoryConnectionFile';
  key?: Maybe<Scalars['ID']>;
  connection?: Maybe<CategoryConnection>;
};

export type CategoryConnectionGallery = {
  __typename?: 'CategoryConnectionGallery';
  key?: Maybe<Scalars['ID']>;
  connection?: Maybe<CategoryConnection>;
};

export type CategoryConnectionId = {
  __typename?: 'CategoryConnectionId';
  key?: Maybe<Scalars['ID']>;
  connection?: Maybe<CategoryConnection>;
};

export type CategoryConnectionImage = {
  __typename?: 'CategoryConnectionImage';
  key?: Maybe<Scalars['ID']>;
  connection?: Maybe<CategoryConnection>;
};

export type CategoryConnectionKeywords = {
  __typename?: 'CategoryConnectionKeywords';
  key?: Maybe<Scalars['String']>;
  connection?: Maybe<CategoryConnection>;
};

export type CategoryConnectionName = {
  __typename?: 'CategoryConnectionName';
  key?: Maybe<Scalars['String']>;
  connection?: Maybe<CategoryConnection>;
};

export type CategoryConnectionNavigation = {
  __typename?: 'CategoryConnectionNavigation';
  key?: Maybe<Scalars['ID']>;
  connection?: Maybe<CategoryConnection>;
};

export type CategoryConnectionPublic = {
  __typename?: 'CategoryConnectionPublic';
  key?: Maybe<Scalars['Boolean']>;
  connection?: Maybe<CategoryConnection>;
};

export type CategoryConnectionPublicationDate = {
  __typename?: 'CategoryConnectionPublicationDate';
  key?: Maybe<Scalars['DateTime']>;
  connection?: Maybe<CategoryConnection>;
};

export type CategoryConnectionSlug = {
  __typename?: 'CategoryConnectionSlug';
  key?: Maybe<Scalars['String']>;
  connection?: Maybe<CategoryConnection>;
};

export type CategoryConnectionSlugOverride = {
  __typename?: 'CategoryConnectionSlugOverride';
  key?: Maybe<Scalars['String']>;
  connection?: Maybe<CategoryConnection>;
};

export type CategoryConnectionUpdated_At = {
  __typename?: 'CategoryConnectionUpdated_at';
  key?: Maybe<Scalars['DateTime']>;
  connection?: Maybe<CategoryConnection>;
};

export type CategoryGroupBy = {
  __typename?: 'CategoryGroupBy';
  id?: Maybe<Array<Maybe<CategoryConnectionId>>>;
  created_at?: Maybe<Array<Maybe<CategoryConnectionCreated_At>>>;
  updated_at?: Maybe<Array<Maybe<CategoryConnectionUpdated_At>>>;
  name?: Maybe<Array<Maybe<CategoryConnectionName>>>;
  slug?: Maybe<Array<Maybe<CategoryConnectionSlug>>>;
  slugOverride?: Maybe<Array<Maybe<CategoryConnectionSlugOverride>>>;
  public?: Maybe<Array<Maybe<CategoryConnectionPublic>>>;
  publicationDate?: Maybe<Array<Maybe<CategoryConnectionPublicationDate>>>;
  file?: Maybe<Array<Maybe<CategoryConnectionFile>>>;
  image?: Maybe<Array<Maybe<CategoryConnectionImage>>>;
  gallery?: Maybe<Array<Maybe<CategoryConnectionGallery>>>;
  keywords?: Maybe<Array<Maybe<CategoryConnectionKeywords>>>;
  description?: Maybe<Array<Maybe<CategoryConnectionDescription>>>;
  navigation?: Maybe<Array<Maybe<CategoryConnectionNavigation>>>;
};

export type CategoryInput = {
  name: Scalars['String'];
  slug?: Maybe<Scalars['String']>;
  slugOverride?: Maybe<Scalars['String']>;
  public?: Maybe<Scalars['Boolean']>;
  publicationDate: Scalars['DateTime'];
  file?: Maybe<Scalars['ID']>;
  image?: Maybe<Scalars['ID']>;
  medias?: Maybe<Array<Maybe<Scalars['ID']>>>;
  users?: Maybe<Array<Maybe<Scalars['ID']>>>;
  gallery?: Maybe<Scalars['ID']>;
  keywords?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  navigation?: Maybe<Scalars['ID']>;
  created_by?: Maybe<Scalars['ID']>;
  updated_by?: Maybe<Scalars['ID']>;
};

export type ComponentMenuConfigMenu = {
  __typename?: 'ComponentMenuConfigMenu';
  id: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  url?: Maybe<Scalars['String']>;
  icon?: Maybe<Enum_Componentmenuconfigmenu_Icon>;
};

export type ComponentMenuConfigMenuInput = {
  name?: Maybe<Scalars['String']>;
  url?: Maybe<Scalars['String']>;
  icon?: Maybe<Enum_Componentmenuconfigmenu_Icon>;
};



export enum Enum_Componentmenuconfigmenu_Icon {
  None = 'none',
  Facebook = 'facebook',
  Instagram = 'instagram',
  Github = 'github',
  Linkedin = 'linkedin'
}

export enum Enum_Navigationnavigationitem_Type {
  Internal = 'INTERNAL',
  External = 'EXTERNAL'
}

export type FileInfoInput = {
  name?: Maybe<Scalars['String']>;
  alternativeText?: Maybe<Scalars['String']>;
  caption?: Maybe<Scalars['String']>;
};

export type Gallery = {
  __typename?: 'Gallery';
  id: Scalars['ID'];
  created_at: Scalars['DateTime'];
  updated_at: Scalars['DateTime'];
  name?: Maybe<Scalars['String']>;
  slug: Scalars['String'];
  slugOverride?: Maybe<Scalars['String']>;
  public?: Maybe<Scalars['Boolean']>;
  keywords?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  navigation?: Maybe<NavigationNavigationitem>;
  categories?: Maybe<Array<Maybe<Category>>>;
};


export type GalleryCategoriesArgs = {
  sort?: Maybe<Scalars['String']>;
  limit?: Maybe<Scalars['Int']>;
  start?: Maybe<Scalars['Int']>;
  where?: Maybe<Scalars['JSON']>;
};

export type GalleryAggregator = {
  __typename?: 'GalleryAggregator';
  count?: Maybe<Scalars['Int']>;
  totalCount?: Maybe<Scalars['Int']>;
};

export type GalleryConnection = {
  __typename?: 'GalleryConnection';
  values?: Maybe<Array<Maybe<Gallery>>>;
  groupBy?: Maybe<GalleryGroupBy>;
  aggregate?: Maybe<GalleryAggregator>;
};

export type GalleryConnectionCreated_At = {
  __typename?: 'GalleryConnectionCreated_at';
  key?: Maybe<Scalars['DateTime']>;
  connection?: Maybe<GalleryConnection>;
};

export type GalleryConnectionDescription = {
  __typename?: 'GalleryConnectionDescription';
  key?: Maybe<Scalars['String']>;
  connection?: Maybe<GalleryConnection>;
};

export type GalleryConnectionId = {
  __typename?: 'GalleryConnectionId';
  key?: Maybe<Scalars['ID']>;
  connection?: Maybe<GalleryConnection>;
};

export type GalleryConnectionKeywords = {
  __typename?: 'GalleryConnectionKeywords';
  key?: Maybe<Scalars['String']>;
  connection?: Maybe<GalleryConnection>;
};

export type GalleryConnectionName = {
  __typename?: 'GalleryConnectionName';
  key?: Maybe<Scalars['String']>;
  connection?: Maybe<GalleryConnection>;
};

export type GalleryConnectionNavigation = {
  __typename?: 'GalleryConnectionNavigation';
  key?: Maybe<Scalars['ID']>;
  connection?: Maybe<GalleryConnection>;
};

export type GalleryConnectionPublic = {
  __typename?: 'GalleryConnectionPublic';
  key?: Maybe<Scalars['Boolean']>;
  connection?: Maybe<GalleryConnection>;
};

export type GalleryConnectionSlug = {
  __typename?: 'GalleryConnectionSlug';
  key?: Maybe<Scalars['String']>;
  connection?: Maybe<GalleryConnection>;
};

export type GalleryConnectionSlugOverride = {
  __typename?: 'GalleryConnectionSlugOverride';
  key?: Maybe<Scalars['String']>;
  connection?: Maybe<GalleryConnection>;
};

export type GalleryConnectionUpdated_At = {
  __typename?: 'GalleryConnectionUpdated_at';
  key?: Maybe<Scalars['DateTime']>;
  connection?: Maybe<GalleryConnection>;
};

export type GalleryGroupBy = {
  __typename?: 'GalleryGroupBy';
  id?: Maybe<Array<Maybe<GalleryConnectionId>>>;
  created_at?: Maybe<Array<Maybe<GalleryConnectionCreated_At>>>;
  updated_at?: Maybe<Array<Maybe<GalleryConnectionUpdated_At>>>;
  name?: Maybe<Array<Maybe<GalleryConnectionName>>>;
  slug?: Maybe<Array<Maybe<GalleryConnectionSlug>>>;
  slugOverride?: Maybe<Array<Maybe<GalleryConnectionSlugOverride>>>;
  public?: Maybe<Array<Maybe<GalleryConnectionPublic>>>;
  keywords?: Maybe<Array<Maybe<GalleryConnectionKeywords>>>;
  description?: Maybe<Array<Maybe<GalleryConnectionDescription>>>;
  navigation?: Maybe<Array<Maybe<GalleryConnectionNavigation>>>;
};

export type GalleryInput = {
  name?: Maybe<Scalars['String']>;
  slug: Scalars['String'];
  slugOverride?: Maybe<Scalars['String']>;
  public?: Maybe<Scalars['Boolean']>;
  categories?: Maybe<Array<Maybe<Scalars['ID']>>>;
  keywords?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  navigation?: Maybe<Scalars['ID']>;
  created_by?: Maybe<Scalars['ID']>;
  updated_by?: Maybe<Scalars['ID']>;
};

export type Image = {
  __typename?: 'Image';
  url: Scalars['String'];
  mediaQuery?: Maybe<Scalars['String']>;
  width: Scalars['Int'];
  height: Scalars['Int'];
  type?: Maybe<Scalars['String']>;
  webp: Scalars['Boolean'];
};

export type InputId = {
  id: Scalars['ID'];
};



export type Menu = {
  __typename?: 'Menu';
  id: Scalars['ID'];
  created_at: Scalars['DateTime'];
  updated_at: Scalars['DateTime'];
  topMenu?: Maybe<Array<Maybe<ComponentMenuConfigMenu>>>;
  mainMenu?: Maybe<Array<Maybe<ComponentMenuConfigMenu>>>;
  brand?: Maybe<UploadFile>;
  socialIcons?: Maybe<Array<Maybe<ComponentMenuConfigMenu>>>;
  brandName?: Maybe<Scalars['String']>;
  published_at?: Maybe<Scalars['DateTime']>;
};

export type MenuInput = {
  topMenu?: Maybe<Array<Maybe<ComponentMenuConfigMenuInput>>>;
  mainMenu?: Maybe<Array<Maybe<ComponentMenuConfigMenuInput>>>;
  brand?: Maybe<Scalars['ID']>;
  socialIcons?: Maybe<Array<Maybe<ComponentMenuConfigMenuInput>>>;
  brandName?: Maybe<Scalars['String']>;
  published_at?: Maybe<Scalars['DateTime']>;
  created_by?: Maybe<Scalars['ID']>;
  updated_by?: Maybe<Scalars['ID']>;
};

export type Morph = Image | UsersPermissionsMe | UsersPermissionsMeRole | UsersPermissionsLoginPayload | UserPermissionsPasswordPayload | Category | CategoryConnection | CategoryAggregator | CategoryGroupBy | CategoryConnectionId | CategoryConnectionCreated_At | CategoryConnectionUpdated_At | CategoryConnectionName | CategoryConnectionSlug | CategoryConnectionSlugOverride | CategoryConnectionPublic | CategoryConnectionPublicationDate | CategoryConnectionFile | CategoryConnectionImage | CategoryConnectionGallery | CategoryConnectionKeywords | CategoryConnectionDescription | CategoryConnectionNavigation | CreateCategoryPayload | UpdateCategoryPayload | DeleteCategoryPayload | Gallery | GalleryConnection | GalleryAggregator | GalleryGroupBy | GalleryConnectionId | GalleryConnectionCreated_At | GalleryConnectionUpdated_At | GalleryConnectionName | GalleryConnectionSlug | GalleryConnectionSlugOverride | GalleryConnectionPublic | GalleryConnectionKeywords | GalleryConnectionDescription | GalleryConnectionNavigation | CreateGalleryPayload | UpdateGalleryPayload | DeleteGalleryPayload | Menu | UpdateMenuPayload | DeleteMenuPayload | NavigationAudience | NavigationNavigation | NavigationNavigationitem | UploadFile | UsersPermissionsPermission | UsersPermissionsRole | UsersPermissionsUser | CreateUserPayload | UpdateUserPayload | ComponentMenuConfigMenu;

export type Mutation = {
  __typename?: 'Mutation';
  createCategory?: Maybe<CreateCategoryPayload>;
  updateCategory?: Maybe<UpdateCategoryPayload>;
  deleteCategory?: Maybe<DeleteCategoryPayload>;
  createGallery?: Maybe<CreateGalleryPayload>;
  updateGallery?: Maybe<UpdateGalleryPayload>;
  deleteGallery?: Maybe<DeleteGalleryPayload>;
  updateMenu?: Maybe<UpdateMenuPayload>;
  deleteMenu?: Maybe<DeleteMenuPayload>;
};


export type MutationCreateCategoryArgs = {
  input?: Maybe<CreateCategoryInput>;
};


export type MutationUpdateCategoryArgs = {
  input?: Maybe<UpdateCategoryInput>;
};


export type MutationDeleteCategoryArgs = {
  input?: Maybe<DeleteCategoryInput>;
};


export type MutationCreateGalleryArgs = {
  input?: Maybe<CreateGalleryInput>;
};


export type MutationUpdateGalleryArgs = {
  input?: Maybe<UpdateGalleryInput>;
};


export type MutationDeleteGalleryArgs = {
  input?: Maybe<DeleteGalleryInput>;
};


export type MutationUpdateMenuArgs = {
  input?: Maybe<UpdateMenuInput>;
};

export type NavigationAudience = {
  __typename?: 'NavigationAudience';
  id: Scalars['ID'];
  name: Scalars['String'];
  key?: Maybe<Scalars['String']>;
};

export type NavigationInput = {
  name: Scalars['String'];
  slug: Scalars['String'];
  visible?: Maybe<Scalars['Boolean']>;
  items?: Maybe<Array<Maybe<Scalars['ID']>>>;
  created_by?: Maybe<Scalars['ID']>;
  updated_by?: Maybe<Scalars['ID']>;
};

/** Navigation container */
export type NavigationNavigation = {
  __typename?: 'NavigationNavigation';
  id: Scalars['ID'];
  name: Scalars['String'];
  slug: Scalars['String'];
  visible?: Maybe<Scalars['Boolean']>;
  items?: Maybe<Array<Maybe<NavigationNavigationitem>>>;
};


/** Navigation container */
export type NavigationNavigationItemsArgs = {
  sort?: Maybe<Scalars['String']>;
  limit?: Maybe<Scalars['Int']>;
  start?: Maybe<Scalars['Int']>;
  where?: Maybe<Scalars['JSON']>;
};

export type NavigationNavigationitem = {
  __typename?: 'NavigationNavigationitem';
  id: Scalars['ID'];
  created_at: Scalars['DateTime'];
  updated_at: Scalars['DateTime'];
  title: Scalars['String'];
  type?: Maybe<Enum_Navigationnavigationitem_Type>;
  path?: Maybe<Scalars['String']>;
  externalPath?: Maybe<Scalars['String']>;
  uiRouterKey?: Maybe<Scalars['String']>;
  menuAttached?: Maybe<Scalars['Boolean']>;
  order?: Maybe<Scalars['Int']>;
  parent?: Maybe<NavigationNavigationitem>;
  master?: Maybe<NavigationNavigation>;
  related?: Maybe<Array<Maybe<Morph>>>;
  audience?: Maybe<Array<Maybe<NavigationAudience>>>;
};


export type NavigationNavigationitemRelatedArgs = {
  sort?: Maybe<Scalars['String']>;
  limit?: Maybe<Scalars['Int']>;
  start?: Maybe<Scalars['Int']>;
  where?: Maybe<Scalars['JSON']>;
};


export type NavigationNavigationitemAudienceArgs = {
  sort?: Maybe<Scalars['String']>;
  limit?: Maybe<Scalars['Int']>;
  start?: Maybe<Scalars['Int']>;
  where?: Maybe<Scalars['JSON']>;
};

export type NavigationitemInput = {
  title: Scalars['String'];
  type?: Maybe<Enum_Navigationnavigationitem_Type>;
  path?: Maybe<Scalars['String']>;
  externalPath?: Maybe<Scalars['String']>;
  uiRouterKey?: Maybe<Scalars['String']>;
  menuAttached?: Maybe<Scalars['Boolean']>;
  order?: Maybe<Scalars['Int']>;
  related?: Maybe<Array<Maybe<Scalars['ID']>>>;
  parent?: Maybe<Scalars['ID']>;
  master?: Maybe<Scalars['ID']>;
  audience?: Maybe<Array<Maybe<Scalars['ID']>>>;
  created_by?: Maybe<Scalars['ID']>;
  updated_by?: Maybe<Scalars['ID']>;
};

export enum PublicationState {
  Live = 'LIVE',
  Preview = 'PREVIEW'
}

export type Query = {
  __typename?: 'Query';
  category?: Maybe<Category>;
  categories?: Maybe<Array<Maybe<Category>>>;
  categoriesConnection?: Maybe<CategoryConnection>;
  gallery?: Maybe<Gallery>;
  galleries?: Maybe<Array<Maybe<Gallery>>>;
  galleriesConnection?: Maybe<GalleryConnection>;
  menu?: Maybe<Menu>;
};


export type QueryCategoryArgs = {
  id: Scalars['ID'];
  publicationState?: Maybe<PublicationState>;
};


export type QueryCategoriesArgs = {
  sort?: Maybe<Scalars['String']>;
  limit?: Maybe<Scalars['Int']>;
  start?: Maybe<Scalars['Int']>;
  where?: Maybe<Scalars['JSON']>;
  publicationState?: Maybe<PublicationState>;
};


export type QueryCategoriesConnectionArgs = {
  sort?: Maybe<Scalars['String']>;
  limit?: Maybe<Scalars['Int']>;
  start?: Maybe<Scalars['Int']>;
  where?: Maybe<Scalars['JSON']>;
};


export type QueryGalleryArgs = {
  id: Scalars['ID'];
  publicationState?: Maybe<PublicationState>;
};


export type QueryGalleriesArgs = {
  sort?: Maybe<Scalars['String']>;
  limit?: Maybe<Scalars['Int']>;
  start?: Maybe<Scalars['Int']>;
  where?: Maybe<Scalars['JSON']>;
  publicationState?: Maybe<PublicationState>;
};


export type QueryGalleriesConnectionArgs = {
  sort?: Maybe<Scalars['String']>;
  limit?: Maybe<Scalars['Int']>;
  start?: Maybe<Scalars['Int']>;
  where?: Maybe<Scalars['JSON']>;
};


export type QueryMenuArgs = {
  publicationState?: Maybe<PublicationState>;
};

export type RoleInput = {
  name: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
  permissions?: Maybe<Array<Maybe<Scalars['ID']>>>;
  users?: Maybe<Array<Maybe<Scalars['ID']>>>;
  created_by?: Maybe<Scalars['ID']>;
  updated_by?: Maybe<Scalars['ID']>;
};



export type UploadFile = {
  __typename?: 'UploadFile';
  id: Scalars['ID'];
  created_at: Scalars['DateTime'];
  updated_at: Scalars['DateTime'];
  name: Scalars['String'];
  alternativeText?: Maybe<Scalars['String']>;
  caption?: Maybe<Scalars['String']>;
  width?: Maybe<Scalars['Int']>;
  height?: Maybe<Scalars['Int']>;
  formats?: Maybe<Scalars['JSON']>;
  hash: Scalars['String'];
  ext?: Maybe<Scalars['String']>;
  mime: Scalars['String'];
  size: Scalars['Float'];
  url: Scalars['String'];
  previewUrl?: Maybe<Scalars['String']>;
  provider: Scalars['String'];
  provider_metadata?: Maybe<Scalars['JSON']>;
  related?: Maybe<Array<Maybe<Morph>>>;
  thumbnails?: Maybe<Array<Maybe<Image>>>;
  thumbnail?: Maybe<Image>;
};


export type UploadFileRelatedArgs = {
  sort?: Maybe<Scalars['String']>;
  limit?: Maybe<Scalars['Int']>;
  start?: Maybe<Scalars['Int']>;
  where?: Maybe<Scalars['JSON']>;
};


export type UploadFileThumbnailArgs = {
  width?: Maybe<Scalars['Int']>;
  webp?: Maybe<Scalars['Boolean']>;
};

export type UserInput = {
  username: Scalars['String'];
  email: Scalars['String'];
  provider?: Maybe<Scalars['String']>;
  password?: Maybe<Scalars['String']>;
  resetPasswordToken?: Maybe<Scalars['String']>;
  confirmed?: Maybe<Scalars['Boolean']>;
  blocked?: Maybe<Scalars['Boolean']>;
  role?: Maybe<Scalars['ID']>;
  categories?: Maybe<Array<Maybe<Scalars['ID']>>>;
  created_by?: Maybe<Scalars['ID']>;
  updated_by?: Maybe<Scalars['ID']>;
};

export type UserPermissionsPasswordPayload = {
  __typename?: 'UserPermissionsPasswordPayload';
  ok: Scalars['Boolean'];
};

export type UsersPermissionsLoginInput = {
  identifier: Scalars['String'];
  password: Scalars['String'];
  provider?: Maybe<Scalars['String']>;
};

export type UsersPermissionsLoginPayload = {
  __typename?: 'UsersPermissionsLoginPayload';
  jwt?: Maybe<Scalars['String']>;
  user: UsersPermissionsMe;
};

export type UsersPermissionsMe = {
  __typename?: 'UsersPermissionsMe';
  id: Scalars['ID'];
  username: Scalars['String'];
  email: Scalars['String'];
  confirmed?: Maybe<Scalars['Boolean']>;
  blocked?: Maybe<Scalars['Boolean']>;
  role?: Maybe<UsersPermissionsMeRole>;
};

export type UsersPermissionsMeRole = {
  __typename?: 'UsersPermissionsMeRole';
  id: Scalars['ID'];
  name: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
};

export type UsersPermissionsPermission = {
  __typename?: 'UsersPermissionsPermission';
  id: Scalars['ID'];
  type: Scalars['String'];
  controller: Scalars['String'];
  action: Scalars['String'];
  enabled: Scalars['Boolean'];
  policy?: Maybe<Scalars['String']>;
  role?: Maybe<UsersPermissionsRole>;
};

export type UsersPermissionsRegisterInput = {
  username: Scalars['String'];
  email: Scalars['String'];
  password: Scalars['String'];
};

export type UsersPermissionsRole = {
  __typename?: 'UsersPermissionsRole';
  id: Scalars['ID'];
  name: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
  permissions?: Maybe<Array<Maybe<UsersPermissionsPermission>>>;
  users?: Maybe<Array<Maybe<UsersPermissionsUser>>>;
};


export type UsersPermissionsRolePermissionsArgs = {
  sort?: Maybe<Scalars['String']>;
  limit?: Maybe<Scalars['Int']>;
  start?: Maybe<Scalars['Int']>;
  where?: Maybe<Scalars['JSON']>;
};


export type UsersPermissionsRoleUsersArgs = {
  sort?: Maybe<Scalars['String']>;
  limit?: Maybe<Scalars['Int']>;
  start?: Maybe<Scalars['Int']>;
  where?: Maybe<Scalars['JSON']>;
};

export type UsersPermissionsUser = {
  __typename?: 'UsersPermissionsUser';
  id: Scalars['ID'];
  created_at: Scalars['DateTime'];
  updated_at: Scalars['DateTime'];
  username: Scalars['String'];
  email: Scalars['String'];
  provider?: Maybe<Scalars['String']>;
  confirmed?: Maybe<Scalars['Boolean']>;
  blocked?: Maybe<Scalars['Boolean']>;
  role?: Maybe<UsersPermissionsRole>;
  categories?: Maybe<Array<Maybe<Category>>>;
};


export type UsersPermissionsUserCategoriesArgs = {
  sort?: Maybe<Scalars['String']>;
  limit?: Maybe<Scalars['Int']>;
  start?: Maybe<Scalars['Int']>;
  where?: Maybe<Scalars['JSON']>;
};

export type CreateCategoryInput = {
  data?: Maybe<CategoryInput>;
};

export type CreateCategoryPayload = {
  __typename?: 'createCategoryPayload';
  category?: Maybe<Category>;
};

export type CreateGalleryInput = {
  data?: Maybe<GalleryInput>;
};

export type CreateGalleryPayload = {
  __typename?: 'createGalleryPayload';
  gallery?: Maybe<Gallery>;
};

export type CreateUserInput = {
  data?: Maybe<UserInput>;
};

export type CreateUserPayload = {
  __typename?: 'createUserPayload';
  user?: Maybe<UsersPermissionsUser>;
};

export type DeleteCategoryInput = {
  where?: Maybe<InputId>;
};

export type DeleteCategoryPayload = {
  __typename?: 'deleteCategoryPayload';
  category?: Maybe<Category>;
};

export type DeleteGalleryInput = {
  where?: Maybe<InputId>;
};

export type DeleteGalleryPayload = {
  __typename?: 'deleteGalleryPayload';
  gallery?: Maybe<Gallery>;
};

export type DeleteMenuPayload = {
  __typename?: 'deleteMenuPayload';
  menu?: Maybe<Menu>;
};

export type EditAudienceInput = {
  name?: Maybe<Scalars['String']>;
  key?: Maybe<Scalars['String']>;
  created_by?: Maybe<Scalars['ID']>;
  updated_by?: Maybe<Scalars['ID']>;
};

export type EditCategoryInput = {
  name?: Maybe<Scalars['String']>;
  slug?: Maybe<Scalars['String']>;
  slugOverride?: Maybe<Scalars['String']>;
  public?: Maybe<Scalars['Boolean']>;
  publicationDate?: Maybe<Scalars['DateTime']>;
  file?: Maybe<Scalars['ID']>;
  image?: Maybe<Scalars['ID']>;
  medias?: Maybe<Array<Maybe<Scalars['ID']>>>;
  users?: Maybe<Array<Maybe<Scalars['ID']>>>;
  gallery?: Maybe<Scalars['ID']>;
  keywords?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  navigation?: Maybe<Scalars['ID']>;
  created_by?: Maybe<Scalars['ID']>;
  updated_by?: Maybe<Scalars['ID']>;
};

export type EditComponentMenuConfigMenuInput = {
  id?: Maybe<Scalars['ID']>;
  name?: Maybe<Scalars['String']>;
  url?: Maybe<Scalars['String']>;
  icon?: Maybe<Enum_Componentmenuconfigmenu_Icon>;
};

export type EditGalleryInput = {
  name?: Maybe<Scalars['String']>;
  slug?: Maybe<Scalars['String']>;
  slugOverride?: Maybe<Scalars['String']>;
  public?: Maybe<Scalars['Boolean']>;
  categories?: Maybe<Array<Maybe<Scalars['ID']>>>;
  keywords?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  navigation?: Maybe<Scalars['ID']>;
  created_by?: Maybe<Scalars['ID']>;
  updated_by?: Maybe<Scalars['ID']>;
};

export type EditMenuInput = {
  topMenu?: Maybe<Array<Maybe<EditComponentMenuConfigMenuInput>>>;
  mainMenu?: Maybe<Array<Maybe<EditComponentMenuConfigMenuInput>>>;
  brand?: Maybe<Scalars['ID']>;
  socialIcons?: Maybe<Array<Maybe<EditComponentMenuConfigMenuInput>>>;
  brandName?: Maybe<Scalars['String']>;
  published_at?: Maybe<Scalars['DateTime']>;
  created_by?: Maybe<Scalars['ID']>;
  updated_by?: Maybe<Scalars['ID']>;
};

export type EditNavigationInput = {
  name?: Maybe<Scalars['String']>;
  slug?: Maybe<Scalars['String']>;
  visible?: Maybe<Scalars['Boolean']>;
  items?: Maybe<Array<Maybe<Scalars['ID']>>>;
  created_by?: Maybe<Scalars['ID']>;
  updated_by?: Maybe<Scalars['ID']>;
};

export type EditNavigationitemInput = {
  title?: Maybe<Scalars['String']>;
  type?: Maybe<Enum_Navigationnavigationitem_Type>;
  path?: Maybe<Scalars['String']>;
  externalPath?: Maybe<Scalars['String']>;
  uiRouterKey?: Maybe<Scalars['String']>;
  menuAttached?: Maybe<Scalars['Boolean']>;
  order?: Maybe<Scalars['Int']>;
  related?: Maybe<Array<Maybe<Scalars['ID']>>>;
  parent?: Maybe<Scalars['ID']>;
  master?: Maybe<Scalars['ID']>;
  audience?: Maybe<Array<Maybe<Scalars['ID']>>>;
  created_by?: Maybe<Scalars['ID']>;
  updated_by?: Maybe<Scalars['ID']>;
};

export type EditRoleInput = {
  name?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
  permissions?: Maybe<Array<Maybe<Scalars['ID']>>>;
  users?: Maybe<Array<Maybe<Scalars['ID']>>>;
  created_by?: Maybe<Scalars['ID']>;
  updated_by?: Maybe<Scalars['ID']>;
};

export type EditUserInput = {
  username?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  provider?: Maybe<Scalars['String']>;
  password?: Maybe<Scalars['String']>;
  resetPasswordToken?: Maybe<Scalars['String']>;
  confirmed?: Maybe<Scalars['Boolean']>;
  blocked?: Maybe<Scalars['Boolean']>;
  role?: Maybe<Scalars['ID']>;
  categories?: Maybe<Array<Maybe<Scalars['ID']>>>;
  created_by?: Maybe<Scalars['ID']>;
  updated_by?: Maybe<Scalars['ID']>;
};

export type UpdateCategoryInput = {
  where?: Maybe<InputId>;
  data?: Maybe<EditCategoryInput>;
};

export type UpdateCategoryPayload = {
  __typename?: 'updateCategoryPayload';
  category?: Maybe<Category>;
};

export type UpdateGalleryInput = {
  where?: Maybe<InputId>;
  data?: Maybe<EditGalleryInput>;
};

export type UpdateGalleryPayload = {
  __typename?: 'updateGalleryPayload';
  gallery?: Maybe<Gallery>;
};

export type UpdateMenuInput = {
  data?: Maybe<EditMenuInput>;
};

export type UpdateMenuPayload = {
  __typename?: 'updateMenuPayload';
  menu?: Maybe<Menu>;
};

export type UpdateUserInput = {
  where?: Maybe<InputId>;
  data?: Maybe<EditUserInput>;
};

export type UpdateUserPayload = {
  __typename?: 'updateUserPayload';
  user?: Maybe<UsersPermissionsUser>;
};
