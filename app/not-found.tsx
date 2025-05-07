import Header from "@/components/common/header/header";
import ErrorPage from "@/components/sections/404page/404";
import React from "react";

const Error = () => {
  return (
    <div>
      <div className="pt-10">
        <Header />
      </div>
      <ErrorPage />
    </div>
  );
};

export default Error;
