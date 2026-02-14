sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/Image",
    "sap/m/VBox",
    "sap/m/Text",
    "sap/m/ButtonType",
    "sap/ui/core/Icon"
  ],
  function (
    Controller,
    MessageToast,
    MessageBox,
    Image,
    VBox,
    Text,
    ButtonType,
    Icon
  ) {
    "use strict";

    return Controller.extend(
      "customergiftissue.controller.AddCustomerBillInfo",
      {
        onInit: function () {
          var oRouter = this.getOwnerComponent().getRouter();
          oRouter
            .getRoute("AddCustomerBillInfo")
            .attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
          this.Mobile = oEvent.getParameter("arguments").Mobile;
          this.isVerified = oEvent.getParameter("arguments").isVerified;
          this.getView().byId("sMobileno").setValue(this.Mobile);
          this.mdl_zFilter.updateBindings();

          if (this.isVerified === "true") {
            this.getView().byId("id.addBil").setEnabled(false);
            this.getView().byId("id.close").setVisible(false);
            var oTable = this.getView().byId("id.table.billinfo");
            oTable.setMode("None");
            var oSubmit = this.getView().byId("submit");
            oSubmit.setText("Back");
            var aItems = oTable.getItems();
            aItems.forEach(function (oItem) {
              var aCells = oItem.getCells();
              aCells.forEach(function (oCell, index) {
                if (oCell instanceof sap.m.Input) {
                  oCell.setEditable(false);
                  return;
                }
                if (oCell.setEnabled) {
                  oCell.setEnabled(false);
                  return;
                }
              });
            });
          } else {
            this.getView().byId("id.close").setVisible(true);
            var oSubmit = this.getView().byId("submit");
            oSubmit.setText("Submit");
            var oTable = this.getView().byId("id.table.billinfo");
            oTable.setMode("MultiSelect");
            var aItems = oTable.getItems();
            if (this.mdl_zFilter.getData().TotalBillValue !== 0) {
              aItems.forEach(function (oItem) {
                var aCells = oItem.getCells();
                aCells.forEach(function (oCell, index) {
                  if (oCell instanceof sap.m.Input) {
                    oCell.setEditable(true);
                    return;
                  }
                  if (oCell.setEnabled) {
                    oCell.setEnabled(true);
                    return;
                  }
                });
              });
            }
          }
        },

        onBeforeRendering: function () {
          this.sresponseMsg = "";
          this.TotalCalls = 0;
          this.bState = false;
          this.mdl_i18n = this.getOwnerComponent()
            .getModel("i18n")
            .getResourceBundle();
          this.mdl_zFilter = this.getOwnerComponent().getModel("zFilterModel");
        },

        onAfterRendering: function () {
          this.onAddNewBillPress();
          this.getView().byId("id.addBil").setEnabled(false);

          this.mdl_zFilter.updateBindings();
        },

        onAddNewBillPress: function () { 
          var iLength = this.mdl_zFilter.getData().CustBill.length;
          iLength++;
          this.mdl_zFilter.getData().CustBill.push({
            ZgvrCustBillSlNo: iLength,
            ZgvrCustBillNo: "",
            ZgvrCustBillAmt: "",
          });
          this.mdl_zFilter.getData().Create.GVRAttach.push({ RandomNo: "" });
          var oSubmit = this.getView().byId("submit");
          oSubmit.setEnabled(false);
          this.mdl_zFilter.updateBindings();
          this.getView().byId("id.addBil").setEnabled(false);
        },

        formatSRNo: function (array) {
          array.forEach((obj, index) => {
            var ZgvrCustBillSlNo = index + 1;
            obj.ZgvrCustBillSlNo = ZgvrCustBillSlNo;
          });
        },

        onSelectionChange: function (oEvent) {
          var oTable = oEvent.getSource();
          var aSelectedIndices = oTable.indexOfItem(oTable.getSelectedItem());
          var oItems = oTable.getSelectedItems();
          var oDeleteButton = this.getView().byId("deleteButton");
          if (oItems.length > 0) {
            oDeleteButton.setEnabled(true);
          } else {
            oDeleteButton.setEnabled(false);
          }
          this.aSelectedIndices = aSelectedIndices;
        },

        onFormatTitle: function (isVerified) {
          var oBundle = this.getView().getModel("i18n").getResourceBundle();
          return isVerified
            ? oBundle.getText("AddCustBillInfoTitleDisplay")
            : oBundle.getText("AddCustBillInfoTitleCreate");
        },
        onDeleteRow: function () {
          var oTable = this.getView().byId("id.table.billinfo");
          var aItems = oTable.getSelectedItems();
          oTable.removeSelections();
          var aCustBill = this.mdl_zFilter.getData().CustBill;
          var aGVRAttach = this.mdl_zFilter.getData().Create.GVRAttach;
          for (let index = aItems.length - 1; index >= 0; index--) {
            const oRow = aItems[index];
            var aSelectedIndice = oTable.indexOfItem(oRow);
            oTable.removeItem(oRow);
            var iItemSrNo = aSelectedIndice + 1;
            for (let i = aCustBill.length - 1; i >= 0; i--) {
              if (aCustBill[i].ZgvrCustBillSlNo === iItemSrNo) {
                aCustBill.splice(i, 1);
                aGVRAttach.splice(i, 1);
              }
            }
            this._deleteImage(aSelectedIndice);
            if (aGVRAttach.length === aCustBill.length) {
              this.getView().byId("submit").setEnabled(true);
              this.getView().byId("id.addBil").setEnabled(true); 
            }
          }

          var sum = this.sum(aCustBill);
          this.mdl_zFilter.getData().TotalBillValue = sum.toFixed(2);
          this._updateImageSrNo();
          this.formatSRNo(aCustBill);
          this.mdl_zFilter.updateBindings();
          this.getView().byId("deleteButton").setEnabled(false);
          MessageToast.show("Bill was Deleted");
        },

        currentDateTime: function () {
          var now = new Date();
          var year = now.getFullYear();
          var month = String(now.getMonth() + 1).padStart(2, "0");
          var day = String(now.getDate()).padStart(2, "0");
          var hours = String(now.getHours()).padStart(2, "0");
          var minutes = String(now.getMinutes()).padStart(2, "0");
          var seconds = String(now.getSeconds()).padStart(2, "0");
          var milliseconds = String(now.getMilliseconds()).padStart(3, "0");
          var timestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}:${milliseconds}`;
          return timestamp;
        },

        storeCurrentTimestamp: function (array) {
          let timestamp = new Date().toISOString();
          array.push({ RandomNo: timestamp.toString() });
          return timestamp.toString();
        },

        onChange: function () {
          var array = this.mdl_zFilter.getData().CustBill;
          var sum = this.sum(array);
          this.mdl_zFilter.getData().TotalBillValue = sum.toFixed(2);
          this.mdl_zFilter.updateBindings();
        },

        onLiveChange: function (oEvent) {
          var oInput = oEvent.getSource();
          var oRow = oInput.getParent();
          var aCells = oRow.getCells();
          var sValue1 = aCells[1].getValue().trim();
          var sValue2 = aCells[2].getValue().trim();
          var oCamera = aCells[3];
          var oFileUploader = aCells[4];
          var bEnableUploader = sValue1 !== "" && sValue2 !== "";
          if (bEnableUploader) {
            oFileUploader.setEnabled(true);
            oCamera.setEnabled(true);
          } else {
            oFileUploader.setEnabled(false);
            oCamera.setEnabled(false);
          }
        },

        sum: function (array) {
          let total = 0;
          for (let i = 0; i < array.length; i++) {
            total += Number(array[i].ZgvrCustBillAmt);
          }
          return total;
        },

        _updateImageSrNo: function () {
          var oImageHBox = this.getView().byId("id.imageContainer.HBox");
          var oImageHBoxItems = oImageHBox.getItems();
          oImageHBoxItems.forEach((oVBox, index) => {
            var oText = oVBox.getItems()[0];
            if (oText && oText.isA("sap.m.Text")) {
              oText.setText("Sr.No: " + (index + 1));
            }
          });
        },

        onOpenDialog: function (oEvent) {
          var oDialog = this.getView().byId("imageDialog");
          var buttons = oDialog.getContent()[1].getItems();

          buttons.forEach(function (oButton) {
            oButton.addStyleClass("customButtonClass");
          });
          oDialog.open();
          var oRow = oEvent.getSource().getParent();
          this.tableIndex = this._tableCurrentIndex(oRow);
        },

        onBackCam: function () {
          var othis = this;
          var videoElement = document.getElementById("videoFeed");
          navigator.mediaDevices
            .getUserMedia({
              video: {
                width: { min: 1280, ideal: 1920, max: 3840 },
                height: { min: 720, ideal: 1080, max: 2160 },
                frameRate: { min: 30, ideal: 60, max: 120 },
                facingMode: "environment",
              },
            })
            .then(function (stream) {
              videoElement.srcObject = stream;
            })
            .catch(function (err) {
              var oDialog = othis.getView().byId("imageDialog");
              if (videoElement && videoElement.srcObject) {
                videoElement.srcObject
                  .getTracks()
                  .forEach((track) => track.stop());
              }
              oDialog.close();
              console.error("Error accessing camera: ", err);
              othis.getView().setBusy(false);
              MessageToast.show("Error accessing camera: ", err);
            });
        },

        onFrontCam: function () {
          var othis = this;
          var videoElement = document.getElementById("videoFeed");

          navigator.mediaDevices
            .getUserMedia({
              video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: "user",
              },
            })
            .then(function (stream) {
              videoElement.srcObject = stream;
            })
            .catch(function (err) {
              var oDialog = othis.getView().byId("imageDialog");
              if (videoElement && videoElement.srcObject) {
                videoElement.srcObject
                  .getTracks()
                  .forEach((track) => track.stop());
              }
              oDialog.close();
              console.error("Error accessing camera: ", err);
              othis.getView().setBusy(false);
              MessageToast.show("Error accessing camera: ", err);
            });
        },

        onBeforeDialogOpen: function () {
          this.onBackCam();
        },

        onCapturePhoto: function () {
          this.getView().setBusy(true);
          var othis = this;

          var videoElement = document.getElementById("videoFeed");
          var canvas = document.createElement("canvas");
          canvas.width = videoElement.videoWidth || 1080;
          canvas.height = videoElement.videoHeight || 1920;
          var context = canvas.getContext("2d");

          context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
          var imageDataURL = canvas.toDataURL("image/jpeg", 1.0);

          var aCustBill = this.mdl_zFilter.getData().CustBill;
          var fileInputId = this.getView().byId("fileInputId");
          if (fileInputId) {
            fileInputId.value = "";
          }
          var oTable = this.getView().byId("id.table.billinfo");
          this._updateImage(imageDataURL, "image/jpeg", `Sr.No:${this.tableIndex}.jpeg`, this.tableIndex)
            .then(() => {
              var oUploadFile = oTable
                .getItems()
              [othis.tableIndex].getCells()[4];
              var oCamera = oTable.getItems()[othis.tableIndex].getCells()[3];
              oCamera.setType(ButtonType.Success);
              othis.mdl_zFilter.getData().HasFile = true;
              oUploadFile.setType(ButtonType.Default);
            })
            .catch((error) => {
              othis.getView().setBusy(false);
              MessageToast.show(error);
            });

          var imageBlob = this.dataURLToBlob(imageDataURL);
          var file = new File([imageBlob], `Sr.No:${this.tableIndex}.jpeg`, {
            type: "image/jpeg",
          });
          aCustBill[this.tableIndex].File = file;

          videoElement.srcObject.getTracks().forEach((track) => track.stop());
          var oDialog = this.getView().byId("imageDialog");
          oDialog.close();
        },

        _deleteImage: function (index) {
          var oImageVBox = this.getView().byId("id.imageContainer.HBox");
          var oImageVBoxItems = this.getView()
            .byId("id.imageContainer.HBox")
            .getItems();
          var oVBox = oImageVBoxItems[index];
          if (oVBox) {
            MessageToast.show("Bill Deleted!");
            oImageVBox.removeItem(oVBox);
          }
        },

        _updateImage: function (imageUrl, fileType, fileName, index) {
          this.getView().setBusy(true);
          var oThis = this;
          return new Promise((resolve, reject) => {
            var oImageHBox = oThis.getView().byId("id.imageContainer.HBox");
            var oImageHBoxItems = oImageHBox.getItems();
            var aCustBill = oThis.mdl_zFilter.getData().CustBill;
            var aGVRAttach = oThis.mdl_zFilter.getData().Create.GVRAttach;
            var sSrno = index + 1;
            var existingVBox = oImageHBoxItems[index];
            let isUpdated = false;

            let IconConfig
            switch (fileType) {
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

            if (existingVBox) {
              var oSrNoText = existingVBox.getItems()[0];
              var sText = oSrNoText.getText();
              var sTextSrno = parseInt(sText[sText.length - 1]);
              if (existingVBox && aCustBill[index].ZgvrCustBillSlNo === sTextSrno) {
                if (fileType === "image/jpeg" || fileType === "image/png") {

                  var image = new Image({
                    src: imageUrl,
                    height: "12rem",
                    press: function () {
                      oThis.openImageDialog(imageUrl);
                    },
                    load: function () {
                      oThis.getView().setBusy(false);
                      MessageToast.show("New Bill Added!");
                      isUpdated = true;
                      resolve(randomNO);
                    },
                    error: function () {
                      oThis.getView().setBusy(false);
                      console.error("Image failed to load.");
                      reject(new Error("Failed to load image"));
                    },
                  });

                  let oldItem = existingVBox.getItems()[1];
                  oldItem.destroy();
                  existingVBox.insertItem(image, 1);
                  existingVBox.removeItem(oldItem);
                } else {
                  oThis.getView().setBusy(false);
                  var vBox = new VBox({
                    alignItems: "Center",
                    width: "auto",
                    items: [
                      new sap.ui.core.HTML({
                        content: `<a href="${imageUrl}" download="${fileName}">${fileName}</a>`,
                      }),
                      new Icon(IconConfig)
                    ]
                  })

                  var oldItem = existingVBox.getItems()[1];
                  oldItem.destroy();
                  existingVBox.insertItem(vBox, 1);
                  existingVBox.removeItem(oldItem);

                  isUpdated = true;
                  MessageToast.show("Bill Updated!");
                  resolve(randomNO);
                }
                return;
              }
            }

            if (!isUpdated) {
              oThis.getView().byId("id.addBil").setEnabled(true);
              // var randomNO =Date.now().toString();
              // var randomNO = self.crypto.randomUUID();
              var randomNO = oThis.currentDateTime();
              aGVRAttach[index].RandomNo = randomNO;
              aCustBill[index].RandomNo = randomNO;
              oThis.mdl_zFilter.updateBindings();
              var oSubmit = oThis.getView().byId("submit");
              oSubmit.setEnabled(true);

              if (fileType === "image/jpeg" || fileType === "image/png") {
                var oVBox = new VBox({
                  alignItems: "Center",
                  width: "auto",
                  items: [
                    new Text({
                      text: "Sr.No:" + sSrno,
                    }),
                    new Image({
                      src: imageUrl,
                      height: "12rem",
                      press: function () {
                        oThis.openImageDialog(imageUrl);
                      },
                      load: function () {
                        oThis.getView().setBusy(false);
                        MessageToast.show("New Bill Added!");
                        resolve(randomNO);
                      },
                      error: function () {
                        oThis.getView().setBusy(false);
                        console.error("Image failed to load.");
                        reject(new Error("Failed to load image"));
                      },
                    }),
                  ],
                });
                oVBox.addStyleClass("customVBox");
                oImageHBox.insertItem(oVBox, index);
              } else {
                oThis.getView().setBusy(false);

                var oVBox = new VBox({
                  alignItems: "Center",
                  width: "auto",
                  items: [
                    new Text({
                      text: "Sr.No:" + sSrno,
                    }),
                    new VBox({
                      alignItems: "Center",
                      width: "auto",
                      items: [
                        new sap.ui.core.HTML({
                          content: `<a href="${imageUrl}" download="${fileName}">${fileName}</a>`,
                        }),
                        new Icon(IconConfig)]
                    })
                  ],
                });
                oVBox.addStyleClass("customVBox");
                oImageHBox.insertItem(oVBox, index);
                resolve(randomNO);
              }
            }
          });
        },

        openImageDialog: function (sImageUrl) {
          if (!this._oImageDialog) {
            this._oImageDialog = new sap.m.Dialog({
              content: new sap.m.Image({
                src: sImageUrl,
                height: "90vh",
              }),
              endButton: new sap.m.Button({
                text: "Close",
                press: function () {
                  this._oImageDialog.close();
                }.bind(this),
              }),
            });
          }
          this._oImageDialog.getContent()[0].setSrc(sImageUrl);
          this._oImageDialog.open();
        },

        dataURLToBlob: function (dataURL) {
          var byteString = atob(dataURL.split(",")[1]);
          var mimeString = dataURL.split(",")[0].split(":")[1].split(";")[0];
          var ab = new ArrayBuffer(byteString.length);
          var ia = new Uint8Array(ab);
          for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          return new Blob([ab], { type: mimeString });
        },

        onUploadPress: function (oEvent) {
          var othis = this;
          var oRow = oEvent.getSource().getParent();
          this.tableIndex = this._tableCurrentIndex(oRow);
          var Input = document.createElement("input");
          var oSubmit = this.getView().byId("submit");
          var aCustBill = this.mdl_zFilter.getData().CustBill;
          Input.id = "fileInputId";
          Input.type = "file";
          Input.accept = ".jpg,.png,.jpeg,.doc,.docx,.xls,.xlsx,.pdf,.eml,.msg";
          Input.style.display = "none";
          document.body.appendChild(Input);
          var oTable = this.getView().byId("id.table.billinfo");
          Input.addEventListener("change", (event) => {
            var file = event.target.files[0];
            const maxFileSize = 99 * 1024 * 1024; // 100MB in bytes

            if (file && file.size > maxFileSize) {
              Input.value = "";
              MessageBox.error(
                "File is too large! Please select a file smaller than 100MB."
              );
              return;
            }
            var reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function (e) {
              var type = file.type;
              var base64Image = e.target.result;
              othis
                ._updateImage(base64Image, file.type, file.name, othis.tableIndex)
                .then(() => {
                  var oUploadFile = oTable
                    .getItems()
                  [othis.tableIndex].getCells()[4];
                  var oCamera = oTable
                    .getItems()
                  [othis.tableIndex].getCells()[3];

                  oCamera.setType(ButtonType.Default);
                  oUploadFile.setType(ButtonType.Success);
                  othis.mdl_zFilter.getData().HasFile = true;
                })
                .catch((error) => {
                  othis.getView().setBusy(false);
                  MessageToast.show(error);
                });
              aCustBill[othis.tableIndex].File = new File(
                [othis.dataURLToBlob(base64Image)],
                file.name,
                { type: file.type }
              );
              Input.value = "";
              oSubmit.setEnabled(true);
            };
          });
          Input.click();
        },

        onCloseDialog: function () {
          var oDialog = this.getView().byId("imageDialog");
          oDialog.close();
          var videoElement = document.getElementById("videoFeed");
          videoElement.srcObject.getTracks().forEach((track) => track.stop());
        },

        _tableCurrentIndex: function (row) {
          var aTableItems = this.getView().byId("id.table.billinfo").getItems();
          var rowIndex = aTableItems.indexOf(row);
          return rowIndex;
        },

        uplaodMenualFile: function () {
          var aCustBill = this.mdl_zFilter.getData().CustBill;
          var oThis = this;
          aCustBill.forEach(function (obj, index) {
            if ("File" in obj) {
              oThis.TotalCalls++;
              var sSlug = `${oThis.Mobile}*${obj.ZgvrCustBillNo}*${obj.ZgvrCustBillAmt
                }*${obj.RandomNo}*Sr_No ${obj.ZgvrCustBillSlNo}.${obj.File.name
                  .split(".")
                  .pop()}*STANDARD*${obj.ZgvrCustBillSlNo}`;
              console.log(
                "===> AddCustomerBillInfo.controller.js:496 ~ sSlug",
                sSlug
              );
              var xhr = new XMLHttpRequest();
              xhr.open(
                "POST",
                "/sap/opu/odata/sap/ZMM_GV_PROCESS_SRV/CustBillFileSet",
                true
              );
              xhr.setRequestHeader("Content-Type", obj.File.type);
              xhr.setRequestHeader(
                "X-CSRF-Token",
                oThis.getOwnerComponent().getModel().getSecurityToken()
              );
              xhr.setRequestHeader("slug", sSlug);
              xhr.setRequestHeader("Cache-Control", "no-cache");
              xhr.onload = function () {
                console.log("File uploaded responce code:", xhr.status);
                oThis._responseManager(obj.File.name, xhr.status);
              };
              xhr.onerror = function () {
                console.error(
                  "Error during file upload:",
                  xhr.status,
                  xhr.responseText
                );
                oThis._responseManager(obj.File.name, xhr.status);
              };
              xhr.send(obj.File);
            }
          });
        },

        _billUpload: async function () {
          this.uplaodMenualFile();
          var ResponseMsg = await this.waitForResponseMsg();
          return ResponseMsg;
        },

        waitForResponseMsg: function () {
          var oThis = this;
          return new Promise((resolve, reject) => {
            const initialState = oThis.bState;
            // let count = 0;
            const checkResponseFile = () => {
              //   count++;
              //   if (count === 45) {
              //     oThis.bState = false;
              //     reject({
              //       status: "error",
              //       message:
              //         "Unable to upload bills at the moment.\n This might be due to low network latency or large file size. \n Please try again after some time.",
              //     });
              //   } else {
              if (oThis.bState !== initialState) {
                oThis.bState = false;
                resolve(oThis.sresponseMsg);
              } else {
                setTimeout(checkResponseFile, 1000);
              }
              //   }
            };
            checkResponseFile();
          });
        },

        onSubmitFiles: function () {
          var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          console.log("GVRAttach", this.mdl_zFilter.getData().Create.GVRAttach);
          oRouter.navTo("CustomerGiftIssue");
        },

        _responseManager: function (fileName, status) {
          var FileResponceArray = this.mdl_zFilter.getData().FileResponce;
          if (status === 201) {
            FileResponceArray.push({
              fileName: fileName,
              status: status,
              message: " 'file upload Succesfully'.",
            });
          } else if (status === 403) {
            FileResponceArray.push({
              fileName: fileName,
              status: status,
              message: " 'Unable to upload' ",
            });
          } else if (status === 504) {
            FileResponceArray.push({
              fileName: fileName,
              status: status,
              message: " 'Gatewaty TimeOut' ",
            });
          } else {
          }
          var FileResponceLength = FileResponceArray.length;
          if (this.TotalCalls === FileResponceLength) {
            this.TotalCalls = 0;
            if (FileResponceArray.some((obj) => obj.status === 201)) {
              this.sresponseMsg = {
                status: "success",
                message: "Files Upload successfully",
              };
              this.bState = true;
            } else {
              var content = this.getFileResponses(FileResponceArray);
              this.sresponseMsg = { status: "error", message: content };
              this.bState = true;
            }
          }
        },

        getFileResponses: function (array) {
          let responses = "Error files responses:\n";
          array.forEach((e) => {
            if (e.status !== 201) {
              responses += `~${e.fileName} this is ${e.message} \n`;
            }
          });
          responses += "\nPlease upload those the files again .";
          return responses;
        },

        // onUploadComplete: function (oEvent) {
        //   var fileName = oEvent.getParameter("fileName");
        //   var status = oEvent.getParameter("status");
        //   this._responseManager(fileName, status);
        //   oEvent.getSource().clear();
        // },

        oncancelPress: function () {
          var othis = this;
          sap.ui.core.UIComponent.getRouterFor(this)
            .getView("customergiftissue.view.CustomerGiftIssue")
            .getController()
            .stateChange();
          MessageBox.confirm("Do you want to discard file uploading", {
            actions: [MessageBox.Action.YES, MessageBox.Action.NO],
            onClose: function (oAction) {
              if (oAction === MessageBox.Action.YES) {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(othis);
                othis.clearPageData();
                MessageToast.show("Cancel Bill Info");
                oRouter.navTo("CustomerGiftIssue");
              }
            },
          });
        },

        clearPageData: function () {
          var oImageVBox = this.getView().byId("id.imageContainer.HBox");
          var oSubmit = this.getView().byId("submit");
          oSubmit.setText("Submit");
          this.mdl_zFilter.getData().CustBill = [];
          this.mdl_zFilter.getData().FileResponce = [];
          this.mdl_zFilter.getData().TotalBillValue = 0;
          this.mdl_zFilter.getData().HasFile = false;
          this.TotalCalls = 0;
          var oTable = this.getView().byId("id.table.billinfo");
          oTable.setMode("MultiSelect");
          this.mdl_zFilter.updateBindings();
          oImageVBox.removeAllItems();
          this.onAddNewBillPress();
        },
      }
    );
  }
);
