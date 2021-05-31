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
  medias?: Maybe<Array<Maybe<UploadFile>>>;
  randomImage?: Maybe<UploadFile>;
  mediasCount: Scalars['Int'];
};


export type CategoryMediasArgs = {
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
  gallery?: Maybe<Scalars['ID']>;
  keywords?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  token?: Maybe<Scalars['String']>;
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

export type FileInfoInput = {
  name?: Maybe<Scalars['String']>;
  alternativeText?: Maybe<Scalars['String']>;
  caption?: Maybe<Scalars['String']>;
};

export type Footer = {
  __typename?: 'Footer';
  id: Scalars['ID'];
  created_at: Scalars['DateTime'];
  updated_at: Scalars['DateTime'];
  FeaturedCategories?: Maybe<Array<Maybe<ComponentMenuConfigMenu>>>;
  published_at?: Maybe<Scalars['DateTime']>;
};

export type FooterInput = {
  FeaturedCategories?: Maybe<Array<Maybe<ComponentMenuConfigMenuInput>>>;
  published_at?: Maybe<Scalars['DateTime']>;
  created_by?: Maybe<Scalars['ID']>;
  updated_by?: Maybe<Scalars['ID']>;
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
  categories?: Maybe<Array<Maybe<Category>>>;
};


export type GalleryCategoriesArgs = {
  sort?: Maybe<Scalars['String']>;
  limit?: Maybe<Scalars['Int']>;
  start?: Maybe<Scalars['Int']>;
  where?: Maybe<Scalars['JSON']>;
};

export type GalleryCategories = {
  __typename?: 'GalleryCategories';
  gallery?: Maybe<Gallery>;
  categories?: Maybe<Array<Maybe<Category>>>;
};

export type GalleryInput = {
  name?: Maybe<Scalars['String']>;
  slug: Scalars['String'];
  slugOverride?: Maybe<Scalars['String']>;
  public?: Maybe<Scalars['Boolean']>;
  categories?: Maybe<Array<Maybe<Scalars['ID']>>>;
  keywords?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
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

export type Morph = UsersPermissionsMe | UsersPermissionsMeRole | UsersPermissionsLoginPayload | UserPermissionsPasswordPayload | Image | ValidationToken | GalleryCategories | Category | CategoryConnection | CategoryAggregator | CategoryGroupBy | CategoryConnectionId | CategoryConnectionCreated_At | CategoryConnectionUpdated_At | CategoryConnectionName | CategoryConnectionSlug | CategoryConnectionSlugOverride | CategoryConnectionPublic | CategoryConnectionPublicationDate | CategoryConnectionFile | CategoryConnectionImage | CategoryConnectionGallery | CategoryConnectionKeywords | CategoryConnectionDescription | CreateCategoryPayload | UpdateCategoryPayload | DeleteCategoryPayload | Footer | UpdateFooterPayload | DeleteFooterPayload | Gallery | CreateGalleryPayload | UpdateGalleryPayload | DeleteGalleryPayload | Menu | UpdateMenuPayload | DeleteMenuPayload | UploadFile | UsersPermissionsPermission | UsersPermissionsRole | UsersPermissionsUser | CreateUserPayload | UpdateUserPayload | ComponentMenuConfigMenu;

export type Mutation = {
  __typename?: 'Mutation';
  createCategory?: Maybe<CreateCategoryPayload>;
  updateCategory?: Maybe<UpdateCategoryPayload>;
  deleteCategory?: Maybe<DeleteCategoryPayload>;
  updateFooter?: Maybe<UpdateFooterPayload>;
  deleteFooter?: Maybe<DeleteFooterPayload>;
  createGallery?: Maybe<CreateGalleryPayload>;
  updateGallery?: Maybe<UpdateGalleryPayload>;
  deleteGallery?: Maybe<DeleteGalleryPayload>;
  updateMenu?: Maybe<UpdateMenuPayload>;
  deleteMenu?: Maybe<DeleteMenuPayload>;
  validateTokenForCategory?: Maybe<ValidationToken>;
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


export type MutationUpdateFooterArgs = {
  input?: Maybe<UpdateFooterInput>;
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


export type MutationValidateTokenForCategoryArgs = {
  token?: Maybe<Scalars['String']>;
  categorySlug?: Maybe<Scalars['String']>;
};

export enum PublicationState {
  Live = 'LIVE',
  Preview = 'PREVIEW'
}

export type Query = {
  __typename?: 'Query';
  categories?: Maybe<Array<Maybe<Category>>>;
  categoriesConnection?: Maybe<CategoryConnection>;
  footer?: Maybe<Footer>;
  menu?: Maybe<Menu>;
  categoryBySlug?: Maybe<Category>;
  recentImages?: Maybe<Array<Maybe<UploadFile>>>;
  categoriesCount: Scalars['Int'];
  galleryBySlug?: Maybe<Gallery>;
  galleryMenu?: Maybe<GalleryCategories>;
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


export type QueryFooterArgs = {
  publicationState?: Maybe<PublicationState>;
};


export type QueryMenuArgs = {
  publicationState?: Maybe<PublicationState>;
};


export type QueryCategoryBySlugArgs = {
  slug?: Maybe<Scalars['String']>;
};


export type QueryRecentImagesArgs = {
  limit?: Maybe<Scalars['Int']>;
};


export type QueryCategoriesCountArgs = {
  where?: Maybe<Scalars['JSON']>;
};


export type QueryGalleryBySlugArgs = {
  slug?: Maybe<Scalars['String']>;
};


export type QueryGalleryMenuArgs = {
  slug?: Maybe<Scalars['String']>;
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
};

export type ValidationToken = {
  __typename?: 'ValidationToken';
  valid: Scalars['Boolean'];
  token?: Maybe<Scalars['String']>;
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

export type DeleteFooterPayload = {
  __typename?: 'deleteFooterPayload';
  footer?: Maybe<Footer>;
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

export type EditCategoryInput = {
  name?: Maybe<Scalars['String']>;
  slug?: Maybe<Scalars['String']>;
  slugOverride?: Maybe<Scalars['String']>;
  public?: Maybe<Scalars['Boolean']>;
  publicationDate?: Maybe<Scalars['DateTime']>;
  file?: Maybe<Scalars['ID']>;
  image?: Maybe<Scalars['ID']>;
  medias?: Maybe<Array<Maybe<Scalars['ID']>>>;
  gallery?: Maybe<Scalars['ID']>;
  keywords?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  token?: Maybe<Scalars['String']>;
  created_by?: Maybe<Scalars['ID']>;
  updated_by?: Maybe<Scalars['ID']>;
};

export type EditComponentMenuConfigMenuInput = {
  id?: Maybe<Scalars['ID']>;
  name?: Maybe<Scalars['String']>;
  url?: Maybe<Scalars['String']>;
  icon?: Maybe<Enum_Componentmenuconfigmenu_Icon>;
};

export type EditFooterInput = {
  FeaturedCategories?: Maybe<Array<Maybe<EditComponentMenuConfigMenuInput>>>;
  published_at?: Maybe<Scalars['DateTime']>;
  created_by?: Maybe<Scalars['ID']>;
  updated_by?: Maybe<Scalars['ID']>;
};

export type EditGalleryInput = {
  name?: Maybe<Scalars['String']>;
  slug?: Maybe<Scalars['String']>;
  slugOverride?: Maybe<Scalars['String']>;
  public?: Maybe<Scalars['Boolean']>;
  categories?: Maybe<Array<Maybe<Scalars['ID']>>>;
  keywords?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
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

export type UpdateFooterInput = {
  data?: Maybe<EditFooterInput>;
};

export type UpdateFooterPayload = {
  __typename?: 'updateFooterPayload';
  footer?: Maybe<Footer>;
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
