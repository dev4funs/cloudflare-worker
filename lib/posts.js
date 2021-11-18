export const getPosts = async () => {
  const all = await KV_POSTS.list()
  let posts = []
  for (const { name } of all.keys) {
    let value = await KV_POSTS.get(name)
    value = JSON.parse(value)
    posts.unshift({ ...value, id: name })
  }
  return posts
}
