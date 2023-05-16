module.exports = {
  urls : {
    manage : '/manager',
    label: '/'
  },
  staticData: {
    workSpaceToBeDuplicated: 'Test1_Referenz1',
    workSpaceSize: '179.5 MiB',
    fileCount: '13,027'
  },
  duplicateWsMessage(wsTOBeDuplicated,newWs) {
    return `Workspace ${wsTOBeDuplicated} duplicated as ${newWs}`
  },
  backupWsMessage(newWs) {
    return `Backup of ${newWs} created successfully!`
  }
}
