import styles from "./Switch.module.scss";

const Switch = ({ className = "", value, onChange, ...restProps }) => {
  return (
    <label
      className={`${styles.label} ${
        value ? styles.labelChecked : ""
      } ${className}`}
    >
      <input
        type="checkbox"
        className={styles.input}
        value={value}
        onChange={onChange}
        {...restProps}
      />
      <span className={styles.circle} />
    </label>
  );
};

export default Switch;
