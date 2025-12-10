/// <reference types="@testing-library/jest-dom" />
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Markdown } from './markdown';

describe('Markdown Component', () => {
  describe('basic rendering', () => {
    test('should render plain text', () => {
      render(<Markdown text="Hello World" className="test-class" />);
      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    test('should apply className prop', () => {
      const { container } = render(<Markdown text="Test" className="custom-markdown" />);
      const markdownElement = container.querySelector('.custom-markdown');
      expect(markdownElement).toBeInTheDocument();
    });

    test('should render empty text', () => {
      const { container } = render(<Markdown text="" className="test-class" />);
      expect(container.querySelector('.test-class')).toBeInTheDocument();
    });
  });

  describe('markdown formatting', () => {
    describe('should render common markdown elements', () => {
      const testCases = [
        {
          description: 'bold text',
          text: '**bold text**',
          selector: 'strong',
          expectedText: 'bold text',
        },
        {
          description: 'italic text',
          text: '*italic text*',
          selector: 'em',
          expectedText: 'italic text',
        },
        {
          description: 'heading level 1',
          text: '# Heading 1',
          selector: 'h1',
          expectedText: 'Heading 1',
        },
        {
          description: 'heading level 2',
          text: '## Heading 2',
          selector: 'h2',
          expectedText: 'Heading 2',
        },
        {
          description: 'heading level 3',
          text: '### Heading 3',
          selector: 'h3',
          expectedText: 'Heading 3',
        },
        {
          description: 'link',
          text: '[Link Text](https://example.com)',
          selector: 'a',
          expectedText: 'Link Text',
        },
        {
          description: 'code inline',
          text: '`code snippet`',
          selector: 'code',
          expectedText: 'code snippet',
        },
      ];

      test.each(testCases)('should render $description', ({ text, selector, expectedText }) => {
        const { container } = render(<Markdown text={text} className="test" />);
        const element = container.querySelector(selector);
        expect(element).toBeInTheDocument();
        expect(element?.textContent).toContain(expectedText);
      });
    });

    test('should render list items', () => {
      const text = `
- Item 1
- Item 2
- Item 3
      `;
      const { container } = render(<Markdown text={text} className="test" />);
      const list = container.querySelector('ul');
      expect(list).toBeInTheDocument();
      const items = container.querySelectorAll('li');
      expect(items).toHaveLength(3);
    });

    test('should render numbered list', () => {
      const text = `
1. First
2. Second
3. Third
      `;
      const { container } = render(<Markdown text={text} className="test" />);
      const list = container.querySelector('ol');
      expect(list).toBeInTheDocument();
      const items = container.querySelectorAll('li');
      expect(items).toHaveLength(3);
    });

    test('should render blockquote', () => {
      const text = '> This is a quote';
      const { container } = render(<Markdown text={text} className="test" />);
      const blockquote = container.querySelector('blockquote');
      expect(blockquote).toBeInTheDocument();
      expect(blockquote?.textContent).toContain('This is a quote');
    });

    test('should render code block', () => {
      const text = '```\nconst x = 10;\n```';
      const { container } = render(<Markdown text={text} className="test" />);
      const pre = container.querySelector('pre');
      expect(pre).toBeInTheDocument();
      expect(pre?.textContent).toContain('const x = 10;');
    });
  });

  describe('link handling', () => {
    test('should render links with target="_blank"', () => {
      const text = '[External Link](https://example.com)';
      const { container } = render(<Markdown text={text} className="test" />);
      const link = container.querySelector('a') as HTMLAnchorElement;
      expect(link).toBeInTheDocument();
      expect(link.target).toBe('_blank');
      expect(link.href).toBe('https://example.com/');
    });

    test('should render multiple links with target="_blank"', () => {
      const text = '[Link 1](https://example.com) and [Link 2](https://example.org)';
      const { container } = render(<Markdown text={text} className="test" />);
      const links = container.querySelectorAll('a');
      expect(links).toHaveLength(2);
      links.forEach((link) => {
        expect(link.target).toBe('_blank');
      });
    });

    test('should preserve link text', () => {
      const text = '[Click Here](https://example.com)';
      render(<Markdown text={text} className="test" />);
      expect(screen.getByText('Click Here')).toBeInTheDocument();
    });
  });

  describe('HTML in markdown (rehype-raw)', () => {
    test('should render raw HTML div', () => {
      const text = '<div class="custom">HTML Content</div>';
      const { container } = render(<Markdown text={text} className="test" />);
      const htmlDiv = container.querySelector('.custom');
      expect(htmlDiv).toBeInTheDocument();
      expect(htmlDiv?.textContent).toBe('HTML Content');
    });

    test('should render raw HTML span', () => {
      const text = 'Text with <span style="color: red;">red text</span>';
      const { container } = render(<Markdown text={text} className="test" />);
      const span = container.querySelector('span');
      expect(span).toBeInTheDocument();
      expect(span?.textContent).toBe('red text');
    });

    test('should render raw HTML strong tag', () => {
      const text = '<strong>Bold via HTML</strong>';
      const { container } = render(<Markdown text={text} className="test" />);
      const strong = container.querySelector('strong');
      expect(strong).toBeInTheDocument();
      expect(strong?.textContent).toBe('Bold via HTML');
    });

    test('should render HTML mixed with markdown', () => {
      const text = '**Markdown bold** and <em>HTML italic</em>';
      const { container } = render(<Markdown text={text} className="test" />);
      expect(container.querySelector('strong')).toBeInTheDocument();
      expect(container.querySelector('em')).toBeInTheDocument();
    });

    test('should render HTML paragraph', () => {
      const text = '<p>HTML paragraph</p>';
      const { container } = render(<Markdown text={text} className="test" />);
      const p = container.querySelector('p');
      expect(p).toBeInTheDocument();
      expect(p?.textContent).toBe('HTML paragraph');
    });
  });

  describe('edge cases', () => {
    test('should handle special characters', () => {
      const text = '& < > " \'';
      render(<Markdown text={text} className="test" />);
      expect(screen.getByText(/&/)).toBeInTheDocument();
    });

    test('should handle long text', () => {
      const longText = 'A'.repeat(1000);
      render(<Markdown text={longText} className="test" />);
      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    test('should handle multiple paragraphs', () => {
      const text = 'Paragraph 1\n\nParagraph 2\n\nParagraph 3';
      const { container } = render(<Markdown text={text} className="test" />);
      const paragraphs = container.querySelectorAll('p');
      expect(paragraphs.length).toBeGreaterThanOrEqual(3);
    });

    test('should handle nested markdown', () => {
      const text = '**Bold with *italic* inside**';
      const { container } = render(<Markdown text={text} className="test" />);
      const strong = container.querySelector('strong');
      const em = container.querySelector('em');
      expect(strong).toBeInTheDocument();
      expect(em).toBeInTheDocument();
    });
  });
});
