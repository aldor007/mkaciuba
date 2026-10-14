import React, { useCallback, useEffect, useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Footer } from '../../components/Footer';
import { PostNavbar } from '../../components/PostNavbar';
import {
  ErrorPage,
  LoadingMore,
  serializeListingParams,
  useListingParams,
  useSSRSafeQuery,
} from '@mkaciuba/ui-kit';
import { GET_WOOD_PRODUCTS, WoodProductsData } from './queries';
import {
  AVAILABILITY_OPTIONS,
  DEFAULT_WOOD_SORT,
  MATERIAL_OPTIONS,
  WOOD_SORT_OPTIONS,
  WOOD_SORTS,
  buildWoodWhere,
  isAvailabilityValue,
  isMaterialValue,
} from './woodFilters';
import { FilterBar } from './FilterBar';
import { ProductCard } from './ProductCard';
import { QuickView } from './QuickView';
import { GridColumnsControl, getGridClasses, useGridColumns } from './GridColumnsControl';
import { Product } from './types';
import '../../../assets/category.css';

const PAGE_SIZE = 12;

const FACET_GROUPS = [
  { label: 'Materiał', options: MATERIAL_OPTIONS },
  { label: 'Dostępność', options: AVAILABILITY_OPTIONS },
];

/**
 * Woodworking showcase page (/wood) — self-contained addon module.
 * URL is the source of truth for listing state (?sort=, ?tag=, ?page=);
 * grid density is a client-side preference applied post-mount.
 */
export const WoodPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { page, sort, tags: selectedValues } = useListingParams(WOOD_SORTS);
  const effectiveSort = sort || DEFAULT_WOOD_SORT;
  const where = buildWoodWhere(selectedValues);
  const [columns, setColumns] = useGridColumns();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const start = (page - 1) * PAGE_SIZE;
  const { loading, error, data, fetchMore } = useQuery<WoodProductsData>(GET_WOOD_PRODUCTS, {
    variables: { start, limit: PAGE_SIZE, sort: effectiveSort, where },
    notifyOnNetworkStatusChange: true,
  });
  const { shouldShowLoading } = useSSRSafeQuery(loading, data);

  // Cursor for load-more: start offset of the next page for the current listing
  // state. ?page= seeds the initial start (deep links); load-more appends locally,
  // mirroring the site's infinite-scroll listings.
  const [cursor, setCursor] = useState(start + PAGE_SIZE);
  useEffect(() => {
    setCursor(start + PAGE_SIZE);
  }, [start, effectiveSort, selectedValues.join(',')]);

  const applyListing = useCallback(
    (updates: { sort?: string | null; tags?: string[] }) => {
      const nextSort = 'sort' in updates ? updates.sort : sort;
      const nextTags = 'tags' in updates ? updates.tags : selectedValues;
      navigate({
        pathname: location.pathname,
        search: serializeListingParams({ sort: nextSort, tags: nextTags }),
      });
    },
    [navigate, location.pathname, sort, selectedValues]
  );

  const handleSortChange = useCallback(
    (value: string) => {
      // Selecting the default sort drops the param — canonical URL, page resets to 1
      applyListing({ sort: value === DEFAULT_WOOD_SORT ? null : value });
    },
    [applyListing]
  );

  const handleToggleFacet = useCallback(
    (value: string) => {
      // Single-select per facet group: selecting a value replaces the other
      // value from the same group.
      const next = selectedValues.includes(value)
        ? selectedValues.filter((selected) => selected !== value)
        : [
            ...selectedValues.filter((selected) =>
              isMaterialValue(value) ? !isMaterialValue(selected) : !isAvailabilityValue(selected)
            ),
            value,
          ];
      applyListing({ tags: next });
    },
    [applyListing, selectedValues]
  );

  const handleClearAll = useCallback(() => {
    navigate({ pathname: location.pathname, search: '' });
  }, [navigate, location.pathname]);

  const products = data?.products || [];
  const count = data?.productsCount;
  const hasNextPage =
    count === undefined || count === null ? products.length >= PAGE_SIZE : products.length < count;

  const handleLoadMore = useCallback(() => {
    fetchMore({
      variables: { start: cursor, limit: PAGE_SIZE, sort: effectiveSort, where },
      updateQuery: (previousResult, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return previousResult;
        }
        return {
          ...fetchMoreResult,
          products: [...previousResult.products, ...fetchMoreResult.products],
        };
      },
    })
      .then((result) => {
        const loaded = result?.data?.products?.length || 0;
        setCursor((current) => current + loaded);
      })
      .catch(() => {
        // fetchMore failures surface through the query error state
      });
  }, [fetchMore, cursor, effectiveSort, where]);

  if (error) {
    console.error('WoodPage', error);
    return <ErrorPage code={500} message={error.message} />;
  }

  return (
    <>
      <Helmet>
        <title>Woodworking | mkaciuba.pl</title>
        <meta
          name="description"
          content="Ręcznie wykonane przedmioty z drewna — przeglądaj po materiale i dostępności"
        />
      </Helmet>
      <PostNavbar />
      <h1 className="text-center m-5 text-4xl leading-snug font-serif">Woodworking</h1>
      <FilterBar
        sortOptions={WOOD_SORT_OPTIONS}
        defaultSort={DEFAULT_WOOD_SORT}
        sort={sort}
        facetGroups={FACET_GROUPS}
        selectedValues={selectedValues}
        count={count ?? undefined}
        columnsControl={<GridColumnsControl columns={columns} onChange={setColumns} />}
        onSortChange={handleSortChange}
        onToggleFacet={handleToggleFacet}
        onClearAll={handleClearAll}
      />
      {shouldShowLoading || !data ? (
        <LoadingMore />
      ) : (
        <>
          <div className="flex flex-wrap mx-auto overflow-hidden" data-testid="wood-grid">
            {products.map((product) => (
              <div
                className={`mx-auto my-1 px-1 overflow-hidden ${getGridClasses(columns)}`}
                key={product.id}
              >
                <ProductCard product={product} onQuickView={setQuickViewProduct} />
              </div>
            ))}
          </div>
          {products.length === 0 && (
            <p className="text-center text-gray-600 m-8" data-testid="wood-empty">
              Brak produktów spełniających kryteria
            </p>
          )}
          {hasNextPage && (
            <div className="max-w-screen-xl w-full m-4 mx-auto text-center">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                data-testid="wood-load-more"
                className="w-full mx-auto text-center border-4 font-medium px-5 py-3 rounded-xl text-sm font-medium text-gray-600 bg-white outline-none border border-gray-600 hover:bg-gray-600 hover:border-gray-800 hover:text-white transition-all disabled:opacity-50"
              >
                Załaduj więcej
              </button>
            </div>
          )}
        </>
      )}
      <Footer />
      <QuickView product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </>
  );
};
