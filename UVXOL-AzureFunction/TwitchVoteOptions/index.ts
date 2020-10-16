const httpTrigger = async function (context, req) {
  return {
    "target": "NewVoteOptions",
    "arguments": [req.body]
  };
};

export default httpTrigger;