import Link from 'next/link';

interface DefaultLinkButtonProperties {
  href: string;
  text: string;
}

export const DefaultLinkButton = ({
  href,
  text,
}: DefaultLinkButtonProperties) => {
  return (
    <Link
      href={href}
      className="px-8 py-3 text-lg font-bold bg-green-600 text-white rounded-2xl shadow
                 transition-transform duration-200 ease-in-out
                 hover:bg-green-700 hover:scale-105 cursor-pointer"
    >
      {text}
    </Link>
  );
};

export default DefaultLinkButton;
