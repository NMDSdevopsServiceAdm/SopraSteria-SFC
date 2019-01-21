import { Contracts } from "../constants/contracts.enum"
import { JobMain } from "./job-main.model"

export interface Worker {
  nameOrId: string
  contract: Contracts
  mainJob: JobMain
  approvedMentalHealthWorker?: string
  mainJobStartDate?: string
  dateOfBirth?: string
}
