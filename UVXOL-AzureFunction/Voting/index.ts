const httpTrigger = async function (context, req) {
  return {
    "target": "newVote",
    "arguments": [req.body]
  };
};

export default httpTrigger;