import { UrlState } from "@/context";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import Error from "./error";
import * as yup from "Yup";
import { QRCode } from "react-qrcode-logo";
import useFetch from "@/hooks/use-fetch";
import { createUrl } from "@/db/apiUrls";
import { BeatLoader } from "react-spinners";

const CreateLink = () => {
  const { user } = UrlState();
  const navigate = useNavigate();
  const ref = useRef();
  const [searchParams, setSearchParams] = useSearchParams();
  const longLink = searchParams.get("createNew");

  const [errors, setErrors] = useState({});
  const [formValues, setFormValues] = useState({
    title: "",
    dynamic_url: longLink || "",
  });

  // State to hold the generated short, static URL
  const [shortUrl, setShortUrl] = useState("");

  // This function now also generates a new short URL every time the dialog is opened
  const handleOpenChange = (isOpen) => {
    if (isOpen) {
      // Generate a random 8-character string for the static URL
      setShortUrl(Math.random().toString(36).substring(2, 10));
    } else {
      setSearchParams({});
    }
  };

  const schema = yup.object().shape({
    title: yup.string().required("Title is required"),
    dynamic_url: yup
      .string()
      .url("URL must be a valid URL")
      .required("Destination URL is required"),
  });

  const handleChange = (e) => {
    setFormValues({
      ...formValues,
      [e.target.id]: e.target.value,
    });
  };

  // Pass the generated shortUrl to the useFetch hook payload
  const {
    loading,
    error,
    data,
    fn: fnCreateUrl,
  } = useFetch(createUrl, {
    ...formValues,
    user_id: user.id,
    static_url: shortUrl,
  });

  useEffect(() => {
    if (!error && data) {
      navigate(`/link/${data[0].id}`);
    }
  }, [error, data, navigate]);

  const createNewUrl = async () => {
    setErrors({});
    try {
      await schema.validate(formValues, { abortEarly: false });
      const canvas = ref.current.canvasRef.current;
      const blob = await new Promise((resolve) => canvas.toBlob(resolve));

      // The useFetch hook already has the correct payload, just trigger it
      await fnCreateUrl(blob);
    } catch (e) {
      const newErrors = {};
      e?.inner?.forEach((err) => {
        newErrors[err.path] = err.message;
      });
      setErrors(newErrors);
    }
  };

  // The URL that will be encoded into the QR code image
  // It points back to your application
  const staticQrUrl = `${window.location.origin}/${shortUrl}`;

  return (
    <Dialog defaultOpen={!!longLink} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">Create New Link</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-bold gradient-title text-2xl">
            Create Dynamic QR
          </DialogTitle>
        </DialogHeader>

        {/* The QR Code now encodes the static URL */}
        {shortUrl && (
          <div className="flex flex-col items-center gap-4 p-4 border rounded-lg bg-gray-50">
            <QRCode value={staticQrUrl} size={200} ref={ref} />
            <a
              href={staticQrUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-blue-600 hover:underline"
            >
              {staticQrUrl}
            </a>
            <p className="text-sm text-center text-gray-600">
              This QR code is permanent. You can change the destination URL it
              points to at any time.
            </p>
          </div>
        )}

        <Input
          id="title"
          type="text"
          placeholder="Short Link Title"
          value={formValues.title}
          onChange={handleChange}
        />
        {errors.title && <Error message={errors.title} />}

        <Input
          id="dynamic_url"
          type="url"
          placeholder="Enter Destination URL"
          value={formValues.dynamic_url}
          onChange={handleChange}
        />
        {errors.dynamic_url && <Error message={errors.dynamic_url} />}

        <DialogFooter className="sm:justify-start">
          <Button type="button" onClick={createNewUrl} disabled={loading}>
            {loading ? <BeatLoader size={10} color="white" /> : "Create Link"}
          </Button>
        </DialogFooter>
        {error && <Error message={error.message} />}
      </DialogContent>
    </Dialog>
  );
};

export default CreateLink;
