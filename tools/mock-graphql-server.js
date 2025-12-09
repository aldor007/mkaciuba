/**
 * Mock GraphQL server for E2E testing
 * Returns fixture data that matches the Strapi schema
 */

const express = require('express');
const app = express();

app.use(express.json());

// Helper to create thumbnail structure matching the ThumbnailFields fragment
const createThumbnails = (baseUrl, sizes) => {
  const thumbnails = [];
  sizes.forEach(({ width, height, mediaQuery }) => {
    // Non-WebP version
    thumbnails.push({
      url: `${baseUrl}?w=${width}&h=${height}`,
      mediaQuery: mediaQuery || null,
      webp: false,
      type: 'image/jpeg',
      width,
      height
    });
    // WebP version
    thumbnails.push({
      url: `${baseUrl}?w=${width}&h=${height}&format=webp`,
      mediaQuery: mediaQuery || null,
      webp: true,
      type: 'image/webp',
      width,
      height
    });
  });
  return thumbnails;
};

// Mock data matching the expected structure
const mockData = {
  posts: [
    {
      id: '1',
      title: 'Test Post 1',
      text: 'This is a test post content with some text',
      slug: 'test-post-1',
      publicationDate: '2024-01-01T00:00:00.000Z',
      keywords: 'test, post, blog',
      category: {
        name: 'Test Category',
        slug: 'test-category'
      },
      mainImage: {
        url: 'https://via.placeholder.com/800x600',
        mediaQuery: null,
        webp: false,
        type: 'image/jpeg',
        width: 800,
        height: 600
      },
      media: [{
        id: '1',
        url: 'https://via.placeholder.com/800x600',
        caption: 'Test image',
        alternativeText: 'Test',
        width: 800,
        height: 600,
        formats: {
          thumbnail: {
            url: 'https://via.placeholder.com/245x156',
            width: 245,
            height: 156
          }
        }
      }],
      tags: []
    },
    {
      id: '2',
      title: 'Test Post 2',
      text: 'Another test post',
      slug: 'test-post-2',
      publicationDate: '2024-01-02T00:00:00.000Z',
      keywords: 'test, another, blog',
      category: {
        name: 'Test Category',
        slug: 'test-category'
      },
      mainImage: {
        url: 'https://via.placeholder.com/600x400',
        mediaQuery: null,
        webp: false,
        type: 'image/jpeg',
        width: 600,
        height: 400
      },
      media: [],
      tags: []
    }
  ],
  tags: Array.from({ length: 5 }, (_, i) => ({
    name: `Tag ${i + 1}`,
    slug: `tag-${i + 1}`
  })),
  categories: Array.from({ length: 9 }, (_, i) => ({
    id: `${i + 1}`,
    name: `Category ${i + 1}`,
    slug: `category-${i + 1}`,
    description: `Description for Category ${i + 1}`,
    keywords: `category, test, photo${i + 1}`,
    mediasCount: 3,
    gallery: {
      slug: 'test-gallery',
      name: 'Test Gallery'
    },
    randomImage: {
      id: `img-${i + 1}`,
      caption: `Random image from Category ${i + 1}`,
      thumbnail: {
        url: `https://via.placeholder.com/200x150?text=Cat${i + 1}`,
        width: 200,
        height: 150
      }
    },
    medias: Array.from({ length: 3 }, (_, j) => ({
      id: `${i * 3 + j + 1}`,
      name: `photo-${i + 1}-${j + 1}.jpg`,
      alternativeText: `Photo ${j + 1} from Category ${i + 1}`,
      caption: `Caption for photo ${j + 1}`,
      thumbnails: createThumbnails(
        `https://via.placeholder.com/1200x900?text=Cat${i + 1}Photo${j + 1}`,
        [
          { width: 245, height: 156 },
          { width: 400, height: 300 },
          { width: 800, height: 600 },
          { width: 1200, height: 900 }
        ]
      )
    })),
    image: {
      thumbnails: createThumbnails(
        `https://via.placeholder.com/800x600?text=Category${i + 1}`,
        [
          { width: 245, height: 156 },
          { width: 400, height: 300 },
          { width: 800, height: 600 }
        ]
      )
    }
  }))
};

// GraphQL endpoint
app.post('/graphql', (req, res) => {
  // Handle both single and batched GraphQL requests
  const isBatch = Array.isArray(req.body);
  const operations = isBatch ? req.body : [req.body];

  console.log('GraphQL Request:', isBatch ? `Batch of ${operations.length} operations` : 'Single operation');

  const results = operations.map(({ query, variables }) => {
    console.log('Query:', query?.substring(0, 150));
    console.log('Variables:', JSON.stringify(variables));

    // Simple query matching - in a real mock server, you'd parse the GraphQL query properly
    let data = {};

  // Handle categoryBySlug query (used by ImageList component with fragments)
  if (query?.includes('categoryBySlug')) {
    const categorySlug = variables?.categorySlug;
    const limit = variables?.limit || 20;
    const start = variables?.start || 0;

    const category = mockData.categories.find(c => c.slug === categorySlug);

    if (category) {
      // Return category with paginated medias
      data.categoryBySlug = {
        ...category,
        medias: category.medias.slice(start, start + limit)
      };
    } else {
      data.categoryBySlug = null;
    }
  }

  // Handle posts query
  if (query?.includes('posts') && !query?.includes('relatedPosts') && !query?.includes('postBySlug')) {
    const limit = variables?.limit || 10;
    const start = variables?.start || 0;
    data.posts = mockData.posts.slice(start, start + limit);
    data.postsCount = mockData.posts.length;
    data.postsConnection = {
      aggregate: { count: mockData.posts.length }
    };
  }

  // Handle tags query
  if (query?.includes('tags')) {
    data.tags = mockData.tags;
  }

  // Handle categories list query (for Footer)
  if (query?.includes('categories') && !query?.includes('categoryBySlug')) {
    const limit = variables?.limit || 20;
    const start = variables?.start || 0;
    data.categories = mockData.categories.slice(start, start + limit);
    data.categoriesConnection = {
      aggregate: { count: mockData.categories.length }
    };
  }

  // Handle single post query
  if (query?.includes('postBySlug')) {
    data.postBySlug = mockData.posts[0];
    data.prevNextPost = [];
    data.relatedPosts = [];
  }

  // Handle gallery menu query
  if (query?.includes('galleryMenu')) {
    const gallerySlug = variables?.gallerySlug;
    data.galleryMenu = {
      gallery: {
        id: '1',
        name: 'Test Gallery',
        slug: gallerySlug || 'test-gallery',
        keywords: 'test, gallery, photos',
        description: 'Test gallery for E2E testing'
      },
      categories: mockData.categories.map(c => ({
        slug: c.slug,
        name: c.name
      }))
    };
  }

    console.log('Response data keys:', Object.keys(data));
    return { data };
  });

  // Return results in the same format as received (batch or single)
  res.json(isBatch ? results : results[0]);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Mock GraphQL server running on http://localhost:${PORT}/graphql`);
});
