import React, { useState, useEffect } from "react";
import cn from "classnames";
import styles from "./Catalog.module.sass";
import Icon from "../../../components/Icon";
import Card from "../../../components/Card";

const Catalog = ({ id }) => {
  const [blogs, setBlogs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/blogs?page=${page}&limit=6`
        );

        const data = await res.json();
        setBlogs(data.blogs || []);
        setTotalPages(data.pagination.totalPages || 1);
        setPage(data.pagination.page || 1);
      } catch (err) {
        console.error("Error fetching blogs:", err);
      }
    };

    fetchBlogs();
  }, [page]);
  return (
    <div className={cn("section", styles.section)}>
      <div className={cn("container", styles.container)}>
        <div className={styles.list}>
          {blogs
            .filter((x) => Number(x.id) !== Number(id))
            .map((x, index) => (
              <Card className={styles.card} item={x} key={index} />
            ))}
        </div>
        <div className={styles.btns}>
          {!(page >= totalPages) && (
            <button
              className={cn("button-stroke button-small", styles.button)}
              onClick={() => {
                if (page < totalPages) {
                  setPage(page + 1);
                }
              }}
            >
              <span>Learn more</span>
              <Icon name="arrow-down" size="16" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Catalog;
