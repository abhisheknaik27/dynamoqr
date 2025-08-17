import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const LandingPage = () => {
  const [url, setUrl] = useState();
  const navigate = useNavigate();
  const handleUrl = (e) => {
    e.preventDefault();
    if (url) navigate(`/auth?createNew=${url}`);
  };
  return (
    <div>
      <section className="mt-20 pb-12 space-y-10 md:space-y-20 px-5">
        <div className="container mx-auto px-4 md:px-6 text-center space-y-6">
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            One QR... Endless Possibilities
          </Badge>

          <h1 className="gradient-title mx-auto max-w-4xl text-4xl md:text-7xl tracking-tight">
            QR codes that evolve with your content
          </h1>

          <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed mb-6">
            <span className="text-gray-700 font-bold">
              Say goodbye to static QR codes!
            </span>{" "}
            <br />
            With our dynamic QR page, you’re always in control:{" "}
            <span className="opacity-95">
              update links, track scans, and customize experiences in real time
              without changing the code.
            </span>
          </p>

          <form
            onSubmit={handleUrl}
            className="flex flex-col sm:flex-row gap-2 items-center justify-center sm-14 w-full md:w-[60%] mx-auto mt-10"
          >
            <Input
              type="url"
              value={url}
              placeholder="Enter your URL"
              className="border-2 h-10 shadow-inner"
              onChange={(e) => setUrl(e.target.value)}
            />
            <Button
              size="lg"
              className="bg-blue-500 hover:bg-blue-600"
              type="submit"
            >
              Generate Dynamic QR
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
