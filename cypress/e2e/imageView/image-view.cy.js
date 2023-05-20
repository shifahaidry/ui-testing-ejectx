// Element Selector
import localElementSelector from './image-view.es'

// Fixture
import { workspaceName, workspaceSettings } from '../../fixtures/singleImage'

// Page Object
import { SingleImage } from './image-view.po'
const singleImage = new SingleImage()

describe('workspace settings should applied correctly', () => {
  before(() => {
    cy.login()
      .visit('/')
  })

  it('Should be able to change workspace setting and it should be saved', () => {
    singleImage.getWorkspaceOption(workspaceName, localElementSelector.workSpaceSetting)
    cy.get(localElementSelector.modelText).contains('Image ').click()
    // Invert
    cy.get(localElementSelector.invertOption).check({ force: true })
    // Contrast
    cy.get(localElementSelector.customRange).eq(0).invoke('val', workspaceSettings.imgContrast).trigger('change')
    // Brightness
    cy.get(localElementSelector.customRange).eq(1).invoke('val', workspaceSettings.imgBrightness).trigger('change')
    // Zoom
    cy.get(localElementSelector.customRange).eq(2).invoke('val', workspaceSettings.defaultZoom).trigger('change')
    // width
    cy.contains('Width').parent().next().find('input').clear().type(workspaceSettings.defaultPictureSize.width)
    // Height
    cy.contains('Height').parent().next().find('input').clear().type(workspaceSettings.defaultPictureSize.height)
    // ColorMap
    cy.get(localElementSelector.colorMapOption).check({ force: true })

    // HeatMap generated correct check

    // Save
    cy.get(localElementSelector.saveBtn).contains(' Save ').click()

    // Assert respective params are saved successfully or not 
    singleImage.getWorkspaceSetting(workspaceName).then((res) => {
      const keys = Object.keys(workspaceSettings)
      for (let key of keys) {
        if (typeof workspaceSettings[key] !== 'object' && workspaceSettings[key] !== res[key]) {
          expect(workspaceSettings[key]).to.eq(res[key])
        }
        else if (typeof workspaceSettings[key] === 'object' && typeof res[key] === 'object') {
          if (JSON.stringify(workspaceSettings[key]) !== JSON.stringify(res[key])) {
            expect(workspaceSettings[key]).to.eq(res[key])
          }
        }
      }
    })
  })

})
