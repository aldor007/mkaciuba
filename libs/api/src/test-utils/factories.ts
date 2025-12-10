import {
  Image,
  UploadFile,
  Post,
  Category,
  Gallery,
  Tag,
  PostCategory,
  Enum_Post_Content_Position,
  Enum_Post_Content_Type,
  Enum_Post_Gallery_Template,
} from '../lib/graphql';

/**
 * Creates a mock Image object with sensible defaults
 *
 * @param overrides - Partial Image properties to override defaults
 * @returns Mock Image object
 *
 * @example
 * const image = createMockImage({ width: 1920, webp: true });
 */
export function createMockImage(overrides?: Partial<Image>): Image {
  return {
    __typename: 'Image',
    url: 'https://example.com/image.jpg',
    mediaQuery: null,
    width: 800,
    height: 600,
    type: 'image/jpeg',
    webp: false,
    ...overrides,
  };
}

/**
 * Common image variants for table-driven tests
 * Includes multiple sizes and WebP variants
 */
export const mockImageVariants: Image[] = [
  createMockImage({ width: 400, height: 300, webp: false }),
  createMockImage({ width: 800, height: 600, webp: false }),
  createMockImage({ width: 1200, height: 900, webp: false }),
  createMockImage({ width: 1600, height: 1200, webp: false }),
  createMockImage({ width: 400, height: 300, webp: true, url: 'https://example.com/image.webp' }),
  createMockImage({ width: 800, height: 600, webp: true, url: 'https://example.com/image.webp' }),
  createMockImage({ width: 1200, height: 900, webp: true, url: 'https://example.com/image.webp' }),
  createMockImage({ width: 1600, height: 1200, webp: true, url: 'https://example.com/image.webp' }),
];

/**
 * Creates a mock UploadFile object with thumbnails
 *
 * @param overrides - Partial UploadFile properties to override defaults
 * @returns Mock UploadFile object
 *
 * @example
 * const uploadFile = createMockUploadFile({
 *   name: 'my-photo.jpg',
 *   thumbnails: mockImageVariants
 * });
 */
export function createMockUploadFile(overrides?: Partial<UploadFile>): UploadFile {
  const defaultThumbnails = [
    createMockImage({ width: 400, height: 300 }),
    createMockImage({ width: 800, height: 600 }),
  ];

  return {
    __typename: 'UploadFile',
    id: `upload-${Math.random().toString(36).substr(2, 9)}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    name: 'test-image.jpg',
    alternativeText: 'Test image',
    caption: null,
    width: 1920,
    height: 1080,
    formats: null,
    hash: 'test_hash',
    ext: '.jpg',
    mime: 'image/jpeg',
    size: 245.67,
    url: 'https://example.com/test-image.jpg',
    previewUrl: null,
    provider: 'local',
    provider_metadata: null,
    related: null,
    thumbnails: defaultThumbnails,
    thumbnail: defaultThumbnails[0],
    matchingThumbnails: defaultThumbnails,
    ...overrides,
  };
}

/**
 * Creates a mock Tag object
 *
 * @param overrides - Partial Tag properties to override defaults
 * @returns Mock Tag object
 *
 * @example
 * const tag = createMockTag({ name: 'Nature', slug: 'nature' });
 */
export function createMockTag(overrides?: Partial<Tag>): Tag {
  const name = overrides?.name || 'Test Tag';
  const slug = overrides?.slug || name.toLowerCase().replace(/\s+/g, '-');

  return {
    __typename: 'Tag',
    id: `tag-${Math.random().toString(36).substr(2, 9)}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    name,
    slug,
    ...overrides,
  };
}

/**
 * Creates a mock PostCategory object
 *
 * @param overrides - Partial PostCategory properties to override defaults
 * @returns Mock PostCategory object
 *
 * @example
 * const category = createMockPostCategory({ name: 'Travel', slug: 'travel' });
 */
