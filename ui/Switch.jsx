import styles from "./Switch.module.scss";

const Switch = ({ className = "", ...restProps }) => {
  return (
    <label
      className={`${styles.label} ${
        restProps.checked ? styles.labelChecked : ""
      } ${className}`}
    >
      <input type="checkbox" className={styles.input} {...restProps} />
      <span className={styles.circle} />
    </label>
  );
};

export default Switch;
