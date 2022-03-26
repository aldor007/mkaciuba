import { useEffect} from "react";
import { useLocation } from "react-router-dom";
import ReactGA from "react-ga4";

const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    ReactGA.initialize('G-E3DVVZK3EW', {gtagOptions: {debug_mode : true}});
    ReactGA.send('pageview')
  }, [location]);
};

export default usePageTracking;
