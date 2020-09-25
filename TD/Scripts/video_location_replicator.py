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
  return

def onReplicate(comp, allOps, newOps, template, master):

  for i, c in enumerate(newOps):
    zone = template[i, 0] 
    c.name = zone + "_" + template[i, 1] + "_composite"
    c.par.resolutionw = 1920
    c.par.resolutionh = 1080
    c.par.outputresolution = 9
    c.par.outputaspect = 1
    c.outputConnectors[0].connect(op(zone + "_composite"))
    pass

  return
