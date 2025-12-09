/**
 * Mock GraphQL server for E2E testing
 * Returns fixture data that matches the Strapi schema
 */

const express = require('express');
const app = express();

app.use(express.json());

// Mock data matching the expected structure
const mockData = {
  posts: [
    {
      id: '1',
      title: 'Test Post 1',
      text: 'This is a test post content with some text',
      slug: 'test-post-1',
      publishedAt: '2024-01-01T00:00:00.000Z',
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
      categories: [],
      tags: []
    },
    {
      id: '2',
      title: 'Test Post 2',
      text: 'Another test post',
      slug: 'test-post-2',
      publishedAt: '2024-01-02T00:00:00.000Z',
      media: [],
      categories: [],
      tags: []
    }
  ],
  categories: Array.from({ length: 9 }, (_, i) => ({
    id: `${i + 1}`,
    name: `Category ${i + 1}`,
    slug: `category-${i + 1}`,
    media: [{
      id: `${i + 1}`,
      url: `https://via.placeholder.com/400x300?text=Photo${i + 1}`,
      caption: `Photo ${i + 1}`,
      width: 400,
      height: 300,
      formats: {
        thumbnail: {
          url: `https://via.placeholder.com/245x156?text=Photo${i + 1}`,
          width: 245,
          height: 156
        }
      }
    }]
  }))
};

// GraphQL endpoint
app.post('/graphql', (req, res) => {
  const { query, variables } = req.body;

  console.log('GraphQL Query:', query?.substring(0, 100));

  // Simple query matching - in a real mock server, you'd parse the GraphQL query properly
  let data = {};

  if (query?.includes('posts')) {
    const limit = variables?.limit || 10;
    const start = variables?.start || 0;
    data.posts = mockData.posts.slice(start, start + limit);
    data.postsConnection = {
      aggregate: { count: mockData.posts.length }
    };
  }

  if (query?.includes('categories')) {
    const limit = variables?.limit || 20;
    const start = variables?.start || 0;
    data.categories = mockData.categories.slice(start, start + limit);
    data.categoriesConnection = {
      aggregate: { count: mockData.categories.length }
    };
  }

  if (query?.includes('post(') || query?.includes('post ')) {
    data.post = mockData.posts[0];
  }

  res.json({ data });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Mock GraphQL server running on http://localhost:${PORT}/graphql`);
});
