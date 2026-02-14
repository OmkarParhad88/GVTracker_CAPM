sap.ui.define([
    "customergiftissue/controller/Base",
    "sap/m/MessageToast",
], (Base,MessageToast) => {
    "use strict";

    return Base.extend("customergiftissue.controller.Home", {
        onInit() {
            document.addEventListener('keypress', this._handleKeyPress.bind(this));
        },

        _handleKeyPress: function(e) {
            if (e.key === "Enter") {
              e.preventDefault(); 
              this.onExecute(); 
            }
          },

        onBeforeRendering: function () {
            this.mdl_i18n = this.getOwnerComponent().getModel('i18n').getResourceBundle();
            this.mdl_zFilter = this.getOwnerComponent().getModel('zFilterModel');
        },

        onAfterRendering: function() {
            var oInput = this.getView().byId("gvrInput");
            var oButton = this.getView().byId("id.execute");
      
            oInput.attachBrowserEvent("keydown", function(e) {
              if (e.key === "Enter") {
                oButton.firePress(); 
                e.preventDefault();  
              }
            });
          },

        onRadioSelect: function (oEvent) {
            var oCreateRadio = this.byId("createRadio");
            var oInputField = this.byId("gvrInput");
            if (oCreateRadio.getSelected()) {
                oInputField.setValue("");
                oInputField.setEditable(false);
            } else {
                oInputField.setEditable(true);
            }
        },

        onLiveChange: function (oEvent) {
            var oInput = oEvent.getSource();
            var sValue = oEvent.getParameter("value");
            var sCleanValue = sValue.replace(/\D/g, '');
            if (sCleanValue.length > 0 && sCleanValue.charAt(0) !== '1') {
                MessageToast.show("Enter correct GVR no!", {
                    duration: 300
                });
            }
            oInput.setValue(sCleanValue);
        },

        onExecute: function () {
            var sGvrNumber = this.getView().byId("gvrInput").getValue();
            var oRadioGroup = this.byId("radioGroup");
            var sSelectedIndex = oRadioGroup.getSelectedIndex();
            var sGvrNumber = this.getView().byId("gvrInput").getValue();
            var oModel2 = this.getView().getModel();
            if (sSelectedIndex === 0) {
                onExecute
            } else if (sSelectedIndex === 1) {
                if (sGvrNumber.charAt(0) !== '1') {
                    MessageToast.show("Enter correct GVR no!",{
                        duration:"300"
                    });
                    return;
                }
                if (sGvrNumber) {
                    this.getView().setBusy(true);
                    var othis = this;
                    var sPath = `/GVRHeaderSet('${sGvrNumber}')`;
                    oModel2.read(sPath, {
                        success: function (oData) {
                            othis.getView().setBusy(false);
                            if (oData) {
                                othis.getOwnerComponent().getRouter().navTo("CustomerGiftIssueDisplay", {
                                    gvrNumber: sGvrNumber
                                });
                            }
                        }.bind(this),
                        error: function (oError) {
                            othis.getView().setBusy(false);
                            sap.m.MessageToast.show("No record found for the entered GVR number.");
                        }
                    });
                } else {
                    sap.m.MessageToast.show("Please enter a valid GVR number.");
                }
            }
        },

        onExit: function() {
            document.removeEventListener('keypress', this._handleKeyPress.bind(this));
          },

        
    });
});