import { Contracts } from "../constants/contracts.enum"


export interface Worker {
  nameOrId: string
  contract: Contracts
  mainJob: {
    jobId: number,
    title: string
  }
}
