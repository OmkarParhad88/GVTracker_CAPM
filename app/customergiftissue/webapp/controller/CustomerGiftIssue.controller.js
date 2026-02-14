sap.ui.define(
  [
    "customergiftissue/controller/Base",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/core/format/DateFormat",
    "customergiftissue/model/models",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/BusyIndicator",
    "sap/ui/model/Sorter",
  ],
  (
    Base,
    JSONModel,
    MessageBox,
    DateFormat,
    models,
    MessageToast,
    Filter,
    Sorter,
    BusyIndicator
  ) => {
    "use strict";
    var isVerified = false;
    return Base.extend("customergiftissue.controller.CustomerGiftIssue", {
      onInit() {
        this.mdl_i18n = null;
        var oRouter = this.getOwnerComponent().getRouter();
        oRouter
          .getRoute("CustomerGiftIssue")
          .attachPatternMatched(this._onRouteMatched, this);
      },

      _onRouteMatched: function (oEvent) {

        let CustBill = this.mdl_zFilter.getData().CustBill;
        const haveFile = CustBill.every(obj => obj.hasOwnProperty("File"));
        if (haveFile && CustBill.length != 0) {
          this.mdl_zFilter.getData().HasFile = true;
        } else {
          this.mdl_zFilter.getData().HasFile = false;
        }

        if (this.mdl_zFilter.getData().HasFile === true) {
          this.byId("id.AddCustomerBillInfo").setIcon("sap-icon://sys-enter-2");
        } else {
          this.mdl_zFilter.getData().isVerified = false;
          this.byId("id.AddCustomerBillInfo").setIcon("");
          this.byId("id.AddCustomerBillInfo").setText("Add Customer Bill Info");
        }

        if (!this.mdl_zFilter.getData().isVerified) {
          this.byId("id.AddCustomerBillInfo").setText("Add Customer Bill Info");
        }
      },

      _sorter: function () {
        var oTable = this.getView().byId("giftItemsTable");
        var oSorter = new sap.ui.model.Sorter("ExpDate", false);
        oTable.bindItems({
          path: "/GiftItemSet",
          template: oTable.getBindingInfo("items").template,
          sorter: oSorter,
        });
      },

      onBeforeRendering: function () {
        this.mdl_i18n = this.getOwnerComponent()
          .getModel("i18n")
          .getResourceBundle();
        this.mdl_zFilter = this.getOwnerComponent().getModel("zFilterModel");
        this.interval;
      },

      onAfterRendering: function () {
        this._sorter();
        this.empField();
      },

      onNavBack: function () {
        var oThis = this;
        MessageBox.show(
          "Are you sure to discard this Gift Issue creation activity?",
          {
            icon: sap.m.MessageBox.Icon.QUESTION,
            title: "Confirm",
            actions: ["Cancel", "Discard"],
            onClose: function (sAction) {
              if (sAction === "Cancel") {
              } else if (sAction === "Discard") {
                oThis.clearAllFields();
                sap.ui.core.UIComponent.getRouterFor(oThis).navTo("Home");
              }
            },
          }
        );
      },

      createGVRDocument: function () {
        MessageToast.show("GVR Document created successfully.");
        sap.ui.core.UIComponent.getRouterFor(this).navTo("Home");
      },

      onShoppingMallInput: function (oEvent) {
        var sShoppingMall = oEvent.getParameter("value");
        var oData = this.getView().getModel().getProperty("/data");
        var aMatchedItems = [];
        var bMatched = false;
        for (var i = 0; i < oData.length; i++) {
          if (oData[i].ShoppingMall === sShoppingMall) {
            aMatchedItems = oData[i].items;
            bMatched = true;
            break;
          }
        }

        if (bMatched) {
          var oItemsModel = new JSONModel();
          oItemsModel.setData({ items: aMatchedItems });
          this.getView().byId("giftItemsTable").setModel(oItemsModel);
          this.getView()
            .byId("giftItemsTable")
            .bindItems({
              path: "/items",
              template: this.getView()
                .byId("giftItemsTable")
                .getBindingInfo("items").template,
            });
          this.getView().byId("shoppingMallInput").setEditable(false);
        } else {
          sap.m.MessageToast.show("Shopping Mall not found.");
        }
      },
      onCustomerTypeChange: function (oEvent) {
        this.empField();
        this.mdl_zFilter.updateBindings();
      },

      empField: function () {
        var CustType = this.mdl_zFilter.getData().Create.GvrCustTyp;
        if (CustType === "MALL") {
          this.mdl_zFilter.getData().EmpField = false;
          this.mdl_zFilter.getData().Create.GvrEmplyIdNam = "";
        }

        if (CustType !== "MALL") {
          if (isVerified) {
            this.mdl_zFilter.getData().EmpField = false;
          } else {
            this.mdl_zFilter.getData().EmpField = true;
          }
        }
      },

      formatter: {
        getDefaultQty: function () {
          return "1";
        },
        isEditableForExpiry: function (sExpiryDate) {
          return !sExpiryDate;
        },
        employeeEditable: function (sCustomerType) {
          if (!sCustomerType) {
            sCustomerType = "MALL";
          }
          if (
            sCustomerType === "MALL" ||
            (sCustomerType !== "MALL" && isVerified)
          ) {
            return false;
          }
          return true;
        },
      },

      onQtyLiveChange: function (oEvent) {
        var oInput = oEvent.getSource();
        var sValue = oInput.getValue();
        var iIssueQty = parseInt(sValue, 10);
        var oContext = oInput.getBindingContext();
        if (!oContext) {
          console.warn("No binding context for input field.");
          return;
        }
        var iStockQty = parseInt(oContext.getProperty("Quantity"), 10) || 0;
        if (!/^\d+$/.test(sValue)) {
          oInput.setValueState("Error");
          oInput.setValueStateText("Maintain a valid Quantity value");
          return;
        }
        if (isNaN(iIssueQty) || iIssueQty < 1) {
          oInput.setValueState("Error");
          oInput.setValueStateText("Issue quantity must be at least 1.");
        } else if (iIssueQty > iStockQty) {
          oInput.setValueState("Error");
          oInput.setValueStateText("Issue quantity exceeds available stock.");
        } else {
          oInput.setValueState("None");
        }
        var oTable = this.byId("giftItemsTable");
        var aSelectedItems = oTable.getSelectedItems();
        var bIsSelected = aSelectedItems.some(function (oSelectedItem) {
          return oSelectedItem.getBindingContext() === oContext;
        });
        if (bIsSelected) {
          this.onItemTableSelectionChange();
        }
      },

      onKeyPressAlphabetOnly: function (oEvent) {
        var sInputValue = oEvent.getParameter("value");
        var sValidatedValue = sInputValue.replace(/[^a-zA-Z\s]/g, "");
        oEvent.getSource().setValue(sValidatedValue);
        if (sInputValue !== sValidatedValue) {
          sap.m.MessageToast.show("Only Text are allowed.");
        }
      },

      stateChange: function () {
        clearInterval(this.interval);
        this.byId("SendOTPButton").setEnabled(true);
        this.byId("verifyOTPButton").setEnabled(false);
        this.byId("CustomerOTP").setValue("");
        this.byId("CustomerOTP").setPlaceholder("Send OTP again");
        this.byId("verifyOTPButton").setText("Verify OTP");
        this.byId("verifyOTPButton").setIcon("");
        this.byId("id.AddCustomerBillInfo").setText("Add Customer Bill Info");
        this.mdl_zFilter.getData().isVerified = false;
      },

      onItemTableSelectionChange: function (oEvent) {
        this.stateChange();
        isVerified = false;
        this.mdl_zFilter.updateBindings();
        var oTable = this.byId("giftItemsTable");
        var aSelectedItems = oTable.getSelectedItems();
        if (aSelectedItems.length === 0 && this.mdl_zFilter.getData().HasFile === true) {
          this.byId("id.AddCustomerBillInfo").setIcon("");
        }
        var iTotalValue = 0;
        aSelectedItems.forEach(function (oItem) {
          var oContext = oItem.getBindingContext();
          if (oContext) {
            var iValue = parseFloat(oContext.getProperty("MovAvgPrice")) || 0;
            var iStockQty = parseInt(oContext.getProperty("Quantity"), 10) || 0;
            var unitPrice = iStockQty > 0 ? iValue / iStockQty : 0;
            var oQtyInput = oItem.getCells()[4];
            var sQtyValue = oQtyInput && oQtyInput.getValue();
            var iIssueQty = parseInt(sQtyValue, 10);
            if (isNaN(iIssueQty) || iIssueQty < 1 || iIssueQty > iStockQty) {
              iIssueQty = Math.min(iStockQty, 1);
            }
            iTotalValue += unitPrice * iIssueQty;
          } else {
            console.warn("Item has no valid binding context:", oItem);
          }
        });
        var oTotalValueInput = this.byId("TotalGiftItemsValue");
        if (oTotalValueInput) {
          this.mdl_zFilter.setProperty(
            "/Create/GvrTotlGiftValu",
            iTotalValue.toFixed(2)
          );
        }
      },

      formatDate: function (sDate) {
        if (!sDate) {
          return "";
        }
        var oDate = new Date(sDate);
        return DateFormat.getDateTimeInstance({ pattern: "dd/MM/yyyy" }).format(
          oDate
        );
      },

      onLiveSearch: function (oEvent) {
        var sQuery = oEvent.getParameter("value").toUpperCase();
        var oFilter = new sap.ui.model.Filter(
          "Campaign",
          sap.ui.model.FilterOperator.Contains,
          sQuery
        );
        var oBinding = oEvent.getSource().getBinding("items");
        if (sQuery) {
          oBinding.filter([oFilter]);
        } else {
          oBinding.filter([]);
        }
      },

      onMobileSelected: function (oEvent) {
        var othis = this;
        var oSelectedItem = oEvent.getParameter("selectedItem");
        if (oSelectedItem) {
          var oContext = oSelectedItem.getBindingContext();
          if (oContext) {
            var oData = oContext.getObject();
            if (oData && oData.CustEmail) {
              othis.mdl_zFilter.getData().Email = oData.CustEmail;
            } else {
              MessageToast.show(
                "No email found for the selected mobile number."
              );
            }
          }
        }
      },

      onSendOTP: function () {
        var ValidateData = this.getView().getModel("zFilterModel");
        var aProperties = [
          { path: "/Create/GvrCustMoblNo", message: "Customer Mobile." },
          { path: "/Create/GvrCseUsrNam", message: "CSE User Name." },
          { path: "/Create/GvrCampaign", message: "Campaign." },
        ];
        var aErrors = [];
        aProperties.forEach(function (property) {
          var sValue = ValidateData.getProperty(property.path);
          if (!sValue || sValue.trim() === "") {
            aErrors.push(property.message);
          }
        });

        if (aErrors.length > 0) {
          sap.m.MessageBox.error(
            "Please fill below fields before submitting:\n\n" +
            aErrors.join("\n")
          );
          return;
        }

        var selectedKey = this.getView()
          .byId("customerTypeSelect")
          .getSelectedKey();
        if (selectedKey !== "MALL") {
          var employeeName = ValidateData.getProperty("/Create/GvrEmplyIdNam");
          if (!employeeName || employeeName.trim() === "") {
            if (selectedKey === "EXT") {
              sap.m.MessageBox.error("Enter the Contract Employee Name");
              return;
            }
            if (selectedKey === "INT") {
              sap.m.MessageBox.error("Enter the Internal Employee ID");
              return;
            }
          }
        }

        this.interval;
        if (this.interval) {
          clearInterval(this.interval);
        }
        var empUserid = this.byId("employeeIdInput");
        var mobileNumber = this.byId("customerMobileInput").getValue();
        var oSendOTPButton = this.byId("SendOTPButton");
        var oOTPInput = this.byId("CustomerOTP");
        var verifyButton = this.byId("verifyOTPButton");
        var ithis = this;
        var oModel = this.getView().getModel();
        var giftTable = this.byId("giftItemsTable");
        var aSelectedItem = giftTable.getSelectedItems();
        oOTPInput.setEditable(true);

        if (!/^\d{10}$/.test(mobileNumber)) {
          MessageToast.show("Please enter a valid 10-digit phone number.");
          return;
        }
        if (!this.mdl_zFilter.getData().HasFile) {
          MessageToast.show("Upload the bill");
          return;
        }
        if (empUserid.getValueState() === sap.ui.core.ValueState.Error) {
          MessageToast.show("Please enter the correct Employee ID");
          return;
        }

        if (aSelectedItem.length === 0) {
          MessageToast.show("Please select a Gift Item ");
          return;
        }

        this.generatedOTP = Math.floor(
          100000 + Math.random() * 900000
        ).toString();
        var payload = {
          customer_phone_number: mobileNumber,
          otp: this.generatedOTP,
        };

        oOTPInput.setEditable(true);
        verifyButton.setEnabled(true);
        oSendOTPButton.setEnabled(false);
        let countdown = 60;

        this.interval = setInterval(() => {
          countdown -= 1;
          oOTPInput.setPlaceholder(`${countdown} seconds`);
          if (countdown <= 0) {
            oOTPInput.setPlaceholder("Send OTP again");
            oSendOTPButton.setEnabled(true);
            ithis.generatedOTP = "";
            ithis.mdl_zFilter.getData().isVerified = false;
            ithis.mdl_zFilter.updateBindings();
            isVerified = false;
            clearInterval(ithis.interval);
          }
        }, 1000);

        var smsApiUrl = "https://dashboard.preoss.in/otp/sendpreossotp.php";
        fetch(smsApiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.status === 200) {
              MessageToast.show("OTP sent successfully to " + mobileNumber);
            } else {
              console.error("Error in API response:", data);
              MessageToast.show(
                data.message || "Failed to send OTP. Please try again."
              );
            }
          })
          .catch((error) => {
            console.error("Network or API error:", error);
            MessageToast.show(
              "Error sending OTP. Please check your connection."
            );
          });

        var sRecipientEmail = this.mdl_zFilter.getData().Email;
        if (sRecipientEmail !== "") {
          var oData = {
            RecEmail: sRecipientEmail,
            EmailContent: `Dear Customer, 
                ${this.generatedOTP} is your Prestige Experience Code from Prestige Group to confirm your mobile number. 
                It is confidential, and please do not share it with anyone.

                - PRESTIGE ESTATES PROJECTS LIMITED  

                Thank you.`,
            EmailSub: "OTP for Confirmation",
          };
          var mParam = {
            groupId: "batchGroup1",
            success: function (oData) {
              MessageToast.show("OTP email has been successfully sent.", {
                my: "left center",
                collision: "none",
                offset: "6 -50",
              });
            },
            error: function (oError) {
              MessageToast.show("Failed to send OTP email. Please try again.");
              console.error("Error Details:", oError);
            },
          };
          oModel.create("/SendEmailSet", oData, mParam);
        }

        //Whatsapp OTP

        var oDataWapp = {
          ContactNo: mobileNumber,
          OtpNo: this.generatedOTP,
          Plant: this.mdl_zFilter.getData().Plant,
        };
        var mParam = {
          groupId: "batchGroup2",

          success: function (oDataWapp) {
            MessageToast.show("Whatsapp OTP has been successfully sent.", {
              my: "right center",
              collision: "none",
              offset: "0 -50",
            });
          },
          error: function (oError) {
            MessageToast.show("Failed to send Whatsapp OTP. Please try again.");
            console.error("Error Details:", oError);
          },
        };

        oModel.create("/WhatsappOtpSet", oDataWapp, mParam);

        var aDeferredGroup = oModel.getDeferredGroups();
        aDeferredGroup.push("batchGroup1");
        aDeferredGroup.push("batchGroup2");
        oModel.setDeferredGroups(aDeferredGroup);
        oModel.submitChanges(aDeferredGroup);
      },

      onVerifyOTP: function () {
        var enteredOTP = this.byId("CustomerOTP").getValue();
        var CutomerOTPInput = this.byId("CustomerOTP");
        var AddCustomerBillInfo = this.byId("id.AddCustomerBillInfo");
        var verifyButton = this.byId("verifyOTPButton");
        var hasfile = this.mdl_zFilter.getData().HasFile;
        if (!hasfile) {
          MessageToast.show("Upload the bill");
          return;
        }

        if (enteredOTP === this.generatedOTP && enteredOTP !== "") {
          clearInterval(this.interval);
          this.mdl_zFilter.getData().isVerified = true;
          isVerified = true;
          AddCustomerBillInfo.setText("View Bill Info");
          AddCustomerBillInfo.setIcon("sap-icon://sys-enter-2");
          CutomerOTPInput.setEditable(false);
          verifyButton.setText("Verified");
          verifyButton.setEnabled(false);
          verifyButton.setIcon("sap-icon://sys-enter-2");
          MessageToast.show("OTP Verified successfully!");
          this.empField();
          this.mdl_zFilter.updateBindings();
        } else {
          this.mdl_zFilter.getData().isVerified = false;
          isVerified = false;
          CutomerOTPInput.setValue("");
          MessageToast.show("Invalid OTP. Please try again.");
          this.empField();
          this.mdl_zFilter.updateBindings();
        }
      },

      onAddCustomerProfilePress: function () {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("AddCustomerProfile");
      },

      onAddCustomerBillInfoPress: function () {
        var smobileNumber = this.byId("customerMobileInput").getValue();
        if (smobileNumber === "") {
          MessageBox.confirm("Select Mobile no.");
        } else {
          var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          oRouter.navTo("AddCustomerBillInfo", {
            Mobile: smobileNumber,
            isVerified: this.mdl_zFilter.getData().isVerified,
          });
        }
      },

      onGvrSuccessMsg: function (gvrRes) {
        var gvrNumbers = gvrRes[0].GvrNo;
        var sMsgType = gvrRes[0].MsgType;
        var sMessage = gvrRes[0].Message;

        var oVBox = new sap.m.VBox({
          alignItems: "Center",
          width: "100%",
          items: [
            new sap.m.HBox({
              alignItems: "Center",
              width: "100%",
              items: [
                new sap.m.Text({
                  text: "GVR No : ",
                }),
                new sap.m.Input({
                  value: gvrNumbers,
                  editable: false,
                }).addStyleClass("myTextClass"),
                new sap.ui.core.Icon({
                  src: "sap-icon://copy",
                  size: "1.3rem",
                  color: "#4d78e5",
                  tooltip: "Copy to Clipboard",
                  press: function () {
                    var tempInput = document.createElement("textarea");
                    tempInput.value = gvrNumbers;
                    document.body.appendChild(tempInput);
                    tempInput.select();
                    document.execCommand("copy");
                    document.body.removeChild(tempInput);
                    MessageToast.show(gvrNumbers + " copied to clipboard ");
                  },
                }).addStyleClass("boldText"),
              ],
            }),
            new sap.m.HBox({
              alignItems: "Center",
              width: "100%",
              items: [
                new sap.m.Text({
                  text: sMsgType + " : ",
                }),
                new sap.m.Text({
                  text: sMessage,
                }).addStyleClass("myTextClass"),
              ],
            }),
          ],
        }).addStyleClass("customDialogContent");

        var oDialog = new sap.m.Dialog({
          showHeader: true,
          customHeader: new sap.m.Bar({
            contentMiddle: [
              new sap.ui.core.Icon({
                src: "sap-icon://message-success",
                size: "1.5rem",
                color: "green",
              }),
              new sap.m.Title({ text: "GVR Response", level: "H1" }),
            ],
          }),
          content: [oVBox],
          beginButton: new sap.m.Button({
            text: "Close",
            press: function () {
              this.clearAllFields();
              this.mdl_zFilter.updateBindings();
              var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
              oDialog.close();
              oRouter.navTo("Home");
            }.bind(this),
          }),
        });
        oDialog.open();
      },

      onSubmitPress: function () {
        var othis = this;
        var aItems = this.getView().byId("giftItemsTable").getSelectedItems();

        if (this.mdl_zFilter.getData().isVerified === false) {
          MessageToast.show("Please Verify OTP");
          return;
        }

        this.getView().setBusy(true);

        var oModel = this.getView().getModel();
        var oData = this.mdl_zFilter.getData().Create;
        var oObj = {};

        oData.Werks = this.mdl_zFilter.getData().Plant;
        for (var i = 0; i < aItems.length; i++) {
          oObj = aItems[i].getBindingContext().getObject();
          var oInput = aItems[i].getCells()[4].getValue();
          oData.GVRItemSet.push({
            Material: oObj.Material,
            MatDescription: oObj.MatDes,
            Quantity: oInput,
            Value: ((oObj.MovAvgPrice / oObj.Quantity) * oInput).toFixed(2),
            Brand: oObj.Brand,
            Coupon: oObj.Coupon,
            Vfdat:
              DateFormat.getDateTimeInstance({ pattern: "YYYY-MM-dd" }).format(
                new Date(oObj.ExpDate)
              ) + "T00:00:00",
            Batch: oObj.Batch,
          });
        }

        var AddCustomerBillInfo = sap.ui.core.UIComponent.getRouterFor(
          this
        ).getView("customergiftissue.view.AddCustomerBillInfo");
        var AddCustBillInfoContro = AddCustomerBillInfo.getController();
        AddCustBillInfoContro._billUpload()
          .then((data) => {
            var mParam = {
              success: function (oData, response) {
                othis.getView().setBusy(false);
                othis.clearAllFields();
                // othis._sorter();
                var gvrRes = JSON.parse(response.body).d.GVRRes.results;
                var gvrNumbers = gvrRes[0].GvrNo;
                var MsgType = gvrRes[0].MsgType;
                if (gvrNumbers && gvrNumbers !== "" && MsgType !== "E") {
                  othis.onGvrSuccessMsg(gvrRes);
                } else {
                  const iconMap = {
                    E: MessageBox.Icon.ERROR,
                    W: MessageBox.Icon.WARNING,
                    S: MessageBox.Icon.SUCCESS,
                    I: MessageBox.Icon.INFORMATION,
                  };
                  var icon = iconMap[gvrRes[0].MsgType];
                  var messages = gvrRes
                    .map(function (result) {
                      return `${result.MsgType}: ${result.Message}`;
                    })
                    .join("\n");

                  MessageBox.show(messages, {
                    icon: icon,
                    title: "GVR Response",
                    actions: [MessageBox.Action.CLOSE],
                    onClose: function (oAction) {
                      if (oAction === MessageBox.Action.CLOSE) {
                        othis.clearAllFields();
                        othis.mdl_zFilter.updateBindings();
                        var oRouter =
                          sap.ui.core.UIComponent.getRouterFor(othis);
                        oRouter.navTo("Home");
                      }
                    },
                  });
                }
              },
              error: function (oError) {
                othis.getView().setBusy(false);
                othis.clearAllFields();
                MessageBox.error("Error: " + oError.message);
              },
            };
            if (othis._responseManager(data)) {
              oModel.create("/GVRHeaderSet", oData, mParam);
            }6
          })
          .catch((error) => {
            console.log(
              "===> CustomerGiftIssue.controller.js:498 ~ error",
              error
            );
            othis.getView().setBusy(false);
            MessageBox.show(error.message, {
              icon: MessageBox.Icon.ERROR,
              title: "File Response...",
              actions: [MessageBox.Action.CLOSE],
              onClose: function (oAction) {
                if (oAction === MessageBox.Action.CLOSE) {
                  othis
                    .byId("id.AddCustomerBillInfo")
                    .setText("Add Customer Bill Info");
                  othis.mdl_zFilter.getData().isVerified = false;
                  isVerified = false;
                  othis.clearAllFields();
                  othis.mdl_zFilter.updateBindings();
                }
              },
            });
          });
      },

      _responseManager: function (res) {
        BusyIndicator.hide();
        if (res.status === "success") {
          MessageToast.show(res.message, {
            duration: 4000,
          });
          return true;

        }
        // MessageToast.show(res.message, {
        //   duration: 4000,
        // });

        MessageBox.show(res.message, {
          icon: MessageBox.Icon.ERROR,
          title: "file uploading...",
          actions: [MessageBox.Action.CLOSE],
          onClose: function (oAction) {
          },
        });
        return false
      },

      clearAllFields: function () {
        var oData = this.mdl_zFilter.getData();
        oData.Create = models.getBlankRequestData();
        oData.Email = "";
        oData.isVerified = false;
        oData.EmpField = false;
        isVerified = false;

        if (oData.CustBill.length > 0) {
          var AddCustomerBillInfo = sap.ui.core.UIComponent.getRouterFor(
            this
          ).getView("customergiftissue.view.AddCustomerBillInfo");
          var AddCustBillInfoContro = AddCustomerBillInfo.getController();
          AddCustBillInfoContro.clearPageData();
        }
        this.byId("CustomerOTP").setValue("");
        this.byId("CustomerOTP").setPlaceholder("Enter OTP");
        this.byId("CustomerOTP").setEditable(true);
        this.byId("verifyOTPButton").setText("Verify OTP");
        this.byId("id.AddCustomerBillInfo").setText("Add Customer Bill Info");
        this.byId("id.AddCustomerBillInfo").setIcon("");
        this.byId("verifyOTPButton").setEnabled(false);
        this.byId("verifyOTPButton").setIcon("");
        this.onTableRefresh();
        this.mdl_zFilter.updateBindings();
      },

      onLiveChangeOTP: function () {
        var verifyButton = this.byId("verifyOTPButton");
        verifyButton.setEnabled(true);
      },

      onTableRefresh: function () {
        var oTable = this.getView().byId("giftItemsTable");
        var oBinding = oTable.getBinding("items");
        oTable.removeSelections(false);
        oBinding.refresh(true);
        this._sorter();
      },

      onMobileNumChange: function (oEvent) {
        var oInput = oEvent.getSource();
        this.stateChange();
        var oThis = this;
        var sMobileNumber = oInput.getValue();
        sMobileNumber = sMobileNumber.replace(/[^0-9]/g, "");
        oInput.setValue(sMobileNumber);
        var aSuggestions = oInput.getSuggestionItems();
        var bMatchFound = aSuggestions.some(function (oSuggestion) {
          return oSuggestion.getText().indexOf(sMobileNumber) !== -1;
        });
        if (!bMatchFound && sMobileNumber) {
          sap.m.MessageBox.show("Please add a customer profile", {
            icon: sap.m.MessageBox.Icon.WARNING,
            actions: ["Add Customer", "Cancel"],
            onClose: function (oAction) {
              if (oAction === "Add Customer") {
                oInput.setValue("");
                var oRouter = sap.ui.core.UIComponent.getRouterFor(oThis);
                oRouter.navTo("AddCustomerProfile");
              }
            }.bind(oThis),
          });
        }
        if (!sMobileNumber) {
          oThis.mdl_zFilter.getData().Create.GvrCustMoblNo = "";
          oThis.mdl_zFilter.updateBindings();
        }
      },

      onCheckUser: function (oEvent) {
        var selectedKey = this.getView()
          .byId("customerTypeSelect")
          .getSelectedKey();
        var othis = this;
        if (selectedKey === "INT") {
          var oInput = oEvent.getSource();
          var sValue = oInput.getValue().toUpperCase();
          var aModel = this.getView().getModel();
          sap.ui.core.BusyIndicator.show(0);
          aModel.read("/IntUserSet", {
            filters: [new sap.ui.model.Filter("UserId", "EQ", sValue)],
            success: function (oData) {
              sap.ui.core.BusyIndicator.hide();
              if (oData.results && oData.results.length > 0) {
                oInput.setValueState(sap.ui.core.ValueState.None);
                var oRecord = oData.results[0];
                var sFormattedValue = oRecord.UserId + "-" + oRecord.UserName;
                oInput.setValue(sFormattedValue);
              } else {
                oInput.setValueState(sap.ui.core.ValueState.Error);
                MessageBox.error("Please enter the correct Employee ID");
                oInput.setValueStateText("Invalid Employee ID");
              }
            },
            error: function () {
              sap.ui.core.BusyIndicator.hide();
              oInput.setValueState(sap.ui.core.ValueState.Error);
              MessageBox.error("Please enter the correct Employee ID");
              oInput.setValueStateText("Error validating Employee ID");
            },
          });
        }
      },

      onTableSearch: function (oEvent) {
        var oTable = this.byId("giftItemsTable");
        var oBinding = oTable.getBinding("items");
        var sSearchQuery = oEvent.getSource().getValue();
        if (sSearchQuery !== "") {
          oBinding.sCustomParams = "search=" + encodeURIComponent(sSearchQuery);
          oBinding.refresh(true);
        } else {
          oBinding.sCustomParams = "";
          oBinding.refresh(true);
        }
      },

      onCancel: function () {
        var oThis = this;
        this.mdl_zFilter.getData().isVerified = false;

        MessageBox.confirm(
          "Are you sure to discard this Gift Issue creation activity?",
          {
            actions: ["Cancel", "Discard"],
            onClose: function (oAction) {
              if (oAction === "Discard") {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(oThis);
                oThis._sorter();
                oThis.clearAllFields();
                oThis.mdl_zFilter.updateBindings();
                oRouter.navTo("Home");
              } else if (oAction === "Cancel") {
              }
            },
          }
        );
      },
    });
  }
);
