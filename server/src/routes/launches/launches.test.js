const request = require("supertest");
const app = require("../../app");

const { connectDB, disconnectDB } = require("../../services/mongo");
const { loadPlanetsData } = require("../../models/planets.model");

const completeLaunchData = {
  mission: "Kepler ExoPlanets Mission 1",
  rocket: "Explorer IS1",
  target: "Kepler-1652 b",
  launchDate: "October 17, 2030",
};

const launchDataWithoutDate = {
  mission: "Kepler ExoPlanets Mission 1",
  rocket: "Explorer IS1",
  target: "Kepler-1652 b",
};

const incorrectLaunchDate = {
  mission: "Kepler ExoPlanets Mission 1",
  rocket: "Explorer IS1",
  target: "Kepler-1652 b",
  launchDate: "hello",
};

describe("Launches Requests Tests", () => {
  beforeAll(async () => {
    await connectDB();
    await loadPlanetsData();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  describe("Test GET /launches", () => {
    test("It should response with 200 success", async () => {
      // const response =
      await request(app)
        .get("/v1/launches")
        .expect(200)
        .expect("Content-Type", /json/);
      // expect(response.statusCode).toBe(200);
    });
  });

  describe("POST /launch", () => {
    test("It should response with 201 created", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(completeLaunchData)
        .expect(201)
        .expect("Content-Type", /json/);

      const requestDate = new Date(completeLaunchData.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();

      expect(responseDate).toBe(requestDate);

      expect(response.body).toMatchObject(launchDataWithoutDate);
    }),
      test("It should response with 400, invalid date error", async () => {
        const response = await request(app)
          .post("/v1/launches")
          .send(incorrectLaunchDate)
          .expect(400)
          .expect("Content-Type", /json/);

        expect(response.body).toStrictEqual({
          error: "Invalid date",
        });
      }),
      test("It should response with 400, missing parameters", async () => {
        const response = await request(app)
          .post("/v1/launches")
          .send(launchDataWithoutDate)
          .expect(400)
          .expect("Content-Type", /json/);

        expect(response.body).toStrictEqual({
          error: "Missing required properties",
        });
      });
  });
});
