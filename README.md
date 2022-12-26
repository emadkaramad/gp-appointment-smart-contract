# Private GP appointment system

This project is an appointment system for a private GP using smart contracts.

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

## Installation

First, you need to install [GNU Make](https://www.gnu.org/software/make/) and [bun JavaScript runtime](https://bun.sh).

Once `bun` is installed, run the following `make` command to install and run the application:

```sh
$ make start
```

Open `http://localhost:3000` in your browser to access the web application.
