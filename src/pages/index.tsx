import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>Score Four</title>
        <meta name="description" content="First attempt at using create-t3-app, tailwind" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#fff] to-[#ccc]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-black sm:text-[5rem]">
            Score Four
          </h1>
        </div>
      </main>
    </>
  );
}
