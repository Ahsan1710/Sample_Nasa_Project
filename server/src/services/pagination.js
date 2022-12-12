const Default_Page_Number = 1;
const Default_Limit = 0;

function getPagination(query) {
  const page = query.page || Default_Page_Number;
  const limit = query.limit || Default_Limit;
  const skip = (page - 1) * limit;

  return {
    skip,
    limit,
  };
}

module.exports = {
  getPagination,
};
