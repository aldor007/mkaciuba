/* eslint-disable @typescript-eslint/no-explicit-any */
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
  text?: Maybe<Scalars['String']>;
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

export type CategoryConnectionText = {
  __typename?: 'CategoryConnectionText';
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
  text?: Maybe<Array<Maybe<CategoryConnectionText>>>;
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
  text?: Maybe<Scalars['String']>;
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
  image?: Maybe<UploadFile>;
};

export type ComponentMenuConfigMenuInput = {
  name?: Maybe<Scalars['String']>;
  url?: Maybe<Scalars['String']>;
  icon?: Maybe<Enum_Componentmenuconfigmenu_Icon>;
  image?: Maybe<Scalars['ID']>;
};



export enum Enum_Componentmenuconfigmenu_Icon {
  None = 'none',
  Facebook = 'facebook',
  Instagram = 'instagram',
  Github = 'github',
  Linkedin = 'linkedin'
}

export enum Enum_Post_Content_Position {
  Top = 'top',
  Bottom = 'bottom'
}

export enum Enum_Post_Content_Type {
  Html = 'HTML',
  Markdown = 'MARKDOWN'
}

export enum Enum_Post_Cover_Image_Preset {
  Coverimg = 'coverimg',
  CoverS = 'cover_s'
}

export enum Enum_Post_Gallery_Template {
  Normal = 'normal',
  Description = 'description'
}

