const httpTrigger = async function (context, req, connectionInfo) {
  context.res.json(connectionInfo);
};

export default httpTrigger;