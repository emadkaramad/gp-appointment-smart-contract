// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

error GP__OnlyAdmin__NotAnAdmin();
error GP__OnlyPatient__NotRegistered();
error GP__Book__NotAvailable();
error GP__Book__InvalidBooking();
error GP__Book__InvalidFeePaid();
error GP__CancelBooking__InvalidBooking();
error GP__CancelBooking__NotAvailable();
error GP__CancelBooking__NotAllowed();
error GP__AddPatient__AlreadyRegistered();
error GP__WithdrawPatientBalance__ZeroBalance();
error GP__WithdrawPatientBalance__RefundFailed();
