export const getPosts = async () => {
  const all = await KV_POSTS.list()
  let posts = []
  for (const { name } of all.keys) {
    let value = await KV_POSTS.get(name)
    value = JSON.parse(value)
    posts.push({ ...value, id: name })
  }
  return posts
}

export const addPost = async ({ title, username, content }) => {
  await KV_POSTS.put(
    `${new Date().getTime()}+${username}`,
    JSON.stringify({ title, username, content }),
  )
}
