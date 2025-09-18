import React, { useState, useEffect } from "react";
import cn from "classnames";
import styles from "./Learn.module.sass";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import Icon from "../../../components/Icon";

const categories = [
  "Trading",
  "News",
  "Bitcoin",
  "Ethereum",
  "Altcoins",
  "Blockchain",
  "XPR",
];

const SlickArrow = ({ currentSlide, slideCount, children, ...props }) => (
  <button {...props}>{children}</button>
);

const Learn = ({ scrollToRef }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [navigation, setNavigation] = useState(categories[0]);
  const [blogs, setBlogs] = useState([]);

  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    adaptiveHeight: true,
    nextArrow: (
      <SlickArrow>
        <Icon name="arrow-next" size="14" />
      </SlickArrow>
    ),
    prevArrow: (
      <SlickArrow>
        <Icon name="arrow-prev" size="14" />
      </SlickArrow>
    ),
    responsive: [
      {
        breakpoint: 100000,
        settings: "unslick",
      },
      {
        breakpoint: 1179,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 767,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

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
    <div className={cn("section", styles.section)} ref={scrollToRef}>
      <div className={cn("container", styles.container)}>
        <div className={styles.head}>
          <div className={styles.wrap}>
            <h2 className={cn("h2", styles.title)}>Learn crypto</h2>
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
          </div>
          <Link
            className={cn("button-stroke", styles.button)}
            to="/learn-crypto"
          >
            View more
          </Link>
        </div>
        <div className={styles.wrapper}>
          <Slider className={cn("learn-slider", styles.slider)} {...settings}>
            {blogs.map((x, index) =>
              index < 1 ? (
                <Link
                  className={styles.item}
                  to={`/learn-crypto-details/${x.id}`}
                  key={index}
                >
                  <div className={cn(styles.preview, styles.featuredImg)}>
                    <img srcSet={`${x.media} 2x`} src={x.media} alt="Card" />
                  </div>
                  <div className={styles.line}>
                    <div className={styles.wrap}>
                      <div className={styles.subtitle}>{x.title}</div>
                      <div
                        className={styles.content}
                        dangerouslySetInnerHTML={{
                          __html:
                            x.content.length > 120
                              ? x.content.slice(0, 120) + "..."
                              : x.content,
                        }}
                      />
                    </div>
                    <button className={cn("button-stroke", styles.button)}>
                      <span>Learn more</span>
                      <Icon name="arrow-right" size="16" />
                    </button>
                  </div>
                </Link>
              ) : (
                <Link
                  className={styles.item}
                  to={`/learn-crypto-details/${x.id}`}
                  key={index}
                >
                  <div className={styles.preview}>
                    <img srcSet={`${x.media} 2x`} src={x.media} alt="Card" />
                  </div>
                  <div className={styles.details}>
                    <div className={styles.subtitle}>{x.title}</div>
                    <div
                      className={styles.content}
                      dangerouslySetInnerHTML={{
                        __html:
                          x.content.length > 120
                            ? x.content.slice(0, 120) + "..."
                            : x.content,
                      }}
                    />
                    {x.createdAt && (
                      <div className={styles.date}>
                        {new Date(x.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    )}
                  </div>
                </Link>
              )
            )}
          </Slider>
        </div>
      </div>
    </div>
  );
};

export default Learn;
