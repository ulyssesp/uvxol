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
import urllib.parse as urlparse
from urllib.parse import parse_qs

def onHTTPRequest(webServerDAT, request, response):
  playingFiles = op("playing_files")

  try:
    playingFiles[request['pars']['location'], 1] = 'video/' + request['pars']['filePath']
  except:
    print(request['pars']['location'])
    print(request['pars']['filePath'])

  response['statusCode'] = 200 # OK
  response['statusReason'] = 'OK'
  response['data'] = '<b>TouchDesigner: </b>' + webServerDAT.name
  response['Access-Control-Allow-Origin'] = '*'
  return response

def onWebSocketOpen(webServerDAT, client):
  print(client)
	return

def onWebSocketReceiveText(webServerDAT, client, data):
	webServerDAT.webSocketSendText(client, data)
	return

def onWebSocketReceiveBinary(webServerDAT, client, data):
	webServerDAT.webSocketSendBinary(client, data)
	return

def onServerStart(webServerDAT):
	return

def onServerStop(webServerDAT):
	return
	