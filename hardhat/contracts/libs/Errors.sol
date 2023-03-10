// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

error GP__OnlyAdmin__NotAnAdmin();
error GP__OnlyPatient__NotRegistered();
error GP__OnlyDoctor__InvalidBooking();
error GP__OnlyDoctor__NotTheDoctor();
error GP__Book__NotAvailable();
error GP__Book__InvalidBooking();
error GP__Book__InvalidFeePaid();
error GP__CancelBooking__InvalidBooking();
error GP__CancelBooking__NotAvailable();
error GP__CancelBooking__NotAllowed();
error GP__AddPatient__AlreadyRegistered();
error GP__WithdrawPatientBalance__ZeroBalance();
error GP__WithdrawPatientBalance__TransactionFailed();
error GP__GetPatient__NotAllowed();
error GP__GetBooking__InvalidBooking();
error GP__GetBooking__NotRegistered();
error GP__GetNote__NotAllowed();
