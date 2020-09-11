const express = require("express");
const next = require("next");
const routes = require("./routes");
const path = require("path");
const url = require("url");

const dev = process.env.NODE_ENV !== "production";

const app = next({ dev });

const handler = routes.getRequestHandler(app, ({ req, res, route, query }) => {
	app.render(req, res, route.page, query);
});

app
	.prepare()
	.then(() => {
		const server = express();

		server.use((req, res, next) => {
			const pathname = url.parse(req.url, true).pathname;
			if (pathname === "/service-worker.js") {
				const filePath = path.join(__dirname, ".next", pathname);

				app.serverStatic(req, res, filePath);
			} else {
				next();
			}
		});

		server.use("/", indexRoute);

		server.use(handler);

		server.listen(5000, err => {
			if (err) throw err;
			console.log("--> Ready on http://localhost:5000");
		});
	})
	.catch(e => {
		console.log(e.stack);
		process.exit(1);
	});
