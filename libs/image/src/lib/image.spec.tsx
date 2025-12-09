import React from 'react';
import { render } from '@testing-library/react';

import { ImageComponent } from './image';

describe('ImageComponent', () => {
  it('should render successfully', () => {
    const mockThumbnails = [
      {
        url: 'https://example.com/image.jpg',
        webp: false,
        width: 800,
        height: 600
      }
    ];
    const { baseElement } = render(<ImageComponent thumbnails={mockThumbnails} />);
    expect(baseElement).toBeTruthy();
  });
});
