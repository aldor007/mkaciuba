import { useEffect, memo } from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';

const scrollTo = (scrollnumber = 0): number =>
  window.requestAnimationFrame(() => {
    window.scrollTo(0, scrollnumber);
  });

const getScrollPage = (): number => {
  let docScrollTop = 0;
  if (document.documentElement && document.documentElement !== null) {
    docScrollTop = document.documentElement.scrollTop;
  }
  return window.pageYOffset || docScrollTop;
};

export const DefaultKey = 'init-enter';

interface IProps {
  visitedUrl: Map<string, number>;
}

function ScrollRestoration({
  history,
  visitedUrl,
}: RouteComponentProps & IProps) {
  const handlePopStateChange = () => {
    const { location } = history;
    const { key } = location;
    const existingRecord = visitedUrl.get(key || DefaultKey);

    if (existingRecord !== undefined) {
      scrollTo(existingRecord);
    }
  };

  useEffect(() => {
    window.addEventListener('popstate', handlePopStateChange);
    return () => {
      window.removeEventListener('popstate', handlePopStateChange);
    };
  }, []);

  return null;
}

export default withRouter(
  memo(ScrollRestoration, (prevProps, nextProps) => {
    const { location: prevLoaction, visitedUrl, history } = prevProps;
    const { location: nextLoaction } = nextProps;

    const key = prevLoaction.key || DefaultKey;

    const locationChanged =
      (nextLoaction.pathname !== prevLoaction.pathname ||
        nextLoaction.search !== prevLoaction.search) &&
      nextLoaction.hash === '';

    const scroll = getScrollPage();

    if (locationChanged) {
      if (history.action !== 'POP') {
        scrollTo(0);
        visitedUrl.set(key, scroll);
      } else {
        visitedUrl.set(key, scroll);
      }
    }

    return false;
  })
);
