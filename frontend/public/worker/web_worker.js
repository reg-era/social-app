
let socket = null;

console.log("test test")

self.onconnect = function (event) {
    console.log(event)


    const port = event.ports[0];
    const endpoint = new URL(`ws://${window.location.hostname}:8080/api/ws`)
    endpoint.searchParams.append('auth', "test"); 

    socket = new WebSocket(endpoint.toString());

    socket.onopen = () => {
        port.postMessage({ type: 'connected' });
    };

    socket.onmessage = (event) => {
        port.postMessage({ type: 'message', data: event.data });
    };

    socket.onerror = (error) => {
        port.postMessage({ type: 'error', data: "error from ws: " + JSON.stringify(error) });
    };

    socket.onclose = () => {
        port.postMessage({ type: 'disconnected' });
    };

    port.onmessage = function (messageEvent) {
        const msg = messageEvent.data;
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(msg));
        }
    };
};
