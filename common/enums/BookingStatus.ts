import { ethers } from "ethers"

export default class BookingStatus {
  public static readonly Available = ethers.BigNumber.from("0")
  public static readonly Booked = ethers.BigNumber.from("1")
  public static readonly Visited = ethers.BigNumber.from("2")
  public static readonly NoShowUp = ethers.BigNumber.from("3")
  public static readonly Cancelled = ethers.BigNumber.from("4")
}
