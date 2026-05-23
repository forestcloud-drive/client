import Image from 'next/image';

export const BackgroundImage = () => {
  return (
    <>
      <div className="absolute inset-0" style={{ zIndex: 0 }}>
        <div className="w-full h-full brightness-75 blur-sm">
          <Image
            src="/background.jpg"
            alt="Background"
            fill
            priority
            className="object-cover object-center"
          />
        </div>
      </div>
    </>
  );
};
