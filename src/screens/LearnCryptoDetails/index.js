import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Main from "./Main";
import Article from "./Article";
import Catalog from "./Catalog";
import Loader from "../../components/Loader";

const LearnCrypto = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/blogs/${id}`
        );
        const data = await res.json();
        setBlog(data.blog);
      } catch (err) {
        console.error("Error fetching blog:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  if (loading) return <Loader />;

  return (
    <>
      <Main blog={blog} />
      <Article blog={blog} />
      <Catalog id={id} />
    </>
  );
};

export default LearnCrypto;
