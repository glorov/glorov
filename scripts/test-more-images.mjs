const candidates = [
  "https://images.unsplash.com/photo-1597055181300-e3633a207519?auto=format&fit=crop&w=1200&q=80", // peace lily
  "https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=1200&q=80", // plant
  "https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?auto=format&fit=crop&w=1200&q=80", // peace lily / indoor
  "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=1200&q=80", // indoor plant
  "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1200&q=80", // succulent jade
]

for (const u of candidates) {
  const res = await fetch(u, { method: 'HEAD' })
  console.log(`${res.status === 200 ? '✅ 200' : '❌ ' + res.status} : ${u}`)
}
