namespace GV_tracker;

using {cuid} from '@sap/cds/common';

entity Customer : cuid {
    key email         : String(100);
        name          : String(100) not null;
        phone         : Integer not null;
        phoneCode     : Integer not null default 91;
        salutation    : Salutation(4) not null default #MR;
        plant         : Integer not null;
        type          : CustType(30) not null default #MALL;
        shoppingMalls : Association to many ShoppingMall
                            on shoppingMalls.customer = $self;
}

entity Employee : cuid {
    key code        : Integer;
        name        : String(100) not null;
        designation : String(100);
        plant       : Association to one ShoppingMall
                          on plant.employee = $self;
}

entity ShoppingMall {
    key plant      : Integer;
        plant_name : String(100) not null;
        customer   : Association to one Customer;
        employee   : Association to one Employee;
}

entity GiftVoucher : cuid {
    key coupon     : String(14);
        material   : Integer not null;
        plant      : Integer not null;
        storageLoc : String(4) not null default 'CSE1';
        quantity   : Integer not null default 1;
        batch      : Integer not null;
        descr      : String(100);
        price      : Decimal(15, 2) not null;
        brand      : String(100);
        expDate    : DateTime not null;
        type       : GiftType(100) not null;
        gVHeader   : Association to one GVHeader;
        gifted     : Boolean not null;
}

entity Bill : cuid {
    sr_no     : Integer not null;
    no        : String(100) not null;
    amount    : Decimal(15, 2) not null;
    doc_name  : String(100);
    mime_type : fileType(100) not null;
    base64    : LargeString;
    gVHeader  : Association to one GVHeader;
}

entity MallCampaign : cuid {
    key campaign : String(100);
}

entity GVHeader : cuid {
        @Core.Computed
    key gv_no            : Integer64;
        gr_type          : GVRType(100) not null;
        total_gift_amout : Decimal(15, 2) not null;
        campaign         : String(100) not null;
        comment          : String(200);
        plant            : Integer not null;
        customer         : Association to one Customer;
        employee         : Association to one Employee;
        giftVouchers     : Association to many GiftVoucher
                               on giftVouchers.gVHeader = $self;
        bills            : Composition of many Bill
                               on bills.gVHeader = $self;
}

type CustType   : String enum {
    MALL = 'Mall Customer';
    INT = 'Internal Employee';
    EXT = 'Contract Employee';
}

type GVRType    : String enum {
    CI;
    RP;
    RT;
}

type GiftType   : String enum {
    GF;
    GV;
}

type Salutation : String enum {
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
