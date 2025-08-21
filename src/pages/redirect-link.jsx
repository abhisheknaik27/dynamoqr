import { getLongUrl } from "@/db/apiUrls";
import { storeClicks } from "@/db/apiClicks";
import useFetch from "@/hooks/use-fetch";
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { BarLoader } from "react-spinners";

const RedirectLink = () => {
  const { id } = useParams();
  const { loading, data, fn } = useFetch(getLongUrl, id);

  const { loading: loadingStats, fn: fnStats } = useFetch(storeClicks, {
    id: data?.id,
    dynamic_url: data?.dynamic_url,
  });

  useEffect(() => {
    fn();
  }, []);

  useEffect(() => {
    if (!loading && data) {
      fnStats();
      window.location.href = data.dynamic_url;
      console.log(data.dynamic_url);
    }
  }, [loading, data]);

  if (loading || loadingStats) {
    return (
      <>
        <BarLoader width="100%" color="#2e5bf0" /> <br /> Redirecting...
      </>
    );
  }
  return null;
};

export default RedirectLink;
