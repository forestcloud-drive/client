export const Copyright = () => {
  return (
    <div className="p-4 text-center text-xs text-gray-500">
      <a
        href="https://github.com/ForestCloud-26r/forest-cloud/blob/main/LICENSE"
        target="_blank"
        rel="noopener noreferrer"
      >
        © {new Date().getFullYear()} Forest Cloud. MIT licensed.
      </a>
    </div>
  );
};
