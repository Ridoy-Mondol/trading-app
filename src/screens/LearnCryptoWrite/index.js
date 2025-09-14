import React, { useState } from "react";
import cn from "classnames";
import { Editor } from "@tinymce/tinymce-react";
import useDarkMode from "use-dark-mode";
import styles from "./LearnCryptoWrite.module.sass";
import TextInput from "../../components/TextInput";
import Loader from "../../components/Loader";
import Dropdown from "../../components/Dropdown";
import { uploadFileToSupabase } from "../../utilities/uploadToSupabase";

const categories = [
  "Trading",
  "Trading Basics",
  "Market News",
  "Bitcoin",
  "Ethereum",
  "Altcoins",
  "Blockchain",
  "DeFi",
  "NFTs",
  "XPR Network",
  "SNIPS",
];

const LearnCryptoWrite = ({ onSubmitSuccess }) => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const isDark = useDarkMode(false).value;

  const handleEditorChange = (newValue) => {
    setContent(newValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !category || !content) {
      alert("All fields are required");
      return;
    }

    if (!file) {
      alert("You must upload an image file");
      return;
    }

    if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
      alert("Only JPG and PNG images are allowed");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Image size must be less than 2MB");
      return;
    }

    try {
      setLoading(true);

      const fileUrl = await uploadFileToSupabase(file, "Snipverse_uploads");

      if (!fileUrl) {
        alert("File upload failed");
        setLoading(false);
        return;
      }

      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/blogs/write`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            category,
            content,
            fileUrl,
          }),
        }
      );

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        alert(data.message || "Failed to create tutorial");
        return;
      }

      onSubmitSuccess?.();
      alert("Congratulations! Your new blog has been published successfully")
      setTitle("");
      setCategory(categories[0]);
      setContent("");
      setFile(null);
    } catch (err) {
      console.error("Submit tutorial error:", err);
      setLoading(false);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className={styles.main}>
      <div className={styles.head}>
        <div className={cn("h3", styles.title)}>Write a Tutorial</div>
        <div className={styles.info}>
          Share your knowledge about crypto, blockchain, or trading.
        </div>
      </div>

      <form
        className={styles.form}
        onSubmit={handleSubmit}
        encType="multipart/form-data"
      >
        <TextInput
          className={styles.field}
          label="Title"
          placeholder="Enter tutorial title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div className={styles.field}>
          <Dropdown
            label="Category"
            value={category}
            setValue={setCategory}
            options={categories}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Content</label>

          <Editor
            key={isDark ? "dark" : "light"}
            apiKey={process.env.REACT_APP_TINYMCE_API_KEY}
            value={content}
            onEditorChange={handleEditorChange}
            init={{
              height: 500,
              menubar: false,
              plugins: [
                "advlist autolink lists link image charmap preview anchor",
                "searchreplace visualblocks code fullscreen",
                "insertdatetime media table paste help wordcount",
                "emoticons",
              ],
              toolbar:
                "undo redo | formatselect | bold italic underline strikethrough | " +
                "forecolor backcolor | alignleft aligncenter alignright alignjustify | " +
                "bullist numlist outdent indent | link image media table emoticons | " +
                "code fullscreen preview insertdatetime searchreplace",
              skin: isDark ? "oxide-dark" : "oxide",
              content_css: isDark ? "dark" : "default",
              content_style: `
              body {
                background-color: ${isDark ? "#000" : "#fff"};
                color: ${isDark ? "#fff" : "#000"};
                font-family: Arial, sans-serif;
                font-size: 14px;
              }
              `,
              branding: false,
              paste_as_text: true,
            }}
          />
        </div>

        <label className={cn(styles.field, styles.fileUpload)}>
          <span className={styles.fileLabel}>Upload File</span>
          <input
            type="file"
            className={styles.fileInput}
            onChange={(e) => setFile(e.target.files[0])}
          />
          <span className={styles.fileName}>
            {file ? file.name : "No file selected"}
          </span>
        </label>

        <button
          type="submit"
          className={cn("button", styles.button)}
          disabled={loading}
        >
          {loading ? <Loader /> : "Publish Tutorial"}
        </button>
      </form>
    </div>
  );
};

export default LearnCryptoWrite;
