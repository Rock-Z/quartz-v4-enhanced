import http from "node:http"
import path from "node:path"
import serveHandler from "serve-handler"

const publicDir = path.join(process.cwd(), "public-test")
const port = Number(process.env.TEST_SERVER_PORT || 4173)

const server = http.createServer((request, response) => {
  return serveHandler(request, response, {
    public: publicDir,
    cleanUrls: true,
  })
})

server.listen(port, "127.0.0.1", () => {
  console.log(`Serving public-test at http://127.0.0.1:${port}`)
})
