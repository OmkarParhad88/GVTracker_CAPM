sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/Image",
    "sap/m/VBox",
    "sap/m/HBox",
    "sap/m/Text",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History",
    'sap/ui/core/BusyIndicator',
    "sap/ui/core/Icon"
],
    function (Controller, Image, VBox, HBox, Text, MessageBox, History, BusyIndicator, Icon) {
        "use strict";

        return Controller.extend("customergiftissue.controller.ViewCustomerBillInfo", {
            onInit: function () {
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.getRoute("ViewCustomerBillInfo").attachPatternMatched(this._onRouteMatched, this);
            },

            onBeforeRendering: function () {
                this.mdl_zFilter = this.getOwnerComponent().getModel('zFilterModel');
                this.ImgURLSetArray = [];
                this.OldGVRNo = "";
            },

            _onRouteMatched: function (oEvent) {

                this.GVRNo = oEvent.getParameter("arguments").gvrNumber;
                this.MobNum = oEvent.getParameter("arguments").GvrCustMoblNo;

                if (this.GVRNo !== this.OldGVRNo) {
                    this.clearPage();
                    this.OldGVRNo = this.GVRNo;
                    var aFilters = [
                        new sap.ui.model.Filter("ZgvrCustMoblNo", "EQ", this.MobNum),
                        new sap.ui.model.Filter("ZgvrNoCi", "EQ", this.GVRNo)
                    ];
                    var oTable = this.getView().byId("id.table.issue.viewBill");
                    var oBinding = oTable.getBinding("items");
                    oBinding.filter(new sap.ui.model.Filter(aFilters, true), "Application");
                    oBinding.sort(new sap.ui.model.Sorter("Zzserialno", false));

                    var oFilter = new sap.ui.model.Filter({
                        filters: aFilters,
                        and: true
                    });
                    var oModel = this.getView().getModel();
                    oModel.read("/CustBillSet", {
                        urlParameters: {
                            "$expand": "ToAttach"
                        },
                        filters: [oFilter],
                        success: function (oData, response) {
                            var oJsonModel = new sap.ui.model.json.JSONModel(oData.results);
                            this.getView().setModel(oJsonModel, "billModel");
                        }.bind(this),
                        error: function (oError) {
                            console.error("Read error:", oError);
                        }
                    });
                }
                this.byId("id.input.Hdr.MobNum").setValue(this.MobNum);
                this.byId("id.input.Hdr.GVRNum").setValue(this.GVRNo);
            },

            onBackPress: function () {
                var oHistory = History.getInstance();
                var sPreviousHash = oHistory.getPreviousHash();
                if (sPreviousHash !== undefined) {
                    window.history.go(-1);
                } else {
                    var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                    oRouter.navTo("Home", {}, true);
                }
            },

            sum: function (array) {
                return array.reduce((accumulator, currentValue) => accumulator + parseFloat(currentValue), 0);
            },


            openImageDialog: function (sImageUrl) {
                if (!this._oImageDialog) {
                    this._oImageDialog = new sap.m.Dialog({
                        content: new sap.m.Image({
                            src: sImageUrl,
                        }).addStyleClass("customImage"),
                        endButton: new sap.m.Button({
                            text: "Close",
                            press: function () {
                                this._oImageDialog.close();
                            }.bind(this)
                        })
                    }).addStyleClass("customOpenImageDialog");
                }

                this._oImageDialog.getContent()[0].setSrc(sImageUrl);
                this._oImageDialog.open();
            },

            nonImageFileToBase64: function (sUrl) {
                return new Promise((resolve, reject) => {
                    jQuery.ajax({
                        url: sUrl,
                        method: "GET",
                        xhrFields: {
                            responseType: 'blob'
                        },
                        success: function (blobData) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                                resolve(reader.result);
                            };
                            reader.onerror = reject;
                            reader.readAsDataURL(blobData);
                        },
                        error: function (oError) {
                            MessageToast.show("Failed to send Whatsapp OTP. Please try again.");
                            console.error("Error Details:", oError);
                        }
                    });
                });
            },

            onUpdateTableFinished: function (oEvent) {
                var Table = oEvent.getSource().getItems();
                var oThis = this;
                if (Table.length === 0) {
                    MessageBox.information(`No documents was uploaded for this "${this.GVRNo}" GVR number.`, {
                        title: "Information...",
                        onClose: function () {
                            oThis.onClosePress();
                        }
                    });
                    return;
                }
                var aCellData = [];
                var oJsonModel = this.getView().getModel("billModel");
                var abillData = oJsonModel.getData();
                var oImageVBox = this.getView().byId("id.image.VBox");
                oImageVBox.removeAllItems();

                abillData.forEach((item) => {
                    aCellData.push(item.ZgvrCustBillAmt);
                    var oVBox = new VBox({
                        alignItems: "Center",
                        width: "auto",
                        items: [
                            new Text({
                                text: "Sr.No:" + item.Zzserialno
                            }),
                            new sap.m.BusyIndicator({
                                size: "2rem"
                            })
                        ]
                    }
                    );
                    oVBox.addStyleClass("customVBox");
                    oImageVBox.addItem(oVBox);
                    var ImgUrl = `/sap/opu/odata/sap/ZMM_GV_PROCESS_SRV/CustBillFileSet(ZgvrCustMoblNo='${item.ZgvrCustMoblNo}',ZgvrCustBillSlNo='${item.ZgvrCustBillSlNo}')/$value`;
                    this.ImgURLSetArray.push({ ImgUrl: ImgUrl, BillSLNo: item.ZgvrCustBillSlNo, mimetype: item.ToAttach.Zzmimetype, fileName: item.ToAttach.Zzfilename, SrNo: item.Zzserialno });
                })

                this.getView().byId("id.totalAmount").setValue(this.sum(aCellData).toFixed(2));
                this.mdl_zFilter.updateBindings();
                this.ImgURLSetArray.forEach((element, index) => {
                    if (element.mimetype === "image/jpeg" || element.mimetype === "image/png") {
                        var oVBox = new VBox({
                            alignItems: "Center",
                            width: "auto",
                            items: [
                                new Text({
                                    text: "Sr.No:" + element.SrNo
                                }),
                                new Image({
                                    src: element.ImgUrl,
                                    height: "12rem",
                                    press: function () {
                                        oThis.openImageDialog(element.ImgUrl);
                                    },
                                })
                            ]
                        });
                        let oldItem = oImageVBox.getItems()[index];
                        oImageVBox.removeItem(oldItem);
                        oldItem.destroy();
                        oVBox.addStyleClass("customVBox");
                        oImageVBox.insertItem(oVBox, index);
                    } else {
                        let IconConfig
                        switch (element.mimetype) {
                            case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                                IconConfig = {
                                    src: "sap-icon://doc-attachment",
                                    color: 'rgba(17, 127, 253, 1)',
                                    size: "6rem"
                                };
                                break;
                            case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                                IconConfig = {
                                    src: "sap-icon://excel-attachment",
                                    color: sap.ui.core.IconColor.Positive,
                                    size: "6rem"
                                };
                                break;
                            case "application/pdf":
                                IconConfig = {
                                    src: "sap-icon://pdf-attachment",
                                    color: sap.ui.core.IconColor.NonInteractive,
                                    size: "6rem"
                                };
                                break;
                            case "message/rfc822":
                                IconConfig = {
                                    src: "sap-icon://email",
                                    color: sap.ui.core.IconColor.Neutral,
                                    size: "6rem"
                                };
                                break;
                            default:
                                IconConfig = {
                                    src: "sap-icon://email",
                                    color: sap.ui.core.IconColor.Default,
                                    size: "6rem"
                                };
                        }

                        oThis.nonImageFileToBase64(element.ImgUrl).then(base64String => {
                            var oVBox = new VBox({
                                alignItems: "Center",
                                width: "auto",
                                items: [
                                    new Text({
                                        text: "Sr.No:" + element.SrNo,
                                    }),
                                    new sap.ui.core.HTML({
                                        content: `<a href="${base64String}" download="${element.fileName}">${element.fileName}</a>`,
                                    }),
                                    new Icon(IconConfig)
                                ],
                            });
                            let oldItem = oImageVBox.getItems()[index];
                            oImageVBox.removeItem(oldItem);
                            oldItem.destroy();
                            oVBox.addStyleClass("customVBox");
                            oImageVBox.insertItem(oVBox, index);
                        });
                    }
                });
                this.ImgURLSetArray = [];
            },

            clearPage: function () {
                this.getView().byId("id.totalAmount").setValue("");
                this.getView().byId("id.image.VBox").removeAllItems();
            }
        });
    });