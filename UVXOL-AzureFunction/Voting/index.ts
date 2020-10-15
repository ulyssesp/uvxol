const httpTrigger = async function (context, req) {
  return {
    "target": "NewVote",
    "arguments": [req.body]
  };
};

export default httpTrigger;