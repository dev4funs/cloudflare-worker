import { readRequestBody, getPosts } from './lib'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS',
  'Access-Control-Max-Age': '86400',
}

function handleOptions(request) {
  // Make sure the necessary headers are present
  // for this to be a valid pre-flight request
  let headers = request.headers
  if (
    headers.get('Origin') !== null &&
    headers.get('Access-Control-Request-Method') !== null &&
    headers.get('Access-Control-Request-Headers') !== null
  ) {
    // Handle CORS pre-flight request.
    // If you want to check or reject the requested method + headers
    // you can do that here.
    let respHeaders = {
      ...corsHeaders,
      // Allow all future content Request headers to go back to browser
      // such as Authorization (Bearer) or X-Client-Name-Version
      'Access-Control-Allow-Headers': request.headers.get(
        'Access-Control-Request-Headers',
      ),
    }
    return new Response(null, {
      headers: respHeaders,
    })
  } else {
    // Handle standard OPTIONS request.
    // If you want to allow other HTTP Methods, you can do that here.
    return new Response(null, {
      headers: {
        Allow: 'GET, HEAD, POST, OPTIONS',
      },
    })
  }
}

async function handleRequest(request) {
  const { pathname } = new URL(request.url)
  let response
  if (request.method === 'OPTIONS') {
    response = handleOptions(request)
  } else {
    if (pathname.startsWith('/')) {
      response = new Response('Hello worker!', {
        headers: { 'content-type': 'text/plain' },
      })
    }
    if (pathname.startsWith('/posts')) {
      if (request.method === 'GET') {
        response = new Response(JSON.stringify(await getPosts()))
      }
      if (request.method === 'POST') {
        const body = await readRequestBody(request)
        const { title, username, content } = body

        let newPosts = await getPosts()
        newPosts.unshift(body)

        const key = `${new Date().getTime()}+${username}`
        // I found there is a latency in kv.put.
        // After I add the data, I can't get the new data immediately.
        // So, I use a cheat way to partly fix it.
        await KV_POSTS.put(key, JSON.stringify(body))

        response = new Response(JSON.stringify(newPosts))
        response.headers.set('Content-Type', 'application/json')
      }
    }

    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS',
    )
  }
  return response
}

addEventListener('fetch', event => {
  event.respondWith(
    handleRequest(event.request).catch(
      err => new Response(err.stack, { status: 500 }),
    ),
  )
})
