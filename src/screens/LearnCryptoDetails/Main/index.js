import React from "react";
import cn from "classnames";
import styles from "./Main.module.sass";
import Breadcrumbs from "../../../components/Breadcrumbs";

const Main = ({ blog }) => {
  const breadcrumbs = [
    {
      title: "Learn crypto",
      url: "/learn-crypto",
    },
    {
      title: blog.category,
      url: "/learn-crypto",
    },
  ];
  return (
    <div className={cn("section", styles.main)}>
      <div className={cn("container", styles.container)}>
        <div className={styles.head}>
          <h1 className={cn("h1", styles.title)}>{blog.title}</h1>
          <Breadcrumbs className={styles.breadcrumbs} items={breadcrumbs} />
        </div>
        <div className={styles.media}>
          <img src={blog.media} alt="Preview" />
        </div>
      </div>
    </div>
  );
};

export default Main;
