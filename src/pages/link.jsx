import { Button } from "@/components/ui/button";
import { UrlState } from "@/context";
import { deleteUrl, getUrl, updateUrl } from "@/db/apiUrls";
import useFetch from "@/hooks/use-fetch";
import { Copy, Download, LinkIcon, Pen, Trash } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BarLoader, BeatLoader } from "react-spinners";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Location from "@/components/location-stats";
import DeviceStats from "@/components/device-stats";
import { getClicksforUrl } from "@/db/apiClicks";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const Link = () => {
  const { id } = useParams();
  const { user } = UrlState();
  const navigate = useNavigate();
  const [showDialog, setShowDialog] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    loading,
    data: url,
    fn,
    error,
  } = useFetch(getUrl, { id, user_id: user?.id });

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

  const {
    loading: loadingStats,
    data: stats,
    fn: fnStats,
  } = useFetch(getClicksforUrl, id);

  const { loading: loadingDelete, fn: fnDelete } = useFetch(deleteUrl, id);

  useEffect(() => {
    fn();
    fnStats();
  }, []);

  if (error) {
    navigate("/dashboard");
  }
  console.log(url);

  const handleUpdate = async () => {
    // This log is the most important debugging tool we have right now
    console.log("Attempting update with:", {
      urlId: id,
      userId: user?.id,
      newUrlValue: newUrl,
    });

    if (!user || !user.id) {
      console.error("Update aborted: User or User ID is not available.");
      // Optionally, show a toast notification to the user here
      return;
    }

    setIsUpdating(true);
    try {
      await updateUrl({
        id: id,
        user_id: user.id,
        dynamic_url: newUrl,
      });

      fn();
      setShowDialog(false);
    } catch (e) {
      console.error("Failed to update URL:", e);
    } finally {
      setIsUpdating(false);
    }
  };
  return (
    <>
      {(loading || loadingStats) && (
        <BarLoader className="mb-4" width={"100%"} color="#36d7b7" />
      )}
      <div className="flex flex-col gap-8 sm:flex-row justify-between m-4">
        <div className="flex flex-col items-start gap-8 rounded-lg sm:w-2/5">
          <span className="text-5xl font-extrabold hover:underline cursor-pointer">
            {url?.title}
          </span>
          <a
            className="text-3xl sm:text-4xl text-blue-400 font-bold hover:underline"
            href={`https://dynamoqr.in/${url?.static_url}`}
            target="_blank"
          >
            https://dynamoqr.in/{url?.static_url}
          </a>
          <div className="flex items-center gap-2 w-full">
            <a
              className="flex items-center gap-1 hover:underline cursor-pointer font-bold "
              href={url?.dynamic_url}
              target="_blank"
            >
              <LinkIcon />
              {url?.dynamic_url}
            </a>

            <Dialog
              open={showDialog}
              onOpenChange={(isOpen) => {
                setShowDialog(isOpen);
                // When the dialog opens, pre-fill the input with the current URL
                if (isOpen) {
                  setNewUrl(url?.dynamic_url);
                }
              }}
            >
              <DialogTrigger asChild>
                <Button variant="ghost">
                  <Pen size={18} />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Edit Dynamic URL</DialogTitle>
                </DialogHeader>
                <Input
                  id="newUrl"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://your-new-destination.com"
                />
                <DialogFooter>
                  <Button
                    type="submit"
                    onClick={handleUpdate}
                    disabled={isUpdating || !user}
                  >
                    {isUpdating ? (
                      <BeatLoader size={8} color="white" />
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <span className="flex items-end font-extralight text-sm">
            {new Date(url?.created_at).toLocaleString()}
          </span>
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
            <Button variant="ghost" onClick={() => fnDelete()}>
              {loadingDelete ? <BeatLoader size={5} color="grey" /> : <Trash />}
            </Button>
          </div>
          <img
            className="w-full self-center sm:self-start object-contain ring ring-black p-1"
            src={url?.qr}
            alt="qr code"
          />
        </div>
        <Card className="sm:w-3/5">
          <CardHeader>
            <CardTitle className="text-4xl font-extrabold">Stats</CardTitle>
          </CardHeader>

          {stats && stats?.length ? (
            <CardContent className="flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Total Clicks</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{stats?.length}</p>
                </CardContent>
              </Card>

              <CardTitle>Location Data</CardTitle>
              <Location stats={stats} />
              <CardTitle>Device Info</CardTitle>
              <DeviceStats stats={stats} />
            </CardContent>
          ) : (
            <CardContent>
              {loadingStats === false
                ? "No statistics yet"
                : "Loading statistics..."}
            </CardContent>
          )}
        </Card>
      </div>
    </>
  );
};

export default Link;
