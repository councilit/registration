"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Region = exports.MemberType = exports.CommonObjectState = void 0;
var CommonObjectState;
(function (CommonObjectState) {
    CommonObjectState["DRAFT"] = "object_state_draft";
    CommonObjectState["ACTIVE"] = "object_state_active";
    CommonObjectState["IN_ACTIVE"] = "object_state_inactive";
    CommonObjectState["DELETED"] = "objecjt_state_deleted";
})(CommonObjectState || (exports.CommonObjectState = CommonObjectState = {}));
var MemberType;
(function (MemberType) {
    MemberType["CHURCH"] = "member_type_church";
    MemberType["MINISTRY"] = "member_type_ministry";
    MemberType["OTHER"] = "member_type_other";
})(MemberType || (exports.MemberType = MemberType = {}));
var Region;
(function (Region) {
    Region["ADDIS_ABEBA"] = "region_addis_abeba";
    Region["DIREDAWA"] = "region_diredawa";
    Region["OROMIA"] = "region_oromia";
    Region["AMHARA"] = "region_amhara";
    Region["TIGRAY"] = "region_tigray";
    // GURAGE = "region_gurage",
    Region["AFAR"] = "region_afar";
    Region["SOMALE"] = "region_somale";
    Region["SIDAMA"] = "region_sidama";
    Region["GAMBELLA"] = "region_gambella";
    Region["SOUTH"] = "region_south";
    Region["BENSHANGUL"] = "region_benshangul";
    Region["SOUTH_WEST"] = "region_south_west";
    Region["HARER"] = "region_harer";
    Region["CENTRAL"] = "region_central";
})(Region || (exports.Region = Region = {}));