export function createMockPostCategory(overrides?: Partial<PostCategory>): PostCategory {
  const name = overrides?.name || 'Test Category';
  const slug = overrides?.slug || name.toLowerCase().replace(/\s+/g, '-');

  return {
    __typename: 'PostCategory',
    id: `post-category-${Math.random().toString(36).substr(2, 9)}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    name,
    slug,
    keywords: null,
    description: null,
    ...overrides,
  };
}

/**
 * Creates a mock Post object with mainImage, category, and tags
 *
 * @param overrides - Partial Post properties to override defaults
 * @returns Mock Post object
 *
 * @example
 * const post = createMockPost({
 *   title: 'My Post',
 *   slug: 'my-post',
 *   publicationDate: '2023-01-01T00:00:00.000Z',
 *   category: createMockPostCategory({ name: 'Travel' })
 * });
 */
export function createMockPost(overrides?: Partial<Post>): Post {
  const title = overrides?.title || 'Test Post';
  const slug = overrides?.slug || title.toLowerCase().replace(/\s+/g, '-');
  const now = new Date().toISOString();

  return {
    __typename: 'Post',
    id: `post-${Math.random().toString(36).substr(2, 9)}`,
    created_at: now,
    updated_at: now,
    text: '<p>This is test post content.</p>',
    title,
    publicationDate: now,
    gallery: null,
    image: createMockUploadFile(),
    keywords: 'test, post',
    description: 'This is a test post description',
    category: createMockPostCategory(),
    slug,
    permalink: null,
    content_position: Enum_Post_Content_Position.Top,
    gallery_template: Enum_Post_Gallery_Template.Normal,
    cover_image: null,
    content_type: Enum_Post_Content_Type.Html,
    published_at: now,
    tags: [createMockTag({ name: 'Test' })],
    mainImage: mockImageVariants.slice(0, 4),
    coverImage: null,
    seoDescription: 'SEO description for test post',
    ...overrides,
  };
}

/**
 * Creates a mock Gallery object
 *
 * @param overrides - Partial Gallery properties to override defaults
 * @returns Mock Gallery object
 *
 * @example
 * const gallery = createMockGallery({ name: 'My Gallery', slug: 'my-gallery' });
 */
export function createMockGallery(overrides?: Partial<Gallery>): Gallery {
  const name = overrides?.name || 'Test Gallery';
  const slug = overrides?.slug || name.toLowerCase().replace(/\s+/g, '-');

  return {
    __typename: 'Gallery',
    id: `gallery-${Math.random().toString(36).substr(2, 9)}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    name,
    slug,
    keywords: null,
    description: null,
    ...overrides,
  };
}

/**
 * Creates a mock Category object with medias
 *
 * @param overrides - Partial Category properties to override defaults
 * @returns Mock Category object
 *
 * @example
 * const category = createMockCategory({
 *   name: 'Landscapes',
 *   slug: 'landscapes',
 *   mediasCount: 50,
 *   medias: [createMockUploadFile(), createMockUploadFile()]
 * });
 */
export function createMockCategory(overrides?: Partial<Category>): Category {
  const name = overrides?.name || 'Test Category';
  const slug = overrides?.slug || name.toLowerCase().replace(/\s+/g, '-');
  const now = new Date().toISOString();

  const defaultMedias = [
    createMockUploadFile({ name: 'photo-1.jpg' }),
    createMockUploadFile({ name: 'photo-2.jpg' }),
    createMockUploadFile({ name: 'photo-3.jpg' }),
  ];

  return {
    __typename: 'Category',
    id: `category-${Math.random().toString(36).substr(2, 9)}`,
    created_at: now,
    updated_at: now,
    name,
    slug,
    slugOverride: null,
    public: true,
    publicationDate: now,
    file: null,
    image: createMockUploadFile({ name: 'category-cover.jpg' }),
    gallery: createMockGallery(),
    keywords: 'test, category',
    description: 'This is a test category description',
    text: null,
    medias: defaultMedias,
    randomImage: defaultMedias[0],
    mediasCount: defaultMedias.length,
    ...overrides,
  };
}

/**
 * Creates an array of mock posts for pagination testing
 *
 * @param count - Number of posts to create
 * @param overridesFn - Optional function to customize each post based on index
 * @returns Array of mock Post objects
 *
 * @example
 * const posts = createMockPosts(10, (index) => ({
 *   title: `Post ${index + 1}`,
 *   slug: `post-${index + 1}`
 * }));
 */
export function createMockPosts(
  count: number,
  overridesFn?: (index: number) => Partial<Post>
): Post[] {
  return Array.from({ length: count }, (_, index) => {
    const overrides = overridesFn ? overridesFn(index) : {};
    return createMockPost({
      title: `Test Post ${index + 1}`,
      slug: `test-post-${index + 1}`,
      ...overrides,
    });
  });
}

/**
 * Creates an array of mock categories for pagination testing
 *
 * @param count - Number of categories to create
 * @param overridesFn - Optional function to customize each category based on index
 * @returns Array of mock Category objects
 *
 * @example
 * const categories = createMockCategories(5, (index) => ({
 *   name: `Category ${index + 1}`,
 *   mediasCount: 10 * (index + 1)
 * }));
 */
export function createMockCategories(
  count: number,
  overridesFn?: (index: number) => Partial<Category>
): Category[] {
  return Array.from({ length: count }, (_, index) => {
    const overrides = overridesFn ? overridesFn(index) : {};
    return createMockCategory({
      name: `Test Category ${index + 1}`,
      slug: `test-category-${index + 1}`,
      ...overrides,
    });
  });
}

/**
 * Creates an array of mock upload files (medias) for pagination testing
 *
 * @param count - Number of upload files to create
 * @param overridesFn - Optional function to customize each file based on index
 * @returns Array of mock UploadFile objects
 *
 * @example
 * const medias = createMockMedias(30, (index) => ({
 *   name: `photo-${index + 1}.jpg`,
 *   alternativeText: `Photo ${index + 1}`
 * }));
 */
export function createMockMedias(
  count: number,
  overridesFn?: (index: number) => Partial<UploadFile>
): UploadFile[] {
  return Array.from({ length: count }, (_, index) => {
    const overrides = overridesFn ? overridesFn(index) : {};
    return createMockUploadFile({
      name: `test-photo-${index + 1}.jpg`,
      alternativeText: `Test Photo ${index + 1}`,
      ...overrides,
    });
  });
}
