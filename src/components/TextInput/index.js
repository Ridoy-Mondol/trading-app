import React, { useState } from "react";
import cn from "classnames";
import styles from "./TextInput.module.sass";
import Icon from "../Icon";
import { FiEyeOff } from "react-icons/fi";

const TextInput = ({
  className,
  classLabel,
  classInput,
  label,
  empty,
  view,
  icon,
  note,
  type = "text",
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const inputType = view ? (showPassword ? "text" : type) : type;

  return (
    <div
      className={cn(
        styles.field,
        { [styles.empty]: empty },
        { [styles.view]: view },
        { [styles.icon]: icon },
        className
      )}
    >
      {label && <div className={cn(classLabel, styles.label)}>{label}</div>}

      <div className={styles.wrap}>
        <input
          className={cn(classInput, styles.input)}
          {...props}
          type={inputType}
        />

        {view && (
          <button
            className={styles.toggle}
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <FiEyeOff size={24} /> : <Icon name="eye" size="24" />}
          </button>
        )}

        {icon && (
          <div className={styles.preview}>
            <Icon name={icon} size="24" />
          </div>
        )}

        {note && <div className={styles.note}>{note}</div>}
      </div>
    </div>
  );
};

export default TextInput;
