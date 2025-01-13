export function getRequestUrl(req) {
    const protocol = req.socket.encrypted ? "https" : "http";
    const host = req.headers.host || "localhost";
    const url = new URL(req.url, `${protocol}://${host}`);
    return url;
}
