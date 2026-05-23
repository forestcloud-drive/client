interface DefaultButtonProperties {
  onClick: () => void;
  text: string;
}

export const DefaultButton = ({ onClick, text }: DefaultButtonProperties) => {
  return (
    <>
      <button
        onClick={onClick}
        className="px-8 py-3 text-lg font-bold bg-green-600 text-white rounded-2xl shadow
                 transition-transform duration-200 ease-in-out
                 hover:bg-green-700 hover:scale-105 cursor-pointer"
      >
        {text}
      </button>
    </>
  );
};