export enum Enum_Post_Post_Image_Preset {
  Postlist = 'postlist',
  PostimgAc = 'postimg_ac'
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
  name: Scalars['String'];
  slug: Scalars['String'];
  slugOverride?: Maybe<Scalars['String']>;
  public?: Maybe<Scalars['Boolean']>;
  keywords?: Maybe<Scalars['String']>;
  description: Scalars['String'];
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
  name: Scalars['String'];
  slug: Scalars['String'];
  slugOverride?: Maybe<Scalars['String']>;
  public?: Maybe<Scalars['Boolean']>;
  categories?: Maybe<Array<Maybe<Scalars['ID']>>>;
  keywords?: Maybe<Scalars['String']>;
  description: Scalars['String'];
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

export type Morph = UsersPermissionsMe | UsersPermissionsMeRole | UsersPermissionsLoginPayload | UserPermissionsPasswordPayload | Image | ValidationToken | GalleryCategories | Category | CategoryConnection | CategoryAggregator | CategoryGroupBy | CategoryConnectionId | CategoryConnectionCreated_At | CategoryConnectionUpdated_At | CategoryConnectionName | CategoryConnectionSlug | CategoryConnectionSlugOverride | CategoryConnectionPublic | CategoryConnectionPublicationDate | CategoryConnectionFile | CategoryConnectionImage | CategoryConnectionGallery | CategoryConnectionKeywords | CategoryConnectionDescription | CategoryConnectionText | CreateCategoryPayload | UpdateCategoryPayload | DeleteCategoryPayload | Footer | UpdateFooterPayload | DeleteFooterPayload | Gallery | CreateGalleryPayload | UpdateGalleryPayload | DeleteGalleryPayload | Menu | UpdateMenuPayload | DeleteMenuPayload | Page | CreatePagePayload | UpdatePagePayload | DeletePagePayload | PostCategory | PostCategoryConnection | PostCategoryAggregator | PostCategoryGroupBy | PostCategoryConnectionId | PostCategoryConnectionCreated_At | PostCategoryConnectionUpdated_At | PostCategoryConnectionName | PostCategoryConnectionSlug | PostCategoryConnectionKeywords | PostCategoryConnectionDescription | CreatePostCategoryPayload | UpdatePostCategoryPayload | DeletePostCategoryPayload | Post | PostConnection | PostAggregator | PostGroupBy | PostConnectionId | PostConnectionCreated_At | PostConnectionUpdated_At | PostConnectionText | PostConnectionTitle | PostConnectionPublicationDate | PostConnectionGallery | PostConnectionImage | PostConnectionKeywords | PostConnectionDescription | PostConnectionCategory | PostConnectionSlug | PostConnectionPermalink | PostConnectionContent_Position | PostConnectionGallery_Template | PostConnectionCover_Image | PostConnectionContent_Type | PostConnectionPublished_At | CreatePostPayload | UpdatePostPayload | DeletePostPayload | Tag | TagConnection | TagAggregator | TagGroupBy | TagConnectionId | TagConnectionCreated_At | TagConnectionUpdated_At | TagConnectionName | TagConnectionSlug | CreateTagPayload | UpdateTagPayload | DeleteTagPayload | UploadFile | UsersPermissionsPermission | UsersPermissionsRole | UsersPermissionsUser | CreateUserPayload | UpdateUserPayload | ComponentMenuConfigMenu;

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
  createPage?: Maybe<CreatePagePayload>;
  updatePage?: Maybe<UpdatePagePayload>;
  deletePage?: Maybe<DeletePagePayload>;
  createPostCategory?: Maybe<CreatePostCategoryPayload>;
  updatePostCategory?: Maybe<UpdatePostCategoryPayload>;
  deletePostCategory?: Maybe<DeletePostCategoryPayload>;
  createPost?: Maybe<CreatePostPayload>;
  updatePost?: Maybe<UpdatePostPayload>;
  deletePost?: Maybe<DeletePostPayload>;
  createTag?: Maybe<CreateTagPayload>;
  updateTag?: Maybe<UpdateTagPayload>;
  deleteTag?: Maybe<DeleteTagPayload>;
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


export type MutationCreatePageArgs = {
  input?: Maybe<CreatePageInput>;
};


export type MutationUpdatePageArgs = {
  input?: Maybe<UpdatePageInput>;
};


export type MutationDeletePageArgs = {
  input?: Maybe<DeletePageInput>;
};


export type MutationCreatePostCategoryArgs = {
  input?: Maybe<CreatePostCategoryInput>;
};


export type MutationUpdatePostCategoryArgs = {
  input?: Maybe<UpdatePostCategoryInput>;
};


export type MutationDeletePostCategoryArgs = {
  input?: Maybe<DeletePostCategoryInput>;
};


export type MutationCreatePostArgs = {
  input?: Maybe<CreatePostInput>;
};


export type MutationUpdatePostArgs = {
  input?: Maybe<UpdatePostInput>;
};


export type MutationDeletePostArgs = {
  input?: Maybe<DeletePostInput>;
};


export type MutationCreateTagArgs = {
  input?: Maybe<CreateTagInput>;
};


export type MutationUpdateTagArgs = {
  input?: Maybe<UpdateTagInput>;
};


export type MutationDeleteTagArgs = {
  input?: Maybe<DeleteTagInput>;
};


export type MutationValidateTokenForCategoryArgs = {
  token?: Maybe<Scalars['String']>;
  categorySlug?: Maybe<Scalars['String']>;
};

export type Page = {
  __typename?: 'Page';
  id: Scalars['ID'];
  created_at: Scalars['DateTime'];
  updated_at: Scalars['DateTime'];
  slug?: Maybe<Scalars['String']>;
  content?: Maybe<Scalars['String']>;
  keywords?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
};

export type PageInput = {
  slug?: Maybe<Scalars['String']>;
  content?: Maybe<Scalars['String']>;
  keywords?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  created_by?: Maybe<Scalars['ID']>;
  updated_by?: Maybe<Scalars['ID']>;
};

export type Post = {
  __typename?: 'Post';
  id: Scalars['ID'];
  created_at: Scalars['DateTime'];
  updated_at: Scalars['DateTime'];
  text?: Maybe<Scalars['String']>;
  title: Scalars['String'];
  publicationDate: Scalars['DateTime'];
  gallery?: Maybe<Category>;
  image?: Maybe<UploadFile>;
  keywords?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  category?: Maybe<PostCategory>;
  slug?: Maybe<Scalars['String']>;
  permalink?: Maybe<Scalars['String']>;
  content_position?: Maybe<Enum_Post_Content_Position>;
  gallery_template?: Maybe<Enum_Post_Gallery_Template>;
  cover_image?: Maybe<UploadFile>;
  content_type?: Maybe<Enum_Post_Content_Type>;
  published_at?: Maybe<Scalars['DateTime']>;
  tags?: Maybe<Array<Maybe<Tag>>>;
  mainImage?: Maybe<Array<Maybe<Image>>>;
  coverImage?: Maybe<Array<Maybe<Image>>>;
  seoDescription?: Maybe<Scalars['String']>;
};


export type PostTagsArgs = {
  sort?: Maybe<Scalars['String']>;
  limit?: Maybe<Scalars['Int']>;
  start?: Maybe<Scalars['Int']>;
  where?: Maybe<Scalars['JSON']>;
};

export type PostAggregator = {
  __typename?: 'PostAggregator';
  count?: Maybe<Scalars['Int']>;
  totalCount?: Maybe<Scalars['Int']>;
};

export type PostCategory = {
  __typename?: 'PostCategory';
  id: Scalars['ID'];
  created_at: Scalars['DateTime'];
  updated_at: Scalars['DateTime'];
  name: Scalars['String'];
  slug?: Maybe<Scalars['String']>;
  keywords?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
};

export type PostCategoryAggregator = {
  __typename?: 'PostCategoryAggregator';
  count?: Maybe<Scalars['Int']>;
  totalCount?: Maybe<Scalars['Int']>;
};

export type PostCategoryConnection = {
  __typename?: 'PostCategoryConnection';
  values?: Maybe<Array<Maybe<PostCategory>>>;
  groupBy?: Maybe<PostCategoryGroupBy>;
  aggregate?: Maybe<PostCategoryAggregator>;
};

export type PostCategoryConnectionCreated_At = {
  __typename?: 'PostCategoryConnectionCreated_at';
  key?: Maybe<Scalars['DateTime']>;
  connection?: Maybe<PostCategoryConnection>;
};

export type PostCategoryConnectionDescription = {
  __typename?: 'PostCategoryConnectionDescription';
  key?: Maybe<Scalars['String']>;
  connection?: Maybe<PostCategoryConnection>;
};

export type PostCategoryConnectionId = {
  __typename?: 'PostCategoryConnectionId';
  key?: Maybe<Scalars['ID']>;
  connection?: Maybe<PostCategoryConnection>;
};

export type PostCategoryConnectionKeywords = {
  __typename?: 'PostCategoryConnectionKeywords';
  key?: Maybe<Scalars['String']>;
  connection?: Maybe<PostCategoryConnection>;
};

export type PostCategoryConnectionName = {
  __typename?: 'PostCategoryConnectionName';
  key?: Maybe<Scalars['String']>;
  connection?: Maybe<PostCategoryConnection>;
};

export type PostCategoryConnectionSlug = {
  __typename?: 'PostCategoryConnectionSlug';
  key?: Maybe<Scalars['String']>;
  connection?: Maybe<PostCategoryConnection>;
};

export type PostCategoryConnectionUpdated_At = {
  __typename?: 'PostCategoryConnectionUpdated_at';
  key?: Maybe<Scalars['DateTime']>;
  connection?: Maybe<PostCategoryConnection>;
};

export type PostCategoryGroupBy = {
  __typename?: 'PostCategoryGroupBy';
  id?: Maybe<Array<Maybe<PostCategoryConnectionId>>>;
  created_at?: Maybe<Array<Maybe<PostCategoryConnectionCreated_At>>>;
  updated_at?: Maybe<Array<Maybe<PostCategoryConnectionUpdated_At>>>;
  name?: Maybe<Array<Maybe<PostCategoryConnectionName>>>;
  slug?: Maybe<Array<Maybe<PostCategoryConnectionSlug>>>;
  keywords?: Maybe<Array<Maybe<PostCategoryConnectionKeywords>>>;
  description?: Maybe<Array<Maybe<PostCategoryConnectionDescription>>>;
};

export type PostCategoryInput = {
  name: Scalars['String'];
  slug?: Maybe<Scalars['String']>;
  keywords?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  created_by?: Maybe<Scalars['ID']>;
  updated_by?: Maybe<Scalars['ID']>;
};

export type PostConnection = {
  __typename?: 'PostConnection';
  values?: Maybe<Array<Maybe<Post>>>;
  groupBy?: Maybe<PostGroupBy>;
  aggregate?: Maybe<PostAggregator>;
};

export type PostConnectionCategory = {
  __typename?: 'PostConnectionCategory';
  key?: Maybe<Scalars['ID']>;
  connection?: Maybe<PostConnection>;
};

export type PostConnectionContent_Position = {
  __typename?: 'PostConnectionContent_position';
  key?: Maybe<Scalars['String']>;
  connection?: Maybe<PostConnection>;
};

export type PostConnectionContent_Type = {
  __typename?: 'PostConnectionContent_type';
  key?: Maybe<Scalars['String']>;
  connection?: Maybe<PostConnection>;
};

export type PostConnectionCover_Image = {
  __typename?: 'PostConnectionCover_image';
  key?: Maybe<Scalars['ID']>;
  connection?: Maybe<PostConnection>;
};

export type PostConnectionCreated_At = {
  __typename?: 'PostConnectionCreated_at';
  key?: Maybe<Scalars['DateTime']>;
  connection?: Maybe<PostConnection>;
};

export type PostConnectionDescription = {
  __typename?: 'PostConnectionDescription';
  key?: Maybe<Scalars['String']>;
  connection?: Maybe<PostConnection>;
};

export type PostConnectionGallery = {
  __typename?: 'PostConnectionGallery';
  key?: Maybe<Scalars['ID']>;
  connection?: Maybe<PostConnection>;
};

export type PostConnectionGallery_Template = {
  __typename?: 'PostConnectionGallery_template';
  key?: Maybe<Scalars['String']>;
  connection?: Maybe<PostConnection>;
};

export type PostConnectionId = {
  __typename?: 'PostConnectionId';
  key?: Maybe<Scalars['ID']>;
  connection?: Maybe<PostConnection>;
};

export type PostConnectionImage = {
  __typename?: 'PostConnectionImage';
  key?: Maybe<Scalars['ID']>;
  connection?: Maybe<PostConnection>;
};

export type PostConnectionKeywords = {
  __typename?: 'PostConnectionKeywords';
  key?: Maybe<Scalars['String']>;
  connection?: Maybe<PostConnection>;
};

export type PostConnectionPermalink = {
  __typename?: 'PostConnectionPermalink';
  key?: Maybe<Scalars['String']>;
  connection?: Maybe<PostConnection>;
};

export type PostConnectionPublicationDate = {
  __typename?: 'PostConnectionPublicationDate';
  key?: Maybe<Scalars['DateTime']>;
  connection?: Maybe<PostConnection>;
};

export type PostConnectionPublished_At = {
  __typename?: 'PostConnectionPublished_at';
  key?: Maybe<Scalars['DateTime']>;
  connection?: Maybe<PostConnection>;
};

export type PostConnectionSlug = {
  __typename?: 'PostConnectionSlug';
  key?: Maybe<Scalars['String']>;
  connection?: Maybe<PostConnection>;
};

export type PostConnectionText = {
  __typename?: 'PostConnectionText';
  key?: Maybe<Scalars['String']>;
  connection?: Maybe<PostConnection>;
};

export type PostConnectionTitle = {
  __typename?: 'PostConnectionTitle';
  key?: Maybe<Scalars['String']>;
  connection?: Maybe<PostConnection>;
};

export type PostConnectionUpdated_At = {
  __typename?: 'PostConnectionUpdated_at';
  key?: Maybe<Scalars['DateTime']>;
  connection?: Maybe<PostConnection>;
};

export type PostGroupBy = {
  __typename?: 'PostGroupBy';
  id?: Maybe<Array<Maybe<PostConnectionId>>>;
  created_at?: Maybe<Array<Maybe<PostConnectionCreated_At>>>;
  updated_at?: Maybe<Array<Maybe<PostConnectionUpdated_At>>>;
  text?: Maybe<Array<Maybe<PostConnectionText>>>;
  title?: Maybe<Array<Maybe<PostConnectionTitle>>>;
  publicationDate?: Maybe<Array<Maybe<PostConnectionPublicationDate>>>;
  gallery?: Maybe<Array<Maybe<PostConnectionGallery>>>;
  image?: Maybe<Array<Maybe<PostConnectionImage>>>;
  keywords?: Maybe<Array<Maybe<PostConnectionKeywords>>>;
  description?: Maybe<Array<Maybe<PostConnectionDescription>>>;
  category?: Maybe<Array<Maybe<PostConnectionCategory>>>;
  slug?: Maybe<Array<Maybe<PostConnectionSlug>>>;
  permalink?: Maybe<Array<Maybe<PostConnectionPermalink>>>;
  content_position?: Maybe<Array<Maybe<PostConnectionContent_Position>>>;
  gallery_template?: Maybe<Array<Maybe<PostConnectionGallery_Template>>>;
  cover_image?: Maybe<Array<Maybe<PostConnectionCover_Image>>>;
  content_type?: Maybe<Array<Maybe<PostConnectionContent_Type>>>;
  published_at?: Maybe<Array<Maybe<PostConnectionPublished_At>>>;
};

export type PostInput = {
  text?: Maybe<Scalars['String']>;
  title: Scalars['String'];
  publicationDate: Scalars['DateTime'];
  gallery?: Maybe<Scalars['ID']>;
  image?: Maybe<Scalars['ID']>;
  keywords?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  category?: Maybe<Scalars['ID']>;
  slug?: Maybe<Scalars['String']>;
  permalink?: Maybe<Scalars['String']>;
  content_position?: Maybe<Enum_Post_Content_Position>;
  gallery_template?: Maybe<Enum_Post_Gallery_Template>;
  tags?: Maybe<Array<Maybe<Scalars['ID']>>>;
  post_image_preset?: Maybe<Enum_Post_Post_Image_Preset>;
  cover_image?: Maybe<Scalars['ID']>;
  cover_image_preset?: Maybe<Enum_Post_Cover_Image_Preset>;
  content_type?: Maybe<Enum_Post_Content_Type>;
  published_at?: Maybe<Scalars['DateTime']>;
  created_by?: Maybe<Scalars['ID']>;
  updated_by?: Maybe<Scalars['ID']>;
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
  page?: Maybe<Page>;
  postCategories?: Maybe<Array<Maybe<PostCategory>>>;
  postCategoriesConnection?: Maybe<PostCategoryConnection>;
  post?: Maybe<Post>;
  posts?: Maybe<Array<Maybe<Post>>>;
  postsConnection?: Maybe<PostConnection>;
  tag?: Maybe<Tag>;
  tags?: Maybe<Array<Maybe<Tag>>>;
  tagsConnection?: Maybe<TagConnection>;
  categoryBySlug?: Maybe<Category>;
  recentImages?: Maybe<Array<Maybe<UploadFile>>>;
  categoriesCount: Scalars['Int'];
  galleryBySlug?: Maybe<Gallery>;
  galleryMenu?: Maybe<GalleryCategories>;
  pageBySlug?: Maybe<Page>;
  postCategoryBySlug?: Maybe<PostCategory>;
  postsCount: Scalars['Int'];
  postBySlug?: Maybe<Post>;
  postByPermalink?: Maybe<Post>;
  prevNextPost?: Maybe<Array<Maybe<Post>>>;
  relatedPosts?: Maybe<Array<Maybe<Post>>>;
  tagBySlug?: Maybe<Tag>;
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


export type QueryPageArgs = {
  id: Scalars['ID'];
  publicationState?: Maybe<PublicationState>;
};


export type QueryPostCategoriesArgs = {
  sort?: Maybe<Scalars['String']>;
  limit?: Maybe<Scalars['Int']>;
  start?: Maybe<Scalars['Int']>;
  where?: Maybe<Scalars['JSON']>;
  publicationState?: Maybe<PublicationState>;
};


export type QueryPostCategoriesConnectionArgs = {
  sort?: Maybe<Scalars['String']>;
  limit?: Maybe<Scalars['Int']>;
  start?: Maybe<Scalars['Int']>;
  where?: Maybe<Scalars['JSON']>;
};


export type QueryPostArgs = {
  id: Scalars['ID'];
  publicationState?: Maybe<PublicationState>;
};


export type QueryPostsArgs = {
  sort?: Maybe<Scalars['String']>;
  limit?: Maybe<Scalars['Int']>;
  start?: Maybe<Scalars['Int']>;
  where?: Maybe<Scalars['JSON']>;
  publicationState?: Maybe<PublicationState>;
};


export type QueryPostsConnectionArgs = {
  sort?: Maybe<Scalars['String']>;
  limit?: Maybe<Scalars['Int']>;
  start?: Maybe<Scalars['Int']>;
  where?: Maybe<Scalars['JSON']>;
};


export type QueryTagArgs = {
  id: Scalars['ID'];
  publicationState?: Maybe<PublicationState>;
};


export type QueryTagsArgs = {
  sort?: Maybe<Scalars['String']>;
  limit?: Maybe<Scalars['Int']>;
  start?: Maybe<Scalars['Int']>;
  where?: Maybe<Scalars['JSON']>;
  publicationState?: Maybe<PublicationState>;
};


export type QueryTagsConnectionArgs = {
  sort?: Maybe<Scalars['String']>;
  limit?: Maybe<Scalars['Int']>;
  start?: Maybe<Scalars['Int']>;
  where?: Maybe<Scalars['JSON']>;
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


export type QueryPageBySlugArgs = {
  slug?: Maybe<Scalars['String']>;
};


export type QueryPostCategoryBySlugArgs = {
  slug?: Maybe<Scalars['String']>;
};


export type QueryPostsCountArgs = {
  where?: Maybe<Scalars['JSON']>;
};


export type QueryPostBySlugArgs = {
  slug?: Maybe<Scalars['String']>;
};


export type QueryPostByPermalinkArgs = {
  permalink?: Maybe<Scalars['String']>;
};


export type QueryPrevNextPostArgs = {
  slug?: Maybe<Scalars['String']>;
};


export type QueryRelatedPostsArgs = {
  slug?: Maybe<Scalars['String']>;
};


export type QueryTagBySlugArgs = {
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

export type Tag = {
  __typename?: 'Tag';
  id: Scalars['ID'];
  created_at: Scalars['DateTime'];
  updated_at: Scalars['DateTime'];
  name?: Maybe<Scalars['String']>;
  slug?: Maybe<Scalars['String']>;
  posts?: Maybe<Array<Maybe<Post>>>;
};


export type TagPostsArgs = {
  sort?: Maybe<Scalars['String']>;
  limit?: Maybe<Scalars['Int']>;
  start?: Maybe<Scalars['Int']>;
  where?: Maybe<Scalars['JSON']>;
};

export type TagAggregator = {
  __typename?: 'TagAggregator';
  count?: Maybe<Scalars['Int']>;
  totalCount?: Maybe<Scalars['Int']>;
};

export type TagConnection = {
  __typename?: 'TagConnection';
  values?: Maybe<Array<Maybe<Tag>>>;
  groupBy?: Maybe<TagGroupBy>;
  aggregate?: Maybe<TagAggregator>;
};

export type TagConnectionCreated_At = {
  __typename?: 'TagConnectionCreated_at';
  key?: Maybe<Scalars['DateTime']>;
  connection?: Maybe<TagConnection>;
};

export type TagConnectionId = {
  __typename?: 'TagConnectionId';
  key?: Maybe<Scalars['ID']>;
  connection?: Maybe<TagConnection>;
};

export type TagConnectionName = {
  __typename?: 'TagConnectionName';
  key?: Maybe<Scalars['String']>;
  connection?: Maybe<TagConnection>;
};

export type TagConnectionSlug = {
  __typename?: 'TagConnectionSlug';
  key?: Maybe<Scalars['String']>;
  connection?: Maybe<TagConnection>;
};

export type TagConnectionUpdated_At = {
  __typename?: 'TagConnectionUpdated_at';
  key?: Maybe<Scalars['DateTime']>;
  connection?: Maybe<TagConnection>;
};

export type TagGroupBy = {
  __typename?: 'TagGroupBy';
  id?: Maybe<Array<Maybe<TagConnectionId>>>;
  created_at?: Maybe<Array<Maybe<TagConnectionCreated_At>>>;
  updated_at?: Maybe<Array<Maybe<TagConnectionUpdated_At>>>;
  name?: Maybe<Array<Maybe<TagConnectionName>>>;
  slug?: Maybe<Array<Maybe<TagConnectionSlug>>>;
};

export type TagInput = {
  name?: Maybe<Scalars['String']>;
  slug?: Maybe<Scalars['String']>;
  posts?: Maybe<Array<Maybe<Scalars['ID']>>>;
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
  matchingThumbnails?: Maybe<Array<Maybe<Image>>>;
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


export type UploadFileMatchingThumbnailsArgs = {
  preset?: Maybe<Scalars['String']>;
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

export type CreatePageInput = {
  data?: Maybe<PageInput>;
};

export type CreatePagePayload = {
  __typename?: 'createPagePayload';
  page?: Maybe<Page>;
};

export type CreatePostCategoryInput = {
  data?: Maybe<PostCategoryInput>;
};

export type CreatePostCategoryPayload = {
  __typename?: 'createPostCategoryPayload';
  postCategory?: Maybe<PostCategory>;
};

export type CreatePostInput = {
  data?: Maybe<PostInput>;
};

export type CreatePostPayload = {
  __typename?: 'createPostPayload';
  post?: Maybe<Post>;
};

export type CreateTagInput = {
  data?: Maybe<TagInput>;
};

export type CreateTagPayload = {
  __typename?: 'createTagPayload';
  tag?: Maybe<Tag>;
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

export type DeletePageInput = {
  where?: Maybe<InputId>;
};

export type DeletePagePayload = {
  __typename?: 'deletePagePayload';
  page?: Maybe<Page>;
};

export type DeletePostCategoryInput = {
  where?: Maybe<InputId>;
};

export type DeletePostCategoryPayload = {
  __typename?: 'deletePostCategoryPayload';
  postCategory?: Maybe<PostCategory>;
};

export type DeletePostInput = {
  where?: Maybe<InputId>;
};

export type DeletePostPayload = {
  __typename?: 'deletePostPayload';
  post?: Maybe<Post>;
};

export type DeleteTagInput = {
  where?: Maybe<InputId>;
};

export type DeleteTagPayload = {
  __typename?: 'deleteTagPayload';
  tag?: Maybe<Tag>;
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
  text?: Maybe<Scalars['String']>;
  token?: Maybe<Scalars['String']>;
  created_by?: Maybe<Scalars['ID']>;
  updated_by?: Maybe<Scalars['ID']>;
};

export type EditComponentMenuConfigMenuInput = {
  id?: Maybe<Scalars['ID']>;
  name?: Maybe<Scalars['String']>;
  url?: Maybe<Scalars['String']>;
  icon?: Maybe<Enum_Componentmenuconfigmenu_Icon>;
  image?: Maybe<Scalars['ID']>;
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

export type EditPageInput = {
  slug?: Maybe<Scalars['String']>;
  content?: Maybe<Scalars['String']>;
  keywords?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  created_by?: Maybe<Scalars['ID']>;
  updated_by?: Maybe<Scalars['ID']>;
};

export type EditPostCategoryInput = {
  name?: Maybe<Scalars['String']>;
  slug?: Maybe<Scalars['String']>;
  keywords?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  created_by?: Maybe<Scalars['ID']>;
  updated_by?: Maybe<Scalars['ID']>;
};

export type EditPostInput = {
  text?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  publicationDate?: Maybe<Scalars['DateTime']>;
  gallery?: Maybe<Scalars['ID']>;
  image?: Maybe<Scalars['ID']>;
  keywords?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  category?: Maybe<Scalars['ID']>;
  slug?: Maybe<Scalars['String']>;
  permalink?: Maybe<Scalars['String']>;
  content_position?: Maybe<Enum_Post_Content_Position>;
  gallery_template?: Maybe<Enum_Post_Gallery_Template>;
  tags?: Maybe<Array<Maybe<Scalars['ID']>>>;
  post_image_preset?: Maybe<Enum_Post_Post_Image_Preset>;
  cover_image?: Maybe<Scalars['ID']>;
  cover_image_preset?: Maybe<Enum_Post_Cover_Image_Preset>;
  content_type?: Maybe<Enum_Post_Content_Type>;
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

export type EditTagInput = {
  name?: Maybe<Scalars['String']>;
  slug?: Maybe<Scalars['String']>;
  posts?: Maybe<Array<Maybe<Scalars['ID']>>>;
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

export type UpdatePageInput = {
  where?: Maybe<InputId>;
  data?: Maybe<EditPageInput>;
};

export type UpdatePagePayload = {
  __typename?: 'updatePagePayload';
  page?: Maybe<Page>;
};

export type UpdatePostCategoryInput = {
  where?: Maybe<InputId>;
  data?: Maybe<EditPostCategoryInput>;
};

export type UpdatePostCategoryPayload = {
  __typename?: 'updatePostCategoryPayload';
  postCategory?: Maybe<PostCategory>;
};

export type UpdatePostInput = {
  where?: Maybe<InputId>;
  data?: Maybe<EditPostInput>;
};

export type UpdatePostPayload = {
  __typename?: 'updatePostPayload';
  post?: Maybe<Post>;
};

export type UpdateTagInput = {
  where?: Maybe<InputId>;
  data?: Maybe<EditTagInput>;
};

export type UpdateTagPayload = {
  __typename?: 'updateTagPayload';
  tag?: Maybe<Tag>;
};

export type UpdateUserInput = {
  where?: Maybe<InputId>;
  data?: Maybe<EditUserInput>;
};

export type UpdateUserPayload = {
  __typename?: 'updateUserPayload';
  user?: Maybe<UsersPermissionsUser>;
};
