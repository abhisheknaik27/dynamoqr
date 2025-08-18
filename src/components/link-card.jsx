import React from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Copy, Download, Trash } from "lucide-react";
import useFetch from "@/hooks/use-fetch";
import { deleteUrl } from "@/db/apiUrls";
import { BeatLoader } from "react-spinners";

const LinkCard = ({ url, fetchUrls }) => {
  const downloadImage = () => {
    const imageUrl = url?.qr;
    const filename = url?.title;
    const anchor = document.createElement("a");
    anchor.href = imageUrl;
    anchor.download = filename;

    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  const { loading: loadingDelete, fn: fnDelete } = useFetch(deleteUrl, url.id);

  return (
    <div className="flex flex-col mt-6 md:flex-row gap-5 border p-4 bg-gray-100 rounded-lg">
      <img
        className="h-32 object-contain ring ring-black self-start"
        src={url?.qr}
        alt="qr code"
      />
      <Link to={`/link/${url.id}`} className="flex flex-col flex-1">
        <span className="text-3xl font-bold hover:underline cursor-pointer">
          {url?.title}
        </span>
        <span className="text-2xl text-blue-400 font-bold hover:underline cursor-pointer">
          https://dynamoqr.in/
          {url?.custom_url ? url?.custom_url : url.static_url}
        </span>
        <span className="flex items-center gap-1  hover:underline cursor-pointer">
          {url?.dynamic_url}
        </span>
        <span className="flex items-end font-extralight text-sm flex-1 ">
          {new Date(url?.created_at).toLocaleString()}
        </span>
      </Link>

      <div className="flex gap-2 ">
        <Button
          variant="ghost"
          onClick={() => {
            navigator.clipboard.writeText(
              `https://dynamoqr.in/${url?.static_url}`
            );
          }}
        >
          <Copy />
        </Button>
        <Button variant="ghost" onClick={downloadImage}>
          <Download />
        </Button>
        <Button
          variant="ghost"
          onClick={() => fnDelete().then(() => fetchUrls())}
        >
          {loadingDelete ? <BeatLoader size={5} color="grey" /> : <Trash />}
        </Button>
      </div>
    </div>
  );
};

export default LinkCard;
