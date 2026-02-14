sap.ui.define([
    "customergiftissue/controller/Base",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "customergiftissue/model/models"
],
    function (Base, Fragment, MessageToast, MessageBox, models) {
        "use strict";

        return Base.extend("customergiftissue.controller.AddCustomerProfile", {
            onInit: function () {
                this.mdl_i18n = null;
            },

            onBeforeRendering: function () {
                this.mdl_i18n = this.getOwnerComponent().getModel('i18n').getResourceBundle();
                this.mdl_zFilter = this.getOwnerComponent().getModel('zFilterModel');
                this.mdl_zFilter.setProperty("/AddCustomer/MobCont", "91");
            },


            onEmailInputChange: function (oEvent) {
                var oInput = oEvent.getSource();
                var sEmail = oInput.getValue();

                var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                if (!emailPattern.test(sEmail)) {
                    oInput.setValueState("Error");
                    oInput.setValueStateText("Please enter a valid email address.");
                } else {
                    oInput.setValueState("None");
                }
            },

            oncancel: function () {
                MessageToast.show("The Customer profile creation has been discarded.", {
                    duration: 6000,
                });
                setTimeout(() => {
                this.clearAllFields(),
                    this.getOwnerComponent().getRouter().navTo("CustomerGiftIssue");
                }, 2000);
            },

            onMobileNumChange: function (oEvent) {            
                var sValue = oEvent.getParameter("value");
                var sCleanValue = sValue.replace(/[^0-9]/g, "");
                oEvent.getSource().setValue(sCleanValue);
            },
            

            onAddCustomer: function () {
                var othis = this;
                var oModel = this.getView().getModel();
                var oData = this.mdl_zFilter.getData().AddCustomer;
                if(oData.MobileNo==="" || oData.CustName==="")
                {
                    MessageBox.error("Maintain the Customer Mobile No. & Customer Name")
                    return;
                }
                this.getView().setBusy(true);
                var othis = this;
                var mParam = {
                    success: function (oData, resp) {
                        othis.getView().setBusy(false);
                        MessageBox.success(oData.Message, {
                            onClose: function () {
                                othis.getOwnerComponent().getRouter().navTo("CustomerGiftIssue"); 
                            }.bind(othis)
                        });
                        othis.clearAllFields();
                    },
                    error: function (oError) { 
                        othis.getView().setBusy(false);
                        var oResponse = JSON.parse(oError.responseText);
                        var sErrorMessage = oResponse.error.message.value;
                        MessageBox.error(sErrorMessage);
                    }
                }
                oModel.create("/CustMobileSet", oData, mParam);
            },

            clearAllFields: function () {
                this.mdl_zFilter.getData().AddCustomer = models.getAddCustomerBlank();
                this.mdl_zFilter.updateBindings();
            }
        });
    });
