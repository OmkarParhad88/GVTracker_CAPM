namespace GV_tracker;

using {sap.common.CodeList} from '@sap/cds/common';

using {cuid} from '@sap/cds/common';

entity Customer : cuid {
    email        : String(100) not null;
    name         : String(100) not null;
    phone        : Integer64 not null;
    phoneCode    : Integer not null default 91;
    salutation   : Association to one Salutations default 'MR'
                   @mandatory;
    type         : Association to one CustTypes default 'Mall'
                   @mandatory;
    shoppingMall : Association to one ShoppingMall;
}

annotate Customer with @assert.unique: {email: [email], };

entity Employee : cuid {
    key code         : Integer;
        name         : String(100) not null;
        designation  : String(100);
        shoppingMall : Association to one ShoppingMall;
}

entity ShoppingMall {
    key plant      : Integer;
        plant_name : String(100) not null;
        customers  : Association to many Customer
                         on customers.shoppingMall = $self;
        employees  : Association to many Employee
                         on employees.shoppingMall = $self;
}

entity GiftVoucher : cuid {
    coupon             : String(14) not null;
    material           : Integer64 not null default 1000013157;
    storageLoc         : String(4) not null default 'CSE1';
    quantity           : Integer not null default 1;
    batch              : Integer64 default 80126001;
    descr              : String(100) default 'GV-UNLIMITED-1000';
    price              : Decimal(15, 2) not null default 1000.0;
    brand              : String(100) default 'UNLIMITED';
    expDate            : Date default $now;
    type               : Association to one GiftTypes default 'GV'
                         @mandatory;
    shoppingMall       : Association to one ShoppingMall default 8208;
    assignGiftVouchers : Association to many AssignGiftVoucher
                             on assignGiftVouchers.giftVoucher = $self;
}

annotate GiftVoucher with @assert.unique: {coupon: [coupon], };

entity AssignGiftVoucher : cuid {
    quantity     : Integer not null;
    total_amount : Decimal(15, 2) not null;
    gVHeader     : Association to one GVHeader;
    giftVoucher  : Association to one GiftVoucher;
}

entity Bill : cuid {
    no        : String(100) not null;
    sr_no     : Integer not null;
    amount    : Decimal(15, 2) not null;
    doc_name  : String(100) not null;
    base64    : LargeString not null;
    mime_type : Association to one fileTypes
                @mandatory;
    gVHeader  : Association to one GVHeader;
}

annotate Bill with @assert.unique: {no: [no], };

entity MallCampaign : cuid {
    key campaign : String(100);
}

entity GVHeader : cuid {
    key gv_no              : Integer64
                             @Core.Computed;
        total_gift_amout   : Decimal(15, 2) not null;
        comment            : String(200);
        shoppingMall       : Association to one ShoppingMall default 8208;
        gr_type            : Association to one GVRTypes default 'CI'
                             @mandatory;
        campaign           : Association to one MallCampaign
                                 on campaign.campaign = $self.campaign.campaign
                             @mandatory;
        customer           : Association to one Customer
                                 on customer.email = $self.customer.email
                             @mandatory;

        employee           : Association to one Employee
                                 on employee.code = $self.employee.code
                             @mandatory;
        bills              : Composition of many Bill
                                 on bills.gVHeader = $self
                             @mandatory;
        assignGiftVouchers : Composition of many AssignGiftVoucher
                                 on assignGiftVouchers.gVHeader = $self
                             @mandatory;
}

annotate GVHeader with @assert.unique: {gv_no: [gv_no], };

entity CustTypes : CodeList {
    key code : CustType;
}

entity GVRTypes : CodeList {
    key code : GVRType;
}

entity GiftTypes : CodeList {
    key code : GiftType;
}

entity Salutations : CodeList {
    key code : Salutation;
}

entity fileTypes : CodeList {
    key code : fileType;
}

type CustType   : String(20) enum {
    MALL = 'Mall Customer';
    INT = 'Internal Employee';
    EXT = 'Contract Employee';
}

type GVRType    : String(2) enum {
    CI;
    RP;
    RT;
}

type GiftType   : String(2) enum {
    GF;
    GV;
}

type Salutation : String(4) enum {
    MR = 'Mr';
    MRS = 'Mrs';
    MISS = 'Miss';
    MAST = 'Mast';
}

type fileType   : String enum {
    JPEG = 'image/jpeg';
    PNG = 'image/png';
    JPG = 'image/jpg';
    DOC = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    EXCEL = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    PDF = 'application/pdf';
    EMAIL = 'message/rfc822';
}
