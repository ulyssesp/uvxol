import td
import json
from urllib.parse import parse_qs

connected = False

def sendPing():
  global connected
  print(connected)
  if connected == None:
    connected = False

  if not connected:
    print("not connected")
    op('reconnect').run()
    return

  connected = False
  op('websocket1').sendPing()

def onConnect(dat):
  global connected
  print("connected")
  connected = True

def onDisconnect(dat):
  global connected
  connected = False
  print("disconnect")
  return

def onReceivePing(dat, contents):
  global connected
  connected = True
  dat.sendPong(contents) # send a reply with same message
  return

def onReceivePong(dat, contents):
  global connected
  print("ponged")
  connected = True
  return

def onReceiveText(dat, rowIndex, jsondata):
  jsonlines = jsondata.splitlines()
  for line in jsonlines:
    try:
      data = json.loads(line)
      if data['type'] == "restart":
        op("playing_files").clear()
        op("running_votes").clear()
        op('fun_meter').par.value0 = 0
      elif data['type'] == "replaceState":
        op("playing_files").clear()
        op("running_votes").clear()
        for evt in data['actions']:
          if data['type'] == "vote":
            startVote(evt["id"], evt["eventId"], evt['zone'], evt['location'], evt['voteOptions'])
          else:
            playFile(evt["id"], evt["eventId"], evt['zone'], evt['location'], evt['filePath'])

      elif data['type'] == 'speedChange':
        op('PLAY_SPEED').par.value0 = data['speed']
      elif data['type'] == 'addAction':
        data = data['data']
        if data['type'] == "vote":
          startVote(data["id"], data["eventId"], data['zone'], data['location'], data['voteOptions'])
        elif data['type'] == "meter":
          if data['meterType'] == "fun":
            op('fun_meter').par.value0 = float(data['value'])
        elif data['type'] == "video":
          playFile(data["id"], data["eventId"], data['zone'], data['location'], data['filePath'])
      elif data['type'] == 'removeAction':
        endVote(data['id'], data['eventId'])
        stopFile(data['id'], data['eventId'])
          
        
    except Exception as e:
      print(e)
      print(line)

def onReceivePing(dat, contents):
  dat.sendPong(contents) # send a reply with same message
  return

def playFile(action_id, event_id, zone, location, filePath):
  playingFiles = op("playing_files")
  zone = zone.replace(' ', '_').upper();
  location = location.replace(' ', '_').upper()
  rowId = str(event_id) + "_" + str(action_id)
  
  if playingFiles.row(rowId) == None:
    playingFiles.appendRow([rowId, zone, location, "../video/" + filePath])

def stopFile(action_id, event_id):
  playingFiles = op("playing_files")
  rowId = str(event_id) + "_" + str(action_id)
  
  if playingFiles.row(rowId) != None:
    playingFiles.deleteRow(rowId)


def startVote(event_id, action_id, zone, location, vote_options):
  running_votes = op("running_votes")
  zone = zone.replace(' ', '_').upper();
  location = location.replace(' ', '_').upper()
  rowId = str(event_id) + "_" + str(action_id)
  vote_option_texts = list(map(lambda vo: vo['text'], vote_options))

  if running_votes.row(rowId) == None:
    running_votes.appendRow([rowId, zone, location] + vote_option_texts)

def endVote(event_id, action_id):
  running_votes = op("running_votes")
  rowId = str(event_id) + "_" + str(action_id)
  if running_votes.row(rowId) != None:
    rowId = str(event_id) + "_" + str(action_id)
    running_votes.deleteRow(rowId)
  