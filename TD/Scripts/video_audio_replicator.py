# me - this DAT
# 
# comp - the replicator component which is cooking
# allOps - a list of all replicants, created or existing
# newOps - the subset that were just created
# template - table DAT specifying the replicator attributes
# master - the master operator
#

def onRemoveReplicant(comp, replicant):
  replicant.destroy()

def onReplicate(comp, allOps, newOps, template, master):

  for i, c in enumerate(newOps):
    zone = template[i, 0]
    zone_op = op(zone + '_composite')
    if zone_op != None:
      c.outputConnectors[0].connect(zone_op)
    pass

  return
