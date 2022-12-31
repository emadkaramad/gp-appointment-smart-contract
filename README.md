# Simple GP appointment smart contract

This project is a solidity smart contrct for booking GP appointments.

## Stack

- GNU Make
- Bun (Fast all-in-one JavaScript runtime)
- Hardhat (Build and test contracts)
- Nextjs (React framework)
- Chakra UI (React components)
- Web3.js (Client-side library to interact with the blockchain)
- Ethers.js (Client-side library to interact with the blockchain)
- Eth security toolbox (Tools to scan contracts for vulnerabilities)
- PM2 (Process manager for running web app and hardhat node in the background)

## Requirements

- GP admin defines doctors, availabilities, and appointment types and fees
- GP admin can cancel appointments
- Patient can view list of doctors and available slots
- Patient can book an appointment by paying a fee
- Patient can cancel their appointment
- If patient cancels the appointment 24 hours before the appointment, only 50% of the fee are refunded
- If GP cancels the appointment, the fee will be fully refunded plus 10% to compensate the gas fee patient has paid (110% of the fee is refunded)
- Only GP admin, the doctor, and the patient can view patient's details
- Doctor can refer the patient to the specialist
- When refereed to specialist, patient can book an appointment with them
- Doctors can add summary against the patient record

## Prerequisites

- [GNU Make](https://www.gnu.org/software/make/)
- [Bunjs](https://bun.sh) or [Nodejs](https://nodejs.org/en/download/)

## Run the app

The following make command install packages, run the hardhat node, deploy the contract, and run the web app using Bunjs runtime.
Bunjs is much faster in installing packages comparing to `npm` (2x faster) and `yarn` (3x faster).

```sh
$ make start
```

If you would like to use Nodejs, you can use either `npm` or `yarn` to install and run the app:

```sh
$ USE=npm make start
```
or

```sh
$ USE=yarn make start
```

Open `http://localhost:3000` in your browser to access the web application.
