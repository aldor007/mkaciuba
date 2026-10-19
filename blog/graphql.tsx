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
  DateTime: any;
  JSON: any;
  Upload: any;
};

export type BooleanFilterInput = {
  and?: Maybe<Array<Maybe<Scalars['Boolean']>>>;
  between?: Maybe<Array<Maybe<Scalars['Boolean']>>>;
  contains?: Maybe<Scalars['Boolean']>;
  containsi?: Maybe<Scalars['Boolean']>;
  endsWith?: Maybe<Scalars['Boolean']>;
  eq?: Maybe<Scalars['Boolean']>;
  eqi?: Maybe<Scalars['Boolean']>;
  gt?: Maybe<Scalars['Boolean']>;
  gte?: Maybe<Scalars['Boolean']>;
  in?: Maybe<Array<Maybe<Scalars['Boolean']>>>;
  lt?: Maybe<Scalars['Boolean']>;
  lte?: Maybe<Scalars['Boolean']>;
  ne?: Maybe<Scalars['Boolean']>;
  nei?: Maybe<Scalars['Boolean']>;
  not?: Maybe<BooleanFilterInput>;
  notContains?: Maybe<Scalars['Boolean']>;
  notContainsi?: Maybe<Scalars['Boolean']>;
  notIn?: Maybe<Array<Maybe<Scalars['Boolean']>>>;
  notNull?: Maybe<Scalars['Boolean']>;
  null?: Maybe<Scalars['Boolean']>;
  or?: Maybe<Array<Maybe<Scalars['Boolean']>>>;
  startsWith?: Maybe<Scalars['Boolean']>;
};

export type Category = {
  __typename?: 'Category';
  createdAt?: Maybe<Scalars['DateTime']>;
  description?: Maybe<Scalars['String']>;
  file?: Maybe<UploadFileEntityResponse>;
  gallery?: Maybe<GalleryEntityResponse>;
  id: Scalars['ID'];
  image: UploadFileEntityResponse;
  keywords?: Maybe<Scalars['String']>;
  medias: UploadFileRelationResponseCollection;
  mediasCount: Scalars['Int'];
  name: Scalars['String'];
  public?: Maybe<Scalars['Boolean']>;
  publicationDate: Scalars['DateTime'];
  randomImage?: Maybe<UploadFile>;
  slug?: Maybe<Scalars['String']>;
  slugOverride?: Maybe<Scalars['String']>;
  text?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
};


