import Fastify from "fastify";

const server = Fastify({
	logger: true
});

server.get('/', async (req, res) => {
	return ({mymessage: 'Hello World'});
});

const start = async () => {
	try {
		await server.listen({ port: 3000, host: '0.0.0.0'});
		console.log('Server listening on http://0.0.0.0:3000');
	} catch (err) {
		server.log.error( err );
		process.exit(1);
	}
};

start();
