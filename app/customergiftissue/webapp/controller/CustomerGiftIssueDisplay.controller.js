sap.ui.define([
    "customergiftissue/controller/Base",
    "sap/ui/core/format/DateFormat"

], (Base, DateFormat) => {
    "use strict";
    var sGvrNumber;

    return Base.extend("customergiftissue.controller.CustomerGiftIssueDisplay", {
        onInit() {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("CustomerGiftIssueDisplay").attachPatternMatched(this._onObjectMatched, this);
        },
        onBeforeRendering: function name(params) {
            this.getView().byId('GVRNumberList').getBinding('items').filter(new sap.ui.model.Filter('GvrTyp', 'EQ', 'CI'), "Application");
        },
        _onObjectMatched: function (oEvent) {
            sGvrNumber = oEvent.getParameter("arguments").gvrNumber;
            var sPath = `/GVRHeaderSet('${sGvrNumber}')`;

            var oThis = this;
            this.getView().bindElement({ 
                path: sPath,
                parameters: {
                    expand: "GVRItemSet"
                },
                events: {
                    dataReceived: function (oData) {

                    }.bind(this),
                    change: function () {
                        oThis.getView().byId("DetailsPage").setBusy(false)
                    }
                }
            });
            this._selectGVRNumberAfterListLoad(sGvrNumber);
        },

        _selectGVRNumberAfterListLoad: function (sGvrNumber) {
            var oList = this.byId("GVRNumberList");
            oList.getBinding("items").attachEventOnce("dataReceived", () => {
                var aItems = oList.getItems();
                oList.removeSelections(true);
                aItems.forEach(function (oItem) {
                    var sTitle = oItem.getTitle();
                    if (sTitle === sGvrNumber) {
                        oList.setSelectedItem(oItem, true);
                    }
                });
            });
        },

        onGVRNoPress: function (oEvent) {
            var oInput = this.getView().byId("GVRNumber");
            const oSelectItem = oEvent.getParameter("listItem").getBindingContext().getObject();
            if (oInput.getValue() !== oSelectItem.GvrNo) {
                this.getView().byId("DetailsPage").setBusy(true);
                this.getOwnerComponent().getRouter().navTo("CustomerGiftIssueDisplay", {
                    gvrNumber: oSelectItem.GvrNo
                });
            }
        },

        onSearchGVRList: function (oEvent) {
            var sQuery = oEvent.getParameter("newValue");
            var oList = this.getView().byId("GVRNumberList");
            var oBinding = oList.getBinding("items");
            var aFilters = [];
            if (sQuery) {
                aFilters.push(new sap.ui.model.Filter("GvrNo", sap.ui.model.FilterOperator.Contains, sQuery));
            }
            oBinding.filter(aFilters);
        },

        onViewCustomerBillInfoPress: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            var aGvrNumber = this.getView().byId("GVRNumber").getValue();
            var sGvrCustMoblNo = this.getView().byId("CustomerMobile").getValue();
            oRouter.navTo("ViewCustomerBillInfo", {
                gvrNumber: aGvrNumber,
                GvrCustMoblNo: sGvrCustMoblNo
            });
        },

        formatDate: function (sDate) {
            if (!sDate) {
                return "";
            }
            var oDate = new Date(sDate);
            return DateFormat.getDateTimeInstance({ pattern: "dd/MM/yyyy" }).format(oDate);
        },

        formatCustTyp: function (sCustTyp) {
            if (sCustTyp === "MALL") {
                return "Mall Customer";
            }
            if (sCustTyp === "EXT") {
                return "Contract Employee";
            }
            if (sCustTyp === "INT") {
                return "Internal Employee";
            }
            return sCustTyp;

        }
        ,
        onNavBack: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("Home");
        }
    });
});