export type CategoryMediasArgs = {
  filters?: Maybe<UploadFileFiltersInput>;
  pagination?: Maybe<PaginationArg>;
  sort?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type CategoryEntity = {
  __typename?: 'CategoryEntity';
  attributes?: Maybe<Category>;
  id?: Maybe<Scalars['ID']>;
};

export type CategoryEntityResponse = {
  __typename?: 'CategoryEntityResponse';
  data?: Maybe<CategoryEntity>;
};

export type CategoryFiltersInput = {
  and?: Maybe<Array<Maybe<CategoryFiltersInput>>>;
  createdAt?: Maybe<DateTimeFilterInput>;
  description?: Maybe<StringFilterInput>;
  gallery?: Maybe<GalleryFiltersInput>;
  id?: Maybe<IdFilterInput>;
  keywords?: Maybe<StringFilterInput>;
  name?: Maybe<StringFilterInput>;
  not?: Maybe<CategoryFiltersInput>;
  or?: Maybe<Array<Maybe<CategoryFiltersInput>>>;
  public?: Maybe<BooleanFilterInput>;
  publicationDate?: Maybe<DateTimeFilterInput>;
  slug?: Maybe<StringFilterInput>;
  slugOverride?: Maybe<StringFilterInput>;
  text?: Maybe<StringFilterInput>;
  token?: Maybe<StringFilterInput>;
  updatedAt?: Maybe<DateTimeFilterInput>;
};

export type CategoryInput = {
  description?: Maybe<Scalars['String']>;
  file?: Maybe<Scalars['ID']>;
  gallery?: Maybe<Scalars['ID']>;
  image?: Maybe<Scalars['ID']>;
  keywords?: Maybe<Scalars['String']>;
  medias?: Maybe<Array<Maybe<Scalars['ID']>>>;
  name?: Maybe<Scalars['String']>;
  public?: Maybe<Scalars['Boolean']>;
  publicationDate?: Maybe<Scalars['DateTime']>;
  slug?: Maybe<Scalars['String']>;
  slugOverride?: Maybe<Scalars['String']>;
  text?: Maybe<Scalars['String']>;
  token?: Maybe<Scalars['String']>;
};

export type CategoryRelationResponseCollection = {
  __typename?: 'CategoryRelationResponseCollection';
  data: Array<CategoryEntity>;
};

export type ComponentMenuConfigMenu = {
  __typename?: 'ComponentMenuConfigMenu';
  icon?: Maybe<Enum_Componentmenuconfigmenu_Icon>;
  id: Scalars['ID'];
  image?: Maybe<UploadFileEntityResponse>;
  name?: Maybe<Scalars['String']>;
  url?: Maybe<Scalars['String']>;
};

export type ComponentMenuConfigMenuFiltersInput = {
  and?: Maybe<Array<Maybe<ComponentMenuConfigMenuFiltersInput>>>;
  icon?: Maybe<StringFilterInput>;
  name?: Maybe<StringFilterInput>;
  not?: Maybe<ComponentMenuConfigMenuFiltersInput>;
  or?: Maybe<Array<Maybe<ComponentMenuConfigMenuFiltersInput>>>;
  url?: Maybe<StringFilterInput>;
};

export type ComponentMenuConfigMenuInput = {
  icon?: Maybe<Enum_Componentmenuconfigmenu_Icon>;
  id?: Maybe<Scalars['ID']>;
  image?: Maybe<Scalars['ID']>;
  name?: Maybe<Scalars['String']>;
  url?: Maybe<Scalars['String']>;
};


export type DateTimeFilterInput = {
  and?: Maybe<Array<Maybe<Scalars['DateTime']>>>;
  between?: Maybe<Array<Maybe<Scalars['DateTime']>>>;
  contains?: Maybe<Scalars['DateTime']>;
  containsi?: Maybe<Scalars['DateTime']>;
  endsWith?: Maybe<Scalars['DateTime']>;
  eq?: Maybe<Scalars['DateTime']>;
  eqi?: Maybe<Scalars['DateTime']>;
  gt?: Maybe<Scalars['DateTime']>;
  gte?: Maybe<Scalars['DateTime']>;
  in?: Maybe<Array<Maybe<Scalars['DateTime']>>>;
  lt?: Maybe<Scalars['DateTime']>;
  lte?: Maybe<Scalars['DateTime']>;
  ne?: Maybe<Scalars['DateTime']>;
  nei?: Maybe<Scalars['DateTime']>;
  not?: Maybe<DateTimeFilterInput>;
  notContains?: Maybe<Scalars['DateTime']>;
  notContainsi?: Maybe<Scalars['DateTime']>;
  notIn?: Maybe<Array<Maybe<Scalars['DateTime']>>>;
  notNull?: Maybe<Scalars['Boolean']>;
  null?: Maybe<Scalars['Boolean']>;
  or?: Maybe<Array<Maybe<Scalars['DateTime']>>>;
  startsWith?: Maybe<Scalars['DateTime']>;
};

export enum Enum_Componentmenuconfigmenu_Icon {
  Facebook = 'facebook',
  Github = 'github',
  Instagram = 'instagram',
  Linkedin = 'linkedin',
  None = 'none'
}

export enum Enum_Post_Content_Position {
  Bottom = 'bottom',
  Top = 'top'
}

export enum Enum_Post_Content_Type {
  Html = 'HTML',
  Markdown = 'MARKDOWN'
}

export enum Enum_Post_Cover_Image_Preset {
  CoverC = 'cover_c',
  CoverE = 'cover_e',
  CoverN = 'cover_n',
  CoverS = 'cover_s',
  CoverSo = 'cover_so',
  CoverW = 'cover_w',
  Coverimg = 'coverimg'
}

export enum Enum_Post_Gallery_Template {
  Description = 'description',
  Normal = 'normal'
}

export enum Enum_Post_Post_Image_Preset {
  PostimgAc = 'postimg_ac',
  Postlist = 'postlist'
}

export enum Enum_Product_Availability {
  InStock = 'in_stock',
  MadeToOrder = 'made_to_order',
  Unavailable = 'unavailable'
}

export enum Enum_Product_Material {
  Ash = 'ash',
  Oak = 'oak',
  Other = 'other',
  Walnut = 'walnut'
}

export type FileInfoInput = {
  alternativeText?: Maybe<Scalars['String']>;
  caption?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
};

export type FloatFilterInput = {
  and?: Maybe<Array<Maybe<Scalars['Float']>>>;
  between?: Maybe<Array<Maybe<Scalars['Float']>>>;
  contains?: Maybe<Scalars['Float']>;
  containsi?: Maybe<Scalars['Float']>;
  endsWith?: Maybe<Scalars['Float']>;
  eq?: Maybe<Scalars['Float']>;
  eqi?: Maybe<Scalars['Float']>;
  gt?: Maybe<Scalars['Float']>;
  gte?: Maybe<Scalars['Float']>;
  in?: Maybe<Array<Maybe<Scalars['Float']>>>;
  lt?: Maybe<Scalars['Float']>;
  lte?: Maybe<Scalars['Float']>;
  ne?: Maybe<Scalars['Float']>;
  nei?: Maybe<Scalars['Float']>;
  not?: Maybe<FloatFilterInput>;
  notContains?: Maybe<Scalars['Float']>;
  notContainsi?: Maybe<Scalars['Float']>;
  notIn?: Maybe<Array<Maybe<Scalars['Float']>>>;
  notNull?: Maybe<Scalars['Boolean']>;
  null?: Maybe<Scalars['Boolean']>;
  or?: Maybe<Array<Maybe<Scalars['Float']>>>;
  startsWith?: Maybe<Scalars['Float']>;
};

export type Footer = {
  __typename?: 'Footer';
  FeaturedCategories?: Maybe<Array<Maybe<ComponentMenuConfigMenu>>>;
  createdAt?: Maybe<Scalars['DateTime']>;
  id: Scalars['ID'];
  publishedAt?: Maybe<Scalars['DateTime']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
};


export type FooterFeaturedCategoriesArgs = {
  filters?: Maybe<ComponentMenuConfigMenuFiltersInput>;
  pagination?: Maybe<PaginationArg>;
  sort?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FooterEntity = {
  __typename?: 'FooterEntity';
  attributes?: Maybe<Footer>;
  id?: Maybe<Scalars['ID']>;
};

export type FooterEntityResponse = {
  __typename?: 'FooterEntityResponse';
  data?: Maybe<FooterEntity>;
};

export type FooterInput = {
  FeaturedCategories?: Maybe<Array<Maybe<ComponentMenuConfigMenuInput>>>;
  publishedAt?: Maybe<Scalars['DateTime']>;
};

export type Gallery = {
  __typename?: 'Gallery';
  categories?: Maybe<CategoryRelationResponseCollection>;
  createdAt?: Maybe<Scalars['DateTime']>;
  description: Scalars['String'];
  id: Scalars['ID'];
  keywords?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  public?: Maybe<Scalars['Boolean']>;
  slug: Scalars['String'];
  slugOverride?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
};


export type GalleryCategoriesArgs = {
  filters?: Maybe<CategoryFiltersInput>;
  pagination?: Maybe<PaginationArg>;
  sort?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type GalleryCategories = {
  __typename?: 'GalleryCategories';
  categories?: Maybe<Array<Maybe<Category>>>;
  gallery?: Maybe<Gallery>;
};

export type GalleryEntity = {
  __typename?: 'GalleryEntity';
  attributes?: Maybe<Gallery>;
  id?: Maybe<Scalars['ID']>;
};

export type GalleryEntityResponse = {
  __typename?: 'GalleryEntityResponse';
  data?: Maybe<GalleryEntity>;
};

export type GalleryFiltersInput = {
  and?: Maybe<Array<Maybe<GalleryFiltersInput>>>;
  categories?: Maybe<CategoryFiltersInput>;
  createdAt?: Maybe<DateTimeFilterInput>;
  description?: Maybe<StringFilterInput>;
  id?: Maybe<IdFilterInput>;
  keywords?: Maybe<StringFilterInput>;
  name?: Maybe<StringFilterInput>;
  not?: Maybe<GalleryFiltersInput>;
  or?: Maybe<Array<Maybe<GalleryFiltersInput>>>;
  public?: Maybe<BooleanFilterInput>;
  slug?: Maybe<StringFilterInput>;
  slugOverride?: Maybe<StringFilterInput>;
  updatedAt?: Maybe<DateTimeFilterInput>;
};

export type GalleryInput = {
  categories?: Maybe<Array<Maybe<Scalars['ID']>>>;
  description?: Maybe<Scalars['String']>;
  keywords?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  public?: Maybe<Scalars['Boolean']>;
  slug?: Maybe<Scalars['String']>;
  slugOverride?: Maybe<Scalars['String']>;
};

export type GenericMorph = Category | ComponentMenuConfigMenu | Footer | Gallery | Menu | Page | Post | PostCategory | Product | Tag | UploadFile | UploadFolder | UsersPermissionsPermission | UsersPermissionsRole | UsersPermissionsUser;

export type IdFilterInput = {
  and?: Maybe<Array<Maybe<Scalars['ID']>>>;
  between?: Maybe<Array<Maybe<Scalars['ID']>>>;
  contains?: Maybe<Scalars['ID']>;
  containsi?: Maybe<Scalars['ID']>;
  endsWith?: Maybe<Scalars['ID']>;
  eq?: Maybe<Scalars['ID']>;
  eqi?: Maybe<Scalars['ID']>;
  gt?: Maybe<Scalars['ID']>;
  gte?: Maybe<Scalars['ID']>;
  in?: Maybe<Array<Maybe<Scalars['ID']>>>;
  lt?: Maybe<Scalars['ID']>;
  lte?: Maybe<Scalars['ID']>;
  ne?: Maybe<Scalars['ID']>;
  nei?: Maybe<Scalars['ID']>;
  not?: Maybe<IdFilterInput>;
  notContains?: Maybe<Scalars['ID']>;
  notContainsi?: Maybe<Scalars['ID']>;
  notIn?: Maybe<Array<Maybe<Scalars['ID']>>>;
  notNull?: Maybe<Scalars['Boolean']>;
  null?: Maybe<Scalars['Boolean']>;
  or?: Maybe<Array<Maybe<Scalars['ID']>>>;
  startsWith?: Maybe<Scalars['ID']>;
};

export type Image = {
  __typename?: 'Image';
  height: Scalars['Int'];
  mediaQuery?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
  url: Scalars['String'];
  webp: Scalars['Boolean'];
  width: Scalars['Int'];
};

export type IntFilterInput = {
  and?: Maybe<Array<Maybe<Scalars['Int']>>>;
  between?: Maybe<Array<Maybe<Scalars['Int']>>>;
  contains?: Maybe<Scalars['Int']>;
  containsi?: Maybe<Scalars['Int']>;
  endsWith?: Maybe<Scalars['Int']>;
  eq?: Maybe<Scalars['Int']>;
  eqi?: Maybe<Scalars['Int']>;
  gt?: Maybe<Scalars['Int']>;
  gte?: Maybe<Scalars['Int']>;
  in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  lt?: Maybe<Scalars['Int']>;
  lte?: Maybe<Scalars['Int']>;
  ne?: Maybe<Scalars['Int']>;
  nei?: Maybe<Scalars['Int']>;
  not?: Maybe<IntFilterInput>;
  notContains?: Maybe<Scalars['Int']>;
  notContainsi?: Maybe<Scalars['Int']>;
  notIn?: Maybe<Array<Maybe<Scalars['Int']>>>;
  notNull?: Maybe<Scalars['Boolean']>;
  null?: Maybe<Scalars['Boolean']>;
  or?: Maybe<Array<Maybe<Scalars['Int']>>>;
  startsWith?: Maybe<Scalars['Int']>;
};


export type JsonFilterInput = {
  and?: Maybe<Array<Maybe<Scalars['JSON']>>>;
  between?: Maybe<Array<Maybe<Scalars['JSON']>>>;
  contains?: Maybe<Scalars['JSON']>;
  containsi?: Maybe<Scalars['JSON']>;
  endsWith?: Maybe<Scalars['JSON']>;
  eq?: Maybe<Scalars['JSON']>;
  eqi?: Maybe<Scalars['JSON']>;
  gt?: Maybe<Scalars['JSON']>;
  gte?: Maybe<Scalars['JSON']>;
  in?: Maybe<Array<Maybe<Scalars['JSON']>>>;
  lt?: Maybe<Scalars['JSON']>;
  lte?: Maybe<Scalars['JSON']>;
  ne?: Maybe<Scalars['JSON']>;
  nei?: Maybe<Scalars['JSON']>;
  not?: Maybe<JsonFilterInput>;
  notContains?: Maybe<Scalars['JSON']>;
  notContainsi?: Maybe<Scalars['JSON']>;
  notIn?: Maybe<Array<Maybe<Scalars['JSON']>>>;
  notNull?: Maybe<Scalars['Boolean']>;
  null?: Maybe<Scalars['Boolean']>;
  or?: Maybe<Array<Maybe<Scalars['JSON']>>>;
  startsWith?: Maybe<Scalars['JSON']>;
};

export type Menu = {
  __typename?: 'Menu';
  brand?: Maybe<UploadFileEntityResponse>;
  brandName?: Maybe<Scalars['String']>;
  createdAt?: Maybe<Scalars['DateTime']>;
  id: Scalars['ID'];
  mainMenu?: Maybe<Array<Maybe<ComponentMenuConfigMenu>>>;
  publishedAt?: Maybe<Scalars['DateTime']>;
  socialIcons?: Maybe<Array<Maybe<ComponentMenuConfigMenu>>>;
  topMenu?: Maybe<Array<Maybe<ComponentMenuConfigMenu>>>;
  updatedAt?: Maybe<Scalars['DateTime']>;
};


export type MenuMainMenuArgs = {
  filters?: Maybe<ComponentMenuConfigMenuFiltersInput>;
  pagination?: Maybe<PaginationArg>;
  sort?: Maybe<Array<Maybe<Scalars['String']>>>;
};


export type MenuSocialIconsArgs = {
  filters?: Maybe<ComponentMenuConfigMenuFiltersInput>;
  pagination?: Maybe<PaginationArg>;
  sort?: Maybe<Array<Maybe<Scalars['String']>>>;
};


export type MenuTopMenuArgs = {
  filters?: Maybe<ComponentMenuConfigMenuFiltersInput>;
  pagination?: Maybe<PaginationArg>;
  sort?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type MenuEntity = {
  __typename?: 'MenuEntity';
  attributes?: Maybe<Menu>;
  id?: Maybe<Scalars['ID']>;
};

export type MenuEntityResponse = {
  __typename?: 'MenuEntityResponse';
  data?: Maybe<MenuEntity>;
};

export type MenuInput = {
  brand?: Maybe<Scalars['ID']>;
  brandName?: Maybe<Scalars['String']>;
  mainMenu?: Maybe<Array<Maybe<ComponentMenuConfigMenuInput>>>;
  publishedAt?: Maybe<Scalars['DateTime']>;
  socialIcons?: Maybe<Array<Maybe<ComponentMenuConfigMenuInput>>>;
  topMenu?: Maybe<Array<Maybe<ComponentMenuConfigMenuInput>>>;
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Change user password. Confirm with the current password. */
  changePassword?: Maybe<UsersPermissionsLoginPayload>;
  createCategory?: Maybe<CategoryEntityResponse>;
  createGallery?: Maybe<GalleryEntityResponse>;
  createPage?: Maybe<PageEntityResponse>;
  createPost?: Maybe<PostEntityResponse>;
  createPostCategory?: Maybe<PostCategoryEntityResponse>;
  createProduct?: Maybe<ProductEntityResponse>;
  createTag?: Maybe<TagEntityResponse>;
  /** Create a new role */
  createUsersPermissionsRole?: Maybe<UsersPermissionsCreateRolePayload>;
  /** Create a new user */
  createUsersPermissionsUser: UsersPermissionsUserEntityResponse;
  deleteCategory?: Maybe<CategoryEntityResponse>;
  deleteFooter?: Maybe<FooterEntityResponse>;
  deleteGallery?: Maybe<GalleryEntityResponse>;
  deleteMenu?: Maybe<MenuEntityResponse>;
  deletePage?: Maybe<PageEntityResponse>;
  deletePost?: Maybe<PostEntityResponse>;
  deletePostCategory?: Maybe<PostCategoryEntityResponse>;
  deleteProduct?: Maybe<ProductEntityResponse>;
  deleteTag?: Maybe<TagEntityResponse>;
  /** Delete an existing role */
  deleteUsersPermissionsRole?: Maybe<UsersPermissionsDeleteRolePayload>;
  /** Delete an existing user */
  deleteUsersPermissionsUser: UsersPermissionsUserEntityResponse;
  /** Confirm an email users email address */
  emailConfirmation?: Maybe<UsersPermissionsLoginPayload>;
  /** Request a reset password token */
  forgotPassword?: Maybe<UsersPermissionsPasswordPayload>;
  login: UsersPermissionsLoginPayload;
  multipleUpload: Array<Maybe<UploadFileEntityResponse>>;
  /** Register a user */
  register: UsersPermissionsLoginPayload;
  removeFile?: Maybe<UploadFileEntityResponse>;
  /** Reset user password. Confirm with a code (resetToken from forgotPassword) */
  resetPassword?: Maybe<UsersPermissionsLoginPayload>;
  updateCategory?: Maybe<CategoryEntityResponse>;
  updateFileInfo: UploadFileEntityResponse;
  updateFooter?: Maybe<FooterEntityResponse>;
  updateGallery?: Maybe<GalleryEntityResponse>;
  updateMenu?: Maybe<MenuEntityResponse>;
  updatePage?: Maybe<PageEntityResponse>;
  updatePost?: Maybe<PostEntityResponse>;
  updatePostCategory?: Maybe<PostCategoryEntityResponse>;
  updateProduct?: Maybe<ProductEntityResponse>;
  updateTag?: Maybe<TagEntityResponse>;
  /** Update an existing role */
  updateUsersPermissionsRole?: Maybe<UsersPermissionsUpdateRolePayload>;
  /** Update an existing user */
  updateUsersPermissionsUser: UsersPermissionsUserEntityResponse;
  upload: UploadFileEntityResponse;
  validateTokenForCategory?: Maybe<ValidationToken>;
};


export type MutationChangePasswordArgs = {
  currentPassword: Scalars['String'];
  password: Scalars['String'];
  passwordConfirmation: Scalars['String'];
};


export type MutationCreateCategoryArgs = {
  data: CategoryInput;
};


export type MutationCreateGalleryArgs = {
  data: GalleryInput;
};


export type MutationCreatePageArgs = {
  data: PageInput;
};


export type MutationCreatePostArgs = {
  data: PostInput;
};


export type MutationCreatePostCategoryArgs = {
  data: PostCategoryInput;
};


export type MutationCreateProductArgs = {
  data: ProductInput;
};


export type MutationCreateTagArgs = {
  data: TagInput;
};


export type MutationCreateUsersPermissionsRoleArgs = {
  data: UsersPermissionsRoleInput;
};


export type MutationCreateUsersPermissionsUserArgs = {
  data: UsersPermissionsUserInput;
};


export type MutationDeleteCategoryArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteGalleryArgs = {
  id: Scalars['ID'];
};


export type MutationDeletePageArgs = {
  id: Scalars['ID'];
};


export type MutationDeletePostArgs = {
  id: Scalars['ID'];
};


export type MutationDeletePostCategoryArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteProductArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteTagArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteUsersPermissionsRoleArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteUsersPermissionsUserArgs = {
  id: Scalars['ID'];
};


export type MutationEmailConfirmationArgs = {
  confirmation: Scalars['String'];
};


export type MutationForgotPasswordArgs = {
  email: Scalars['String'];
};


export type MutationLoginArgs = {
  input: UsersPermissionsLoginInput;
};


export type MutationMultipleUploadArgs = {
  field?: Maybe<Scalars['String']>;
  files: Array<Maybe<Scalars['Upload']>>;
  ref?: Maybe<Scalars['String']>;
  refId?: Maybe<Scalars['ID']>;
};


export type MutationRegisterArgs = {
  input: UsersPermissionsRegisterInput;
};


export type MutationRemoveFileArgs = {
  id: Scalars['ID'];
};


export type MutationResetPasswordArgs = {
  code: Scalars['String'];
  password: Scalars['String'];
  passwordConfirmation: Scalars['String'];
};


export type MutationUpdateCategoryArgs = {
  data: CategoryInput;
  id: Scalars['ID'];
};


export type MutationUpdateFileInfoArgs = {
  id: Scalars['ID'];
  info?: Maybe<FileInfoInput>;
};


export type MutationUpdateFooterArgs = {
  data: FooterInput;
};


export type MutationUpdateGalleryArgs = {
  data: GalleryInput;
  id: Scalars['ID'];
};


export type MutationUpdateMenuArgs = {
  data: MenuInput;
};


export type MutationUpdatePageArgs = {
  data: PageInput;
  id: Scalars['ID'];
};


export type MutationUpdatePostArgs = {
  data: PostInput;
  id: Scalars['ID'];
};


export type MutationUpdatePostCategoryArgs = {
  data: PostCategoryInput;
  id: Scalars['ID'];
};


export type MutationUpdateProductArgs = {
  data: ProductInput;
  id: Scalars['ID'];
};


export type MutationUpdateTagArgs = {
  data: TagInput;
  id: Scalars['ID'];
};


export type MutationUpdateUsersPermissionsRoleArgs = {
  data: UsersPermissionsRoleInput;
  id: Scalars['ID'];
};


export type MutationUpdateUsersPermissionsUserArgs = {
  data: UsersPermissionsUserInput;
  id: Scalars['ID'];
};


export type MutationUploadArgs = {
  field?: Maybe<Scalars['String']>;
  file: Scalars['Upload'];
  info?: Maybe<FileInfoInput>;
  ref?: Maybe<Scalars['String']>;
  refId?: Maybe<Scalars['ID']>;
};


export type MutationValidateTokenForCategoryArgs = {
  categorySlug?: Maybe<Scalars['String']>;
  token?: Maybe<Scalars['String']>;
};

export type Page = {
  __typename?: 'Page';
  content?: Maybe<Scalars['String']>;
  createdAt?: Maybe<Scalars['DateTime']>;
  id: Scalars['ID'];
  keywords?: Maybe<Scalars['String']>;
  slug?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
};

export type PageEntity = {
  __typename?: 'PageEntity';
  attributes?: Maybe<Page>;
  id?: Maybe<Scalars['ID']>;
};

export type PageEntityResponse = {
  __typename?: 'PageEntityResponse';
  data?: Maybe<PageEntity>;
};

export type PageInput = {
  content?: Maybe<Scalars['String']>;
  keywords?: Maybe<Scalars['String']>;
  slug?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
};

export type PaginationArg = {
  limit?: Maybe<Scalars['Int']>;
  page?: Maybe<Scalars['Int']>;
  pageSize?: Maybe<Scalars['Int']>;
  start?: Maybe<Scalars['Int']>;
};

export type Post = {
  __typename?: 'Post';
  category?: Maybe<PostCategoryEntityResponse>;
  content_position?: Maybe<Enum_Post_Content_Position>;
  content_type?: Maybe<Enum_Post_Content_Type>;
  coverImage?: Maybe<Array<Maybe<Image>>>;
  cover_image?: Maybe<UploadFileEntityResponse>;
  createdAt?: Maybe<Scalars['DateTime']>;
  description?: Maybe<Scalars['String']>;
  gallery?: Maybe<CategoryEntityResponse>;
  gallery_template?: Maybe<Enum_Post_Gallery_Template>;
  id: Scalars['ID'];
  image: UploadFileEntityResponse;
  keywords?: Maybe<Scalars['String']>;
  mainImage?: Maybe<Array<Maybe<Image>>>;
  permalink?: Maybe<Scalars['String']>;
  publicationDate: Scalars['DateTime'];
  publishedAt?: Maybe<Scalars['DateTime']>;
  seoDescription?: Maybe<Scalars['String']>;
  slug?: Maybe<Scalars['String']>;
  tags?: Maybe<TagRelationResponseCollection>;
  text?: Maybe<Scalars['String']>;
  title: Scalars['String'];
  updatedAt?: Maybe<Scalars['DateTime']>;
};


export type PostTagsArgs = {
  filters?: Maybe<TagFiltersInput>;
  pagination?: Maybe<PaginationArg>;
  sort?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type PostCategory = {
  __typename?: 'PostCategory';
  createdAt?: Maybe<Scalars['DateTime']>;
  description?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  keywords?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  slug?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
};

export type PostCategoryEntity = {
  __typename?: 'PostCategoryEntity';
  attributes?: Maybe<PostCategory>;
  id?: Maybe<Scalars['ID']>;
};

export type PostCategoryEntityResponse = {
  __typename?: 'PostCategoryEntityResponse';
  data?: Maybe<PostCategoryEntity>;
};

export type PostCategoryFiltersInput = {
  and?: Maybe<Array<Maybe<PostCategoryFiltersInput>>>;
  createdAt?: Maybe<DateTimeFilterInput>;
  description?: Maybe<StringFilterInput>;
  id?: Maybe<IdFilterInput>;
  keywords?: Maybe<StringFilterInput>;
  name?: Maybe<StringFilterInput>;
  not?: Maybe<PostCategoryFiltersInput>;
  or?: Maybe<Array<Maybe<PostCategoryFiltersInput>>>;
  slug?: Maybe<StringFilterInput>;
  updatedAt?: Maybe<DateTimeFilterInput>;
};

export type PostCategoryInput = {
  description?: Maybe<Scalars['String']>;
  keywords?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  slug?: Maybe<Scalars['String']>;
};

export type PostEntity = {
  __typename?: 'PostEntity';
  attributes?: Maybe<Post>;
  id?: Maybe<Scalars['ID']>;
};

export type PostEntityResponse = {
  __typename?: 'PostEntityResponse';
  data?: Maybe<PostEntity>;
};

export type PostFiltersInput = {
  and?: Maybe<Array<Maybe<PostFiltersInput>>>;
  category?: Maybe<PostCategoryFiltersInput>;
  content_position?: Maybe<StringFilterInput>;
  content_type?: Maybe<StringFilterInput>;
  cover_image_preset?: Maybe<StringFilterInput>;
  createdAt?: Maybe<DateTimeFilterInput>;
  description?: Maybe<StringFilterInput>;
  gallery?: Maybe<CategoryFiltersInput>;
  gallery_template?: Maybe<StringFilterInput>;
  id?: Maybe<IdFilterInput>;
  keywords?: Maybe<StringFilterInput>;
  not?: Maybe<PostFiltersInput>;
  or?: Maybe<Array<Maybe<PostFiltersInput>>>;
  permalink?: Maybe<StringFilterInput>;
  post_image_preset?: Maybe<StringFilterInput>;
  publicationDate?: Maybe<DateTimeFilterInput>;
  publishedAt?: Maybe<DateTimeFilterInput>;
  slug?: Maybe<StringFilterInput>;
  tags?: Maybe<TagFiltersInput>;
  text?: Maybe<StringFilterInput>;
  title?: Maybe<StringFilterInput>;
  updatedAt?: Maybe<DateTimeFilterInput>;
};

export type PostInput = {
  category?: Maybe<Scalars['ID']>;
  content_position?: Maybe<Enum_Post_Content_Position>;
  content_type?: Maybe<Enum_Post_Content_Type>;
  cover_image?: Maybe<Scalars['ID']>;
  cover_image_preset?: Maybe<Enum_Post_Cover_Image_Preset>;
  description?: Maybe<Scalars['String']>;
  gallery?: Maybe<Scalars['ID']>;
  gallery_template?: Maybe<Enum_Post_Gallery_Template>;
  image?: Maybe<Scalars['ID']>;
  keywords?: Maybe<Scalars['String']>;
  permalink?: Maybe<Scalars['String']>;
  post_image_preset?: Maybe<Enum_Post_Post_Image_Preset>;
  publicationDate?: Maybe<Scalars['DateTime']>;
  publishedAt?: Maybe<Scalars['DateTime']>;
  slug?: Maybe<Scalars['String']>;
  tags?: Maybe<Array<Maybe<Scalars['ID']>>>;
  text?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
};

export type PostRelationResponseCollection = {
  __typename?: 'PostRelationResponseCollection';
  data: Array<PostEntity>;
};

export type Product = {
  __typename?: 'Product';
  availability?: Maybe<Enum_Product_Availability>;
  createdAt?: Maybe<Scalars['DateTime']>;
  description?: Maybe<Scalars['String']>;
  dimensions?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  images?: Maybe<UploadFileRelationResponseCollection>;
  material?: Maybe<Enum_Product_Material>;
  name: Scalars['String'];
  price?: Maybe<Scalars['Float']>;
  publicationDate: Scalars['DateTime'];
  slug?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
};


export type ProductImagesArgs = {
  filters?: Maybe<UploadFileFiltersInput>;
  pagination?: Maybe<PaginationArg>;
  sort?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type ProductEntity = {
  __typename?: 'ProductEntity';
  attributes?: Maybe<Product>;
  id?: Maybe<Scalars['ID']>;
};

export type ProductEntityResponse = {
  __typename?: 'ProductEntityResponse';
  data?: Maybe<ProductEntity>;
};

export type ProductInput = {
  availability?: Maybe<Enum_Product_Availability>;
  description?: Maybe<Scalars['String']>;
  dimensions?: Maybe<Scalars['String']>;
  images?: Maybe<Array<Maybe<Scalars['ID']>>>;
  material?: Maybe<Enum_Product_Material>;
  name?: Maybe<Scalars['String']>;
  price?: Maybe<Scalars['Float']>;
  publicationDate?: Maybe<Scalars['DateTime']>;
  slug?: Maybe<Scalars['String']>;
};

export enum PublicationState {
  Live = 'LIVE',
  Preview = 'PREVIEW'
}

export type Query = {
  __typename?: 'Query';
  categories?: Maybe<Array<Maybe<Category>>>;
  categoriesCount: Scalars['Int'];
  categoryBySlug?: Maybe<Category>;
  footer?: Maybe<Footer>;
  galleryBySlug?: Maybe<Gallery>;
  galleryMenu?: Maybe<GalleryCategories>;
  me?: Maybe<UsersPermissionsMe>;
  menu?: Maybe<Menu>;
  page?: Maybe<Page>;
  pageBySlug?: Maybe<Page>;
  post?: Maybe<Post>;
  postByPermalink?: Maybe<Post>;
  postBySlug?: Maybe<Post>;
  postCategories?: Maybe<Array<Maybe<PostCategory>>>;
  postCategoryBySlug?: Maybe<PostCategory>;
  posts?: Maybe<Array<Maybe<Post>>>;
  postsCount: Scalars['Int'];
  prevNextPost?: Maybe<Array<Maybe<Post>>>;
  products?: Maybe<Array<Maybe<Product>>>;
  productsCount: Scalars['Int'];
  recentImages?: Maybe<Array<Maybe<UploadFile>>>;
  relatedPosts?: Maybe<Array<Maybe<Post>>>;
  tag?: Maybe<Tag>;
  tagBySlug?: Maybe<Tag>;
  tags?: Maybe<Array<Maybe<Tag>>>;
};


export type QueryCategoriesArgs = {
  limit?: Maybe<Scalars['Int']>;
  sort?: Maybe<Scalars['String']>;
  start?: Maybe<Scalars['Int']>;
  where?: Maybe<Scalars['JSON']>;
};


export type QueryCategoriesCountArgs = {
  where?: Maybe<Scalars['JSON']>;
};


export type QueryCategoryBySlugArgs = {
  slug?: Maybe<Scalars['String']>;
};


export type QueryGalleryBySlugArgs = {
  slug?: Maybe<Scalars['String']>;
};


export type QueryGalleryMenuArgs = {
  slug?: Maybe<Scalars['String']>;
};


export type QueryPageArgs = {
  id: Scalars['ID'];
};


export type QueryPageBySlugArgs = {
  slug?: Maybe<Scalars['String']>;
};


export type QueryPostArgs = {
  id: Scalars['ID'];
};


export type QueryPostByPermalinkArgs = {
  permalink?: Maybe<Scalars['String']>;
};


export type QueryPostBySlugArgs = {
  slug?: Maybe<Scalars['String']>;
};


export type QueryPostCategoryBySlugArgs = {
  slug?: Maybe<Scalars['String']>;
};


export type QueryPostsArgs = {
  limit?: Maybe<Scalars['Int']>;
  sort?: Maybe<Scalars['String']>;
  start?: Maybe<Scalars['Int']>;
  where?: Maybe<Scalars['JSON']>;
};


export type QueryPostsCountArgs = {
  where?: Maybe<Scalars['JSON']>;
};


export type QueryPrevNextPostArgs = {
  slug?: Maybe<Scalars['String']>;
};


export type QueryProductsArgs = {
  limit?: Maybe<Scalars['Int']>;
  sort?: Maybe<Scalars['String']>;
  start?: Maybe<Scalars['Int']>;
  where?: Maybe<Scalars['JSON']>;
};


export type QueryProductsCountArgs = {
  where?: Maybe<Scalars['JSON']>;
};


export type QueryRecentImagesArgs = {
  limit?: Maybe<Scalars['Int']>;
};


export type QueryRelatedPostsArgs = {
  slug?: Maybe<Scalars['String']>;
};


export type QueryTagArgs = {
  id: Scalars['ID'];
};


export type QueryTagBySlugArgs = {
  slug?: Maybe<Scalars['String']>;
};


export type QueryTagsArgs = {
  limit?: Maybe<Scalars['Int']>;
  sort?: Maybe<Scalars['String']>;
  start?: Maybe<Scalars['Int']>;
  where?: Maybe<Scalars['JSON']>;
};

export type StringFilterInput = {
  and?: Maybe<Array<Maybe<Scalars['String']>>>;
  between?: Maybe<Array<Maybe<Scalars['String']>>>;
  contains?: Maybe<Scalars['String']>;
  containsi?: Maybe<Scalars['String']>;
  endsWith?: Maybe<Scalars['String']>;
  eq?: Maybe<Scalars['String']>;
  eqi?: Maybe<Scalars['String']>;
  gt?: Maybe<Scalars['String']>;
  gte?: Maybe<Scalars['String']>;
  in?: Maybe<Array<Maybe<Scalars['String']>>>;
  lt?: Maybe<Scalars['String']>;
  lte?: Maybe<Scalars['String']>;
  ne?: Maybe<Scalars['String']>;
  nei?: Maybe<Scalars['String']>;
  not?: Maybe<StringFilterInput>;
  notContains?: Maybe<Scalars['String']>;
  notContainsi?: Maybe<Scalars['String']>;
  notIn?: Maybe<Array<Maybe<Scalars['String']>>>;
  notNull?: Maybe<Scalars['Boolean']>;
  null?: Maybe<Scalars['Boolean']>;
  or?: Maybe<Array<Maybe<Scalars['String']>>>;
  startsWith?: Maybe<Scalars['String']>;
};

export type Tag = {
  __typename?: 'Tag';
  createdAt?: Maybe<Scalars['DateTime']>;
  id: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  posts?: Maybe<PostRelationResponseCollection>;
  slug?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
};


export type TagPostsArgs = {
  filters?: Maybe<PostFiltersInput>;
  pagination?: Maybe<PaginationArg>;
  publicationState?: Maybe<PublicationState>;
  sort?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type TagEntity = {
  __typename?: 'TagEntity';
  attributes?: Maybe<Tag>;
  id?: Maybe<Scalars['ID']>;
};

export type TagEntityResponse = {
  __typename?: 'TagEntityResponse';
  data?: Maybe<TagEntity>;
};

export type TagFiltersInput = {
  and?: Maybe<Array<Maybe<TagFiltersInput>>>;
  createdAt?: Maybe<DateTimeFilterInput>;
  id?: Maybe<IdFilterInput>;
  name?: Maybe<StringFilterInput>;
  not?: Maybe<TagFiltersInput>;
  or?: Maybe<Array<Maybe<TagFiltersInput>>>;
  posts?: Maybe<PostFiltersInput>;
  slug?: Maybe<StringFilterInput>;
  updatedAt?: Maybe<DateTimeFilterInput>;
};

export type TagInput = {
  name?: Maybe<Scalars['String']>;
  posts?: Maybe<Array<Maybe<Scalars['ID']>>>;
  slug?: Maybe<Scalars['String']>;
};

export type TagRelationResponseCollection = {
  __typename?: 'TagRelationResponseCollection';
  data: Array<TagEntity>;
};


export type UploadFile = {
  __typename?: 'UploadFile';
  alternativeText?: Maybe<Scalars['String']>;
  caption?: Maybe<Scalars['String']>;
  createdAt?: Maybe<Scalars['DateTime']>;
  ext?: Maybe<Scalars['String']>;
  formats?: Maybe<Scalars['JSON']>;
  hash: Scalars['String'];
  height?: Maybe<Scalars['Int']>;
  id: Scalars['ID'];
  matchingThumbnails?: Maybe<Array<Maybe<Image>>>;
  mime: Scalars['String'];
  name: Scalars['String'];
  previewUrl?: Maybe<Scalars['String']>;
  provider: Scalars['String'];
  provider_metadata?: Maybe<Scalars['JSON']>;
  related?: Maybe<Array<Maybe<GenericMorph>>>;
  size: Scalars['Float'];
  thumbnail?: Maybe<Image>;
  thumbnails?: Maybe<Array<Maybe<Image>>>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  url: Scalars['String'];
  width?: Maybe<Scalars['Int']>;
};


export type UploadFileMatchingThumbnailsArgs = {
  preset?: Maybe<Scalars['String']>;
};


export type UploadFileThumbnailArgs = {
  webp?: Maybe<Scalars['Boolean']>;
  width?: Maybe<Scalars['Int']>;
};

export type UploadFileEntity = {
  __typename?: 'UploadFileEntity';
  attributes?: Maybe<UploadFile>;
  id?: Maybe<Scalars['ID']>;
};

export type UploadFileEntityResponse = {
  __typename?: 'UploadFileEntityResponse';
  data?: Maybe<UploadFileEntity>;
};

export type UploadFileFiltersInput = {
  alternativeText?: Maybe<StringFilterInput>;
  and?: Maybe<Array<Maybe<UploadFileFiltersInput>>>;
  caption?: Maybe<StringFilterInput>;
  createdAt?: Maybe<DateTimeFilterInput>;
  ext?: Maybe<StringFilterInput>;
  folder?: Maybe<UploadFolderFiltersInput>;
  folderPath?: Maybe<StringFilterInput>;
  formats?: Maybe<JsonFilterInput>;
  hash?: Maybe<StringFilterInput>;
  height?: Maybe<IntFilterInput>;
  id?: Maybe<IdFilterInput>;
  mime?: Maybe<StringFilterInput>;
  name?: Maybe<StringFilterInput>;
  not?: Maybe<UploadFileFiltersInput>;
  or?: Maybe<Array<Maybe<UploadFileFiltersInput>>>;
  path?: Maybe<StringFilterInput>;
  previewUrl?: Maybe<StringFilterInput>;
  provider?: Maybe<StringFilterInput>;
  provider_metadata?: Maybe<JsonFilterInput>;
  size?: Maybe<FloatFilterInput>;
  updatedAt?: Maybe<DateTimeFilterInput>;
  url?: Maybe<StringFilterInput>;
  width?: Maybe<IntFilterInput>;
};

export type UploadFileRelationResponseCollection = {
  __typename?: 'UploadFileRelationResponseCollection';
  data: Array<UploadFileEntity>;
};

export type UploadFolder = {
  __typename?: 'UploadFolder';
  children?: Maybe<UploadFolderRelationResponseCollection>;
  createdAt?: Maybe<Scalars['DateTime']>;
  files?: Maybe<UploadFileRelationResponseCollection>;
  name: Scalars['String'];
  parent?: Maybe<UploadFolderEntityResponse>;
  path: Scalars['String'];
  pathId: Scalars['Int'];
  updatedAt?: Maybe<Scalars['DateTime']>;
};


export type UploadFolderChildrenArgs = {
  filters?: Maybe<UploadFolderFiltersInput>;
  pagination?: Maybe<PaginationArg>;
  sort?: Maybe<Array<Maybe<Scalars['String']>>>;
};


export type UploadFolderFilesArgs = {
  filters?: Maybe<UploadFileFiltersInput>;
  pagination?: Maybe<PaginationArg>;
  sort?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type UploadFolderEntity = {
  __typename?: 'UploadFolderEntity';
  attributes?: Maybe<UploadFolder>;
  id?: Maybe<Scalars['ID']>;
};

export type UploadFolderEntityResponse = {
  __typename?: 'UploadFolderEntityResponse';
  data?: Maybe<UploadFolderEntity>;
};

export type UploadFolderFiltersInput = {
  and?: Maybe<Array<Maybe<UploadFolderFiltersInput>>>;
  children?: Maybe<UploadFolderFiltersInput>;
  createdAt?: Maybe<DateTimeFilterInput>;
  files?: Maybe<UploadFileFiltersInput>;
  id?: Maybe<IdFilterInput>;
  name?: Maybe<StringFilterInput>;
  not?: Maybe<UploadFolderFiltersInput>;
  or?: Maybe<Array<Maybe<UploadFolderFiltersInput>>>;
  parent?: Maybe<UploadFolderFiltersInput>;
  path?: Maybe<StringFilterInput>;
  pathId?: Maybe<IntFilterInput>;
  updatedAt?: Maybe<DateTimeFilterInput>;
};

export type UploadFolderRelationResponseCollection = {
  __typename?: 'UploadFolderRelationResponseCollection';
  data: Array<UploadFolderEntity>;
};

export type UsersPermissionsCreateRolePayload = {
  __typename?: 'UsersPermissionsCreateRolePayload';
  ok: Scalars['Boolean'];
};

export type UsersPermissionsDeleteRolePayload = {
  __typename?: 'UsersPermissionsDeleteRolePayload';
  ok: Scalars['Boolean'];
};

export type UsersPermissionsLoginInput = {
  identifier: Scalars['String'];
  password: Scalars['String'];
  provider?: Scalars['String'];
};

export type UsersPermissionsLoginPayload = {
  __typename?: 'UsersPermissionsLoginPayload';
  jwt?: Maybe<Scalars['String']>;
  user: UsersPermissionsMe;
};

export type UsersPermissionsMe = {
  __typename?: 'UsersPermissionsMe';
  blocked?: Maybe<Scalars['Boolean']>;
  confirmed?: Maybe<Scalars['Boolean']>;
  email?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  role?: Maybe<UsersPermissionsMeRole>;
  username: Scalars['String'];
};

export type UsersPermissionsMeRole = {
  __typename?: 'UsersPermissionsMeRole';
  description?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  name: Scalars['String'];
  type?: Maybe<Scalars['String']>;
};

export type UsersPermissionsPasswordPayload = {
  __typename?: 'UsersPermissionsPasswordPayload';
  ok: Scalars['Boolean'];
};

export type UsersPermissionsPermission = {
  __typename?: 'UsersPermissionsPermission';
  action: Scalars['String'];
  createdAt?: Maybe<Scalars['DateTime']>;
  role?: Maybe<UsersPermissionsRoleEntityResponse>;
  updatedAt?: Maybe<Scalars['DateTime']>;
};

export type UsersPermissionsPermissionEntity = {
  __typename?: 'UsersPermissionsPermissionEntity';
  attributes?: Maybe<UsersPermissionsPermission>;
  id?: Maybe<Scalars['ID']>;
};

export type UsersPermissionsPermissionFiltersInput = {
  action?: Maybe<StringFilterInput>;
  and?: Maybe<Array<Maybe<UsersPermissionsPermissionFiltersInput>>>;
  createdAt?: Maybe<DateTimeFilterInput>;
  id?: Maybe<IdFilterInput>;
  not?: Maybe<UsersPermissionsPermissionFiltersInput>;
  or?: Maybe<Array<Maybe<UsersPermissionsPermissionFiltersInput>>>;
  role?: Maybe<UsersPermissionsRoleFiltersInput>;
  updatedAt?: Maybe<DateTimeFilterInput>;
};

export type UsersPermissionsPermissionRelationResponseCollection = {
  __typename?: 'UsersPermissionsPermissionRelationResponseCollection';
  data: Array<UsersPermissionsPermissionEntity>;
};

export type UsersPermissionsRegisterInput = {
  email: Scalars['String'];
  password: Scalars['String'];
  username: Scalars['String'];
};

export type UsersPermissionsRole = {
  __typename?: 'UsersPermissionsRole';
  createdAt?: Maybe<Scalars['DateTime']>;
  description?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  permissions?: Maybe<UsersPermissionsPermissionRelationResponseCollection>;
  type?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  users?: Maybe<UsersPermissionsUserRelationResponseCollection>;
};


export type UsersPermissionsRolePermissionsArgs = {
  filters?: Maybe<UsersPermissionsPermissionFiltersInput>;
  pagination?: Maybe<PaginationArg>;
  sort?: Maybe<Array<Maybe<Scalars['String']>>>;
};


export type UsersPermissionsRoleUsersArgs = {
  filters?: Maybe<UsersPermissionsUserFiltersInput>;
  pagination?: Maybe<PaginationArg>;
  sort?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type UsersPermissionsRoleEntity = {
  __typename?: 'UsersPermissionsRoleEntity';
  attributes?: Maybe<UsersPermissionsRole>;
  id?: Maybe<Scalars['ID']>;
};

export type UsersPermissionsRoleEntityResponse = {
  __typename?: 'UsersPermissionsRoleEntityResponse';
  data?: Maybe<UsersPermissionsRoleEntity>;
};

export type UsersPermissionsRoleFiltersInput = {
  and?: Maybe<Array<Maybe<UsersPermissionsRoleFiltersInput>>>;
  createdAt?: Maybe<DateTimeFilterInput>;
  description?: Maybe<StringFilterInput>;
  id?: Maybe<IdFilterInput>;
  name?: Maybe<StringFilterInput>;
  not?: Maybe<UsersPermissionsRoleFiltersInput>;
  or?: Maybe<Array<Maybe<UsersPermissionsRoleFiltersInput>>>;
  permissions?: Maybe<UsersPermissionsPermissionFiltersInput>;
  type?: Maybe<StringFilterInput>;
  updatedAt?: Maybe<DateTimeFilterInput>;
  users?: Maybe<UsersPermissionsUserFiltersInput>;
};

export type UsersPermissionsRoleInput = {
  description?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  permissions?: Maybe<Array<Maybe<Scalars['ID']>>>;
  type?: Maybe<Scalars['String']>;
  users?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

export type UsersPermissionsUpdateRolePayload = {
  __typename?: 'UsersPermissionsUpdateRolePayload';
  ok: Scalars['Boolean'];
};

export type UsersPermissionsUser = {
  __typename?: 'UsersPermissionsUser';
  blocked?: Maybe<Scalars['Boolean']>;
  confirmed?: Maybe<Scalars['Boolean']>;
  createdAt?: Maybe<Scalars['DateTime']>;
  email: Scalars['String'];
  provider?: Maybe<Scalars['String']>;
  role?: Maybe<UsersPermissionsRoleEntityResponse>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  username: Scalars['String'];
};

export type UsersPermissionsUserEntity = {
  __typename?: 'UsersPermissionsUserEntity';
  attributes?: Maybe<UsersPermissionsUser>;
  id?: Maybe<Scalars['ID']>;
};

export type UsersPermissionsUserEntityResponse = {
  __typename?: 'UsersPermissionsUserEntityResponse';
  data?: Maybe<UsersPermissionsUserEntity>;
};

export type UsersPermissionsUserFiltersInput = {
  and?: Maybe<Array<Maybe<UsersPermissionsUserFiltersInput>>>;
  blocked?: Maybe<BooleanFilterInput>;
  confirmationToken?: Maybe<StringFilterInput>;
  confirmed?: Maybe<BooleanFilterInput>;
  createdAt?: Maybe<DateTimeFilterInput>;
  email?: Maybe<StringFilterInput>;
  id?: Maybe<IdFilterInput>;
  not?: Maybe<UsersPermissionsUserFiltersInput>;
  or?: Maybe<Array<Maybe<UsersPermissionsUserFiltersInput>>>;
  password?: Maybe<StringFilterInput>;
  provider?: Maybe<StringFilterInput>;
  resetPasswordToken?: Maybe<StringFilterInput>;
  role?: Maybe<UsersPermissionsRoleFiltersInput>;
  updatedAt?: Maybe<DateTimeFilterInput>;
  username?: Maybe<StringFilterInput>;
};

export type UsersPermissionsUserInput = {
  blocked?: Maybe<Scalars['Boolean']>;
  confirmationToken?: Maybe<Scalars['String']>;
  confirmed?: Maybe<Scalars['Boolean']>;
  email?: Maybe<Scalars['String']>;
  password?: Maybe<Scalars['String']>;
  provider?: Maybe<Scalars['String']>;
  resetPasswordToken?: Maybe<Scalars['String']>;
  role?: Maybe<Scalars['ID']>;
  username?: Maybe<Scalars['String']>;
};

export type UsersPermissionsUserRelationResponseCollection = {
  __typename?: 'UsersPermissionsUserRelationResponseCollection';
  data: Array<UsersPermissionsUserEntity>;
};

export type ValidationToken = {
  __typename?: 'ValidationToken';
  token?: Maybe<Scalars['String']>;
  valid: Scalars['Boolean'];
};
