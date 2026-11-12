import { useState, useEffect } from "react";
import api, { resolveImageUrl } from "../services/api";

export default function useResume() {
  const [cvUrl, setCvUrl] = useState("#");

  useEffect(() => {
    let cancelled = false;
    api.get("/resume/")
      .then(res => {
        if (cancelled) return;
        if (res.data && res.data.file_url) {
          setCvUrl(resolveImageUrl(res.data.file_url));
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  return cvUrl;
}