import React from "react";
import cn from "classnames";
import styles from "./Article.module.sass";
import Share from "../../../components/Share";
import Favorite from "../../../components/Favorite";

const Article = ({ blog }) => {
  return (
    <div className={cn("section", styles.main)}>
      <div className={cn("container", styles.container)}>
        <div
          className={styles.content}
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
        <div className={styles.actions}>
          <Share openUp />
          <Favorite className={styles.favorite} />
        </div>
      </div>
    </div>
  );
};

export default Article;
