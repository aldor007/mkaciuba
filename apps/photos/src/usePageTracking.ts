import { useEffect} from "react";
import { useLocation } from "react-router-dom";
import ReactGA from "react-ga4";

const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    ReactGA.initialize('G-E3DVVZK3EW');
    ReactGA.pageview(location.pathname + location.search);
  }, [location]);
};

export default usePageTracking;
