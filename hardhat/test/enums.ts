import { ethers } from "hardhat"

export class Sex {
  public static readonly Male = ethers.BigNumber.from("0")
  public static readonly Female = ethers.BigNumber.from("1")
}

export class BookingStatus {
  public static readonly Available = ethers.BigNumber.from("0")
  public static readonly Booked = ethers.BigNumber.from("1")
  public static readonly Visited = ethers.BigNumber.from("2")
  public static readonly NoShowUp = ethers.BigNumber.from("3")
}
