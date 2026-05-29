"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportPermission = exports.FilePermission = exports.CouncilFellowship = exports.RolePermission = exports.PermissionPermission = exports.StaffPermission = exports.MemberPermission = void 0;
var MemberPermission;
(function (MemberPermission) {
    MemberPermission["MEMBER_ADD"] = "add_member";
    MemberPermission["MEMBER_CHANGE"] = "change_member";
    MemberPermission["MEMBER_VIEW"] = "view_member";
    MemberPermission["MEMBER_DELETE"] = "delete_member";
    MemberPermission["MEMBER_DEACTIVATE"] = "deactivate_member";
})(MemberPermission || (exports.MemberPermission = MemberPermission = {}));
var StaffPermission;
(function (StaffPermission) {
    StaffPermission["STAFF_ADD"] = "add_staff";
    StaffPermission["STAFF_CHANGE"] = "change_staff";
    StaffPermission["STAFF_VIEW"] = "view_staff";
    StaffPermission["STAFF_DELETE"] = "delete_staff";
})(StaffPermission || (exports.StaffPermission = StaffPermission = {}));
var PermissionPermission;
(function (PermissionPermission) {
    PermissionPermission["PERMISSION_ADD"] = "add_permission";
    PermissionPermission["PERMISSION_CHANGE"] = "change_permission";
    PermissionPermission["PERMISSION_VIEW"] = "view_permission";
    PermissionPermission["PERMISSION_DELETE"] = "delete_permission";
})(PermissionPermission || (exports.PermissionPermission = PermissionPermission = {}));
var RolePermission;
(function (RolePermission) {
    RolePermission["ROLE_ADD"] = "add_role";
    RolePermission["ROLE_CHANGE"] = "change_role";
    RolePermission["ROLE_VIEW"] = "view_role";
    RolePermission["ROLE_DELETE"] = "delete_role";
})(RolePermission || (exports.RolePermission = RolePermission = {}));
var CouncilFellowship;
(function (CouncilFellowship) {
    CouncilFellowship["COUNCIL_FELLOWSHIP_ADD"] = "add_fellowship";
    CouncilFellowship["COUNCIL_FELLOWSHIP_CHANGE"] = "change_fellowship";
    CouncilFellowship["COUNCIL_FELLOWSHIP_VIEW"] = "view_fellowship";
    CouncilFellowship["COUNCIL_FELLOWSHIP_DELETE"] = "delete_fellowship";
    CouncilFellowship["COUNCIL_FELLOWSHIP_DEACTIVATE"] = "deactivate_fellowship";
})(CouncilFellowship || (exports.CouncilFellowship = CouncilFellowship = {}));
var FilePermission;
(function (FilePermission) {
    FilePermission["FILE_ADD"] = "add_file";
    FilePermission["FILE_CHANGE"] = "change_file";
    FilePermission["FILE_VIEW"] = "view_file";
    FilePermission["FILE_DELETE"] = "delete_file";
})(FilePermission || (exports.FilePermission = FilePermission = {}));
var ReportPermission;
(function (ReportPermission) {
    ReportPermission["REPORT_ADD"] = "add_report";
    ReportPermission["REPORT_CHANGE"] = "change_report";
    ReportPermission["REPORT_VIEW"] = "view_report";
    ReportPermission["REPORT_DELETE"] = "delete_report";
})(ReportPermission || (exports.ReportPermission = ReportPermission = {}));
