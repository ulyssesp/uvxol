# me - this DAT.
# webServerDAT - the connected Web Server DAT
# request - A dictionary of the request fields. The dictionary will always contain the below entries, plus any additional entries dependent on the contents of the request
# 		'method' - The HTTP method of the request (ie. 'GET', 'PUT').
# 		'uri' - The client's requested URI.
# 		'clientAddress' - The client's address.
# 		'serverAddress' - The server's address.
# response - A dictionary defining the response, to be filled in during the request method. Additional fields not specified below can be added (eg. response['content-type'] = 'application/json').
# 		'statusCode' - A valid HTTP status code integer (ie. 200, 401, 404). Default is 404.
# 		'statusReason' - The reason for the above status code being returned (ie. 'Not Found.').
# 		'data' - The data to send back to the client. If displaying a web-page, any HTML would be put here.
# return the response dictionary

import td
import json
from urllib.parse import parse_qs

def onHTTPRequest(webServerDAT, request, response):
  playFile(request['pars']['zone'], request['pars']['location'], request['pars']['filePath'])

  response['statusCode'] = 200 # OK
  response['statusReason'] = 'OK'
  response['data'] = '<b>TouchDesigner: </b>' + webServerDAT.name
  response['Access-Control-Allow-Origin'] = '*'
  return response

def onWebSocketOpen(webServerDAT, client):
	return

def onWebSocketReceiveText(webServerDAT, client, data):
	data = json.loads(data)
	if data['action'] == "restart":
		op("playing_files").clear()
	elif 'filePath' in data:
		playFile(data['zone'], data['location'], data['filePath'], data['active'])
	return

def onWebSocketReceiveBinary(webServerDAT, client, data):
	webServerDAT.webSocketSendBinary(client, data)
	return

def onServerStart(webServerDAT):
	return

def onServerStop(webServerDAT):
	return

def playFile(zone, location, filePath, active):
  playingFiles = op("playing_files")
  zone = zone.replace(' ', '_').upper();
  location = location.replace(' ', '_').upper()
  rowId = zone + '_' + location + '_' + filePath
  
  if not active:
    playingFiles.deleteRow(rowId)
  else:
    playingFiles.appendRow([rowId, zone, location, "../video/" + filePath, active])