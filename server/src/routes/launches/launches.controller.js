const {
  getAllLaunches,
  addNewLaunch,
  abortLaunch,
} = require("../../models/launches.model");

const { getPagination } = require("../../services/pagination");

async function httpGetAllLaunches(req, res) {
  const { skip, limit } = getPagination(req.query);
  const launches = await getAllLaunches(skip, limit);
  return res.status(200).json(launches);
}

async function httpAddNewLaunch(req, res) {
  try {
    const launch = req.body;

    if (
      !launch.mission ||
      !launch.rocket ||
      !launch.target ||
      !launch.launchDate
    ) {
      return res.status(400).json({
        error: "Missing required properties",
      });
    }

    launch.launchDate = new Date(launch.launchDate);

    if (isNaN(launch.launchDate)) {
      return res.status(400).json({
        error: "Invalid date",
      });
    }
    await addNewLaunch(launch);
    return res.status(201).json(launch);
  } catch (err) {
    return res.status(400).json({
      error: `Launch doesn't save due to following error: ${err}`,
    });
  }
}

async function httpAbortLaunch(req, res) {
  const launchId = Number(req.params.id);

  if (isNaN(launchId)) {
    return res.status(400).json({
      error: "Invalid Id",
    });
  }

  const aborted = await abortLaunch(launchId);
  if (aborted.matchedCount > 0 && aborted.modifiedCount > 0) {
    return res.status(200).json({
      ok: true,
    });
  } else if (aborted.matchedCount === 0) {
    return res.status(400).json({
      error: "Launch doesn't found. Please try again with a valid launch",
    });
  } else if (aborted.matchedCount > 0 && aborted.modifiedCount === 0) {
    return res.status(400).json({
      error: "Launch already aborted. Please try again",
    });
  } else {
    return res.status(400).json({
      error:
        "Launch hasn't aborted due to some unknown reasons. Please try again",
    });
  }
}

module.exports = {
  httpGetAllLaunches,
  httpAddNewLaunch,
  httpAbortLaunch,
};
