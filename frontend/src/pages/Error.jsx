import React from "react";
import { useRouteError } from "react-router-dom";
import PageContent from "../UI/PageContent.jsx";

const ErrorPage = () => {
  const error = useRouteError();

  let title = "An error occured";
  let message = "something went wrong";

  if (error.status === 500) {
    message = error.data.message;
  }
  // if(error.status===404){
  //     title='Not found'
  //     message = 'Could not find resource or page'
  // }

  return (
    <>
      <PageContent title={title}>{message}</PageContent>
    </>
  );
};

export default ErrorPage;
