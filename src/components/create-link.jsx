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
    dynamic_url: longLink ? longLink : "",
    static_url: "",
  });

  const schema = yup.object().shape({
    title: yup.string().required("Title is required"),
    dynamic_url: yup
      .string()
      .url("URL must be valid")
      .required("URL is required"),
    static_url: yup.string(),
  });

  const handleChange = (e) => {
    setFormValues({
      ...formValues,
      [e.target.id]: e.target.value,
    });
  };

  const {
    loading,
    error,
    data,
    fn: fnCreateUrl,
  } = useFetch(createUrl, { ...formValues, user_id: user.id });

  useEffect(() => {
    if (error === null && data) {
      navigate(`/link/${data[0].id}`);
    }
  }, [error, data]);

  const createNewUrl = async () => {
    setErrors([]);
    try {
      await schema.validate(formValues, { abortEarly: false });
      const canvas = ref.current.canvasRef.current;
      const blob = await new Promise((resolve) => canvas.toBlob(resolve));
      await fnCreateUrl(blob);
    } catch (error) {
      const newErrors = {};
      error?.inner?.forEach((err) => {
        newErrors[err.path] = err.message;
      });
      setErrors(newErrors);
    }
  };

  return (
    <Dialog
      defaultOpen={longLink}
      onOpenChange={(res) => {
        if (!res) setSearchParams({});
      }}
    >
      <DialogTrigger>
        <Button variant="outline">Create</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-bold gradient-title text-2xl">
            Create New QR
          </DialogTitle>
        </DialogHeader>

        {formValues?.dynamic_url && (
          <QRCode value={formValues?.dynamic_url} size={200} ref={ref} />
        )}
        <Input
          id="title"
          type="text"
          placeholder="Enter Title"
          value={formValues.title}
          onChange={handleChange}
        />
        {errors && <Error message={errors.title} />}

        <Input
          id="url"
          type="text"
          placeholder="Enter Your Link"
          value={formValues.dynamic_url}
          onChange={handleChange}
        />
        {errors && <Error message={errors.dynamic_url} />}

        <DialogFooter className="sm:justify-start">
          <Button disabled={loading} onClick={createNewUrl}>
            {loading ? <BeatLoader size={10} color="grey" /> : "Create"}
          </Button>
        </DialogFooter>
        {error && <Error message={error.message} />}
      </DialogContent>
    </Dialog>
  );
};

export default CreateLink;
