interface TabProperties {
  className: string;
  text: string;
  onClick: () => void;
}

export const Tab = ({ className, text, onClick }: TabProperties) => {
  return (
    <>
      <button className={className} onClick={onClick}>
        {text}
      </button>
    </>
  );
};
