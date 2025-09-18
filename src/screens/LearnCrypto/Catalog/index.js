import React, { useState, useEffect } from "react";
import cn from "classnames";
import styles from "./Catalog.module.sass";
import Icon from "../../../components/Icon";
import Dropdown from "../../../components/Dropdown";
import Card from "../../../components/Card";

const dateOptions = ["Newest first", "Oldest first"];

const categories = [
  "Trading",
  "News",
  "Bitcoin",
  "Ethereum",
  "Altcoins",
  "Blockchain",
  "XPR",
];

const Catalog = ({ scrollToRefCatalog }) => {
  const [date, setDate] = useState(dateOptions[0]);
  const [sorting, setSorting] = useState(categories[0]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [blogs, setBlogs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [submittedSearchTerm, setSubmittedSearchTerm] = useState("");

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch(
          `${
            process.env.REACT_APP_API_BASE_URL
          }/api/blogs?page=${page}&limit=9&category=${sorting}&search=${submittedSearchTerm}&date=${
            date === "Newest first" ? "recent" : "oldest"
          }`
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
  }, [page, sorting, submittedSearchTerm, date]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmittedSearchTerm(searchTerm);
    setPage(1);
  };

  return (
    <div
      className={cn("section-padding section-mb0", styles.section)}
      ref={scrollToRefCatalog}
    >
      <div className={cn("container", styles.container)}>
        <form className={styles.form} action="" onSubmit={handleSubmit}>
          <input
            className={styles.input}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            name="search"
            placeholder="Search anything about crypto"
            required
          />
          <button className={cn("button-circle", styles.result)}>
            <Icon name="search" size="24" />
          </button>
        </form>
        <div className={styles.sorting}>
          <div className={styles.dropdown}>
            <Dropdown
              className={styles.dropdown}
              value={date}
              setValue={setDate}
              options={dateOptions}
            />
          </div>
          <div className={styles.nav}>
            {categories.map((x, index) => (
              <button
                className={cn(styles.link, {
                  [styles.active]: index === activeIndex,
                })}
                onClick={() => {
                  setActiveIndex(index);
                  setSorting(categories[index]);
                }}
                key={index}
              >
                {x}
              </button>
            ))}
          </div>
          <div className={cn("tablet-show", styles.dropdown)}>
            <Dropdown
              className={styles.dropdown}
              value={sorting}
              setValue={setSorting}
              options={categories}
            />
          </div>
        </div>
        <div className={styles.list}>
          {blogs.map((x, index) => (
            <Card className={styles.card} item={x} key={index} />
          ))}
        </div>
        {!(page >= totalPages) && (
          <div className={styles.btns}>
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
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalog;
