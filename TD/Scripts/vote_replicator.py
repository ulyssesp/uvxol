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
  for i, c in enumerate(allOps):
    name = template[i, 0].val.partition(".")[0]
    c.par.Index = i
    if c in newOps:
      target_location = template[i, 1] + "_" + template[i, 2]
      target = op("composite_" + target_location)
      c.outputConnectors[0].connect(target)

  return
