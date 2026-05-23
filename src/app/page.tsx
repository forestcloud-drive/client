import Link from 'next/link';
import DefaultLinkButton from '@/components/buttons/DefaultLinkButton';
import Head from 'next/head';
import { BackgroundImage } from '@/components/BackgroundImage';

export default function Home() {
  return (
    <>
      <Head>
        <link rel="preload" as="image" href="/background.jpg" />
      </Head>
      <main className="relative min-h-screen flex items-center justify-center">
        <BackgroundImage />

        <div className="relative z-10 bg-white/70 backdrop-blur-md rounded-2xl p-10 shadow-md text-center m-3">
          <h1 className="text-4xl font-bold mb-4 text-green-800">
            Welcome to Forest Cloud
          </h1>
          <p className="text-base md:text-lg mb-8 text-gray-700 leading-relaxed">
            🌲☁️ Your private digital forest – secure, self-hosted & open
            source.
            <br className="hidden md:block" />
            Take back control of your data 🌿💚
          </p>
          <div className="flex flex-col gap-4 items-center">
            <DefaultLinkButton href={'/auth'} text={'Get Started'} />
            <Link
              href="https://github.com/ForestCloud-26r/docs"
              target="_blank"
              className="text-sm text-green-800 underline"
            >
              Need help? <b>See the documentation</b>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
