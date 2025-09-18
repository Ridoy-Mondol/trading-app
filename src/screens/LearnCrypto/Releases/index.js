import React, { useState, useEffect } from "react";
import cn from "classnames";
import styles from "./Releases.module.sass";
import Item from "./Item";
import Dropdown from "../../../components/Dropdown";

const categories = [
  "Trading",
  "News",
  "Bitcoin",
  "Ethereum",
  "Altcoins",
  "Blockchain",
  "XPR",
];

const Releases = ({ scrollToRef }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [navigation, setNavigation] = useState(categories[0]);
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/blogs?page=1&limit=3&category=${navigation}`
        );
        const data = await res.json();
        setBlogs(data.blogs || []);
      } catch (err) {
        console.error("Error fetching blogs:", err);
      }
    };

    fetchBlogs();
  }, [navigation]);

  return (
    <div
      className={cn("section-bg section-mb0", styles.releases)}
      ref={scrollToRef}
    >
      <div className={cn("container", styles.container)}>
        <div className={styles.head}>
          <div className={cn("stage-small", styles.stage)}>Our Blog</div>
          <div className={styles.wrap}>
            <h2 className={cn("h2", styles.title)}>Latest Releases</h2>
            <div className={styles.info}>
              Stacks is a production-ready library of stackable content blocks
              built in React Native.
            </div>
            <div className={styles.nav}>
              {categories.map((x, index) => (
                <button
                  className={cn(styles.link, {
                    [styles.active]: index === activeIndex,
                  })}
                  onClick={() => {
                    setActiveIndex(index);
                    setNavigation(categories[index]);
                  }}
                  key={index}
                >
                  {x}
                </button>
              ))}
            </div>
            <div className={styles.field}>
              <Dropdown
                className={styles.dropdown}
                classDropdownHead={styles.dropdownHead}
                value={navigation}
                setValue={setNavigation}
                options={categories}
              />
            </div>
          </div>
        </div>
        <div className={styles.list}>
          {blogs.map((x, index) => (
            <Item className={styles.item} item={x} key={index} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Releases;
