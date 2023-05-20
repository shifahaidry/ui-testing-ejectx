module.exports = {
  workspaceName: 'Test Automation Single Image view',
  workspaceSettings : {
    imageInvert : true,
    imgContrast: '50',
    imgBrightness: '50',
    defaultZoom: '50',
    defaultPictureSize : {
      width: '100',
      height: '100'
    },
    imageColorMap : true
  },
  workspaceSettingApiEndpoint: (workspaceName) => `api/explorerConfig?dir=%2F${workspaceName.replaceAll(' ','+')}` 
}
