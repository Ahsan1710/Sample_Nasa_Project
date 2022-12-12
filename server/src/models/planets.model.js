const fs = require("fs");
const path = require("path");

const planetsDatabase = require("./planets.mongo");

const { parse } = require("csv-parse");

function isHabitable(planet) {
  return (
    planet["koi_disposition"] === "CONFIRMED" &&
    planet["koi_insol"] > 0.36 &&
    planet["koi_insol"] < 1.11 &&
    planet["koi_prad"] < 1.6
  );
}

function loadPlanetsData() {
  return new Promise((resolve, reject) => {
    fs.createReadStream(
      path.join(__dirname, "..", "..", "data", "habitable_planets_data.csv")
    )
      .pipe(
        parse({
          comment: "#",
          columns: true,
        })
      )
      .on("data", async (data) => {
        if (isHabitable(data)) {
          await savePlanets(data);
        }
      })
      .on("close", async () => {
        const planetsCount = (await getAllPlanets()).length;
        console.log(`${planetsCount} habitable planets found!`);
      })
      .on("end", () => {
        resolve();
      })
      .on("error", (err) => {
        console.log(err);
        reject(err);
      });
  });
}

async function getAllPlanets() {
  return await planetsDatabase.find({}, { _id: 0, __v: 0 });
}

async function savePlanets(planet) {
  try {
    await planetsDatabase.updateOne(
      {
        keplerName: planet.kepler_name,
      },
      {
        keplerName: planet.kepler_name,
      },
      {
        upsert: true,
      }
    );
  } catch (err) {
    console.error(`Planets not saved to DB due to following error: ${err}`);
  }
}

module.exports = {
  getAllPlanets,
  loadPlanetsData,
};
