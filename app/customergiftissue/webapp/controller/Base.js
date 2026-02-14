sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "customergiftissue/model/valuehelp",
    "sap/ui/comp/filterbar/FilterBar"
],
    function (Controller, valuehelp, FilterBar) {
        "use strict";

        return Controller.extend("customergiftissue.Base", {
            
            onVHRMobile: async function (oEvent) {
                var othis = this;
                if (!this._valueHelpDialogMobile) {
                    this._valueHelpDialogMobile = await valuehelp.createValueHelp({
                        title: "Mobile No",
                        model: this.getView().getModel(),
                        multiSelect: false,
                        keyField: "MobileNo",
                        keyDescField: "MobileNo",
                        basePath: "/CustMobileSet",
                        preFilters: [],
                        aBindingFilter: [],
                        columns: [
                            {
                                label: this.mdl_i18n.getText('ZTXT_LBL_MOB_NUM'),
                                path: 'MobileNo',
                                filterable: true

                            },
                            {
                                label: this.mdl_i18n.getText('ZTXT_LBL_CUST_NAME'),
                                path: 'CustName',
                                filterable: true

                            },
                            {
                                label: this.mdl_i18n.getText('ZTXT_LBL_CUST_EMAIL'),
                                path: 'CustEmail',
                                filterable: true

                            }
                        ],
                        ok: function (oEvt) {
                            othis.mdl_zFilter.getData().Create.GvrCustMoblNo = oEvt.MobileNo;
                            othis.mdl_zFilter.getData().Email=oEvt.CustEmail; 
                            othis.mdl_zFilter.updateBindings();
                            var oButton = othis.byId("addCustomerProfileButton");
                            if (oButton) {
                                oButton.setEnabled(false);
                            }
                        }
                    });
                    this.getView().addDependent(this._valueHelpDialog);
                }

                this._valueHelpDialogMobile.open();
                this._valueHelpDialogMobile.setBasicSearchText('');
                var oFilterBar = this._valueHelpDialogMobile.getFilterBar();
                if (oFilterBar) {
                    var aFilterGroupItems = oFilterBar.getFilterGroupItems();
                    for (var i = 0; i < aFilterGroupItems.length; i++) {
                        var oFilterField = aFilterGroupItems[i].getControl();
                        if (oFilterField && oFilterField.setConditions) {
                            oFilterField.setConditions([]);
                        }
                    }
                }
                var oTable = this._valueHelpDialogMobile.getTable();
                if (oTable.getBinding('rows')) {
                    oTable.getBinding('rows').filter([]);
                    if (oTable.getBinding('rows').mParameters.custom &&
                        oTable.getBinding('rows').mParameters.custom.search) {
                        oTable.getBinding('rows').mParameters.custom.search = "";
                        oTable.getBinding('rows').sCustomParams = "";
                    }
                    oTable.getBinding('rows').refresh(true);
                }
            },


            onVHRCampaign: async function (oEvent) {
                var othis = this;
                if (!this._valueHelpDialogCampaign) {
                    this._valueHelpDialogCampaign = await valuehelp.createValueHelp({
                        title: this.mdl_i18n.getText('Campaign'),
                        model: this.getView().getModel(),
                        multiSelect: false,
                        keyField: "Campaign",
                        keyDescField: "Campaign",
                        basePath: "/MallCampaignSet",
                        preFilters: [],
                        aBindingFilter: [],
                        columns: [
                            {
                                label: this.mdl_i18n.getText('Campaign'),
                                path: 'Campaign',
                                filterable: false
                            }
                        ],
                        ok: function (oEvt) {
                            othis.mdl_zFilter.getData().Create.GvrCampaign = oEvt.Campaign;
                            othis.mdl_zFilter.updateBindings();
                        }
                    });
                    this.getView().addDependent(this._valueHelpDialog);
                }
                this._valueHelpDialogCampaign.open();
                this._valueHelpDialogCampaign.setBasicSearchText('');
                var oTable = this._valueHelpDialogCampaign.getTable();

                if (oTable.getBinding('rows').mParameters.custom &&
                    oTable.getBinding('rows').mParameters.custom.search &&
                    oTable.getBinding('rows').mParameters.custom.search !== "") {
                    oTable.getBinding('rows').mParameters.custom.search = "";
                    oTable.getBinding('rows').sCustomParams = "";
                    oTable.getBinding('rows').refresh(true);
                }
            },

            onVHRCountryCode: async function (oEvent) {
                var othis = this;
                if (!this._valueHelpDialogCountryCode) {
                    this._valueHelpDialogCountryCode = await valuehelp.createValueHelp({
                        title: "Country Code",
                        model: this.getView().getModel(),
                        multiSelect: false,
                        keyField: "MobCont",
                        keyDescField: "MobCont",
                        basePath: "/MobCountryCodeSet",
                        preFilters: [],
                        aBindingFilter: [],
                        columns: [
                            {
                                label: this.mdl_i18n.getText('ZTXT_LBL_COUNTRY'),
                                path: 'Country',
                                filterable: true
                            },
                            {
                                label: this.mdl_i18n.getText('ZTXT_LBL_COUNTRY_CODE'),
                                path: 'MobCont',
                                filterable: true
                            }
                        ],
                        ok: function (oEvt) {
                            othis.mdl_zFilter.getData().AddCustomer.MobCont = oEvt.MobCont;
                            othis.mdl_zFilter.updateBindings();
                        }
                    });
                    this.getView().addDependent(this._valueHelpDialog);
                }
                this._valueHelpDialogCountryCode.open();
                this._valueHelpDialogCountryCode.setBasicSearchText('');
                var oFilterBar = this._valueHelpDialogCountryCode.getFilterBar();
                if (oFilterBar) {
                    var aFilterGroupItems = oFilterBar.getFilterGroupItems();
                    for (var i = 0; i < aFilterGroupItems.length; i++) {
                        var oFilterField = aFilterGroupItems[i].getControl();
                        if (oFilterField && oFilterField.setConditions) {
                            oFilterField.setConditions([]);
                        }
                    }
                }
                var oTable = this._valueHelpDialogCountryCode.getTable();
                if (oTable.getBinding('rows')) {
                    oTable.getBinding('rows').filter([]);
                    if (oTable.getBinding('rows').mParameters.custom && oTable.getBinding('rows').mParameters.custom.search) {
                        oTable.getBinding('rows').mParameters.custom.search = "";
                        oTable.getBinding('rows').sCustomParams = "";
                    }
                    oTable.getBinding('rows').refresh(true);
                }
            },


            onVHRGVRNumber: async function (oEvent) {
                var othis = this;
                if (!this._valueHelpDialogGVRNumber) {
                    this._valueHelpDialogGVRNumber = await valuehelp.createValueHelp({
                        title: "GVR Number",
                        model: this.getView().getModel(),
                        multiSelect: false,
                        keyField: "GvrNo",
                        keyDescField: "GvrNo",
                        basePath: "/GVRHeaderSet",
                        preFilters: [],
                        aBindingFilter: [new sap.ui.model.Filter("GvrTyp", "EQ", "CI")],
                        columns: [
                            {
                                label: this.mdl_i18n.getText('ZTXT_LBL_GVR_NO'),
                                path: 'GvrNo',
                                filterable: false
                            }
                        ],
                        ok: function (oEvt) {
                            var sSelectedGvrNo = oEvt.GvrNo;
                            othis.byId("gvrInput").setValue(sSelectedGvrNo);
                        }
                    });
                    this.getView().addDependent(this._valueHelpDialog);
                }
                this._valueHelpDialogGVRNumber.open();
                
                var oTable = this._valueHelpDialogGVRNumber.getTable();
                this._valueHelpDialogGVRNumber.setBasicSearchText('');
                if(oTable.getBinding('rows').mParameters.custom && 
                    oTable.getBinding('rows').mParameters.custom.search && 
                    oTable.getBinding('rows').mParameters.custom.search !== ""){
                    oTable.getBinding('rows').mParameters.custom.search ="";
                    oTable.getBinding('rows').sCustomParams="";
                    oTable.getBinding('rows').refresh(true);
                }
            },

            onProfileButtonPress: function (oEvent) {
                var oButton = oEvent.getSource(),
                    oView = this.getView();
                if (!this._pPopover) {
                    this._pPopover = sap.ui.xmlfragment(oView.getId(), "customergiftissue.view.Popover", this);
                    oView.addDependent(this._pPopover);
                }
                this._pPopover.openBy(oButton);
            }
        });
    });
