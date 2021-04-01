/*

build first before deploying

*/
const httpTrigger = async function (context, req, connectionInfo) {
  context.bindings.signalRMessages = [{
    "target": "NewClient",
    "arguments": []
  }]
  context.res.json(connectionInfo);
};

export default httpTrigger;