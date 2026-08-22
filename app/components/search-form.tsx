type SearchFormProps = {
  className?: string;
  defaultQuery?: string;
  inputId?: string;
};

export function SearchForm({
  className,
  defaultQuery = "",
  inputId = "site-search",
}: SearchFormProps) {
  return (
    <form
      action="/search"
      method="get"
      className={`searchForm${className ? ` ${className}` : ""}`}
      role="search"
    >
      <label className="srOnly" htmlFor={inputId}>
        חיפוש בחנות
      </label>
      <input
        id={inputId}
        className="searchInput"
        type="search"
        name="q"
        defaultValue={defaultQuery}
        placeholder="חיפוש בגדים, מציאות..."
        autoComplete="off"
      />
      <button className="button miniButton searchSubmit" type="submit">
        חיפוש
      </button>
    </form>
  );
}
