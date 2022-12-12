const axios = require("axios");

const launchesDatabase = require("./launches.mongo");
const planetsDatabse = require("./planets.mongo");

let firstFlightNumber = 1;
const SpaceX_API_URL = "https://api.spacexdata.com/v4/launches/query";

async function saveLaunch(launch) {
  return await launchesDatabase.findOneAndUpdate(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    {
      upsert: true,
    }
  );
}
async function findLaunch(filter) {
  return await launchesDatabase.findOne(filter);
}

async function populateLaunches() {
  console.log("dowloading Data");

  const response = await axios.post(SpaceX_API_URL, {
    query: {},
    options: {
      sort: "flight_number",
      pagination: false,
      populate: [
        {
          path: "rocket",
          select: {
            name: 1,
          },
        },
        {
          path: "payloads",
          select: {
            customers: 1,
          },
        },
      ],
    },
  });

  if (response.status !== 200) {
    console.error("Problem downloading Launches data");
    throw new Error("Downloading launches data failed!");
  }

  const launchDocs = response.data.docs;

  for (launchDoc of launchDocs) {
    const payloads = launchDoc["payloads"];
    const customers = payloads.flatMap((payloads) => {
      return payloads["customers"];
    });

    const fetchedLaunches = {
      flightNumber: launchDoc["flight_number"],
      mission: launchDoc["name"],
      rocket: launchDoc["rocket"]["name"],
      launchDate: new Date(launchDoc["date_local"]),
      upcoming: launchDoc["upcoming"],
      success: launchDoc["success"],
      customers,
    };
    await saveLaunch(fetchedLaunches);
  }
}

async function findLattestFlightNumber() {
  const lattestFlightData = await launchesDatabase
    .findOne()
    .sort("-flightNumber");
  if (!lattestFlightData) {
    return firstFlightNumber;
  }
  return lattestFlightData.flightNumber + 1;
}

async function loadLaunchesData() {
  const launchData = await findLaunch({
    flightNumber: 204,
    mission: "O3b mPower 3.4",
    rocket: "Falcon 9",
  });

  if (!launchData) {
    populateLaunches();
  } else {
    console.log("launches already exists");
  }
}

async function getAllLaunches(skip, limit) {
  return await launchesDatabase
    .find({}, { _id: 0, __v: 0 })
    .sort({ flightNumber: 1 })
    .skip(skip)
    .limit(limit);
}

async function addNewLaunch(launch) {
  const validPlanet = await planetsDatabse.findOne({
    keplerName: launch.target,
  });

  if (!validPlanet) {
    throw new Error("Invalid target planet. Please try again");
  }

  const lattestFlightNumber = await findLattestFlightNumber();
  Object.assign(launch, {
    flightNumber: lattestFlightNumber,
    customers: ["DD", "NASA"],
    upcoming: true,
    success: true,
  });
  await saveLaunch(launch);
}

async function abortLaunch(launchId) {
  return await launchesDatabase.updateOne(
    {
      flightNumber: launchId,
    },
    {
      upcoming: false,
      success: false,
    }
  );
}

module.exports = {
  loadLaunchesData,
  getAllLaunches,
  addNewLaunch,
  abortLaunch,
};
