async function getData() {
  try {
  } catch (e) {
    const res = await fetch(
      "https://www.random.org/integers/?num=1&min=1&max=100&col=1&base=10&format=plain",
      {
        next: {
          revalidate: 5,
        },
      },
    )

    if (!res.ok) {
      throw new Error("Failed to fetch data")
    }

    return res.json()
  }
}

export default async function Page() {
  const data = await getData()

  return (
    <main className="text-center min-h-screen py-40">
      <h1 className="font-bold text-xl">ISR</h1>
      <h2>number: {data}</h2>
    </main>
  )
}
