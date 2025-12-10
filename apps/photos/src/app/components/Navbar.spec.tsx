import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { BrowserRouter } from 'react-router-dom';
import { Navbar, MenuType, GET_MENU } from './Navbar';
import { Enum_Componentmenuconfigmenu_Icon } from '@mkaciuba/api';

describe('Navbar', () => {
  function renderNavbar(
    props: { additionalMainMenu?: MenuType[] } = {},
    mocks: MockedResponse[] = []
  ) {
    return render(
      <BrowserRouter>
        <MockedProvider mocks={mocks} addTypename={true}>
          <Navbar {...props} />
        </MockedProvider>
      </BrowserRouter>
    );
  }

  function createMenuQueryMock(options: {
    brandName?: string;
    topMenu?: any[];
    mainMenu?: any[];
    socialIcons?: any[];
    brand?: any;
  } = {}): MockedResponse {
    const {
      brandName = 'Test Brand',
      topMenu = [
        { name: 'About', url: '/about' },
        { name: 'Contact', url: '/contact' },
      ],
      mainMenu = [
        { name: 'Home', url: '/' },
        { name: 'Blog', url: '/blog' },
      ],
      socialIcons = [
        { name: 'Facebook', url: 'https://facebook.com', icon: Enum_Componentmenuconfigmenu_Icon.Facebook },
        { name: 'Instagram', url: 'https://instagram.com', icon: Enum_Componentmenuconfigmenu_Icon.Instagram },
      ],
      brand = {
        thumbnail: {
          url: 'https://example.com/logo.png',
          width: 35,
          height: 35,
        },
      },
    } = options;

    return {
      request: {
        query: GET_MENU,
      },
      result: {
        data: {
          menu: {
            brandName,
            topMenu,
            mainMenu,
            socialIcons,
            brand,
            __typename: 'Menu',
          },
          __typename: 'Query',
        },
      },
    };
  }

  describe('GraphQL integration', () => {
    test('should render loading state initially', () => {
      const mocks = [createMenuQueryMock()];

      renderNavbar({}, mocks);

      expect(screen.getByText(/Loading/i)).toBeInTheDocument();
    });

    test('should fetch menu data successfully', async () => {
      const mocks = [createMenuQueryMock({ brandName: 'My Site' })];

      renderNavbar({}, mocks);

      await waitFor(() => {
        expect(screen.getByText('My Site')).toBeInTheDocument();
      });
    });

    test('should render error page on query error', async () => {
      const errorMock: MockedResponse = {
        request: {
          query: GET_MENU,
        },
        error: new Error('Network error'),
      };

      renderNavbar({}, [errorMock]);

      await waitFor(() => {
        expect(screen.getByText(/500/i)).toBeInTheDocument();
        expect(screen.getByText(/Network error/i)).toBeInTheDocument();
      });
    });
  });

  describe('top menu rendering', () => {
    test('should render all top menu items', async () => {
      const topMenu = [
        { name: 'About', url: '/about' },
        { name: 'Contact', url: '/contact' },
        { name: 'Services', url: '/services' },
      ];
      const mocks = [createMenuQueryMock({ topMenu })];

      renderNavbar({}, mocks);

      await waitFor(() => {
        expect(screen.getByText('About')).toBeInTheDocument();
        expect(screen.getByText('Contact')).toBeInTheDocument();
        expect(screen.getByText('Services')).toBeInTheDocument();
      });
    });

    test('should render top menu items as links', async () => {
      const topMenu = [
        { name: 'About', url: '/about' },
        { name: 'Contact', url: '/contact' },
      ];
      const mocks = [createMenuQueryMock({ topMenu })];

      const { container } = renderNavbar({}, mocks);

      await waitFor(() => {
        const aboutLink = container.querySelector('a[href="/about"]');
        const contactLink = container.querySelector('a[href="/contact"]');
        expect(aboutLink).toBeInTheDocument();
        expect(contactLink).toBeInTheDocument();
      });
    });

    test('should apply correct styling to top menu items', async () => {
      const topMenu = [{ name: 'Test', url: '/test' }];
      const mocks = [createMenuQueryMock({ topMenu })];

      const { container } = renderNavbar({}, mocks);

      await waitFor(() => {
        const link = container.querySelector('a[href="/test"]');
        expect(link).toHaveClass('uppercase', 'font-bold', 'text-white');
      });
    });
  });

  describe('main menu rendering', () => {
    test('should render all main menu items', async () => {
      const mainMenu = [
        { name: 'Home', url: '/' },
        { name: 'Blog', url: '/blog' },
        { name: 'Portfolio', url: '/portfolio' },
      ];
      const mocks = [createMenuQueryMock({ mainMenu })];

      renderNavbar({}, mocks);

      await waitFor(() => {
        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('Blog')).toBeInTheDocument();
        expect(screen.getByText('Portfolio')).toBeInTheDocument();
      });
    });

    test('should render main menu items as links', async () => {
      const mainMenu = [
        { name: 'Home', url: '/' },
        { name: 'Blog', url: '/blog' },
      ];
      const mocks = [createMenuQueryMock({ mainMenu })];

      const { container } = renderNavbar({}, mocks);

      await waitFor(() => {
        const homeLink = container.querySelector('a[href="/"]');
        const blogLink = container.querySelector('a[href="/blog"]');
        expect(homeLink).toBeInTheDocument();
        expect(blogLink).toBeInTheDocument();
      });
    });

    test('should apply correct styling to main menu items', async () => {
      const mainMenu = [{ name: 'Test', url: '/test' }];
      const mocks = [createMenuQueryMock({ mainMenu })];

      const { container } = renderNavbar({}, mocks);

      await waitFor(() => {
        const link = container.querySelector('a[href="/test"]');
        expect(link).toHaveClass('font-semibold', 'rounded-lg');
      });
    });
  });

  describe('social icons rendering', () => {
    test('should render all social icons', async () => {
      const socialIcons = [
        { name: 'Facebook', url: 'https://facebook.com/test', icon: Enum_Componentmenuconfigmenu_Icon.Facebook },
        { name: 'Instagram', url: 'https://instagram.com/test', icon: Enum_Componentmenuconfigmenu_Icon.Instagram },
        { name: 'Github', url: 'https://github.com/test', icon: Enum_Componentmenuconfigmenu_Icon.Github },
        { name: 'LinkedIn', url: 'https://linkedin.com/test', icon: Enum_Componentmenuconfigmenu_Icon.Linkedin },
      ];
      const mocks = [createMenuQueryMock({ socialIcons })];

      const { container } = renderNavbar({}, mocks);

      await waitFor(() => {
        const facebookLink = container.querySelector('a[href="https://facebook.com/test"]');
        const instagramLink = container.querySelector('a[href="https://instagram.com/test"]');
        const githubLink = container.querySelector('a[href="https://github.com/test"]');
        const linkedinLink = container.querySelector('a[href="https://linkedin.com/test"]');

        expect(facebookLink).toBeInTheDocument();
        expect(instagramLink).toBeInTheDocument();
        expect(githubLink).toBeInTheDocument();
        expect(linkedinLink).toBeInTheDocument();
      });
    });

    test('should apply correct styling to social icons', async () => {
      const socialIcons = [
        { name: 'Facebook', url: 'https://facebook.com', icon: Enum_Componentmenuconfigmenu_Icon.Facebook },
      ];
      const mocks = [createMenuQueryMock({ socialIcons })];

      const { container } = renderNavbar({}, mocks);

      await waitFor(() => {
        const link = container.querySelector('a[href="https://facebook.com"]');
        expect(link).toHaveClass('text-white', 'uppercase', 'font-bold');
      });
    });
  });

  describe('brand rendering', () => {
    test('should render brand name', async () => {
      const mocks = [createMenuQueryMock({ brandName: 'Awesome Brand' })];

      renderNavbar({}, mocks);

      await waitFor(() => {
        expect(screen.getByText('Awesome Brand')).toBeInTheDocument();
      });
    });

    test('should render brand logo', async () => {
      const brand = {
        thumbnail: {
          url: 'https://example.com/brand-logo.png',
          width: 35,
          height: 35,
        },
      };
      const mocks = [createMenuQueryMock({ brand })];

      const { container } = renderNavbar({}, mocks);

      await waitFor(() => {
        const logo = container.querySelector('img[src="https://example.com/brand-logo.png"]');
        expect(logo).toBeInTheDocument();
      });
    });

    test('should render brand as link to home', async () => {
      const mocks = [createMenuQueryMock({ brandName: 'Test Brand' })];

      const { container } = renderNavbar({}, mocks);

      await waitFor(() => {
        const brandLink = container.querySelector('a[href="/"]');
        expect(brandLink).toHaveTextContent('Test Brand');
      });
    });

    test('should handle missing brand logo', async () => {
      const mocks = [createMenuQueryMock({ brand: null })];

      renderNavbar({}, mocks);

      await waitFor(() => {
        expect(screen.getByText('Test Brand')).toBeInTheDocument();
      });

      // Should still render without logo
    });
  });

  describe('mobile toggle functionality', () => {
    test('should render mobile toggle button', async () => {
      const mocks = [createMenuQueryMock()];

      const { container } = renderNavbar({}, mocks);

      await waitFor(() => {
        const button = container.querySelector('button.md\\:hidden');
        expect(button).toBeInTheDocument();
      });
    });

    test('should toggle mobile menu on button click', async () => {
      const mocks = [createMenuQueryMock()];

      const { container } = renderNavbar({}, mocks);

      await waitFor(() => {
        expect(screen.getByText('Test Brand')).toBeInTheDocument();
      });

      const toggleButton = container.querySelector('button.md\\:hidden');

      // Initially hidden on mobile
      let nav = container.querySelector('nav.hidden');
      expect(nav).toBeInTheDocument();

      // Click to open
      fireEvent.click(toggleButton);
      nav = container.querySelector('nav.flex');
      expect(nav).toBeInTheDocument();

      // Click to close
      fireEvent.click(toggleButton);
      nav = container.querySelector('nav.hidden');
      expect(nav).toBeInTheDocument();
    });

    test('should change icon when mobile menu is open', async () => {
      const mocks = [createMenuQueryMock()];

      const { container } = renderNavbar({}, mocks);

      await waitFor(() => {
        expect(screen.getByText('Test Brand')).toBeInTheDocument();
      });

      const toggleButton = container.querySelector('button.md\\:hidden');

      // Initially shows hamburger icon (3 horizontal lines)
      let paths = toggleButton.querySelectorAll('path');
      expect(paths.length).toBeGreaterThan(0);

      // Click to open - should show close icon (X)
      fireEvent.click(toggleButton);
      paths = toggleButton.querySelectorAll('path');
      expect(paths.length).toBeGreaterThan(0);
    });
  });

  describe('additional main menu (dropdown)', () => {
    test('should render additional main menu items', async () => {
      const additionalMainMenu: MenuType[] = [
        { name: 'Gallery', url: '/gallery' },
      ];
      const mocks = [createMenuQueryMock()];

      renderNavbar({ additionalMainMenu }, mocks);

      await waitFor(() => {
        expect(screen.getByText('Gallery')).toBeInTheDocument();
      });
    });

    test('should render dropdown with children', async () => {
      const additionalMainMenu: MenuType[] = [
        {
          name: 'Categories',
          url: '/categories',
          children: [
            { name: 'Nature', url: '/categories/nature' },
            { name: 'Urban', url: '/categories/urban' },
          ],
        },
      ];
      const mocks = [createMenuQueryMock()];

      renderNavbar({ additionalMainMenu }, mocks);

      await waitFor(() => {
        expect(screen.getByText('Categories')).toBeInTheDocument();
      });
    });

    test('should toggle dropdown on button click', async () => {
      const additionalMainMenu: MenuType[] = [
        {
          name: 'Categories',
          url: '/categories',
          children: [
            { name: 'Nature', url: '/categories/nature' },
            { name: 'Urban', url: '/categories/urban' },
          ],
        },
      ];
      const mocks = [createMenuQueryMock()];

      const { container } = renderNavbar({ additionalMainMenu }, mocks);

      await waitFor(() => {
        expect(screen.getByText('Categories')).toBeInTheDocument();
      });

      // Dropdown initially closed
      expect(screen.queryByText('Nature')).not.toBeInTheDocument();

      // Find and click the dropdown button
      const dropdownButton = screen.getByText('Categories').closest('button');
      fireEvent.click(dropdownButton);

      // Dropdown should open
      await waitFor(() => {
        expect(screen.getByText('Nature')).toBeInTheDocument();
        expect(screen.getByText('Urban')).toBeInTheDocument();
      });

      // Click again to close
      fireEvent.click(dropdownButton);

      await waitFor(() => {
        expect(screen.queryByText('Nature')).not.toBeInTheDocument();
      });
    });

    test('should apply height class for menus with more than 6 children', async () => {
      const additionalMainMenu: MenuType[] = [
        {
          name: 'Large Menu',
          url: '/large',
          children: Array.from({ length: 7 }, (_, i) => ({
            name: `Item ${i + 1}`,
            url: `/item-${i + 1}`,
          })),
        },
      ];
      const mocks = [createMenuQueryMock()];

      const { container } = renderNavbar({ additionalMainMenu }, mocks);

      await waitFor(() => {
        expect(screen.getByText('Large Menu')).toBeInTheDocument();
      });

      const dropdownButton = screen.getByText('Large Menu').closest('button');
      fireEvent.click(dropdownButton);

      await waitFor(() => {
        const dropdownContent = container.querySelector('.h-64');
        expect(dropdownContent).toBeInTheDocument();
      });
    });

    test('should render menu without children as direct link', async () => {
      const additionalMainMenu: MenuType[] = [
        { name: 'Simple Link', url: '/simple' },
      ];
      const mocks = [createMenuQueryMock()];

      const { container } = renderNavbar({ additionalMainMenu }, mocks);

      await waitFor(() => {
        const link = container.querySelector('a[href="/simple"]');
        expect(link).toBeInTheDocument();
        expect(link).toHaveTextContent('Simple Link');
      });
    });

    test('should show dropdown arrow icon for menus with children', async () => {
      const additionalMainMenu: MenuType[] = [
        {
          name: 'Has Children',
          url: '/parent',
          children: [{ name: 'Child', url: '/child' }],
        },
      ];
      const mocks = [createMenuQueryMock()];

      const { container } = renderNavbar({ additionalMainMenu }, mocks);

      await waitFor(() => {
        const button = screen.getByText('Has Children').closest('button');
        const svg = button.querySelector('svg');
        expect(svg).toBeInTheDocument();
      });
    });
  });

  describe('styling and layout', () => {
    test('should apply correct background colors', async () => {
      const mocks = [createMenuQueryMock()];

      const { container } = renderNavbar({}, mocks);

      await waitFor(() => {
        const topBar = container.querySelector('.bg-black');
        const mainBar = container.querySelector('.bg-white');
        expect(topBar).toBeInTheDocument();
        expect(mainBar).toBeInTheDocument();
      });
    });

    test('should apply max-width container classes', async () => {
      const mocks = [createMenuQueryMock()];

      const { container } = renderNavbar({}, mocks);

      await waitFor(() => {
        const containers = container.querySelectorAll('.max-w-screen-xl');
        expect(containers.length).toBeGreaterThan(0);
      });
    });
  });

  describe('edge cases', () => {
    test('should handle empty top menu', async () => {
      const mocks = [createMenuQueryMock({ topMenu: [] })];

      renderNavbar({}, mocks);

      await waitFor(() => {
        expect(screen.getByText('Test Brand')).toBeInTheDocument();
      });
    });

    test('should handle empty main menu', async () => {
      const mocks = [createMenuQueryMock({ mainMenu: [] })];

      renderNavbar({}, mocks);

      await waitFor(() => {
        expect(screen.getByText('Test Brand')).toBeInTheDocument();
      });
    });

    test('should handle empty social icons', async () => {
      const mocks = [createMenuQueryMock({ socialIcons: [] })];

      renderNavbar({}, mocks);

      await waitFor(() => {
        expect(screen.getByText('Test Brand')).toBeInTheDocument();
      });
    });

    test('should handle menu items with special characters', async () => {
      const topMenu = [{ name: 'About & Contact', url: '/about' }];
      const mocks = [createMenuQueryMock({ topMenu })];

      renderNavbar({}, mocks);

      await waitFor(() => {
        expect(screen.getByText('About & Contact')).toBeInTheDocument();
      });
    });
  });
});
