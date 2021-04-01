
# me - this DAT
# 
# comp - the replicator component which is cooking
# allOps - a list of all replicants, created or existing
# newOps - the subset that were just created
# template - table DAT specifying the replicator attributes
# master - the master operator
#

def onRemoveReplicant(comp, replicant):
  # replicant.destroy()
  return

def onReplicate(comp, allOps, newOps, template, master):
  black_base = op('black_base')

  for i, c in enumerate(newOps):
    c.outputConnectors[0].connect(op("composite_" + template[i,0]).inputConnectors[3])

    if template[i,0] == "HOUSE":
      c.inputConnectors[0].connect(op('house_audio_in'))
    pass

  return
