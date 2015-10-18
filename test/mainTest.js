var assert = require("assert");
var agent  = require("./agent");
var Rill   = require("../src");

describe("Rill", function () {
	after(agent.clear);

	it("should accept a request", function (done) {
		var request = agent.create(
			Rill().use(respond(200))
		);

		request
			.get("/")
			.expect(200)
			.end(done);
	});

	it("should match a pathname", function (done) {
		var request = agent.create(
			Rill().at("/test", respond(200))
		);

		when([
			request
				.get("/")
				.expect(404),
			request
				.get("/test")
				.expect(200)
		], done);
	});

	it("should mount a pathname", function (done) {
		var request = agent.create(
			Rill().at("/test",
				Rill().at("/1",
					Rill().at("/2", respond(200))
				)
			)
		);

		when([
			request
				.get("/test")
				.expect(404),
			request
				.get("/test/1")
				.expect(404),
			request
				.get("/test/1/2")
				.expect(200)
		], done);
	});

	it("should match a hostname", function (done) {
		var request = agent.create(
			Rill().host("*test.com", respond(200))
		);

		when([
			request
				.get("/")
				.expect(404),
			request
				.get("/")
				.set("host", "fake.com")
				.expect(404),
			request
				.get("/")
				.set("host", "test.com")
				.expect(200),
			request
				.get("/")
				.set("host", "www.test.com")
				.expect(200),
		], done);
	});

	it("should mount a subdomain/hostname", function (done) {
		var request = agent.create(
			Rill().host("test.com",
				Rill().host("api",
					Rill().host("test", respond(200))
				)
			)
		);

		when([
			request
				.get("/")
				.expect(404),
			request
				.get("/")
				.set("host", "test.com")
				.expect(404),
			request
				.get("/")
				.set("host", "api.test.com")
				.expect(404),
			request
				.get("/")
				.set("host", "test.api.test.com")
				.expect(200),
		], done);
	});

	it("should match a method", function (done) {
		var request = agent.create(
			Rill().post(respond(200))
		);

		when([
			request
				.get("/")
				.expect(404),
			request
				.post("/")
				.expect(200)
		], done);
	});

	it("shouldn't mount methods twice", function () {
		assert.throws(function () {
			agent.create(
				Rill().post(
					Rill().get(respond(200))
				)
			);
		});
	});
});

function respond (status, headers) {
	return function (req, res) { res.status = status; };
}

function when (promises, done) {
	Promise
		.all(promises)
		.then(done.bind(null, null))
		.catch(done);
}